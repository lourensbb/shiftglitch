# TASK 05 — Public "Join the Programme" Recruitment Page
**Dependency:** Task 02 must be merged first (API endpoints needed).
**Touches:** New file `affiliates.html` (or equivalent page in your framework).

---

## What & Why
The top-of-funnel entry point for new affiliates. A public page that explains the programme, shows commission rates and payout structure, displays the live leaderboard, and lets users apply. Also shows surge event banners when an active campaign is running.

## Done looks like
- Public page exists at `/affiliates` (or your preferred URL).
- Commission table shows all three tiers with exact earnings per pack.
- Two-sided discount is prominently called out: "Anyone you refer gets 10% off — you earn on the sale."
- Live leaderboard fetched from `GET /api/affiliate/leaderboard` renders on load.
- Active surge event (from `GET /api/affiliate/surge`) shows a countdown banner.
- Logged-in users see the registration form; non-logged-in users see a "Log in to apply" CTA.
- FAQ accordion covers 6+ questions.
- Registering via the form POSTs to `POST /api/affiliate/register`.
- If `?recruiter=CODE` is in the URL, the recruiter code is captured and passed to the registration API.

## Page Structure (in order, top to bottom)

### 1. Surge Banner (conditional)
On page load, fetch `GET /api/affiliate/surge`. If active:
```
⚡ DOUBLE COMMISSION EVENT ACTIVE — ends in [HH:MM:SS countdown]
[JOIN NOW button scrolls to registration form]
```
Style prominently — use your accent colour, bold text, visible from the top of the page.

### 2. Hero Section
- Headline: "BECOME A {APP_NAME} AFFILIATE" (use your brand voice — see `ADVERTISING_BRIEF.md`)
- Subheadline: "Earn {COMMISSION_RATE}–{COMMISSION_TIER_3_RATE}% commission on every {PRODUCT_NAME} sale you refer."
- Two key hooks below the subheadline:
  - "Your referred buyers get 10% off — giving you a real offer to promote."
  - "Commissions grow as you earn: {RANK_1} → {RANK_2} → {RANK_3}."
- CTA button: "APPLY NOW" (scroll to registration section)

### 3. Commission Structure Table
| Tier | Sales Required | Commission | Pack | Your Earning |
|---|---|---|---|---|
| {RANK_1} | 0–{COMMISSION_TIER_2_SALES-1} | {COMMISSION_RATE}% | {PACK_1_LABEL} ({CURRENCY_SYMBOL}{PACK_1_PRICE}) | {CURRENCY_SYMBOL}{CALC} |
| {RANK_2} | {COMMISSION_TIER_2_SALES}+ | {COMMISSION_TIER_2_RATE}% | {PACK_2_LABEL} ({CURRENCY_SYMBOL}{PACK_2_PRICE}) | {CURRENCY_SYMBOL}{CALC} |
| {RANK_3} | {COMMISSION_TIER_3_SALES}+ | {COMMISSION_TIER_3_RATE}% | {PACK_3_LABEL} ({CURRENCY_SYMBOL}{PACK_3_PRICE}) | {CURRENCY_SYMBOL}{CALC} |
Fill in calculated earnings: PACK_PRICE × COMMISSION_RATE / 100.

### 4. Two-Sided Discount Callout
A highlighted info box:
> "Use your referral link and your audience gets **10% off** their first purchase. You earn commission on the sale. Everyone wins."

### 5. Payout Methods
Three styled cards, one per method:
- **{PAYOUT_SA}** — SA bank accounts — automatic transfer once commissions are marked payable
- **{PAYOUT_INTL}** — International — manual transfer within 5 business days of payout request
- **Split payment** — If you have your own merchant account with {PAYMENT_PROCESSOR} — available on request via {SUPPORT_EMAIL}

### 6. Public Leaderboard
Fetched from `GET /api/affiliate/leaderboard`. Render top 10 as a ranked list with tier badge and sales count. If empty: "No affiliates ranked yet — be the first."
Tier badge colours: suggest {RANK_1}=grey, {RANK_2}=your primary accent, {RANK_3}=your secondary accent.

### 7. Recruiter-Recruits-Affiliate Section
A brief section (2–3 paragraphs) explaining:
- Active affiliates can recruit other affiliates using their special recruiter link.
- When their recruit makes their first sale, the original affiliate earns a bonus.
- Available in the affiliate portal once approved.

### 8. FAQ Accordion
Use `<details><summary>` elements (CSS-only, no JavaScript needed):
1. "When do I get paid?" — After {HOLD_DAYS} days from the sale, commissions become payable. Contact {SUPPORT_EMAIL} to request payout.
2. "How do I track my sales?" — Via the affiliate portal dashboard at `{APP_URL}/affiliate-portal`.
3. "What commission rate do I start at?" — {COMMISSION_RATE}% as a {RANK_1}. Rises to {COMMISSION_TIER_2_RATE}% at {COMMISSION_TIER_2_SALES} sales and {COMMISSION_TIER_3_RATE}% at {COMMISSION_TIER_3_SALES} sales.
4. "Can I refer other affiliates?" — Yes. Once approved, you can recruit other affiliates and earn a bonus on their first commission.
5. "What payment methods are available?" — {PAYOUT_SA} for SA bank accounts; {PAYOUT_INTL} for international affiliates.
6. "Is there a minimum payout?" — No minimum. All payable commissions can be requested at any time after the {HOLD_DAYS}-day hold period.

### 9. Registration Form / CTA
**If logged in:** Show registration form with:
- Display name input (how they want to appear publicly)
- Payout method radio: {PAYOUT_SA} (SA Bank) / {PAYOUT_INTL} (International)
- Payout details field (PayPal email OR bank account info — shown/hidden based on selection)
- Submit button

On submit: POST JSON to `/api/affiliate/register`. On 200: show "Application received!" with a link to the portal. On 409: show "You already have an affiliate account" with a portal link.

**If not logged in:** Show a "LOG IN TO APPLY" button that links to `/login?next=/affiliates`.

## Session Check Implementation
On page load, fetch `/api/me` (or your session endpoint). Use the response to show/hide the form vs login CTA. Also use `userId` from the session to pre-fill if needed.

## Recruiter Code Capture
On page load, check `new URLSearchParams(window.location.search).get('recruiter')`. If present, store it in `sessionStorage`. Include it in the registration API call:
```javascript
const recruiterCode = sessionStorage.getItem('recruiterCode');
// Include in POST /api/affiliate/register body: { ..., recruiterCode }
```
The API should resolve the recruiter code to a `recruited_by_id` and store it.
