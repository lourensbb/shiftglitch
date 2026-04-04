const express = require('express');
const path = require('path');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getSessionMiddleware, setupAuthRoutes, requireAuth, getUser, getUserGamertag, updateGamertag, updateMembershipTier, checkAndExpireUser, getUserByPaymentRef, upsertLeaderboard, getLeaderboard, getMyLeaderboardEntry, createSquad, joinSquad, leaveSquad, getUserSquad, getSquadStats, updateSquadLastActive, saveWaitlistLead, trackPageView, getPageStats, getWaitlistCount, getUserBadges, setUserBadges, getEscapeRuns, createEscapeRun, updateEscapeRun, completeEscapeRun, deleteEscapeRun, applyRollbackIfStale } = require('./auth');

async function requirePro(req, res, next) {
  try {
    await checkAndExpireUser(req.session.userId);
    const user = await getUser(req.session.userId);
    if (!user || user.membership_tier !== 'pro') {
      return res.status(403).json({ error: 'PRO_REQUIRED', message: 'Upgrade to Netrunner Pro to access this feature.' });
    }
    next();
  } catch (err) {
    console.error('[requirePro] Error:', err.message);
    res.status(500).json({ error: 'Server error checking membership' });
  }
}

async function sendWelcomeEmail(gamertag, email) {
  const key = process.env.RESEND_SG_KEY || process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[email] No Resend key set (RESEND_SG_KEY or RESEND_API_KEY) — welcome email skipped for:', email);
    return;
  }
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You're In — ShiftGlitch</title>
    </head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border:1px solid #39FF14;background:#111;">
            <tr>
              <td style="padding:0;background:#000;border-bottom:3px solid #39FF14;">
                <div style="padding:30px 40px;">
                  <div style="font-family:'Courier New',monospace;font-size:13px;color:#39FF14;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">// SHIFTGLITCH SYSTEMS — MAINFRAME TRANSMISSION</div>
                  <div style="font-family:'Courier New',monospace;font-size:42px;color:#fff;letter-spacing:4px;font-weight:bold;line-height:1;">SHIFTGLITCH</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <div style="font-family:'Courier New',monospace;font-size:14px;color:#ff4444;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;">[ MAINFRAME ACCESS GRANTED ]</div>
                <div style="font-family:'Courier New',monospace;font-size:30px;color:#39FF14;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">OPERATIVE: ${gamertag.toUpperCase()}</div>
                <div style="font-family:'Courier New',monospace;font-size:14px;color:#888;letter-spacing:1px;margin-bottom:30px;">STATUS: NPC — Clearance Level 0 of 5</div>
                <p style="font-family:'Courier New',monospace;font-size:15px;color:#cccccc;line-height:1.9;margin:0 0 16px;">
                  You have been jacked into the Mainframe.
                </p>
                <p style="font-family:'Courier New',monospace;font-size:15px;color:#aaaaaa;line-height:1.9;margin:0 0 30px;">
                  The Mainframe is a digital world built on knowledge and power.<br>
                  Right now, it controls you. Your mission: master the cognitive exploits<br>
                  and earn your way to <span style="color:#FF00FF;">System Admin</span> status.
                </p>
                <div style="background:#1a1a1a;border:1px solid #39FF14;padding:24px;margin-bottom:28px;">
                  <div style="font-family:'Courier New',monospace;font-size:13px;color:#39FF14;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">// YOUR FIRST MISSION — DO THESE NOW</div>
                  <div style="font-family:'Courier New',monospace;font-size:14px;color:#aaaaaa;line-height:2.4;">
                    <span style="color:#39FF14;">&gt;</span> Go to ShiftGlitch and click <span style="color:#fff;">START HERE</span><br>
                    <span style="color:#39FF14;">&gt;</span> Set your <span style="color:#fff;">gamertag</span> in Settings<br>
                    <span style="color:#39FF14;">&gt;</span> Add your <span style="color:#fff;">mission deadlines</span> in Mission Control<br>
                    <span style="color:#39FF14;">&gt;</span> Read the <span style="color:#fff;">Q&amp;A in The Vault</span> — learn how to study<br>
                    <span style="color:#39FF14;">&gt;</span> Complete your first <span style="color:#fff;">25-minute Focus Session</span>
                  </div>
                </div>
                <div style="background:#0d0d1a;border:1px solid rgba(255,0,255,0.3);padding:24px;margin-bottom:28px;">
                  <div style="font-family:'Courier New',monospace;font-size:13px;color:#FF00FF;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">// YOUR RANK PROGRESSION — THE ESCAPE ROUTE</div>
                  <div style="font-family:'Courier New',monospace;font-size:13px;color:#aaaaaa;line-height:2.2;">
                    <span style="color:#666;">◈ NPC</span> → <span style="color:#3a7a3a;">◉ Script Kiddie</span> → <span style="color:#8A2BE2;">⬡ Glitch Tech</span> → <span style="color:#39FF14;">◬ Netrunner</span> → <span style="color:#FF00FF;">✦ System Admin</span>
                  </div>
                  <p style="font-family:'Courier New',monospace;font-size:13px;color:#777;line-height:1.9;margin:12px 0 0;">
                    Rank up by completing focus sessions, mastering flashcards,<br>
                    running BrainDumps, and finishing Diagnostic missions.<br>
                    Ranks are earned. They cannot be bought.
                  </p>
                </div>
                <div style="text-align:center;margin-bottom:28px;">
                  <a href="https://shiftglitch.replit.app/app" style="display:inline-block;background:#39FF14;color:#000;font-family:'Courier New',monospace;font-size:16px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;padding:16px 40px;text-decoration:none;">JACK IN NOW →</a>
                </div>
                <div style="font-family:'Courier New',monospace;font-size:13px;color:#555;letter-spacing:1px;line-height:1.8;border-top:1px solid #222;padding-top:20px;">
                  Free account. No spam. No data sold.<br>
                  Logged as: <span style="color:#777;">${email}</span><br>
                  Questions: <a href="mailto:admin@shiftglitch.com" style="color:#39FF14;">admin@shiftglitch.com</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 40px;border-top:1px solid #1a1a1a;">
                <div style="font-family:'Courier New',monospace;font-size:11px;color:#444;letter-spacing:1px;">
                  SHIFTGLITCH — THE STUDY OS FOR STUDENTS &copy; 2026 Lourens Breytenbach
                </div>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
  const fromAddress = process.env.RESEND_FROM_ADDRESS || 'ShiftGlitch <onboarding@resend.dev>';
  if (!process.env.RESEND_FROM_ADDRESS) {
    console.warn('[email] WARNING: RESEND_FROM_ADDRESS not set — using shared onboarding@resend.dev test address. Emails will only deliver to verified addresses in your Resend account. Set RESEND_FROM_ADDRESS to a verified domain to send to anyone.');
  }
  console.log(`[email] Sending welcome email to ${email} via sender: ${fromAddress}`);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject: '[ ACCESS GRANTED ] — Welcome to the ShiftGlitch Mainframe',
        html
      })
    });
    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[email] Resend API error (${res.status}):`, errBody);
    } else {
      const data = await res.json();
      console.log('[email] Welcome email sent successfully. Resend ID:', data.id);
    }
  } catch (err) {
    console.error('[email] Failed to send welcome email:', err.message);
  }
}

function getBaseUrl(req) {
  const host = (process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN || req.get('x-forwarded-host') || req.hostname).split(',')[0].trim();
  return `https://${host}`;
}

