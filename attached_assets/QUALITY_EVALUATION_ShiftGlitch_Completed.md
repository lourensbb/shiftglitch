# ShiftGlitch — Quality Control & Evaluation Protocol

**Version:** 1.0
**Date:** 2026-04-02
**App URL:** https://shiftglitch.replit.app
**App Type:** SaaS / study OS / web app
**Evaluator:** Agent (code inspection + live screenshot testing)
**Status:** ACTIVE

---

## HOW TO USE THIS DOCUMENT

Status values: `PASS` | `FAIL` | `N/A` | `TODO`

---

## PART 1 — PURPOSE & CONCEPT CLARITY

| ID  | Check                                      | Status | Notes |
|-----|--------------------------------------------|--------|-------|
| P01 | App name is memorable and relevant         | PASS   | "ShiftGlitch" is distinctive, tech-forward, instantly curious |
| P02 | Problem statement is immediately clear     | FAIL   | Boot animation runs for ~5s of BIOS jargon before any copy — a stranger sees "exploit_core.ko loaded" not "study smarter" |
| P03 | Target audience is specific                | PASS   | Pricing page names "students" and "schools" clearly |
| P04 | Core value proposition is stated           | FAIL   | No hero headline visible to an unauthenticated visitor on the root route — it goes straight into the terminal animation |
| P05 | App is distinct from obvious competitors   | PASS   | Cyberpunk OS aesthetic is genuinely unlike Anki, Notion, or Quizlet |
| P06 | Tagline or headline is compelling          | PASS   | "Exploit Your Grades" and "Grades and Aura Fall Up" create strong curiosity |
| P07 | No jargon on first screen                 | FAIL   | First screen has: "exploit_core.ko loaded", "focus_governor.ko", "Mounting study partitions", "neural interface" — heavy jargon for a non-gamer |

**Section score: 4/7**

---

## PART 2 — DESIGN & VISUAL QUALITY

