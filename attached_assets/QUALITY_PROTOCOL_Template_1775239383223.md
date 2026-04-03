# \[APP\_NAME] — Quality Control \& Evaluation Protocol

**Version:** 1.0
**Date:** \[DATE]
**App URL:** \[APP\_URL]
**App Type:** \[web app / mobile PWA / dashboard / SaaS / tool / game / other]
**Evaluator:** \[NAME]
**Status:** \[DRAFT / ACTIVE / ARCHIVED]

\---

## HOW TO USE THIS DOCUMENT

This template is used to **adjudicate, evaluate, inspect, improve, redesign, and re-create** any app. Work through it in order. Fill in the **Status** column for each row with one of:

* `PASS` — criterion met
* `FAIL` — criterion not met (add a note)
* `N/A` — not applicable to this app
* `TODO` — not yet tested

Add any open issues to the **Self-Critical Notes** section at the bottom. Do not close this document until every gate check in Part 10 is `PASS`.

\---

## PART 1 — PURPOSE \& CONCEPT CLARITY

*Can a stranger understand this app in 5 seconds?*

|ID|Check|How to Verify|Pass Criteria|Status|Notes|
|-|-|-|-|-|-|
|P01|App name is memorable and relevant|Say it aloud; ask someone unfamiliar|Name reflects purpose without explanation|||
|P02|Problem statement is immediately clear|Open app cold; read first screen|Visitor understands the problem within 5 seconds|||
|P03|Target audience is specific|Read landing copy or onboarding|Audience is named — not "anyone"|||
|P04|Core value proposition is stated|Read hero section or first screen|One clear sentence: "This app does X for Y"|||
|P05|App is distinct from obvious competitors|Compare to 2 similar products|At least one genuine differentiator visible|||
|P06|Tagline or headline is compelling|Read it aloud|Creates curiosity or emotional resonance|||
|P07|No jargon on first screen|Read hero/onboarding as a non-expert|Zero unexplained technical terms|||

\---

## PART 2 — DESIGN \& VISUAL QUALITY

*Does this feel like a real product?*

|ID|Check|How to Verify|Pass Criteria|Status|Notes|
|-|-|-|-|-|-|
|D01|Brand colours are consistent throughout|Browse all pages/screens|Same primary palette used everywhere|||
|D02|Typography is consistent|Check headings and body text|No more than 2 font families; consistent sizing hierarchy|||
|D03|Logo or wordmark is present|Open app|Logo visible on home/landing; renders cleanly at all sizes|||
|D04|Spacing and alignment feel intentional|Scan any screen|No obviously misaligned elements; consistent padding|||
|D05|App does not look like a template|Show to someone unfamiliar|First impression is a real product, not a starter kit|||
|D06|Imagery / illustrations / icons are cohesive|Browse all screens|Consistent visual style; no mixed icon sets|||
|D07|Dark mode renders correctly (if applicable)|Toggle dark mode|No inverted colours; no white flash; legible text|||
|D08|Light mode renders correctly (if applicable)|Toggle light mode|White/off-white background; dark text; legible|||
|D09|Empty states are designed|Trigger zero-data state|Not a blank white box; has copy and a CTA|||
|D10|Loading states are designed|Trigger async operation|Skeleton, spinner, or progress indicator shown|||
|D11|Error states are designed|Trigger an error|Friendly error message; not a raw JS error|||
|D12|Colour contrast meets accessibility standard|Use browser accessibility checker|Body text contrast ratio ≥4.5:1|||

\---

## PART 3 — FUNCTIONALITY \& FEATURES

*Does it actually work?*

|ID|Check|How to Verify|Pass Criteria|Status|Notes|
|-|-|-|-|-|-|
|F01|Core feature works end-to-end|Use the primary feature|No crashes; expected output produced|||
|F02|All navigation links are functional|Tap/click every nav item|No 404s; no dead links|||
|F03|All CTA buttons are functional|Tap every primary button|Each button does what its label says|||
|F04|All forms validate correctly|Submit with missing/invalid fields|Validation messages appear; form does not crash|||
|F05|All forms submit correctly|Submit with valid data|Data saved; confirmation shown|||
|F06|Search (if present) returns relevant results|Type in search box|Results update; relevant items appear|||
|F07|Filters (if present) work correctly|Apply each filter|Results match the selected filter|||
|F08|Authentication flow works (if present)|Sign up → log in → log out|Full cycle completes without errors|||
|F09|Payment flow works (if present)|Initiate a test transaction|Checkout loads; test payment completes; status updates|||
|F10|Data persists across sessions|Create data; close app; reopen|Data is still present|||
|F11|"Give me another" / refresh works|Trigger a repeat action|New output is different from the previous|||
|F12|Sharing functionality works (if present)|Tap share button|Share sheet or copy-link functions correctly|||
|F13|External links open correctly|Tap any external link|Opens in new tab; correct destination|||
|F14|Feature count claimed matches reality|Count claimed vs live features|No feature mentioned in copy that does not exist|||

