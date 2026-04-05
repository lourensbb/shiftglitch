const PDFDocument = require('pdfkit');

const GREEN   = '#39FF14';
const MAGENTA = '#FF00FF';
const PURPLE  = '#8A2BE2';
const WHITE   = '#ffffff';
const SITE    = 'https://shiftglitch.replit.app';

const EXPLOITS = [
  {
    id: '001',
    name: 'MEMORY PALACE',
    subtitle: 'Method of Loci Protocol',
    color: GREEN,
    tagline: 'Convert any information into a navigable mental environment.',
    what: 'The Memory Palace is one of the oldest cognitive exploits on record. You take a familiar physical space — your house, a route you walk every day — and you plant the information you need to retain at specific locations within it. Your brain evolved to remember places and spatial layouts. This exploit hijacks that survival system and repurposes it for knowledge storage.',
    protocol: [
      'Select a physical location you know perfectly (your home, a regular commute).',
      'Walk through it mentally and identify 10–15 fixed anchor points in sequence.',
      'At each anchor point, place a vivid, bizarre, or emotional image representing the concept you need to remember.',
      'To retrieve the information, mentally walk the route and "collect" each image.',
      'Repeat the walk 3 times immediately after encoding, then again 24 hours later.',
    ],
    field: 'Definitions, ordered sequences, vocabulary lists, historical timelines, formulas.'
  },
  {
    id: '002',
    name: 'ACTIVE RECALL',
    subtitle: 'Testing Effect Protocol',
    color: GREEN,
    tagline: 'Force your brain to retrieve — do not re-read. Retrieval IS the learning.',
    what: 'Re-reading a page feels productive but produces almost zero retention. Active recall forces your brain to retrieve information rather than passively recognise it. Every time you successfully retrieve something, the memory trace strengthens. Every time you fail, you discover exactly where to focus next. This is the single highest-ROI exploit available.',
    protocol: [
      'Read or study a section once. Close the material.',
      'Without looking, write, say aloud, or type everything you remember.',
      'Compare your output to the source. Note exactly what you missed.',
      'Repeat the recall attempt for missed items immediately.',
      'Return for another recall round after 24 hours and again after 72 hours.',
    ],
    field: 'Everything. This is the foundation all other exploits run on top of.'
  },
  {
    id: '003',
    name: 'SPACED REPETITION',
    subtitle: 'Distributed Practice Algorithm',
    color: GREEN,
    tagline: 'Review at the exact moment before forgetting. Never review too early, never too late.',
    what: 'Your brain consolidates memory during sleep and time gaps. Cramming works short-term but collapses within 72 hours. Spaced repetition uses an algorithm (built into ShiftGlitch\'s flashcard system) that schedules reviews at precisely calibrated intervals — 1 day, 3 days, 1 week, 2 weeks, 1 month — expanding the gap each time you succeed. The result is long-term retention with minimum review time.',
    protocol: [
      'Create a flashcard for each discrete concept you need to retain.',
      'Answer each card honestly — do not peek before attempting.',
      'Rate your confidence: Easy (long delay), Hard (short delay), Again (immediate).',
      'Trust the algorithm. Do your due cards every day, even when it\'s only a few.',
      'Never skip a due-card session — consistency compounds dramatically.',
    ],
    field: 'Vocabulary, formulae, definitions, concepts, facts, procedural steps.'
  },
  {
    id: '004',
    name: 'CHUNKING',
    subtitle: 'Pattern Compression Protocol',
    color: MAGENTA,
    tagline: 'Compress complex systems into single coherent units your brain can handle in one move.',
    what: 'Working memory holds roughly 4 items at once. Chunking defeats this limit by grouping related pieces of information into a single, labelled "chunk." Once a chunk is formed, your brain treats it as one unit — freeing up bandwidth for more. Chess grandmasters don\'t memorise individual pieces; they recognise patterns (chunks) built over thousands of hours. You can use the same mechanism deliberately.',
    protocol: [
      'Identify related concepts that share a pattern, rule, or function.',
      'Assign the group a single label or keyword.',
      'Practise triggering the whole chunk from just the label.',
      'Build nested chunks — groups of chunks — into a hierarchy.',
      'Test that each chunk can be retrieved in under 2 seconds from its label alone.',
    ],
    field: 'Complex systems, processes, multi-step protocols, category-heavy content.'
  },
  {
    id: '005',
    name: 'INTERLEAVING',
    subtitle: 'Chaos Training Protocol',
    color: MAGENTA,
    tagline: 'Mix topics deliberately. Your brain learns faster when confused.',
    what: 'Blocked practice (doing 20 problems of type A, then 20 of type B) feels smooth and productive. Interleaved practice (randomly mixing type A, B, and C) feels harder and more chaotic — but produces dramatically better retention and transfer. The confusion forces your brain to identify WHICH approach to use, not just how to execute it. This simulates real-world conditions where problems don\'t arrive pre-labelled.',
    protocol: [
      'List all the topics or problem types you are currently working on.',
      'Instead of completing one block fully, rotate through topics on a random schedule.',
      'After a session, identify which topic transitions felt hardest — those are your weaknesses.',
      'Use the discomfort as a signal. The more confused you feel, the more your brain is working.',
      'Interleave at minimum 3 different topics per session for full effect.',
    ],
    field: 'Problem-solving disciplines, mathematics, languages, procedural skills.'
  },
  {
    id: '006',
    name: 'FEYNMAN PROTOCOL',
    subtitle: 'Teach-It Exploit',
    color: MAGENTA,
    tagline: 'Explain it like you\'re teaching it. Gaps in your explanation = gaps in your understanding.',
    what: 'Richard Feynman, Nobel Prize physicist, had a rule: if you cannot explain a concept in simple terms to someone who knows nothing about it, you do not understand it. Every technical word or vague phrase you rely on is a flag pointing to a hollow spot in your knowledge map. This exploit forces those hollow spots into the open where they can be addressed.',
    protocol: [
      'Take a concept you believe you understand. Take a blank page.',
      'Explain the concept as if teaching it to a complete beginner — no jargon.',
      'Every time you reach for a technical term, replace it with a plain-language description.',
      'Identify every point where you hesitated, struggled, or went vague.',
      'Return to source material for exactly those gaps. Repeat until no gaps remain.',
    ],
    field: 'Any concept requiring deep comprehension, not just memorisation.'
  },
  {
    id: '007',
    name: 'DUAL CODING',
    subtitle: 'Visual-Verbal Fusion Protocol',
    color: PURPLE,
    tagline: 'Encode information in two systems simultaneously — verbal and visual.',
    what: 'Information processed through both visual and verbal channels creates two separate memory traces that reinforce each other. A diagram with labels is more resilient than either a diagram alone or a text description alone. When one trace weakens, the other provides retrieval support. Dual coding also forces you to re-represent information in a new format, which deepens processing.',
    protocol: [
      'After studying text-based material, draw a diagram, flowchart, or map from memory.',
      'After studying a diagram, write a full verbal explanation of what it shows.',
      'Do not copy — translate. The re-representation is where the learning happens.',
      'Build a personal visual library of diagrams for your most complex concepts.',
      'When revising, alternate between verbal recall (close book, write it out) and visual recall (draw the map).',
    ],
    field: 'Processes, systems, cause-and-effect chains, anatomical structures, historical sequences.'
  },
  {
    id: '008',
    name: 'MIND MAPPING',
    subtitle: 'Concept Architecture Protocol',
    color: PURPLE,
    tagline: 'Externalise your knowledge network. See the connections you didn\'t know existed.',
    what: 'Knowledge is not a list. It is a web of connected nodes. A mind map makes that web visible. The process of building one forces you to identify: what connects to what, what the central concept is, what dependencies exist, and where the blank spaces are. The map itself is less important than the act of constructing it — which is where the deep processing occurs.',
    protocol: [
      'Start with the central concept in the middle of a blank page.',
      'Branch outward to major sub-concepts. Use single keywords per node.',
      'Branch again from each sub-concept to details and examples.',
      'Draw connections between nodes on different branches where they relate.',
      'Rebuild the map from memory 24 hours later and compare to the original.',
    ],
    field: 'Complex topics with many interconnected components, revision overviews, essay planning.'
  },
  {
    id: '009',
    name: 'SHADOW PROTOCOL',
    subtitle: 'Elaborative Interrogation Exploit',
    color: PURPLE,
    tagline: 'Ask WHY until there is nothing left to ask. Surface-level understanding collapses under pressure.',
    what: 'Most knowledge is stored as isolated facts. Elaborative interrogation links each fact to the network of reasons and mechanisms that explain it. When you know WHY something is true, you can reconstruct it from first principles even if the direct memory fades. Facts connected to explanations are far more durable than facts stored in isolation.',
    protocol: [
      'For any fact or rule you need to know, ask: "Why is this true?"',
      'For the answer to that question, ask "Why?" again.',
      'Continue until you reach bedrock — a foundational principle with no deeper why.',
      'Connect this chain to something you already know well.',
      'When reviewing, recall the chain, not just the surface fact.',
    ],
    field: 'Science, law, mathematics, any domain where understanding > memorisation.'
  },
  {
    id: '010',
    name: 'MISSION DEBRIEF',
    subtitle: 'Metacognition Protocol',
    color: WHITE,
    tagline: 'Review your own performance after every session. The debrief is where real growth happens.',
    what: 'Most operatives finish a session and move on. High performers spend 5–10 minutes debriefing: what worked, what didn\'t, what was harder than expected, what new questions emerged. This metacognitive habit turns experience into learning about learning — progressively improving not just your knowledge, but the efficiency of your entire knowledge acquisition system.',
    protocol: [
      'At the end of every session, spend 5 minutes writing a debrief.',
      'Record: What did I actually absorb today? What confused me? What needs more depth?',
      'Note which exploits felt effective and which felt like wasted effort.',
      'Identify what you will do differently in the next session.',
      'Review past debriefs before starting a new session to maintain continuity.',
    ],
    field: 'Every session, every topic, every operative. Non-optional.'
  }
];

