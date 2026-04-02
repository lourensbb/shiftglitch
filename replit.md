# ShiftGlitch — Cyberpunk Study OS

## Overview
ShiftGlitch is a single-page cyberpunk-themed study platform designed for teenagers (13-19) to cultivate evidence-based learning practices and improve their study habits. It functions as a "study-methods OS," guiding users through a unique 5-rank progression system based on demonstrated learning behaviors rather than traditional experience points. Key features include a Pomodoro timer (Focus Governor), active recall tools (BrainDump.exe, Data Shards for flashcards), AI-powered study planning, Cornell notes, and detailed session statistics. The project aims to provide a structured, serious learning environment with a distinct cyberpunk aesthetic, supporting both offline functionality via `localStorage` and optional cloud synchronization with Firebase.

## User Preferences
Preferred communication style: Simple, everyday language.

### Product Philosophy
- ShiftGlitch is NOT a gamified productivity app or trivia game
- It is a structured, serious, cyberpunk-themed study-methods OS for teens
- One single authoritative progression spine: the 5-rank system
- Ranks are permanent and irreversible (earned once, never revoked)
- Progression is evidence-based, not XP-based — quality and consistency over volume
- No monetisation should affect rank or provide learning advantages
- Tasks #9–#10 (Leaderboard, Squad Mode) are planned for later phases

## System Architecture

### Frontend Architecture
The application is a single-page application (SPA) utilizing client-side routing. It features a cyberpunk-inspired visual identity with an AMOLED black background, neon green, corrupted magenta, and cyber purple accents. Typography uses VT323/Share Tech Mono for headers (ALL CAPS) and Space Grotesk for body text. Styling is managed with Tailwind CSS loaded via CDN, with `[class~="..."]` overrides for customization and `darkMode: 'class'` configured. Chart.js is used for data visualization, also loaded via CDN. The application defaults to dark mode upon first load.

### Backend Architecture
An Express.js v5 server manages authentication, session handling, static file serving, and acts as an API proxy for the Gemini API. All responses include `no-cache` headers.

**Authentication:** Replit Auth (OpenID Connect) is implemented using `openid-client` v6. Sessions are stored in a PostgreSQL database via `connect-pg-simple`. User data (id, email, names, profile image, timestamps) is `upserted` into a `users` table upon successful login.

**Data Storage:** Primary data persistence is achieved through `localStorage` for offline access, using the `sg_` prefix for all keys. A one-time migration routine runs on load to automatically convert any data stored under the old `synapse_` prefix, preserving existing user data. Optional cloud persistence is available via Firebase Firestore, designed for graceful degradation if unavailable. A JSON export/import feature supports local data backup and restoration. Backup files are named `shiftglitch-backup-<date>.json`.

### Key Features
- **AI Study Planning:** Gemini API-powered study plan generation using a BYOK (Bring Your Own Key) model for user-provided API keys stored client-side.
- **Rank System:** An evidence-based, 5-rank progression (NPC → Script Kiddie → Glitch Tech → Netrunner → System Admin) tied to specific learning behaviors.
- **Focus Governor (Pomodoro):** Timer with streak tracking, enforced breakdowns, and subject tagging.
- **Data Shards (Flashcards):** CRUD functionality with a Leitner 5-box spaced repetition system.
- **BrainDump.exe (Blurting):** A 4-phase active recall technique with session persistence.
- **Priority Grid (Eisenhower Matrix):** Interactive task prioritization tool.
- **Anti-Lag Protocol (Dopamine Recalibrator):** Anti-procrastination tools like Stealth Mode.
- **Jargon Decoder (Babel Fish/Feynman):** Tool for explaining concepts.
- **Yet Growth Shield:** Promotes a growth mindset by reframing learning gaps.
- **Exploit Missions (MCQ Diagnostics):** 100-question diagnostics across 5 missions, tracking knowledge gaps and contributing to rank.
- **Charts & Statistics:** Visualizations and metrics for study activity.
- **Data Management:** JSON export/import of user data (excluding Gemini key).
- **Squad Mode:** Async co-op groups of up to 4 users. Create or join with a 6-char invite code. Squad streak = minimum individual streak across all members — one weak link drops it. AFK roast message appears for members inactive 24+ hours. Members can leave; squad dissolves when all leave. Stats refresh on page open (no polling). Ping fires after every focus session.
- **Leaderboard:** Global Focus Score rankings backed by PostgreSQL. Users compete by gamertag (set in Settings). Score syncs after every Pomodoro session. Formula: (Pomodoros × 10) + (Streak × 25) + (Cards Mastered × 2) + (Blurts × 15). Top 50 shown; caller's row highlighted even if outside top 50.
- **Teacher Dashboard:** A separate interface (`teacher.html`) for classroom management, allowing teachers to import student data, view progress, and generate reports.
- **Teen-Focused Enhancements:** Includes a dark mode default, phone-lock nudges, "What I Learned?" prompts after Pomodoro sessions, an exam countdown widget, and a "Study Buddy System" for progress comparison.
- **Security:** `esc()` utility for XSS protection in user-rendered content.

