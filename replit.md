# Synapse - Interactive Learning OS

## Overview

Synapse is a study-methods operating system built as a single-page web application. Its primary function is to change learner behaviour and enforce evidence-based learning practices. Progression is based on a 3-rank system (Space Cadet → Second Officer → Flight Commander) earned through demonstrated learning behaviours, not XP grinding. Core tools include the Pomodoro Learning Governor, Blurting Method, Leitner flashcard system, AI-powered study planning via Gemini API, Cornell notes, and session statistics. Uses Firebase optionally for cloud sync and localStorage for local persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

### Product Philosophy
- Synapse is NOT a gamified productivity app or trivia game
- It is a structured, serious, progression-oriented study-methods OS
- One single authoritative progression spine: the 3-rank system
- Ranks are permanent and irreversible (earned once, never revoked)
- Progression is evidence-based, not XP-based — quality and consistency over volume
- No monetisation should affect rank or provide learning advantages

## System Architecture

### Frontend Architecture
- **Single-page application (SPA):** The entire UI lives in a single `index.html` file (~1350 lines). All routing is handled client-side via `app.navTo()`. Express server has a catch-all route serving `index.html` for any path.
- **Navigation sections:** Mission (dashboard), Vault (learning techniques), Decks (flashcard management), Quiz (trivia, isolated from progression), Blurt (blurting method), Matrix (Eisenhower Matrix prioritisation tool), Rank (rank status & promotion requirements), Stats (session statistics).
- **Styling:** Tailwind CSS via CDN with dark mode support (class-based toggle), custom fonts (Inter for UI, Lora for headings).
- **Data Visualization:** Chart.js via CDN for scatter, doughnut, and bar charts.
- **Design Theme:** Warm paper-like color scheme (background `#FDFCF8`, text `#2D2A26`, accent `orange-600`).

### Backend Architecture
- **Express.js v5:** Minimal static file server (`server.js`) on port 5000.
- **Caching:** All responses use `no-cache, no-store, must-revalidate` headers.
- **SPA routing:** Catch-all route `/{*splat}` serves `index.html`.
- **API proxy:** `/api/gemini` POST endpoint proxies requests to Gemini API, keeping API key server-side only (`GEMINI_API_KEY` env var).

### Data Storage
- **localStorage (primary):** All features work offline via localStorage stores:
  - `synapse_decks` — Flashcard deck metadata
  - `synapse_cards` — Flashcard cards with Leitner box/nextReview
  - `synapse_pomodoro_log` — Completed pomodoro sessions with task labels and durations
  - `synapse_blurt` — Blurt sessions with source/recall/gaps
  - `cornellNotes` — Cornell notes content
  - `synapse_rank` — Current rank and rank evidence (blurtsCompleted, governorBreakdowns, cardsAdvanced, activeDays, pomodorosCompleted)
  - `synapse_eisenhower` — Eisenhower Matrix tasks (with quadrant assignments) and reflections
- **Firebase Firestore (optional):** Cloud persistence for notes and progress checkboxes. Graceful degradation via try-catch when `__firebase_config` unavailable.
- **Export/Import:** JSON backup/restore of all localStorage data including rank progress.

### Key Features

1. **Mission Architect (AI):** Gemini-powered study plan generation via `/api/gemini` proxy.
2. **Rank System (Progression):** 3 irreversible ranks: Space Cadet → Second Officer → Flight Commander. Evidence-based promotion requiring demonstrated learning behaviours (blurt sessions, governor breakdowns, flashcard study, active days, focus sessions). Rank badge displayed in nav bar. Rank page shows promotion requirements with progress bars.
3. **Learning Governor:** Pomodoro timer with task labels, normalized consecutive streak tracking, blocks at 4 consecutive sessions without breakdown. Governor breakdowns count as rank evidence. Visual streak dots (4 indicators).
4. **Flashcard Decks:** Full deck/card CRUD with Leitner 5-box spaced repetition (intervals: 1/3/7/14/30 days). Study mode with 3D flip cards, due card filtering. Card study counts as rank evidence.
5. **Blurting Method:** 4-phase active recall (list sessions → read source → blurt from memory → compare and fill gaps). Session persistence with review counting. Completed blurt sessions count as rank evidence.
6. **Quiz Arena (Isolated):** Trivia game via Open Trivia Database API. 16 categories, 3 difficulty levels, timed questions (15s). Does NOT affect rank progression — standalone knowledge testing tool.
7. **Eisenhower Matrix:** Interactive prioritisation tool. Brain dump tasks, sort into 4 quadrants (Q1: Do First, Q2: Schedule, Q3: Minimise, Q4: Limit). Smart Shift reflection prompts. Daily Rule guidance. Task completion tracking. Persists to localStorage.
8. **Charts:** Scatter (Effort vs Efficiency), Doughnut (Category Distribution) on dashboard. Bar chart (Weekly Activity) on stats page.
9. **Session Statistics:** Total focus time, session count, deck count, weekly activity chart, top tasks by frequency.
10. **Data Management:** Export all data as JSON, import from backup file.
11. **XSS Protection:** `esc()` utility (DOM-based text node escaping) applied to all user-rendered content.

