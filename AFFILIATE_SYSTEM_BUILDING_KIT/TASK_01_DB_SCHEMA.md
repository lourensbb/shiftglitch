# TASK 01 — DB Schema + Core Payment Plumbing
**Dependency:** None. This is the foundation. All other tasks depend on it.
**Touches:** Database init file, main server file (surgical edits only)

---

## What & Why
Lay the database foundation and wire affiliate tracking into the existing payment flow. No HTML pages, no API routes — pure backend infrastructure that every other task builds on.

## Done looks like
- Five new DB tables exist: `affiliates`, `affiliate_commissions`, `affiliate_clicks`, `affiliate_surges`, `affiliate_email_queue`.
- A visitor hitting `{APP_URL}/?ref=AFFCODE` gets an `{COOKIE_NAME}` cookie set for 30 days and an `affiliate_clicks` row inserted for the matched affiliate.
- The checkout handler includes the affiliate code from the cookie as `{ITN_FIELD}` in the payment fields.
- When the payment webhook fires with a confirmed sale, a commission row is inserted with `status = 'pending'` and `payable_at = NOW() + {HOLD_DAYS} days`.
- An hourly scheduler promotes `pending` commissions to `payable` once `payable_at <= NOW()`.
- If the referral code is unknown, inactive, or suspended, everything is silently ignored.

## Out of scope
- Tiered commission rates (Task 3)
- Promo codes (Task 3)
- Two-sided buyer discount (Task 3)
- API routes for affiliates to register or view stats (Task 2)
- Email notifications (Task 4)
- Any HTML pages (Tasks 5, 6, 7)

## Implementation Steps

### Step 1 — Create DB Tables
In your database initialisation block (wherever your app creates tables on startup), add the following with `IF NOT EXISTS` so it's safe to run repeatedly. Full DDL is in `SCHEMA_SQL.md`.

Tables to create:
- `affiliates` — one row per affiliate; tracks code, tier, commission rate, payout method, status
- `affiliate_commissions` — one row per sale; tracks sale amount, commission, hold period, payment status
- `affiliate_clicks` — anonymous click counter (no PII stored)
- `affiliate_surges` — admin-triggered double-commission events
- `affiliate_email_queue` — scheduled onboarding drip emails for approved affiliates

Key constraints to preserve:
- `affiliates.user_id` is nullable — allows external affiliates without app accounts
- `affiliates.recruited_by_id` is a self-referencing FK — reserve for Task 2
- `affiliates.status` CHECK: `('pending', 'active', 'suspended')`
- `affiliate_commissions.status` CHECK: `('pending', 'payable', 'paid', 'cancelled')`

### Step 2 — Add DB Helper Functions
Export these three functions from your DB/auth module:

**`getAffiliateByCode(code)`**
- Input: string (case-insensitive)
- Normalise to uppercase before querying
- Returns: full affiliate row or null

**`recordAffiliateClick(affiliateId)`**
- Input: integer affiliate ID
- Action: INSERT one row into `affiliate_clicks`
- Returns: nothing (fire and forget)

**`queueAffiliateCommission(affiliateCode, orderId, saleAmount)`**
- Input: code string, order ID string, sale amount number
- Looks up affiliate by code; returns null if not found or not `active`
- Calculates commission: `saleAmount × affiliate.commission_rate`
- Inserts into `affiliate_commissions` with `payable_at = NOW() + {HOLD_DAYS} days`
- Increments `affiliates.sales_count` by 1
- Returns the inserted commission row, or null on any error
- Wraps everything in try/catch — never throws

**`promotePayableCommissions()`**
- No inputs
- Runs: `UPDATE affiliate_commissions SET status='payable' WHERE status='pending' AND payable_at <= NOW()`
- Logs how many rows were updated (only if > 0)
- Returns: nothing

### Step 3 — Cookie Parser Middleware
If your framework doesn't already parse cookies, install a cookie parser and add it as middleware before your session middleware.

In Node/Express: `npm install cookie-parser`, then `app.use(cookieParser())`.

### Step 4 — Referral Cookie Middleware
Register a middleware **before any route registration** that:
1. Reads `req.query.ref` (or the equivalent in your framework)
2. Calls `getAffiliateByCode(refCode)`
3. If the affiliate exists AND `status === 'active'`:
   - Sets cookie `{COOKIE_NAME}` = affiliate code, maxAge 30 days, httpOnly, sameSite lax
   - Calls `recordAffiliateClick(affiliate.id)` (fire and forget)
   - Logs the click
4. If affiliate is unknown, pending, or suspended: do nothing
5. Always calls `next()` — never blocks the request

### Step 5 — Attach Affiliate Code to Checkout
In your existing checkout handler (the route that signs and submits payment fields), before computing the payment signature:

```javascript
// Read the referral cookie
const affiliateCode = req.cookies['{COOKIE_NAME}'] || '';

// Add to payment fields (alongside your existing user ID field)
fields['{ITN_FIELD}'] = affiliateCode;
// Also reserve the next custom field for future campaign tracking
fields['custom_str3'] = '';
```

Important: Most payment processors filter empty strings from signature calculation. Verify yours does the same. If not, only add `{ITN_FIELD}` when `affiliateCode` is non-empty.

### Step 6 — Commission Queuing in the Payment Webhook
In your existing payment webhook handler, **after** the purchase is confirmed and the user is upgraded, add a Step 6:

```javascript
// Step 6: Queue affiliate commission
try {
  const affiliateCode = (webhookData['{ITN_FIELD}'] || '').trim();
  if (affiliateCode) {
    const orderId = webhookData.payment_id || webhookData.order_id || String(Date.now());
    const commission = await queueAffiliateCommission(affiliateCode, orderId, saleAmount);
    if (commission) {
      console.log(`Commission queued — code: ${affiliateCode}, amount: ${commission.commission}`);
    }
  }
} catch (e) {
  console.warn('Affiliate commission error:', e.message);
  // Never re-throw — commission errors must not block payment confirmation
}
```

### Step 7 — Hourly Scheduler
Alongside your existing scheduled tasks, add:

```javascript
setInterval(promotePayableCommissions, 60 * 60 * 1000); // every hour
setTimeout(promotePayableCommissions, 30 * 1000);        // warm-up run at startup
```

Use your existing DB pool/connection — do not create a second database connection for this.

## Relevant Existing Files to Inspect First
- Your DB initialisation / schema setup file
- Your payment checkout route handler
- Your payment webhook (ITN/notify URL) handler
- Your session/middleware setup file
- Your existing DB helper/export module
