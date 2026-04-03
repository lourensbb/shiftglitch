# ShiftGlitch — Product Roadmap Planning Ebook

*A readable guide to the next four planned development phases — written for collaborators, investors, and anyone who wants to understand where ShiftGlitch is going and why.*

*Compiled: April 2026*

---

## Introduction: The Roadmap Is Complete

*Update: April 2026 — All four phases described in this document have been fully implemented.*

ShiftGlitch is not just a study tool anymore. Eighteen development phases have produced a genuinely immersive cognitive adventure platform — an evidence-based Mainframe that operatives are jacked into, that fights back, that rewards mastery and punishes complacency.

The four phases documented here were conceived as an answer to four specific questions:

- **Phase 15 (SYSTEM INTERRUPT Engine):** How does the app communicate with the player dynamically? How does it feel alive? — *COMPLETE*
- **Phase 16 (Repeatable Escape Run):** What is the central game loop? What does the player *do* in the Mainframe? — *COMPLETE*
- **Phase 17 (10 New Cognitive Exploit Modules):** What cognitive capabilities does the Mainframe test? How deep does the learning go? — *COMPLETE*
- **Phase 18 (The Warden + Snakes & Ladders):** Who is the player up against? What makes progression feel non-linear and real? — *COMPLETE*

The rest of this document preserves the original specifications as they were written — before implementation. The original vision and the delivered product align closely. Where details evolved during development, the `replit.md` developer reference reflects the current authoritative state.

---

## The Underlying Narrative

Before reading the phase descriptions, it helps to understand the narrative frame that underpins them.

ShiftGlitch's next-generation interface presents the student not as a student, but as an **operative** who has been trapped inside a hostile digital system called **the Mainframe**. The Mainframe is vast, complex, and actively resistant to the operative's escape. The only way out is to master the cognitive protocols the Mainframe demands: to encode data (flashcards), run recall protocols (blurting), complete exploit missions (diagnostics), build knowledge domain maps (mind maps), and run the escape sequence again and again until the operative's mastery is genuine.

There is no mention of school. No mention of exams or subjects. The Mainframe does not care what domain the operative is working in — chemistry, chess openings, a historical period, a programming language. The Mainframe tests one thing: whether the operative has genuinely encoded the data or is just going through the motions.

This is not a departure from the learning science. It is the learning science in narrative form. The Blurting Method is a "Recall Protocol." Flashcard review is "SHARD REINFORCEMENT." The Pomodoro timer is the "Learning Governor" — which it already is. The narrative is a wrapper, not a replacement.

---

## Phase 15: The SYSTEM INTERRUPT Engine

### What It Is

The SYSTEM INTERRUPT engine is a dramatic event system — a layer of the app that fires unexpected, cinematic events at the player at key moments. These events are presented as full-screen or slide-in overlays with glitch animations, scanline effects, and colour-coded severity treatments. They are not notifications. They are *interrupts* — the Mainframe speaking directly to the operative.

### Why It Matters

Right now, ShiftGlitch is reactive. The student opens it, uses a tool, and closes it. There is nothing that happens *to* them. The SYSTEM INTERRUPT engine changes that. The app becomes proactive — it notices when the operative has been absent, when a knowledge domain is decaying, when a rank milestone has been hit. And it responds.

This is the difference between a tool and an experience. Tools wait to be picked up. Experiences reach out.

### The Four Types of Interrupt

**THREAT INTERRUPTS (red — the Mainframe is fighting back)**

When something is going wrong, the Mainframe escalates. Two specific threat conditions trigger red interrupts:

- **MEMORY DEGRADATION WARNING** — fires when a flashcard deck has not been reviewed in 72 hours or more. The message is in-world: "WARNING: Neural pathway integrity at [X]%. Data loss imminent. Run CRACK DATA SHARDS immediately or memory files will be corrupted." This is the forgetting curve in narrative form — and it is accurate. After 72 hours without review, memory genuinely is degrading.