function pfEncode(val) {
  return encodeURIComponent(String(val)).replace(/%20/g, '+');
}

function payfastSignature(data, passphrase = '') {
  const sortedKeys = Object.keys(data).sort();
  const parts = sortedKeys
    .filter(k => data[k] !== '' && data[k] !== undefined && data[k] !== null)
    .map(k => k + '=' + pfEncode(data[k]));
  let str = parts.join('&');
  if (passphrase) {
    str += '&passphrase=' + pfEncode(passphrase);
  }
  return crypto.createHash('md5').update(str).digest('hex');
}

const PAYFAST_SANDBOX = process.env.PAYFAST_SANDBOX === 'true';
const PAYFAST_HOST = PAYFAST_SANDBOX ? 'sandbox.payfast.co.za' : 'www.payfast.co.za';

const PAYFAST_PACKS = {
  '1m':  { amount: '99.00',  days: 30,  label: 'Netrunner Pro 1 Month'  },
  '3m':  { amount: '249.00', days: 90,  label: 'Netrunner Pro 3 Months' },
  '12m': { amount: '799.00', days: 365, label: 'Netrunner Pro 12 Months' }
};

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

const waitlistLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests. Try again later.' } });
const checkoutLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests. Try again later.' } });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

app.post('/api/payfast-itn', express.urlencoded({ extended: false }), async (req, res) => {
  // Guide: send 200 immediately — PayFast will retry if it doesn't get one fast enough
  res.status(200).end();

  try {
    const data = req.body;
    console.log('[payfast-itn] Received:', JSON.stringify(data));

    // Step 1: Verify signature
    const { signature, ...pfData } = data;
    const calculated = payfastSignature(pfData, process.env.PAYFAST_PASSPHRASE || '');
    if (calculated !== signature) {
      console.warn('[payfast-itn] Signature mismatch — ignoring. Got:', signature, 'Calculated:', calculated);
      return;
    }

    // Step 2: Ping PayFast to confirm the payment actually happened
    const validationRes = await fetch(`https://${PAYFAST_HOST}/eng/query/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString()
    });
    const validation = await validationRes.text();
    if (validation !== 'VALID') {
      console.warn('[payfast-itn] PayFast validation returned:', validation);
      return;
    }

    if (data.payment_status !== 'COMPLETE') {
      console.log('[payfast-itn] Non-COMPLETE status, ignoring:', data.payment_status);
      return;
    }

    // Step 3: Identify the user — custom_str1 is the userId set at checkout
    const userId = (data.custom_str1 || '').trim() || (data.m_payment_id || '').split('_')[0];
    if (!userId) {
      console.warn('[payfast-itn] Could not identify user — no custom_str1 or m_payment_id');
      return;
    }

    // Step 4: Match the pack by amount
    const grossAmount = parseFloat(data.amount_gross || '0');
    const matchedPack = Object.values(PAYFAST_PACKS).find(p => Math.abs(parseFloat(p.amount) - grossAmount) < 1.0);
    if (!matchedPack) {
      console.warn(`[payfast-itn] Unrecognised amount R${grossAmount} — no matching pack`);
      return;
    }

    const itemName = data.item_name || '';
    if (!itemName.toLowerCase().includes('netrunner pro')) {
      console.warn(`[payfast-itn] Unexpected item_name: "${itemName}" — ignoring`);
      return;
    }

    // Step 5: Upgrade the user
    const expiresAt = new Date(Date.now() + matchedPack.days * 24 * 60 * 60 * 1000);
    await updateMembershipTier(userId, 'pro', `payfast_${data.pf_payment_id || data.m_payment_id || Date.now()}`, expiresAt);
    console.log(`[payfast-itn] User ${userId} upgraded to pro for ${matchedPack.days} days (R${grossAmount}) — expires ${expiresAt.toISOString().slice(0,10)}`);
  } catch (err) {
    console.error('[payfast-itn] Error:', err.message);
  }
});


app.use(express.json());

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

app.use(getSessionMiddleware());

setupAuthRoutes(app);

app.post('/api/gemini', requireAuth, requirePro, async (req, res) => {
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
  trackPageView('home').catch(() => {});
  res.sendFile(path.join(__dirname, 'landing.html'));
});

app.get('/waitlist', (req, res) => {
  trackPageView('waitlist').catch(() => {});
  res.sendFile(path.join(__dirname, 'waitlist.html'));
});

app.get('/pricing', (req, res) => {
  trackPageView('pricing').catch(() => {});
  res.sendFile(path.join(__dirname, 'pricing.html'));
});

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacy.html'));
});

app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'terms.html'));
});

app.post('/api/waitlist', waitlistLimiter, async (req, res) => {
  try {
    const { gamertag, email } = req.body;
    if (!gamertag || typeof gamertag !== 'string' || !gamertag.trim()) {
      return res.status(400).json({ error: 'Gamertag required' });
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    const cleanTag = gamertag.trim().slice(0, 30);
    const cleanEmail = email.trim().toLowerCase().slice(0, 254);
    await saveWaitlistLead(cleanTag, cleanEmail);
    sendWelcomeEmail(cleanTag, cleanEmail).catch(() => {});
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'DUPLICATE') return res.status(409).json({ error: 'DUPLICATE' });
    console.error('/api/waitlist error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const [pages, waitlist] = await Promise.all([getPageStats(), getWaitlistCount()]);
    res.json({ pages, waitlist });
  } catch (err) {
    res.status(500).json({ error: 'Stats unavailable' });
  }
});

app.post('/api/payfast-checkout', requireAuth, checkoutLimiter, async (req, res) => {
  const merchantId  = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  if (!merchantId || !merchantKey) {
    console.warn('[payfast] Credentials not set');
    return res.status(503).json({ error: 'PayFast not configured. Email admin@shiftglitch.com for help.' });
  }
  if (!process.env.PAYFAST_PASSPHRASE && !PAYFAST_SANDBOX) {
    console.error('[payfast] PAYFAST_PASSPHRASE required in production');
    return res.status(503).json({ error: 'Payment gateway misconfiguration. Contact admin@shiftglitch.com.' });
  }
  const { pack } = req.body;
  if (!pack || !PAYFAST_PACKS[pack]) {
    return res.status(400).json({ error: 'Pack must be "1m", "3m", or "12m".' });
  }
  const selected = PAYFAST_PACKS[pack];
  const userId = req.session.userId;
  const baseUrl = getBaseUrl(req);
  const passphrase = process.env.PAYFAST_PASSPHRASE || '';
  const mPaymentId = `${userId}_${Date.now()}`;
  const fields = {
    merchant_id:  merchantId,
    merchant_key: merchantKey,
    return_url:   `${baseUrl}/pricing?success=1&provider=payfast&pack=${pack}`,
    cancel_url:   `${baseUrl}/pricing?cancelled=1`,
    notify_url:   `${baseUrl}/api/payfast-itn`,
    m_payment_id: mPaymentId,
    amount:       selected.amount,
    item_name:    selected.label,
    custom_str1:  String(userId)
  };
  fields.signature = payfastSignature(fields, passphrase);
  const action = `https://${PAYFAST_HOST}/eng/process`;
  console.log(`[payfast] Checkout for user ${userId}, pack ${pack} (R${selected.amount})`);
  res.json({ action, fields });
});


if (process.env.NODE_ENV !== 'production' && !process.env.PAYFAST_MERCHANT_ID) {
  app.post('/api/dev/set-tier', requireAuth, async (req, res) => {
    const { tier } = req.body;
    if (!['free', 'pro'].includes(tier)) return res.status(400).json({ error: 'tier must be "free" or "pro"' });
    await updateMembershipTier(req.session.userId, tier, tier === 'pro' ? 'dev_test' : null);
    res.json({ ok: true, tier });
  });
}

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
  trackPageView('demo').catch(() => {});
  res.sendFile(path.join(__dirname, 'demo.html'));
});