function exploitColor(exploit) {
  if (exploit.color === GREEN)   return '#39FF14';
  if (exploit.color === MAGENTA) return '#FF00FF';
  if (exploit.color === PURPLE)  return '#8A2BE2';
  return '#ffffff';
}

function drawPageBg(doc) {
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0a0a0a');
}

function pageFooterLink(doc) {
  const W = doc.page.width;
  const H = doc.page.height;
  const linkText = 'shiftglitch.replit.app';
  doc.font('Courier').fontSize(9).fillColor('#39FF14').fillOpacity(0.55)
    .text(linkText, 0, H - 26, { width: W, align: 'center' });
  const tw = doc.widthOfString(linkText);
  doc.link((W - tw) / 2, H - 28, tw, 14, SITE);
  doc.fillOpacity(1);
}

function addCoverPage(doc) {
  drawPageBg(doc);

  const W = doc.page.width;
  const H = doc.page.height;

  doc.rect(0, 0, W, 6).fill('#39FF14');
  doc.rect(0, H - 6, W, 6).fill('#39FF14');
  doc.rect(0, 0, 6, H).fill('#39FF14');
  doc.rect(W - 6, 0, 6, H).fill('#39FF14');

  doc.font('Courier').fontSize(10).fillColor('#39FF14').fillOpacity(0.6)
    .text('// SHIFTGLITCH SYSTEMS — CLASSIFIED INTEL PACKAGE — OPERATIVE EYES ONLY //', 40, 30, { width: W - 80, align: 'center' });
  doc.fillOpacity(1);

  doc.font('Courier-Bold').fontSize(52).fillColor('#ffffff').text('SHIFT', 60, 130);
  const shiftW = doc.widthOfString('SHIFT');
  doc.font('Courier-Bold').fontSize(52).fillColor('#39FF14').text('GLITCH', 60 + shiftW, 130);

  doc.font('Courier').fontSize(12).fillColor('#39FF14').fillOpacity(0.8)
    .text('COGNITIVE EXPLOIT MANUAL', 60, 204, { characterSpacing: 3 });
  doc.fillOpacity(1);

  const titleY = 260;
  doc.font('Courier-Bold').fontSize(32).fillColor('#ffffff').text('THE',       60, titleY);
  doc.font('Courier-Bold').fontSize(32).fillColor('#ffffff').text('COGNITIVE', 60, titleY + 40);
  doc.font('Courier-Bold').fontSize(32).fillColor('#FF00FF').text('EXPLOIT',   60, titleY + 80);
  doc.font('Courier-Bold').fontSize(32).fillColor('#ffffff').text('MANUAL',    60, titleY + 120);

  doc.rect(60, titleY + 170, W - 120, 2).fill('#39FF14');

  doc.font('Courier').fontSize(13).fillColor('#d0d0d0')
    .text('10 battle-tested cognitive protocols that rewire how you absorb,\nretain, and deploy knowledge. For operatives serious about\nadvancing beyond NPC status.', 60, titleY + 186, { width: W - 120, lineGap: 5 });

  const infoY = 545;
  doc.font('Courier').fontSize(10).fillColor('#39FF14').fillOpacity(0.65)
    .text('// CLASSIFICATION: OPEN SOURCE — SHARE FREELY //', 60, infoY);
  doc.fillOpacity(1);

  doc.font('Courier').fontSize(11).fillColor('#aaaaaa')
    .text('Compiled by ShiftGlitch Systems — ', 60, infoY + 20, { continued: true });
  doc.font('Courier').fontSize(11).fillColor('#39FF14')
    .text('shiftglitch.replit.app');
  doc.link(60, infoY + 20, W - 120, 16, SITE);

  const rankY = H - 84;
  doc.font('Courier').fontSize(10).fillColor('#777777')
    .text('RANK PROGRESSION: NPC  →  SCRIPT KIDDIE  →  GLITCH TECH  →  NETRUNNER  →  SYSTEM ADMIN', 60, rankY, { width: W - 120, align: 'center', characterSpacing: 1 });
}

