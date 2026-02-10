# Synapse - Interactive Learning OS

## Overview

Synapse is an interactive learning operating system built as a single-page web application. It provides an educational platform with features likely including progress tracking, data visualization (via Chart.js), and optional cloud persistence through Firebase. The application is served via an Express.js static file server and is primarily a frontend-heavy application with minimal backend logic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single-page application (SPA):** The entire UI lives in a single `index.html` file. All routing is handled client-side — the Express server has a catch-all route that serves `index.html` for any path.
- **Styling:** Uses Tailwind CSS loaded via CDN (`cdn.tailwindcss.com`) with a custom configuration that includes dark mode support (class-based toggle) and custom fonts (Inter for sans-serif, Lora for serif).
- **Typography:** Google Fonts are loaded for Inter (UI text) and Lora (content/reading text), suggesting a design that distinguishes between interface elements and reading content.
- **Data Visualization:** Chart.js is included via CDN for rendering charts, likely for learning progress or analytics dashboards.
- **Design Theme:** The app uses a warm, paper-like color scheme (background `#FDFCF8`, text `#2D2A26`) suggesting an educational/reading-focused aesthetic.

### Backend Architecture
- **Express.js v5:** A minimal static file server (`server.js`) that serves the frontend files. It runs on port 5000.
- **Caching:** All responses have cache-control headers set to prevent caching (`no-cache, no-store, must-revalidate`), which is useful during development.
- **SPA routing:** The catch-all route `/{*splat}` ensures all paths serve `index.html`, enabling client-side routing.
- **No API endpoints:** There are currently no backend API routes. All data logic is handled on the frontend, either locally or through Firebase.

### Data Storage
- **Firebase Firestore (optional):** The app is designed to optionally connect to Firebase for cloud persistence. It uses Firestore for document-based storage (`getDoc`, `setDoc`) and Firebase Auth for user identity.
- **Graceful degradation:** If Firebase configuration (`__firebase_config`) is not available, the app falls back to "local-only mode" without crashing. This is handled with a try-catch that sets `window.fb = null`.
- **Firebase Auth:** Supports anonymous sign-in and custom token sign-in. The auth state is tracked via `onAuthStateChanged`.
- **App ID:** Uses `__app_id` global variable for multi-tenant or app-specific data scoping in Firestore.

### Key Design Decisions

1. **CDN-based dependencies instead of a build system**
   - All frontend libraries (Tailwind, Chart.js, Firebase) are loaded from CDNs rather than bundled
   - Pros: Zero build step, simple setup, fast iteration
   - Cons: No tree-shaking, depends on CDN availability, no TypeScript support
   - This means when adding new frontend features, prefer CDN imports or inline code over npm packages for frontend libraries

2. **Firebase as optional cloud layer**
   - The app works without Firebase, storing data locally
   - When Firebase is available, it syncs data to Firestore
   - This pattern means all features should work in both modes

3. **Monolithic HTML file**
   - The entire frontend is in one `index.html` file
   - If the app grows, consider splitting into separate JS/CSS files served from the same Express static server

## External Dependencies

### NPM Packages
- **express v5.2.1** — Static file server and SPA routing

### CDN Dependencies (Frontend)
- **Tailwind CSS** — Utility-first CSS framework (loaded via CDN script)
- **Chart.js** — Charting library for data visualization
- **Firebase v11.6.1** — Suite of services loaded as ES modules:
  - `firebase-app` — Core Firebase initialization
  - `firebase-auth` — Authentication (anonymous + custom token)
  - `firebase-firestore` — Cloud document database

### External Services
- **Firebase/Firestore** — Cloud database for persisting user data (optional, requires `__firebase_config` global)
- **Firebase Authentication** — User identity management (optional)
- **Google Fonts** — Inter and Lora typefaces
- **Gemini API** — AI-powered mission plan generation (requires API key in `apiKey` variable)

## Recent Changes

### Feb 10, 2026 — Bug Fix Session
1. **Firebase crash fix:** Wrapped Firebase initialization in try-catch so the app gracefully falls back to local-only mode when `__firebase_config` is not available, instead of crashing.
2. **Charts now render:** `renderCharts()` previously only destroyed charts without creating them, and the dashboard HTML had no `<canvas>` elements. Added scatter chart (Effort vs Efficiency) and doughnut chart (Category Distribution) with full Chart.js implementations and dark mode support.
3. **Notes preservation:** Fixed bug where notes typed by the user were overwritten every time the dashboard re-rendered (e.g., after AI generation). Notes content is now preserved across re-renders.
4. **Timer controls:** Added missing Focus/Break mode toggle buttons and a Reset button to the Pomodoro timer. The code for these features existed but had no UI controls.
5. **API key validation:** The empty Gemini API key now returns a clear error message immediately instead of silently retrying 5 times and failing.
6. **Line endings:** Converted file from Windows (CRLF) to Unix (LF) line endings.