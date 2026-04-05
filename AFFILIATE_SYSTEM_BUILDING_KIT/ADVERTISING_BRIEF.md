# AFFILIATE PROGRAMME — FULL ADVERTISING BRIEF
### Strategic design document for {APP_NAME}

---

## Executive Summary

This document is the complete strategic and executional brief for building a {APP_NAME} affiliate programme. It covers: programme architecture, commission structure, tracking mechanics, payout logic, sales material, and 10 growth enhancements that transform a basic referral programme into a self-sustaining marketing channel.

Affiliates promote {APP_NAME}'s {PRODUCT_NAME} and earn {COMMISSION_RATE}% commission per confirmed sale. Commissions are held for {HOLD_DAYS} days (to cover refund windows) then marked payable. South African affiliates are paid via {PAYOUT_SA}; international affiliates via {PAYOUT_INTL} (manual).

---

## Programme Architecture

### Tracking Mechanism
When a visitor arrives via an affiliate link (`{APP_URL}/?ref=AFFCODE`), their affiliate code is stored in an `{COOKIE_NAME}` cookie (30-day expiry). The cookie follows them through the session. When they complete a purchase, the code is attached to the payment via the processor's custom field (`{ITN_FIELD}`). The payment webhook reads this field and queues the commission.

### Backup Tracking: Promo Codes
Each affiliate is also assigned a personal promo code (e.g., `GHOST01`). Buyers can enter this at checkout manually — it resolves to the same affiliate and also triggers the two-sided discount. This covers cookieless browsers, incognito sessions, and link-in-bio scenarios where cookies don't persist.

### Commission Structure

| Tier | Name | Sales Required | Commission Rate |
|---|---|---|---|
| 1 | {RANK_1} | 0–{COMMISSION_TIER_2_SALES} sales | {COMMISSION_RATE}% |
| 2 | {RANK_2} | {COMMISSION_TIER_2_SALES}–{COMMISSION_TIER_3_SALES} sales | {COMMISSION_TIER_2_RATE}% |
| 3 | {RANK_3} | {COMMISSION_TIER_3_SALES}+ sales | {COMMISSION_TIER_3_RATE}% |

Commission is calculated on the actual sale amount (post-discount if applicable). The tier system automatically upgrades after each confirmed sale.

### Two-Sided Referral Discount
- Referred buyer gets **10% off** their first purchase.
- The affiliate earns their commission rate on the discounted sale amount.
- This gives affiliates a concrete value proposition: "Use my link and get 10% off."
- Implemented by serving discounted pack variants at checkout when the referral cookie or promo code is detected.

### Payout Schedule
- Sale confirmed → commission status: `pending`
- After {HOLD_DAYS} days → commission status: `payable` (automated hourly check)
- Admin pays out → commission status: `paid`
- {PAYOUT_SA} for South African bank accounts (direct transfer)
- {PAYOUT_INTL} for international affiliates (manual, admin-triggered)

---

## The 10 Growth Enhancements

These are the differentiators between a basic referral programme and a high-performing affiliate channel. Each is included in the system build.

### Enhancement 1: Two-Sided Reward ("Recruiter AND Recruit both win")
Standard programmes reward only the affiliate. This one gives the referred buyer a visible 10% discount badge when they arrive via a referral link. The affiliate now has a real selling proposition: "Use my link and save 10%." Conversion rates rise significantly when buyers have a concrete incentive.

**Implementation:** Detect the `{COOKIE_NAME}` cookie or promo code at checkout. Serve the discounted pack variant. The UI shows a crossed-out price with a referral badge.

---

### Enhancement 2: Tiered Commission Ranks ({RANK_1} → {RANK_2} → {RANK_3})
A flat commission rate creates no ongoing motivation. Three tiers — at {COMMISSION_TIER_2_SALES} and {COMMISSION_TIER_3_SALES} confirmed sales — keep affiliates promoting long after their first few conversions. Each tier upgrade should trigger an email congratulating them and telling them exactly how many sales to the next tier.

**Why it works:** Affiliates are always chasing a tangible milestone. The tier name becomes a status symbol they'll mention in their content ("I'm a {RANK_3} on {APP_NAME}'s affiliate programme").

---

### Enhancement 3: Instant Sale Notification
The moment a commission is queued (payment confirmed), the affiliate receives an email: "Commission incoming — {CURRENCY_SYMBOL}X queued. Y more sales to {RANK_2} rank." Nothing sustains promotional activity like a real-time reward signal.

**Why it works:** The time between effort (posting content) and reward (seeing a result) is the primary reason affiliate programmes go dormant. Close that gap to near-zero.

---

