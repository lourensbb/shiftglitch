# ShiftGlitch — Comprehensive Marketing Plan
*Prepared: April 2026 — Adapted for ShiftGlitch from evidence-based growth strategy*

---

## 1. POSITIONING

### The Core Bet
You cannot beat Quizlet on flashcards, Duolingo on gamification, or Notion on note-taking. You do not need to. Nobody owns "study methods OS built on the actual science." That is the moat. That is the only thing you need to communicate.

### The Single Message
**"The study app built on the evidence, not the vibe."**

Every piece of content, every ad, every social post, every email should connect back to this. You are not competing on features. You are competing on philosophy.

### What You Are Not
- Not a quiz game (Quizlet, Kahoot, Blooket)
- Not a gamified distraction (Duolingo)
- Not a homework tracker (ManageBac, Firefly)
- Not a flashcard app with a leaderboard bolted on

### What You Are
A full study operating system for UK teenagers that implements spaced repetition, active recall, and deliberate practice — the techniques cognitive science has proven actually work.

---

## 2. PRICING MODEL

### Why the Old Model Was Wrong
Two static license files with no pricing page meant zero discoverability, no self-serve sales, and no conversion funnel. Anyone arriving at the site had no way to understand what it cost or how to buy it.

### The New Model

| Tier | Price | Who It's For |
|------|-------|-------------|
| **Free** | £0 forever | Individual students who want core tools |
| **Netrunner Pro** | £7.99/month or £59.99/year | Students who want AI and Squad Mode |
| **School License** | £399/year | Schools, tutoring centres, and academies |

### Why These Numbers Are Right

**Free tier is genuinely generous.** Unlimited flashcard decks, full Pomodoro, blurting, MCQ diagnostics, and rank progression — all free. This is intentional. The free tier is your primary acquisition channel. Every student who uses it for free is a potential word-of-mouth referral and a potential Pro converter.

**Pro at £7.99/month is positioned correctly.** For context: Quizlet is £3.99/month (but much less capable), Anki is free, Forest is £3.99 one-time. Your Pro tier is priced above commodity flashcard apps because it includes an AI study planner. That is the differentiator — position it as such.

**Annual Pro at £59.99/year (≈ £5/month) drives commitment.** Students who pay annually are far more likely to build genuine habits and see results. Results create testimonials. Testimonials create more students.

**School License at £399/year is underpriced but strategically correct.** Schools regularly pay £500–5,000/year for EdTech software. £399 removes procurement friction — heads of department can often approve this without going to a full committee. Once you have 10 school licenses (£3,990/year) and 200 Pro subscribers (£11,988/year), you have a real business. Raise school pricing to £599 when you have 20 schools.

### Revenue Projection (Conservative)

| Scenario | Revenue |
|----------|---------|
| 10 schools + 100 Pro subs | £3,990 + £7,188 = **£11,178/year** |
| 25 schools + 500 Pro subs | £9,975 + £35,988 = **£45,963/year** |
| 50 schools + 1,000 Pro subs | £19,950 + £71,976 = **£91,926/year** |

### AI Cost Reality Check
Google Gemini 2.0 Flash costs approximately $0.002 per study planning session (5,000 tokens). Even at 100 sessions/month per Pro user, AI costs ≈ $0.20/user/month. At £7.99/month revenue, your AI margin is excellent. The AI is not the cost problem — hosting and support are.

---

## 3. THE WAITLIST STRATEGY

### Why You Have a Waitlist (and Why It Is an Asset)
Controlled early access is not just a launch tactic — it is social proof. "We are only letting in a few new Netrunners at a time" creates genuine scarcity without being dishonest. You *are* running a controlled rollout.

### Email Sequence (Build This)
Every person who joins the waitlist should receive exactly three emails before they get access:

**Email 1 — Welcome (immediate):** Already implemented via Resend. Confirm their spot, tell them what ShiftGlitch actually is, link to the demo.

**Email 2 — The Science (3 days later):** One email entirely about *why* passive revision doesn't work. The forgetting curve. Roediger and Karpicke's 2006 study. The testing effect. Zero selling. Pure value. By the end of this email, anyone who reads it will want to use a tool built on this research.