- **COHERENCE FAILURE** — fires when the player has not opened the app in 3 or more days. "MAINFRAME ALERT: Extended inactivity detected. Security protocols have been reinforced." This is not a punishment. It is an honest notification that the Mainframe has noticed the absence.

**CHALLENGE INTERRUPTS (amber — prove yourself)**

The Mainframe does not just observe. It tests. Two challenge interrupts fire at key moments:

- **RECALL SPRINT** — a 60-second challenge that fires at random on login. The player must type everything they know about a randomly selected topic from their knowledge domains. The timer is visible. Word count is tracked. On completion, the operative self-rates accuracy 1–5. No auto-marking — this is a self-honesty tool. The science behind this is well-established: recall under time pressure builds retrieval reliability.

- **PATTERN LOCK** — a short sequence-memory mini-game. The player must remember and repeat a sequence of 4–6 coloured nodes representing "bypassing a Mainframe security layer." Passing earns a small clearance bonus. Failing does nothing — the game acknowledges that pattern recognition is a skill, not a moral virtue.

**REWARD INTERRUPTS (green — clearance gained)**

When something goes right, the Mainframe acknowledges it — dramatically.

- **RANK PROMOTION CEREMONY** — fires when a rank threshold is crossed. This is not a toast notification. It is a full-screen moment: the screen glitches, the rank icon pulses, the Warden delivers a cryptic acknowledgement, and a confirm button is required to dismiss. The operative must actively accept the promotion. This makes the moment feel earned, not automatic.

- **STREAK SIGNAL** — fires on 3/7/14-day activity streaks. Short green interrupt: "OPERATIVE SIGNAL CONSISTENT. Mainframe tracking your pattern. Clearance accumulating."

**WARDEN INTERRUPTS (magenta — unpredictable)**

The Warden speaks. Message content varies. Sometimes helpful ("Access node located — follow the signal"). Sometimes threatening ("You have been in here longer than expected. The Mainframe is adapting to you."). Sometimes cryptic. Warden messages are predefined strings, rotated randomly, fired once per session after 5 minutes of activity. They are never triggered by a specific action — they just happen.

### The Achievement System

Alongside the INTERRUPT engine, 12 unlockable badges are introduced — stored in the database and displayed on the Rank page. Each badge unlock triggers its own brief interrupt:

1. First Exploit Run
2. 3-Day Activity Streak
3. 7-Day Activity Streak
4. First Rank Promotion
5. Recall Sprint Completed
6. Pattern Lock Passed
7. First Knowledge Domain Mapped
8. 50 Data Shards Mastered
9. Survived a Rollback
10. Reached Glitch Tech (planned rank tier)
11. Reached Netrunner (planned rank tier)
12. Reached System Admin (planned rank tier)

### What "Done" Looks Like

When Phase 15 is complete, every meaningful action in the app has the potential to trigger a dramatic response. The operative never knows exactly what will happen when they log in. The app feels alive. The Mainframe feels hostile. The experience feels like something worth returning to.

---

## Phase 16: The Repeatable Escape Run System

### What It Is

The Escape Run system is the central game loop of the Mainframe experience. It replaces the current START HERE checklist with a repeatable adventure: the operative names a knowledge domain, runs six ordered cognitive exploits in sequence, achieves Domain Clearance — and then immediately resets to run again with the same domain or a new one.

### Why It Matters

The current app teaches techniques and tracks their use. The Escape Run system gives those techniques a *structure* — a narrative through-line that turns isolated study sessions into a coherent mission.

More importantly, it solves the hardest problem in educational technology: how do you get a student to return to the same material multiple times, with increasing intensity, over a sustained period? The Escape Run system makes that repetition the explicit mechanic. The run resets. The badges show "×2", "×3". The second run on the same domain is demonstrably deeper than the first.

