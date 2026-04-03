# ShiftGlitch — Developer Reference

## Overview

ShiftGlitch is a full-stack, evidence-based study platform designed for teenagers (ages 13–19). It functions as a "study-methods operating system," guiding users through a rank progression system based on demonstrated learning behaviours rather than traditional experience points. The project provides a structured, serious learning environment with a distinctive cyberpunk aesthetic, supporting both offline functionality via `localStorage` and optional cloud synchronisation with Firebase.

Key features include: Pomodoro timer (Learning Governor), active recall tools (Blurting Method, Flashcard Decks with Leitner spaced repetition), AI-powered study planning (Mission Architect via Gemini), Cornell notes, MCQ diagnostics, Eisenhower Matrix, Dopamine Recalibrator, YET Growth Shield, Babel Fish Feynman Lab, Quiz Arena, global leaderboard, Squad Mode co-op groups, Teacher Dashboard, payment integration (PayFast + PayPal), and waitlist/email onboarding.

## User Preferences

Preferred communication style: Simple, everyday language.

## Product Philosophy

- ShiftGlitch is NOT a gamified productivity app or trivia game
- It is a structured, serious, cyberpunk-themed study-methods OS for teens
- One single authoritative progression spine: the 3-rank system (Space Cadet → Second Officer → Flight Commander)
- Ranks are permanent and irreversible (earned once, never revoked)
- Progression is evidence-based, not XP-based — quality and consistency over volume
- No monetisation should affect rank or provide learning advantages
- The free tier must be genuinely useful — core tools are always free

---

## System Architecture

### Frontend Architecture

The application is a single-page application (SPA) utilising client-side routing, contained entirely in `index.html` (~2,800 lines). Visual identity: AMOLED black background, neon green, corrupted magenta, and cyber purple accents. Typography: VT323/Share Tech Mono for headers, Space Grotesk for body text.

- **Styling:** Tailwind CSS loaded via CDN, with `darkMode: 'class'` configured. Dark mode is the default on first load.
- **Charts:** Chart.js via CDN — scatter (focus sessions), doughnut (technique distribution), bar (weekly activity).
- **Firebase:** Firebase v11.6.1 SDK loaded via CDN. Initialised only when `config.js` contains real credentials — silently falls back to offline mode if credentials are placeholders.
- **No build system:** No Webpack, Vite, TypeScript, or bundler.

### Backend Architecture

An Express.js v5 server (`server.js`) manages:
- Static file serving for all HTML, JS, CSS, and asset files
- Authentication via Replit Auth (OpenID Connect) via `auth.js`
- Server-side session management via `express-session` + `connect-pg-simple`
- Gemini API proxy for server-side key fallback
- REST API endpoints: leaderboard, squad, waitlist, stats, payments
- Security: `helmet` middleware (security headers), `express-rate-limit` (API protection)

**Authentication (`auth.js`):**
- Replit Auth (OpenID Connect) implemented using `openid-client` v6
- Sessions stored in PostgreSQL via `connect-pg-simple`
- User data (id, email, names, profile image, timestamps) is `upserted` into a `users` table upon successful login

**Data Storage:**
- Primary: `localStorage` for offline access, using the `sg_` prefix for all keys
- A one-time migration routine runs on load to convert any data under the old `synapse_` prefix
- Optional: Firebase Firestore (Cornell Notes and task checkboxes)
- Server-side: PostgreSQL (users, sessions, leaderboard, squads, waitlist, payment records)

---

## Key Features

### Core Study Tools (Free)
- **AI Study Planning (Mission Architect):** Gemini API-powered study plan generation. BYOK model for user-provided API keys stored client-side; server proxy fallback uses `GEMINI_API_KEY`.
- **Learning Governor (Pomodoro):** 25-minute timer with subject tagging, phone-lock nudge, governor blocking after 4 consecutive same-task sessions, "What I Learned?" modal on completion.
- **Flashcard Decks (Data Shards):** CRUD functionality with Leitner 5-box spaced repetition system. Visual orbit stability indicators. "Not Yet 🛡️" growth mindset button.
- **Blurting Method (BrainDump):** 4-phase active recall technique with session persistence.
- **Babel Fish Metaphor Lab (Feynman):** Plain-language explanation tool with optional doodle.
- **Eisenhower Matrix:** Interactive task prioritisation with reflection prompts.
- **Dopamine Recalibrator:** Anti-procrastination tools — Stealth Mode and Entry Rocket.
- **YET Growth Shield:** Growth mindset reframing — "I don't know X yet."
- **MCQ Diagnostics (Nav Check / Exploit Missions):** 100 questions across 5 missions covering learning science.
- **Cornell Notes:** Auto-saved, optional Firebase-synced notes panel on the dashboard.
- **Quiz Arena:** Open Trivia Database-powered trivia game (isolated from rank system).
- **Exam Countdown Widget:** Dashboard sidebar showing days until exams; red at ≤ 7 days.
- **Study Buddy System:** Base64-encoded rank+stats code for friend comparison.
- **Shareable Progress Report:** URL with encoded stats for parents/teachers.
- **Teacher Dashboard:** `/teacher` — class-wide data import, rank distribution, individual profiles, printable reports.
- **Stats & Charts:** Scatter, doughnut, and bar charts; WIL log; data management.