function addTocPage(doc) {
  doc.addPage();
  drawPageBg(doc);

  const W = doc.page.width;

  doc.font('Courier').fontSize(10).fillColor('#39FF14').fillOpacity(0.7)
    .text('// TABLE OF CONTENTS //', 60, 40, { characterSpacing: 3 });
  doc.fillOpacity(1);

  doc.font('Courier-Bold').fontSize(26).fillColor('#ffffff').text('EXPLOIT INDEX', 60, 72);
  doc.rect(60, 108, W - 120, 1.5).fill('#39FF14').fillOpacity(0.4);
  doc.fillOpacity(1);

  let y = 124;
  EXPLOITS.forEach(e => {
    const col = exploitColor(e);
    doc.font('Courier-Bold').fontSize(12).fillColor(col).text(e.id, 60, y);
    doc.font('Courier-Bold').fontSize(12).fillColor('#ffffff').text(e.name, 110, y);
    doc.font('Courier').fontSize(10).fillColor('#999999').text(e.subtitle, 110, y + 16);
    y += 46;
  });

  y += 8;
  doc.rect(60, y, W - 120, 1).fill('#444444');
  y += 16;
  doc.font('Courier').fontSize(11).fillColor('#888888').text('Introduction ......................... p.3', 60, y);
  y += 18;
  doc.font('Courier').fontSize(11).fillColor('#888888').text('Rank Progression Guide ............... p.14', 60, y);
  y += 18;
  doc.font('Courier').fontSize(11).fillColor('#888888').text('Final Transmission ................... p.15', 60, y);

  y += 32;
  doc.font('Courier').fontSize(11).fillColor('#39FF14').fillOpacity(0.7)
    .text('Deploy every exploit at  shiftglitch.replit.app', 60, y);
  const linkStart = 60 + doc.widthOfString('Deploy every exploit at  ');
  doc.link(linkStart, y, doc.widthOfString('shiftglitch.replit.app'), 14, SITE);
  doc.fillOpacity(1);

  pageFooterLink(doc);
}

