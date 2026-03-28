# Synapse — Full App Report & User Guide

*Definitive reference document covering the current state of the app, a complete module and data inventory, and a full step-by-step user guide.*

*Last updated: March 2025*

---

## Table of Contents

1. [App Status](#1-app-status)
2. [Module Inventory](#2-module-inventory)
3. [localStorage Data Inventory](#3-localstorage-data-inventory)
4. [Rank System Reference](#4-rank-system-reference)
5. [MCQ Diagnostics Inventory](#5-mcq-diagnostics-inventory)
6. [Settings & Configuration](#6-settings--configuration)
7. [Data Management](#7-data-management)
8. [New User Guide](#8-new-user-guide)
9. [Teacher Usage Guide](#9-teacher-usage-guide)
10. [Technical Reference](#10-technical-reference)

---

## 1. App Status

### Overview

| Field | Value |
|-------|-------|
| **App name** | Synapse — Interactive Learning OS |
| **Version** | Current build (March 2025) |
| **Status** | Live and deployed on Replit |
| **Primary URL** | The Replit deployment URL for this project |
| **Demo URL** | `/demo` — limited feature preview |
| **Teacher Dashboard** | `/teacher` — separate page for classroom use |
| **Tech stack** | Express.js v5, Tailwind CSS, Chart.js, Firebase v11.6.1 (optional), Google Gemini API |
| **Data storage** | Browser localStorage (primary); Firebase Firestore (optional cloud sync) |

### Current Customisation

| Field | Value |
|-------|-------|
| **Prior customisation** | Hoërskool Roodepoort free edition (school-specific branding and Gumroad links) |
| **Current state** | All school-specific customisation has been removed. The app is now brand-neutral. |
| **App name** | Synapse — in use throughout; a full rebrand is planned as part of the upcoming commercial revamp |
| **Gumroad** | References removed; `GUMROAD_URL` set to `#` placeholder in `demo.html` |

The Hoërskool Roodepoort customisation was the first commercial deployment of the app. It has been stripped to prepare the product for a global commercial release.

### Browser Requirements

- **Recommended:** Chrome 90+, Firefox 90+, Safari 15+, Edge 90+
- **Minimum:** Any browser with ES2020 support and localStorage enabled
- **Not supported:** Internet Explorer (any version)
- **Mobile:** Fully functional on iOS Safari and Android Chrome
- **JavaScript:** Must be enabled. The app does not function without JavaScript.

### Known Limitations

| Limitation | Detail |
|-----------|--------|
| **Data is device-bound** | All study data lives in the browser's localStorage. Clearing browser data wipes all progress. Firebase sync is available but optional. |
| **No user accounts** | There is no login system. Multiple people sharing the same device/browser share the same data. |
| **AI requires API key** | The Mission Architect AI feature requires a Google Gemini API key. Without a key, AI features are unavailable. |
| **Charts require internet** | Charts are rendered by Chart.js, loaded via CDN. No internet connection means no charts (the rest of the app works offline). |
| **Export is manual** | Backing up data requires the user to manually click Export. There is no automatic backup. |
| **cornell-Notes key** | The Cornell Notes data is stored under the legacy key `cornellNotes` (no prefix). This key is intentionally preserved to avoid wiping existing notes. |

---

## 2. Module Inventory

The navigation bar has four primary destinations (Mission, Vault, Decks, Rank, Stats) and a Tools dropdown with additional modules. Below is a complete inventory.

---

### Dashboard (Mission Control)

| Field | Detail |
|-------|--------|
| **Navigation label** | Mission |
| **Route** | `dashboard` |
| **What it does** | The home screen. Displays a rotating motivational quote, the Mission Architect AI panel, Cornell Notes panel, exam countdown sidebar widget, and a "How to Use Synapse" introduction section. |
| **Data stored** | Cornell notes (key: `cornellNotes`), exam countdowns (key: `synapse_exams`). Mission tasks stored in `synapse_todos`. |
| **Rank contribution** | None directly, but completing mission tasks and saving notes supports other rank-contributing activities. |

**Subfeatures:**
- **Mission Architect (AI):** Enter a topic or goal; the AI generates a structured study plan. Requires a Gemini API key.
- **Cornell Notes:** A live, editable dotted-grid notes panel. Content is auto-saved as HTML to `cornellNotes` in localStorage. Optional cloud sync via Firebase.
- **Mission Tasks:** Checkbox-driven task list below the Cornell Notes area, saved to `synapse_todos`.
- **Exam Countdown Widget (sidebar):** Add an exam name and date; widget shows days remaining. Turns red when ≤ 7 days remain.

---

### Vault (Explore / Knowledge Base)

| Field | Detail |
|-------|--------|
| **Navigation label** | Vault |
| **Route** | `explore` |
| **What it does** | A curated reference section presenting evidence-based study strategies with explanations. Also includes a "Teen Q&A" panel with common study-method questions answered. |
| **Data stored** | None (read-only content). |
| **Rank contribution** | None. |

---

### Flashcard Decks

| Field | Detail |
|-------|--------|
| **Navigation label** | Decks |
| **Route** | `decks` |
| **What it does** | Full flashcard management. Create multiple named decks. Within each deck, create cards (front/back). Study mode uses the Leitner 5-box spaced repetition system with visual orbit stability indicators. |
| **Data stored** | Deck metadata → `synapse_decks`. All card content and Leitner box positions → `synapse_cards`. |
| **Rank contribution** | Yes — cards advancing through Leitner boxes count as rank evidence (`cardsAdvanced`). |

**Study mode controls:**
- **Again** — card returns to Box 1 (most frequent review)
- **Not Yet 🛡️** — treats the same as "Again" but triggers a YET Growth Shield mindset reframe
- **Got It** — card advances to the next box (up to Box 5 = mastered)

**Leitner Box system:**

| Box | Meaning | Review frequency |
|-----|---------|-----------------|
| Box 1 | Just learned / struggling | Most frequent |
| Box 2 | Some familiarity | Frequent |
| Box 3 | Building confidence | Moderate |
| Box 4 | Nearly mastered | Infrequent |
| Box 5 | Fully mastered | Rare |

---

### Learning Governor (Pomodoro Timer)

| Field | Detail |
|-------|--------|
| **Navigation label** | Timer (within Mission / Dashboard) |
| **Route** | Accessible from the dashboard |
| **What it does** | A Pomodoro-style focus timer. Learner sets a duration (typically 25 minutes), selects a subject tag, and starts the session. A circular progress ring counts down. Phone-lock nudge fires on start. A "What I Learned?" modal appears at session end. |
| **Data stored** | Completed sessions appended to `synapse_pomodoro_log`. WIL entries saved to `synapse_wil`. |
| **Rank contribution** | Yes — each completed session counts as one `pomodorosCompleted`. Each deliberate break taken counts as one `governorBreakdowns`. |

**Subject tags available:** Maths, English, Science, History, Life Sciences, Accounting, Business Studies, Geography, Technology, Arts, Physical Education, Other.

**Features during a session:**
- 🎵 Study Music link (opens YouTube lofi playlist in new tab)
- Phone-lock nudge notification on session start
- Pause and resume capability
- "What I Learned?" modal appears automatically on session completion

---

### Blurting Method

| Field | Detail |
|-------|--------|
| **Navigation label** | Tools → Blurt |
| **Route** | `blurt` |
| **What it does** | A guided 4-phase active recall exercise. Phase 1: write everything you know from memory. Phase 2: read your notes. Phase 3: blurt again (capture what you missed). Phase 4: compare with your notes. |
| **Data stored** | Completed blurt sessions saved to `synapse_blurt`. |
| **Rank contribution** | Yes — each completed session counts as one `blurtsCompleted`. |

**The 4 phases:**
1. **List** — Before opening any notes, write down everything you know about the topic.
2. **Read** — Open and read through your notes carefully.
3. **Blurt** — Close the notes and write down everything again, capturing what you missed.
4. **Compare** — Compare your blurt against your notes; identify the genuine gaps.

---

### Babel Fish Metaphor Lab (Feynman Technique)

| Field | Detail |
|-------|--------|
| **Navigation label** | Tools → Babel Fish |
| **Route** | `babel` |
| **What it does** | Feynman Technique implementation. Choose a concept, write a plain-language explanation as if teaching it to a 10-year-old, and optionally sketch a "stupid doodle." Exercises are saved and viewable. |
| **Data stored** | Completed exercises saved to `synapse_babel`. |
| **Rank contribution** | No direct contribution to rank counters, but builds learning depth. |

---

### Quiz Arena

| Field | Detail |
|-------|--------|
| **Navigation label** | Tools → Quiz Arena |
| **Route** | `quiz` |
| **What it does** | A standalone trivia game using the Open Trivia Database API. Choose a category, difficulty, and number of questions. Timed answers with a visual countdown ring. Score tracked per session. |
| **Data stored** | None persisted to localStorage. Quiz history is session-only. |
| **Rank contribution** | **None.** Deliberately isolated from the rank system to maintain integrity. |

---

### Eisenhower Matrix

| Field | Detail |
|-------|--------|
| **Navigation label** | Tools → Matrix |
| **Route** | `matrix` |
| **What it does** | An interactive task prioritisation tool. Add tasks and drag/sort them into four quadrants: Do (urgent + important), Schedule (important, not urgent), Delegate (urgent, not important), and Eliminate (neither). Each quadrant has a reflection prompt. |
| **Data stored** | All tasks and quadrant assignments saved to `synapse_eisenhower`. |
| **Rank contribution** | None. |

---

### Dopamine Recalibrator

| Field | Detail |
|-------|--------|
| **Navigation label** | Tools → Recalibrator |
| **Route** | `recal` |
| **What it does** | Anti-procrastination tools. **Stealth Mode** breaks a session into tiny, non-threatening micro-tasks to reduce the psychological weight of starting. **Entry Rocket** provides a high-energy motivational launch sequence for getting into study mode quickly. |
| **Data stored** | Session usage counts saved to `synapse_recal`. |
| **Rank contribution** | None. |

---

### Nav Check (MCQ Diagnostics)

| Field | Detail |
|-------|--------|
| **Navigation label** | Tools → Nav Check |
| **Route** | `diagnostic` |
| **What it does** | A 100-question multiple-choice diagnostic across 5 themed missions, each with 20 questions. Tests knowledge of the learning science that underpins Synapse's tools. Tracks attempts, scores, and knowledge gaps. Provides reflection prompts for incorrect answers. |
| **Data stored** | All attempt history, scores, and identified knowledge gaps saved to `synapse_mcq`. |
| **Rank contribution** | Yes — each completed mission counts as one `diagnosticsCompleted`. |

---

### YET Growth Shield

| Field | Detail |
|-------|--------|
| **Navigation label** | Accessible via flashcard "Not Yet" button and within the Vault |
| **Route** | `yet` (or triggered contextually) |
| **What it does** | Growth mindset reframing tool. When a learner acknowledges not knowing something, it reframes the moment: "I don't understand X" becomes "I don't understand X YET." Saves growth moments to a log. |
| **Data stored** | Growth moments saved to `synapse_yet`. |
| **Rank contribution** | None directly. |

---

### Rank Page

| Field | Detail |
|-------|--------|
| **Navigation label** | Rank |
| **Route** | `rank` |
| **What it does** | Displays the learner's current rank, progress bars showing evidence toward the next rank, and all six evidence counters. Also hosts the Study Buddy system and Shareable Progress Report tools. |
| **Data stored** | Rank level and all evidence counters saved to `synapse_rank`. Buddy codes and shared report URLs are generated on demand and not stored. |
| **Rank contribution** | This page reads rank data; it does not generate it. |

**Study Buddy:** Generate a compact base64 code containing your rank and stats. Share it with a friend. Paste their code to see a side-by-side comparison.

**Shareable Progress Report:** Generates a URL containing encoded stats. When anyone opens that URL, they see an orange banner displaying the student's rank and evidence summary.

---

### Stats

| Field | Detail |
|-------|--------|
| **Navigation label** | Stats |
| **Route** | `stats` |
| **What it does** | Detailed session statistics and charts. Focus time scatter plot, activity bar chart, technique usage doughnut chart, and a session log. Also contains the Data Management controls. |
| **Data stored** | Reads from all modules. No new data written here. |
| **Rank contribution** | None. |

---

### Settings

| Field | Detail |
|-------|--------|
| **Navigation label** | Gear icon (⚙️) |
| **Route** | `settings` |
| **What it does** | Manage the Gemini API key: paste, save, view (masked), and remove. Step-by-step setup instructions included. Shows Firebase connection status. Theme toggle also accessible from the nav bar. |
| **Data stored** | Gemini API key → `synapse_gemini_key`. Theme preference → `synapse_theme`. |
| **Rank contribution** | None. |

---

## 3. localStorage Data Inventory

All data is stored in the browser's localStorage. Clearing browser data or using a different browser or device loses all data (unless Firebase sync is active).

**Total keys:** 16 (15 using the `synapse_` prefix + 1 legacy key)

| Key | Owner module | Format | Written when | Read when | Exported? |
|-----|-------------|--------|-------------|-----------|-----------|
| `synapse_decks` | Flashcard Decks | JSON array `{ id, name, createdAt }` | Creating or deleting a deck | Decks page loads; stats render | Yes |
| `synapse_cards` | Flashcard Decks | JSON array `{ id, deckId, front, back, box, lastReviewed }` | Creating, editing, or deleting a card; after each flashcard review (box updated) | Deck opened; study session starts | Yes |
| `synapse_pomodoro_log` | Learning Governor | JSON array `{ task, duration, completedAt, subject }` | Pomodoro session completes; break taken (task = `'__breakdown__'`) | Stats page renders; rank evidence calculated on app load | Yes |
| `synapse_blurt` | Blurting Method | JSON array `{ topic, phase1, phase3, gaps, createdAt }` | Blurt session marked complete (phase 4) | Blurt history renders; rank evidence calculated on app load | Yes |
| `synapse_todos` | Dashboard (Cornell) | JSON array `{ id, text, done }` | Adding, checking, or deleting a mission task | Dashboard renders | Yes |
| `synapse_eisenhower` | Eisenhower Matrix | JSON array `{ id, text, quadrant, createdAt }` | Adding a task; moving a task between quadrants; deleting a task | Matrix page renders | Yes |
| `synapse_recal` | Dopamine Recalibrator | JSON object `{ stealthCount, rocketCount, sessions[] }` | Using Stealth Mode or Entry Rocket | Recalibrator page renders | Yes |
| `synapse_babel` | Babel Fish | JSON array `{ concept, explanation, doodle, createdAt }` | Saving a Babel Fish exercise | Babel Fish page renders; history section loads | Yes |
| `synapse_yet` | YET Growth Shield | JSON array `{ topic, createdAt }` | Logging a YET moment (from flashcard "Not Yet" button or YET page) | YET page renders | Yes |
| `synapse_rank` | Rank System | JSON object `{ rank, rankEvidence: { pomodorosCompleted, blurtsCompleted, governorBreakdowns, cardsAdvanced, activeDays, diagnosticsCompleted } }` | Any rank-contributing action (session complete, blurt complete, card advanced, diagnostic completed); on promotion | App boot; Rank page renders; nav bar rank badge updates | Yes |
| `synapse_mcq` | MCQ Diagnostics | JSON object `{ attempts: { missionId: { score, answers[] } }, gaps: string[] }` | On mission submit (score saved); when a gap topic is identified | Diagnostic page renders; rank evidence calculated | Yes |
| `synapse_exams` | Exam Countdown | JSON array `{ name, date }` | Adding or removing an exam | Dashboard sidebar widget renders | Yes |
| `synapse_wil` | Learning Governor | JSON array `{ text, date, subject }` | Saving a "What I Learned?" modal entry after a Pomodoro session | Stats → WIL log renders | Yes |
| `synapse_theme` | App-wide | String `"dark"` or `"light"` | Toggling the moon/sun icon in the nav bar | On every page load (before render — applied to `<html>` immediately) | Yes |
| `synapse_gemini_key` | Settings | String (plain API key) | Saving the key in Settings | On every Gemini API call (read before each request) | **No — excluded for security** |
| `cornellNotes` | Dashboard (Cornell) | HTML string | Auto-saved as user types in the Cornell Notes panel | Dashboard renders; Cornell Notes panel populates | Yes |

**Notes:**
- `synapse_gemini_key` is excluded from all exports. It must be re-entered if moved to a new browser or device.
- `cornellNotes` has no prefix — this is a legacy key retained intentionally to avoid data loss for existing users.
- `synapse_pomodoro_log` entries with `task === '__breakdown__'` are deliberate break events (governor breakdowns counted toward rank), not study sessions.
- `synapse_theme` is read at the very first line of the page `<script>` block and applied to `<html>` before the rest of the DOM renders, preventing a light-mode flash on dark-mode preference.

---

## 4. Rank System Reference

The rank system is the core progression spine. Promotion is permanent — once earned, a rank cannot be lost. Advancement requires demonstrated consistency across multiple study methods, not just one.

### The Three Ranks

| Rank | Starting condition |
|------|--------------------|
| **Space Cadet** | Default — all new users begin here |
| **Second Officer** | Earned by meeting all six criteria below |
| **Flight Commander** | Earned by meeting all six higher criteria below |

### Promotion Requirements

| Evidence type | Second Officer | Flight Commander |
|--------------|---------------|-----------------|
| Pomodoro sessions completed | 15 | 50 |
| Blurt sessions completed | 10 | 30 |
| Governor breakdowns taken | 10 | 30 |
| Flashcard advances (cards moved to higher Leitner boxes) | 50 | 150 |
| Active study days | 7 | 21 |
| MCQ Diagnostic missions completed | 2 | 5 |

**Important:** All six criteria must be met simultaneously. Meeting five out of six is not sufficient. A learner who completes 100 Pomodoros but never blurts will remain a Space Cadet.

### Evidence Tracking

The `synapse_rank` localStorage key stores all six evidence counters alongside the current rank level. The Rank page displays each counter with a progress bar showing how close the learner is to their next promotion.

---

## 5. MCQ Diagnostics Inventory

The Nav Check (MCQ Diagnostics) consists of five missions, each containing 20 multiple-choice questions. All 100 questions must be completed to unlock Flight Commander.

| Mission | Name | Subtitle | Topic Area | Questions |
|---------|------|----------|-----------|-----------|
| 1 | The Launchpad | Crisis & Brain Science | Neuroplasticity, memory formation, the forgetting curve, cortisol and stress, focused/diffuse thinking modes, active recall vs. passive rereading | 20 |
| 2 | Navigation Systems | Study Methods | Pomodoro Technique, Cornell Notes, Feynman Method, Leitner spaced repetition, interleaving, dual coding, SQ3R, THIEVES, elaborative interrogation, mind mapping | 20 |
| 3 | Galactic Engineers | Thinkers & Habits | Deep Work (Cal Newport), habit stacking (James Clear), cognitive load theory, Eisenhower Matrix, Pareto Principle, GTD system, identity-based habits, Zeigarnik Effect | 20 |
| 4 | Avoid the Black Holes | Systems & Tactics | Procrastination, backward planning, focus zones, the External Device Rule, weekly review, ABCDE prioritisation, mock testing, shutdown rules, batching, MoSCoW method | 20 |
| 5 | Life Support & Hero State | Wellbeing & Mastery | Sleep and memory consolidation, box breathing, anxiety reappraisal, nutrition for cognitive performance, growth mindset, exercise and learning, identity-based success, the Yet Game | 20 |

**Access:** Missions are shown in order. Completing Mission 1 unlocks Mission 2, and so on (access-gated).

**Scoring:** Each attempt is recorded with the score and individual answers. Knowledge gaps (topics with repeated incorrect answers) are saved and highlighted.

**Rank contribution:** Each completed mission counts as one `diagnosticsCompleted` toward rank promotion. All 5 missions completed is required for Flight Commander.

---

## 6. Settings & Configuration

### Gemini API Key (AI Study Planning)

The Mission Architect uses Google's Gemini AI. The key is stored in your browser only and never sent to any external server.

**To set up your key:**
1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with any Google account
3. Click "Create API Key" — it is free
4. Open Synapse, click the gear icon (⚙️) in the navigation bar
5. Paste your key into the API key field and click Save

**What changes:** A masked version of your key is shown in Settings. The Mission Architect panel on the dashboard becomes active.

**To remove your key:** Click "Remove Key" in Settings. The key is immediately deleted from localStorage.

**Important:** If you export your data and re-import it on another device, the Gemini key is not included. You will need to re-enter it on the new device.

### Theme (Dark / Light Mode)

The app launches in dark mode by default on first use. The current theme is saved permanently to `synapse_theme`.

To toggle: click the moon (🌙) icon in the navigation bar. This switches between dark and light mode and saves the preference immediately.

### Firebase Cloud Sync (Optional)

Firebase sync enables the Cornell Notes and progress checkboxes to sync across multiple devices. The app runs fully offline without it.

**Status indicator:** In Settings, the Firebase connection status shows "Connected" (if configured) or "Offline" (if not configured or unavailable).

**To configure Firebase:** See the Quick Start section in `README.md` for step-by-step Firebase setup instructions.

---

## 7. Data Management

All data management controls are in **Stats → Data Management**.

### Export Your Data (Full Backup)

Click **"Export All Data"**. A JSON file downloads to your device. This file contains all study data across all modules. Import this file on any device to restore your data.

**What is included:** All 15 `synapse_*` localStorage keys + `cornellNotes`.

**What is excluded:** `synapse_gemini_key` (API key, never exported for security).

### Import Data

Click **"Import Data"** and select a previously exported JSON file. This overwrites your current data with the imported data.

**Warning:** Importing replaces all current data. Export your current data first if you want to preserve it.

### Export for Teacher

Click **"Export for Teacher"**. You will be prompted to enter your name. A JSON file downloads with your name embedded. Send this file to your teacher for use in the Teacher Dashboard.

**What teachers can see:** All study data including rank, sessions, flashcards, and blurt counts. Your Gemini API key is never included.

### Study Buddy Code (Rank Page)

On the Rank page, click **"Generate Buddy Code"** to create a compact code that represents your rank and stats. Copy it and share it with a friend. Paste a friend's code into the input field to see a side-by-side comparison of ranks and progress.

Codes are not stored anywhere — they are generated fresh each time.

### Shareable Progress Report (Rank Page)

On the Rank page, click **"Share Progress"**. This generates a URL containing your encoded stats. When anyone opens that URL, they see an orange banner showing your rank and evidence counters. This is designed for sharing with parents or teachers.

No data is stored on any server. The stats are encoded directly in the URL.

---

## 8. New User Guide

*This section is written for a student who has never opened Synapse before.*

---

### First Time Opening the App

When you first open Synapse, you will notice:

- The app loads in **dark mode** — a warm, dark background. This is the default. You can switch to light mode at any time using the moon icon (🌙) in the top navigation bar.
- Your rank in the top right shows **Space Cadet** — your starting rank. This will change as you study.
- The main page (called Mission Control) has two columns: the Cornell Notes area on the left and the Mission Architect AI panel on the right.

You are already good to go. No account, no sign-up, no password.

---

### Finding Your Way Around

The navigation bar at the top has all the main sections:

| Navigation item | What it is |
|----------------|-----------|
| **Mission** | Home — Cornell notes, AI study planner, exam countdown |
| **Vault** | Reference guides on study techniques, Q&A |
| **Decks** | Flashcard decks with spaced repetition |
| **Tools** | Blurt, Babel Fish, Quiz Arena, Matrix, Recalibrator, Nav Check |
| **Rank** | Your rank page and progress bars |
| **Stats** | Session history, charts, data export |
| **⚙️** | Settings — AI key, theme, Firebase status |

On a phone, tap the hamburger menu (☰) to open the navigation.

---

### Starting Your First Study Session

The focus timer is the core of Synapse. Here is how to use it.

1. From the **Mission** page, look for the **Learning Governor** timer section.
2. Choose your **subject** from the dropdown (Maths, English, Science, etc.).
3. Set your focus duration — 25 minutes is the standard Pomodoro interval. You can adjust this.
4. Click **Start**.
5. A notification will appear: **"Put your phone face-down."** This is a reminder to reduce distractions. Do it.
6. The circular timer begins counting down.
7. Study. Do not check your phone or social media during the session.
8. When the timer reaches zero, a **"What I Learned?"** modal appears. Write one sentence about something you just learned. It takes 10 seconds and significantly helps retention.
9. Click **"Save It 🧠"** (or Skip if you really must).

Your session is now saved. Repeat this process consistently to build your rank evidence.

---

### Creating Your First Flashcard Deck

1. Click **Decks** in the navigation bar.
2. Click **"New Deck"** and type a name (e.g., "Biology — Cell Division").
3. Click **"Create"**.
4. You are now inside your new deck. Click **"Add Card"**.
5. Type the question or term on the **front**, and the answer or definition on the **back**.
6. Click **"Save"**.
7. Repeat until you have at least 10 cards.

**To study your deck:**
1. Click **"Study"** on any deck.
2. A card appears. Try to recall the answer mentally before flipping it.
3. Click the card to flip it and see the answer.
4. Choose your response:
   - **Again** — you got it wrong or blank. Card returns to Box 1.
   - **Not Yet 🛡️** — you could not remember, but you want a growth mindset moment instead of just "Again".
   - **Got It** — you got it right. Card advances to the next Leitner box.
5. Keep going until all cards in the session have been reviewed.

Cards that reach Box 5 are considered mastered. Cards in Box 1 reappear most often. This is spaced repetition working for you.

---

### Trying the Blurting Method

1. Click **Tools → Blurt** in the navigation.
2. Enter the **topic** you are studying (e.g., "The Water Cycle").
3. Click **Start Blurting**.

**Phase 1 — List:** A blank text area appears. Write down everything you already know about this topic. Do not open your notes yet. Just write freely from memory.

**Phase 2 — Read:** The app prompts you to now open your notes/textbook and read through the topic carefully. Take 5-10 minutes.

**Phase 3 — Blurt:** Close your notes. Write down everything again, this time capturing the things you missed in Phase 1. Add them in a different colour if you like.

**Phase 4 — Compare:** Compare what you wrote to your notes. The gaps you find are your genuine knowledge gaps — the things that need more work.

Click **Complete** to save the session. This counts as one blurt toward your rank.

---

### Using the AI Study Planner

*Requires a Gemini API key. See Settings & Configuration, section 6.*

1. On the **Mission** page, find the **Mission Architect** panel.
2. Type a description of what you want to study:
   - *"I have a Maths exam in 10 days covering quadratic equations and functions"*
   - *"Help me understand the French Revolution for a History essay"*
   - *"Create a 2-week plan to master organic chemistry"*
3. Click **Generate Plan**.
4. The AI creates a personalised, structured study plan in seconds.
5. Read through it. Copy sections into your Cornell Notes if useful.

---

### Reading Your Rank Page

1. Click **Rank** in the navigation bar.
2. You will see your current rank displayed prominently (Space Cadet to start).
3. Below it are **six progress bars** showing your rank evidence:
   - Pomodoro sessions completed
   - Blurt sessions completed
   - Governor breakdowns taken (deliberate breaks during sessions)
   - Flashcard advances (cards moved up through Leitner boxes)
   - Active study days
   - Diagnostic missions completed
4. When all six bars reach the required thresholds, you are promoted automatically.

**Second Officer thresholds:** 15 Pomodoros, 10 blurts, 10 breakdowns, 50 card advances, 7 active days, 2 diagnostics.

**Flight Commander thresholds:** 50 Pomodoros, 30 blurts, 30 breakdowns, 150 card advances, 21 active days, 5 diagnostics.

---

### Adding an Exam Countdown

1. On the **Mission** page, find the **Exam Countdown** widget in the right sidebar.
2. Click **"Add Exam"**.
3. Enter the name of the exam (e.g., "Maths Paper 1") and the date.
4. Click **Add**.
5. The widget now shows how many days remain. When fewer than 7 days remain, the count turns red.

You can add multiple exams. Remove them by clicking the × icon when the exam has passed.

---

### Sharing Your Progress

**With a friend (Study Buddy):**
1. Go to the **Rank** page.
2. Click **"Generate Buddy Code"**.
3. Copy the code and send it to a friend (message, WhatsApp, etc.).
4. Ask your friend to go to their Rank page, paste your code, and click Load.
5. They will see a side-by-side comparison of your stats vs. theirs.
6. You can do the same with their code.

**With a parent or teacher:**
1. Go to the **Rank** page.
2. Click **"Share Progress"**.
3. A URL is generated. Copy it.
4. Send the URL to a parent or teacher. When they open it, they see a clear summary of your rank and evidence.

---

### Useful Tips for New Users

- **Study every day, even briefly.** Active days are counted as a rank requirement. Seven active days requires using the app on seven different calendar days.
- **Use multiple tools.** The rank system requires evidence across all six categories. You cannot rank up by doing only Pomodoros or only flashcards.
- **Blurt regularly.** Blurting is the highest-value technique for most subjects. Even one blurt per subject topic makes a significant difference.
- **Export your data regularly.** Go to Stats → Data Management and export a backup every few weeks. If you clear your browser data, your progress will be gone unless you have a backup.
- **Do the Nav Check missions.** They require diagnostic completions and take about 10-15 minutes each. They also teach you the science behind why these tools work.

---

## 9. Teacher Usage Guide

### Overview

Teachers collect progress data from their students and view it in the Teacher Dashboard (`/teacher`). No accounts or setup are required beyond accessing the URL.

---

### Step 1: Have Students Export Their Data

1. Students open Synapse in their browser.
2. Students click **Stats** in the navigation bar.
3. Students scroll to the **Data Management** section.
4. Students click the orange **"Export for Teacher"** button.
5. Students type their first and last name when prompted.
6. A `.json` file downloads to their device.
7. Students send this file to the teacher — by email, shared folder, messaging app, or USB.

**Important:** "Export for Teacher" is different from "Export All Data." The teacher export tags the file with the student's name automatically.

---

### Step 2: Open the Teacher Dashboard

Navigate to `/teacher` on your Synapse URL (e.g., `https://your-replit-url.replit.app/teacher`).

Alternatively, if you have the files locally, open `teacher.html` directly in your browser.

---

### Step 3: Import Student Files

1. You will see a **drag-and-drop zone** on the Teacher Dashboard.
2. Drag all student `.json` files into the zone at once, or click to browse and select them.
3. The dashboard loads automatically.

You can add more files later without losing the ones already loaded. Simply drag additional files onto the zone.

---

### Step 4: Reading the Class Overview

After importing, you will see:

**Summary cards** (top row):
- Total students loaded
- Average focus sessions per student
- Average focus time across the class
- Highest rank achieved in the class

**Student Roster:**
A sortable table showing each student's rank, session count, focus time, flashcard count, blurt count, and active days.

**Rank Distribution Chart:**
A doughnut chart showing how many students are at each rank level.

**Class Activity Chart:**
A bar chart comparing total focus sessions across students. Easy to spot who is most and least active.

**Students Needing Attention:**
Automatically flagged students with fewer than 5 focus sessions or zero blurt sessions. These students may need a check-in.

---

### Step 5: Viewing Individual Student Profiles

Click **"View"** next to any student in the roster. You will see:

- Their current rank
- Key stats: sessions, focus time, blurt count, active days, flashcard count, decks, Babel Fish exercises, growth moments
- **Rank evidence progress bars** — showing exactly where they stand toward their next rank across all six criteria
- Additional activity counts: diagnostic attempts, growth moments, tasks completed

Click the back arrow to return to the class overview.

---

### Step 6: Printing Progress Reports

**For a single student:**
1. From the class overview, click **"Print"** next to a student's name in the roster.
2. A printer-friendly report opens in a new tab.
3. Your browser's print dialog opens automatically.
4. Print to paper or save as PDF.

Alternatively, from a student's detail profile, click **"Print Report"** in the top right.

**For the whole class:**
1. Click **"Print Class Report"** in the top navigation bar of the Teacher Dashboard.
2. This prints the full class overview: summary cards, roster, and charts.

Reports are formatted professionally and are suitable for parent-teacher conferences, record-keeping, and class performance reviews.

---

### Tips for Teachers

**Establishing a data collection routine:**
- Set a "Export Friday" routine — students export and send their files every Friday.
- Drop all files into the Teacher Dashboard for a weekly check-in.
- Track progress toward rank promotion — students who are close can be specifically encouraged.

**Using progress reports:**
- Print reports before parent-teacher meetings.
- Use rank evidence bars to show parents specifically what their child needs to work on.
- Reports include activity timestamps so you can track improvement over time.

**Flagged students:**
- The "Students Needing Attention" section automatically identifies students with minimal activity.
- Common interventions: help them create their first flashcard deck, walk them through the blurting method, set a specific study target for the coming week.

**Motivating students with ranks:**
- Space Cadet → Second Officer is achievable within a few weeks of consistent use.
- Flight Commander is a genuine, significant achievement — celebrate it publicly.
- Emphasise that ranks are permanent — there is no risk of losing progress.

---

## 10. Technical Reference

### File Structure

| File | Size (approx.) | Purpose |
|------|---------------|---------|
| `index.html` | ~2,840 lines | The complete student-facing SPA. All app logic, rendering, and state management in a single file. |
| `demo.html` | ~2,000 lines | Limited demo version — same visual structure, reduced features. |
| `teacher.html` | ~590 lines | Teacher Dashboard — standalone page for classroom reporting. |
| `server.js` | ~56 lines | Express v5 server: static file serving, Gemini API proxy endpoint, route handling. |
| `config.js` | ~10 lines | Firebase credentials. Use `var` (not `const`) so it loads before module scripts. Edit this file to enable Firebase. |
| `config.example.js` | ~20 lines | Blank template for `config.js`. Copy and fill in your Firebase credentials. |
| `package.json` | ~10 lines | Node.js project manifest. One dependency: `express`. |
| `README.md` | — | Quick start guide, feature list, hosting options, customisation notes. |
| `PRO-INSTRUCTIONS.md` | — | Full teacher/classroom setup and usage guide. |
| `JOURNAL.md` | — | Design philosophy and product story (marketing/promotional document). |
| `revamp_vision.md` | — | Future vision and commercial roadmap document. |
| `REPORT.md` | — | This document — full app inventory and user guide. |

---

### Server Routes

The Express server (`server.js`) handles the following routes:

| Route | Method | What it does |
|-------|--------|-------------|
| `/api/gemini` | POST | Gemini API proxy. Forwards the request to Google using the server-side `GEMINI_API_KEY` environment variable. Used only when the user has not set their own key in Settings. |
| `/teacher` | GET | Serves `teacher.html` |
| `/demo` | GET | Serves `demo.html` |
| `/{*splat}` | GET | Catch-all — serves `index.html` for all other routes (SPA routing) |
| `/*` (static) | GET | Serves any file from the project root directory directly |

**Port:** The server listens on port `5000`, bound to `0.0.0.0` (all interfaces).

**Headers:** All responses include `Cache-Control: no-cache, no-store, must-revalidate` to prevent stale content.

---

### CDN Dependencies

All frontend dependencies are loaded via CDN — no build system is required.

| Library | CDN URL | What it provides |
|---------|---------|-----------------|
| Tailwind CSS | `cdn.tailwindcss.com` | Utility-first CSS framework. Dark mode via `class` strategy. |
| Chart.js | `cdn.jsdelivr.net/npm/chart.js` | Charts: scatter (focus sessions), doughnut (technique breakdown), bar (weekly activity) |
| Firebase App | `gstatic.com/firebasejs/11.6.1/firebase-app.js` | Firebase initialisation |
| Firebase Auth | `gstatic.com/firebasejs/11.6.1/firebase-auth.js` | Anonymous authentication for Firebase |
| Firebase Firestore | `gstatic.com/firebasejs/11.6.1/firebase-firestore.js` | Cloud document storage |
| Google Fonts | `fonts.googleapis.com` | Inter (sans-serif body) and Lora (serif headings) |

---

### External API Services

| Service | What it is used for | Requires key? |
|---------|-------------------|--------------|
| **Google Gemini API (gemini-2.0-flash)** | AI study plan generation in Mission Architect | Yes — user's own key (BYOK) or server-side key |
| **Open Trivia Database** | Question pool for the Quiz Arena | No — public API, no key required |
| **Firebase Firestore** | Optional cloud sync for Cornell notes and checkboxes | Yes — Firebase project credentials in `config.js` |

---

### NPM Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | v5.2.1 | HTTP server framework — static file serving and API proxy |

No other packages are installed. No build tools, bundlers, or transpilers are used.

---

### Environment Variables

| Variable | Required? | Used by | Purpose |
|----------|----------|---------|---------|
| `GEMINI_API_KEY` | Optional | `server.js` | Server-side Gemini API proxy fallback. If not set, the server returns an error when proxy is used. Users with their own key in Settings bypass this entirely. |

---

### Security Notes

- **XSS protection:** All user-generated content rendered in the DOM is passed through the `esc()` utility function, which escapes HTML entities before rendering.
- **API key isolation:** The Gemini key is stored in `localStorage` under `synapse_gemini_key`. It is excluded from all data exports. It is not transmitted to any server when the user's own key is used — API calls go directly from the browser to Google's servers.
- **No user accounts:** The app does not collect, store, or transmit personally identifiable information. All data stays in the user's browser.
- **Firebase anonymous auth:** If Firebase is configured, the app signs in anonymously — no email, password, or personal information is required.
- **Content Security:** No `eval()` or dynamic script injection is used in the application code.

---

### Deployment Notes

**On Replit:**
The workflow command `node server.js` starts the server. The app is available at the Replit deployment URL. No additional configuration is required.

**On a local machine:**
```bash
npm install
node server.js
```
Open `http://localhost:5000` in your browser.

**As a static site (no AI proxy):**
Host `index.html`, `teacher.html`, `demo.html`, and `config.js` on any static web host (Netlify, Vercel, GitHub Pages, etc.). The Gemini server proxy won't work — users must provide their own key in Settings.

**Opening `index.html` directly:**
Works for fully offline use. All features except the Gemini server proxy (which requires the Express server) function normally. Users who provide their own Gemini key in Settings will still have AI features.

---

*Synapse — Interactive Learning OS*
*REPORT.md — Full App Report & User Guide*
*Current as of March 2025.*