**Email 3 — Access Granted (when you open the next batch):** "Your slot opened." Link to create an account. This email should feel like getting into an exclusive server.

### How to Build Email 2 and 3
Set `RESEND_API_KEY` in your environment secrets, then implement a drip sequence in the server. Store the waitlist `created_at` timestamp and send email 2 automatically 3 days after signup via a cron job or scheduled check.

---

## 4. SEO STRATEGY

### Your Niche: Own "Science-Based Study Methods for UK Teens"
You cannot outrank Quizlet or BBC Bitesize on "GCSE revision." Nobody owns the intersection of "evidence-based study science + UK teenagers + study OS." That is the gap.

### Tier 1 — Core Keywords (Build Around These First)

| Keyword | Monthly Searches (Est.) | Difficulty |
|---------|------------------------|------------|
| spaced repetition app for students | 1,300/mo | Low |
| active recall revision technique | 880/mo | Low |
| blurting method study | 480/mo | Very Low |
| GCSE revision app | 1,600/mo | Medium |
| study app UK | 2,400/mo | Medium |
| Pomodoro app for students | 720/mo | Low |
| best way to revise GCSE | 8,100/mo | High |
| study methods that actually work | 1,900/mo | Low–Med |
| flashcard app UK | 590/mo | Low |
| evidence-based study techniques | 320/mo | Very Low |

### Tier 2 — Long-Tail Goldmines (Blog Content)

| Keyword | Why It Works |
|---------|-------------|
| how to use the blurting method for GCSE | You own this — nobody else has a blurting tool |
| spaced repetition GCSE flashcards | Very specific, very low competition |
| how to stop forgetting what you revise | Captures frustrated students pre-exam |
| Pomodoro technique for A level revision | Subject-specific, low competition |
| active recall study guide UK students | Informational, captures early in funnel |
| why re-reading doesn't work revision | Challenges existing behaviour — high engagement |
| Leitner system for GCSE | Extremely specific, no competition |
| study habits that actually work for teenagers | Broad but low difficulty |

### Tier 3 — AI-Angle Keywords (Fast-Growing)

| Keyword | Notes |
|---------|-------|
| AI study planner for students | Exploding search trend |
| AI revision tool GCSE | Growing fast, low competition |
| AI-powered flashcards | Trending |

### Technical SEO Implemented (Done)
- ✅ Full meta tags on landing, pricing, and waitlist pages
- ✅ Open Graph + Twitter Card tags with correct canonical URLs
- ✅ JSON-LD structured data: WebApplication + FAQPage + Organization on landing
- ✅ JSON-LD Offer schema on pricing page
- ✅ robots.txt — allows all public pages, blocks /api/ and /app
- ✅ sitemap.xml — all public routes indexed

### Still To Do: Blog
A blog is non-negotiable for zero-budget SEO. Without it, you are invisible to 90% of organic search intent. The blog architecture:

**Route:** `/blog/[slug]` — each post is a static page
**Tech approach:** JSON-driven static posts rendered server-side (add a `/blog` route to server.js, read posts from a `/posts/` directory of markdown or JSON files)

**Content Cluster 1 — Study Methods (Your Core Topic)**
- `/blog/spaced-repetition-guide-gcse-students` — pillar post, 2,000 words
- `/blog/blurting-method-how-to`
- `/blog/why-re-reading-doesnt-work`
- `/blog/active-recall-revision-guide`
- `/blog/leitner-system-flashcards-explained`

**Content Cluster 2 — GCSE & A-Level Specific**
- `/blog/best-revision-techniques-gcse`
- `/blog/a-level-study-schedule-template`
- `/blog/how-to-revise-effectively-6-weeks-before-gcse`
- `/blog/revision-timetable-that-actually-works`

**Content Cluster 3 — Tool Comparisons (Captures competitor traffic)**
- `/blog/shiftglitch-vs-anki-flashcards`
- `/blog/shiftglitch-vs-quizlet-comparison`
- `/blog/best-study-apps-uk-students-2026`

