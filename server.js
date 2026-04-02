const express = require('express');
const path = require('path');
const { getSessionMiddleware, setupAuthRoutes, requireAuth, getUserGamertag, updateGamertag, updateMembershipTier, getUserByStripeCustomerId, upsertLeaderboard, getLeaderboard, getMyLeaderboardEntry, createSquad, joinSquad, leaveSquad, getUserSquad, getSquadStats, updateSquadLastActive, saveWaitlistLead, trackPageView, getPageStats, getWaitlistCount } = require('./auth');

async function sendWelcomeEmail(gamertag, email) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[email] RESEND_API_KEY is not set — welcome email skipped for:', email);
    return;
  }
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Access Requested — ShiftGlitch</title>
    </head>
    <body style="margin:0;padding:0;background:#050505;font-family:'Courier New',monospace;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:40px 20px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border:1px solid rgba(57,255,20,0.2);background:#080808;">
            <tr>
              <td style="padding:0;background:#000;border-bottom:2px solid #39FF14;">
                <div style="padding:30px 40px;">
                  <div style="font-family:'Courier New',monospace;font-size:10px;color:rgba(57,255,20,0.4);letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">// SHIFTGLITCH SYSTEMS — MAINFRAME NOTIFICATION</div>
                  <div style="font-family:'Courier New',monospace;font-size:40px;color:#fff;letter-spacing:4px;font-weight:bold;line-height:1;">SHIFTGLITCH</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px;">
                <div style="font-family:'Courier New',monospace;font-size:11px;color:#FF0000;letter-spacing:2px;text-transform:uppercase;margin-bottom:20px;">[ INCOMING TRANSMISSION — PRIORITY ALPHA ]</div>
                <div style="font-family:'Courier New',monospace;font-size:26px;color:#39FF14;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;text-shadow:0 0 20px rgba(57,255,20,0.4);">ACCESS REQUESTED.</div>
                <div style="font-family:'Courier New',monospace;font-size:12px;color:rgba(57,255,20,0.5);letter-spacing:1px;margin-bottom:30px;">OPERATIVE: ${gamertag.toUpperCase()}</div>
                <p style="font-family:'Courier New',monospace;font-size:13px;color:#666;line-height:1.8;margin:0 0 20px;">
                  Comm-link registered in the mainframe.<br>
                  Your request for system access has been logged.
                </p>
                <p style="font-family:'Courier New',monospace;font-size:13px;color:#555;line-height:1.8;margin:0 0 30px;">
                  We are running a controlled rollout — letting in new Netrunners in batches.
                  When your slot opens, you will receive a second transmission with your access credentials.
                </p>
                <div style="background:rgba(57,255,20,0.04);border:1px solid rgba(57,255,20,0.12);padding:20px;margin-bottom:30px;">
                  <div style="font-family:'Courier New',monospace;font-size:10px;color:rgba(57,255,20,0.4);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">// WHILE YOU WAIT</div>
                  <div style="font-family:'Courier New',monospace;font-size:12px;color:#555;line-height:2;">
                    &gt; Try the demo at shiftglitch.replit.app/demo<br>
                    &gt; View pricing at shiftglitch.replit.app/pricing<br>
                    &gt; Teachers: shiftglitch.replit.app/teacher
                  </div>
                </div>
                <div style="font-family:'Courier New',monospace;font-size:10px;color:#222;letter-spacing:1px;">
                  End-to-end encrypted. We do not sell your data.<br>
                  You were added as: ${email}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px;border-top:1px solid rgba(57,255,20,0.06);">
                <div style="font-family:'Courier New',monospace;font-size:9px;color:#1a1a1a;letter-spacing:1px;">
                  SHIFTGLITCH SYSTEMS — THE STUDY OS FOR STUDENTS<br>
                  shiftglitch.replit.app — &copy; 2026 Lourens Breytenbach
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
  console.log(`[email] Sending welcome email to ${email} via sender: ${fromAddress}`);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: fromAddress,
        to: [email],
        subject: '[ ACCESS REQUESTED ] — ShiftGlitch Mainframe',
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

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return require('stripe')(key);
}

const app = express();

app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    console.warn('[stripe] Webhook received but STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET not set — skipping');
    return res.json({ received: true });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], webhookSecret);
  } catch (err) {
    console.error('[stripe] Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata && session.metadata.userId;
      const customerId = session.customer;
      if (userId) {
        await updateMembershipTier(userId, 'pro', customerId);
        console.log(`[stripe] checkout.session.completed — user ${userId} upgraded to pro`);
      } else if (customerId) {
        const user = await getUserByStripeCustomerId(customerId);
        if (user) {
          await updateMembershipTier(user.id, 'pro', customerId);
          console.log(`[stripe] checkout.session.completed — customer ${customerId} upgraded to pro`);
        } else {
          console.warn('[stripe] No user found for customer:', customerId);
        }
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const customerId = sub.customer;
      if (customerId) {
        const user = await getUserByStripeCustomerId(customerId);
        if (user) {
          await updateMembershipTier(user.id, 'free', null);
          console.log(`[stripe] customer.subscription.deleted — user ${user.id} downgraded to free`);
        }
      }
    } else if (event.type === 'invoice.payment_failed') {
      console.log('[stripe] invoice.payment_failed — no action taken (subscription remains until Stripe cancels)');
    } else {
      console.log('[stripe] Unhandled event type:', event.type);
    }
  } catch (err) {
    console.error('[stripe] Error handling webhook event:', err.message);
    return res.status(500).json({ error: 'Webhook handler error' });
  }
  res.json({ received: true });
});

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

app.post('/api/waitlist', async (req, res) => {
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

app.post('/api/create-checkout-session', requireAuth, async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    console.warn('[stripe] STRIPE_SECRET_KEY not set — checkout unavailable');
    return res.status(503).json({ error: 'Payments not configured yet. Please contact support.' });
  }
  const { plan } = req.body;
  if (!plan || !['monthly', 'annual'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan. Must be "monthly" or "annual".' });
  }
  const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID;
  const annualPriceId = process.env.STRIPE_ANNUAL_PRICE_ID;
  const priceId = plan === 'annual' ? annualPriceId : monthlyPriceId;
  if (!priceId) {
    console.error(`[stripe] Price ID env var not set for plan: ${plan}`);
    return res.status(503).json({ error: 'Pricing not configured. Contact support.' });
  }
  const userId = req.session.userId;
  const host = (process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN || req.get('x-forwarded-host') || req.hostname).split(',')[0].trim();
  const baseUrl = `https://${host}`;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { userId },
      success_url: `${baseUrl}/pricing?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?cancelled=1`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: { metadata: { userId } }
    });
    console.log(`[stripe] Checkout session created for user ${userId}: ${session.id}`);
    res.json({ url: session.url });
  } catch (err) {
    console.error('[stripe] Failed to create checkout session:', err.message);
    res.status(500).json({ error: 'Failed to start checkout. Please try again.' });
  }
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

app.post('/api/squad/create', requireAuth, async (req, res) => {
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

app.post('/api/squad/join', requireAuth, async (req, res) => {
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

app.get('/api/squad', requireAuth, async (req, res) => {
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

app.post('/api/squad/ping', requireAuth, async (req, res) => {
  try {
    await updateSquadLastActive(req.session.userId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Ping failed' });
  }
});

app.use(express.static(path.join(__dirname)));

app.get('/{*splat}', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});
