# TASK 07 — Admin Panel, Surge Campaigns & Recruiter Card SVG
**Dependency:** Task 04 must be merged first (email functions needed for surge blast and approval emails).
**Touches:** New file `admin-affiliates.html` (or equivalent). New server route `GET /affiliate-card/:code` for SVG generation.

---

## What & Why
Gives the operator full visibility and control over the affiliate programme. Approve or suspend affiliates, mark commission batches as paid, fire surge campaigns, and monitor overall programme health — all from one page. Also adds the dynamically generated SVG recruiter card endpoint.

## Done looks like
- Admin panel exists at `/admin/affiliates`, protected by `requireAdmin` middleware (already in `affiliates-api.js`).
- Lists all affiliates with status, tier, click/sales/commission summary, and action buttons.
- "APPROVE" and "SUSPEND" buttons call the relevant admin API endpoints.
- "MARK PAID" button calls `POST /admin/affiliates/:id/mark-paid` for all payable commissions.
- Surge campaign launcher form fires `POST /admin/affiliates/surge`.
- Summary dashboard at top: total active affiliates, total pending commission, total payable commission, total paid all time.
- `GET /affiliate-card/:code` returns a server-generated SVG for any active affiliate.

## Admin Panel Implementation

### 1. Auth Check
On page load, fetch `GET /api/me` (or your session endpoint). If not logged in or not admin, redirect to `/` or show "Access denied." This is a client-side guard — the server routes already enforce `requireAdmin`.

### 2. Summary Cards
Fetch `GET /admin/affiliates` and compute:
- Total active affiliates (count where `status === 'active'`)
- Total payable commission across all affiliates (sum of `payableCommission`)
- Total pending commission across all affiliates (sum of `pendingCommission`)
- Total paid all time (sum of `paidCommission`)

Display as 4 stat cards at the top of the page.

### 3. Surge Campaign Launcher
A form at the top of the admin page (above the affiliate table):
- **Bonus Multiplier** — number input (default: 2.0, step: 0.5, min: 1.5, max: 5.0)
- **Duration (hours)** — number input (default: 48)
- **Custom message** — text area ("What to tell affiliates about this campaign")
- **LAUNCH SURGE** button — POSTs to `POST /admin/affiliates/surge`

On success: show confirmation with end time and "Email blast sent to X active affiliates."
Show the currently active surge (if any) in a highlighted banner: "SURGE ACTIVE — ends at [time] [CANCEL? (note: cancelling requires manual DB update)]"

### 4. Affiliate Table
Render a table with these columns:

| Column | Data |
|---|---|
| Alias | `display_name` |
| Code | `code` |
| Tier | Badge in tier colour |
| Status | Badge (pending/active/suspended) |
| Clicks | Click count |
| Sales | `sales_count` |
| Pending | `{CURRENCY_SYMBOL}X` in grey |
| Payable | `{CURRENCY_SYMBOL}X` in accent colour |
| Paid | `{CURRENCY_SYMBOL}X` in green |
| Actions | Button group |

Action buttons per row:
- **APPROVE** — visible if `status === 'pending'`. POST to `/admin/affiliates/{id}/approve`. Reload table row.
- **SUSPEND** — visible if `status === 'active'`. POST to `/admin/affiliates/{id}/suspend`. Reload table row.
- **REACTIVATE** — visible if `status === 'suspended'`. POST to `/admin/affiliates/{id}/approve`. Reload table row.
- **MARK PAID** — visible if `payableCommission > 0`. POST to `/admin/affiliates/{id}/mark-paid`. Show result: "Marked {CURRENCY_SYMBOL}X as paid."
- **VIEW CARD** — opens `/affiliate-card/{code}` in a new tab.

All table mutations reload only the affected row (or the entire table on failure) — do not use full page refresh.

### 5. Commission Detail Modal (optional but recommended)
Clicking an affiliate's alias shows a modal with their full commission history:
- Fetch a new endpoint `GET /admin/affiliates/:id/commissions` (add to `affiliates-api.js`):
  ```javascript
  router.get('/admin/affiliates/:id/commissions', requireAdmin, async (req, res) => {
    const { rows } = await pool.query(
      'SELECT * FROM affiliate_commissions WHERE affiliate_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.params.id]
    );
    res.json(rows);
  });
  ```
- Show: order ID, sale amount, commission, status, created date, payable date, paid date.
- Include a mini bar chart of monthly earnings (reuse the Chart.js approach from Task 6).

## Recruiter Card SVG Endpoint

Add this new route to the main server file (or to `affiliates-api.js`):

```javascript
app.get('/affiliate-card/:code', async (req, res) => {
  const affiliate = await getAffiliateByCode(req.params.code.toUpperCase());
  if (!affiliate || affiliate.status !== 'active') {
    return res.status(404).send('Not found');
  }

  const tierLabel = {
    recruit:   '{RANK_1}',
    operative: '{RANK_2}',
    ghost:     '{RANK_3}',
  }[affiliate.tier] || affiliate.tier;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="350" viewBox="0 0 600 350">
  <defs>
    <style>
      .app-name { font: bold 18px 'Courier New', monospace; fill: {ACCENT_COLOUR}; }
      .alias    { font: bold 42px 'Courier New', monospace; fill: #FFFFFF; }
      .tier     { font: bold 16px 'Courier New', monospace; fill: {ACCENT_COLOUR}; }
      .sales    { font: bold 24px 'Courier New', monospace; fill: #FFFFFF; }
      .code     { font: 14px 'Courier New', monospace; fill: #888888; }
      .url      { font: 11px 'Courier New', monospace; fill: #555555; }
    </style>
  </defs>

  <!-- Background -->
  <rect width="600" height="350" fill="#000000" rx="12"/>

  <!-- Top accent bar -->
  <rect x="0" y="0" width="600" height="4" fill="{ACCENT_COLOUR}" rx="12"/>

  <!-- App name -->
  <text x="30" y="50" class="app-name">// {APP_NAME}</text>

  <!-- Alias -->
  <text x="30" y="130" class="alias">${affiliate.display_name || affiliate.code}</text>

  <!-- Tier -->
  <text x="30" y="165" class="tier">[ ${tierLabel.toUpperCase()} ]</text>

  <!-- Sales count -->
  <text x="30" y="230" class="sales">${affiliate.sales_count} CONFIRMED SALES</text>

  <!-- Code -->
  <text x="30" y="275" class="code">PROMO: ${affiliate.promo_code || affiliate.code}</text>

  <!-- Referral URL -->
  <text x="30" y="300" class="url">{APP_URL}/?ref=${affiliate.code}</text>

  <!-- Bottom right: powered by -->
  <text x="570" y="340" class="url" text-anchor="end">{APP_NAME} Affiliate Programme</text>
</svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Content-Disposition', `inline; filename="affiliate-card-${affiliate.code}.svg"`);
  res.setHeader('Cache-Control', 'no-cache'); // Stats change — never cache
  res.send(svg);
});
```

Replace `{ACCENT_COLOUR}` with your app's primary neon/brand colour hex code.

## Variables to Fill Before Handing This to an Agent
- `{ACCENT_COLOUR}` — e.g., `#39FF14` for neon green
- `{RANK_1}`, `{RANK_2}`, `{RANK_3}` — tier rank names
- `{CURRENCY_SYMBOL}` — e.g., `R` for ZAR
- All other standard kit variables (see README.md)
