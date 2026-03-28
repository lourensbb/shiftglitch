# Synapse - Interactive Learning OS

## Overview
Synapse is a single-page web application designed as a study-methods operating system. Its core purpose is to cultivate evidence-based learning practices and change learner behaviour. Progression is achieved through a unique 3-rank system (Space Cadet → Second Officer → Flight Commander) based on demonstrated learning behaviours rather than traditional XP. Key features include the Pomodoro Learning Governor, Blurting Method, a Leitner flashcard system, AI-powered study planning via the Gemini API, Cornell notes, and detailed session statistics. It supports offline functionality via localStorage and optional cloud synchronisation with Firebase.

## Current Deployment
- **Status:** Live and deployed on Replit
- **App name:** Synapse (under review — a new brand name will be chosen as part of the upcoming major revamp)
- **localStorage prefix:** `synapse_` — must NOT be renamed as it would wipe existing user data

## User Preferences
Preferred communication style: Simple, everyday language.

### Product Philosophy
- Synapse is NOT a gamified productivity app or trivia game
- It is a structured, serious, progression-oriented study-methods OS
- One single authoritative progression spine: the 3-rank system
- Ranks are permanent and irreversible (earned once, never revoked)
- Progression is evidence-based, not XP-based — quality and consistency over volume
- No monetisation should affect rank or provide learning advantages
- The app is heading toward a major commercial revamp — see `revamp_vision.md`

## System Architecture