### Key Design Decisions
- **CDN-based Dependencies:** No build system; frontend libraries are loaded via CDNs.
- **Firebase as Optional:** Core functionality relies on `localStorage`, with Firebase providing an optional cloud sync layer.
- **Monolithic HTML:** All frontend code resides in `index.html`.
- **BYOK (Bring Your Own Key):** Users manage their own Gemini API keys, stored locally and used for direct browser-to-Google API calls when present.
- **Evidence-based Progression:** Rank advancement is based on quality learning behaviors.
- **Quiz Isolation:** The Quiz Arena is a standalone feature and does not affect rank.

## External Dependencies

### NPM Packages
- `express v5.2.1`
- `openid-client v6` — OIDC auth with Replit
- `express-session v1.19` — server-side sessions
- `connect-pg-simple` — PostgreSQL session store
- `memoizee` — OIDC config discovery caching
- `passport` + `passport-openidconnect` (installed; auth uses openid-client directly instead)
- `pg` — raw PostgreSQL queries for user upsert

### CDN Dependencies (Frontend)
- Tailwind CSS
- Chart.js
- Firebase v11.6.1 (App, Auth, Firestore)

### External Services
- Gemini API (gemini-2.0-flash)
- Open Trivia Database
- Google Fonts
- PayFast (ZAR subscriptions, South Africa)
- PayPal (USD subscriptions, international)
- Resend (transactional email)

## Environment Variables (Replit Secrets)

| Variable | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | Yes | Resend API key for welcome emails |
| `RESEND_FROM_ADDRESS` | No | Sender address, e.g. `ShiftGlitch <admin@shiftglitch.com>` |
| `GEMINI_API_KEY` | No | Server-side Gemini API key (users can also BYOK) |
| `PAYFAST_MERCHANT_ID` | For PayFast | From PayFast merchant dashboard |
| `PAYFAST_MERCHANT_KEY` | For PayFast | From PayFast merchant dashboard |
| `PAYFAST_PASSPHRASE` | Required in prod | PayFast security passphrase (checkout blocked if missing in production) |
| `PAYFAST_SANDBOX` | No | Set `true` for PayFast sandbox testing |
| `PAYFAST_MONTHLY_ZAR` | No | Monthly Pro price in ZAR (default: `179.99`) |
| `PAYFAST_ANNUAL_ZAR` | No | Annual Pro price in ZAR (default: `1349.99`) |
| `PAYPAL_CLIENT_ID` | For PayPal | From PayPal developer dashboard |
| `PAYPAL_CLIENT_SECRET` | For PayPal | From PayPal developer dashboard |
| `PAYPAL_WEBHOOK_ID` | For PayPal | Webhook ID from PayPal dashboard (required for signature verification) |
| `PAYPAL_MONTHLY_PLAN_ID` | For PayPal | Monthly subscription plan ID from PayPal dashboard |
| `PAYPAL_ANNUAL_PLAN_ID` | For PayPal | Annual subscription plan ID from PayPal dashboard |
| `PAYPAL_SANDBOX` | No | Set `false` for live PayPal (default is sandbox) |

## Payment Webhook Setup

**PayFast:** Set notify URL to `https://<your-domain>/api/payfast-itn`

**PayPal:** Add webhook for `https://<your-domain>/api/paypal-webhook` in the PayPal developer dashboard. Subscribe to: `BILLING.SUBSCRIPTION.ACTIVATED`, `BILLING.SUBSCRIPTION.CANCELLED`, `BILLING.SUBSCRIPTION.EXPIRED`, `BILLING.SUBSCRIPTION.SUSPENDED`, `PAYMENT.SALE.REFUNDED`. Copy the Webhook ID into `PAYPAL_WEBHOOK_ID`.