This is how mastery actually works. Not one exposure. Not one test. Repeated, spaced, deliberately varied engagement with the same material over time.

### The Six Exploits

Each Escape Run has six ordered exploits that must be completed in sequence. All language is in-world — there is no mention of school, exams, teachers, or homework.

1. **LOAD DATA SECTOR** — Create a new flashcard deck for this domain with at least 10 cards. The Mainframe must have data to work with before it can be tested.

2. **INTEGRITY CHECK** — Run a BrainDump (Recall Protocol) on a key concept from the domain. Write everything known from memory before opening notes. This is a self-honesty test — the output is checked against nothing except the operative's own assessment.

3. **SHARD REINFORCEMENT** — Review the domain deck until 80% of cards reach Box 3 or higher in the Leitner system. This is the spaced repetition mechanic in explicit form. The operative cannot fake this — the Mainframe tracks card positions.

4. **PATTERN RECOGNITION** — Complete one Boss Fight challenge using content from this domain. This is a direct recall test under pressure — the testing effect applied to specific domain material.

5. **NEURAL MAPPING** — Build a Mind Map or Memory Palace for the domain's core structure. At least 5 nodes/stops required. This forces the operative to represent the domain's internal structure, not just its facts.

6. **DEBRIEF TRANSMISSION** — Write a short "After Action Report" in-world: what was hard to encode, what the Mainframe pushed back on, what to reinforce next run. This is metacognitive reflection — the most under-utilised study technique available.

### The Reset Mechanic

When all six exploits are complete, Domain Clearance is awarded. A badge appears on the Rank page. A ceremony fires through the INTERRUPT engine.

Then the operative can immediately start a second run on the same domain. All exploit flags reset. The run number increments. The badge shows "×2." The previous debrief is archived and visible as "Run 1 Debrief."

A student with three Domain Clearances on a single topic has genuinely encoded that information deeply. The badge count is a measure of mastery, not just completion.

### The Non-Linear Layer

The Escape Run system is not purely sequential. Two forces act on it:

- **SHORTCUTS (Ladders):** Exceptional performance — a BrainDump word count above a threshold, a Boss Fight score above 90%, a streak active — triggers a SHORTCUT SIGNAL through the INTERRUPT engine: the next exploit unlocks early and a clearance bonus is awarded.

- **ROLLBACKS (Snakes):** If a domain has not been touched in 5 or more days, a MEMORY DEGRADATION event fires. One exploit in the active run is "corrupted" and must be re-completed before progress can continue. The Warden delivers the message. This is the forgetting curve in mechanic form: if you don't revisit, you lose it.

### What "Done" Looks Like

When Phase 16 is complete, the main experience of ShiftGlitch is navigating a series of active Escape Runs — knowledge domains the operative is actively encoding. The dashboard shows all active dossiers with progress rings. The experience feels like managing a classified operative file system, not like checking off a homework list.

---

## Phase 17: Ten New Cognitive Exploit Modules

### What It Is

Phase 17 adds ten new study tools to the Mainframe's cognitive arsenal. Each one implements a distinct evidence-based learning technique. Together, they make the escape feel genuinely multi-dimensional — the operative cannot brute-force their way out with one technique. The Mainframe demands range.

### Why It Matters

The current app has eleven modules. Ten more — each implementing a different cognitive science principle — turns ShiftGlitch into the most comprehensive study-methods tool in existence. No other product in this space implements all of these techniques in a single platform.

More importantly, the techniques chosen are not arbitrary. They address different cognitive mechanisms: spatial memory (Memory Palace), working memory limits (Chunking Engine), schema formation (Mind Map), dual-channel processing (Dual Coding), metacognition (Mistake Vault), the protégé effect (Teach It), interleaving (The Interleave), elaborative interrogation (Concept Mapper), retrieval under stress (Speed Run), and active recall from structured notes (Shadow Protocol).

Together, they address every dimension of the learning process.

### The Ten Modules