function addIntroPage(doc) {
  doc.addPage();
  drawPageBg(doc);

  const W = doc.page.width;

  doc.font('Courier').fontSize(11).fillColor('#39FF14').fillOpacity(0.8)
    .text('// INTRODUCTION //', 60, 40, { characterSpacing: 3 });
  doc.fillOpacity(1);

  doc.font('Courier-Bold').fontSize(26).fillColor('#ffffff')
    .text('YOU\'VE BEEN\nJACKED IN.', 60, 72);
  doc.rect(60, 142, W - 120, 2).fill('#39FF14');

  const intro = [
    'Welcome, operative. You are holding intelligence that most people never find.',
    'The education system gave you the wrong tools. You were told to re-read, to highlight, to cram the night before. These strategies feel productive — and produce almost nothing. The neuroscience has been clear for decades. Almost nobody teaches it.',
    'ShiftGlitch is built on the science of how your brain actually works. Every feature — the flashcard system, the focus protocols, the rank progression — is engineered around the cognitive mechanisms that govern long-term memory, attention, and skill acquisition.',
    'This manual gives you the protocols. Ten cognitive exploits, field-tested by researchers and practitioners, explained in plain operational terms. Each one will change how you work.',
    'You do not have to use all of them at once. Start with Exploit 002: Active Recall. It is the highest-return protocol in existence. If you build only that habit, you will outperform 90% of your competition.',
    'After that, layer in Exploit 003 (Spaced Repetition) and watch the compounding effect kick in.',
    'The exploits in this manual are ordered from foundational to advanced. Read through them once. Then come back to the ones most relevant to your current mission.',
    'The Mainframe is waiting.',
  ];

  let y = 158;
  intro.forEach(para => {
    doc.font('Courier').fontSize(12).fillColor('#dedede').text(para, 60, y, { width: W - 120, lineGap: 4 });
    y += doc.heightOfString(para, { width: W - 120, lineGap: 4 }) + 16;
  });

  pageFooterLink(doc);
}

