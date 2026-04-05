# TASK 03 — Tiered Ranks, Promo Codes & Two-Sided Discount
**Dependency:** Task 02 must be merged first.
**Touches:** DB module (new helpers), `affiliates-api.js` (updated responses), main server checkout handler (new pack variants).

---

## What & Why
Upgrade the flat commission to a 3-tier rank system. Add promo codes as backup tracking. Give referred buyers a 10% discount at checkout — giving affiliates a concrete selling point.

## Done looks like
- After each confirmed sale, `sales_count` is checked and the affiliate's `tier` and `commission_rate` automatically upgrade if thresholds are crossed.
- Every affiliate has a `promo_code` stored in the DB (generated on registration).
- The checkout endpoint accepts `promoCode` in the request body and resolves it to an affiliate code if valid.
- When a referral cookie OR valid promo code is detected at checkout, a discounted price variant is served (10% off).
- `GET /api/affiliate/me` now includes `promoCode`, `nextTierAt`, and `discountedReferralUrl`.

## Out of scope
- Sub-affiliate commission chains (the `recruited_by_id` FK is already stored — the bonus logic is intentionally deferred to a future task).
- PayFast split payment auto-setup (document as available on request via admin email; do not implement the split API).

## Tier Thresholds

| Tier | Name | Sales Required | Commission Rate |
|---|---|---|---|
| 1 | {RANK_1} | 0 – ({COMMISSION_TIER_2_SALES} − 1) | {COMMISSION_RATE}% |
| 2 | {RANK_2} | {COMMISSION_TIER_2_SALES} – ({COMMISSION_TIER_3_SALES} − 1) | {COMMISSION_TIER_2_RATE}% |
| 3 | {RANK_3} | {COMMISSION_TIER_3_SALES}+ | {COMMISSION_TIER_3_RATE}% |

## Implementation Steps

### Step 1 — Add `promo_code` Column
In your DB init block:
```sql
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS promo_code VARCHAR(12) UNIQUE;
```

Add DB helper `getAffiliateByPromoCode(promoCode)` → returns affiliate row or null.

### Step 2 — Auto-Generate Promo Code on Registration
In your `createAffiliate` DB helper, generate the promo code alongside the tracking code:
```javascript
// Format: first 5 alphanumeric chars of displayName uppercased + 2-digit random
function generatePromoCode(displayName) {
  const base = displayName.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 5).padEnd(5, 'X');
  const suffix = String(Math.floor(Math.random() * 90) + 10);
  return base + suffix;
}
// Retry up to 5× on uniqueness collision
```

### Step 3 — Tier Upgrade Logic
Add `checkAndUpgradeAffiliateTier(affiliateId)` to your DB module:
```javascript
async function checkAndUpgradeAffiliateTier(affiliateId) {
  const { rows } = await pool.query('SELECT sales_count, tier FROM affiliates WHERE id = $1', [affiliateId]);
  const { sales_count, tier } = rows[0];

  let newTier = '{RANK_1}';
  let newRate = {COMMISSION_RATE} / 100;

  if (sales_count >= {COMMISSION_TIER_3_SALES}) {
    newTier = '{RANK_3}';
    newRate = {COMMISSION_TIER_3_RATE} / 100;
  } else if (sales_count >= {COMMISSION_TIER_2_SALES}) {
    newTier = '{RANK_2}';
    newRate = {COMMISSION_TIER_2_RATE} / 100;
  }

  if (newTier !== tier) {
    await pool.query(
      'UPDATE affiliates SET tier = $1, commission_rate = $2 WHERE id = $3',
      [newTier, newRate, affiliateId]
    );
    console.log(`[affiliate] ${affiliateId} upgraded to ${newTier} (${newRate * 100}%)`);
    return newTier; // caller can use this to trigger upgrade email
  }
  return null; // no change
}
```

Call this from `queueAffiliateCommission` (Task 1) AFTER incrementing `sales_count`.

### Step 4 — Discounted Pack Variants at Checkout
In your payment configuration (wherever pack prices are defined), add discounted variants at 10% off:

```javascript
const PACKS = {
  '1m':     { amount: '{PACK_1_PRICE}', label: '{PACK_1_LABEL}', days: 30 },
  '3m':     { amount: '{PACK_2_PRICE}', label: '{PACK_2_LABEL}', days: 90 },
  '12m':    { amount: '{PACK_3_PRICE}', label: '{PACK_3_LABEL}', days: 365 },
  // Referral discounted variants (10% off)
  '1m-ref':  { amount: '{PACK_1_PRICE_DISCOUNTED}', label: '{PACK_1_LABEL} (Referral)', days: 30 },
  '3m-ref':  { amount: '{PACK_2_PRICE_DISCOUNTED}', label: '{PACK_2_LABEL} (Referral)', days: 90 },
  '12m-ref': { amount: '{PACK_3_PRICE_DISCOUNTED}', label: '{PACK_3_LABEL} (Referral)', days: 365 },
};
// {PACK_X_PRICE_DISCOUNTED} = PACK_X_PRICE × 0.90, rounded to 2 decimal places
```

**Important:** Your payment webhook matches sales by amount. By adding the discounted amounts to your pack list, the webhook will correctly match discounted sales too.

### Step 5 — Promo Code Resolution at Checkout
In your checkout route handler, after reading the referral cookie:

```javascript
// Resolve affiliate from cookie OR promo code (promo code takes priority)
let resolvedAffiliateCode = req.cookies['{COOKIE_NAME}'] || '';
const promoCode = (req.body.promoCode || '').trim().toUpperCase();
if (promoCode) {
  const promoAffiliate = await getAffiliateByPromoCode(promoCode);
  if (promoAffiliate && promoAffiliate.status === 'active') {
    resolvedAffiliateCode = promoAffiliate.code;
  }
}

// Map to discounted pack variant if referral is detected
let resolvedPack = req.body.pack; // e.g. '1m'
if (resolvedAffiliateCode && PACKS[resolvedPack + '-ref']) {
  resolvedPack = resolvedPack + '-ref';
}

fields['{ITN_FIELD}'] = resolvedAffiliateCode;
```

### Step 6 — Update `GET /api/affiliate/me`
Add `promoCode`, `nextTierAt`, and `discountedReferralUrl` to the response:
```javascript
nextTierAt: tier === '{RANK_1}' ? {COMMISSION_TIER_2_SALES} :
            tier === '{RANK_2}' ? {COMMISSION_TIER_3_SALES} :
            null,
promoCode: affiliate.promo_code,
discountedReferralUrl: `{APP_URL}/?ref=${affiliate.code}&discount=10`,
```