app.get('/teacher', (req, res) => {
  trackPageView('teacher').catch(() => {});
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
    const ranked = rows.map((r, i) => {
      const isMe = r.user_id === userId;
      const entry = {
        rank: i + 1,
        gamertag: r.gamertag,
        focusScore: r.focus_score,
        rankTier: r.rank_tier,
        streak: r.streak,
        pomodoros: r.pomodoros,
        cardsMastered: r.cards_mastered,
        blurts: r.blurts,
        isMe
      };
      if (isMe) entry.userId = userId;
      return entry;
    });
    let myEntry = null;
    if (myRow) {
      myEntry = {
        rank: myRow.global_rank,
        userId,
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

app.get('/api/user/badges', requireAuth, async (req, res) => {
  try {
    const badges = await getUserBadges(req.session.userId);
    res.json({ badges });
  } catch (err) {
    console.error('/api/user/badges GET error:', err);
    res.json({ badges: [] });
  }
});

app.post('/api/user/badges', requireAuth, async (req, res) => {
  try {
    const { badges } = req.body;
    if (!Array.isArray(badges)) return res.status(400).json({ error: 'badges must be array' });
    const validIds = ['first-exploit','streak-3','streak-7','first-rank-up','recall-sprint','pattern-lock','domain-mapped','shards-50','survived-rollback','reached-glitch-tech','reached-netrunner','reached-system-admin'];
    const clean = badges.filter(b => validIds.includes(b));
    await setUserBadges(req.session.userId, clean);
    res.json({ ok: true });
  } catch (err) {
    console.error('/api/user/badges POST error:', err);
    res.status(500).json({ error: 'Failed to save badges' });
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

app.post('/api/squad/create', requireAuth, requirePro, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'Squad name required' });
    const result = await createSquad(req.session.userId, name);
    res.json({ ok: true, ...result });
  } catch (err) {
    if (err.message === 'ALREADY_IN_SQUAD') return res.status(409).json({ error: 'You are already in a squad. Leave first.' });
    console.error('/api/squad/create error:', err);
    res.status(500).json({ error: 'Failed to create squad' });
  }
});

app.post('/api/squad/join', requireAuth, requirePro, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode || typeof inviteCode !== 'string') return res.status(400).json({ error: 'Invite code required' });
    const sanitized = inviteCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(sanitized)) return res.status(400).json({ error: 'Invalid invite code format. Must be 6 alphanumeric characters.' });
    const squad = await joinSquad(req.session.userId, sanitized);
    res.json({ ok: true, squadId: squad.id, name: squad.name });
  } catch (err) {
    if (err.message === 'INVALID_CODE') return res.status(404).json({ error: 'Invalid invite code.' });
    if (err.message === 'SQUAD_FULL') return res.status(409).json({ error: 'Squad is full (max 4 members).' });
    if (err.message === 'ALREADY_IN_SQUAD') return res.status(409).json({ error: 'You are already in a squad. Leave first.' });
    if (err.message === 'ALREADY_MEMBER') return res.status(409).json({ error: 'Already a member of this squad.' });
    console.error('/api/squad/join error:', err);
    res.status(500).json({ error: 'Failed to join squad' });
  }
});

