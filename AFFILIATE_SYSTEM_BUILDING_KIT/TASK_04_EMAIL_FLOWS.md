# TASK 04 — Email Flows & Sale Notifications
**Dependency:** Task 02 must be merged first.
**Touches:** New file `affiliate-emails.js` (all email logic) + two wiring calls in existing files.

---

## What & Why
Every key affiliate moment gets an email. This task creates a standalone email module that other tasks import. Keeps all email HTML in one place, matching your app's existing email design system.

## Done looks like
- `affiliate-emails.js` exports all email functions listed below.
- `affiliate_email_queue` table is used for the 5-email onboarding drip (created in Task 1 schema).
- A 15-minute scheduler processes due drip emails (separate from any existing drip schedulers).
- All emails send from `{EMAIL_FROM}` via `{EMAIL_PROVIDER}`.
- All functions are no-op safe: if no API key is configured, they log a warning and return silently.

## Out of scope
- In-app notifications (emails only in this task).
- SMS or push notifications.
- Unsubscribe management (include a placeholder unsubscribe link in each email footer).

## Email Functions to Export

### `sendAffiliateApplicationEmail(affiliateEmail, displayName)`
**Trigger:** Immediately after successful registration  
**Subject:** `// APPLICATION RECEIVED — {APP_NAME} Affiliate Programme`  
**Body:**
- Confirms receipt of their application
- States review within 48 hours
- Sets expectations: "You'll receive your unique link and starter kit once approved"
- Includes support email for questions

### `sendAffiliateApprovalEmail(affiliateEmail, displayName, code, promoCode)`
**Trigger:** When admin approves the affiliate  
**Subject:** `// CLEARANCE GRANTED — You're live`  
**Body:**
- Confirms active status
- Shows their unique referral URL: `{APP_URL}/?ref={code}`
- Shows their promo code
- Links to affiliate portal
- Brief "first post idea" tip
- Support email

### `sendAffiliateSaleNotificationEmail(affiliateEmail, displayName, commissionAmount, packName, newSalesCount, tier, nextTierAt)`
**Trigger:** Immediately when a commission is queued (payment confirmed)  
**Subject:** `// COMMISSION INCOMING — {CURRENCY_SYMBOL}{commissionAmount} queued`  
**Body:**
- Which product was sold (pack name only — never buyer identity)
- Commission amount
- Current total paid all time
- Current tier and progress to next tier: "X more sales to {RANK_2} ({COMMISSION_TIER_2_RATE}% commission)"
- Link to affiliate portal

### `sendAffiliateSurgeBlastEmail(affiliateEmail, displayName, bonusMultiplier, endsAt, message)`
**Trigger:** When admin fires a surge campaign (sent to all active affiliates)  
**Subject:** `// SURGE EVENT — ${bonusMultiplier}× commissions for ${hours}h`  
**Body:**
- Surge details (multiplier, exact end time with timezone)
- Custom admin message
- A ready-to-post caption (use Template A from `MARKETING_COPY_TEMPLATES.md`, inject their referral URL)
- Link to portal to check stats

### `startAffiliateEmailDrip(affiliateId)`
**Trigger:** When admin approves an affiliate  
**Action:** Inserts 5 rows into `affiliate_email_queue`:

| Day | Template Name | Scheduled For |
|---|---|---|
| 0 | `drip_day0` | NOW() |
| 2 | `drip_day2` | NOW() + 2 days |
| 5 | `drip_day5` | NOW() + 5 days |
| 10 | `drip_day10` | NOW() + 10 days |
| 20 | `drip_day20` | NOW() + 20 days |

## Drip Email Content

### `drip_day0` — "You're live — first post idea"
**Subject:** `// OPERATIVE LIVE — Here's your first move`
- Referral link reminder
- One specific ready-to-post caption for the platform most relevant to your app's audience
- "Check your portal tomorrow to see your first clicks"

### `drip_day2` — "What content converts best"
**Subject:** `// INTEL REPORT — What actually converts`
- 3 content formats ranked by affiliate conversion rate (based on industry data):
  1. Personal story + product reveal ("I used this and here's what happened")
  2. Tutorial/how-to with product as the tool
  3. "Here's what I use" recommendation
- Encourage them to pick one format and commit to it

### `drip_day5` — "Story vs feed — where to put your link"
**Subject:** `// LINK PLACEMENT — Where to put it`
- Platform-specific advice on link placement:
  - Instagram: bio only (not stories, stories expire)
  - TikTok: bio + pinned comment
  - YouTube: first line of description
  - Twitter/X: first reply to your own post
  - LinkedIn: in the post body (not just as a link)
- Promo code reminder for platforms where links don't work well

### `drip_day10` — "Check your stats"
**Subject:** `// STATS BRIEF — What your numbers mean`
- Explain what click-through rate means for their niche
- If 0 clicks: suggests they haven't posted yet (encourages first post)
- If clicks but 0 sales: explains typical conversion rate (1-3%) and that it's a numbers game
- Link to portal

### `drip_day20` — "You're X sales from {RANK_2}"
**Subject:** `// RANK UPDATE — ${COMMISSION_TIER_2_SALES - currentSales} more sales to {RANK_2}`
- Personalise with their current sales count
- Remind them {RANK_2} unlocks {COMMISSION_TIER_2_RATE}% commission
- Suggest posting a "recruiter card" to social media (link to their card URL)
- "You've got this" motivational close

## Drip Scheduler
Add a `setInterval` every 15 minutes (alongside your existing email schedulers):

```javascript
async function processAffiliateDripQueue() {
  const due = await getDueAffiliateEmails(); // from DB module
  for (const row of due) {
    const affiliate = await getAffiliateById(row.affiliate_id);
    if (!affiliate) continue;
    await sendDripEmail(affiliate, row.template, row.metadata);
    await markAffiliateEmailSent(row.id);
  }
}
setInterval(processAffiliateDripQueue, 15 * 60 * 1000);
setTimeout(processAffiliateDripQueue, 15 * 1000); // warm-up
```

## DB Helpers to Add to Your DB Module

- `getDueAffiliateEmails()` → `SELECT * FROM affiliate_email_queue WHERE sent_at IS NULL AND scheduled_for <= NOW()`
- `markAffiliateEmailSent(id)` → `UPDATE affiliate_email_queue SET sent_at = NOW() WHERE id = $1`
- `getAffiliateById(affiliateId)` → full affiliate row
- `scheduleAffiliateEmail(affiliateId, template, scheduledFor)` → insert row
- `getAllActiveAffiliateEmails()` → `SELECT email, display_name FROM affiliates WHERE status = 'active'`

## Email HTML Design Rules
Match your app's existing transactional email style exactly:
- Same background colour, accent colours, and font choices as your existing emails
- Table-based layout (not CSS Grid/Flex — email client compatibility)
- All styles inline (not in `<style>` blocks)
- Test with both light and dark email clients
- Never use `noreply@` addresses — use `{EMAIL_FROM}` which can receive replies

## Wiring Calls
Once this module exists, add these two calls in `affiliates-api.js`:
1. In `POST /api/affiliate/register` success path: call `sendAffiliateApplicationEmail(...)` (fire and forget).
2. In `POST /admin/affiliates/:id/approve` success path: call `sendAffiliateApprovalEmail(...)` + `startAffiliateEmailDrip(affiliateId)` (fire and forget).

Add this call in the payment webhook (Task 1's Step 6):
3. After `queueAffiliateCommission` returns a commission row: call `sendAffiliateSaleNotificationEmail(...)` (fire and forget, wrapped in try/catch).