function addExploitPage(doc, exploit) {
  doc.addPage();
  drawPageBg(doc);

  const W = doc.page.width;
  const H = doc.page.height;
  const col = exploitColor(exploit);

  doc.rect(0, 0, 8, H).fill(col);

  doc.font('Courier').fontSize(52).fillColor(col).fillOpacity(0.1)
    .text(exploit.id, W - 120, 18);
  doc.fillOpacity(1);

  doc.font('Courier-Bold').fontSize(11).fillColor(col)
    .text(`// EXPLOIT ${exploit.id}`, 24, 40, { characterSpacing: 2 });

  doc.font('Courier-Bold').fontSize(28).fillColor('#ffffff').text(exploit.name, 24, 62);

  doc.font('Courier').fontSize(12).fillColor(col)
    .text(exploit.subtitle, 24, 100, { characterSpacing: 1 });

  doc.rect(24, 122, W - 48, 1.5).fill(col).fillOpacity(0.5);
  doc.fillOpacity(1);

  doc.rect(24, 130, W - 48, 40).fill('#141414');
  doc.font('Courier-Bold').fontSize(12).fillColor(col)
    .text(`"${exploit.tagline}"`, 36, 141, { width: W - 72 });

  let y = 184;

  doc.font('Courier-Bold').fontSize(11).fillColor(col)
    .text('// WHAT IT IS', 24, y, { characterSpacing: 2 });
  y += 20;
  doc.font('Courier').fontSize(12).fillColor('#e0e0e0')
    .text(exploit.what, 24, y, { width: W - 48, lineGap: 4 });
  y += doc.heightOfString(exploit.what, { width: W - 48, lineGap: 4 }) + 20;

  doc.font('Courier-Bold').fontSize(11).fillColor(col)
    .text('// THE PROTOCOL', 24, y, { characterSpacing: 2 });
  y += 20;

  exploit.protocol.forEach((step, i) => {
    const stepText = `${i + 1}.  ${step}`;
    doc.font('Courier').fontSize(11).fillColor('#e8e8e8')
      .text(stepText, 24, y, { width: W - 48, lineGap: 3 });
    y += doc.heightOfString(stepText, { width: W - 48, lineGap: 3 }) + 10;
  });

  y += 8;
  doc.rect(24, y, W - 48, 1).fill('#2a2a2a');
  y += 12;
  doc.font('Courier-Bold').fontSize(10).fillColor('#999999')
    .text('FIELD APPLICATION:  ', 24, y, { continued: true });
  doc.font('Courier').fontSize(10).fillColor('#bbbbbb').text(exploit.field);

  y += 26;
  const linkLabel = `→  Deploy this exploit at  shiftglitch.replit.app`;
  doc.font('Courier').fontSize(10).fillColor('#39FF14').fillOpacity(0.7).text(linkLabel, 24, y);
  const linkX = 24 + doc.widthOfString('→  Deploy this exploit at  ');
  doc.link(linkX, y, doc.widthOfString('shiftglitch.replit.app'), 13, SITE);
  doc.fillOpacity(1);

  pageFooterLink(doc);
}