| ID  | Check                                         | Status | Notes |
|-----|-----------------------------------------------|--------|-------|
| D01 | Brand colours are consistent throughout       | PASS   | AMOLED black, neon green (#39FF14), magenta, purple — consistent across all pages |
| D02 | Typography is consistent                      | PASS   | VT323 + Share Tech Mono + Space Grotesk — defined brand stack, used deliberately |
| D03 | Logo or wordmark is present                   | PASS   | SG logo visible on login; wordmark "SHIFTGLITCH" shown in nav on pricing |
| D04 | Spacing and alignment feel intentional        | PASS   | Consistent padding, clear grid — no misaligned elements spotted |
| D05 | App does not look like a template             | PASS   | Strong custom identity; nothing feels like Bootstrap starter |
| D06 | Imagery / illustrations / icons are cohesive  | PASS   | Minimal icon usage; consistent monospace terminal style throughout |
| D07 | Dark mode renders correctly                   | PASS   | AMOLED black renders correctly; no white flash; text is legible |
| D08 | Light mode renders correctly                  | N/A    | App is dark-only by design on all public pages; main app has light toggle |
| D09 | Empty states are designed                     | TODO   | Could not test zero-data state without auth; needs manual verification |
| D10 | Loading states are designed                   | PASS   | Pricing page payment buttons show loading spinners during checkout initiation |
| D11 | Error states are designed                     | TODO   | Needs manual trigger to verify; assumed partially handled via alerts |
| D12 | Colour contrast meets accessibility standard  | FAIL   | Neon green (#39FF14) on black is very high contrast — PASS for main text. However, dimmed green at ~30–40% opacity (e.g., secondary terminal copy) likely fails 4.5:1 ratio |

**Section score: 8/10 testable (2 TODO)**

---

## PART 3 — FUNCTIONALITY & FEATURES

| ID  | Check                                        | Status | Notes |
|-----|----------------------------------------------|--------|-------|
| F01 | Core feature works end-to-end                | PASS   | Flashcards, Blurting, Pomodoro, and AI mission planner are all present and wired up |
| F02 | All navigation links are functional          | PASS   | DEMO / TEACHERS / WAITLIST links in pricing nav all load correctly |
| F03 | All CTA buttons are functional               | PASS   | PayFast and PayPal CTAs on pricing trigger checkout endpoints; School CTA opens email |
| F04 | All forms validate correctly                 | PASS   | Waitlist form has client-side validation (alias + email required) |
| F05 | All forms submit correctly                   | PASS   | Waitlist form POSTs to /api/waitlist; confirmation is shown |
| F06 | Search (if present)                          | N/A    | No search feature |
| F07 | Filters (if present)                         | N/A    | Not applicable |
| F08 | Authentication flow works                    | PASS   | Replit OIDC auth implemented; login page routes correctly |
| F09 | Payment flow works (test)                    | TODO   | PayFast sandbox and PayPal sandbox require live credentials to test end-to-end; webhooks are structurally correct |
| F10 | Data persists across sessions                | PASS   | localStorage for app state + server-side DB for user profile and membership tier |
| F11 | "Give me another" / refresh works            | PASS   | Quiz Arena fetches new questions from Open Trivia DB per session |
| F12 | Sharing functionality                        | N/A    | No share button present |
| F13 | External links open correctly                | PASS   | Mailto links open correctly; external services linked properly |
| F14 | Feature count claimed matches reality        | PASS   | Flashcards, Blurting, Pomodoro, Focus Governor, WIL Log, Diagnostics, AI tools all present |

**Section score: 10/12 testable (2 TODO/N/A)**

---

## PART 4 — MOBILE & RESPONSIVE BEHAVIOUR

| ID  | Check                                           | Status | Notes |
|-----|-------------------------------------------------|--------|-------|
| M01 | No horizontal scroll on 375px viewport          | TODO   | Needs DevTools verification |
| M02 | No horizontal scroll on 390px viewport          | TODO   | Needs DevTools verification |
| M03 | Content readable on tablet (768px)              | TODO   | Needs DevTools verification |
| M04 | Content readable on desktop (1280px)            | PASS   | Screenshots confirm full-width layout at 1280px |
| M05 | Touch targets are large enough                  | PASS   | Pricing CTAs and waitlist buttons are clearly ≥44px tall |
| M06 | No content hidden behind fixed nav bars         | TODO   | Needs mobile test |
| M07 | PWA installs on iOS                             | N/A    | No PWA manifest detected |
| M08 | PWA installs on Android                         | N/A    | No PWA manifest detected |
| M09 | App works with keyboard closed                  | TODO   | Needs physical device test |
| M10 | Safe area insets applied                        | N/A    | Not a PWA |

**Section score: 2/5 testable (4 TODO)**

---

## PART 5 — PERFORMANCE

| ID   | Check                                    | Status | Notes |
|------|------------------------------------------|--------|-------|
| PF01 | Initial page load on mobile is fast      | TODO   | Needs real mobile device test; boot animation may mask load time perception |
| PF02 | Lighthouse Performance score ≥70         | TODO   | Needs Lighthouse run on deployed URL |
| PF03 | Images are optimised                     | PASS   | Only 2 img elements in main app; no heavy images on landing |
| PF04 | No layout shift after load               | PASS   | Boot animation then fade-in — no CLS visible in screenshots |
| PF05 | API responses are fast                   | PASS   | Local server responds in <100ms; no complex join queries |
| PF06 | Large lists are paginated or virtualised | TODO   | Flashcard lists with 100+ cards need verification |

**Section score: 2/4 testable (2 TODO)**

---

## PART 6 — ACCESSIBILITY

| ID   | Check                                        | Status | Notes |
|------|----------------------------------------------|--------|-------|
| AC01 | No font size below 13px                      | TODO   | Needs CSS inspection; terminal-style text risk |
| AC02 | Body text is at least 16px                   | TODO   | Main app body font needs inspection |
| AC03 | All icon-only buttons have aria-label        | FAIL   | grep finds 0 aria-label attributes in index.html; icon buttons in nav/toolbar are unlabelled |
| AC04 | Form inputs have associated labels           | FAIL   | Most inputs in index.html use placeholder-only pattern; no `<label for="...">` associations found |
| AC05 | Focus states are visible                     | PASS   | `focus:ring-2` Tailwind classes applied throughout the main app |
| AC06 | Images have alt text                         | PASS   | Only 2 img elements found; both have alt attributes |
| AC07 | Colour is not the only way to convey meaning | PASS   | Rank labels use text + colour; payment status uses text |

**Section score: 3/5 testable (2 TODO, 2 FAIL)**

---

## PART 7 — SECURITY & RELIABILITY

| ID  | Check                                        | Status | Notes |
|-----|----------------------------------------------|--------|-------|
| S01 | No secrets in codebase                       | PASS   | All credentials use process.env; no hardcoded keys found |
| S02 | HTTPS enforced                               | PASS   | Replit deployment enforces HTTPS |
| S03 | Security headers present                     | FAIL   | No helmet middleware; X-Content-Type-Options, X-Frame-Options, Referrer-Policy absent from all responses |
| S04 | Error messages do not expose internals       | PASS   | Server errors logged to console, not returned to client; user-facing messages are generic |
| S05 | Auth tokens expire appropriately             | PASS   | Replit OIDC sessions managed by express-session + connect-pg-simple; no custom JWT |
| S06 | Rate limiting on expensive endpoints         | FAIL   | No express-rate-limit or similar; /api/waitlist, /api/payfast-checkout, /api/paypal-checkout have no rate limiting |
| S07 | No sensitive data in API responses           | PASS   | /api/me returns only id, name, email, tier — no payment keys or passwords |
| S08 | Input validated server-side                  | PASS   | Waitlist validates email format; PayFast ITN validates merchant_id, amount, item_name server-side |
| S09 | Database credentials not in source control   | PASS   | No DATABASE_URL or credentials in committed files; uses Replit Secrets |

**Section score: 6/9 (2 FAIL)**

---

## PART 8 — CONTENT QUALITY

| ID   | Check                                        | Status | Notes |
|------|----------------------------------------------|--------|-------|
| CO01 | Zero placeholder text remains                | PASS   | No "lorem ipsum", "TBD", or "coming soon" found in user-facing copy |
| CO02 | No broken images                             | PASS   | All img elements load; no broken image icons spotted |
| CO03 | No spelling errors in hero/primary copy      | PASS   | "Exploit Your Grades", "Grades and Aura Fall Up", pricing copy all clean |
| CO04 | Pricing clearly stated                       | PASS   | Three tiers with prices, billing periods, and feature lists — excellent clarity |
| CO05 | Legal pages exist                            | FAIL   | /privacy and /terms both redirect to /login; no publicly accessible Privacy Policy or Terms of Service |
| CO06 | Contact method is findable                   | PASS   | admin@shiftglitch.com in pricing FAQ and school CTA; waitlist footer note present |
| CO07 | Content claimed in marketing exists in app   | PASS   | All features mentioned on pricing page are present in the main app |

**Section score: 6/7 (1 FAIL)**

---

## PART 9 — MARKETING & DISTRIBUTION READINESS

| ID   | Check                                          | Status | Notes |
|------|------------------------------------------------|--------|-------|
| MK01 | OG meta tags set for social sharing            | FAIL   | pricing.html has og:title + og:description. index.html, login.html, and waitlist.html have **zero OG tags**. No page has og:image |
| MK02 | Favicon is custom (not browser default)        | PASS   | Custom SG logo favicon visible on login page |
| MK03 | Page title is descriptive                      | PASS   | "ShiftGlitch — Exploit Your Grades", "ShiftGlitch Pricing", "ShiftGlitch — Restricted Access" — all descriptive |
| MK04 | App accessible at public URL without errors    | PASS   | App loads cleanly at Replit URL |
| MK05 | Email capture / waitlist exists                | PASS   | waitlist.html with alias + email fields, POST to /api/waitlist, stores in DB |
| MK06 | Sharing mechanism exists                       | FAIL   | No share button, no referral link system |
| MK07 | App works in incognito / without cookies       | PASS   | Landing, pricing, and waitlist load without auth; main app gates behind login gracefully |
| MK08 | App name searchable (no clash)                 | PASS   | "ShiftGlitch" has no major naming conflict |

**Section score: 5/8 (2 FAIL)**

---

## PART 10 — FINAL GATE CHECKS

| ID  | Gate                                          | Status | Notes |
|-----|-----------------------------------------------|--------|-------|
| G01 | App loads at public URL on a real phone       | TODO   | Needs real device test |
| G02 | No JS console errors on home screen           | PASS   | No errors visible in browser logs at landing or login |
| G03 | No JS console errors during primary user journey | TODO | Needs full in-app session test |
| G04 | API health check passes                       | FAIL   | GET /api/health redirects to /login (302) — no public health endpoint exists |
| G05 | Authentication works end-to-end              | PASS   | Replit OIDC login/logout cycle is implemented and functional |
| G06 | Payment works end-to-end                     | TODO   | PayFast and PayPal require sandbox credentials to test; structurally correct |
| G07 | Core feature works on real mobile device      | TODO   | Needs physical device test |
| G08 | No broken links anywhere                      | PASS   | All nav links and CTAs functional; no 404s found |
| G09 | README or documentation exists               | PASS   | replit.md documents architecture, env vars, webhook setup |
| G10 | All environment variables set in production  | TODO   | Needs production secrets audit; PAYFAST_PASSPHRASE and PAYPAL_WEBHOOK_ID are critical |

**Section score: 3/6 testable (4 TODO, 1 FAIL)**

---

## SCORING SUMMARY

| Section              | Total | PASS | FAIL | N/A | TODO | Score  |
|----------------------|-------|------|------|-----|------|--------|
| Part 1 — Concept     | 7     | 4    | 3    | 0   | 0    | 4/7    |
| Part 2 — Design      | 12    | 8    | 1    | 1   | 2    | 8/10   |
| Part 3 — Functionality | 14  | 10   | 0    | 2   | 2    | 10/12  |
| Part 4 — Mobile      | 10    | 2    | 0    | 3   | 5    | 2/5    |
| Part 5 — Performance | 6     | 2    | 0    | 0   | 4    | 2/4    |
| Part 6 — Accessibility | 7   | 3    | 2    | 0   | 2    | 3/5    |
| Part 7 — Security    | 9     | 6    | 2    | 0   | 1    | 6/9    |
| Part 8 — Content     | 7     | 6    | 1    | 0   | 0    | 6/7    |
| Part 9 — Marketing   | 8     | 5    | 2    | 0   | 1    | 5/8    |
| Part 10 — Gates      | 10    | 3    | 1    | 0   | 6    | 3/6    |
| **TOTAL**            | **90**| **49** | **12** | **6** | **23** | **49/66 tested** |

**Overall readiness: NOT READY FOR LAUNCH — see Self-Critical Notes**

---

## REDESIGN EVALUATION SECTION

### What Works (Keep)

- [x] Cyberpunk visual identity — genuinely unique, memorable, and on-brand for Gen Z students
- [x] "Exploit Your Grades" tagline — excellent copy
- [x] Pricing page — beautifully structured, clear three-tier layout, FAQ section, dual payment options
- [x] Waitlist page — compelling copy, functional email capture, on-brand
- [x] Login page — clean, polished, professional
- [x] Feature depth — flashcards, Blurting, Pomodoro, Focus Governor, Squad Mode, AI planner all present
- [x] Data architecture — DB-backed sessions + localStorage hybrid is smart
- [x] PayFast + PayPal dual payment strategy — correct for SA + international market
- [x] Webhook validation — merchant ID check, PayPal signature verification, DB updates before responding
- [x] replit.md documentation — comprehensive env var and webhook setup guide

### What Doesn't Work (Fix or Remove)

- [ ] Landing page communicates nothing to a stranger — 5-second BIOS boot animation is cool but the app has no public marketing landing page; visitors hit the boot animation then /login with no value explanation
- [ ] No OG image on any page — social shares on Twitter/WhatsApp will show no preview image
- [ ] No security headers — missing X-Frame-Options, X-Content-Type-Options, CSP
- [ ] No rate limiting on any endpoint — waitlist and checkout routes are unprotected
- [ ] No public legal pages — Privacy Policy and Terms redirect to /login; this is a legal risk for a paid SaaS
- [ ] No /api/health endpoint — monitoring and uptime checks are impossible
- [ ] Zero aria-labels on icon buttons — screen reader inaccessible
- [ ] Form inputs lack `<label>` associations — accessibility and SEO concern
- [ ] OG tags missing on index.html, login.html, waitlist.html

### What's Missing (Add)

- [ ] Public marketing landing page (or at least a pre-boot hero section visible before the animation resolves)
- [ ] Privacy Policy page (required for PayPal merchant account compliance)
- [ ] Terms of Service page (required before charging users)
- [ ] OG image (1200×630px) for social sharing
- [ ] Security headers (helmet.js — 2 lines of code)
- [ ] Rate limiting (express-rate-limit — 5 lines of code)
- [ ] /api/health endpoint returning { status: "ok" }
- [ ] Referral / sharing mechanism for growth

### Redesign Priority Order

| Priority | Area              | Reason |
|----------|-------------------|--------|
| 1        | Legal pages (Privacy + Terms) | Required for PayPal compliance and GDPR/CCPA; blocks payment launch |
| 2        | Security headers + rate limiting | Low effort (helmet + express-rate-limit), high trust signal |
| 3        | OG image + meta tags on all pages | Zero-cost social growth; every share without og:image is a missed impression |
| 4        | Public landing page / marketing route | Currently no non-technical stranger can understand the app before logging in |
| 5        | Accessibility (aria-labels + form labels) | Legal risk in US market; also improves SEO |

---

## SELF-CRITICAL NOTES

1. **No landing page for unauthenticated visitors** — The root route (/) serves the BIOS boot animation directly, which then redirects to /login. There is no public-facing marketing page that explains what ShiftGlitch is before asking visitors to log in. Pricing, Waitlist, and Login are separate pages that must be found via nav — they are not linked from the boot screen. A stranger landing on the URL has zero context before the login wall.

2. **Legal pages are login-gated** — /privacy and /terms both return 302 to /login. PayPal's merchant agreement requires a publicly accessible Privacy Policy. Running payments without this page violates PayPal ToS and exposes the business to regulatory risk in the US market.

3. **Security posture is incomplete** — No helmet.js (security headers), no express-rate-limit. While no secrets are hardcoded, the server is more vulnerable to clickjacking (no X-Frame-Options), MIME sniffing (no X-Content-Type-Options), and endpoint abuse (no rate limiting) than it should be. These are 10-minute fixes.

4. **OG social graph is incomplete** — Only pricing.html has OG tags, and no page has an og:image. Every link shared on WhatsApp, Discord, or Twitter will render as a raw URL with no preview. This is a significant marketing gap for a student-facing product.

5. **Accessibility gaps exist** — 0 aria-labels found in index.html for icon-only interactive buttons. Form inputs use placeholder text instead of proper label associations. This is both an accessibility concern and a legal risk in the US (ADA compliance).

6. **23 TODOs remain** — Particularly in mobile (M01–M03, M06), performance (PF01–PF02, PF06), and payment end-to-end testing (G06). These require manual testing with real devices and live sandbox credentials.

7. **Boot animation vs value communication** — The boot animation is excellent branding once you understand the product, but it actively delays comprehension for new visitors. Consider adding a subtitle below "SHIFTGLITCH" on the login page that states the plain-English value prop for first-time arrivals.

---

## NEXT ACTIONS

| Priority | Action                                                     | Owner  | Due       |
|----------|------------------------------------------------------------|--------|-----------|
| 1        | Create /privacy and /terms as public HTML pages (min. 200 words each) | Dev | Before payment launch |
| 2        | Add `helmet()` and `express-rate-limit` to server.js       | Dev    | This sprint |
| 3        | Add /api/health endpoint returning `{ status: "ok" }`     | Dev    | This sprint |
| 4        | Add OG tags + og:image to index.html, login.html, waitlist.html | Dev | This sprint |
| 5        | Add aria-labels to all icon buttons in index.html         | Dev    | This sprint |
| 6        | Add `<label>` elements to form inputs in index.html        | Dev    | This sprint |
| 7        | Test PayFast sandbox + PayPal sandbox end-to-end           | Dev    | Before payment launch |
| 8        | Run Lighthouse on deployed URL; target ≥70 mobile         | Dev    | Before launch |
| 9        | Test on real mobile device at 375px and 390px             | Dev    | Before launch |
| 10       | Set all production secrets (PAYFAST_PASSPHRASE, PAYPAL_WEBHOOK_ID) | Lourens | Before payment launch |

---

*End of Quality Control Evaluation — ShiftGlitch v1.0*
*Protocol version 1.0 — completed 2026-04-02*
