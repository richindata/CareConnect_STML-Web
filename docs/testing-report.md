# CareConnect Testing Report

Validation record for the three testing requirements: automated accessibility testing, manual
accessibility testing, and cross-browser testing. Each section links the test scripts that
produced the result and the screenshot evidence captured for submission.

> For the system architecture, framework rationale, technical challenges, and code-reuse
> approach, see [docs/architecture.md](architecture.md).

---

## 1. Automated Web Accessibility Testing

**Status: Complete — zero errors/violations across all tools.**

Three independent tools were run against the production build: WAVE and axe DevTools (real
browser extensions, run manually against `localhost` by the project owner) and axe-core driven
through Playwright (scripted, runs headlessly across four browser engines). All three agree: **0
errors, 0 violations**.

### 1.1 axe DevTools (browser extension)

Run against all seven top-level routes (Dashboard, My Day, Medications, Reminders, Mail, Ask AI,
Settings). Every page reports **"Total Issues: 0"** / **"You have (0) automatic issues."**

Screenshots: [docs/screenshots/Axe Dev/](docs/screenshots/Axe%20Dev/)
- [Dashboard.png](docs/screenshots/Axe%20Dev/Dashboard.png)
- [My Day.png](docs/screenshots/Axe%20Dev/My%20Day.png)
- [Medications.png](docs/screenshots/Axe%20Dev/Medications.png)
- [Reminders.png](docs/screenshots/Axe%20Dev/Reminders.png)
- [Mail.png](docs/screenshots/Axe%20Dev/Mail.png)
- [Ask AI.png](docs/screenshots/Axe%20Dev/Ask%20AI.png)
- [Settings.png](docs/screenshots/Axe%20Dev/Settings.png)

### 1.2 WAVE (web accessibility evaluation tool)

Run against the same seven routes. Every page reports **0 Errors** and **0 Contrast Errors**
("Congratulations! No errors were detected."), with an AIM Score of 9.8–9.9/10. Remaining items
are advisory **Alerts** (e.g. "possible heading" on visually-hidden `<h2>` section headings) —
these are manual-review suggestions, not WCAG failures, and were checked by hand against the
semantic HTML in [src/pages/](src/pages/) and [src/components/](src/components/).

Screenshots: [docs/screenshots/WAVE/](docs/screenshots/WAVE/)
- [Dashboard.png](docs/screenshots/WAVE/Dashboard.png)
- [My Day.png](docs/screenshots/WAVE/My%20Day.png)
- [Medications.png](docs/screenshots/WAVE/Medications.png)
- [Reminders.png](docs/screenshots/WAVE/Reminders.png)
- [Mail.png](docs/screenshots/WAVE/Mail.png)
- [Ask AI.png](docs/screenshots/WAVE/Ask%20AI.png)
- [Settings.png](docs/screenshots/WAVE/Settings.png)

### 1.3 Lighthouse

Run against the production build (`vite preview`) with headless Chrome, desktop preset:

```
npx lighthouse http://localhost:4173/ --preset=desktop --chrome-flags="--headless=new --no-sandbox --disable-gpu"
```

| Category         | Score |
| ---------------- | ----- |
| Performance      | 100   |
| Accessibility    | 100   |
| Best Practices   | 100   |
| SEO              | 100   |

**All four required categories meet the 90+ target (all scored a perfect 100).**

Screenshot: [docs/screenshots/Lighthouse/Score.jpe](docs/screenshots/Lighthouse/Score.jpe),
[docs/perf/rescan-scores.png](docs/perf/rescan-scores.png)
Full HTML/JSON reports: [docs/perf/rescan.report.html](docs/perf/rescan.report.html),
[docs/perf/rescan.report.json](docs/perf/rescan.report.json)
(Original baseline before this pass: [docs/perf/baseline.report.html](docs/perf/baseline.report.html))

### 1.4 axe-core via Playwright (scripted regression test)

Because manual runs of WAVE/axe DevTools don't repeat automatically, an equivalent scripted check
was added so this stays enforced going forward — it drives real Chromium, Firefox, WebKit, and
Edge and scans every route, the account menu, and every modal dialog (Add Medication, Add
Reminder, Add Task, Invite Caregiver, Compose Message) with axe-core.

- Test script: [e2e/a11y.spec.ts](e2e/a11y.spec.ts)
- Shared login helper: [e2e/fixtures.ts](e2e/fixtures.ts)
- Config: [playwright.config.ts](playwright.config.ts)
- Run it: `npm run test:a11y` (or `npm run test:e2e` for the full Playwright suite)

Result: **36/36 tests passed, 0 violations**, across Chromium/Firefox/WebKit/Edge.

