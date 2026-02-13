# Synapse — Interactive Learning OS

A study-methods operating system that turns evidence-based learning techniques into an interactive, progression-driven experience.

---

## Quick Start (5 minutes)

### 1. Install & Run

```bash
npm install
node server.js
```

Open `http://localhost:5000` in your browser. That's it — Synapse works immediately in offline mode.

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
const SYNAPSE_FIREBASE_CONFIG = {
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
| `demo.html` | Limited demo version (for marketing — links to your Gumroad) |
| `teacher.html` | Teacher Dashboard (Classroom License only) |
| `config.js` | Your Firebase credentials (edit this file) |
| `config.example.js` | Blank template for reference |
| `server.js` | Simple Express server for local hosting |
| `package.json` | Node.js dependencies |
| `LICENSE-PERSONAL.txt` | Personal use license |
| `LICENSE-CLASSROOM.txt` | Classroom use license (Classroom License only) |
| `PRO-INSTRUCTIONS.md` | Teacher setup guide (Classroom License only) |

### Full Version Features
- Mission Architect (AI study planning via Gemini)
- Learning Governor (Pomodoro timer with streak tracking)
- Flashcard Decks (Leitner 5-box spaced repetition)
- Blurting Method (4-phase active recall)
- Eisenhower Matrix (priority management)
- Quiz Arena (trivia via Open Trivia Database)
- Babel Fish Metaphor Lab (Feynman Technique)
- Dopamine Recalibrator (anti-procrastination tools)
- Yet Growth Shield (growth mindset reframing)
- MCQ Diagnostics (100-question knowledge assessment)
- Cornell Notes
- Rank Progression System (Space Cadet → Second Officer → Flight Commander)
- Session Statistics & Charts
- Data Export/Import (JSON backup)
- Export for Teacher (named exports for classroom use)
- Dark Mode

### Demo Version Features (Limited)
- Dashboard, Pomodoro, Flashcards, Matrix, Rank, Stats
- Locked tools show "Available in full version" with upgrade link
- Uses separate `demo_` localStorage keys (no data conflicts)

---

## Classroom Edition (Classroom License Only)

The Classroom License includes the **Teacher Dashboard** and **Printable
Progress Reports**. See `PRO-INSTRUCTIONS.md` for the full teacher guide.

### Teacher Dashboard (`/teacher`)
- Import student JSON export files
- View class-wide summary (ranks, sessions, focus time)
- Student roster with sortable columns
- Rank distribution and activity charts
- "Students Needing Attention" alerts
- Click into individual student profiles

### Printable Progress Reports
- Professional, printer-friendly student summaries
- Rank evidence progress bars
- Activity statistics and metrics
- Print from the roster or individual student views
- Perfect for parent-teacher conferences

### How It Works
1. Students study using Synapse as normal
2. Students click **"Export for Teacher"** in Stats → Data Management
3. Teacher collects the `.json` files
4. Teacher opens `/teacher` and drops in all files
5. Instant class overview with charts and reports

---

## Packaging for Sale

### What to include in your download:

**Standard License:**
```
synapse/
├── index.html              (full version)
├── demo.html               (demo for marketing)
├── config.js               (Firebase config — buyers edit this)
├── config.example.js       (blank backup template)
├── server.js               (Express server)
├── package.json            (dependencies)
├── LICENSE-PERSONAL.txt    (personal use license)
└── README.md               (setup instructions)
```

**Classroom License (all of the above, plus):**
```
├── teacher.html            (Teacher Dashboard)
├── LICENSE-CLASSROOM.txt   (classroom use license)
└── PRO-INSTRUCTIONS.md     (teacher setup guide)
```

**Do NOT include:**
- `node_modules/` (buyers run `npm install` themselves)
- `.git/` folder
- Any `.env` files or personal API keys

**Note:** `config.js` ships with placeholder values (same as `config.example.js`). Buyers edit `config.js` directly with their own Firebase credentials. If they delete `config.js`, the app still works — it simply runs in offline mode.

### Before packaging:

1. Make sure `config.example.js` has only placeholder values (no real keys)
2. Update the Gumroad link in `demo.html` if needed (search for `gumroad.com`)
3. Zip the folder and upload to Gumroad

---

## Hosting Options for Your Buyers

### Option A: Run locally
```bash
npm install
node server.js
```
Open `http://localhost:5000`

### Option B: Host on Replit
1. Create a new Replit project
2. Upload all files
3. Run `npm install` and start with `node server.js`
4. The app will be available at your Replit URL

### Option C: Host on any static server
Since Synapse is mostly a client-side app, buyers can host the HTML files on any web server (Netlify, Vercel, GitHub Pages, etc.). The Express server is only needed if they want the server-side Gemini proxy fallback.

### Option D: Open index.html directly
For the simplest offline use, buyers can just open `index.html` in their browser. AI features require the Gemini API key in Settings. Firebase cloud sync requires the server.

---

## Customisation

You can easily customise Synapse to make it your own:
- **Branding**: Search for "Synapse" in `index.html` to rename
- **Colors**: Change `orange-600` references for a different accent color
- **Quotes**: Edit the `STUDY_QUOTES` array near the top of `index.html`
- **AI Model**: Change `AI_MODEL` variable to use a different Gemini model

---

## Technical Notes

- **No build system needed** — all dependencies load via CDN
- **Works offline** — localStorage handles all data persistence
- **Firebase is optional** — only for cross-device sync
- **Gemini API is BYOK** — each user brings their own free API key
- **XSS protected** — all user input is escaped via the `esc()` utility function
- **Express v5** — minimal server for static files and optional API proxy

---

## Support

For questions about setup or customisation, contact the seller through their Gumroad page.