**Publishing Schedule (realistic for one person):**
- Month 1–2: Write the 5 study methods pillar posts. Highest value.
- Month 3–4: Write the GCSE/A-Level cluster.
- Month 5+: One post per week targeting a long-tail keyword.

**Post Formula (every post, without exception):**
1. Target one keyword in the title, H1, first 100 words, and URL slug
2. 1,200–2,000 words (Google rewards depth)
3. Answer the question in the first paragraph (featured snippet targeting)
4. Include a CTA: "Try ShiftGlitch free — the tools are built on exactly this science"
5. Link internally to at least 2 other posts and the homepage
6. Add FAQ schema (5 Q&As minimum per post)

---

## 5. CHANNEL STRATEGY

### Priority Order (Based on Audience + Zero Budget)

**Channel 1 — Reddit (Start This Week)**
Your target audience lives here. Post genuinely helpful content — never spam.

- r/GCSE — 180,000 members, very active pre-exam
- r/6thForm — A-Level students, highly engaged
- r/GetStudying — Study methods community, loves evidence-based content
- r/alevel — A-Level focused
- r/learnprogramming — less relevant but ShiftGlitch's aesthetic plays well here

**What to post:** Not an ad. A genuine "I built this after getting frustrated with every study app" story. Include a demo link. The cyberpunk angle will stand out.

**What to comment:** Answer questions about revision techniques. When someone asks "what actually works for GCSE revision?" — give them a genuinely helpful answer and mention ShiftGlitch naturally. Do not spam.

**Channel 2 — TikTok / YouTube Shorts (Week 2)**
The "StudyTok" community is enormous and engages heavily with study tool content. A 60-second screen recording showing:
1. The boot animation (immediately grabs attention — looks unlike any study app they have seen)
2. A Pomodoro session starting
3. A Leitner deck being reviewed
4. The rank advancing

Caption: "studying but make it cyberpunk" or "the GCSE revision app that looks like it belongs in a hacking movie"

**You do not need to show your face.** Screen recordings with good audio perform well in this niche.

**Channel 3 — StudyGram / Pinterest (Week 2)**
Create a ShiftGlitch account on Pinterest. For every blog post, create a vertical 1000×1500px pin with:
- A clean graphic (dark background, neon green text, study tip headline)
- Pinned to boards: "GCSE Revision", "Study Methods", "Active Recall", "Spaced Repetition"

Pinterest drives enormous teacher and student traffic. Teacher pins especially go viral in UK education communities.

**Channel 4 — Teacher Facebook Groups (Week 3)**
Large, active, easy to reach:
- "Secondary School Teachers UK" (65,000+ members)
- "Teaching Resources UK" (40,000+ members)
- "GCSE Teachers" — subject-specific groups exist for every subject

**What to share:** Not an ad. Share the Teacher Dashboard link with a brief explanation: "I built a free teacher-facing dashboard for students using evidence-based study tools. Curious if this is useful to anyone." Teachers who see value will share it with their students.

**Channel 5 — Product Hunt (Month 2)**
Product Hunt drives a concentrated burst of early adopters. A well-prepared launch:
- A high-quality banner (1270×760px) showing the boot animation and key features
- A short GIF demonstrating the tool (10–15 seconds)
- A clear tagline: "The cyberpunk study OS built on actual learning science"
- 5 bullet points of key features
- Schedule it for a Tuesday or Wednesday at 12:01am PST

A strong Product Hunt launch can get ShiftGlitch in front of 5,000–50,000 people in 24 hours. Prepare properly — it is worth the effort.

**Channel 6 — School Direct Outreach (Month 2–3)**
Cold email to heads of department, HODs, and pastoral leads. Template:

> Subject: Free revision tool for your students — zero setup
>
> Hi [Name],
>
> I built ShiftGlitch — a free study platform built specifically around the revision techniques that cognitive science says actually work (spaced repetition, active recall, the blurting method).
>
> There's a Teacher Dashboard at [link] that lets you see your students' study habits without needing their login — you can import a JSON file they export from the app.
>
> I'd love to give your school free access to test it before exams. Would a quick call make sense?
>
> Lourens

