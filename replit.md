# Synapse - Interactive Learning OS

## Overview

Synapse is an interactive learning operating system built as a single-page web application. It enforces Cognitive Load Theory through mandatory task breakdown (Learning Governor), provides AI-powered study planning via Gemini API, flashcard decks with Leitner spaced repetition, The Blurting Method (active recall), Cornell notes, Pomodoro timer with cognitive load enforcement, session statistics, and data export/import. Uses Firebase optionally for cloud sync and localStorage for local persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single-page application (SPA):** The entire UI lives in a single `index.html` file (~940 lines). All routing is handled client-side via `app.navTo()`. Express server has a catch-all route serving `index.html` for any path.
- **Navigation sections:** Mission (dashboard), Vault (learning techniques), Spaced (spaced repetition info), Decks (flashcard management), Blurt (blurting method), Stats (session statistics), About.
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
- **Firebase Firestore (optional):** Cloud persistence for notes and progress checkboxes. Graceful degradation via try-catch when `__firebase_config` unavailable.
- **Export/Import:** JSON backup/restore of all localStorage data.

### Key Features

1. **Mission Architect (AI):** Gemini-powered study plan generation via `/api/gemini` proxy.
2. **Flashcard Decks:** Full deck/card CRUD with Leitner 5-box spaced repetition (intervals: 1/3/7/14/30 days). Study mode with 3D flip cards, due card filtering.
3. **Learning Governor:** Pomodoro timer with task labels, normalized consecutive streak tracking, blocks at 4 consecutive sessions without breakdown. Visual streak dots (4 indicators).
4. **Blurting Method:** 4-phase active recall (list sessions → read source → blurt from memory → compare and fill gaps). Session persistence with review counting.
5. **Charts:** Scatter (Effort vs Efficiency), Doughnut (Category Distribution) on dashboard. Bar chart (Weekly Activity) on stats page.
6. **Session Statistics:** Total focus time, session count, deck count, weekly activity chart, top tasks by frequency.
7. **Data Management:** Export all data as JSON, import from backup file.
8. **XSS Protection:** `esc()` utility (DOM-based text node escaping) applied to all user-rendered content (26 uses).

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
- **Google Fonts** — Inter and Lora typefaces

## Recent Changes

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
