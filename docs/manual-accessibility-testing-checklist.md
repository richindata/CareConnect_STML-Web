# Manual Accessibility Testing Checklist

A step-by-step script for the human-only checks that automated tools (WAVE, axe, Lighthouse)
cannot fully verify: real keyboard-only navigation and real screen-reader usage. Follow this in
order, check off each item, and record the video described in Section 4.

**Status: Complete — all items below passed. Recordings: [keyboard navigation](video/care_connect_keyboard_nav.mp4) and [VoiceOver screen reader](video/care_connect_voiceover.mp4).**

> Note: `docs/video/` is excluded from git (one recording exceeds GitHub's 100MB file limit) — the
> files exist locally in this workspace for review but are not part of the pushed repository.

> Semantic HTML, ARIA correctness, and focus trapping (dialogs/dropdowns) are now covered by a
> scripted test suite ([e2e/semantic-aria-focus.spec.ts](../e2e/semantic-aria-focus.spec.ts), 60/60
> passing across Chromium/Firefox/WebKit/Edge — see [docs/testing-report.md](testing-report.md)
> Section 2.1). This checklist now focuses on what genuinely requires a human: real screen-reader
> narration and the video recording.

Automated/code-level groundwork for everything below is documented in
[docs/testing-report.md](testing-report.md) (Section 2) and
[docs/accessibility-performance-summary.md](accessibility-performance-summary.md).

## Setup

1. `npm run build && npm run preview` and open `http://localhost:4173/`.
2. Create a test account via **Create account** (any email/password ≥ 8 characters).
3. Unplug/put away the mouse for Sections 1–2 — keyboard only.

## 1. Keyboard-only navigation

Go through every route using only Tab, Shift+Tab, Enter, Space, Escape, and arrow keys where
noted. Check that:

- [x] Tab order on **Sign in** follows visual order (email → password → sign in → forgot password
      link → create account link) with no traps.
- [x] **Create account**: Tab reaches every field in order; submitting an incomplete form moves
      focus to the first invalid field with an announced error.
- [x] **Dashboard**: the first Tab stop is the **Skip to main content** link; activating it
      (Enter) moves focus into `<main>`.
- [x] Primary nav (Dashboard/My Day/Medications/Reminders/Mail/Ask AI/Settings) is fully reachable
      and each link shows a visible focus outline.
- [x] **Account menu** (top right): Enter/Space opens it, focus moves to **Sign out**; Escape
      closes it and returns focus to the trigger button. *(Scripted — e2e/semantic-aria-focus.spec.ts)*
- [x] **Add Medication / Add Reminder / Add Task / Invite Caregiver / Compose message** dialogs:
      opening moves focus inside the dialog, Tab cannot escape the dialog (focus trap), Escape
      closes it and returns focus to the button that opened it. *(Scripted — e2e/semantic-aria-focus.spec.ts)*
- [x] **Mail**: conversation list items and the composer are reachable and operable by keyboard.
- [x] **Settings** sub-nav (Account/Notifications/Privacy/Accessibility/Care preferences/About) is
      reachable and each toggle/switch responds to Space/Enter.
- [x] No point in the app puts focus somewhere invisible or unreachable (no keyboard traps outside
      of intended modal dialogs).

## 2. Screen reader pass (NVDA on Windows or VoiceOver on Mac)

Start the screen reader, then repeat a subset of the routes above listening for:

- [x] Page title changes are announced when navigating between routes.
- [x] The skip link is announced as a link ("Skip to main content") and works.
- [x] Landmarks are announced meaningfully — not generic "region": main, "Primary" navigation,
      breadcrumb navigation.
- [x] Headings form a sensible outline (one `h1` per page; use the screen reader's heading
      navigation command — NVDA: `H`; VoiceOver: `VO+Cmd+H`).
- [x] Form fields announce their label, and an invalid field announces its error message
      (`aria-invalid` / `aria-describedby`).
- [x] The account menu button announces its expanded/collapsed state (`aria-expanded`).
- [x] Opening a dialog announces its title (and description, where present) and screen-reader
      focus moves inside it; closing it returns focus and announces nothing unexpected.
- [x] Toggling a setting (e.g. Accessibility section) announces the new state via the switch role.
- [x] Live status messages (e.g. "Account created", "Back online") are announced once, without
      interrupting whatever the user is doing.

## 3. Semantic HTML / ARIA spot-check

While in the screen reader, confirm (cross-reference
[docs/accessibility-performance-summary.md](accessibility-performance-summary.md) Section 1 for
what should be present):

- [x] Buttons that perform actions are real `<button>` elements (screen reader says "button").
- [x] Navigation links are real `<a>`/`NavLink` elements (screen reader says "link").
- [x] Modals use the native `<dialog>` element (screen reader announces "dialog"/"modal").
- [x] Decorative icons/emoji are silent (not announced) — confirms `aria-hidden="true"` is applied
      correctly.

## 4. Record the video (3–5 minutes)

Record a single take (OBS, Windows Game Bar `Win+G`, or macOS `Cmd+Shift+5`) that shows:

1. **0:00–1:30** — Keyboard-only navigation: sign in, use the skip link, tab through the primary
   nav, open and close a dialog with the keyboard, open and close the account menu with Escape.
2. **1:30–4:00** — Screen reader on: navigate the dashboard by headings/landmarks, fill in and
   submit a form with a deliberate error to hear the announcement, open a dialog and hear its
   title announced.
3. **4:00–5:00** — Narrate (or caption) a one-line summary of what passed and any issues found.

Save the recording and link it here once complete:

- Video: [care_connect_keyboard_nav.mp4](video/care_connect_keyboard_nav.mp4) (keyboard-only navigation), [care_connect_voiceover.mp4](video/care_connect_voiceover.mp4) (VoiceOver screen reader pass)
- Tester: Project owner
- Date: 2026-08-01
- Screen reader + OS used: VoiceOver on macOS
- Findings: No issues found — all checklist items above passed.
