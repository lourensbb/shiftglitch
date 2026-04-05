const express = require('express');
const path = require('path');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { getSessionMiddleware, setupAuthRoutes, requireAuth, getUser, getUserGamertag, updateGamertag, updateMembershipTier, checkAndExpireUser, getUserByPaymentRef, upsertLeaderboard, getLeaderboard, getMyLeaderboardEntry, createSquad, joinSquad, leaveSquad, getUserSquad, getSquadStats, updateSquadLastActive, saveWaitlistLead, trackPageView, getPageStats, getWaitlistCount, getUserBadges, setUserBadges, getEscapeRuns, createEscapeRun, updateEscapeRun, completeEscapeRun, deleteEscapeRun, applyRollbackIfStale, saveFunnelLead, queueFunnelEmails, getDueQueuedEmails, markEmailSent, getAffiliateByCode, recordAffiliateClick, queueAffiliateCommission, promotePayableCommissions, getAffiliateByPromoCode } = require('./auth');
const { generateEbook } = require('./ebook-generator');
const { sendAffiliateSaleNotificationEmail, processDueAffiliateEmails } = require('./affiliate-emails');

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
  const fromAddress = process.env.RESEND_FROM_ADDRESS || 'ShiftGlitch <admin@shiftglitch.com>';
  if (!process.env.RESEND_FROM_ADDRESS) {
    console.warn('[email] WARNING: RESEND_FROM_ADDRESS not set — using admin@shiftglitch.com — ensure shiftglitch.com domain is verified in Resend for reliable delivery.');
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
  '1m':      { amount: '99.00',  days: 30,  label: 'Netrunner Pro 1 Month'              },
  '3m':      { amount: '249.00', days: 90,  label: 'Netrunner Pro 3 Months'             },
  '12m':     { amount: '799.00', days: 365, label: 'Netrunner Pro 12 Months'            },
  // Referral-discounted variants (10% off) — used when buyer arrives via affiliate link or promo code
  '1m-ref':  { amount: '89.10',  days: 30,  label: 'Netrunner Pro 1-Month (Referral)'  },
  '3m-ref':  { amount: '224.10', days: 90,  label: 'Netrunner Pro 3-Month (Referral)'  },
  '12m-ref': { amount: '719.10', days: 365, label: 'Netrunner Pro 12-Month (Referral)' }
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
    try {
      const upgradedUser = await getUser(userId);
      if (upgradedUser && upgradedUser.email) {
        sendProUpgradeEmail(upgradedUser.email, upgradedUser.gamertag || upgradedUser.username || 'Operative', matchedPack.days).catch(() => {});
      }
    } catch (e) { console.warn('[payfast-itn] Could not send pro upgrade email:', e.message); }

    // Step 6: Queue affiliate commission if a referral code was attached
    try {
      const affiliateCode = (data.custom_str2 || '').trim();
      if (affiliateCode) {
        const orderId = data.pf_payment_id || data.m_payment_id || String(Date.now());
        const commission = await queueAffiliateCommission(affiliateCode, orderId, grossAmount);
        if (commission) {
          console.log(`[payfast-itn] Affiliate commission queued — code: ${affiliateCode}, amount: R${commission.commission}, payable: ${commission.payable_at}`);
          // Send instant sale notification to the affiliate — fire and forget
          sendAffiliateSaleNotificationEmail(commission.affiliate_email, {
            displayName: commission.affiliate_display_name,
            packLabel: matchedPack.label,
            commissionAmount: commission.commission,
            cumulativePaid: commission.cumulative_paid || 0,
            tier: commission.affiliate_tier,
            commissionRate: commission.commission_rate,
            salesCount: commission.sales_count,
          }).catch(e => console.warn('[payfast-itn] Sale notification email error:', e.message));
        }
      }
    } catch (e) { console.warn('[payfast-itn] Affiliate commission error:', e.message); }
  } catch (err) {
    console.error('[payfast-itn] Error:', err.message);
  }
});


app.use(express.json());

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

app.use(cookieParser());
app.use(getSessionMiddleware());

