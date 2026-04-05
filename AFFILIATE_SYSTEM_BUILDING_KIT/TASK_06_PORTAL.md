# TASK 06 — Affiliate Portal + Marketing Kit
**Dependency:** Task 03 must be merged first (tier data and promo codes needed).
**Touches:** New file `affiliate-portal.html` (or equivalent page). New API endpoint `GET /api/affiliate/monthly-commissions` in `affiliates-api.js`.

---

## What & Why
The affiliate's operational home base — a gated dashboard showing live stats, tier progress, earnings, and a complete marketing kit with ready-to-use content. The marketing kit is the primary retention tool: affiliates who can see what's working, and have content ready to post, will keep promoting.

## Done looks like
- Page exists at `/affiliate-portal`, requires login, redirects to `/login?next=/affiliate-portal` if not authenticated.
- If logged in but not an affiliate, shows a "You're not registered" message with a link to `/affiliates`.
- Stats dashboard shows tier, progress bar, clicks, sales count, conversion rate.
- Earnings section shows 3 stat cards (pending / payable / paid) and a Chart.js bar chart (last 6 months).
- Referral links section: unique URL + promo code, both with one-click copy buttons.
- UTM link builder generates full tracking URLs client-side.
- Marketing kit: captions for 5 platforms, 3 video scripts, brand asset notes.
- Recruiter card: styled HTML card + downloadable SVG link (from Task 7's endpoint).

## Dashboard Sections

### 1. Status Header
Fetch `GET /api/affiliate/me` on load. Display:
- Affiliate alias
- Tier badge with tier-appropriate colour ({RANK_1}=neutral, {RANK_2}=primary accent, {RANK_3}=secondary accent)
- Status badge (pending=warning, active=success, suspended=error)
- If `status === 'pending'`: show "Your application is under review. We'll notify you by email."

### 2. Stats Row
Four stat cards in a horizontal row:
- **Clicks** — total clicks (from `clickCount`)
- **Sales** — `salesCount`
- **Conversion** — `(salesCount / clickCount × 100).toFixed(1)%` — show "N/A" if 0 clicks
- **Next Tier** — "X more sales to {RANK_2}" or "Max tier reached" if {RANK_3}

### 3. Tier Progress Bar
Visual progress bar from current sales count to next threshold.
```
{RANK_1}: ████████░░░░░░░░ 3 / {COMMISSION_TIER_2_SALES} sales  [{COMMISSION_RATE}%]
```

### 4. Earnings Section
Three stat cards:
- **Pending** — `commissions.pending` in {CURRENCY_SYMBOL} (locked, hold period)
- **Payable** — `commissions.payable` in {CURRENCY_SYMBOL} (ready to request)
- **Total Paid** — `commissions.paid` in {CURRENCY_SYMBOL}

Monthly bar chart using Chart.js (CDN: `https://cdn.jsdelivr.net/npm/chart.js`):
- Fetch `GET /api/affiliate/monthly-commissions`
- Render as a bar chart, last 6 months on X axis, commission amount on Y axis
- Match your app's colour scheme

### 5. Referral Links Section
```
YOUR REFERRAL LINK
[ {APP_URL}/?ref=GHOST01AB ]  [COPY]

YOUR PROMO CODE
[ GHOST01 ]  [COPY]
```
Copy buttons use `navigator.clipboard.writeText()`. Show "Copied!" flash on success.

Also show the recruiter link:
```
RECRUIT OTHER AFFILIATES
Share this link to bring other affiliates into the programme:
[ {APP_URL}/affiliates?recruiter=GHOST01AB ]  [COPY]
```

### 6. UTM Link Builder
A client-side form — no API call. Three text inputs:
- Platform (e.g., "instagram", "tiktok", "youtube")
- Medium (e.g., "social", "video", "bio")
- Campaign (e.g., "jan-push", "product-launch")

Dynamically builds:
```
{APP_URL}/?ref=GHOST01AB&utm_source=instagram&utm_medium=social&utm_campaign=jan-push
```
Output appears in a read-only text field with a copy button. Updates in real-time as inputs change.

### 7. Recruiter Card
A styled HTML `<div>` that looks like a social media card:
- App name / logo text at top
- Alias in large text
- Tier badge
- "X SALES CONFIRMED" count
- Referral code at bottom
- "SCREENSHOT THIS AND SHARE" instruction beneath

Also include: `<a href="/affiliate-card/{code}" download="affiliate-card.svg">Download as SVG</a>` (points to Task 7's endpoint).

### 8. Marketing Kit — Platform Captions
Tabbed or accordion sections, one per platform. Each caption variant has a COPY button. The affiliate's referral URL is injected dynamically using JS after fetching their data.

See `MARKETING_COPY_TEMPLATES.md` for full caption copy for each platform. Use those as a direct source — adapt the placeholders.

Platforms to cover:
- X / Twitter (5 variants)
- LinkedIn (3 variants)
- Facebook (3 variants)
- Instagram (3 variants — note: link must go in bio)
- WhatsApp broadcast (2 variants)

### 9. Marketing Kit — Video Scripts
Three collapsible script cards for TikTok/Reels/YouTube Shorts. See `MARKETING_COPY_TEMPLATES.md` for the full scripts. Each script is formatted as:
- **Hook (0–3s):** What to say/show to stop the scroll
- **Problem (3–8s):** The pain point you're solving
- **Reveal (8–20s):** Showing {APP_NAME} as the solution
- **CTA (20–30s):** Direct call to action with referral link/code

### 10. Brand Asset Notes
A simple info panel:
- Primary colour: `#HEX` with a colour swatch
- Secondary colour: `#HEX` with a colour swatch
- Font names used in the app
- "For logo files and brand assets, email {SUPPORT_EMAIL}"

## API Endpoint to Add
In `affiliates-api.js`, add:

```javascript
// GET /api/affiliate/monthly-commissions
router.get('/api/affiliate/monthly-commissions', requireAuth, async (req, res) => {
  try {
    const affiliate = await getAffiliateByUserId(req.session.userId);
    if (!affiliate) return res.status(404).json({ error: 'Not an affiliate' });
    const data = await getAffiliateMonthlyCommissions(affiliate.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

Add `getAffiliateMonthlyCommissions(affiliateId)` to your DB module — see `SCHEMA_SQL.md` for the query.