### Enhancement 4: Affiliate-Exclusive Promo Code (Backup Tracking)
Each affiliate gets a short, memorable promo code (e.g., `GHOST01`) that also triggers a 10% buyer discount. This is critical for:
- Podcast episodes (verbal mention, no link)
- YouTube video descriptions (link rot, cookies don't persist)
- Instagram bios (one link limit)
- WhatsApp broadcasts (hyperlinks often stripped)

The promo code is a second, parallel tracking mechanism that doesn't rely on cookies at all.

---

### Enhancement 5: Shareable "Recruiter Card" — Dynamic SVG Badge
A server-generated SVG image available at `{APP_URL}/affiliate-card/{CODE}`. Shows the affiliate's alias, tier, and sales count in your app's visual style. Affiliates can download it, post it on social media, and use it as a "proof of earnings" social signal.

**Why it works:** People trust social proof from people they follow. An affiliate posting their recruiter card (even with a modest sales count) creates authentic FOMO and builds programme credibility.

---

### Enhancement 6: 5-Email Onboarding Drip for Approved Affiliates
Most affiliates sign up, post once, get no results, and go silent. A timed email sequence prevents this:

- **Day 0** — "You're live. Here's your link and your first post idea."
- **Day 2** — "The content type that converts best for [product type]."
- **Day 5** — "Story vs feed: where to put your affiliate link."
- **Day 10** — "Check your stats. Here's what the numbers mean."
- **Day 20** — "You're X sales from {RANK_2} rank — here's a push."

This keeps affiliates in active promotional mode through the critical first 3 weeks.

---

### Enhancement 7: Seasonal "Surge" Campaigns (Admin-Triggered)
An admin panel button that launches a 48-hour double-commission event. All active affiliates get an email blast the moment it fires: "DOUBLE COMMISSIONS — 48 hours only." The email includes a ready-to-post caption for them to share immediately.

**Why it works:** Creates urgency. Causes a burst of coordinated promotional activity. Costs the business nothing when no sales happen (it's a percentage, not a flat cost). Particularly powerful around peak purchase periods.

---

### Enhancement 8: Affiliate-Recruits-Affiliate (One Level Deep)
Active affiliates can share a special "recruit other affiliates" link (`{APP_URL}/affiliates?recruiter=CODE`). When someone signs up as a new affiliate through this link, the original affiliate earns a flat bonus on the recruit's first commission. This turns your top affiliates into recruiters and creates a viral growth loop in the affiliate pool itself.

**One level only** — no multi-tier MLM complexity. The `recruited_by_id` FK is stored on the affiliates table for future commission-on-recruit logic.

---

### Enhancement 9: Conversion Analytics Dashboard
Beyond clicks and sales counts, show affiliates their conversion rate (sales / clicks), which product tier their audience buys most, and a monthly earnings bar chart. When affiliates can see what's working, they optimise. When they optimise, they promote more.

**Data points to show:**
- Conversion rate (%)
- Most popular pack among their referrals
- Monthly earnings chart (last 6 months)
- Progress bar to next tier
- Comparison: this month vs last month

---

### Enhancement 10: Public Affiliate Leaderboard ("Top Operatives")
A public-facing section on the recruitment page showing the top 10 affiliates by confirmed sales (alias only, no real names or emails). Updated monthly. This:
- Gives top affiliates public status they'll mention in content
- Proves to potential new affiliates that the programme actually pays out
- Creates competitive motivation among active affiliates
- Acts as organic word-of-mouth marketing (top affiliates will share their ranking)

---

## Payout Methods — Implementation Decision Matrix

| Affiliate Type | Recommended Method | Automation Level |
|---|---|---|
| SA bank account | {PAYOUT_SA} Payout API | Automatic (post-implementation) |
| International | {PAYOUT_INTL} | Manual (admin sends, logs the payment) |
| Has own payment processor account | Split payment at checkout | On request — requires affiliate's merchant ID |

For v1: SA bank and PayPal are sufficient. The split payment option is documented as available on request.

---

## Expected Programme Economics

At {COMMISSION_RATE}% commission:

| Pack | Sale Price | Affiliate Earns ({RANK_1}) | Affiliate Earns ({RANK_2}) | Affiliate Earns ({RANK_3}) |
|---|---|---|---|---|
| {PACK_1_LABEL} | {CURRENCY_SYMBOL}{PACK_1_PRICE} | {CURRENCY_SYMBOL}{PACK_1_COMMISSION_RANK_1} | {CURRENCY_SYMBOL}{PACK_1_COMMISSION_RANK_2} | {CURRENCY_SYMBOL}{PACK_1_COMMISSION_RANK_3} |
| {PACK_2_LABEL} | {CURRENCY_SYMBOL}{PACK_2_PRICE} | {CURRENCY_SYMBOL}{PACK_2_COMMISSION_RANK_1} | {CURRENCY_SYMBOL}{PACK_2_COMMISSION_RANK_2} | {CURRENCY_SYMBOL}{PACK_2_COMMISSION_RANK_3} |
| {PACK_3_LABEL} | {CURRENCY_SYMBOL}{PACK_3_PRICE} | {CURRENCY_SYMBOL}{PACK_3_COMMISSION_RANK_1} | {CURRENCY_SYMBOL}{PACK_3_COMMISSION_RANK_2} | {CURRENCY_SYMBOL}{PACK_3_COMMISSION_RANK_3} |

*Fill in commission amounts using: price × commission_rate / 100*

---

## Brand Voice and Tone Guidelines

Replace this section with your app's specific voice rules. As a template:

- Use your app's universe/metaphor language consistently throughout affiliate-facing copy.
- Avoid corporate filler phrases ("synergy", "leverage", "circle back").
- Write to the affiliate as a peer, not as a customer.
- Every email, page, and notification should sound like it comes from the same person.
- The affiliate programme should feel like joining an inner circle, not signing up for a referral scheme.