// Referral tracking middleware — reads ?ref=CODE, sets sg_ref cookie for 30 days
// Registered before setupAuthRoutes so it applies to every request from the start
app.use(async (req, res, next) => {
  const refCode = req.query.ref;
  if (refCode) {
    try {
      const affiliate = await getAffiliateByCode(refCode);
      if (affiliate && affiliate.status === 'active') {
        res.cookie('sg_ref', affiliate.code, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: 'lax'
        });
        recordAffiliateClick(affiliate.id).catch(() => {});
        console.log(`[affiliate] Referral click tracked — code: ${affiliate.code}`);
      }
    } catch (err) {
      console.warn('[affiliate] Referral middleware error:', err.message);
    }
  }
  next();
});

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

app.get('/more-info', (req, res) => {
  trackPageView('more-info').catch(() => {});
  res.sendFile(path.join(__dirname, 'more-info.html'));
});

app.get('/affiliates', (req, res) => {
  trackPageView('affiliates').catch(() => {});
  res.sendFile(path.join(__dirname, 'affiliates.html'));
});

app.get('/affiliate-portal', (req, res) => {
  trackPageView('affiliate-portal').catch(() => {});
  res.sendFile(path.join(__dirname, 'affiliate-portal.html'));
});

app.get('/download-ebook', (req, res) => {
  try {
    generateEbook(res);
  } catch (err) {
    console.error('[ebook] Generation error:', err.message);
    if (!res.headersSent) res.status(500).send('Ebook generation failed');
  }
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

const leadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 8, standardHeaders: true, legacyHeaders: false });

app.post('/api/lead', leadLimiter, async (req, res) => {
  try {
    const { name, email, institution } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'Name required' });
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return res.status(400).json({ error: 'Valid email required' });
    const cleanName = name.trim().slice(0, 100);
    const cleanEmail = email.trim().toLowerCase().slice(0, 254);
    const cleanInstitution = (institution || '').trim().slice(0, 200) || null;
    const lead = await saveFunnelLead(cleanName, cleanEmail, cleanInstitution);
    await queueFunnelEmails(lead.id, cleanEmail, cleanName);
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'DUPLICATE') return res.status(409).json({ ok: true, note: 'already subscribed' });
    console.error('/api/lead error:', err);
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
  const { pack: rawPack, promoCode: rawPromoCode } = req.body;
  const BASE_PACKS = ['1m', '3m', '12m'];
  if (!rawPack || !BASE_PACKS.includes(rawPack)) {
    return res.status(400).json({ error: 'Pack must be "1m", "3m", or "12m".' });
  }

  // Resolve affiliate tracking code — must be a verified active affiliate, not just any cookie value
  let affiliateCode = '';
  const cookieRef = (req.cookies.sg_ref || '').trim();

  if (rawPromoCode) {
    // Promo code entry takes priority: look up by promo code
    try {
      const promoAffiliate = await getAffiliateByPromoCode(String(rawPromoCode).trim());
      if (promoAffiliate && promoAffiliate.status === 'active') {
        affiliateCode = promoAffiliate.code;
      }
    } catch (e) {
      console.warn('[payfast] promo code lookup error:', e.message);
    }
  }

  if (!affiliateCode && cookieRef) {
    // Validate cookie-based referral code against DB before granting discount
    try {
      const cookieAffiliate = await getAffiliateByCode(cookieRef);
      if (cookieAffiliate && cookieAffiliate.status === 'active') {
        affiliateCode = cookieAffiliate.code;
      } else {
        console.log(`[payfast] sg_ref cookie value "${cookieRef}" not found or not active — ignoring`);
      }
    } catch (e) {
      console.warn('[payfast] cookie affiliate lookup error:', e.message);
    }
  }

  // Use discounted -ref pack variant only when a verified affiliate is present
  const hasReferral = Boolean(affiliateCode);
  const pack = (hasReferral && PAYFAST_PACKS[rawPack + '-ref']) ? rawPack + '-ref' : rawPack;
  const selected = PAYFAST_PACKS[pack];

  const userId = req.session.userId;
  const baseUrl = getBaseUrl(req);
  const passphrase = process.env.PAYFAST_PASSPHRASE || '';
  const mPaymentId = `${userId}_${Date.now()}`;
  const fields = {
    merchant_id:  merchantId,
    merchant_key: merchantKey,
    return_url:   `${baseUrl}/pricing?success=1&provider=payfast&pack=${rawPack}`,
    cancel_url:   `${baseUrl}/pricing?cancelled=1`,
    notify_url:   `${baseUrl}/api/payfast-itn`,
    m_payment_id: mPaymentId,
    amount:       selected.amount,
    item_name:    selected.label,
    custom_str1:  String(userId),
    custom_str2:  affiliateCode,
    custom_str3:  ''
  };
  fields.signature = payfastSignature(fields, passphrase);
  const action = `https://${PAYFAST_HOST}/eng/process`;
  console.log(`[payfast] Checkout for user ${userId}, pack ${pack} (R${selected.amount})${hasReferral ? ' [referral: ' + affiliateCode + ']' : ''}`);
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

