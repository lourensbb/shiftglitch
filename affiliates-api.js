const express = require('express');
const router = express.Router();

const {
  requireAuth,
  getAffiliateByCode,
  getAffiliateByUserId,
  createAffiliate,
  getAffiliateStats,
  getAffiliateLeaderboard,
  getAllAffiliatesWithStats,
  approveAffiliate,
  suspendAffiliate,
  markCommissionsPaid,
  createSurgeEvent,
  getActiveSurge,
  getAffiliateMonthlyCommissions,
  getAffiliateRecruitCount,
} = require('./auth');

const {
  sendAffiliateApplicationEmail,
  sendAffiliateApprovalEmail,
  sendAffiliateSurgeBlastEmail,
  startAffiliateEmailDrip,
} = require('./affiliate-emails');

const SITE_URL = process.env.SITE_URL || 'https://shiftglitch.replit.app';

// Admin identity resolution — three-tier cascade (fail-closed):
// 1. ADMIN_USER_ID env var (highest priority — use this in production)
// 2. HARDCODED_OWNER_ID — Replit OIDC sub for the platform owner (lourensbb, id=54503873)
//    When the owner logs in via Replit auth their session userId === this value.
// 3. null → admin routes disabled, 503 returned
const HARDCODED_OWNER_ID = '54503873';  // lourensbb Replit user ID (OIDC sub claim)
const EFFECTIVE_ADMIN_ID = process.env.ADMIN_USER_ID || HARDCODED_OWNER_ID || null;

if (!EFFECTIVE_ADMIN_ID) {
  console.warn('[affiliate-api] WARNING: ADMIN_USER_ID env var not set and no hardcoded owner ID — admin routes are disabled');
} else if (!process.env.ADMIN_USER_ID) {
  console.warn('[affiliate-api] WARNING: ADMIN_USER_ID env var not set — using hardcoded owner ID fallback (' + HARDCODED_OWNER_ID + '). Set ADMIN_USER_ID in production.');
}