Target 20 schools in the first month. Aim for 3 responses. One committed teacher can get the app in front of 200 students overnight.

---

## 6. COMMUNITY & LINK BUILDING

### Directory Submissions (Week 1, Free, Permanent)
Submit ShiftGlitch to:
- **Product Hunt** — schedule a proper launch (see above)
- **AlternativeTo.net** — list as alternative to Quizlet, Anki, Forest
- **Futurepedia** — AI tools directory, high DA, ranks for "AI for students"
- **There's An AI For That** — submit ShiftGlitch (growing high-DA directory)
- **EdTech directories** — EdSurge, CommonSense Education, ISTE
- **UK EdTech groups** — EdTech UK community, Bett (they have a directory)
- **G2.com, Capterra** — SaaS review sites with high domain authority

### HARO / Journalist Outreach
Sign up for HARO (now Connectively). When journalists ask for "expert on student revision" or "education technology" — respond. One mention in The Guardian Education, TES, or Times Higher Education is worth 50 Reddit posts.

### Teacher Blogger Outreach
Search Google for "UK GCSE teacher blog" and "A level revision blog." There are hundreds of teachers who write about revision techniques. Offer to guest post about "why passive revision fails" with a link back to ShiftGlitch. This creates high-quality backlinks and teacher trust simultaneously.

---

## 7. LAUNCH SEQUENCE

### Phase 1 — Foundation (Now, this week)
- [x] Rebrand fully complete (ShiftGlitch throughout)
- [x] Landing page with product explanation and SEO
- [x] Pricing page live
- [x] Waitlist email working (set RESEND_API_KEY)
- [x] robots.txt and sitemap.xml in place
- [ ] Create Reddit account for ShiftGlitch
- [ ] Create TikTok/Pinterest accounts
- [ ] Set up Resend account and configure API key

### Phase 2 — Soft Launch (Week 2–3)
- [ ] First Reddit post in r/GCSE and r/6thForm
- [ ] First TikTok screen recording
- [ ] First Pinterest board with study method graphics
- [ ] First school cold email batch (20 schools)
- [ ] Write first blog post: "Why re-reading doesn't work"

### Phase 3 — Product Hunt Launch (Month 2)
- [ ] Prepare Product Hunt assets (banner, GIF, tagline)
- [ ] Alert waitlist members ahead of launch day
- [ ] Schedule Tuesday 12:01am PST launch
- [ ] Ask friends/early users to upvote and comment (honest reviews only)

### Phase 4 — School B2B (Month 3+)
- [ ] Follow up with first school batch
- [ ] Ask first school to provide a testimonial
- [ ] Use testimonial in school outreach emails
- [ ] Raise school pricing to £499/year at 20 school milestone

---

## 8. EMAIL MARKETING

### The Drip Sequence (Build This After Setting RESEND_API_KEY)

**Email 1 (Immediate):** Welcome + confirm spot. Already implemented.

**Email 2 (Day 3):** "The 70% Problem" — explain the forgetting curve. No selling. Pure science. End with: "The tools are built around the solution. Your access is coming soon."

**Email 3 (Day 7):** "What active recall actually means" — explain the testing effect. Link to the demo.

**Email 4 (Access):** "Your slot opened." Clean, simple, link to sign up.