app.use('/', require('./affiliates-api'));

app.use(express.static(path.join(__dirname)));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

function buildFunnelEmail(step, name) {
  const N = name || 'Operative';
  const fromLine = `<div style="font-family:'Courier New',monospace;font-size:11px;color:#444;letter-spacing:1px;">SHIFTGLITCH &mdash; shiftglitch.com &mdash; &copy; 2026 Lourens Breytenbach</div>`;
  const header = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border:1px solid #39FF14;background:#111;">`;
  const hdrBlock = (stepStr) => `<tr><td style="padding:0;background:#000;border-bottom:3px solid #39FF14;"><div style="padding:24px 36px;"><div style="font-family:'Courier New',monospace;font-size:11px;color:#39FF14;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">// SHIFTGLITCH &mdash; ${stepStr}</div><div style="font-family:'Courier New',monospace;font-size:36px;color:#fff;letter-spacing:4px;font-weight:bold;line-height:1;">SHIFTGLITCH</div></div></td></tr>`;
  const footer = `<tr><td style="padding:14px 36px;border-top:1px solid #1a1a1a;">${fromLine}</td></tr></table></td></tr></table></body></html>`;
  const cta = (label, url) => `<div style="text-align:center;margin:28px 0;"><a href="${url}" style="display:inline-block;background:#39FF14;color:#000;font-family:'Courier New',monospace;font-size:15px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;padding:14px 36px;text-decoration:none;">${label} &rarr;</a></div>`;
  const body = (inner) => `<tr><td style="padding:36px;">${inner}</td></tr>`;
  const p = (txt, color = '#aaaaaa', size = '14px') => `<p style="font-family:'Courier New',monospace;font-size:${size};color:${color};line-height:1.9;margin:0 0 16px;">${txt}</p>`;
  const h = (txt) => `<div style="font-family:'Courier New',monospace;font-size:22px;color:#39FF14;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">${txt}</div>`;
  const box = (inner, borderColor = '#39FF14') => `<div style="background:#1a1a1a;border:1px solid ${borderColor};padding:20px 24px;margin-bottom:22px;">${inner}</div>`;
  const li = (items) => items.map(i => `<div style="font-family:'Courier New',monospace;font-size:13px;color:#aaaaaa;line-height:2.2;"><span style="color:#39FF14;">&gt;</span> ${i}</div>`).join('');

  if (step === 1) {
    const subject = `// TRANSMISSION_001: Your Cognitive Exploit Manual is ready`;
    const html = header + hdrBlock('TRANSMISSION 001 OF 007') + body(
      h(`OPERATIVE: ${N.toUpperCase()} — ACCESS CONFIRMED`) +
      p(`You signed up for the ShiftGlitch intel feed. This is Transmission 001.`, '#cccccc', '15px') +
      p(`Your free Cognitive Exploit Manual is attached to this transmission. 10 protocols. 14 pages. The playbook that changes how you absorb knowledge — permanently.`) +
      box(`<div style="font-family:'Courier New',monospace;font-size:12px;color:#39FF14;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">// FREE INTEL PACKAGE — DOWNLOAD NOW</div>${li(['The Cognitive Exploit Manual (PDF)', '10 cognitive protocols', 'Memory Palace · Active Recall · Spaced Repetition', 'Feynman · Dual Coding · Interleaving + more'])}`) +
      cta('DOWNLOAD YOUR FREE EBOOK', 'https://shiftglitch.replit.app/download-ebook') +
      p(`Over the next 14 days you will receive 6 more transmissions — the full operative brief. The next one arrives tomorrow.`) +
      p(`<span style="color:#39FF14;">&gt;</span> Jack in for free at <a href="https://shiftglitch.replit.app" style="color:#39FF14;">shiftglitch.replit.app</a>`, '#666')
    ) + footer;
    return { subject, html };
  }

  if (step === 2) {
    const subject = `// TRANSMISSION_002: Deploy your first exploit — Memory Palace`;
    const html = header + hdrBlock('TRANSMISSION 002 OF 007') + body(
      h(`EXPLOIT 001: MEMORY PALACE`) +
      p(`Memory Palace is one of the oldest cognitive exploits in existence. It works by hijacking your brain's spatial navigation system — which evolved over millions of years to remember environments — and repurposing it for knowledge storage.`, '#cccccc', '14px') +
      box(`<div style="font-family:'Courier New',monospace;font-size:12px;color:#39FF14;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">// THE PROTOCOL</div>${li(['Select a familiar location (your home, a regular route)', 'Identify 10–15 fixed anchor points in sequence', 'At each point, place a vivid image representing the info', 'Walk the route mentally to retrieve the information', 'Repeat 3× immediately, then again 24 hours later'])}`) +
      p(`This exploit is in your free Cognitive Exploit Manual with full detail. Tomorrow: the rank system decoded.`) +
      cta('JACK IN FREE', 'https://shiftglitch.replit.app/login')
    ) + footer;
    return { subject, html };
  }

  if (step === 3) {
    const subject = `// TRANSMISSION_003: The rank system decoded`;
    const html = header + hdrBlock('TRANSMISSION 003 OF 007') + body(
      h(`FROM NPC TO SYSTEM ADMIN`) +
      p(`There are 5 ranks in ShiftGlitch. Each one is earned through demonstrated performance — not time logged, not money spent.`, '#cccccc', '14px') +
      box(`<div style="font-family:'Courier New',monospace;font-size:12px;color:#39FF14;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">// RANK PROGRESSION</div>${li(['<span style="color:#555;">NPC</span> — Starting status. Jacked in, not yet aware.', '<span style="color:#3a7a3a;">Script Kiddie</span> — First exploits deployed. Habits forming.', '<span style="color:#8A2BE2;">Glitch Tech</span> — Consistent operator. Multi-exploit user.', '<span style="color:#39FF14;">Netrunner</span> — High-performance, long-run consistency.', '<span style="color:#FF00FF;">System Admin</span> — Full mastery. The exploit is complete.'])}`) +
      p(`You advance by doing the work. Build your flashcard deck. Run Focus Sessions. Complete Mission Debriefs. The system tracks everything.`) +
      cta('START YOUR RANK CLIMB', 'https://shiftglitch.replit.app/login')
    ) + footer;
    return { subject, html };
  }

  if (step === 4) {
    const subject = `// TRANSMISSION_004: The #1 exploit that changes everything`;
    const html = header + hdrBlock('TRANSMISSION 004 OF 007') + body(
      h(`EXPLOIT 002: ACTIVE RECALL`) +
      p(`If you only adopt one exploit from the manual, make it this one. Active Recall is the highest-ROI cognitive protocol in existence. The research on this has been clear since 1909.`, '#cccccc', '14px') +
      p(`Re-reading feels productive. It produces almost zero long-term retention. Every time you try to retrieve information instead of passively recognise it, the memory trace strengthens. Every failed retrieval tells you exactly where to focus next.`) +
      box(`<div style="font-family:'Courier New',monospace;font-size:12px;color:#39FF14;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">// HOW SHIFTGLITCH AUTOMATES THIS</div>${li(['Flashcard system forces retrieval, not re-reading', 'Algorithm schedules each card at the exact right time', 'Your recall accuracy is tracked and used to adapt the schedule', 'Fail a card → it comes back sooner. Ace it → delayed review.'])}`) +
      p(`ShiftGlitch does not just tell you about Active Recall. It builds every feature on top of it.`) +
      cta('DEPLOY THE EXPLOIT', 'https://shiftglitch.replit.app/login')
    ) + footer;
    return { subject, html };
  }

  if (step === 5) {
    const subject = `// TRANSMISSION_005: Free vs Netrunner Pro — the full comparison`;
    const html = header + hdrBlock('TRANSMISSION 005 OF 007') + body(
      h(`THE FULL INTEL REPORT`) +
      p(`Free is genuinely free. Not a trial. Not a limited tier with a paywall after 7 days. The core system — flashcards, focus sessions, diagnostics, all 10 exploits — is free forever.`, '#cccccc', '14px') +
      box(`<div style="font-family:'Courier New',monospace;font-size:12px;color:#39FF14;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">// NETRUNNER PRO ADDS</div>${li(['AI Mission Architect — auto-generates study plans from your deadlines', 'Squad Mode — operate with up to 4 others, shared progress visibility', 'Extended session analytics and rank acceleration tools', 'Priority access to new exploits and features as they drop'])}`) +
      p(`Pro is a one-time ZAR payment. No subscription. R99 for 1 month, R249 for 3 months, R799 for a full year.`) +
      p(`If you are based in South Africa and you are serious about advancing your rank, Pro is worth it.`) +
      cta('VIEW PRO OPTIONS', 'https://shiftglitch.replit.app/pricing')
    ) + footer;
    return { subject, html };
  }

  if (step === 6) {
    const subject = `// TRANSMISSION_006: [48H WINDOW] — Operative upgrade offer`;
    const html = header + hdrBlock('TRANSMISSION 006 OF 007') + body(
      `<div style="font-family:'Courier New',monospace;font-size:12px;color:#FF00FF;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">// 48-HOUR TRANSMISSION WINDOW</div>` +
      h(`THE UPGRADE WINDOW`) +
      p(`${N} — this is your second-to-last transmission. If you have been reading the brief and you are considering going Pro, now is the right time.`, '#cccccc', '14px') +
      p(`The rank system does not move on its own. Every day you are not in active recall sessions, you are falling behind operatives who are. Pro removes the friction.`) +
      box(`<div style="font-family:'Courier New',monospace;font-size:12px;color:#39FF14;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">// PRO PACKS — ONE-TIME ZAR PAYMENT</div>${li(['R99 — 1 Month Netrunner Pro (30 days)', 'R249 — 3 Months Netrunner Pro (90 days) ← best value', 'R799 — 12 Months Netrunner Pro (365 days)'])}`) +
      p(`No subscription. No recurring charges. Pay once, use the full system.`) +
      cta('UPGRADE TO NETRUNNER PRO', 'https://shiftglitch.replit.app/pricing')
    ) + footer;
    return { subject, html };
  }

  if (step === 7) {
    const subject = `// TRANSMISSION_007: Final brief + your bonus intel`;
    const html = header + hdrBlock('TRANSMISSION 007 OF 007 — FINAL') + body(
      `<div style="font-family:'Courier New',monospace;font-size:12px;color:#FF00FF;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">// FINAL TRANSMISSION</div>` +
      h(`END OF SEQUENCE`) +
      p(`This is your 7th and final transmission in the ShiftGlitch intel feed. 14 days. 7 protocols covered. One objective: get you operating at a level that actually produces results.`, '#cccccc', '14px') +
      p(`Here is your bonus: the single most important thing you can do starting today.`) +
      box(`<div style="font-family:'Courier New',monospace;font-size:12px;color:#FF00FF;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">// BONUS INTEL — THE 1% RULE</div><p style="font-family:'Courier New',monospace;font-size:13px;color:#aaaaaa;line-height:1.9;margin:0;">Build a 20-card flashcard deck on the one topic you find hardest. Run it every day for 14 days using Active Recall. Do not re-read. Do not highlight. Just test, fail, check, repeat. In 14 days you will not recognise the level of mastery you have on that topic. This is not theory. It is the mechanism.</p>`) +
      p(`Thank you for reading every transmission. If ShiftGlitch has been useful, share it — the ebook is open-source and free to distribute.`) +
      p(`If you have questions: <a href="mailto:admin@shiftglitch.com" style="color:#39FF14;">admin@shiftglitch.com</a>`) +
      cta('JACK IN NOW — IT\'S FREE', 'https://shiftglitch.replit.app/login')
    ) + footer;
    return { subject, html };
  }

  return null;
}

