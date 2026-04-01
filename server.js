const express = require('express');
const path = require('path');
const { getSessionMiddleware, setupAuthRoutes, requireAuth, getUserGamertag, updateGamertag, upsertLeaderboard, getLeaderboard, getMyLeaderboardEntry } = require('./auth');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

app.use(getSessionMiddleware());

setupAuthRoutes(app);

app.post('/api/gemini', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key not configured on the server.' });
  }
  const { model, contents, systemInstruction } = req.body;
  const allowedModels = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  if (!model || !allowedModels.includes(model)) {
    return res.status(400).json({ error: 'Invalid or unsupported model.' });
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, systemInstruction })
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gemini API error' });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to contact Gemini API.' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

app.get('/login', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/app');
  }
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/app', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo.html'));
});

app.get('/teacher', (req, res) => {
  res.sendFile(path.join(__dirname, 'teacher.html'));
});

const ALLOWED_RANK_TIERS = new Set(['NPC', 'Script Kiddie', 'Glitch Tech', 'Netrunner', 'System Admin']);

app.post('/api/leaderboard/sync', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { pomodoros, blurts, cardsMastered, streak, rankTier } = req.body;
    const pom = Math.max(0, parseInt(pomodoros, 10) || 0);
    const bl = Math.max(0, parseInt(blurts, 10) || 0);
    const cards = Math.max(0, parseInt(cardsMastered, 10) || 0);
    const str = Math.max(0, parseInt(streak, 10) || 0);
    const tier = ALLOWED_RANK_TIERS.has(rankTier) ? rankTier : 'NPC';
    const focusScore = (pom * 10) + (str * 25) + (cards * 2) + (bl * 15);
    const gamertag = await getUserGamertag(userId);
    await upsertLeaderboard({ userId, gamertag, focusScore, rankTier: tier, streak: str, pomodoros: pom, cardsMastered: cards, blurts: bl });
    res.json({ ok: true, focusScore });
  } catch (err) {
    console.error('/api/leaderboard/sync error:', err);
    res.status(500).json({ error: 'Sync failed' });
  }
});

app.get('/api/leaderboard', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [rows, myRow] = await Promise.all([
      getLeaderboard(50),
      getMyLeaderboardEntry(userId)
    ]);
    const ranked = rows.map((r, i) => ({
      rank: i + 1,
      userId: r.user_id,
      gamertag: r.gamertag,
      focusScore: r.focus_score,
      rankTier: r.rank_tier,
      streak: r.streak,
      pomodoros: r.pomodoros,
      cardsMastered: r.cards_mastered,
      blurts: r.blurts,
      isMe: r.user_id === userId
    }));
    let myEntry = null;
    if (myRow) {
      myEntry = {
        rank: myRow.global_rank,
        userId: myRow.user_id,
        gamertag: myRow.gamertag,
        focusScore: myRow.focus_score,
        rankTier: myRow.rank_tier,
        streak: myRow.streak,
        pomodoros: myRow.pomodoros,
        cardsMastered: myRow.cards_mastered,
        blurts: myRow.blurts,
        isMe: true
      };
    }
    const myEntryInTop = ranked.some(r => r.isMe);
    res.json({ leaderboard: ranked, myEntry, myEntryInTop });
  } catch (err) {
    console.error('/api/leaderboard error:', err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

app.post('/api/settings/gamertag', requireAuth, async (req, res) => {
  try {
    const { gamertag } = req.body;
    if (!gamertag || typeof gamertag !== 'string') return res.status(400).json({ error: 'Invalid gamertag' });
    const clean = gamertag.trim().slice(0, 20).replace(/[^a-zA-Z0-9_\-\.]/g, '');
    if (!clean) return res.status(400).json({ error: 'Gamertag must contain letters or numbers' });
    await updateGamertag(req.session.userId, clean);
    if (req.session.userProfile) req.session.userProfile.gamertag = clean;
    res.json({ ok: true, gamertag: clean });
  } catch (err) {
    console.error('/api/settings/gamertag error:', err);
    res.status(500).json({ error: 'Failed to update gamertag' });
  }
});

app.get('/api/settings/gamertag', requireAuth, async (req, res) => {
  try {
    const gamertag = await getUserGamertag(req.session.userId);
    res.json({ gamertag });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gamertag' });
  }
});

app.use(express.static(path.join(__dirname)));

app.get('/{*splat}', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});
