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
| `config.js` | Your Firebase credentials (edit this file) |
| `config.example.js` | Blank template for reference |
| `server.js` | Simple Express server for local hosting |
| `package.json` | Node.js dependencies |

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
- Dark Mode

### Demo Version Features (Limited)
- Dashboard, Pomodoro, Flashcards, Matrix, Rank, Stats
- Locked tools show "Available in full version" with upgrade link
- Uses separate `demo_` localStorage keys (no data conflicts)

---

## Packaging for Sale

### What to include in your download:

```
synapse/
├── index.html           (full version)
├── demo.html            (demo for marketing)
├── config.js            (Firebase config — buyers edit this with their keys)
├── config.example.js    (blank backup template for reference)
├── server.js            (Express server)
├── package.json         (dependencies)
└── README.md            (this file — setup instructions for buyers)
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

## Pricing Recommendations

| Price | Strategy |
|-------|----------|
| **$19–29** | Sweet spot for indie digital tools on Gumroad — affordable for students, high enough to signal quality |

### Pricing tips:

- Start at **$19** to build initial reviews and social proof, then raise to $29
- Offer a **launch discount** (e.g., "Launch price: $14, normally $29")
- Use Gumroad's **"pay what you want"** with a minimum of $14–19
- The **demo version drives conversions** — let people try the core features before buying
- Consider a **license tier**: personal use ($19) vs. classroom/school use ($99)

---

## Customisation for Buyers

Buyers can easily customise:
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