async function sendFunnelEmail(email, name, step) {
  const key = process.env.RESEND_SG_KEY || process.env.RESEND_API_KEY;
  if (!key) { console.warn('[funnel-email] No Resend key — skipping step', step, 'for', email); return; }
  const built = buildFunnelEmail(step, name);
  if (!built) { console.warn('[funnel-email] No template for step', step); return; }
  const fromAddress = process.env.RESEND_FROM_ADDRESS || 'ShiftGlitch <admin@shiftglitch.com>';
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromAddress, to: [email], subject: built.subject, html: built.html })
    });
    if (!r.ok) { const e = await r.text(); console.error(`[funnel-email] Resend error step ${step}:`, e); }
    else { const d = await r.json(); console.log(`[funnel-email] Step ${step} sent to ${email} — ID:`, d.id); }
  } catch (err) { console.error('[funnel-email] Network error step', step, ':', err.message); }
}

async function processFunnelEmailQueue() {
  try {
    const due = await getDueQueuedEmails();
    if (!due.length) return;
    console.log(`[funnel-scheduler] Processing ${due.length} due emails`);
    for (const row of due) {
      await sendFunnelEmail(row.email, row.name, row.step);
      await markEmailSent(row.id);
    }
  } catch (err) {
    console.error('[funnel-scheduler] Error:', err.message);
  }
}