### Frontend Architecture
The application is a single-page application (SPA) with client-side routing. Styling is managed using Tailwind CSS via CDN, supporting dark mode (dark mode is the default on first load). Data visualisation is handled by Chart.js via CDN for various chart types. The design employs a warm, paper-like colour scheme with orange (#ea580c) as the primary accent.

### Backend Architecture
An Express.js v5 server provides minimal static file serving and acts as an API proxy for the Gemini API to protect the API key. All responses utilise `no-cache` headers.

### Data Storage
Primary data storage is `localStorage` for offline functionality. Most keys use the `synapse_` prefix; the Cornell Notes key (`cornellNotes`) is an exception. Complete list of localStorage keys:

| Key | Purpose |
|-----|---------|
| `synapse_decks` | Flashcard deck metadata (name, created date) |
| `synapse_cards` | All flashcard content and Leitner box positions |
| `synapse_pomodoro_log` | Pomodoro session history (duration, date, subject tag) |
| `synapse_blurt` | Blurting method session data |
| `synapse_todos` | Cornell notes to-do items (mission tasks) |
| `synapse_eisenhower` | Eisenhower Matrix task data |
| `synapse_recal` | Dopamine Recalibrator session logs |
| `synapse_babel` | Babel Fish (Feynman) exercise records |
| `synapse_yet` | YET Growth Shield moment logs |
| `synapse_rank` | Rank level and all rank evidence counters |
| `synapse_mcq` | MCQ Diagnostics attempt history and scores |
| `synapse_exams` | Exam countdown entries (name + date) |
| `synapse_wil` | "What I Learned?" session log entries |
| `synapse_theme` | Theme preference ("dark" or "light") |
| `synapse_gemini_key` | User's Gemini API key (BYOK, never exported) |
| `cornellNotes` | Cornell Notes panel HTML content (non-prefixed; legacy key) |

Optional cloud persistence for Cornell notes and progress checkboxes is available through Firebase Firestore, with graceful degradation if unavailable. A JSON export/import feature allows backup and restoration of all localStorage data (excluding the Gemini key for security).

### Key Features

#### Core Study Tools
- **Mission Architect (AI):** Gemini-powered study plan generation. Uses BYOK (Bring Your Own Key) model — users enter their own Google Gemini API key in Settings, stored in localStorage only.
- **Settings Page:** API key management with save/remove, masked display, step-by-step setup instructions, and privacy messaging.
- **Rank System:** An evidence-based, 3-rank progression system (Space Cadet → Second Officer → Flight Commander) requiring specific learning behaviours for promotion.
- **Learning Governor:** A Pomodoro timer that tracks streaks and enforces breakdowns, which count as rank evidence. Subject tagging per session.
- **Flashcard Decks:** Full CRUD for decks and cards, featuring a Leitner 5-box spaced repetition system with visual orbit indicators for card stability.
- **Blurting Method:** A 4-phase active recall technique (list, read, blurt, compare) with session persistence and rank evidence tracking.
- **Quiz Arena:** A standalone trivia game using the Open Trivia Database API, isolated from rank progression.
- **Eisenhower Matrix:** An interactive prioritisation tool for tasks, supporting categorisation into four quadrants and reflection prompts.
- **Dopamine Recalibrator:** Anti-procrastination tools including Stealth Mode and Entry Rocket.
- **Babel Fish Metaphor Lab:** A Feynman Technique tool for explaining concepts, supporting optional "stupid doodles."
- **Yet Growth Shield:** Reinforces a growth mindset by reframing "I don't understand X" to "I don't understand X YET" upon learning gaps.
- **MCQ Diagnostics:** 100-question multiple-choice diagnostic across 5 missions, access-gated, tracking knowledge gaps and providing reflection prompts, contributing to rank promotion.
- **Charts & Statistics:** Various charts (scatter, doughnut, bar) and session statistics (focus time, session count, weekly activity).
- **Data Management:** JSON export/import for all user data. "Export for Teacher" button for classroom use.
- **Teacher Dashboard:** (`teacher.html`) Classroom feature. Import student JSON exports, view class overview with rank distribution, activity charts, student roster, and "students needing attention" alerts.
- **Printable Progress Reports:** Generate clean, printer-friendly student summaries with rank evidence bars, activity stats, and metrics. Accessible from Teacher Dashboard.
- **XSS Protection:** `esc()` utility for user-rendered content.

#### Teen-Focused Features (Added March 2025)
- **Dark Mode Default:** App defaults to dark mode on first load; preference saved in `synapse_theme` localStorage key.
- **Phone-Lock Nudge:** A friendly "put your phone face-down" notification fires when starting a Pomodoro session.
- **Subject Tagging:** Pomodoro timer panel has a subject dropdown (Maths, English, Science, History, Life Sciences, Accounting, Business Studies, Geography, Technology, Arts, Physical Education, Other) to tag each focus session.
- **"What I Learned?" Modal:** After every Pomodoro session completes, a modal prompts the user to write one thing they just learned; saved to `synapse_wil` log.
- **Exam Countdown Widget:** Dashboard sidebar widget to add upcoming exams by name and date; shows days remaining, turns red when ≤7 days away.
- **Lofi Music Link:** Small "🎵 Study Music" link in the timer panel opens a YouTube lofi music search in a new tab.
- **"Not Yet 🛡️" Flashcard Button:** Third button (alongside Again/Got It) on flashcard study — triggers the YET Growth Shield mindset frame without penalising more than "Again".
- **Study Buddy System:** Rank page lets users copy a base64 buddy code (rank + stats), paste a friend's code to see a side-by-side comparison.
- **Shareable Progress Report:** Rank page button generates a URL with encoded stats; when opened by anyone (parent, teacher), displays an orange banner with the student's rank and evidence.

### Rank System Details

| Rank | Requirement |
|------|-------------|
| Space Cadet | Default starting rank |
| Second Officer | 15 Pomodoros + 10 blurts + 10 governor breakdowns + 50 cards advanced + 7 active days + 2 diagnostics completed |
| Flight Commander | 50 Pomodoros + 30 blurts + 30 governor breakdowns + 150 cards advanced + 21 active days + 5 diagnostics completed |

### MCQ Diagnostic Missions

| Mission | Subtitle | Topic Area |
|---------|----------|------------|
| Mission 1: The Launchpad | Crisis & Brain Science | Neuroplasticity, memory, forgetting curve, stress |
| Mission 2: Navigation Systems | Study Methods | Pomodoro, Cornell Notes, Feynman, Leitner, interleaving |
| Mission 3: Deep Space Ops | Advanced Techniques | Elaborative interrogation, dual coding, retrieval practice |
| Mission 4: Command Decisions | Mindset & Motivation | Growth mindset, procrastination, self-regulation |
| Mission 5: Flight Commander Brief | Integration | Cross-topic synthesis and application |

### State & Handler Reference

New state fields added in March 2025 build:
- `state.examCountdowns` — array of `{ name, date }` exam entries
- `state.wilLog` — array of `{ text, date, subject }` "What I Learned" entries
- `state.timerSubject` — current subject tag selection for Pomodoro
- `state.buddyData` — decoded buddy code from a pasted friend code

New handler functions added in March 2025 build:
- `saveWhatILearned()` — saves WIL modal entry to `synapse_wil`
- `dismissWIL()` — closes WIL modal without saving
- `addExamCountdown()` — adds a new exam entry to the sidebar widget
- `removeExamCountdown(idx)` — removes an exam entry by index
- `generateBuddyCode()` — encodes rank + stats as base64 buddy code
- `copyBuddyCode()` — copies buddy code to clipboard
- `loadBuddyCode()` — decodes pasted buddy code and shows side-by-side view
- `shareProgressReport()` — generates shareable URL with encoded stats
- `studyYet(cardId)` — triggers YET Growth Shield from flashcard "Not Yet" button

### Key Design Decisions
- **CDN-based dependencies:** No build system; libraries like Tailwind, Chart.js, and Firebase are loaded via CDNs.
- **Firebase as optional:** The application functions fully offline with `localStorage`; Firebase provides an optional cloud sync layer.
- **Monolithic HTML:** All frontend code resides in a single `index.html` file (~2842 lines). Demo version in `demo.html`.
- **Externalised Firebase config:** Firebase credentials live in `config.js` (loaded by `index.html`). `config.js` uses `var` (not `const`) so it is accessible before the module scripts run. The app detects placeholder values and falls back to offline mode gracefully.
- **BYOK (Bring Your Own Key):** Users provide their own Gemini API key via the Settings page. Key is stored in localStorage only (never sent to any server/database). When a user key is present, API calls go directly from browser to Google. Falls back to server proxy if no user key is set.
- **API key excluded from export:** The Gemini key is intentionally excluded from data export/import for security.
- **Evidence-based progression:** Rank advancement is based on quality learning behaviours, not gamified XP systems.
- **Quiz isolation:** The Quiz Arena is a standalone tool and does not impact rank progression.
- **Dark mode as default:** First-load dark mode is achieved by reading `synapse_theme` from localStorage and applying the `dark` class to `<html>` before render.

## External Dependencies

### NPM Packages
- **express v5.2.1**

### CDN Dependencies (Frontend)
- **Tailwind CSS** (with darkMode: 'class' config)
- **Chart.js**
- **Firebase v11.6.1** (App, Auth, Firestore)

### External Services
- **Gemini API (gemini-2.0-flash):** For AI study plan generation.
- **Open Trivia Database:** For the Quiz Arena.
- **Google Fonts:** Inter and Lora typefaces.

## Files Reference

| File | Description |
|------|-------------|
| `index.html` | Full SPA — all student-facing features (~2842 lines) |
| `demo.html` | Limited demo version (~2000 lines) |
| `teacher.html` | Teacher Dashboard for classroom use |
| `server.js` | Express v5 server: static files + Gemini API proxy |
| `config.js` | Firebase config (var SYNAPSE_FIREBASE_CONFIG) |
| `config.example.js` | Blank template for Firebase config |
| `README.md` | Setup and deployment guide |
| `PRO-INSTRUCTIONS.md` | Full teacher/classroom usage guide |
| `JOURNAL.md` | Design philosophy and product story (marketing/promotional) |
| `REPORT.md` | Full app report, module inventory, and user guide |
| `revamp_vision.md` | Future evolution vision document |