\---

## PART 4 — MOBILE \& RESPONSIVE BEHAVIOUR

*Does it work on a phone?*

|ID|Check|How to Verify|Pass Criteria|Status|Notes|
|-|-|-|-|-|-|
|M01|No horizontal scroll on 375px viewport|DevTools → 375px width|No overflow; all content visible|||
|M02|No horizontal scroll on 390px viewport|DevTools → 390px width|No overflow; no layout breakage|||
|M03|Content readable on tablet (768px)|DevTools → 768px|Layout adjusts; not a stretched mobile layout|||
|M04|Content readable on desktop (1280px)|DevTools → 1280px|Not a thin pillar; content uses available space|||
|M05|Touch targets are large enough|Inspect interactive elements|All buttons and links ≥44px tall|||
|M06|No content hidden behind fixed nav bars|Scroll to bottom on mobile|Last piece of content not cut off by tab bar|||
|M07|PWA installs on iOS (if applicable)|Safari → Share → Add to Home Screen|Icon appears; opens in standalone mode|||
|M08|PWA installs on Android (if applicable)|Chrome → Add to Home Screen|Icon appears; opens without browser chrome|||
|M09|App works with keyboard closed (mobile)|Dismiss keyboard mid-form|Layout does not collapse|||
|M10|Safe area insets applied (if mobile PWA)|Open on iPhone with home indicator|Content not hidden behind home indicator|||

\---

## PART 5 — PERFORMANCE

*Is it fast enough to feel professional?*

|ID|Check|How to Verify|Pass Criteria|Status|Notes|
|-|-|-|-|-|-|
|PF01|Initial page load on mobile is fast|Open app on mobile device|Meaningful content visible within 3 seconds on 4G|||
|PF02|Lighthouse Performance score|Run Lighthouse on deployed URL|Score ≥70 on mobile|||
|PF03|Images are optimised|Check image file sizes|No image above 500KB on initial load|||
|PF04|No layout shift after load|Watch page load|Content does not jump after appearing|||
|PF05|API responses are fast|Time a core data fetch|Response within 2 seconds under normal conditions|||
|PF06|Large lists are paginated or virtualised|Open a list with 50+ items|Page does not freeze or lag|||

\---

## PART 6 — ACCESSIBILITY

*Can people with different needs use this?*

|ID|Check|How to Verify|Pass Criteria|Status|Notes|
|-|-|-|-|-|-|
|AC01|No font size below 13px|Search codebase for small font sizes|Zero text elements below 13px|||
|AC02|Body text is at least 16px|Inspect body CSS|font-size ≥16px on body|||
|AC03|All icon-only buttons have aria-label|Inspect DOM|Zero unlabelled icon buttons|||
|AC04|Form inputs have associated labels|Inspect form markup|Each input has a label or aria-label|||
|AC05|Focus states are visible|Tab through app with keyboard|Clear focus ring on every interactive element|||
|AC06|Images have alt text|Inspect img elements|Every img has a descriptive alt attribute|||
|AC07|Colour is not the only way to convey meaning|Review any status indicators|Colour + text or icon used together|||

\---

## PART 7 — SECURITY \& RELIABILITY

*Is it stable and trustworthy?*

|ID|Check|How to Verify|Pass Criteria|Status|Notes|
|-|-|-|-|-|-|
|S01|No secrets in codebase|Search for API keys, tokens|Zero hardcoded credentials|||
|S02|HTTPS enforced on all pages|Check URL bar|Padlock visible; no mixed-content warnings|||
|S03|Security headers present|curl -I \[APP\_URL]/api/health|X-Content-Type-Options, X-Frame-Options present|||
|S04|Error messages do not expose internals|Trigger a server error|No stack traces or file paths in user-facing errors|||
|S05|Auth tokens expire appropriately|Decode JWT (if used)|Expiry set to a sensible value (e.g. 30 days)|||
|S06|Rate limiting on expensive endpoints|Make 30+ rapid requests|Returns 429 before server is overwhelmed|||
|S07|No sensitive data exposed in API responses|Inspect API response bodies|No passwords, full card numbers, or private keys returned|||
|S08|Input is validated server-side|Send malformed data to API|Server rejects it with 400; does not crash|||
|S09|Database credentials not in source control|Check .env files and git history|No DATABASE\_URL or similar in committed files|||

\---

## PART 8 — CONTENT QUALITY

*Is what's written actually good?*

|ID|Check|How to Verify|Pass Criteria|Status|Notes|
|-|-|-|-|-|-|
|CO01|Zero placeholder text remains|Search for "lorem", "TBD", "coming soon"|None found in user-facing copy|||
|CO02|No broken images|Browse every screen|No broken image icons anywhere|||
|CO03|No spelling errors in hero/primary copy|Read main screens carefully|Zero errors in high-visibility text|||
|CO04|Pricing is clearly stated (if applicable)|Find pricing information|Price, billing period, and what's included all visible|||
|CO05|Legal pages exist (if applicable)|Look for Privacy Policy / Terms|Links present; pages load; not empty|||
|CO06|Contact method is findable|Browse footer or about section|At least one way to reach the creator|||
|CO07|Content claimed in marketing exists in app|Compare landing page claims to live features|Every claimed feature is accessible|||