function addRankPage(doc) {
  doc.addPage();
  drawPageBg(doc);

  const W = doc.page.width;
  const H = doc.page.height;

  doc.font('Courier').fontSize(11).fillColor('#39FF14').fillOpacity(0.8)
    .text('// RANK PROGRESSION //', 60, 40, { characterSpacing: 3 });
  doc.fillOpacity(1);

  doc.font('Courier-Bold').fontSize(26).fillColor('#ffffff').text('THE ESCAPE ROUTE', 60, 72);
  doc.rect(60, 108, W - 120, 2).fill('#39FF14');

  const ranks = [
    { id: '00', name: 'NPC',           color: '#777777', req: 'Starting rank. You are jacked in but not yet aware of your situation.' },
    { id: '01', name: 'SCRIPT KIDDIE', color: '#3a9a3a', req: 'Complete 5 focus sessions. Run 10 active recall rounds. Build your first flashcard deck (20+ cards).' },
    { id: '02', name: 'GLITCH TECH',   color: '#8A2BE2', req: 'Achieve a 7-day focus streak. Complete 3 Diagnostic missions. Deploy 3 different cognitive exploits.' },
    { id: '03', name: 'NETRUNNER',     color: '#39FF14', req: 'Complete a Mission Debrief for every session for 14 consecutive days. Maintain 80%+ flashcard success rate over 30 days.' },
    { id: '04', name: 'SYSTEM ADMIN',  color: '#FF00FF', req: 'Complete a full Escape Run. Demonstrate mastery across all 10 cognitive exploits. Operate at Netrunner level for 30 days.' },
  ];

  let y = 120;
  ranks.forEach(rank => {
    doc.rect(60, y, W - 120, 66).fill('#111111');
    doc.rect(60, y, 5, 66).fill(rank.color);

    doc.font('Courier').fontSize(10).fillColor('#888888')
      .text(`RANK ${rank.id}`, 78, y + 10, { characterSpacing: 2 });
    doc.font('Courier-Bold').fontSize(15).fillColor(rank.color).text(rank.name, 78, y + 24);
    doc.font('Courier').fontSize(10).fillColor('#cccccc')
      .text(rank.req, 78, y + 44, { width: W - 160 });

    y += 76;
  });

  y += 14;
  doc.rect(60, y, W - 120, 1).fill('#444444');
  y += 16;
  doc.font('Courier').fontSize(11).fillColor('#cccccc')
    .text('Ranks are earned through sustained consistent effort. They cannot be purchased, bypassed, or simulated.', 60, y, { width: W - 120, lineGap: 4 });

  y += 40;
  const rankLinkLabel = 'Start your rank climb — free — at  shiftglitch.replit.app';
  doc.font('Courier').fontSize(11).fillColor('#39FF14').fillOpacity(0.8).text(rankLinkLabel, 60, y);
  const rankLinkX = 60 + doc.widthOfString('Start your rank climb — free — at  ');
  doc.link(rankLinkX, y, doc.widthOfString('shiftglitch.replit.app'), 14, SITE);
  doc.fillOpacity(1);

  pageFooterLink(doc);
}