### Pro Features (Replit Auth Required)
- **Leaderboard:** Global Focus Score rankings backed by PostgreSQL. Formula: (Pomodoros × 10) + (Streak × 25) + (Cards Mastered × 2) + (Blurts × 15). Top 50 shown; caller's row highlighted.
- **Squad Mode:** Async co-op groups of up to 4 users with 6-char invite code. Squad streak = minimum individual streak. AFK roast after 24+ hours inactivity.

### Rank System
Three ranks: Space Cadet → Second Officer → Flight Commander.

| Evidence | Second Officer | Flight Commander |
|----------|--------------|----------------|
| Pomodoros | 15 | 50 |
| Blurts | 10 | 30 |
| Governor Breakdowns | 10 | 30 |
| Cards Advanced | 50 | 150 |
| Active Days | 7 | 21 |
| Diagnostics | 2 | 5 |

---

## Key Design Decisions

- **CDN-based Dependencies:** No build system; frontend libraries are loaded via CDNs.
- **Firebase as Optional:** Core functionality relies on `localStorage`, with Firebase as an optional cloud sync layer.
- **Monolithic HTML:** All frontend code resides in `index.html`. Intentional trade-off for deployment simplicity.
- **BYOK (Bring Your Own Key):** Users manage their own Gemini API keys, stored locally and used for direct browser-to-Google API calls when present.
- **Evidence-based Progression:** Rank advancement is based on quality learning behaviours.
- **Quiz Isolation:** The Quiz Arena is standalone and does not affect rank.
- **Security:** `esc()` utility for XSS protection in all user-rendered content. `helmet` for security headers. `express-rate-limit` for API protection.

---

## External Dependencies

### NPM Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | v5.2.1 | HTTP server framework |
| `openid-client` | v6 | OIDC auth with Replit |
| `express-session` | v1.19 | Server-side session management |
| `connect-pg-simple` | latest | PostgreSQL session store |
| `memoizee` | latest | OIDC config discovery caching |
| `passport` | latest | Installed; auth uses openid-client directly |
| `passport-openidconnect` | latest | Installed; auth uses openid-client directly |
| `pg` | latest | Raw PostgreSQL queries |
| `helmet` | latest | Security headers |
| `express-rate-limit` | latest | API rate limiting |

### CDN Dependencies (Frontend)

- Tailwind CSS
- Chart.js
- Firebase v11.6.1 (App, Auth, Firestore)

### External Services

| Service | Purpose |
|---------|---------|
| Google Gemini API (gemini-2.0-flash) | AI study plan generation |
| Open Trivia Database | Quiz Arena questions (free, no key) |
| Google Fonts | Typography (Inter, Lora) |
| Firebase Firestore | Optional cross-device sync |
| Replit Auth (OIDC) | User authentication |
| PayFast | ZAR payment processing |
| PayPal | International payment processing |
| Resend | Transactional email (waitlist welcome) |

---

## Payment Model

Three one-time purchase packs (no subscriptions, no auto-renewal) via PayFast (ZAR):

| Pack | Price | Duration |
|------|-------|---------|
| 1 Month | R99 | 30 days Pro |
| 3 Months | R249 | 90 days Pro |
| 12 Months | R799 | 365 days Pro |

PayFast "Pay Now" forms post directly to `https://payment.payfast.io/eng/process`. The logged-in user's ID is injected into `custom_str1` by client-side JS before submission. The ITN handler at `/api/payfast-itn` reads `custom_str1` to identify which user to upgrade and sets `pro_expires_at` in the DB.

---

## Database Schema (PostgreSQL)

| Table | Purpose |
|-------|---------|
| `users` | User profile, gamertag, and `pro_expires_at` |
| `sessions` | Express session storage (managed by `connect-pg-simple`) |
| `leaderboard` | Focus Score rankings per user |
| `squads` | Squad records with invite codes and streak |
| `squad_members` | Squad membership and last ping timestamps |
| `waitlist` | Email and gamertag for pre-launch signups |
| `page_views` | Page view counts for analytics |

---

