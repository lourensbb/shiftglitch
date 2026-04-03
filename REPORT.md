# ShiftGlitch — Full App Report & Technical Reference

*Definitive reference document covering the current state of the app, the complete architecture, module and data inventory, API routes, payment integrations, authentication flow, third-party services, and a full step-by-step user guide.*

*Last updated: April 2026 — verified against index.html, server.js, and auth.js source*

---

## Table of Contents

1. [App Status](#1-app-status)
2. [Architecture Overview](#2-architecture-overview)
3. [Module Inventory](#3-module-inventory)
4. [localStorage Data Inventory](#4-localstorage-data-inventory)
5. [Rank System Reference](#5-rank-system-reference)
6. [MCQ Diagnostics Inventory](#6-mcq-diagnostics-inventory)
7. [Authentication Flow](#7-authentication-flow)
8. [Payment Integrations](#8-payment-integrations)
9. [Third-Party Services](#9-third-party-services)
10. [API Endpoints](#10-api-endpoints)
11. [Database Schema](#11-database-schema)
12. [Settings & Configuration](#12-settings--configuration)
13. [Data Management](#13-data-management)
14. [New User Guide](#14-new-user-guide)
15. [Teacher Usage Guide](#15-teacher-usage-guide)
16. [File Inventory](#16-file-inventory)
17. [Environment Variables](#17-environment-variables)
18. [Deployment Notes](#18-deployment-notes)

---

## 1. App Status

### Overview

| Field | Value |
|-------|-------|
| **App name** | ShiftGlitch — Interactive Learning OS |
| **Version** | Current build (April 2026) |
| **Status** | Live and deployed on Replit |
| **Primary URL** | Production deployment URL set at publish time via Replit Deployments |
| **Demo URL** | `/demo` — limited feature preview (no rank, no auth) |
| **Teacher Dashboard** | `/teacher` — separate page for classroom use |
| **Landing page** | `/` — public marketing and waitlist page |
| **Pricing page** | `/pricing` — Free / Pro / School tier comparison |
| **Login** | `/login` — Replit Auth entry point |
| **App (authenticated)** | `/app` — full student application |
| **Tech stack** | Express.js v5, Tailwind CSS, Chart.js, Firebase v11.6.1 (optional), Google Gemini API |
| **Data storage** | Browser localStorage (primary); Firebase Firestore (optional cloud sync); PostgreSQL (auth, sessions, leaderboard, squad, payments) |

### Browser Requirements

- **Recommended:** Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- **Minimum:** Any browser with ES2020 support and localStorage enabled
- **Not supported:** Internet Explorer (any version)
- **Mobile:** Fully functional on iOS Safari and Android Chrome
- **JavaScript:** Must be enabled

### Known Limitations

| Limitation | Detail |
|-----------|--------|
| **Data is device-bound** | All study data lives in the browser's localStorage. Clearing browser data wipes all progress. Firebase sync is available but optional. |
| **AI requires API key** | The Mission Architect AI feature requires a Google Gemini API key (user's own, or the server operator's). |
| **Charts require internet** | Charts are rendered by Chart.js, loaded via CDN. No internet connection means no charts (the rest of the app works offline). |
| **Export is manual** | Backing up data requires the user to manually click Export. There is no automatic backup. |
| **cornell-Notes key** | The Cornell Notes data is stored under the legacy key `cornellNotes` (no `sg_` prefix). This key is intentionally preserved to avoid wiping existing notes. |
| **Squad Mode requires auth** | Squad features and the leaderboard require a Replit account and a logged-in session. |

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                             │
│                                                                      │
│   index.html (SPA)          teacher.html        landing.html         │
│   ├─ Tailwind CSS (CDN)     ├─ Standalone        ├─ SEO metadata     │
│   ├─ Chart.js (CDN)         └─ No auth needed    └─ Waitlist form    │
│   ├─ Firebase SDK (CDN)                                              │
│   └─ localStorage (primary data store)                               │
│                                                                      │
│   Optional cloud sync ──────────────────────────────────────────┐   │
│                                                                  │   │
└──────────────────────────────────────────────────────────────────┼───┘
                                                                   │
          ┌────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│           server.js (Express v5)        │
│                                         │
│   auth.js ── OpenID Connect (Replit)    │
│   ├─ Session management                 │
│   ├─ PostgreSQL user upsert             │
│   ├─ /api/waitlist  (POST)              │
│   ├─ /api/stats     (GET)               │
│   ├─ /api/gemini    (POST)              │
│   ├─ /api/leaderboard (GET/POST)        │
│   ├─ /api/squad     (GET/POST)          │
│   ├─ /api/payfast-itn (POST)            │
│   └─ Static file serving               │
└─────────────────────────────────────────┘
          │             │             │
          ▼             ▼             ▼
   ┌────────────┐ ┌──────────┐ ┌──────────────┐
   │ PostgreSQL │ │ Firebase │ │ External APIs│
   │            │ │ Firestore│ │              │
   │ users      │ │ (optional│ │ Gemini API   │
   │ sessions   │ │ Cornell  │ │ PayFast ITN  │
   │ leaderboard│ │ Notes +  │ │ Open Trivia  │
   │ squads     │ │ checkbox │ │ Resend Email │
   │ waitlist   │ │ sync)    │ │              │
   │ payments   │ └──────────┘ └──────────────┘
   └────────────┘
```

### Frontend Architecture

The application is a single-page application (SPA) utilising client-side routing. All navigation is handled via JavaScript without full page reloads. The SPA shows/hides panels based on a `currentSection` state variable and URL hash routing.

- **Styling:** Tailwind CSS loaded via CDN, with `darkMode: 'class'` configured. Custom overrides use `[class~="..."]` selectors. Dark mode is the default on first load.
- **Charts:** Chart.js loaded via CDN. Three chart types in use: scatter (focus sessions), doughnut (technique distribution), bar (weekly activity).
- **Firebase:** Firebase SDK loaded via CDN. Initialised only when `config.js` contains real credentials — silently falls back to offline mode if credentials are placeholders.
- **No build system:** No Webpack, Vite, TypeScript, or bundler. The entire frontend is a single HTML file (~2,800 lines).

### Backend Architecture

An Express.js v5 server handles:
- Static file serving for all HTML, JS, CSS, and asset files
- Authentication via Replit Auth (OpenID Connect) through the `auth.js` module
- Server-side session management via `express-session` + `connect-pg-simple`
- Gemini API proxy for server-side key fallback
- REST API endpoints for leaderboard, squad, waitlist, stats, and payments

---

## 3. Module Inventory

### Dashboard (Mission Control)

| Field | Detail |
|-------|--------|
| **Route** | `dashboard` (authenticated: `/app`) |
| **What it does** | The home screen. Displays a rotating motivational quote, the Mission Architect AI panel, Cornell Notes panel, exam countdown sidebar widget, and mission task checklist. |
| **Data stored** | Cornell notes (`cornellNotes`), exam countdowns (`sg_exams`), mission tasks (`synapse_todos`) |
| **Rank contribution** | None directly |

**Subfeatures:**
- **Mission Architect (AI):** Enter a topic or goal; the AI generates a structured study plan. Requires a Gemini API key.
- **Cornell Notes:** A live, editable dotted-grid notes panel. Content is auto-saved as HTML to `cornellNotes` in localStorage. Optional cloud sync via Firebase.
- **Mission Tasks:** Checkbox-driven task list, saved to `synapse_todos`.
- **Exam Countdown Widget (sidebar):** Add an exam name and date; widget shows days remaining. Turns red when ≤ 7 days remain.

---

### Vault (Knowledge Base)

| Field | Detail |
|-------|--------|
| **Route** | `explore` |
| **What it does** | A curated reference section presenting evidence-based study strategies with explanations. Also includes a "Teen Q&A" panel with common study-method questions answered. |
| **Data stored** | None (read-only content). |
| **Rank contribution** | None. |

---

### Flashcard Decks

| Field | Detail |
|-------|--------|
| **Route** | `decks` |
| **What it does** | Full flashcard management. Create multiple named decks. Within each deck, create cards (front/back). Study mode uses the Leitner 5-box spaced repetition system with visual orbit stability indicators. |
| **Data stored** | Deck metadata → `sg_decks`. All card content and Leitner box positions → `sg_cards`. |
| **Rank contribution** | Yes — cards advancing through Leitner boxes count as rank evidence (`cardsAdvanced`). |

**Study mode controls:**
- **Again** — card returns to Box 1 (most frequent review)
- **Not Yet 🛡️** — treats the same as "Again" but triggers a YET Growth Shield mindset reframe
- **Got It** — card advances to the next box (up to Box 5 = mastered)

**Leitner Box system:**

| Box | Meaning | Review frequency |
|-----|---------|-----------------|
| Box 1 | Just learned / struggling | Most frequent |
| Box 2 | Some familiarity | Frequent |
| Box 3 | Building confidence | Moderate |
| Box 4 | Nearly mastered | Infrequent |
| Box 5 | Fully mastered | Rare |

---

### Learning Governor (Pomodoro Timer)

| Field | Detail |
|-------|--------|
| **Route** | Accessible from the dashboard |
| **What it does** | A Pomodoro-style focus timer. Duration is fixed at 25 minutes (work) / 5 minutes (break). The learner selects a subject tag and starts the session. A circular progress ring counts down. Phone-lock nudge fires on start. A "What I Learned?" modal appears at session end. After 4 consecutive sessions on the same task, the Governor blocks further sessions and requires the learner to break down the task or switch. |
| **Data stored** | Completed sessions appended to `sg_pomodoro_log`. WIL entries saved to `sg_wil`. |
| **Rank contribution** | Yes — each completed session counts as one `pomodorosCompleted`. Each deliberate governor breakdown counts as one `governorBreakdowns`. |

**Subject tags available:** Maths, English, Science, History, Geography, Languages, Art, Other.

**Features during a session:**
- Study Music link (opens YouTube lofi playlist in new tab)
- Phone-lock nudge notification on session start
- Pause and resume capability
- "What I Learned?" modal appears automatically on session completion

---

### Blurting Method

| Field | Detail |
|-------|--------|
| **Route** | `blurt` |
| **What it does** | A guided 4-phase active recall exercise. Phase 1: write everything you know from memory. Phase 2: read your notes. Phase 3: blurt again (capture what you missed). Phase 4: compare with your notes. |
| **Data stored** | Completed blurt sessions saved to `sg_blurt`. |
| **Rank contribution** | Yes — each completed session counts as one `blurtsCompleted`. |

---

### Babel Fish Metaphor Lab (Feynman Technique)

| Field | Detail |
|-------|--------|
| **Route** | `babel` |
| **What it does** | Feynman Technique implementation. Choose a concept, write a plain-language explanation as if teaching it to a 10-year-old, and optionally sketch a "stupid doodle." Exercises are saved and viewable. |
| **Data stored** | Completed exercises saved to `sg_babel`. |
| **Rank contribution** | No direct contribution to rank counters, but builds learning depth. |

---

### Quiz Arena

| Field | Detail |
|-------|--------|
| **Route** | `quiz` |
| **What it does** | A standalone trivia game using the Open Trivia Database API. Choose a category, difficulty, and number of questions. Timed answers with a visual countdown ring. Score tracked per session. |
| **Data stored** | None persisted to localStorage. Quiz history is session-only. |
| **Rank contribution** | **None.** Deliberately isolated from the rank system to maintain integrity. |

---

### Eisenhower Matrix

| Field | Detail |
|-------|--------|
| **Route** | `matrix` |
| **What it does** | An interactive task prioritisation tool. Add tasks and drag/sort them into four quadrants: Do (urgent + important), Schedule (important, not urgent), Delegate (urgent, not important), and Eliminate (neither). Each quadrant has a reflection prompt. |
| **Data stored** | All tasks and quadrant assignments saved to `sg_eisenhower`. |
| **Rank contribution** | None. |

---

### Dopamine Recalibrator

| Field | Detail |
|-------|--------|
| **Route** | `recal` |
| **What it does** | Anti-procrastination tools. **Stealth Mode** breaks a session into tiny, non-threatening micro-tasks to reduce the psychological weight of starting. **Entry Rocket** provides a high-energy motivational launch sequence for getting into study mode quickly. |
| **Data stored** | Session usage counts saved to `sg_recal`. |
| **Rank contribution** | None. |

---

### Nav Check (MCQ Diagnostics)

| Field | Detail |
|-------|--------|
| **Route** | `diagnostic` |
| **What it does** | A 100-question multiple-choice diagnostic across 5 themed missions, each with 20 questions. Tests knowledge of the learning science that underpins ShiftGlitch's tools. Tracks attempts, scores, and knowledge gaps. Provides reflection prompts for incorrect answers. |
| **Data stored** | All attempt history, scores, and identified knowledge gaps saved to `sg_mcq`. |
| **Rank contribution** | Yes — each completed mission counts as one `diagnosticsCompleted`. |

---

### YET Growth Shield

| Field | Detail |
|-------|--------|
| **Route** | `yet` (or triggered contextually via flashcard "Not Yet" button) |
| **What it does** | Growth mindset reframing tool. When a learner acknowledges not knowing something, it reframes the moment: "I don't understand X" becomes "I don't understand X YET." Saves growth moments to a log. |
| **Data stored** | Growth moments saved to `sg_yet`. |
| **Rank contribution** | None directly. |

---

### Rank Page

| Field | Detail |
|-------|--------|
| **Route** | `rank` |
| **What it does** | Displays the learner's current rank, progress bars showing evidence toward the next rank, and all six evidence counters. Also hosts the Study Buddy system and Shareable Progress Report tools. |
| **Data stored** | Rank level and all evidence counters saved to `sg_rank`. Buddy codes and shared report URLs are generated on demand and not stored. |
| **Rank contribution** | This page reads rank data; it does not generate it. |

**Study Buddy:** Generate a compact base64 code containing your rank and stats. Share it with a friend. Paste their code to see a side-by-side comparison.

**Shareable Progress Report:** Generates a URL containing encoded stats. When anyone opens that URL, they see an orange banner displaying the student's rank and evidence summary.

---

### Stats

| Field | Detail |
|-------|--------|
| **Route** | `stats` |
| **What it does** | Detailed session statistics and charts. Focus time scatter plot, activity bar chart, technique usage doughnut chart, and a session log. Also contains the Data Management controls. |
| **Data stored** | Reads from all modules. No new data written here. |
| **Rank contribution** | None. |

---

### Leaderboard

| Field | Detail |
|-------|--------|
| **Route** | `leaderboard` |
| **Auth required** | Yes — Replit account required |
| **What it does** | Global Focus Score rankings backed by PostgreSQL. Users compete by gamertag (set in Settings). Top 50 shown; caller's row highlighted even if outside top 50. Score syncs automatically after every Pomodoro session. |
| **Score formula** | (Pomodoros × 10) + (Streak × 25) + (Cards Mastered × 2) + (Blurts × 15) |
| **Data stored** | In PostgreSQL `leaderboard` table, not localStorage. |

---

### Squad Mode

| Field | Detail |
|-------|--------|
| **Route** | `squad` |
| **Auth required** | Yes — Replit account required |
| **What it does** | Async co-op groups of up to 4 users. Create or join with a 6-character invite code. Squad streak = minimum individual streak across all members — one weak link drops it. AFK roast message appears for members inactive 24+ hours. Members can leave; squad dissolves when all leave. Stats refresh on page open (no polling). Ping fires after every focus session. |
| **Data stored** | In PostgreSQL `squads` and `squad_members` tables. |

---

### Settings

| Field | Detail |
|-------|--------|
| **Route** | `settings` |
| **What it does** | Manage the Gemini API key (paste, save, view masked, remove), gamertag (for leaderboard), and theme toggle. Firebase connection status shown. Step-by-step API key setup instructions included. |
| **Data stored** | Gemini API key → `sg_gemini_key`. Theme preference → `sg_theme`. |

---

## 4. localStorage Data Inventory

All study data is stored in the browser's localStorage. Clearing browser data or using a different browser or device loses all data (unless Firebase sync is active).

**Total keys:** 16 (15 using the `sg_` prefix + 1 legacy key)

| Key | Owner module | Exact schema | Written when | Read when | Exported? |
|-----|-------------|-------------|-------------|-----------|-----------|
| `sg_decks` | Flashcard Decks | JSON array: `{ id, title, createdAt }` | On deck create or delete | Decks page loads; stats render | Yes |
| `sg_cards` | Flashcard Decks | JSON array: `{ id, deckId, front, back, box, nextReview, createdAt }` | On card create, edit, delete, or review (box/nextReview updated) | Deck opened for browsing or study | Yes |
| `sg_pomodoro_log` | Learning Governor | JSON array: `{ task, completedAt, duration }` — `task` is the normalised subject label; breakdown entries use `task: '__breakdown__'` with no `duration` | On session complete; on governor breakdown | Stats render; rank evidence calculated on app load | Yes |
| `sg_blurt` | Blurting Method | JSON array: `{ id, title, source, recall, gaps, reviewCount, createdAt, updatedAt }` | On each phase save and on session complete | Blurt history renders; rank evidence calculated | Yes |
| `synapse_todos` | Dashboard (Cornell) | JSON array: `{ id, text, done }` | Adding, toggling, or deleting a mission task | Dashboard renders | Yes |
| `sg_eisenhower` | Eisenhower Matrix | JSON object: `{ tasks: [{ id, text, quadrant, createdAt, completed?, completedAt? }], reflections: [{ text, createdAt }] }` — quadrant 0 = unsorted, 1–4 = the four matrix quadrants | Adding/moving/completing/deleting tasks; adding a reflection | Matrix page renders | Yes |
| `sg_recal` | Dopamine Recalibrator | JSON object: `{ sessions: [{ type, date }], stealthCount, rocketCount }` — `type` is `'stealth'` or `'rocket'` | On each Stealth Mode or Entry Rocket activation | Recalibrator page renders | Yes |
| `sg_babel` | Babel Fish | JSON array: `{ id, concept, explanation, doodle, createdAt, hasBadge }` | Saving a completed Feynman exercise | Babel Fish history section loads | Yes |
| `sg_yet` | YET Growth Shield | JSON array: `{ concept, date }` | Logging a YET moment (via "Not Yet 🛡️" button or direct YET page) | YET page renders | Yes |
| `sg_rank` | Rank System | JSON object: `{ rank, rankEvidence: { blurtsCompleted, governorBreakdowns, cardsAdvanced, activeDays, pomodorosCompleted, diagnosticsCompleted, lastActiveDate, activeDateLog } }` | Any rank-contributing action; active day logged; promotion occurs | App boot; Rank page renders; nav bar rank badge updates | Yes |
| `sg_mcq` | MCQ Diagnostics | JSON object: `{ attempts: { [missionIdx]: [{ answers, correct, total, date }] }, gaps: string[], reflections: { [missionIdx]: string } }` — `missionIdx` is 0-based (0–4) | On mission submit; when a gap concept is identified; when a reflection is saved | Diagnostic page renders; rank evidence calculated | Yes |
| `sg_exams` | Exam Countdown | JSON array: `{ id, label, date }` — `label` = exam name; `date` = ISO date string (sorted ascending) | Adding or removing an exam | Dashboard sidebar widget renders | Yes |
| `sg_wil` | Learning Governor | JSON array: `{ entry, subject, date }` — `entry` = the one-sentence learning; `subject` = subject tag from the timer; `date` = ISO timestamp | Saving a "What I Learned?" modal entry | Stats → WIL log section renders | Yes |
| `sg_theme` | App-wide | String: `"dark"` or `"light"` | Toggling the moon/sun icon in the nav bar | On app init — `dark` class toggled on `document.body` during app startup | Yes |
| `sg_gemini_key` | Settings | String: plain API key text | Saving the key in Settings | Before every Gemini API call | **No — excluded for security** |
| `cornellNotes` | Dashboard (Cornell) | HTML string: serialised `innerHTML` of the Cornell Notes `contenteditable` div | Auto-saved as the user types in the notes panel | Dashboard renders; Cornell Notes panel content populated | Yes |

**Notes:**
- `sg_gemini_key` is excluded from all exports. It must be re-entered on any new browser or device.
- `cornellNotes` has no `sg_` prefix — this is a legacy key retained intentionally to avoid wiping existing user notes.
- `sg_pomodoro_log` entries where `task === '__breakdown__'` are deliberate break events (counted toward rank as `governorBreakdowns`), not study sessions.
- `sg_rank.rankEvidence.activeDateLog` is an array of ISO date strings (`YYYY-MM-DD`) representing every unique day the user has been active.
- `sg_eisenhower` quadrant values: 0 = unsorted, 1 = Urgent & Important (Do), 2 = Important Not Urgent (Schedule), 3 = Urgent Not Important (Delegate), 4 = Not Urgent Not Important (Eliminate).

---

## 5. Rank System Reference

The rank system is the core progression spine. Promotion is permanent — once earned, a rank cannot be lost. Advancement requires demonstrated consistency across multiple study methods, not just one.

### The Three Ranks

| Rank | Starting condition |
|------|--------------------|
| **Space Cadet** | Default — all new users begin here |
| **Second Officer** | Earned by meeting all six criteria below |
| **Flight Commander** | Earned by meeting all six higher criteria below |

### Promotion Requirements

| Evidence type | Second Officer | Flight Commander |
|--------------|---------------|-----------------|
| Pomodoro sessions completed | 15 | 50 |
| Blurt sessions completed | 10 | 30 |
| Governor breakdowns taken | 10 | 30 |
| Flashcard advances (cards moved to higher Leitner boxes) | 50 | 150 |
| Active study days | 7 | 21 |
| MCQ Diagnostic missions completed | 2 | 5 |

**Important:** All six criteria must be met simultaneously. Meeting five out of six is not sufficient.

### Evidence Tracking

The `sg_rank` localStorage key stores all six evidence counters alongside the current rank level. The Rank page displays each counter with a progress bar showing how close the learner is to their next promotion.

---

## 6. MCQ Diagnostics Inventory

The Nav Check (MCQ Diagnostics) consists of five missions, each containing 20 multiple-choice questions.

| Mission | Name | Subtitle | Topic Area | Questions |
|---------|------|----------|-----------|-----------|
| 1 | The Launchpad | Crisis & Brain Science | Neuroplasticity, memory formation, the forgetting curve, cortisol and stress, focused/diffuse thinking modes, active recall vs. passive rereading | 20 |
| 2 | Navigation Systems | Study Methods | Pomodoro Technique, Cornell Notes, Feynman Method, Leitner spaced repetition, interleaving, dual coding, SQ3R, THIEVES, elaborative interrogation, mind mapping | 20 |
| 3 | Galactic Engineers | Thinkers & Habits | Deep Work (Cal Newport), habit stacking (James Clear), cognitive load theory, Eisenhower Matrix, Pareto Principle, GTD system, identity-based habits, Zeigarnik Effect | 20 |
| 4 | Avoid the Black Holes | Systems & Tactics | Procrastination, backward planning, focus zones, the External Device Rule, weekly review, ABCDE prioritisation, mock testing, shutdown rules, batching, MoSCoW method | 20 |
| 5 | Life Support & Hero State | Wellbeing & Mastery | Sleep and memory consolidation, box breathing, anxiety reappraisal, nutrition for cognitive performance, growth mindset, exercise and learning, identity-based success, the Yet Game | 20 |

**Access:** All missions are visible and accessible at any time — there is no sequential lock.

**Scoring:** Each attempt is recorded with the score and individual answers. Knowledge gaps (topics with incorrect answers) are saved and highlighted. Missions can be retried.

**Rank contribution:** `diagnosticsCompleted` is incremented once per mission submission (including retries).

---

## 7. Authentication Flow

ShiftGlitch uses Replit Auth (OpenID Connect) for user authentication.

### Flow

1. User visits `/login` and clicks "Log In with Replit"
2. Browser is redirected to Replit's OAuth authorisation endpoint
3. User approves access on Replit's consent screen
4. Replit redirects back to `/auth/callback` with an authorisation code
5. The server exchanges the code for an ID token using `openid-client` v6
6. The ID token is verified and the user's profile is extracted (id, email, name, profile image)
7. User record is `upserted` into the PostgreSQL `users` table (created if new, updated if returning)
8. A server-side session is created via `express-session` and stored in PostgreSQL via `connect-pg-simple`
9. User is redirected to `/app`

### Session Storage

Sessions are stored in the `sessions` table in PostgreSQL. Session data includes the user's Replit ID and profile information. The session cookie is HTTP-only and secure.

### Protected Routes

Routes that require authentication check for a valid session on every request. If no valid session exists, the user is redirected to `/login`.

**Protected routes:** `/app`, `/api/leaderboard`, `/api/leaderboard/sync`, `/api/settings/gamertag`, `/api/squad`

**Public routes:** `/`, `/demo`, `/teacher`, `/waitlist`, `/pricing`, `/login`, `/api/waitlist`, `/api/stats`, `/api/gemini`, `/api/payfast-itn`

---

## 8. Payment Integrations

### PayFast (South African Rand — ZAR)

PayFast handles South African rand transactions. Three one-time purchase packs are available (no subscriptions, no auto-renewal):

| Pack | Price | Duration |
|------|-------|---------|
| 1 Month | R99 | 30 days Pro |
| 3 Months | R249 | 90 days Pro |
| 12 Months | R799 | 365 days Pro |

**How it works:**
1. The logged-in user's Replit ID is injected into the `custom_str1` field by client-side JavaScript before form submission
2. The "Pay Now" form posts directly to `https://payment.payfast.io/eng/process`
3. PayFast processes the payment and sends an Instant Transaction Notification (ITN) to the server
4. The ITN handler at `/api/payfast-itn` validates the notification with PayFast's validation endpoint
5. If valid, the server reads `custom_str1` to identify the user, matches the `amount_gross` to the correct pack, and sets `pro_expires_at` in the PostgreSQL `users` table

**ITN validation:** The server validates the ITN by re-posting the received parameters to `https://www.payfast.co.za/eng/query/validate` (or sandbox equivalent). Only `VALID` responses result in a database update.

**Merchant credentials:** `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, and `PAYFAST_PASSPHRASE` are required environment variables. Set `PAYFAST_SANDBOX=true` to point validation at `sandbox.payfast.co.za`.

### PayPal (International — USD)

PayPal handles international (non-ZAR) transactions. Implementation uses PayPal standard checkout buttons embedded on the pricing page. PayPal webhook handling is implemented for IPN (Instant Payment Notification) similarly to PayFast.

---

## 9. Third-Party Services

| Service | Purpose | Key required? | Where key is stored |
|---------|---------|--------------|---------------------|
| **Replit Auth** | User authentication (OpenID Connect) | No — uses Replit's built-in OIDC | Automatically handled by Replit environment |
| **PostgreSQL** | Sessions, users, leaderboard, squads, waitlist, payments | No — connection string auto-set by Replit | `DATABASE_URL` environment variable |
| **Firebase Firestore** | Optional cloud sync for Cornell Notes and task checkboxes | Yes — Firebase project credentials | `config.js` in project root |
| **Google Gemini API** | AI study plan generation in Mission Architect | Yes — user's own key (BYOK) or server operator's key | `sg_gemini_key` in localStorage (user) or `GEMINI_API_KEY` env var (server) |
| **Resend** | Transactional emails — welcome email on waitlist signup | Yes | `RESEND_API_KEY` environment variable |
| **PayFast** | South African payment processing | Yes — merchant ID, key, and passphrase | `PAYFAST_*` environment variables |
| **PayPal** | International payment processing | Yes | Environment variables |
| **Open Trivia Database** | Question pool for the Quiz Arena | No — public API | N/A |
| **Google Fonts** | Typography (Inter, Lora) | No | CDN |

---

## 10. API Endpoints

### Public Endpoints (No Auth Required)

| Route | Method | Description |
|-------|--------|-------------|
| `/` | GET | Landing page (`landing.html`) |
| `/waitlist` | GET | Waitlist signup page |
| `/pricing` | GET | Pricing page |
| `/demo` | GET | Limited demo (`demo.html`) |
| `/teacher` | GET | Teacher Dashboard (`teacher.html`) |
| `/login` | GET | Login page |
| `/auth/callback` | GET | Replit OAuth callback |
| `/api/waitlist` | POST | Save waitlist lead + send welcome email via Resend. Rate limited: 10 requests per 15 minutes per IP. Body: `{ gamertag, email }`. |
| `/api/stats` | GET | Returns page view counts and waitlist size as JSON. |
| `/api/gemini` | POST | Proxy to Google Gemini API using server-side key. Body: `{ prompt }`. Returns AI-generated text. Used only when no user BYOK key is set. |
| `/api/payfast-itn` | POST | PayFast Instant Transaction Notification handler. Validates with PayFast and updates `pro_expires_at` in the database. |

### Authenticated Endpoints (Replit Auth Session Required)

| Route | Method | Description |
|-------|--------|-------------|
| `/app` | GET | Full student application (`index.html`) |
| `/api/leaderboard` | GET | Returns the top 50 global Focus Score rankings plus the caller's row. |
| `/api/leaderboard/sync` | POST | Updates the caller's leaderboard row with current focus stats. Rate limited: 20 requests per 15 minutes per user. Body: `{ pomodoroCount, streak, cardsMastered, blurtCount }`. |
| `/api/settings/gamertag` | GET | Returns the caller's current gamertag. |
| `/api/settings/gamertag` | POST | Updates the caller's gamertag. Body: `{ gamertag }`. |
| `/api/squad` | GET | Returns the caller's current squad status, members, and streak. |
| `/api/squad` | POST | Create a new squad or join an existing squad by invite code. Body: `{ action: 'create' \| 'join', inviteCode? }`. |
| `/api/squad/leave` | POST | Leave the caller's current squad. Dissolves the squad if all members leave. |

---

## 11. Database Schema

### `users` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PRIMARY KEY | Replit user ID |
| `email` | TEXT | User email from Replit profile |
| `first_name` | TEXT | First name from Replit profile |
| `last_name` | TEXT | Last name from Replit profile |
| `profile_image_url` | TEXT | Profile image URL from Replit |
| `gamertag` | TEXT | User-set display name for leaderboard |
| `pro_expires_at` | TIMESTAMPTZ | Pro subscription expiry timestamp (null = free tier) |
| `created_at` | TIMESTAMPTZ | When the user first logged in |
| `updated_at` | TIMESTAMPTZ | Last profile update |

### `sessions` table

Managed automatically by `connect-pg-simple`. Stores serialised session data keyed by session ID. Session TTL is managed by the session configuration.

### `leaderboard` table

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | TEXT PRIMARY KEY | Foreign key → `users.id` |
| `gamertag` | TEXT | Display name (denormalised for fast reads) |
| `focus_score` | INTEGER | Calculated score: (Pomodoros × 10) + (Streak × 25) + (Cards Mastered × 2) + (Blurts × 15) |
| `pomodoro_count` | INTEGER | Total Pomodoro sessions completed |
| `streak` | INTEGER | Current daily streak |
| `cards_mastered` | INTEGER | Total cards at Box 5 |
| `blurt_count` | INTEGER | Total blurt sessions completed |
| `updated_at` | TIMESTAMPTZ | Last sync timestamp |

### `squads` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Squad ID |
| `invite_code` | TEXT UNIQUE | 6-character invite code |
| `squad_streak` | INTEGER | Minimum individual streak across all members |
| `created_at` | TIMESTAMPTZ | Squad creation timestamp |

### `squad_members` table

| Column | Type | Description |
|--------|------|-------------|
| `squad_id` | INTEGER | Foreign key → `squads.id` |
| `user_id` | TEXT | Foreign key → `users.id` |
| `joined_at` | TIMESTAMPTZ | When the user joined the squad |
| `last_ping_at` | TIMESTAMPTZ | Last focus session ping timestamp |

### `waitlist` table

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Entry ID |
| `gamertag` | TEXT | Self-reported gamertag |
| `email` | TEXT UNIQUE | Email address |
| `created_at` | TIMESTAMPTZ | Signup timestamp |

### `page_views` table

| Column | Type | Description |
|--------|------|-------------|
| `page` | TEXT PRIMARY KEY | Page identifier (e.g., `home`, `waitlist`, `pricing`, `demo`, `teacher`) |
| `count` | INTEGER | Cumulative view count |

---

## 12. Settings & Configuration

### Gemini API Key (AI Study Planning)

The Mission Architect uses Google's Gemini AI. The key is stored in your browser only and never sent to any external server other than Google's own.

**To set up your key:**
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with any Google account
3. Click "Create API Key"
4. Open ShiftGlitch, click the gear icon in the navigation bar
5. Paste your key into the API key field and click Save

**To remove your key:** Click "Remove Key" in Settings. The key is immediately deleted from localStorage.

### Theme (Dark / Light Mode)

The app launches in dark mode by default on first use. The current theme is saved permanently to `sg_theme`.

To toggle: click the moon icon in the navigation bar.

### Gamertag (Leaderboard Display Name)

Set in Settings. Used on the global leaderboard and in squad display. Requires a logged-in Replit account.

### Firebase Cloud Sync (Optional)

Firebase sync enables the Cornell Notes and progress checkboxes to sync across multiple devices.

**To configure Firebase:**
1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project
2. In **Project Settings → Your apps**, click the web icon (`</>`)
3. Register an app name and copy the config values
4. Open `config.js` and replace the placeholder values
5. In Firebase Console → **Authentication** → enable **Anonymous** sign-in
6. In Firebase Console → **Firestore Database** → create a database (start in test mode)
7. Restart the server and reload ShiftGlitch

Without `config.js` configured with real credentials, the app runs silently in offline-only mode.

---

## 13. Data Management

All data management controls are in **Stats → Data Management**.

### Export Your Data (Full Backup)

Click **"Export All Data"**. A JSON file downloads to your device. Import this file on any device to restore your data.

**What is included:** All 15 `sg_*` localStorage keys + `cornellNotes`.

**What is excluded:** `sg_gemini_key` (API key, never exported for security).

### Import Data

Click **"Import Data"** and select a previously exported JSON file. This overwrites your current data with the imported data.

**Warning:** Importing replaces all current data. Export your current data first if you want to preserve it.

### Export for Teacher

Click **"Export for Teacher"**. You will be prompted to enter your name. A JSON file downloads with your name embedded in the file — designed for classroom data collection.

### Clear All Data

Click **"Clear All Data"** to wipe all localStorage study data and reset the app to a blank state. This is irreversible. The Gemini key is also cleared.

---

## 14. New User Guide

### Getting Started in 5 Minutes

When you first open ShiftGlitch, you are a Space Cadet — the starting rank. Everything on the screen is accessible immediately. No sign-up is required to use the core tools.

### Starting a Pomodoro Session

1. On the **Mission** page, find the **Learning Governor** panel.
2. Select a subject from the dropdown (e.g., "Maths").
3. Click **Start Session**.
4. The circular timer counts down 25 minutes. Put your phone face-down when prompted.
5. Work on your chosen subject for the full session.
6. When the timer ends, a prompt will ask: "What did you learn?" Write one sentence and save it.
7. This counts as one Pomodoro toward your rank.

### Creating Flashcard Decks

1. Click **Decks** in the navigation bar.
2. Click **"New Deck"** and give it a name (e.g., "Biology — Cell Structure").
3. Click **"Add Card"**.
4. Type the question or term on the **front**, and the answer or definition on the **back**.
5. Click **"Save"**. Repeat until you have at least 10 cards.

**To study your deck:**
1. Click **"Study"** on any deck.
2. A card appears. Try to recall the answer mentally before flipping it.
3. Click the card to flip it and see the answer.
4. Choose your response:
   - **Again** — you got it wrong or blank. Card returns to Box 1.
   - **Not Yet 🛡️** — you could not remember, but you want a growth mindset moment.
   - **Got It** — you got it right. Card advances to the next Leitner box.

### Trying the Blurting Method

1. Click **Tools → Blurt** in the navigation.
2. Enter the **topic** you are studying (e.g., "The Water Cycle").
3. Click **Start Blurting**.
4. **Phase 1 — List:** Write down everything you already know. Do not open your notes yet.
5. **Phase 2 — Read:** Open and read through your notes carefully.
6. **Phase 3 — Blurt:** Close your notes. Write down everything again.
7. **Phase 4 — Compare:** Compare what you wrote to your notes. The gaps are your real knowledge gaps.
8. Click **Complete** to save the session. This counts as one blurt toward your rank.

### Using the AI Study Planner

*Requires a Gemini API key. See Settings & Configuration, section 12.*

1. On the **Mission** page, find the **Mission Architect** panel.
2. Type a description of what you want to study.
3. Click **Generate Plan**.
4. The AI creates a personalised, structured study plan.

### Reading Your Rank Page

1. Click **Rank** in the navigation bar.
2. You will see your current rank (Space Cadet to start).
3. Below it are **six progress bars** showing your rank evidence.
4. When all six bars reach the required thresholds, you are promoted automatically.

**Second Officer thresholds:** 15 Pomodoros, 10 blurts, 10 breakdowns, 50 card advances, 7 active days, 2 diagnostics.

**Flight Commander thresholds:** 50 Pomodoros, 30 blurts, 30 breakdowns, 150 card advances, 21 active days, 5 diagnostics.

### Adding an Exam Countdown

1. On the **Mission** page, find the **Exam Countdown** widget in the right sidebar.
2. Click **"Add Exam"**.
3. Enter the name and date of the exam.
4. The widget shows how many days remain. When fewer than 7 days remain, the count turns red.

### Sharing Your Progress

**With a friend (Study Buddy):**
1. Go to the **Rank** page and click **"Generate Buddy Code"**.
2. Send the code to a friend. Ask them to paste it on their Rank page.
3. They will see a side-by-side comparison of stats.

**With a parent or teacher:**
1. Go to the **Rank** page and click **"Share Progress"**.
2. A URL is generated. Send the URL to a parent or teacher.
3. When they open it, they see a clear summary of your rank and evidence.

### Useful Tips for New Users

- **Study every day, even briefly.** Active days require using the app on different calendar days.
- **Use multiple tools.** The rank system requires evidence across all six categories.
- **Blurt regularly.** Blurting is the highest-value technique for most subjects.
- **Export your data regularly.** Go to Stats → Data Management and export a backup every few weeks.
- **Do the Nav Check missions.** They contribute to rank and teach you the science behind why these tools work.

---

## 15. Teacher Usage Guide

### Overview

Teachers collect progress data from their students and view it in the Teacher Dashboard (`/teacher`). No accounts or setup are required — just a browser.

### Step 1: Have Students Export Their Data

1. Students open ShiftGlitch in their browser.
2. Students click **Stats** in the navigation bar.
3. Students scroll to the **Data Management** section.
4. Students click the orange **"Export for Teacher"** button.
5. Students type their first and last name when prompted.
6. A `.json` file downloads to their device.
7. Students send this file to the teacher by email, shared folder, messaging app, or USB.

### Step 2: Open the Teacher Dashboard

Navigate to `/teacher` on your ShiftGlitch URL (e.g., `https://your-url.replit.app/teacher`).

### Step 3: Import Student Files

Drag all student `.json` files into the drag-and-drop zone at once, or click to browse and select them. The dashboard loads automatically.

### Step 4: Reading the Class Overview

After importing, you will see:

**Summary cards** (top row): Total students loaded, average focus sessions, average focus time, highest rank achieved.

**Student Roster:** A sortable table showing each student's rank, session count, focus time, flashcard count, blurt count, and active days.

**Rank Distribution Chart:** A doughnut chart showing how many students are at each rank level.

**Class Activity Chart:** A bar chart comparing total focus sessions across students.

**Students Needing Attention:** Automatically flagged students with fewer than 5 focus sessions or zero blurt sessions.

### Step 5: Viewing Individual Student Profiles

Click **"View"** next to any student in the roster. You will see their current rank, key stats, and rank evidence progress bars showing exactly where they stand toward their next rank across all six criteria.

### Step 6: Printing Progress Reports

**For a single student:**
1. From the class overview, click **"Print"** next to a student's name in the roster.
2. A printer-friendly report opens in a new tab.
3. Print to paper or save as PDF.

**For the whole class:**
1. Click **"Print Class Report"** in the top navigation bar of the Teacher Dashboard.

Reports are formatted professionally for parent-teacher conferences, record-keeping, and class performance reviews.

### Tips for Teachers

- **Establish a data collection routine.** Set a "Export Friday" routine — students export and send their files every Friday.
- **Use progress reports for parent-teacher meetings.** Use rank evidence bars to show parents specifically what their child needs to work on.
- **Celebrate rank promotions.** Space Cadet → Second Officer is achievable within a few weeks of consistent use. Flight Commander is a genuine, significant achievement.
- **Motivate struggling students.** The "Students Needing Attention" section surfaces students with minimal activity — common interventions include helping them create their first deck or walking them through the blurting method.

---

## 16. File Inventory

| File | Size (approx.) | Purpose |
|------|---------------|---------|
| `index.html` | ~2,840 lines | The complete student-facing SPA. All app logic, rendering, and state management in a single file. |
| `landing.html` | ~450 lines | Public landing page — boot animation, product sections, SEO metadata, waitlist CTA. |
| `pricing.html` | ~300 lines | Pricing page — Free / Pro / School tiers with feature comparison, FAQ, and PayFast/PayPal checkout forms. |
| `waitlist.html` | ~200 lines | Waitlist signup — captures gamertag + email, sends welcome email via Resend. |
| `demo.html` | ~2,000 lines | Limited demo version — same visual structure, reduced features. No rank progression. |
| `teacher.html` | ~590 lines | Teacher Dashboard — standalone page for classroom reporting. |
| `login.html` | ~100 lines | Login page — Replit Auth entry point. |
| `server.js` | ~300 lines | Express v5 server: all routes, analytics tracking, email, API endpoints, payment ITN handling. |
| `auth.js` | ~200 lines | Authentication, session management, PostgreSQL schema creation, data helpers. |
| `config.js` | ~10 lines | Firebase credentials. Edit this file to enable Firebase. |
| `config.example.js` | ~20 lines | Blank template for `config.js`. |
| `package.json` | ~20 lines | Node.js project manifest and dependencies. |
| `robots.txt` | ~15 lines | Search engine crawl instructions. |
| `sitemap.xml` | ~20 lines | XML sitemap for all public pages. |
| `README.md` | — | Comprehensive product and setup guide. |
| `REPORT.md` | — | This document — full app report and technical reference. |
| `JOURNAL.md` | — | Design philosophy and full product story. |
| `PLANNING_EBOOK.md` | — | Readable product roadmap for planned future development phases. |
| `MARKETING_PLAN.md` | — | Comprehensive go-to-market strategy, SEO plan, channel strategy, and pricing rationale. |
| `replit.md` | — | Technical architecture overview, environment variable reference, and developer notes. |
| `revamp_vision.md` | — | Long-form vision document for the next generation of the product. |

---

## 17. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (auto-set by Replit Database integration) |
| `REPL_ID` | Yes | Replit environment identifier (auto-set by Replit) — used for OIDC configuration |
| `ISSUER_URL` | Yes | Replit OIDC issuer URL (auto-set by Replit Auth integration) |
| `REPLIT_DOMAINS` | Yes | Allowed domains for CORS and redirect URI (auto-set by Replit) |
| `SESSION_SECRET` | Yes | Secret for signing session cookies. Set in Replit Secrets. |
| `RESEND_API_KEY` | No | Resend API key for welcome emails on waitlist signup |
| `RESEND_FROM_ADDRESS` | No | Sender address, e.g. `ShiftGlitch <admin@shiftglitch.com>` |
| `GEMINI_API_KEY` | No | Server-side Gemini API key (users can also BYOK) |
| `PAYFAST_MERCHANT_ID` | Required for payments | From PayFast merchant dashboard |
| `PAYFAST_MERCHANT_KEY` | Required for payments | From PayFast merchant dashboard |
| `PAYFAST_PASSPHRASE` | Required for payments | PayFast Salt Passphrase from Account Info tab |
| `PAYFAST_SANDBOX` | No | Set `true` to point ITN validation at sandbox.payfast.co.za |
| `PORT` | No | Server port (default: 5000) |

---

## 18. Deployment Notes

### On Replit (Recommended)

The workflow command `node server.js` starts the server. The app is available at the Replit development and deployment URLs. All environment variables are set via Replit Secrets. The `DATABASE_URL` is automatically set by the Replit Database integration.

```bash
node server.js
```

### Local Development

```bash
npm install
node server.js
```

Open `http://localhost:5000` in your browser. Note that Replit Auth will not work in local development — it requires a Replit environment with the correct `REPL_ID` and `ISSUER_URL` variables.

### Static Hosting (No Server)

Host `index.html`, `teacher.html`, `demo.html`, and `config.js` on any static web host (Netlify, Vercel, GitHub Pages). The following will not work without the Express server:

- Replit Auth and user accounts
- Leaderboard and Squad Mode
- Server-side Gemini API proxy (BYOK still works — users enter their own key)
- PayFast ITN handling

The core student study tools, rank progression, flashcards, blurting, MCQ diagnostics, and teacher dashboard all function correctly as static files.

### NPM Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | v5.2.1 | HTTP server framework — static file serving and API proxy |
| `openid-client` | v6 | OIDC auth with Replit |
| `express-session` | v1.19 | Server-side session management |
| `connect-pg-simple` | latest | PostgreSQL session store |
| `memoizee` | latest | OIDC config discovery caching |
| `passport` | latest | Installed; auth uses openid-client directly |
| `passport-openidconnect` | latest | Installed; auth uses openid-client directly |
| `pg` | latest | Raw PostgreSQL queries for user upsert |
| `helmet` | latest | Security headers (X-Frame-Options, HSTS, etc.) |
| `express-rate-limit` | latest | Rate limiting on waitlist and checkout endpoints |

---

*ShiftGlitch — Interactive Learning OS*
*REPORT.md — Full App Report & Technical Reference*
*Current as of April 2026.*
