# Synapse - Interactive Learning OS

## Overview

Synapse is an interactive learning operating system built as a single-page web application. It gamifies the educational journey through a Quest Engine (XP, levels, achievements, tokens, daily quests) and Quiz Arena (trivia via Open Trivia DB). Also enforces Cognitive Load Theory through mandatory task breakdown (Learning Governor), provides AI-powered study planning via Gemini API, flashcard decks with Leitner spaced repetition, The Blurting Method (active recall), Cornell notes, Pomodoro timer with cognitive load enforcement, session statistics, and data export/import. Uses Firebase optionally for cloud sync and localStorage for local persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single-page application (SPA):** The entire UI lives in a single `index.html` file (~1360 lines). All routing is handled client-side via `app.navTo()`. Express server has a catch-all route serving `index.html` for any path.
- **Navigation sections:** Mission (dashboard), Vault (learning techniques), Decks (flashcard management), Quiz (trivia arena), Blurt (blurting method), Quests (XP/achievements/tokens), Stats (session statistics).
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
  - `synapse_quest` — XP total, history, achievements, tokens, daily quests, login tracking
  - `synapse_quiz_stats` — Quiz total answered, correct, best streak
- **Firebase Firestore (optional):** Cloud persistence for notes and progress checkboxes. Graceful degradation via try-catch when `__firebase_config` unavailable.
- **Export/Import:** JSON backup/restore of all localStorage data including quest progress.

### Key Features

1. **Mission Architect (AI):** Gemini-powered study plan generation via `/api/gemini` proxy.
2. **Quest Engine (Gamification):** Universal XP system across all activities. 16 level thresholds, 13 achievements, 6 collectible tokens, 3 daily rotating quests. XP awarded for: pomodoros (+25), flashcard study (+15/+5), blurt sessions (+20), quiz answers (+15 × streak multiplier up to 5x), daily login (+10), token discovery (+50), daily quest completion (variable). XP bar and level display in nav bar.
3. **Quiz Arena:** Trivia game via Open Trivia Database API. 16 categories, 3 difficulty levels, timed questions (15s), streak multiplier scoring. Achievement and token unlocks (Speed Demon for <3s answers, Quiz Master for perfect 10).
4. **Flashcard Decks:** Full deck/card CRUD with Leitner 5-box spaced repetition (intervals: 1/3/7/14/30 days). Study mode with 3D flip cards, due card filtering. Deck Master token for mastering all cards.
5. **Learning Governor:** Pomodoro timer with task labels, normalized consecutive streak tracking, blocks at 4 consecutive sessions without breakdown. Visual streak dots (4 indicators).
6. **Blurting Method:** 4-phase active recall (list sessions → read source → blurt from memory → compare and fill gaps). Session persistence with review counting.
7. **Tokens:** Hidden collectibles earned through specific behaviors — Full Circuit (pomodoro+flashcard+blurt in one day), Night Owl/Early Bird (time-based), Speed Demon, Quiz Master, Deck Master.
8. **Daily Quests:** 3 rotating objectives per day with bonus XP rewards. Auto-detected completion.
9. **Charts:** Scatter (Effort vs Efficiency), Doughnut (Category Distribution) on dashboard. Bar chart (Weekly Activity) on stats page.
10. **Session Statistics:** Total focus time, session count, deck count, weekly activity chart, top tasks by frequency.
11. **Data Management:** Export all data as JSON, import from backup file.
12. **XSS Protection:** `esc()` utility (DOM-based text node escaping) applied to all user-rendered content.

### Key Design Decisions

1. **CDN-based dependencies** — No build system. Tailwind, Chart.js, Firebase all loaded from CDNs. Prefer CDN imports or inline code for frontend libraries.
2. **Firebase as optional cloud layer** — App works fully offline with localStorage. Firebase syncs notes/progress when available.
3. **Monolithic HTML file** — All frontend code in `index.html`. Consider splitting if file grows past ~1200 lines.
4. **Server-side API key** — Gemini API key never exposed to client. All AI calls go through Express proxy.

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

### Feb 11, 2026 — Quest Engine & Quiz Arena
1. **Quest Engine:** Full gamification system with XP, 16 levels, 13 achievements, 6 collectible tokens, and 3 daily rotating quests. XP awarded across all activities with streak multipliers.
2. **Quiz Arena:** Trivia game using Open Trivia Database API. 16 categories, 3 difficulty levels, 15-second timer per question, streak multiplier scoring (up to 5x), results screen with stats.
3. **Hidden Tokens:** 6 collectible tokens for specific behaviors (Full Circuit, Quiz Master, Night Owl, Early Bird, Speed Demon, Deck Master). Token glow animation when collected.
4. **Daily Quests:** 3 rotating objectives per day from a pool of 6 templates. Auto-completion detection with bonus XP.
5. **XP Hooks:** Pomodoro (+25 XP), flashcard correct (+15), flashcard attempt (+5), blurt session (+20), quiz correct (+15 × streak), daily login (+10), token (+50), daily quest (variable).
6. **Nav XP Bar:** Level indicator and XP progress bar in navigation. XP popup animation on earn.
7. **Dashboard Quest Status:** Quest status card on dashboard showing level, XP, badges, tokens, streak count.
8. **Export/Import:** Updated to include quest progress and quiz stats in backup data.

### Feb 11, 2026 — Major Enhancement: 8-Feature Rebuild
1. **AI integration fixed:** `aiService.callGemini` now calls `/api/gemini` proxy instead of direct Google API with empty key. Removed client-side API key variable.
2. **XSS protection added:** `esc()` utility function using DOM text node escaping. Applied across all 26 user-rendered HTML injection points.
3. **localStorage data stores:** Added `deckStore`, `cardStore`, `pomodoroStore`, `blurtStore` with full CRUD, persistence, and load/save methods.
4. **Flashcard deck system:** Deck list, deck detail with card management, Leitner 5-box spaced repetition (New/Learning/Review/Familiar/Mastered), study mode with 3D flip cards, due card filtering by nextReview timestamp.
5. **Learning Governor:** Task label required before starting focus, normalized label matching, consecutiveCount tracking, blocks at 4 consecutive same-task sessions, "I've Broken It Down" and "Switch Task" options, visual streak dots.
6. **Blurting Method:** 4-phase active recall flow (list/read/blurt/compare), session CRUD with localStorage, re-blurt capability, gap-filling comparison view.
7. **Chart.js charts implemented:** Scatter (Effort vs Efficiency) and Doughnut (Category Distribution) with canvas elements, dark mode color support, proper destroy/recreate lifecycle.
8. **Session statistics page:** Total focus time, session count, deck count, weekly activity bar chart, top tasks by frequency with progress bars.
9. **Export/import data:** JSON backup of all localStorage data (decks, cards, blurt sessions, pomodoro log, notes). File picker import with validation.
10. **Navigation expanded:** Added Decks, Blurt, Stats links to both desktop and mobile nav. Active state highlighting for all nav items.
11. **Timer controls restored:** Focus/Break mode toggle buttons, Reset button, task label input with disabled state while running.
12. **Firebase graceful degradation:** try-catch with dynamic import, sets `window.fb = null` on failure.
13. **Notes preservation:** Dashboard passes saved notes to prevent overwrite on re-render.
14. **Auto-dismiss notifications:** Notifications auto-hide after 4 seconds.
