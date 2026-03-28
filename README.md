# Synapse — Interactive Learning OS

A study-methods operating system that turns evidence-based learning techniques into an interactive, progression-driven experience — built for teenagers who want to study smarter, not harder.

---

## Quick Start (5 minutes)

### 1. Install & Run

```bash
npm install
node server.js
```

Open your Replit URL or `http://localhost:5000` in your browser. Synapse works immediately in offline mode — no accounts or sign-up required.

### 2. Set Up AI Study Planning (Optional)

The Mission Architect uses Google's Gemini AI to generate personalised study plans.

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with any Google account
3. Click **"Create API Key"** (it's free)
4. Open Synapse, click the gear icon (Settings), and paste your key

Your key is stored in your browser only — it never touches any server.

### 3. Set Up Cloud Sync (Optional)

Firebase lets users sync their data across devices. Synapse works fully offline without it.

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Create a project**
2. In **Project Settings** → **Your apps** → click the web icon `</>`
3. Register an app name and copy the config values
4. Open `config.js` and replace the placeholder values:

```javascript
var SYNAPSE_FIREBASE_CONFIG = {
    apiKey:            "your-actual-api-key",
    authDomain:        "your-project.firebaseapp.com",
    projectId:         "your-project-id",
    storageBucket:     "your-project.firebasestorage.app",
    messagingSenderId: "123456789",
    appId:             "1:123456789:web:abc123"
};
```

5. In Firebase Console → **Authentication** → enable **Anonymous** sign-in
6. Go to **Firestore Database** → **Create database** (start in test mode)
7. Refresh Synapse — Settings will show "Connected"

---

## What's Included

| File | Purpose |
|------|---------|
| `index.html` | Full version of Synapse (all features) |
| `demo.html` | Limited demo version |
| `teacher.html` | Teacher Dashboard |
| `config.js` | Firebase credentials (edit this file) |
| `config.example.js` | Blank template for reference |
| `server.js` | Simple Express server for hosting |
| `package.json` | Node.js dependencies |
| `PRO-INSTRUCTIONS.md` | Teacher setup guide |
| `README.md` | This file — setup and reference guide |
| `JOURNAL.md` | Design philosophy and product story (marketing/promotional) |
| `revamp_vision.md` | Future evolution vision document |

---

## Full Feature List

### Core Study Tools
- **Mission Architect (AI)** — Gemini-powered personalised study plan generation
- **Learning Governor** — Pomodoro timer with streak tracking, subject tagging, and break enforcement
- **Flashcard Decks** — Full CRUD with Leitner 5-box spaced repetition and orbit stability indicators
- **Blurting Method** — 4-phase active recall technique (list, read, blurt, compare)
- **Babel Fish Metaphor Lab** — Feynman Technique tool for explaining concepts in plain language
- **Dopamine Recalibrator** — Anti-procrastination tools: Stealth Mode and Entry Rocket
- **Yet Growth Shield** — Growth mindset reframing: "I don't understand X YET"
- **Eisenhower Matrix** — Interactive task prioritisation across four urgency/importance quadrants
- **Cornell Notes** — Dotted-grid note-taking panel with cloud sync support
- **Quiz Arena** — Standalone trivia game via Open Trivia Database (isolated from rank progression)
- **MCQ Diagnostics** — 100-question multiple-choice assessment across 5 missions

### Progression System
- **Rank System** — Space Cadet → Second Officer → Flight Commander, earned through evidence of real study behaviours — not XP or points
- **Session Statistics & Charts** — Focus time scatter plots, activity bar charts, technique doughnut chart

### Teen-Focused Features (Added March 2025)
- **Dark Mode Default** — App launches in dark mode on first load; preference saved permanently
- **Phone-Lock Nudge** — Friendly reminder to put the phone face-down when a Pomodoro session starts
- **Subject Tagging** — Tag each Pomodoro session with a subject (Maths, English, Science, etc.)
- **"What I Learned?" Modal** — After every focus session, a prompt to write one thing learned; saved to a learning log
- **Exam Countdown Widget** — Dashboard sidebar tool to track upcoming exams by name and date; turns red within 7 days
- **Lofi Music Link** — One-tap link to YouTube lofi study music from within the timer panel
- **"Not Yet 🛡️" Button** — Third flashcard response option that triggers growth mindset reframing without penalising more than "Again"
- **Study Buddy System** — Copy a base64 buddy code (rank + stats), paste a friend's code for side-by-side comparison
- **Shareable Progress Report** — Generate a URL with encoded stats; opens with a banner showing rank and evidence for parents/teachers

### Data Management
- **JSON Export/Import** — Full backup and restoration of all user data
- **Export for Teacher** — Named JSON export for classroom data collection
- **XSS Protection** — `esc()` utility on all user-rendered content

---

## Teacher Dashboard

### How It Works
1. Students study using Synapse as normal
2. Students click **"Export for Teacher"** in Stats → Data Management
3. Students type their name when prompted and send the `.json` file to the teacher
4. Teacher opens `/teacher` (or `teacher.html`) and drops in all files
5. Instant class overview appears with charts and reports

### What Teachers Can See
- **Class summary** — total students, average sessions, average focus time, highest rank achieved
- **Student roster** — sortable table with rank, sessions, focus time, flashcards, blurts, and active days
- **Rank distribution chart** — doughnut chart showing how many students are at each rank
- **Activity chart** — bar chart comparing sessions across the class
- **Students needing attention** — automatic flag for students with fewer than 5 sessions or zero blurts
- **Individual student profiles** — full rank evidence bars and activity breakdown

### Printable Progress Reports
- Professional, printer-friendly student summaries
- Rank evidence progress bars showing exactly what a student needs to work on
- Print from the roster or from individual student views
- Ideal for parent-teacher conferences

---

## Hosting Options

### Option A: Replit (Recommended)
The app is already configured and running. Share the Replit URL with students.

### Option B: Run Locally
```bash
npm install
node server.js
```
Open `http://localhost:5000`

### Option C: Host on Any Static Server
Synapse is mostly a client-side app — host the HTML files on Netlify, Vercel, GitHub Pages, or any web server. The Express server is only needed for the server-side Gemini API proxy fallback.

### Option D: Open index.html Directly
For offline-only use, open `index.html` directly in any browser. AI features require the Gemini API key in Settings.

---

## Customisation

- **Branding**: Search for "Synapse" in `index.html` to rename the app
- **Accent Color**: Change `orange-600` references throughout `index.html` for a different accent
- **Quotes**: Edit the `STUDY_QUOTES` array near the top of `index.html`
- **AI Model**: Change the `AI_MODEL` variable to switch Gemini model versions

---

## Technical Notes

- **No build system needed** — all dependencies load via CDN
- **Works offline** — localStorage handles all data persistence
- **Firebase is optional** — only needed for cross-device sync
- **Gemini API is BYOK** — each user brings their own free API key (or server proxy is used as fallback)
- **XSS protected** — all user input is escaped via the `esc()` utility function
- **Express v5** — minimal server for static files and optional Gemini API proxy
- **Dark mode default** — `synapse_theme` localStorage key persists the user's theme choice

---

## Support

For questions or setup help, contact the developer directly.