function requireAdmin(req, res, next) {
  if (!EFFECTIVE_ADMIN_ID) {
    return res.status(503).json({ error: 'Admin not configured — set ADMIN_USER_ID env var' });
  }
  if (!req.session || req.session.userId !== EFFECTIVE_ADMIN_ID) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// ─── Public / Affiliate-facing endpoints ─────────────────────────────────────

// POST /api/affiliate/register
// Requires login. Creates an affiliate row (status=pending) for the logged-in user.
router.post('/api/affiliate/register', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { displayName, payoutMethod, payoutDetails, recruiterCode } = req.body;

    if (!displayName || !String(displayName).trim()) {
      return res.status(400).json({ error: 'displayName is required' });
    }

    const existing = await getAffiliateByUserId(userId);
    if (existing) {
      return res.status(409).json({ error: 'Already registered', code: existing.code, status: existing.status });
    }

    const userEmail = (req.session.userProfile && req.session.userProfile.email) || null;
    if (!userEmail) {
      return res.status(400).json({ error: 'No email found on your account — cannot register as affiliate' });
    }

    let recruitedById = null;
    if (recruiterCode) {
      const recruiter = await getAffiliateByCode(String(recruiterCode).trim());
      if (recruiter && recruiter.status === 'active') {
        recruitedById = recruiter.id;
      }
    }

    const affiliate = await createAffiliate({
      userId,
      displayName: String(displayName).trim(),
      email: userEmail,
      payoutMethod: payoutMethod || 'paypal',
      payoutDetails: payoutDetails || {},
      recruitedById,
    });

    sendAffiliateApplicationEmail(affiliate.email, affiliate.display_name).catch(() => {});

    res.json({
      ok: true,
      code: affiliate.code,
      status: affiliate.status,
      message: 'Application received — we review manually within 48 hours.',
    });
  } catch (err) {
    console.error('[affiliate-api] register error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/affiliate/me
// Requires login. Returns the affiliate's record + stats.
router.get('/api/affiliate/me', requireAuth, async (req, res) => {
  try {
    const affiliate = await getAffiliateByUserId(req.session.userId);
    if (!affiliate) {
      return res.status(404).json({ error: 'Not registered as an affiliate' });
    }

    const [stats, recruitCount] = await Promise.all([
      getAffiliateStats(affiliate.id),
      getAffiliateRecruitCount(affiliate.id),
    ]);
    const salesCount = affiliate.sales_count;
    const nextTierAt = affiliate.tier === 'recruit' ? 5 : affiliate.tier === 'operative' ? 10 : null;

    res.json({
      code: affiliate.code,
      promoCode: affiliate.promo_code || null,
      status: affiliate.status,
      tier: affiliate.tier,
      displayName: affiliate.display_name,
      salesCount,
      clickCount: stats.clickCount,
      conversionRate: stats.clickCount > 0
        ? ((salesCount / stats.clickCount) * 100).toFixed(1) + '%'
        : 'N/A',
      nextTierAt,
      recruitCount,
      commissions: {
        pending: stats.pendingCommission,
        payable: stats.payableCommission,
        paid: stats.paidCommission,
      },
      referralUrl: `${SITE_URL}/?ref=${affiliate.code}`,
      recruitUrl: `${SITE_URL}/affiliates?recruiter=${affiliate.code}`,
    });
  } catch (err) {
    console.error('[affiliate-api] /me error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/affiliate/leaderboard
// Public — no auth required. Top 10 active affiliates by confirmed sales.
router.get('/api/affiliate/leaderboard', async (req, res) => {
  try {
    const rows = await getAffiliateLeaderboard();
    res.json(rows);
  } catch (err) {
    console.error('[affiliate-api] leaderboard error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/affiliate/surge
// Public. Returns the active surge event, or null if none.
router.get('/api/affiliate/surge', async (req, res) => {
  try {
    const surge = await getActiveSurge();
    res.json(surge || null);
  } catch (err) {
    console.error('[affiliate-api] surge GET error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/affiliate/recruit
// Requires login + active affiliate status.
// Returns the affiliate's special "recruit other affiliates" link.
router.post('/api/affiliate/recruit', requireAuth, async (req, res) => {
  try {
    const affiliate = await getAffiliateByUserId(req.session.userId);
    if (!affiliate) {
      return res.status(404).json({ error: 'Not registered as an affiliate' });
    }
    if (affiliate.status !== 'active') {
      return res.status(403).json({ error: 'Affiliate account is not active' });
    }
    res.json({ recruitUrl: `${SITE_URL}/affiliates?recruiter=${affiliate.code}` });
  } catch (err) {
    console.error('[affiliate-api] recruit error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/affiliate/monthly-commissions
// Requires login + active affiliate. Returns last 6 months of commission totals.
router.get('/api/affiliate/monthly-commissions', requireAuth, async (req, res) => {
  try {
    const affiliate = await getAffiliateByUserId(req.session.userId);
    if (!affiliate) {
      return res.status(404).json({ error: 'Not registered as an affiliate' });
    }
    if (affiliate.status !== 'active') {
      return res.status(403).json({ error: 'Affiliate account is not active' });
    }
    const months = await getAffiliateMonthlyCommissions(affiliate.id);
    res.json(months);
  } catch (err) {
    console.error('[affiliate-api] monthly-commissions error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Admin-only endpoints ─────────────────────────────────────────────────────

// GET /admin/affiliates
// Admin only. Returns all affiliates with commission totals and click counts.
router.get('/admin/affiliates', requireAdmin, async (req, res) => {
  try {
    const rows = await getAllAffiliatesWithStats();
    res.json(rows);
  } catch (err) {
    console.error('[affiliate-api] admin list error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /admin/affiliates/:id/approve
// Admin only. Sets status='active' and triggers approval email + drip (conditionally).
router.post('/admin/affiliates/:id/approve', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const affiliate = await approveAffiliate(id);
    if (!affiliate) return res.status(404).json({ error: 'Affiliate not found' });

    sendAffiliateApprovalEmail(
      affiliate.email,
      affiliate.display_name,
      affiliate.code,
      affiliate.promo_code || null
    ).catch(() => {});
    startAffiliateEmailDrip(affiliate.id).catch(() => {});

    res.json({ ok: true, affiliate });
  } catch (err) {
    console.error('[affiliate-api] approve error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /admin/affiliates/:id/suspend
// Admin only.
router.post('/admin/affiliates/:id/suspend', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const affiliate = await suspendAffiliate(id);
    if (!affiliate) return res.status(404).json({ error: 'Affiliate not found' });
    res.json({ ok: true, affiliate });
  } catch (err) {
    console.error('[affiliate-api] suspend error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /admin/affiliates/:id/mark-paid
// Admin only. Marks all payable commissions for an affiliate as paid.
router.post('/admin/affiliates/:id/mark-paid', requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid id' });
    const result = await markCommissionsPaid(id);
    res.json({ ok: true, paidCount: result.rowCount, totalPaid: result.totalPaid });
  } catch (err) {
    console.error('[affiliate-api] mark-paid error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /admin/affiliates/surge
// Admin only. Launches a surge event (double commission for a time window).
// NOTE: This route must be registered BEFORE /admin/affiliates/:id routes to avoid
// ":id" capturing the literal string "surge".
router.post('/admin/affiliates/surge', requireAdmin, async (req, res) => {
  try {
    const { bonusMultiplier = 2, durationHours = 48, message = '' } = req.body;
    if (!bonusMultiplier || !durationHours) {
      return res.status(400).json({ error: 'bonusMultiplier and durationHours are required' });
    }

    const surge = await createSurgeEvent({
      bonusMultiplier: parseFloat(bonusMultiplier),
      durationHours: parseInt(durationHours, 10),
      message: String(message),
      createdBy: req.session.userId,
    });

    // Surge blast email to all active affiliates — fire and forget
    sendAffiliateSurgeBlastEmail(surge).catch(() => {});

    res.json({ ok: true, surge });
  } catch (err) {
    console.error('[affiliate-api] surge launch error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Recruiter Card SVG endpoint ─────────────────────────────────────────────
// GET /affiliate-card/:code
// Returns a 600×300 SVG badge for the affiliate identified by :code.
// Cached for 5 minutes (stats can change).

router.get('/affiliate-card/:code', async (req, res) => {
  try {
    const code = String(req.params.code).toUpperCase().trim();
    const affiliate = await getAffiliateByCode(code);
    if (!affiliate || affiliate.status !== 'active') {
      return res.status(404).send('Not found');
    }

    const [affiliateStats, recruitCount] = await Promise.all([
      getAffiliateStats(affiliate.id),
      getAffiliateRecruitCount(affiliate.id),
    ]);

    const alias    = (affiliate.display_name || 'OPERATIVE').toUpperCase().slice(0, 22);
    const tier     = (affiliate.tier || 'recruit').toUpperCase();
    const sales    = affiliate.sales_count || 0;
    const clicks   = affiliateStats.clickCount || 0;
    const recruits = recruitCount || 0;
    const refUrl  = `${SITE_URL}/?ref=${code}`;

    const tierColors = { RECRUIT: '#888888', OPERATIVE: '#39FF14', GHOST: '#FF00FF' };
    const tierColor = tierColors[tier] || '#888888';
    const commRate  = tier === 'GHOST' ? '25%' : tier === 'OPERATIVE' ? '20%' : '15%';

    const nameFontSize = alias.length > 16 ? 28 : alias.length > 10 ? 34 : 42;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300">
  <rect width="600" height="300" fill="#0a0a0a"/>
  <rect x="1" y="1" width="598" height="298" fill="none" stroke="#FF00FF" stroke-width="1.5"/>
  <rect x="6" y="6" width="588" height="288" fill="none" stroke="rgba(255,0,255,0.18)" stroke-width="1"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="600" height="3" fill="url(#topGrad)"/>
  <defs>
    <linearGradient id="topGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#39FF14"/>
      <stop offset="100%" stop-color="#FF00FF"/>
    </linearGradient>
  </defs>

  <!-- Brand -->
  <text x="32" y="42" font-family="'Courier New', Courier, monospace" font-size="22" font-weight="bold" letter-spacing="4" fill="#39FF14">SHIFTGLITCH</text>
  <text x="32" y="60" font-family="'Courier New', Courier, monospace" font-size="10" letter-spacing="3" fill="rgba(57,255,20,0.4)">// OPERATIVE CARD</text>

  <!-- Divider -->
  <line x1="32" y1="72" x2="568" y2="72" stroke="rgba(57,255,20,0.18)" stroke-width="1"/>

  <!-- Alias -->
  <text x="32" y="${72 + 12 + nameFontSize}" font-family="'Courier New', Courier, monospace" font-size="${nameFontSize}" font-weight="bold" letter-spacing="2" fill="#ffffff">${escXml(alias)}</text>

  <!-- Tier badge -->
  <rect x="32" y="${72 + 12 + nameFontSize + 12}" width="${30 + tier.length * 8}" height="20" rx="1" fill="none" stroke="${tierColor}" stroke-width="1"/>
  <text x="${32 + 8}" y="${72 + 12 + nameFontSize + 26}" font-family="'Courier New', Courier, monospace" font-size="10" letter-spacing="2" fill="${tierColor}">${tier}</text>

  <!-- Commission rate -->
  <text x="${32 + 30 + tier.length * 8 + 12}" y="${72 + 12 + nameFontSize + 26}" font-family="'Courier New', Courier, monospace" font-size="10" letter-spacing="1" fill="rgba(255,255,255,0.3)">${commRate} COMMISSION</text>

  <!-- Stats row -->
  <text x="32" y="220" font-family="'Courier New', Courier, monospace" font-size="11" letter-spacing="2" fill="rgba(255,255,255,0.25)">${sales} SALES · ${clicks} CLICKS · ${recruits} RECRUITED</text>

  <!-- Divider -->
  <line x1="32" y1="232" x2="568" y2="232" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>

  <!-- Ref code + URL -->
  <text x="32" y="252" font-family="'Courier New', Courier, monospace" font-size="10" letter-spacing="2" fill="rgba(57,255,20,0.5)">CODE: ${escXml(code)}</text>
  <text x="32" y="272" font-family="'Courier New', Courier, monospace" font-size="10" letter-spacing="1" fill="rgba(57,255,20,0.7)">${escXml(refUrl)}</text>

  <!-- Footer right -->
  <text x="568" y="252" text-anchor="end" font-family="'Courier New', Courier, monospace" font-size="9" letter-spacing="1" fill="rgba(255,255,255,0.15)">shiftglitch.com</text>
</svg>`;

    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300',
    });
    res.send(svg);
  } catch (err) {
    console.error('[affiliate-api] card error:', err.message);
    res.status(500).send('Server error');
  }
});

function escXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

module.exports = router;