## Environment Variables (Replit Secrets)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (auto-set by Replit Database integration) |
| `SESSION_SECRET` | Yes | Secret for signing session cookies |
| `REPL_ID` | Yes (auto) | Replit environment ID — used for OIDC configuration |
| `ISSUER_URL` | Yes (auto) | Replit OIDC issuer URL |
| `REPLIT_DOMAINS` | Yes (auto) | Allowed domains for redirect URI |
| `RESEND_API_KEY` | No | Resend API key for welcome emails |
| `RESEND_FROM_ADDRESS` | No | Sender address, e.g. `ShiftGlitch <admin@shiftglitch.com>` |
| `GEMINI_API_KEY` | No | Server-side Gemini API key (users can also BYOK) |
| `PAYFAST_MERCHANT_ID` | Payments | From PayFast merchant dashboard |
| `PAYFAST_MERCHANT_KEY` | Payments | From PayFast merchant dashboard |
| `PAYFAST_PASSPHRASE` | Payments | PayFast Salt Passphrase from Account Info tab |
| `PAYFAST_SANDBOX` | No | Set `true` to point ITN validation at sandbox.payfast.co.za |
| `PORT` | No | Server port (default: 5000) |

---

## Payment Webhook Setup

**PayFast ITN:** `https://shiftglitch.replit.app/api/payfast-itn`
- Validates with PayFast's `/eng/query/validate` endpoint
- Reads `custom_str1` for user ID, matches amount to pack, sets `pro_expires_at`

---

## How to Start the Project

```bash
npm install
node server.js
```

The server starts on port 5000. In Replit, use the "Start application" workflow which runs `node server.js`.

---

## Active Integrations

| Integration | Purpose | Status |
|-------------|---------|--------|
| Replit Auth (javascript_log_in_with_replit) | User authentication via OpenID Connect | Installed and active |
| PostgreSQL (javascript_database) | Database for users, sessions, leaderboard, squads, payments | Installed and active |
| Firebase Firestore | Optional cross-device sync for Cornell Notes | Configured via `config.js` (optional) |
| Resend | Transactional email | Active when `RESEND_API_KEY` is set |
| PayFast | ZAR payment processing | Active when merchant credentials are set |

---

## localStorage Keys Reference

| Key | Owner | Purpose | Exported? |
|-----|-------|---------|-----------|
| `sg_decks` | Flashcard Decks | Deck metadata | Yes |
| `sg_cards` | Flashcard Decks | Card content + Leitner positions | Yes |
| `sg_pomodoro_log` | Learning Governor | Session log | Yes |
| `sg_blurt` | Blurting Method | Session records | Yes |
| `synapse_todos` | Dashboard | Mission task checklist | Yes |
| `sg_eisenhower` | Eisenhower Matrix | Tasks + reflections | Yes |
| `sg_recal` | Dopamine Recalibrator | Session counts | Yes |
| `sg_babel` | Babel Fish | Feynman exercises | Yes |
| `sg_yet` | YET Growth Shield | Growth moments log | Yes |
| `sg_rank` | Rank System | Rank + all evidence counters | Yes |
| `sg_mcq` | MCQ Diagnostics | Attempts, scores, gaps | Yes |
| `sg_exams` | Exam Countdown | Upcoming exam entries | Yes |
| `sg_wil` | Learning Governor | "What I Learned?" entries | Yes |
| `sg_theme` | App-wide | Dark/light preference | Yes |
| `sg_gemini_key` | Settings | User's Gemini API key | **No** |
| `cornellNotes` | Dashboard | Cornell Notes HTML (legacy key) | Yes |

---

## Planned Future Development

Four major development phases are planned. Full specifications are in `.local/tasks/`:

1. **SYSTEM INTERRUPT Engine** (`gamification-engine.md`) — Dramatic overlay event system, achievement badges, Warden interrupt channel, Recall Sprint and Pattern Lock challenge interrupts.
2. **Repeatable Escape Run System** (`repeatable-escape-plan.md`) — Named knowledge domain runs with 6 ordered exploits, Domain Clearance badges, reset-and-repeat mechanic, Snakes and Ladders shortcut/rollback system.
3. **10 New Cognitive Exploit Modules** (`new-study-modules.md`) — Memory Palace, Mind Map Protocol, Chunking Engine, Speed Run, Mistake Vault, Teach It, Dual Coding Station, The Interleave, Concept Mapper, Shadow Protocol.
4. **The Warden + Non-Linear Progression** (`warden-and-progression.md`) — Warden character with 40+ message library, Snakes (Memory Wipe, Clearance Strip, Warden's Trap), Ladders (Performance Shortcut, Consistency Ladder, Hidden Access Nodes), Operative Status Board.