### Rank Promotion Requirements

**Space Cadet → Second Officer:**
- 10 blurt sessions completed
- 10 governor-enforced breakdowns
- 50 flashcards studied
- 7 active days
- 15 focus sessions (pomodoros)

**Second Officer → Flight Commander:**
- 30 blurt sessions completed
- 30 governor breakdowns
- 150 flashcards studied
- 21 active days
- 50 focus sessions (pomodoros)

### Key Design Decisions

1. **CDN-based dependencies** — No build system. Tailwind, Chart.js, Firebase all loaded from CDNs. Prefer CDN imports or inline code for frontend libraries.
2. **Firebase as optional cloud layer** — App works fully offline with localStorage. Firebase syncs notes/progress when available.
3. **Monolithic HTML file** — All frontend code in `index.html`. Consider splitting if file grows past ~1200 lines.
4. **Server-side API key** — Gemini API key never exposed to client. All AI calls go through Express proxy.
5. **Evidence-based progression** — Ranks earned through quality learning behaviours, not grinding. No daily quests, no XP, no streak multipliers.
6. **Quiz isolation** — Quiz Arena exists as a knowledge-testing tool but is deliberately isolated from rank progression.

## External Dependencies

### NPM Packages
- **express v5.2.1** — Static file server, SPA routing, API proxy

### CDN Dependencies (Frontend)
- **Tailwind CSS** — Utility-first CSS framework
- **Chart.js** — Charting library (scatter, doughnut, bar)
- **Firebase v11.6.1** — App, Auth, Firestore (optional cloud sync)