**1. MEMORY PALACE** *(Method of Loci)*

The operative builds a virtual location with named stops. Each stop holds one piece of encoded data. Review mode walks the operative through the palace in order, prompting them to retrieve each data point without looking. The science: the brain's spatial navigation system is one of the most durable memory pathways in existence. Hijacking it for data retention is one of the oldest and most reliable memory techniques known.

What a non-developer collaborator needs to understand: think of it as creating a mental building where every room holds a piece of information. Walking through the building in your mind retrieves the information in order. Memory champions use this technique for extraordinary feats of recall.

**2. MIND MAP PROTOCOL** *(Concept Mapping)*

A node-and-branch builder. The operative places a central concept, branches off connected ideas, and sub-branches into detail. Nodes are keyboard-navigable. Export as a text outline. The science: explicitly mapping connections between ideas forces the brain to organise information into schemas — connected knowledge is retrieved faster and forgotten more slowly than isolated facts.

**3. CHUNKING ENGINE** *(Chunking Technique)*

The operative pastes raw data, then manually groups items and names each group. The tool enforces a limit of 3–7 items per chunk. The science: working memory has a hard capacity of roughly 7±2 items. Chunking compresses information into units that fit within that limit, making complex data manageable without overloading the system. This is why phone numbers are written in groups, not as a continuous string of digits.

**4. SPEED RUN** *(Timed Recall Sprint)*

A 60/90/120-second timed challenge. The operative picks a domain or topic, the timer starts, and they type everything they can recall with zero aids. Word count is tracked. On completion, the operative self-rates accuracy 1–5 and optionally notes what they missed. The science: recall under time pressure simulates retrieval under stress conditions — practising this makes high-pressure retrieval (exam conditions) more reliable.

**5. MISTAKE VAULT** *(Error Analysis / Metacognition)*

A running log of things the operative got wrong — in Boss Fights, Pattern Locks, and deck reviews. Each entry has a "failure mode" tag (didn't know it / misread it / blanked / understood but couldn't retrieve) and a "patch note" field. The science: understanding *why* a retrieval failed is as cognitively valuable as getting the right answer. Metacognition about errors is a stronger predictor of improvement than simply retrying.

**6. TEACH IT** *(Protégé Effect / Feynman Protocol)*

The operative picks a concept from any domain. The tool runs a guided protocol: write an explanation as if the reader has no background. No jargon. No bullet points. Just clear explanation. Then: "What part was hardest to explain? That is your gap." The science: preparing to teach — and actually explaining — is one of the most effective ways to consolidate understanding. You cannot teach what you don't actually know.

**7. DUAL CODING STATION** *(Dual Coding Theory)*

Split-screen tool: encoded data (text) on the left, a diagram/label canvas on the right. The operative writes a concept description, then creates a simple visual representation alongside it. The science: combining verbal and visual representations creates two independent retrieval pathways for the same data. Either can trigger recall of the other.

**8. THE INTERLEAVE** *(Interleaving Practice)*

Multi-domain session timer. The operative selects 2–4 active knowledge domains and sets block duration (10–15 minutes each). The timer cycles through them automatically with a SYSTEM INTERRUPT between each domain switch: "DOMAIN SHIFT — switching to [Domain Name]. Retrieve your last key point before loading new data." The science: interleaving feels harder than single-domain practice but produces superior long-term retention by forcing the brain to retrieve and re-contextualise continuously.

**9. CONCEPT MAPPER** *(Elaborative Interrogation)*

The operative enters a fact or concept. The tool generates a set of probing questions: "Why does this happen?", "What would break this rule?", "How does this connect to what you already know?", "What would be different if this weren't true?" The operative writes answers. The science: answering "why" and "how" questions forces the brain to integrate new information with existing knowledge — the depth of processing dramatically improves retention.

**10. SHADOW PROTOCOL** *(Cornell Note Enhancement)*

