# TASK 02 — Affiliate API Routes Module
**Dependency:** Task 01 must be merged first.
**Touches:** New file `affiliates-api.js` (or equivalent router module) + one mount line in main server file.

---

## What & Why
Create all affiliate API endpoints as a self-contained router module. Mount it with a single line in the main server file. This keeps the main server untouched except for one require + mount, and gives every other agent a stable set of endpoints to build against.

## Done looks like
- A new router module `affiliates-api.js` exists with all endpoints below.
- The main server mounts it with one line before the 404 handler.
- All endpoints return JSON with appropriate HTTP status codes.
- Admin routes are protected by a `requireAdmin` middleware that checks session userId against `process.env.ADMIN_USER_ID`.
- If `ADMIN_USER_ID` env var is not set, a startup warning is logged.

## Out of scope
- Promo code resolution (Task 3)
- Two-sided discount (Task 3)
- Tier upgrade logic (Task 3)
- Email function implementations (Task 4 writes those — call them conditionally from this module)
- Any HTML pages

## Endpoint Specifications

### `POST /api/affiliate/register`
**Auth required:** Yes (logged-in user)
**Body:** `{ displayName: string, payoutMethod: 'paypal' | 'ozow', payoutDetails?: object }`
**Logic:**
1. Check if user already has an affiliate record — return 409 if yes.
2. Generate unique 8-character uppercase alphanumeric tracking code (retry up to 5× on collision).
3. Generate promo code (first 5 alphanumeric chars of displayName uppercased + 2-digit random number, unique, retry on collision).
4. Insert into `affiliates` table with `status = 'pending'`.
5. Send application confirmation email (call `sendAffiliateApplicationEmail` from Task 4's module — import conditionally, skip if module doesn't exist yet).
6. Return `{ ok: true, code, status: 'pending', message: 'Application received' }`.

### `GET /api/affiliate/me`
**Auth required:** Yes
**Logic:** Look up affiliate by user's session ID. Return 404 if not registered.
**Response:**
```json
{
  "code": "GHOST01AB",
  "promoCode": "GHOST01",
  "status": "active",
  "tier": "recruit",
  "salesCount": 3,
  "nextTierAt": 5,
  "clickCount": 47,
  "referralUrl": "{APP_URL}/?ref=GHOST01AB",
  "commissions": {
    "pending": 44.55,
    "payable": 0,
    "paid": 99.00
  }
}
```

### `GET /api/affiliate/leaderboard`
**Auth required:** No (public)
**Logic:** Top 10 active affiliates by `sales_count` descending.
**Response:** `[{ alias: string, tier: string, salesCount: number }]`
Never return emails, user IDs, or real names.

### `GET /api/affiliate/surge`
**Auth required:** No (public)
**Logic:** Return the most recent surge event where `ends_at > NOW()`, or `null` if none active.
**Response:** `{ bonusMultiplier: 2, endsAt: "ISO string", message: "..." }` or `null`

### `GET /api/affiliate/monthly-commissions`
**Auth required:** Yes (own affiliate only)
**Logic:** Return commission totals grouped by month for the last 6 months.
**Response:** `[{ month: "2026-01", total: 44.55 }, ...]`

### `POST /api/affiliate/recruit`
**Auth required:** Yes + active affiliate status
**Logic:** Return the affiliate's special recruiter link.
**Response:** `{ recruitUrl: "{APP_URL}/affiliates?recruiter=AFFCODE" }`

### `GET /admin/affiliates`
**Auth required:** Admin only
**Logic:** All affiliates with commission totals and click counts.
**Response:** Array of affiliate objects with all fields + commission sums.

### `POST /admin/affiliates/:id/approve`
**Auth required:** Admin only
**Logic:** Set `status = 'active'`. Call `sendAffiliateApprovalEmail` + `startAffiliateEmailDrip` from Task 4 module (conditionally). Return updated affiliate.

### `POST /admin/affiliates/:id/suspend`
**Auth required:** Admin only
**Logic:** Set `status = 'suspended'`. Return updated affiliate.

### `POST /admin/affiliates/:id/mark-paid`
**Auth required:** Admin only
**Logic:** Set all `payable` commissions for the affiliate to `paid`, record `paid_at = NOW()`. Return `{ paidCount, totalPaid }`.

### `POST /admin/affiliates/surge`
**Auth required:** Admin only
**Body:** `{ bonusMultiplier: number, durationHours: number, message: string }`
**Logic:**
1. Insert into `affiliate_surges` with `ends_at = NOW() + durationHours HOURS`.
2. Send surge blast email to all active affiliates (call `sendAffiliateSurgeBlastEmail` from Task 4 — fire and forget).
3. Return the created surge event.

## DB Helpers to Add to Your DB Module
These are needed by the endpoints above. Add them alongside the 4 existing affiliate helpers from Task 1.

- `createAffiliate({ userId, displayName, email, payoutMethod, payoutDetails, code, promoCode, recruitedById })` → inserted row
- `getAffiliateByUserId(userId)` → affiliate row or null
- `getAffiliateStats(affiliateId)` → `{ clickCount, pendingCommission, payableCommission, paidCommission }`
- `getAffiliateLeaderboard()` → top 10 by sales_count
- `getAffiliateMonthlyCommissions(affiliateId)` → last 6 months grouped by month
- `approveAffiliate(id)` → updated row
- `suspendAffiliate(id)` → updated row
- `markCommissionsPaid(affiliateId)` → `{ rowCount, totalPaid }`
- `createSurgeEvent({ bonusMultiplier, durationHours, message, createdBy })` → inserted row
- `getActiveSurge()` → surge row or null
- `getAllActiveAffiliateEmails()` → array of `{ email, displayName }` for active affiliates

## Admin Identity Check
```javascript
function requireAdmin(req, res, next) {
  const adminId = process.env.ADMIN_USER_ID;
  if (!adminId) {
    console.warn('[affiliate] ADMIN_USER_ID env var not set — admin routes disabled');
    return res.status(503).json({ error: 'Admin not configured' });
  }
  if (req.session?.userId !== adminId) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}
```

## Mounting in the Main Server File
Add exactly one line before the 404/catch-all handler:
```javascript
app.use('/', require('./affiliates-api'));
```