app.post('/api/squad/leave', requireAuth, async (req, res) => {
  try {
    await leaveSquad(req.session.userId);
    res.json({ ok: true });
  } catch (err) {
    if (err.message === 'NOT_IN_SQUAD') return res.status(404).json({ error: 'You are not in a squad.' });
    console.error('/api/squad/leave error:', err);
    res.status(500).json({ error: 'Failed to leave squad' });
  }
});

app.get('/api/squad', requireAuth, requirePro, async (req, res) => {
  try {
    const squad = await getUserSquad(req.session.userId);
    if (!squad) return res.json({ squad: null });
    const members = await getSquadStats(squad.id);
    const now = Date.now();
    const enriched = members.map(m => {
      const lastActive = m.last_active ? new Date(m.last_active).getTime() : 0;
      const hoursInactive = (now - lastActive) / 3600000;
      const isMe = m.id === req.session.userId;
      return {
        gamertag: m.gamertag || 'OPERATIVE',
        rankTier: m.rank_tier || 'NPC',
        streak: m.streak || 0,
        lastActive: m.last_active,
        hoursInactive: Math.floor(hoursInactive),
        isAfk: hoursInactive >= 24,
        isMe
      };
    });
    res.json({
      squad: {
        id: squad.id,
        name: squad.name,
        inviteCode: squad.invite_code,
        squadStreak: squad.shared_streak || 0,
        members: enriched
      }
    });
  } catch (err) {
    console.error('/api/squad error:', err);
    res.status(500).json({ error: 'Failed to load squad' });
  }
});