Upgrades the existing Cornell Notes tool. Left column: cue words/questions. Right column: full encoded data. Shadow mode covers the right column on a timer and prompts the operative to answer from the left-column cues only. Self-rated on completion. Cues that were missed are flagged for priority review. The science: converting linear notes into an active retrieval exercise multiplies their value. Passive re-reading of notes produces far less durable encoding than prompted recall.

### Unlock Gating

The ten modules are not all available immediately — they unlock with rank progression. This is not an artificial paywall. It is a pedagogical structure: more advanced techniques require the foundational habits that earlier-rank study builds.

- Modules 1–4 available from the start
- Modules 5–7 unlock at second rank tier
- Modules 8–10 unlock at third rank tier

### What "Done" Looks Like

When Phase 17 is complete, the Mainframe offers twenty-one distinct cognitive protocols. A student who has used all of them with genuine engagement has been exposed to the full range of techniques that cognitive science identifies as most effective. The Mainframe is not a one-trick system. It is a multi-dimensional cognitive training environment.

---

## Phase 18: The Warden + Non-Linear Progression (Snakes & Ladders)

### What It Is

Phase 18 introduces the Mainframe's personality. THE WARDEN is a mysterious, semi-hostile entity that monitors the operative's progress, speaks to them through the INTERRUPT channel, and actively interferes with their escape. Combined with this is the non-linear progression system — the Snakes and Ladders mechanic — in which advancement is not purely upward.

### Why It Matters

Right now, the app progresses in one direction: forward. The Warden and the non-linear progression system introduce genuine drama into the experience. The operative can be sent back. They can also leap forward. They can be tricked.

This reflects how real learning works: you think you know something until you are tested and discover you don't. Connections click unexpectedly and you advance faster than expected. The Mainframe simulates this reality.

But there is a deeper reason the Warden matters: unpredictability creates engagement. The Warden fires at random moments, with messages the operative cannot predict. Sometimes the Warden helps. Sometimes the Warden punishes. The operative cannot form a simple model of what the Warden will do next — and that uncertainty keeps them paying attention.

### The Warden — Character and Voice

The Warden is a text-only character who communicates exclusively through SYSTEM INTERRUPT panels in magenta. There is no avatar, no voice, no animation. The Warden is words.

A library of 40+ handwritten messages is sorted across three modes:

**OBSERVER mode (neutral/cryptic):**
"Your pattern is being logged. The Mainframe has seen operatives like you before. Most did not make it past Level 3."

**GUIDE mode (appears to help):**
"Access node detected. If you run the TEACH IT protocol on your most recent domain, the next clearance gate will open faster than scheduled."

**ADVERSARY mode (hostile):**
"You have been passive. The Mainframe does not reward passivity. A rollback has been authorised."

The Warden's mode is determined by the operative's recent activity:
- Consistent activity → more Guide mode
- Inactivity → more Adversary mode
- Milestone moments → Observer mode

The Warden never explains what they are, who they work for, or why the operative is in the Mainframe. These are intentional mysteries. A "WARDEN LOG" section on the Rank or Stats page shows all Warden messages the operative has ever received — a record of their encounter with this entity.

### Snakes — The Setback Mechanics

Three types of setback, each triggered by specific conditions:

**MEMORY WIPE (mild snake)**
A specific knowledge domain shows degradation — not touched in 5 or more days. One exploit in that domain's Escape Run is marked as "corrupted" and must be re-completed. The Warden delivers the message. The operative loses no rank — only that run's progress for that specific step is reset. This is the spaced repetition mechanic in narrative form: if you don't revisit, you lose it.

**CLEARANCE STRIP (severe snake)**
Triggered if the operative has been fully inactive (no app opens) for 10 or more days. One clearance point is stripped from their rank score. The Warden delivers a longer message explaining the rollback. The operative must re-earn that point through any exploit. This feels like a genuine consequence. The Mainframe is a hostile environment.

