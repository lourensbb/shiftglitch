# Synapse Classroom Edition — Teacher Instructions

Welcome to the Synapse Classroom License. This guide walks you through
everything you need to set up Synapse for your students, collect their
progress data, and use the Teacher Dashboard and Progress Reports.

---

## What's Included in the Classroom Edition

Everything in the Standard edition, plus:

- **Teacher Dashboard** (`teacher.html`) — A dedicated page where you
  can import student data files and see a class-wide overview of
  progress, ranks, study hours, and activity.
- **Printable Progress Reports** — Generate clean, professional
  reports for each student that you can print for parent conferences,
  records, or feedback.
- **Export for Teacher** button — Built into the student app so
  students can export their data in a teacher-friendly format with
  their name attached.
- **Classroom License** — Permission to deploy Synapse across your
  entire school, classroom, or tutoring centre.

---

## Quick Start (5 Minutes)

### Step 1: Set Up Synapse for Your Students

1. Follow the standard setup in `README.md` to get Synapse running
2. Each student opens Synapse in their browser
3. Students use the app to study — no accounts needed, everything
   saves to their device automatically

### Step 2: Collecting Student Data

When you want to see progress:

1. Ask students to go to **Stats** (in the navigation bar)
2. Scroll down to **Data Management**
3. Click the orange **"Export for Teacher"** button
4. Students type their name when prompted
5. A `.json` file downloads to their device
6. Students send that file to you (email, shared folder, USB, etc.)

### Step 3: Using the Teacher Dashboard

1. Open `teacher.html` in your browser (or go to `/teacher` if hosted)
2. You'll see a drag-and-drop zone
3. Drop all your student `.json` files into the zone
   (or click to browse and select them)
4. The dashboard loads automatically showing:
   - **Class summary** — total students, average sessions, average
     focus time, highest rank achieved
   - **Student roster** — sortable table with each student's rank,
     sessions, focus time, flashcards, blurts, and active days
   - **Rank distribution chart** — doughnut chart showing how many
     students are at each rank
   - **Activity chart** — bar chart comparing sessions across students
   - **Students needing attention** — flags students with fewer than
     5 focus sessions or zero blurt sessions

### Step 4: Viewing Individual Students

1. Click **"View"** next to any student in the roster
2. See their full profile including:
   - All activity stats (sessions, focus time, decks, cards, etc.)
   - Rank evidence progress bars (how close they are to promotion)
   - Additional activity (diagnostics, growth moments, tasks)
3. Click the back arrow to return to the class overview

### Step 5: Printing Progress Reports

**For a single student:**
1. Click **"Print"** in the roster, or **"Print Report"** on a
   student's detail page
2. A clean, professional report opens in a new tab
3. Your browser's print dialog appears automatically
4. Print to paper or save as PDF

**For the whole class:**
1. Click **"Print Class Report"** in the top navigation bar
2. This prints the class overview page (summary cards, roster, charts)

---

## Classroom Deployment Options

### Option A: Students Open the File Directly (Simplest)

1. Put `index.html` on each student's computer (USB, shared drive, etc.)
2. Students double-click to open it in their browser
3. No server needed — everything works offline
4. AI features require each student to set up their own Gemini API key
   in Settings (or skip AI features entirely)

### Option B: Host on Your School Network

1. Place all Synapse files in a folder on your school's web server
   or shared network drive
2. Run `npm install` then `node server.js` on the server
3. Students access Synapse by typing the server address in their browser
4. All students share the same URL but data stays on each device

### Option C: Host Online (for Remote/Hybrid Classes)

1. Deploy to any web hosting service (see `README.md` for options)
2. Share the URL with your students
3. Students access from any device with a browser
4. Optional: set up Firebase for cloud sync (see `README.md`)

---

## Tips for Teachers

### Getting Students Started

- Show students the **"How to Use Synapse"** section on the dashboard
- Start with the **Focus Timer** (Pomodoro) — it's the easiest entry point
- Introduce **Flashcard Decks** next — students can create cards for
  any subject
- The **Blurting Method** is excellent for essay-based subjects
- **Babel Fish** (Feynman Technique) works well for science and maths

### Motivating Students with Ranks

- All students start as **Space Cadet**
- Promotion to **Second Officer** requires consistent use of multiple
  study methods (not just one)
- **Flight Commander** is a real achievement — celebrate it!
- Ranks are permanent — once earned, they can't be lost
- Use the Teacher Dashboard to track who's close to promotion

### Collecting Data Regularly

- Set a weekly or fortnightly routine: "Export Friday"
- Students export their data every Friday and send it to you
- Drop all files into the Teacher Dashboard for a weekly check-in
- Keep an eye on the "Students Needing Attention" section

### Using Progress Reports

- Print reports before parent-teacher conferences
- Use reports to set goals with individual students
- Rank evidence bars show exactly what a student needs to work on
- Reports include dates so you can track improvement over time

---

## Troubleshooting

**"A student's file won't import"**
- Make sure they clicked "Export for Teacher" (not just "Export")
- The file should be a `.json` file
- Try having the student export again

**"Student data looks empty"**
- The student may not have used the app much yet
- Check that they've been using the same browser/device each time
- If they cleared their browser data, their progress is lost
  (this is why regular exports are important)

**"I can't see the Teacher Dashboard"**
- Open `teacher.html` directly in your browser, or
- If hosted, navigate to `/teacher` on your server URL

**"Charts aren't showing"**
- Make sure you have an internet connection (charts load from a CDN)
- Try a different browser (Chrome or Firefox recommended)

---

## File Reference

| File | Purpose |
|------|---------|
| `index.html` | The main Synapse app for students |
| `teacher.html` | Teacher Dashboard (classroom edition only) |
| `demo.html` | Feature demo / preview version |
| `config.js` | Firebase configuration (optional) |
| `config.example.js` | Template for Firebase config |
| `server.js` | Express server (for hosting) |
| `README.md` | General setup guide |
| `PRO-INSTRUCTIONS.md` | This file — teacher guide |
| `LICENSE-CLASSROOM.txt` | Your classroom license |

---

## Support

If you need help setting up Synapse for your classroom, please
contact the developer at the email provided with your purchase.

Thank you for choosing Synapse for your students!