\---

## PART 9 — MARKETING \& DISTRIBUTION READINESS

*Is it ready for real users?*

|ID|Check|How to Verify|Pass Criteria|Status|Notes|
|-|-|-|-|-|-|
|MK01|OG meta tags set for social sharing|Inspect HTML head|og:title, og:description, og:image all present|||
|MK02|Favicon is custom (not browser default)|Check browser tab|Custom favicon visible|||
|MK03|Page title is descriptive|Check browser tab|Not "React App" or "Vite App"|||
|MK04|App is accessible at a public URL|Open in incognito on a different device|Loads without login; no dev-only errors|||
|MK05|Email capture or waitlist exists (if applicable)|Find signup form|Form submits; email stored|||
|MK06|Sharing mechanism exists|Find share button or referral link|Users can share the app with one tap|||
|MK07|App works in incognito / without cookies|Open in incognito|No crashes; core experience available|||
|MK08|App name is searchable (no clash)|Search app name on Google|No confusing overlap with a major existing product|||

\---

## PART 10 — FINAL GATE CHECKS

*All must be PASS before launch or submission.*

|ID|Gate|How to Verify|Pass Criteria|Status|
|-|-|-|-|-|
|G01|App loads at public URL on a real phone|Open \[APP\_URL] on mobile with no history|Loads in <5 seconds; core content visible||
|G02|No JS console errors on home screen|DevTools Console|Zero red errors||
|G03|No JS console errors during primary user journey|Use core feature with DevTools open|Zero red errors||
|G04|API health check passes (if applicable)|curl \[APP\_URL]/api/health|Returns { "status": "ok" }||
|G05|Authentication works end-to-end (if applicable)|Sign up with a real email; verify; log in|Full flow completes||
|G06|Payment works end-to-end (if applicable)|Complete a test transaction|Payment processed; status updated in app||
|G07|Core feature works on a real mobile device|Use the app on an actual phone|No crashes; output as expected||
|G08|No broken links anywhere|Click every link in the app|Zero 404s or dead links||
|G09|README or documentation exists|Check repo or /docs|At least a basic description of what the app does and how to run it||
|G10|All environment variables are set in production|Check hosting platform secrets|No missing env var errors in production logs||

\---

## REDESIGN EVALUATION SECTION

*Use this section when evaluating an existing app for a redesign or rebuild.*

### What Works (Keep)

List anything that is clearly working well and should be preserved in a redesign:

* \[ ] \[Item 1]
* \[ ] \[Item 2]
* \[ ] \[Item 3]

### What Doesn't Work (Fix or Remove)

List anything that is broken, confusing, or unnecessary:

* \[ ] \[Item 1]
* \[ ] \[Item 2]
* \[ ] \[Item 3]

### What's Missing (Add)

List features or elements that users need but the app currently lacks:

* \[ ] \[Item 1]
* \[ ] \[Item 2]
* \[ ] \[Item 3]

### Redesign Priority Order

|Priority|Area|Reason|
|-|-|-|
|1|||
|2|||
|3|||
|4|||
|5|||

\---

## SCORING SUMMARY

Fill this in after completing all checks above. Count PASS, FAIL, N/A, and TODO per section.

|Section|Total Checks|PASS|FAIL|N/A|TODO|Score|
|-|-|-|-|-|-|-|
|Part 1 — Concept|7|||||/7|
|Part 2 — Design|12|||||/12|
|Part 3 — Functionality|14|||||/14|
|Part 4 — Mobile|10|||||/10|
|Part 5 — Performance|6|||||/6|
|Part 6 — Accessibility|7|||||/7|
|Part 7 — Security|9|||||/9|
|Part 8 — Content|7|||||/7|
|Part 9 — Marketing|8|||||/8|
|Part 10 — Gate Checks|10|||||/10|
|**TOTAL**|**90**|||||**/90**|

**Overall readiness: \[PASS ALL GATES / NOT READY — see Self-Critical Notes]**

\---

## SELF-CRITICAL NOTES

List every honest gap, risk, or unresolved issue discovered during this evaluation. Do not skip this section. An empty section means the evaluation was not thorough enough.

1. \[Issue 1 — describe clearly what is wrong and what it affects]
2. \[Issue 2]
3. \[Issue 3]

\---

## NEXT ACTIONS

List the specific things to fix before this app is ready for launch or the next review:

|Priority|Action|Owner|Due|
|-|-|-|-|
|1||||
|2||||
|3||||

\---

*End of Quality Control \& Evaluation Protocol — \[APP\_NAME] v1.0
Template version: 1.0 — reusable for any web app, PWA, SaaS, or tool*

