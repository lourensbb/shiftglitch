# AFFILIATE SYSTEM — COMPLETE DATABASE SCHEMA
### PostgreSQL DDL — all tables, all constraints, safe to run with IF NOT EXISTS

---

## Notes for the Executor Agent

- All statements use `IF NOT EXISTS` — safe to run on both fresh and existing databases.
- `affiliates.user_id` is nullable — supports external affiliates who don't have an account in your system.
- `affiliates.recruited_by_id` is a self-referencing FK — supports the affiliate-recruits-affiliate feature.
- `affiliate_surges` stores admin-triggered double-commission events.
- `affiliate_email_queue` stores the 5-email onboarding drip sequence for approved affiliates.
- Replace `users` table reference with your actual users table name if different.
- The `affiliate_commissions.status` CHECK constraint enforces the lifecycle: pending → payable → paid (or cancelled).

---

## Full DDL

```sql
-- ============================================================
-- TABLE: affiliates
-- One row per affiliate. Nullable user_id allows external affiliates.
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliates (
  id                SERIAL PRIMARY KEY,
  user_id           TEXT REFERENCES users(id) ON DELETE SET NULL,
  code              VARCHAR(12) UNIQUE NOT NULL,
  promo_code        VARCHAR(12) UNIQUE,
  display_name      TEXT,
  email             TEXT NOT NULL,
  commission_rate   NUMERIC(4,2)  NOT NULL DEFAULT 0.15,
  payout_method     VARCHAR(10)   NOT NULL DEFAULT 'paypal'
                      CHECK (payout_method IN ('paypal', 'ozow')),
  payout_details    JSONB         DEFAULT '{}',
  status            VARCHAR(12)   NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'active', 'suspended')),
  tier              VARCHAR(12)   NOT NULL DEFAULT 'recruit'
                      CHECK (tier IN ('recruit', 'operative', 'ghost')),
  sales_count       INT           NOT NULL DEFAULT 0,
  recruited_by_id   INT REFERENCES affiliates(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: affiliate_commissions
-- One row per sale attributed to an affiliate.
-- Lifecycle: pending → payable (after hold period) → paid
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id            SERIAL PRIMARY KEY,
  affiliate_id  INT           NOT NULL REFERENCES affiliates(id),
  order_id      TEXT          NOT NULL,
  sale_amount   NUMERIC(10,2) NOT NULL,
  commission    NUMERIC(10,2) NOT NULL,
  status        VARCHAR(12)   NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'payable', 'paid', 'cancelled')),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  payable_at    TIMESTAMPTZ   NOT NULL,
  paid_at       TIMESTAMPTZ
);

-- ============================================================
-- TABLE: affiliate_clicks
-- One row per referral link click (anonymous counter, no PII).
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id            SERIAL PRIMARY KEY,
  affiliate_id  INT         NOT NULL REFERENCES affiliates(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: affiliate_surges
-- Admin-triggered double-commission events.
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_surges (
  id               SERIAL PRIMARY KEY,
  bonus_multiplier NUMERIC(4,2) NOT NULL DEFAULT 2.0,
  started_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  ends_at          TIMESTAMPTZ  NOT NULL,
  message          TEXT,
  created_by       TEXT
);

-- ============================================================
-- TABLE: affiliate_email_queue
-- Onboarding drip emails for approved affiliates.
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliate_email_queue (
  id             SERIAL PRIMARY KEY,
  affiliate_id   INT         NOT NULL REFERENCES affiliates(id),
  template       VARCHAR(40) NOT NULL,
  scheduled_for  TIMESTAMPTZ NOT NULL,
  sent_at        TIMESTAMPTZ,
  metadata       JSONB        DEFAULT '{}'
);
```

---

## Useful Queries

### Get all affiliates with commission totals
```sql
SELECT
  a.id,
  a.display_name,
  a.code,
  a.tier,
  a.status,
  a.sales_count,
  COUNT(DISTINCT ac.id)                                    AS click_count,
  COALESCE(SUM(c.commission) FILTER (WHERE c.status = 'pending'),  0) AS pending_commission,
  COALESCE(SUM(c.commission) FILTER (WHERE c.status = 'payable'),  0) AS payable_commission,
  COALESCE(SUM(c.commission) FILTER (WHERE c.status = 'paid'),     0) AS paid_commission
FROM affiliates a
LEFT JOIN affiliate_commissions c  ON c.affiliate_id = a.id
LEFT JOIN affiliate_clicks     ac ON ac.affiliate_id = a.id
GROUP BY a.id
ORDER BY a.sales_count DESC;
```

### Promote pending commissions to payable (run hourly)
```sql
UPDATE affiliate_commissions
SET status = 'payable'
WHERE status = 'pending'
  AND payable_at <= NOW();
```

### Mark all payable commissions as paid for one affiliate
```sql
UPDATE affiliate_commissions
SET status = 'paid', paid_at = NOW()
WHERE affiliate_id = $1
  AND status = 'payable';
```

### Top 10 leaderboard (public, alias only)
```sql
SELECT display_name AS alias, tier, sales_count
FROM affiliates
WHERE status = 'active'
ORDER BY sales_count DESC
LIMIT 10;
```

### Active surge event (if any)
```sql
SELECT * FROM affiliate_surges
WHERE ends_at > NOW()
ORDER BY started_at DESC
LIMIT 1;
```

### Monthly commissions for an affiliate (last 6 months)
```sql
SELECT
  DATE_TRUNC('month', created_at) AS month,
  SUM(commission)                 AS total
FROM affiliate_commissions
WHERE affiliate_id = $1
  AND created_at >= NOW() - INTERVAL '6 months'
GROUP BY month
ORDER BY month ASC;
```