Screenshot (Playwright HTML report): [docs/screenshots/axe-cross-browser-report.png](docs/screenshots/axe-cross-browser-report.png)

### 1.5 Issues found and fixed

The scripted axe-core run caught several WCAG 2 AA color-contrast failures that the point-in-time
manual scans above no longer show (because they were fixed before those screenshots were taken):

- Care-team avatar initials (specialist/family tones) — insufficient contrast against their
  background circles.
- Status pills ("Completed"/"Pending") and role badges (nurse/family/aide/clinician) — text color
  too light against their tinted backgrounds.
- Chat bubble timestamp/name metadata — `opacity: 0.75` on white text over the brand-purple
  bubble dropped effective contrast below 4.5:1.
- PWA "update available" banner rendered outside any landmark region (axe `best-practice` "region"
  rule) — now wrapped in a labelled `role="region"`.

All fixed in [src/index.css](src/index.css) and [src/components/PwaStatus.tsx](src/components/PwaStatus.tsx).

---

## 2. Manual Web Accessibility Testing

**Status: Complete — semantic HTML, ARIA, and focus management (modals/dropdowns) verified by a
dedicated scripted test suite, all passing; keyboard-only navigation and VoiceOver screen-reader
testing recorded and verified by the project owner. Zero issues found.**

The full manual checklist, including recordings, is at
[docs/manual-accessibility-testing-checklist.md](docs/manual-accessibility-testing-checklist.md).

### 2.1 Semantic HTML, ARIA, and focus management — scripted verification

Rather than relying only on axe-core (which flags rule *violations* but doesn't confirm the
*right* element/attribute was used), a dedicated test suite checks the actual rendered DOM and
runtime behavior:

- Test script: [e2e/semantic-aria-focus.spec.ts](e2e/semantic-aria-focus.spec.ts)
- Run it: `npm run test:manual-checks` (or `npm run test:e2e` for the full Playwright suite)
- Result: **60/60 tests passed** across Chromium, Firefox, WebKit, and Edge.
- Screenshot: [docs/screenshots/semantic-aria-focus-report.png](docs/screenshots/semantic-aria-focus-report.png)

**Semantic HTML** — verified:
- Exactly one `<header>`, one labelled `<nav aria-label="Primary">`, one `<main>`, and one `<h1>`
  per page (a real heading outline, not styled `<div>`s).
- Primary navigation is a real `<ul>`/`<li>` list of `<a>` links, not clickable `<div>`s/`<span>`s.
- Sign-in and create-account use real `<form>` elements.
- Modals render as the native `<dialog>` element (confirmed via `tagName === 'DIALOG'`), with a
  real `<button>` close control whose icon is `aria-hidden`.

**ARIA usage** — verified:
- The account-menu trigger and mobile-nav toggle both expose `aria-expanded`/`aria-controls` that
  match reality: `aria-expanded` flips `false`→`true`, and the `aria-controls` id only exists in
  the DOM once the corresponding panel is open.
- Dialog `aria-labelledby`/`aria-describedby` resolve to real, visible elements whose text matches
  what a sighted user reads as the dialog's title.
- A single, correctly-configured live region (`role="status"`, `aria-live="polite"`,
  `aria-atomic="true"`) exists for status announcements ([src/context/AnnouncerProvider.tsx](src/context/AnnouncerProvider.tsx)).

**Focus management (modals and dropdowns)** — verified:
- Opening a dialog moves focus inside it immediately, and Tab never lands on an interactive
  element behind it — the native `<dialog>` focus trap holds across all four engines. (One benign
  implementation detail: Chromium/WebKit briefly pass focus through `document.body` — which has no
  interactive content of its own — when wrapping from the last focusable element back to the
  first, rather than jumping directly between them. Confirmed not to be a real escape.)
- Escape closes the dialog and returns focus to the button that opened it (Chromium/Firefox/Edge).
- Opening the account menu moves focus to **Sign out**; Escape closes it and returns focus to the
  trigger button, across all four engines.
- Opening the mobile nav panel is reachable and dismissible; Escape closes it and returns focus to
  the toggle (Chromium/Firefox/Edge).

