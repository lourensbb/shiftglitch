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
Primary data storage is `localStorage` for offline functionality, persisting flashcards, pomodoro logs, blurt sessions, Cornell notes, rank progress, Eisenhower Matrix tasks, dopamine recalibrator sessions, Babel Fish exercises, Growth Shield moments, and MCQ diagnostic data. Optional cloud persistence for notes and progress checkboxes is available through Firebase Firestore, with graceful degradation if unavailable. A JSON export/import feature allows for backup and restoration of all localStorage data.

### Key Features
- **Mission Architect (AI):** Gemini-powered study plan generation.
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
- **Data Management:** JSON export/import for all user data.
- **XSS Protection:** `esc()` utility for user-rendered content.

### Key Design Decisions
- **CDN-based dependencies:** No build system; libraries like Tailwind, Chart.js, and Firebase are loaded via CDNs.
- **Firebase as optional:** The application functions fully offline with `localStorage`; Firebase provides an optional cloud sync layer.
- **Monolithic HTML:** All frontend code resides in a single `index.html` file.
- **Server-side API key:** The Gemini API key is secured on the server-side via an Express proxy.
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