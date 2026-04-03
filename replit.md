# ShiftGlitch — Developer Reference

## Overview

ShiftGlitch is a cyberpunk cognitive adventure platform by Lourens Breytenbach. Players are "jacked into the Mainframe" and master learning techniques as "exploits." It is a full-stack, evidence-based study platform that functions as a study-methods operating system — guiding users through a 5-rank progression system based on demonstrated learning behaviours.

**Critical language rule:** Zero school/exam/teacher/homework language anywhere in the UI or docs. Use "knowledge domains" not "subjects."

Key features: Learning Governor (Pomodoro), Flashcard Decks (Leitner), Blurting Method (BrainDump), MCQ Diagnostics (Boss Fights), 10 Cognitive Exploit Modules (CEM), Repeatable Escape Run system, System Interrupt engine, The Warden + Snakes & Ladders progression, Leaderboard, Squad Mode, PayFast ZAR payments, Resend email, PostgreSQL + Replit Auth.

---

## User Preferences

Preferred communication style: Simple, everyday language.

---

## Product Philosophy

- ShiftGlitch is a structured, cyberpunk-themed study-methods OS
- One authoritative progression spine: 5-rank system (NPC → Script Kiddie → Glitch Tech → Netrunner → System Admin)
- Ranks are earned by behaviour, not time or purchases
- Zero school/exam/teacher/homework language anywhere
- The free tier must be genuinely useful — core tools always free
- Monetisation never affects rank or provides learning advantages

---

## System Architecture

### Frontend Architecture