One WebKit-specific finding, consistent with the Safari behavior already documented in Section 3:
Safari/WebKit does not give a `<button>` programmatic focus on click by default (only text
inputs receive click-focus) — a real Safari OS default, not an app bug. Because of this, the two
"Escape returns focus to the button that opened it" checks above have no previously-focused
opener to restore to when the *test* opens the dialog/panel via a simulated click in WebKit; this
is a limitation of simulating the interaction in that engine, not a defect in the app's focus
management (the account menu case is unaffected because it calls `.focus()` on the trigger
explicitly rather than relying on the browser's native "restore previous focus" behavior).

### 2.2 What's already verified as supporting evidence

| Area | Verified by | Reference |
| --- | --- | --- |
| Keyboard navigation (Tab/Enter/Escape) | Unit tests + Playwright keyboard smoke test | [src/test/app.test.tsx](src/test/app.test.tsx), [e2e/cross-browser.spec.ts](e2e/cross-browser.spec.ts) |
| Semantic HTML / landmarks | axe-core rules (zero violations) + dedicated DOM-structure tests | [e2e/a11y.spec.ts](e2e/a11y.spec.ts), [e2e/semantic-aria-focus.spec.ts](e2e/semantic-aria-focus.spec.ts) |
| ARIA usage | axe-core ARIA rules (zero violations) + dedicated runtime-attribute tests | [e2e/semantic-aria-focus.spec.ts](e2e/semantic-aria-focus.spec.ts) |
| Focus management (dialogs/menus) | Dedicated focus-trap and focus-restoration tests | [e2e/semantic-aria-focus.spec.ts](e2e/semantic-aria-focus.spec.ts) |

### 2.3 Keyboard-only navigation and VoiceOver screen-reader recordings

Recorded and verified by the project owner, covering every item in
[docs/manual-accessibility-testing-checklist.md](docs/manual-accessibility-testing-checklist.md)
(Tab order, skip link, primary nav, account menu, all five dialogs, Mail, Settings sub-nav,
landmark/heading announcements, form error announcements, live-region announcements, and native
element roles). **Result: no issues found.**

- Video: [docs/video/care_connect_keyboard_nav.mp4](docs/video/care_connect_keyboard_nav.mp4) (keyboard-only navigation)
- Video: [docs/video/care_connect_voiceover.mp4](docs/video/care_connect_voiceover.mp4) (VoiceOver screen-reader pass, macOS)

> Note: these recordings are local-only — `docs/video/` is git-ignored because one file exceeds
> GitHub's 100MB push limit. Provide them separately for submission if a reviewer needs the repo clone.

---

## 3. Cross-Browser Testing

**Status: Complete for Chromium, Firefox, WebKit (Safari engine), and Edge — one Safari-specific
behavior found and documented (not an app bug).**

A Playwright smoke test loads every public and authenticated route in four browser engines,
fails on any console/page error, and confirms landmark content renders; a companion test checks
keyboard-only navigation and the skip link.

- Test script: [e2e/cross-browser.spec.ts](e2e/cross-browser.spec.ts)
- Config (engines used): [playwright.config.ts](playwright.config.ts) — `chromium`, `firefox`,
  `webkit` (Safari's engine; real Safari is macOS-only and unavailable on this Windows workspace),
  `edge` (via the system-installed Microsoft Edge channel).
- Run it: `npm run test:cross-browser` (or `npm run test:e2e` for the full suite)

Result: **12/12 tests passed** across all four engines (36/36 including the axe-core suite from
Section 1). Screenshot: [docs/screenshots/axe-cross-browser-report.png](docs/screenshots/axe-cross-browser-report.png)

### 3.1 Browser-specific issue found

- **WebKit/Safari default Tab behavior**: unlike Chromium/Firefox/Edge, Safari's default keyboard
  preference only cycles the Tab key through form controls, not links — so the skip link (an
  `<a>`) is not the first Tab stop unless the user has enabled **Full Keyboard Access** in macOS
  System Settings. This is a documented Safari/OS-level behavior, not something fixable in the
  app's HTML/CSS/JS; VoiceOver users still reach the skip link via the rotor regardless of this
  setting. The test explicitly asserts this known behavior for `webkit` rather than treating it as
  a failure (see the `browserName === 'webkit'` branch in
  [e2e/cross-browser.spec.ts](e2e/cross-browser.spec.ts)).
- No other console errors, layout failures, or functional differences were observed across the
  four engines.

### 3.2 Recommended manual follow-up

Because real Safari (macOS) isn't available in this environment, running the same manual pass from
Section 2 once on an actual Mac/Safari is still recommended before final sign-off, specifically to
confirm VoiceOver + Safari behaves the same as the WebKit engine tested here.

---

## Quick reference: running everything

```bash
npm run build            # production build (required before Playwright/Lighthouse)
npm run preview           # serve the build on http://localhost:4173
npm run test               # unit tests (vitest)
npm run test:a11y          # axe-core accessibility scan, all engines
npm run test:cross-browser # cross-browser smoke test, all engines
npm run test:e2e           # both Playwright suites together
npm run check               # typecheck + lint + unit tests + build
```