setInterval(processFunnelEmailQueue, 15 * 60 * 1000);
setTimeout(processFunnelEmailQueue, 10 * 1000);

// Affiliate onboarding drip scheduler — runs every 15 min alongside the funnel drip
setInterval(processDueAffiliateEmails, 15 * 60 * 1000);
setTimeout(processDueAffiliateEmails, 12 * 1000);

// Hourly scheduler — promote pending affiliate commissions to payable once 30-day hold period passes
setInterval(promotePayableCommissions, 60 * 60 * 1000);
setTimeout(promotePayableCommissions, 30 * 1000);

async function sendProUpgradeEmail(email, gamertag, daysAdded) {
  const key = process.env.RESEND_SG_KEY || process.env.RESEND_API_KEY;
  if (!key || !email) return;
  const fromAddress = process.env.RESEND_FROM_ADDRESS || 'ShiftGlitch <admin@shiftglitch.com>';
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',monospace;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border:1px solid #FF00FF;background:#111;"><tr><td style="padding:0;background:#000;border-bottom:3px solid #FF00FF;"><div style="padding:24px 36px;"><div style="font-family:'Courier New',monospace;font-size:11px;color:#FF00FF;letter-spacing:3px;text-transform:uppercase;margin-bottom:6px;">// SHIFTGLITCH — PRO UPGRADE CONFIRMED</div><div style="font-family:'Courier New',monospace;font-size:36px;color:#fff;letter-spacing:4px;font-weight:bold;line-height:1;">SHIFTGLITCH</div></div></td></tr><tr><td style="padding:36px;"><div style="font-family:'Courier New',monospace;font-size:22px;color:#FF00FF;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">NETRUNNER PRO — ACTIVATED</div><p style="font-family:'Courier New',monospace;font-size:14px;color:#cccccc;line-height:1.9;margin:0 0 16px;">Operative ${(gamertag||'').toUpperCase()} — your Pro access is now live. ${daysAdded} days of Netrunner Pro added to your account.</p><div style="background:#1a1a1a;border:1px solid rgba(255,0,255,0.3);padding:20px 24px;margin-bottom:22px;"><div style="font-family:'Courier New',monospace;font-size:12px;color:#FF00FF;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">// PRO ACCESS UNLOCKED</div><div style="font-family:'Courier New',monospace;font-size:13px;color:#aaaaaa;line-height:2.2;"><span style="color:#39FF14;">&gt;</span> AI Mission Architect — now active<br><span style="color:#39FF14;">&gt;</span> Squad Mode — now active<br><span style="color:#39FF14;">&gt;</span> Extended analytics — now active</div></div><div style="text-align:center;margin:28px 0;"><a href="https://shiftglitch.replit.app/app" style="display:inline-block;background:#FF00FF;color:#000;font-family:'Courier New',monospace;font-size:15px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;padding:14px 36px;text-decoration:none;">JACK IN NOW &rarr;</a></div><p style="font-family:'Courier New',monospace;font-size:13px;color:#555;line-height:1.8;border-top:1px solid #222;padding-top:20px;">Questions: <a href="mailto:admin@shiftglitch.com" style="color:#39FF14;">admin@shiftglitch.com</a></p></td></tr><tr><td style="padding:14px 36px;border-top:1px solid #1a1a1a;"><div style="font-family:'Courier New',monospace;font-size:11px;color:#444;letter-spacing:1px;">SHIFTGLITCH &mdash; shiftglitch.com &mdash; &copy; 2026 Lourens Breytenbach</div></td></tr></table></td></tr></table></body></html>`;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromAddress, to: [email], subject: '// PRO ACTIVATED — Netrunner Pro access confirmed', html })
    });
    if (!r.ok) { const e = await r.text(); console.error('[pro-email] Resend error:', e); }
    else { const d = await r.json(); console.log('[pro-email] Sent to', email, '— ID:', d.id); }
  } catch (err) { console.error('[pro-email] Error:', err.message); }
}

app.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});