### External Services
- **Gemini API** — AI study plan generation (proxied via `/api/gemini`, key in `GEMINI_API_KEY`)
- **Open Trivia Database** — Free trivia API (https://opentdb.com/api.php) for Quiz Arena, no API key needed
- **Google Fonts** — Inter and Lora typefaces

## Recent Changes

### Feb 11, 2026 — MCQ Diagnostic System
1. **Navigation Check:** 100 multiple-choice questions across 5 missions (The Launchpad, Navigation Systems, Galactic Engineers, Avoid the Black Holes, Life Support & Hero State). Diagnostic framing — no timers, XP, or leaderboards.
2. **Access gating:** Missions locked until user completes at least one learning activity (pomodoro, blurt, flashcard review, or Cornell notes). Enforces "confirm learning, not replace it" philosophy.
3. **Gap detection:** Incorrect answers tagged by concept. Knowledge gaps displayed on results page and persistent gap tracker on mission list.
4. **Orbit status:** Per-mission scoring with orbit metaphor (🟢 Stable / 🟠 Adjusting / 🔴 Unstable). Best score and attempt count tracked.
5. **Reflection prompts:** Post-diagnostic reflection textarea saved per mission to encourage metacognition.
6. **mcqStore:** localStorage persistence (`synapse_mcq`) for attempts, gaps, and reflections. Included in export/import.
7. **Nav item:** "Check" added to desktop and mobile navigation, routing to `diagnostic` view.

### Feb 11, 2026 — Mission Simplification for Teens
1. **Mission Guide:** Added "How to Use Synapse" 3-step instruction box (Pick a topic → Use the tools → Level up your rank) with numbered emoji cards.
2. **To-Do List:** Replaced Quest Log with interactive emoji to-do list (⬜/✅ toggle, add/remove tasks). Persisted to `synapse_todos` localStorage key via `todoStore`. Included in export/import.
3. **AI prompt simplified:** Study Plan Generator now produces max 150-word, 3-step plans in simple language for teenagers. Button changed from "Synthesize" to "Go!".
4. **Dashboard text clarified:** Title changed to "Your Mission", subtitle to "Your study home base. Everything starts here." Section renamed to "Study Plan Generator" with teen-friendly placeholder examples.
5. **Study quotes:** 20 motivational study quotes displayed randomly on dashboard load.

### Feb 11, 2026 — Study Streak Tracker
1. **Streak calculation:** `rankEngine.getStreak()` calculates consecutive active days from `activeDateLog` array.
2. **Dashboard card:** Study Streak card in sidebar shows current streak count, emoji indicator (🔥/🟠/🟡/⚪), motivational message, and 7-day visual calendar with filled/empty dots.
3. **Active date logging:** `trackActiveDay()` now records dates in ISO format to `activeDateLog` array for streak calculation.
4. **Data persistence:** `activeDateLog` stored in `synapse_rank` localStorage key, included in export/import.

### Feb 11, 2026 — Eisenhower Matrix Module
1. **Interactive prioritisation tool:** Brain dump tasks, sort into 4 colour-coded quadrants (Q1 Do First, Q2 Schedule, Q3 Minimise, Q4 Limit).
2. **Smart Shift reflection:** Guided prompt asking "What Q2 action could have prevented this Q1 task?" with saved reflections.
3. **Daily Rule guide:** Visual reference for daily prioritisation habits.
4. **Full persistence:** Tasks and reflections saved to `synapse_eisenhower` localStorage key.
5. **Added to Vault:** Eisenhower Matrix listed as Prioritisation technique (efficiency: 90, effort: 30).
6. **Export/import updated:** Includes eisenhower data in backup/restore.
7. **Isolated from rank:** The matrix is a standalone prioritisation tool — no rank progression effects.

### Feb 11, 2026 — Rank System Refactor (Philosophy Alignment)
1. **Replaced XP/levels with 3-rank system:** Space Cadet → Second Officer → Flight Commander. Ranks are permanent, irreversible, evidence-based.
2. **Removed gamification systems:** XP grinding, numerical levels, daily quests, achievement badges, collectible tokens, streak multipliers — all removed.
3. **Evidence-based promotion:** Rank advancement requires specific behavioural evidence (blurt sessions, governor breakdowns, flashcard study, active days, focus sessions).
4. **Isolated Quiz Arena:** Quiz remains functional as standalone knowledge-testing tool but does not affect rank progression.
5. **Rank UI:** Nav badge shows current rank. Dashboard shows rank card with progress bars. Dedicated Rank page shows full promotion requirements and evidence log.
6. **rankEngine:** New lightweight progression engine replacing questEngine. Tracks evidence via `synapse_rank` localStorage key.
7. **Updated core tool hooks:** Pomodoro, flashcards, blurting, and governor breakdown now record evidence for rank instead of awarding XP.
8. **Export/import:** Updated to include rank data instead of quest/XP data.

### Feb 11, 2026 — Major Enhancement: 8-Feature Rebuild
1. **AI integration fixed:** `aiService.callGemini` now calls `/api/gemini` proxy instead of direct Google API with empty key. Removed client-side API key variable.
2. **XSS protection added:** `esc()` utility function using DOM text node escaping. Applied across all user-rendered HTML injection points.
3. **localStorage data stores:** Added `deckStore`, `cardStore`, `pomodoroStore`, `blurtStore` with full CRUD, persistence, and load/save methods.
4. **Flashcard deck system:** Deck list, deck detail with card management, Leitner 5-box spaced repetition, study mode with 3D flip cards, due card filtering.
5. **Learning Governor:** Task label required before starting focus, blocks at 4 consecutive same-task sessions.
6. **Blurting Method:** 4-phase active recall flow with session CRUD and re-blurt capability.
7. **Chart.js charts implemented:** Scatter and Doughnut on dashboard, Bar chart on stats page.
8. **Session statistics page:** Total focus time, session count, weekly activity, top tasks.
9. **Export/import data:** JSON backup/restore of all localStorage data.
