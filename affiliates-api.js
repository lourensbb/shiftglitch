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
} = require('./auth');

const {
  sendAffiliateApplicationEmail,
  sendAffiliateApprovalEmail,
  sendAffiliateSurgeBlastEmail,
  startAffiliateEmailDrip,
} = require('./affiliate-emails');

const SITE_URL = process.env.SITE_URL || 'https://shiftglitch.replit.app';

// Primary: ADMIN_USER_ID env var. Secondary: hardcoded owner Replit userId (set below as fallback).
// Replace the empty string with your Replit user ID if you prefer not to use an env var.
const HARDCODED_OWNER_ID = '';
const EFFECTIVE_ADMIN_ID = process.env.ADMIN_USER_ID || HARDCODED_OWNER_ID || null;

if (!EFFECTIVE_ADMIN_ID) {
  console.warn('[affiliate-api] WARNING: ADMIN_USER_ID env var not set and no hardcoded owner ID — admin routes are disabled');
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

    const stats = await getAffiliateStats(affiliate.id);
    const salesCount = affiliate.sales_count;
    const nextTierAt = affiliate.tier === 'recruit' ? 5 : affiliate.tier === 'operative' ? 10 : null;

    res.json({
      code: affiliate.code,
      promoCode: affiliate.promo_code || null,
      status: affiliate.status,
      tier: affiliate.tier,
      salesCount,
      clickCount: stats.clickCount,
      conversionRate: stats.clickCount > 0
        ? ((salesCount / stats.clickCount) * 100).toFixed(1) + '%'
        : 'N/A',
      nextTierAt,
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

module.exports = router;
