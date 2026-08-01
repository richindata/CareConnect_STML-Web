# Accessibility, Performance & SEO Summary

This document records what CareConnect actually implements for accessibility (semantic HTML,
keyboard navigation, ARIA, focus management) and the results of the Lighthouse audit used to
verify performance/SEO/accessibility quality. It is a reference for contributors, not a promise
of perfection — automated tooling (Lighthouse, axe) does not replace manual screen-reader testing.

> For the full validation record (WAVE, axe DevTools, Lighthouse, scripted axe-core, and
> cross-browser testing results with screenshots), see
> [docs/testing-report.md](testing-report.md). The manual keyboard/screen-reader script lives in
> [docs/manual-accessibility-testing-checklist.md](manual-accessibility-testing-checklist.md).

## 1. Accessibility

### 1.1 Semantic HTML usage
- Native elements are used for their built-in behavior instead of `div`/`span` + ARIA:
  `button` for actions, `a`/`NavLink` for navigation, `label` + `input` pairings on every form
  field, and the native `<dialog>` element for modals ([src/components/Dialog.tsx](src/components/Dialog.tsx)).
- Landmarks are present on every route: `<header className="masthead">` and
  `<main id="main-content">` in [src/components/AppLayout.tsx](src/components/AppLayout.tsx#L29-L58),
  a labelled `<nav aria-label="Primary">` in [src/components/PrimaryNav.tsx](src/components/PrimaryNav.tsx#L41),
  and per-page `<nav aria-label="Breadcrumb">` (e.g. [src/pages/DashboardPage.tsx](src/pages/DashboardPage.tsx)).
- Content regions use `<section>` and `<article>` instead of generic containers, each tied to a
  heading via `aria-labelledby` (e.g. `<article aria-labelledby="{id}-name">` in
  [src/components/MemberCard.tsx](src/components/MemberCard.tsx#L9) and
  [src/components/MedicationCard.tsx](src/components/MedicationCard.tsx#L20)).
- A skip link (`<a className="skip-link" href="#main-content">`) is the first focusable element
  on every authenticated page ([src/components/AppLayout.tsx](src/components/AppLayout.tsx#L24-L26)).
- Decorative icons/glyphs are marked `aria-hidden="true"` so screen readers don't announce
  emoji/SVG noise (used consistently across cards, dialogs, and nav — e.g.
  [src/components/ChatMessage.tsx](src/components/ChatMessage.tsx#L12)).

### 1.2 Keyboard navigation support (Tab, Enter, Escape)
- **Tab**: all interactive controls are native `button`/`input`/`a` elements, so tab order follows
  DOM order with no `tabindex` hacks except the intentional `tabIndex={-1}` on `<main>` (used only
  as a programmatic focus target after route changes, not part of the tab sequence).
- **Enter**: form submission relies on native `<form onSubmit>` semantics, so pressing Enter in any
  field submits the form (sign in, create account, forgot password, settings forms, all dialog
  forms).
- **Escape**: overlays close on Escape via the shared [src/hooks/useDismiss.ts](src/hooks/useDismiss.ts)
  hook, which listens for `event.key === 'Escape'` and also closes on outside pointer-down. It is
  used by the account menu ([src/components/AccountMenu.tsx](src/components/AccountMenu.tsx#L19))
  and the mobile primary-nav panel ([src/components/PrimaryNav.tsx](src/components/PrimaryNav.tsx#L30)).
  Dialogs built on the native `<dialog>` element get Escape-to-close for free from the browser
  ([src/components/Dialog.tsx](src/components/Dialog.tsx#L24-L34)).
- Covered by tests in [src/test/app.test.tsx](src/test/app.test.tsx) for Escape-close, focus
  restoration, and Enter-submit behavior.

### 1.3 ARIA roles and labels implemented
- **Disclosure controls**: `aria-expanded` + `aria-controls` on the account menu trigger
  ([src/components/AccountMenu.tsx](src/components/AccountMenu.tsx#L38-L40)) and the mobile nav
  toggle ([src/components/PrimaryNav.tsx](src/components/PrimaryNav.tsx#L45-L47)).
- **Form validation**: `aria-invalid` + `aria-describedby` pair every field with its error message
  across all forms (auth pages, settings sections, all "Add/Compose/Invite" dialogs).
- **Live regions**: a global polite live region (`role="status" aria-live="polite" aria-atomic="true"`)
  in [src/context/AnnouncerProvider.tsx](src/context/AnnouncerProvider.tsx#L28) announces transient
  state changes; inline `role="status"` / `role="alert"` are used for confirmation and error banners
  (e.g. [src/pages/SignInPage.tsx](src/pages/SignInPage.tsx#L67-L76)).
- **Custom widgets**: the day-of-week picker uses `role="group" aria-label` with `aria-pressed` on
  each toggle ([src/components/WeekSelector.tsx](src/components/WeekSelector.tsx#L15-L25)); the
  settings toggle uses `role="switch"` ([src/components/ToggleSwitch.tsx](src/components/ToggleSwitch.tsx#L37)).
- **Dialogs**: every modal is labelled with `aria-labelledby`/`aria-describedby` pointing at its
  heading/description ([src/components/Dialog.tsx](src/components/Dialog.tsx#L45-L48)).
- **Landmarks**: `aria-label`/`aria-labelledby` on every `nav`/`section`/`aside` so assistive tech
  gets a meaningful accessible name instead of a generic "region".

### 1.4 Focus management for interactive components
- **Menus**: opening the account menu moves focus to its first actionable control (the Sign Out
  button); closing it (Escape or outside click) restores focus to the trigger button
  ([src/components/AccountMenu.tsx](src/components/AccountMenu.tsx#L15-L24)).
- **Modals**: built on the native `<dialog>` element, which provides a real focus trap, background
  inertness, and automatic focus return to the opener — no hand-rolled trap needed
  ([src/components/Dialog.tsx](src/components/Dialog.tsx#L14-L17)).
- **Forms**: on submit with validation errors, focus moves to the first invalid field (e.g.
  [src/pages/CreateAccountPage.tsx](src/pages/CreateAccountPage.tsx#L54),
  [src/pages/SignInPage.tsx](src/pages/SignInPage.tsx#L43), and every dialog's submit handler such as
  [src/components/AddMedicationDialog.tsx](src/components/AddMedicationDialog.tsx#L49)).
- **Route changes**: client-side navigation doesn't move focus the way a full page load does, so
  `AppLayout` explicitly focuses `<main tabIndex={-1}>` and scrolls to top after each route change
  ([src/components/AppLayout.tsx](src/components/AppLayout.tsx#L14-L21)), keeping keyboard/screen-reader
  users oriented.
- Tested in [src/test/app.test.tsx](src/test/app.test.tsx) for menu open/close focus, route-change
  focus handoff, and first-invalid-field focus.

## 2. Performance and SEO — Lighthouse Audit

Audit run against a production build (`vite preview`) using headless Chrome, desktop preset:

```
npx lighthouse http://localhost:4173/ --preset=desktop --chrome-flags="--headless=new --no-sandbox --disable-gpu"
```

| Category         | Score |
| ----------------- | ----- |
| Performance       | 100   |
| Accessibility     | 100   |
| Best Practices    | 100   |
| SEO               | 100   |
| Agentic Browsing* | 67    |

\*Not one of the four required categories; tracks unfinished Section 6 SEO items (canonical URL,
Open Graph/Twitter metadata, JSON-LD) that are out of scope for this summary.

Key metrics: FCP 0.4s, LCP 0.5s, TBT 0ms, CLS 0.013, Speed Index 0.4s.

**All four required categories meet the 90+ target.**

Screenshot: [docs/perf/baseline-screenshot.png](docs/perf/baseline-screenshot.png)
Full HTML/JSON reports: [docs/perf/baseline.report.html](docs/perf/baseline.report.html),
[docs/perf/baseline.report.json](docs/perf/baseline.report.json)

Supporting performance work (route-level code splitting, re-render reduction, PWA precache
cleanup, icon asset audit) is detailed in [docs/perf/item-5-baseline.md](docs/perf/item-5-baseline.md).