**WARDEN'S TRAP (game mechanic snake)**
Occasionally — once every 5–7 sessions, at random — the Warden presents what appears to be a GUIDE message with a shortcut. If the operative follows the shortcut by clicking a specific button, it is revealed as a trap: a minor time lock is placed on one of their modules (cannot be used for 2 hours). The message: "You trusted too quickly. The Mainframe rewards scepticism." This is deliberately designed to teach the operative not to blindly follow instructions — a genuine cognitive skill with relevance beyond the Mainframe.

### Ladders — The Shortcut Mechanics

Three types of advancement bonus:

**PERFORMANCE SHORTCUT**
After an exceptional performance on any exploit — BrainDump word count above threshold, Boss Fight score above 90%, Speed Run self-rated 5/5 — a green SHORTCUT SIGNAL fires: "ANOMALY DETECTED — Performance exceeded Mainframe parameters. Clearance accumulating ahead of schedule." One bonus clearance micro-point is awarded.

**CONSISTENCY LADDER**
A 7-day activity streak triggers a clearance level acceleration: the operative's next rank threshold is reduced by 10% (they need fewer total exploits to rank up). The Warden acknowledges this: "Pattern confirmed. The Mainframe adjusts its resistance accordingly."

**HIDDEN ACCESS NODES**
Rare, random events — approximately 1 in 20 sessions — where a hidden element appears somewhere in the UI (a glitching icon, an unusual string in the console-style status bar). Clicking it reveals a secret Warden message and awards a surprise clearance bonus. These are easter eggs that reward curiosity and attention. They are never announced. They must be discovered.

### The Operative Status Board

A new panel on the Rank page — the **OPERATIVE STATUS BOARD** — displays:
- Current clearance score (numeric, not just rank label)
- Recent Warden messages (last 3)
- Active setbacks (any current Memory Wipes or time locks)
- Active bonuses (any active shortcuts or consistency ladders)
- A simple "snakes and ladders" style visual showing recent movement: up arrows for advances, down arrows for rollbacks

This gives the operative a real-time picture of their position in the Mainframe — not just their rank, but their trajectory.

### What "Done" Looks Like

When Phase 18 is complete, every session with ShiftGlitch carries a sense of stakes. The operative enters the Mainframe knowing that something might happen — a Warden message, a rollback, a shortcut, a hidden node. The experience is unpredictable in the right way. And the Warden's Trap teaches the most important lesson of all: scepticism is a cognitive virtue.

---

## How the Four Phases Connect

These four phases are not independent features. They build a single, coherent experience:

- **Phase 15** (SYSTEM INTERRUPT) provides the communication layer — the way the Mainframe speaks to the operative.
- **Phase 16** (Escape Run) provides the central game loop — what the operative *does* in the Mainframe session after session.
- **Phase 17** (New Modules) provides the depth — the range of cognitive protocols the operative masters.
- **Phase 18** (The Warden) provides the dramatic tension — the personality and non-linearity that make the journey feel real.

Without the INTERRUPT engine, the Escape Run has no drama. Without the Escape Run, the new modules have no structure to live in. Without the Warden, the non-linear mechanics have no narrative justification. All four phases are load-bearing. They land together.

---

## The Opportunity

There is no study app that combines:
- Genuine, peer-reviewed learning science (ShiftGlitch already has this)
- A repeatable, structured learning loop (Phase 16)
- A range of twenty-one cognitive techniques (Phase 17)
- A dramatic, narrative experience that makes studying feel like an adventure (Phases 15 + 18)

Duolingo has the habit loop. Anki has the spaced repetition. BBC Bitesize has the content. Nobody has all of these things in the same product, with a visual identity and a story.

That is the gap. That is what ShiftGlitch is building toward.

---

*ShiftGlitch — Interactive Learning OS*
*PLANNING_EBOOK.md — Product Roadmap for Planned Development Phases #15–18*
*Compiled: April 2026*
