# Synapse - Interactive Learning OS

## Overview
Synapse is a single-page web application designed as a study-methods operating system. Its core purpose is to cultivate evidence-based learning practices and change learner behavior. Progression is achieved through a unique 3-rank system (Space Cadet → Second Officer → Flight Commander) based on demonstrated learning behaviors rather than traditional XP. Key features include the Pomodoro Learning Governor, Blurting Method, a Leitner flashcard system, AI-powered study planning via the Gemini API, Cornell notes, and detailed session statistics. It supports offline functionality via localStorage and optional cloud synchronization with Firebase.

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
The application is a single-page application (SPA) with client-side routing. Styling is managed using Tailwind CSS via CDN, supporting dark mode. Data visualization is handled by Chart.js via CDN for various chart types. The design employs a warm, paper-like color scheme.

### Backend Architecture
An Express.js v5 server provides minimal static file serving and acts as an API proxy for the Gemini API to protect the API key. All responses utilize `no-cache` headers.

### Data Storage
Primary data storage is `localStorage` for offline functionality, persisting flashcards, pomodoro logs, blurt sessions, Cornell notes, rank progress, Eisenhower Matrix tasks, dopamine recalibrator sessions, Babel Fish exercises, Growth Shield moments, MCQ diagnostic data, exam countdowns (`synapse_exams`), and "What I Learned" session log (`synapse_wil`). Theme preference is saved under `synapse_theme`. Optional cloud persistence for notes and progress checkboxes is available through Firebase Firestore, with graceful degradation if unavailable. A JSON export/import feature allows for backup and restoration of all localStorage data.

### Key Features
- **Mission Architect (AI):** Gemini-powered study plan generation. Uses BYOK (Bring Your Own Key) model — users enter their own Google Gemini API key in Settings, stored in localStorage only.
- **Settings Page:** API key management with save/remove, masked display, step-by-step setup instructions, and privacy messaging.
- **Rank System:** An evidence-based, 3-rank progression system (Space Cadet → Second Officer → Flight Commander) requiring specific learning behaviors for promotion.
- **Learning Governor:** A Pomodoro timer that tracks streaks and enforces breakdowns, which count as rank evidence.
- **Flashcard Decks:** Full CRUD for decks and cards, featuring a Leitner 5-box spaced repetition system with visual orbit indicators for card stability.
- **Blurting Method:** A 4-phase active recall technique (list, read, blurt, compare) with session persistence and rank evidence tracking.
- **Quiz Arena:** A standalone trivia game using the Open Trivia Database API, isolated from rank progression.
- **Eisenhower Matrix:** An interactive prioritization tool for tasks, supporting categorization into four quadrants and reflection prompts.
- **Dopamine Recalibrator:** Anti-procrastination tools including Stealth Mode and Entry Rocket.
- **Babel Fish Metaphor Lab:** A Feynman Technique tool for explaining concepts, supporting optional "stupid doodles."
- **Yet Growth Shield:** Reinforces a growth mindset by reframing "I don't understand X" to "I don't understand X YET" upon learning gaps.
- **MCQ Diagnostics:** 100-question multiple-choice diagnostic across 5 missions, access-gated, tracking knowledge gaps and providing reflection prompts, contributing to rank promotion.
- **Charts & Statistics:** Various charts (scatter, doughnut, bar) and session statistics (focus time, session count, weekly activity).
- **Data Management:** JSON export/import for all user data. "Export for Teacher" button for classroom use.
- **Teacher Dashboard:** (`teacher.html`) Classroom-only feature. Import student JSON exports, view class overview with rank distribution, activity charts, student roster, and "students needing attention" alerts.
- **Printable Progress Reports:** Generate clean, printer-friendly student summaries with rank evidence bars, activity stats, and metrics. Accessible from Teacher Dashboard.
- **XSS Protection:** `esc()` utility for user-rendered content.
- **Dark Mode Default:** App defaults to dark mode on first load; preference saved in `synapse_theme` localStorage key.
- **Exam Countdown Widget:** Dashboard sidebar widget to add upcoming exams by name and date; shows days remaining, red when ≤7 days away.
- **Subject Tagging:** Pomodoro timer panel has a subject dropdown (Maths, English, Science, etc.) to tag each focus session.
- **"What I Learned?" Modal:** After every Pomodoro session completes, a modal prompts the user to write one thing they just learned; saved to `synapse_wil` log.
- **Phone-Lock Nudge:** A friendly "put your phone face-down" notification fires when starting a Pomodoro session.
- **Lofi Music Link:** Small "🎵 Study Music" link in the timer panel opens a YouTube lofi music search.
- **"Not Yet 🛡️" Flashcard Button:** Third button (alongside Again/Got It) on flashcard study — triggers the YET Growth Shield mindset frame without penalising more than "Again".
- **Study Buddy System:** Rank page lets users copy a base64 buddy code (rank + stats), paste a friend's code to see a side-by-side comparison.
- **Shareable Progress Report:** Rank page button generates a URL with encoded stats; when opened, displays an orange banner with the student's rank and evidence (for parents/teachers).

### Key Design Decisions
- **CDN-based dependencies:** No build system; libraries like Tailwind, Chart.js, and Firebase are loaded via CDNs.
- **Firebase as optional:** The application functions fully offline with `localStorage`; Firebase provides an optional cloud sync layer.
- **Monolithic HTML:** All frontend code resides in a single `index.html` file. Demo version in `demo.html`.
- **Externalised Firebase config:** Firebase credentials live in `config.js` (loaded by `index.html`). Buyers copy `config.example.js` → `config.js` and fill in their own values. The app detects placeholder values and falls back to offline mode gracefully.
- **BYOK (Bring Your Own Key):** Users provide their own Gemini API key via the Settings page. Key is stored in localStorage only (never sent to any server/database). When a user key is present, API calls go directly from browser to Google. Falls back to server proxy if no user key is set (for development/hosted mode).
- **API key excluded from export:** The Gemini key is intentionally excluded from data export/import for security.
- **Evidence-based progression:** Rank advancement is based on quality learning behaviors, not gamified XP systems.
- **Quiz isolation:** The Quiz Arena is a standalone tool and does not impact rank progression.

## External Dependencies

### NPM Packages
- **express v5.2.1**

### CDN Dependencies (Frontend)
- **Tailwind CSS**
- **Chart.js**
- **Firebase v11.6.1** (App, Auth, Firestore)

### External Services
- **Gemini API:** For AI study plan generation.
- **Open Trivia Database:** For the Quiz Arena.
- **Google Fonts:** Inter and Lora typefaces.