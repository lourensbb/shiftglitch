# AFFILIATE SYSTEM BUILDING KIT
### A complete, production-ready affiliate programme you can deploy to any web app

---

## What This Kit Is

A fully scoped, 7-agent task system for building a professional affiliate programme from scratch. Written generically so any Replit agent can adapt it to any app, payment processor, or tech stack.

Every plan, email template, SQL schema, marketing copy block, and code pattern is included. An agent can read this kit once and have everything they need to build without guessing.

---

## What Gets Built

| Layer | What it does |
|---|---|
| Database | 4 tables: affiliates, commissions, clicks, surge events |
| Payment tracking | Referral cookie → checkout → ITN/webhook → commission queue |
| API | Register, stats, leaderboard, admin approve/pay, surge trigger |
| Tier system | 3-rank progression with automatic commission rate upgrades |
| Promo codes | Backup tracking for cookieless environments |
| Two-sided discount | Referred buyers get 10% off; affiliate earns on net sale |
| Emails | Application, approval, instant sale alert, 5-email drip, surge blast |
| Public page | Recruitment page with commission table, FAQ, leaderboard |
| Portal page | Affiliate dashboard: stats, tiers, earnings chart, marketing kit |
| Marketing kit | Platform captions, video scripts, UTM builder, brand notes |
| Admin panel | Approve/suspend affiliates, mark commissions paid, fire surge campaigns |
| Recruiter card | Dynamic SVG badge affiliates can share on social media |

---

## Variable Reference

Replace every `{PLACEHOLDER}` across all files before handing to an agent.

| Placeholder | Description | Example |
|---|---|---|
| `{APP_NAME}` | Your app's name | ShiftGlitch |
| `{APP_URL}` | Production URL (no trailing slash) | https://myapp.replit.app |
| `{APP_TAGLINE}` | One-line value proposition | Master anything in half the time |
| `{CURRENCY_CODE}` | ISO currency code | ZAR |
| `{CURRENCY_SYMBOL}` | Currency symbol | R |
| `{PRODUCT_NAME}` | The thing affiliates are selling | Pro Subscription |
| `{PACK_1_PRICE}` | Lowest tier price | 99 |
| `{PACK_1_LABEL}` | Lowest tier label | 1 Month Pro |
| `{PACK_2_PRICE}` | Mid tier price | 249 |
| `{PACK_2_LABEL}` | Mid tier label | 3 Months Pro |
| `{PACK_3_PRICE}` | Top tier price | 799 |
| `{PACK_3_LABEL}` | Top tier label | 12 Months Pro |
| `{COMMISSION_RATE}` | Base commission % | 15 |
| `{COMMISSION_TIER_2_RATE}` | Mid-tier commission % | 20 |
| `{COMMISSION_TIER_3_RATE}` | Top-tier commission % | 25 |
| `{COMMISSION_TIER_2_SALES}` | Sales needed for tier 2 | 5 |
| `{COMMISSION_TIER_3_SALES}` | Sales needed for tier 3 | 10 |
| `{HOLD_DAYS}` | Days before commission is payable | 30 |
| `{PAYMENT_PROCESSOR}` | Payment gateway used | PayFast |
| `{ITN_FIELD}` | Custom field name for affiliate code | custom_str2 |
| `{COOKIE_NAME}` | Referral tracking cookie name | sg_ref |
| `{RANK_1}` | Lowest affiliate rank name | Recruit |
| `{RANK_2}` | Mid affiliate rank name | Operative |
| `{RANK_3}` | Top affiliate rank name | Ghost |
| `{EMAIL_FROM}` | Sending email address | hello@myapp.com |
| `{EMAIL_PROVIDER}` | Email API used | Resend |
| `{ADMIN_USER_ID}` | Admin's user ID (env var name) | ADMIN_USER_ID |
| `{SUPPORT_EMAIL}` | Support contact | support@myapp.com |
| `{PAYOUT_SA}` | SA payout method | Ozow |
| `{PAYOUT_INTL}` | International payout method | PayPal |
| `{DB_TYPE}` | Database type | PostgreSQL |

---

## Prerequisites

The target app must already have:
- [ ] Node.js / Express (or equivalent)
- [ ] PostgreSQL (or adapt SQL to your DB)
- [ ] A payment processor that echoes custom fields in webhook callbacks
- [ ] A transactional email API (Resend, SendGrid, Postmark, etc.)
- [ ] Session-based or JWT authentication
- [ ] A `users` table with at minimum: `id`, `email`, `username/gamertag`

If any of these are missing, complete them before starting this kit.

---

## How to Use This Kit

### For a single agent
Hand the agent all 7 task files plus this README and SCHEMA_SQL.md. The agent works through tasks in dependency order (Task 1 → 2 → 3/4/5 in parallel → 6/7 in parallel).

### For 7 parallel agents
1. Accept Task 1. Do not start any other task until Task 1 is merged.
2. After Task 1 merges: start Tasks 2 simultaneously. Do not start 3, 4, or 5 until Task 2 merges.
3. After Task 2 merges: start Tasks 3, 4, and 5 simultaneously.
4. After Task 3 merges: start Task 6.
5. After Task 4 merges: start Task 7.

```
Task 1 (DB + Plumbing)
    └── Task 2 (API Routes)
            ├── Task 3 (Tiers + Discounts)
            │       └── Task 6 (Affiliate Portal)
            ├── Task 4 (Email Flows)
            │       └── Task 7 (Admin Panel)
            └── Task 5 (Public Page)
```

---

## Files in This Kit

| File | Purpose |
|---|---|
| `README.md` | This file — overview, variables, dependency map |
| `ADVERTISING_BRIEF.md` | Full strategic marketing brief + 10 growth enhancements |
| `SCHEMA_SQL.md` | Complete PostgreSQL DDL for all affiliate tables |
| `TASK_01_DB_SCHEMA.md` | DB tables + core payment plumbing |
| `TASK_02_API_ROUTES.md` | All affiliate API endpoints |
| `TASK_03_TIERS_DISCOUNTS.md` | Rank tiers, promo codes, two-sided discount |
| `TASK_04_EMAIL_FLOWS.md` | All email sequences and notifications |
| `TASK_05_PUBLIC_PAGE.md` | Public recruitment page |
| `TASK_06_PORTAL.md` | Affiliate dashboard + marketing kit |
| `TASK_07_ADMIN.md` | Admin panel + surge campaigns + recruiter card |
| `MARKETING_COPY_TEMPLATES.md` | Ready-to-use social media copy + video scripts |