app.post('/api/squad/ping', requireAuth, requirePro, async (req, res) => {
  try {
    await updateSquadLastActive(req.session.userId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Ping failed' });
  }
});

app.get('/api/escape-runs', requireAuth, async (req, res) => {
  try {
    const runs = await getEscapeRuns(req.session.userId);
    res.json({ runs });
  } catch (err) {
    console.error('/api/escape-runs GET error:', err);
    res.status(500).json({ error: 'Failed to load escape runs' });
  }
});

app.post('/api/escape-runs', requireAuth, async (req, res) => {
  try {
    const { domainName } = req.body;
    if (!domainName || typeof domainName !== 'string' || !domainName.trim()) {
      return res.status(400).json({ error: 'Domain name required' });
    }
    const run = await createEscapeRun(req.session.userId, domainName);
    res.json({ run });
  } catch (err) {
    console.error('/api/escape-runs POST error:', err);
    res.status(500).json({ error: 'Failed to create escape run' });
  }
});

app.patch('/api/escape-runs/:id', requireAuth, async (req, res) => {
  try {
    const runId = parseInt(req.params.id, 10);
    if (!runId) return res.status(400).json({ error: 'Invalid run ID' });
    const run = await updateEscapeRun(req.session.userId, runId, req.body);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json({ run });
  } catch (err) {
    if (err.code === 'OUT_OF_SEQUENCE') {
      return res.status(400).json({ error: 'OUT_OF_SEQUENCE', message: err.message });
    }
    console.error('/api/escape-runs PATCH error:', err);
    res.status(500).json({ error: 'Failed to update escape run' });
  }
});

app.post('/api/escape-runs/:id/complete', requireAuth, async (req, res) => {
  try {
    const runId = parseInt(req.params.id, 10);
    if (!runId) return res.status(400).json({ error: 'Invalid run ID' });
    const run = await completeEscapeRun(req.session.userId, runId);
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json({ run });
  } catch (err) {
    if (err.code === 'NOT_ALL_EXPLOITS_COMPLETE') {
      return res.status(400).json({ error: 'All 6 exploits must be completed before claiming Domain Clearance.' });
    }
    console.error('/api/escape-runs/complete error:', err);
    res.status(500).json({ error: 'Failed to complete escape run' });
  }
});

app.post('/api/escape-runs/:id/check-rollback', requireAuth, async (req, res) => {
  try {
    const runId = parseInt(req.params.id, 10);
    if (!runId) return res.status(400).json({ error: 'Invalid run ID' });
    const result = await applyRollbackIfStale(req.session.userId, runId);
    if (!result) return res.json({ rollbackApplied: false });
    res.json({ rollbackApplied: true, run: result.run, corruptedExploit: result.corruptedExploit, corruptedIdx: result.corruptedIdx });
  } catch (err) {
    console.error('/api/escape-runs/check-rollback error:', err);
    res.status(500).json({ error: 'Failed to check rollback' });
  }
});

app.delete('/api/escape-runs/:id', requireAuth, async (req, res) => {
  try {
    const runId = parseInt(req.params.id, 10);
    if (!runId) return res.status(400).json({ error: 'Invalid run ID' });
    await deleteEscapeRun(req.session.userId, runId);
    res.json({ ok: true });
  } catch (err) {
    console.error('/api/escape-runs DELETE error:', err);
    res.status(500).json({ error: 'Failed to delete escape run' });
  }
});

app.use(express.static(path.join(__dirname)));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});