Single-page application (SPA) contained in `index.html` (~7,200 lines). Client-side routing. AMOLED black background (#000), neon green (#39FF14), magenta (#FF00FF), purple (#8A2BE2), orange (#FF8800). VT323/Share Tech Mono for headers, Space Grotesk for body text.

- **Styling:** Tailwind CSS via CDN (`darkMode: 'class'`). Dark mode always-on.
- **Charts:** Chart.js via CDN.
- **No Firebase.** No Gemini. No build system. No Webpack/Vite/TypeScript.

### Backend Architecture

Express.js v5 server (`server.js`):
- Static file serving
- Replit Auth (OpenID Connect) via `auth.js`
- Session management via `express-session` + `connect-pg-simple`
- REST API: leaderboard, squad, waitlist, stats, PayFast ITN, escape runs
- Security: `helmet` middleware, `express-rate-limit`

**Authentication (`auth.js`):**
- Replit Auth (OIDC) via `openid-client` v6
- Sessions in PostgreSQL via `connect-pg-simple`
- User data upserted into `users` table on login

**Data Storage:**
- Primary: `localStorage` for all study data (offline-first), `sg_` key prefix
- Server-side: PostgreSQL (users, sessions, leaderboard, squads, escape_runs)

---

## Key Features

### The 5-Rank Progression System

| Rank | Icon | Meaning |
|------|------|---------|
| NPC | ◈ | Starting rank — the system controls you |
| Script Kiddie | ◉ | You've learned some tricks |
| Glitch Tech | ⬡ | You understand how the system works |
| Netrunner | ◬ | Deep inside the system |
| System Admin | ✦ | You own the Mainframe |

**Rank Requirements:**

| Evidence | Script Kiddie | Glitch Tech | Netrunner | System Admin |
|----------|--------------|-------------|-----------|--------------|
| Pomodoros | 15 | 40 | 80 | 150 |
| Blurts | 10 | 25 | 50 | 100 |
| Governor Breakdowns | 10 | 20 | 40 | 75 |
| Cards Advanced | 50 | 120 | 250 | 500 |
| Active Days | 7 | 20 | 40 | 75 |
| Diagnostics | 2 | 5 | 10 | 20 |

Promotion is evidence-based. `checkPromotion()` runs after every activity. `rollbackPenalty > 0` blocks promotion. Consistency Ladder bonus reduces thresholds by 10% (cleared after rank-up).

---

### Core Study Tools (All Free)

- **Learning Governor (Pomodoro):** 25-min focus timer, knowledge domain tagging, governor blocking after 4 consecutive same-domain sessions, "What I Learned?" modal on completion. Sessions counted as `pomodorosCompleted` rank evidence.
- **Flashcard Decks (Data Shards):** Leitner 5-box spaced repetition. `cardsAdvanced` rank evidence on box promotion. Not-Yet button with YET Growth Shield reframe.
- **Blurting Method (BrainDump):** 4-phase active recall. Each completed session = `blurtsCompleted` evidence.
- **MCQ Diagnostics (Boss Fights):** 100 questions / 5 missions covering learning science. Each submission = `diagnosticsCompleted` evidence.
- **Babel Fish Metaphor Lab:** Feynman technique — plain-language explanation + optional doodle.
- **Eisenhower Matrix:** Task prioritisation with reflection prompts.
- **Dopamine Recalibrator:** Stealth Mode + Entry Rocket anti-procrastination tools.
- **YET Growth Shield:** Growth mindset reframing log.
- **Stats & Charts:** Scatter, doughnut, bar charts; WIL log; data export/import/teacher-export.

### Leaderboard & Squad (Login Required)

- **Leaderboard:** Global Focus Score rankings in PostgreSQL. Formula: `(Pomodoros × 10) + (Streak × 25) + (Cards × 2) + (Blurts × 15)`. Top 50 shown.
- **Squad Mode:** Async co-op groups up to 4. 6-char invite codes. Squad streak = minimum member streak.

---

### System Interrupt Engine (Phase 15 — Complete)

Full-screen overlay event system. Nine interrupt types:

| Type | Colour | Trigger |
|------|--------|---------|
| `threat` | Red | Deck not reviewed 72h+ |
| `coherence-failure` | Red | 3+ days inactivity |
| `challenge` | Amber | Scheduled challenges |
| `achievement` | Green | Badge/milestone |
| `recall-sprint` | Orange | Timed recall challenge (60s) |
| `pattern-lock` | Orange | Sequence memory challenge |
| `domain-clearance` | Green | Escape Run completed |
| `rank-promotion` | Magenta | Rank-up |
| `warden` | Mode-coloured | Warden character message |
| `warden-trap` | Magenta | Disguised shortcut trap |
| `warden-clearance-strip` | Red | 10-day inactivity penalty |

`SysInterrupt` object with `show(type, payload)`, `dismiss(id)`, `_buildHTML()`, `_checkScheduler()`.

Badge engine: 30+ achievement badges tracked in server `user_badges` table.

---

### Repeatable Escape Run System (Phase 16 — Complete)

Named knowledge domain runs stored server-side in `escape_runs` table (`cem_modules_used` JSONB).

Each run has 6 ordered exploits:
1. Focus session (Learning Governor)
2. Flashcard deck link
3. Neural map (BrainDump nodes)
4. Boss Fight (MCQ)
5. Speed Run exploit
6. After-Action debrief

Runs can be reset and repeated. `escapeRunEngine` manages CRUD via `/api/escape-runs`. Memory Wipe snake runs after `escapeRunEngine.load()` fires (not at boot).

---

### 10 Cognitive Exploit Modules — CEM (Phase 17 — Complete)

Rank-gated modules in `index.html`. Checked via `_cemRankIdx()` and `_cemLocked(minRankIdx)`.

| Module | Rank Gate | localStorage Key |
|--------|-----------|-----------------|
| Memory Palace | NPC+ (free) | `sg_memory_palace` |
| Mind Map Protocol | NPC+ (free) | `sg_mindmap` |
| Chunking Engine | NPC+ (free) | `sg_chunking` |
| Speed Run | NPC+ (free) | `sg_speed_run` |
| Mistake Vault | Script Kiddie+ | `sg_mistake_vault` |
| Teach It | Script Kiddie+ | `sg_teach_it` |
| Dual Coding Station | Script Kiddie+ | `sg_dual_coding` |
| The Interleave | Glitch Tech+ | `sg_interleave` |
| Concept Mapper | Glitch Tech+ | `sg_concept_mapper` |
| Shadow Protocol | Glitch Tech+ | `sg_shadow_protocol` |

Warden Trap also locks a single randomly-selected module for 2 hours (checked via `_cemTrapLocked(moduleKey)` per module).

---

### The Warden + Snakes & Ladders (Phase 18 — Complete)

**The Warden** is a character that appears as a System Interrupt. Three modes: `observer`, `guide`, `adversary`. Mode selected by `_getWardenMode()` using pre-login last-active date snapshot (`_preLoginLastActive`).

47 Warden messages (27 observer / 10 guide / 7 adversary / 3 trap).

**Snakes (setbacks):**
- **Memory Wipe:** 5+ day inactive domain → corrupt one completed exploit. Runs after `escapeRunEngine.load()`. Delta: 0 (run step reset only, no clearance score penalty).
- **Clearance Strip:** 10+ day inactivity (using pre-login `_preLoginLastActive` date) → `rollbackPenalty++`, blocks promotion. Delta: -2.
- **Warden's Trap:** Disguised shortcut offer. If accepted: randomly locks one CEM module for 2 hours. Stored as `{moduleId, lockUntil}` JSON in `sg_warden_trap_lock`. Delta: -1.

**Ladders (bonuses):**
- **Performance Shortcut:** BrainDump 200+ words + Boss Fight 90%+ + Speed Run 5/5 → immediate clearance event. Delta: +3.
- **Consistency Ladder:** 7-day streak → `sg_consistency_bonus_active` flag → 10% threshold reduction in `checkPromotion()` and `getProgress()`. Cleared after rank-up.
- **Hidden Access Node:** 1-in-20 sessions → clickable 6px magenta DOM dot injected after 60-180s delay. Delta: +2.

**Operative Status Board** on Rank page: Clearance Score (computed), Net Warden Delta, Rank Tier. Warden Transmission Log (latest first). All clearance events in `sg_clearance_events`.

**Warden Trap session cadence:** `sg_app_sessions` counter increments per login. Trap fires every 5-7 real app sessions (not pomodoro count).

---

## Payment Model

PayFast only (ZAR). One-time purchase packs — no auto-renewal.

| Pack | Price | Duration |
|------|-------|---------|
| 1 Month Pro | R99 | 30 days |
| 3 Month Pro | R249 | 90 days |
| 12 Month Pro | R799 | 365 days |
| School License | R499/yr | Institution |

PayFast ITN handler at `/api/payfast-itn`. Reads `custom_str1` for user ID, sets `pro_expires_at` in DB.

---

## Database Schema (PostgreSQL)

| Table | Purpose |
|-------|---------|
| `users` | User profile, gamertag, `pro_expires_at` |
| `sessions` | Express session storage |
| `leaderboard` | Focus Score per user |
| `squads` | Squad records + invite codes + streak |
| `squad_members` | Membership + last ping timestamps |
| `waitlist` | Email + gamertag for pre-launch signups |
| `page_views` | Analytics |
| `user_badges` | Earned achievement badges |
| `escape_runs` | Named domain runs with exploit progress + `cem_modules_used` JSONB |

---

## Environment Variables (Replit Secrets)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection (auto-set by Replit) |
| `SESSION_SECRET` | Yes | Session cookie signing |
| `REPL_ID` | Yes (auto) | Replit env ID for OIDC |
| `ISSUER_URL` | Yes (auto) | Replit OIDC issuer |
| `REPLIT_DOMAINS` | Yes (auto) | Allowed redirect domains |
| `RESEND_API_KEY` | No | Resend transactional email |
| `RESEND_SG_KEY` | No | Secondary Resend key |
| `PAYFAST_MERCHANT_ID` | Payments | PayFast dashboard |
| `PAYFAST_MERCHANT_KEY` | Payments | PayFast dashboard |
| `PAYFAST_PASSPHRASE` | Payments | PayFast salt passphrase |
| `PORT` | No | Server port (default 5000) |

---

## localStorage Keys Reference

### Rank & Progression
| Key | Purpose |
|-----|---------|
| `sg_rank` | Rank + all evidence counters + `activeDateLog` |
| `sg_clearance_events` | All Warden clearance events (snakes/ladders) |
| `sg_warden_log` | Warden transmission log (30 entries max) |
| `sg_warden_trap_lock` | `{moduleId, lockUntil}` JSON — active trap state |
| `sg_warden_trap_shown` | Timestamp of last trap display |
| `sg_warden_trap_session` | App session count when trap was last scheduled |
| `sg_warden_session` | sessionStorage: Warden shown this session? |
| `sg_app_sessions` | Total login/open count (for trap cadence) |
| `sg_hidden_node_session` | sessionStorage: hidden node state |
| `sg_clearance_strip_last` | Timestamp of last Clearance Strip |
| `sg_memory_wipe_alerted` | Set of run IDs already wiped |
| `sg_consistency_ladder_at` | Streak value when bonus was granted |
| `sg_consistency_bonus_active` | Active flag for 10% threshold reduction |
| `sg_perf_shortcut_at` | Timestamp of last Performance Shortcut |

### Study Tools
| Key | Purpose | Exported |
|-----|---------|---------|
| `sg_decks` | Flashcard deck metadata | Yes |
| `sg_cards` | Card content + Leitner positions | Yes |
| `sg_pomodoro_log` | Focus session log | Yes |
| `sg_blurt` | BrainDump session records | Yes |
| `sg_eisenhower` | Eisenhower tasks + reflections | Yes |
| `sg_recal` | Dopamine Recalibrator counts | Yes |
| `sg_babel` | Babel Fish Feynman exercises | Yes |
| `sg_yet` | YET Growth Shield log | Yes |
| `sg_mcq` | MCQ attempts, scores, gaps | Yes |
| `sg_exams` | Exam countdown entries | Yes |
| `sg_wil` | "What I Learned?" entries | Yes |
| `sg_theme` | Dark/light preference | Yes |
| `sg_burned` | Burned card count | Yes |

### CEM Modules
| Key | Module |
|-----|--------|
| `sg_memory_palace` | Memory Palace |
| `sg_mindmap` | Mind Map Protocol |
| `sg_chunking` | Chunking Engine |
| `sg_speed_run` | Speed Run |
| `sg_mistake_vault` | Mistake Vault |
| `sg_teach_it` | Teach It |
| `sg_dual_coding` | Dual Coding Station |
| `sg_interleave` | The Interleave |
| `sg_concept_mapper` | Concept Mapper |
| `sg_shadow_protocol` | Shadow Protocol |

---

## External Dependencies

### NPM Packages

| Package | Purpose |
|---------|---------|
| `express` v5.2.1 | HTTP server |
| `openid-client` v6 | Replit OIDC auth |
| `express-session` | Session management |
| `connect-pg-simple` | PostgreSQL session store |
| `memoizee` | OIDC config caching |
| `pg` | PostgreSQL queries |
| `helmet` | Security headers |
| `express-rate-limit` | API rate limiting |
| `resend` | Transactional email |

### CDN Dependencies (Frontend)
- Tailwind CSS
- Chart.js
- Google Fonts (VT323, Share Tech Mono, Space Grotesk)

### External Services

| Service | Purpose |
|---------|---------|
| Replit Auth (OIDC) | User authentication |
| PostgreSQL | Server-side data storage |
| PayFast | ZAR payment processing |
| Resend | Transactional email |
| Open Trivia Database | (Legacy — Quiz Arena removed) |

---

## Active Integrations

| Integration | Purpose | Status |
|-------------|---------|--------|
| Replit Auth (`javascript_log_in_with_replit`) | OIDC authentication | Installed and active |
| PostgreSQL (`javascript_database`) | Users, sessions, leaderboard, squads, escape runs, badges | Installed and active |
| Resend | Welcome + onboarding email | Active when `RESEND_API_KEY` set |
| PayFast | ZAR payment processing | Active when merchant credentials set |

---

## How to Start

```bash
npm install
node server.js
```

Server starts on port 5000. Workflow: `Start application` → `node server.js`.

---

## Key Architectural Notes

- **Monolithic HTML:** All frontend in `index.html`. Intentional — no build step.
- **Offline-first:** All study data in `localStorage`. Server only for auth, leaderboard, squads, escape runs, payments.
- **Pre-login snapshot:** `_preLoginLastActive` captured before `rankEngine.trackActiveDay()` — used by Warden inactivity checks so today's login doesn't mask absence.
- **App session counter:** `sg_app_sessions` increments on every login — used for Warden Trap cadence (every 5-7 sessions).
- **Trap lock format:** `sg_warden_trap_lock` stores `{moduleId, lockUntil}` JSON, not a bare timestamp. `isTrapLocked(moduleId)` checks module-specific lock.
- **Memory Wipe timing:** Runs after `escapeRunEngine.load()` resolves, not at boot (runs would be empty at boot).
- **Consistency bonus:** Cleared in `checkPromotion()` when rank-up occurs; must re-earn with another 7-day streak.
- **`esc()` utility:** Used everywhere for XSS protection on user-rendered content.