function addClosingPage(doc) {
  doc.addPage();
  drawPageBg(doc);

  const W = doc.page.width;
  const H = doc.page.height;

  doc.rect(0, 0, W, 6).fill('#39FF14');
  doc.rect(0, H - 6, W, 6).fill('#39FF14');

  doc.font('Courier-Bold').fontSize(30).fillColor('#ffffff').text('FINAL\nTRANSMISSION', 60, 80);
  doc.rect(60, 168, W - 120, 2).fill('#FF00FF');

  const paras = [
    'You now hold more practical knowledge about how human memory works than most people will ever encounter. The question is not whether these exploits work — the research is conclusive. The question is whether you will deploy them.',
    'Consistency is the only differentiator. A mediocre operative who shows up every day will outrun a brilliant one who doesn\'t.',
    'The Mainframe is waiting. Jack in.',
  ];

  let y = 186;
  paras.forEach(para => {
    doc.font('Courier').fontSize(13).fillColor('#e0e0e0').text(para, 60, y, { width: W - 120, lineGap: 5 });
    y += doc.heightOfString(para, { width: W - 120, lineGap: 5 }) + 20;
  });

  y += 8;
  doc.rect(60, y, W - 120, 1).fill('#333333');
  y += 20;

  doc.font('Courier-Bold').fontSize(13).fillColor('#39FF14').text('shiftglitch.replit.app', 60, y);
  doc.link(60, y, doc.widthOfString('shiftglitch.replit.app'), 16, SITE);
  y += 20;
  doc.font('Courier').fontSize(12).fillColor('#bbbbbb').text('Free to start. No credit card. No trial period.', 60, y);
  y += 20;
  doc.font('Courier').fontSize(12).fillColor('#888888')
    .text('Questions: ', 60, y, { continued: true });
  doc.font('Courier').fontSize(12).fillColor('#39FF14').text('admin@shiftglitch.com');
  doc.link(60 + doc.widthOfString('Questions: '), y, doc.widthOfString('admin@shiftglitch.com'), 14, 'mailto:admin@shiftglitch.com');

  doc.font('Courier').fontSize(9).fillColor('#39FF14').fillOpacity(0.4)
    .text('// END TRANSMISSION — SHIFTGLITCH SYSTEMS — © 2026 LOURENS BREYTENBACH //', 60, H - 48, { width: W - 120, align: 'center' });
  doc.fillOpacity(1);
}

function generateEbook(res) {
  const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: false });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="ShiftGlitch-Cognitive-Exploit-Manual.pdf"');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  doc.pipe(res);

  doc.addPage();
  addCoverPage(doc);
  addTocPage(doc);
  addIntroPage(doc);
  EXPLOITS.forEach(e => addExploitPage(doc, e));
  addRankPage(doc);
  addClosingPage(doc);

  doc.end();
}

module.exports = { generateEbook };