**Post-access emails:**
- Day 3 after signup: "Have you tried the blurting engine yet?"
- Day 7: "Your first streak — what it means"
- Day 14: "Upgrade to Pro — what you unlock"
- Day 30: School license pitch (if they haven't converted)

### Subject Line Principles
- Use the cyberpunk voice: "[ ACCESS GRANTED ]", "[ SYSTEM ALERT ]", "[ TRANSMISSION 02 ]"
- Be specific: "The study technique with 50% better recall than re-reading" beats "Study tips from ShiftGlitch"
- Never use: "newsletter", "update", "checking in"

---

## 9. MEASUREMENT — WHAT TO TRACK

### Built-In Analytics (Already Implemented)
- `/api/stats` endpoint returns page view counts and waitlist size
- Tracks: home, waitlist, pricing, demo, teacher page views

### Key Metrics by Stage

**Stage 1 (0–100 waitlist signups):**
- Waitlist signup rate (visits to waitlist / waitlist signups — target > 20%)
- Top traffic source (where signups come from — use UTM parameters in social links)

**Stage 2 (100–1,000 signups):**
- Email open rates (target > 40% for a niche audience)
- Demo engagement (how many waitlist members try the demo)
- School enquiry rate

**Stage 3 (Post-launch):**
- Free → Pro conversion rate (target 5–10%)
- School license close rate
- Monthly recurring revenue (MRR)
- Churn rate (for Pro subscribers)

### UTM Parameter Template
Add these to all outbound links to track which channel drives signups:

```
?utm_source=reddit&utm_medium=organic&utm_campaign=gcse-launch
?utm_source=tiktok&utm_medium=social&utm_campaign=boot-animation
?utm_source=school-email&utm_medium=outreach&utm_campaign=q2-schools
```

---

## 10. COMPETITIVE POSITIONING

### How You Beat Each Competitor

| Competitor | Their Strength | Your Counter |
|------------|---------------|-------------|
| Quizlet | Scale, brand recognition | "Quizlet rewards you for using it. ShiftGlitch rewards you for remembering things." |
| Anki | Spaced repetition depth | "Anki is for medical students. ShiftGlitch is for GCSE and A-Level students who don't want to spend 3 hours configuring settings." |
| BBC Bitesize | Free, trusted | "Bitesize delivers content. ShiftGlitch teaches you how to retain it." |
| Duolingo | Habit loop, gamification | "Duolingo games your behaviour. ShiftGlitch games your results." |
| Notion | Flexibility | "Notion is a blank canvas. ShiftGlitch has the science pre-built." |

### The Comparison Posts Strategy
Write blog posts comparing ShiftGlitch to competitors. Students searching "Quizlet vs Anki" or "best GCSE revision app" are already in the market. A well-written comparison post that ranks for these terms converts at very high rates.

---

## 11. THE TEACHER STRATEGY (B2B)

### Why Teachers Are Your Best Growth Channel
One committed teacher recommending ShiftGlitch to their class = 30 students overnight, zero ad spend. A head of year who recommends it school-wide = 500+ students. This is the most efficient acquisition channel available at zero budget.

### How to Get There

**Step 1:** The Teacher Dashboard at `/teacher` is already built and free to access. This is your demo product for teachers.

**Step 2:** Create a one-page PDF explaining: "What ShiftGlitch is, what students see, what teachers can track, and how to get started." Make it downloadable from the teacher page.

**Step 3:** Post in teacher-facing communities with a link to the Teacher Dashboard — not the student app. Teachers need to see their view first.

**Step 4:** When a teacher responds positively, offer a school license with a 30-day free trial. Remove all friction from the first commitment.

**The School Pitch:**
> "ShiftGlitch gives every student in your school access to evidence-based revision tools — the same techniques used by the highest-performing students at Oxbridge. The Teacher Dashboard gives you live visibility into study habits. £399 per year covers your entire school — that is less than the cost of two textbooks."

---

## 12. CONTENT LIBRARY TO BUILD

Priority order. Each item either drives SEO, supports a sales conversation, or converts a fence-sitter.

1. **"Why re-reading doesn't work"** — blog post, SEO target: "passive revision doesn't work"
2. **How-to guide for each tool** — short tutorial pages for Leitner, Pomodoro, Blurting, MCQ
3. **Teacher PDF one-pager** — for school outreach
4. **"What is the blurting method?"** — blog post, SEO target: "blurting method how to"
5. **Explainer video** — 60-second screen recording for TikTok/YouTube
6. **Social share image (og-image.png)** — 1200×630px for link previews (currently missing — critical for social sharing)
7. **Demo walkthrough GIF** — for Product Hunt and Reddit posts

---

*This plan is designed to be executed by one person with zero marketing budget. Every channel listed is free. The investment is time — approximately 5–10 hours per week. The payoff is compounding: SEO content gets more valuable over time, word-of-mouth accelerates as the user base grows, and school licenses create stable recurring revenue that funds continued development.*
