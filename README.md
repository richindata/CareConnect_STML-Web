# CareConnect — STML Web

An accessible, offline-first Progressive Web App for people living with **short-term memory loss (STML)** and the people who care for them.

The app answers four questions someone may need to re-ask many times a day, without ever making them feel they have asked before:

- **What am I meant to be doing right now?** → Today
- **What does a normal day look like?** → Routine
- **Who can I call?** → People
- **What did I want to remember?** → Notes

Built for SWEN 661. It is a coursework prototype, not a medical device.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server, with the service worker enabled so install/offline can be tested |
| `npm run build` | Type-check, then produce `dist/` with the service worker and manifest |
| `npm run preview` | Serve the production build — use this for Lighthouse |
| `npm test` | Run the Vitest suite |
| `npm run lint` | oxlint |
| `npm run check` | Type-check, lint, test, and build in one go |

---

## Tech

| Concern | Choice |
| --- | --- |
| Build | Vite 8 |
| UI | React 19, TypeScript |
| Routing | React Router 7 (`createBrowserRouter`) |
| PWA | `vite-plugin-pwa` (Workbox, `generateSW`) |
| Storage | `localStorage` — no backend, no account, no network calls |
| Tests | Vitest + Testing Library, queried by role and label |

There is no server. All data stays in the browser on the user's device.

---

## Routing

Routes are declared in [src/router.tsx](src/router.tsx) and shared with the tests, so the suite exercises the real routing table.

| Path | Page |
| --- | --- |
| `/` | Today — greeting, progress, next reminder, current part of the routine |
| `/reminders` | Add, tick off, and delete reminders |
| `/routine` | The usual day, split into morning / afternoon / evening |
| `/people` | Contact cards with `tel:` links, emergency contact first |
| `/notes` | Write, search, and delete notes |
| `/settings` | Theme, text size, contrast, motion, and data reset |
| `*` | A calm not-found page that offers the real destinations |

A single root route renders the shell, so the header, navigation, and `<main>` persist across navigations. Route errors are caught by `ErrorPage` via `errorElement`.

Because these are real URLs rather than hash fragments, any host serving the build must rewrite unknown paths to `index.html`. The service worker's `navigateFallback` already handles this once the app is installed.

---

## Accessibility

The whole point of this app is that it works for someone who is tired, distracted, or unsure. Accessibility notes are inline in the source; the summary:

**Semantic HTML first.** One `<header>`, one labelled `<nav>`, one `<main>`, one `<footer>`. Sections are `<section>` tied to their heading with `aria-labelledby`; ordered content uses `<ol>`, lists of things use `<ul>`. Every page has exactly one `<h1>` and headings never skip a level. Reminders are real `<input type="checkbox">` elements with real `<label>`s, settings are `<fieldset>`/`<legend>` radio groups, and dialogs are the native `<dialog>` element — so state, grouping, and the focus trap come from the platform rather than from ARIA patches.

**Keyboard navigation.**

- Everything interactive is reachable with `Tab` / `Shift + Tab` in DOM order. Nothing uses a positive `tabindex`.
- A skip link is the first focusable element on the page.
- Focus is visible everywhere: a 3px outline in a hue that contrasts against both themes, never removed.
- On every route change focus moves to `<main>` and scroll resets, so keyboard and screen-reader users are not stranded on the previous page.
- Native `<dialog>` traps focus, makes the background inert, closes on `Esc`, and returns focus to the control that opened it.
- Optional shortcuts, ignored while typing and whenever a modifier is held: `?` for help, `g` then `t`/`r`/`d`/`p`/`n`/`s` to jump between sections, `/` to reach a search box.

**Screen readers.** A polite live region announces the outcome of every action ("Reminder added", "Note saved", "You are offline"). Icons are `aria-hidden` and always sit beside real text. Icon-only buttons carry a visually hidden label that names their target ("Delete reminder: Take morning tablets"). The document title updates per route.

**Visual.** Colour pairs clear WCAG AA (4.5:1 body, 3:1 for large text and UI borders) in light, dark, and high-contrast modes. Colour is never the only signal — overdue and done states carry a text badge as well as a colour. Touch targets are at least 44px. Layout is fluid from 320px up, with the primary nav becoming a bottom bar on phones. `prefers-reduced-motion` is respected, and Settings can force it on regardless of the OS.

**User control.** Theme, text size (up to 125%), contrast, and motion are all adjustable in Settings and persist on the device.

---

## PWA

- **Installable** — web app manifest with 192/512 icons plus a dedicated maskable icon, theme colours for light and dark, and app shortcuts to Today, Reminders, and People.
- **Offline** — the app shell is precached at build time; images and fonts use a cache-first runtime strategy. Everything works with no connection, which matters when the user's connectivity is not something they manage themselves.
- **Update flow** — `registerType: 'prompt'`. A new version never swaps itself in mid-task; a banner offers "Reload now" or "Later".
- **Honest status** — an offline banner reassures rather than alarms, and the install prompt is deferred out of the browser's mini-infobar into a calm dismissible banner.

Service worker behaviour is enabled in dev (`devOptions.enabled`), so install and offline can be exercised with `npm run dev`. Audit with `npm run build && npm run preview`.

---

## Testing

```bash
npm test
```

17 tests covering routing, landmark structure, keyboard navigation, form validation and error association, persistence, and the `tel:` link contract. Queries go through the accessibility tree — `getByRole`, `getByLabelText`, `toHaveAccessibleDescription` — so a change that breaks a screen reader breaks the build.

Two limits worth knowing: jsdom implements neither `<dialog>`'s `Esc` handling nor layout, so Escape-to-close and any contrast or focus-ring rendering need a real browser. Verify those manually, along with a screen reader pass (VoiceOver on macOS/iOS, NVDA on Windows).

---

## Project layout

```
src/
  components/   Shell, dialog, reminder item, PWA status, shortcuts
  context/      App data, preferences, live-region announcer
  hooks/        Online status, document title
  lib/          Types, seed data, formatting, storage, nav config
  pages/        One file per route
  test/         Vitest setup, render helper, suite
```

State lives in three contexts rather than a store library: the app is small, and the boundaries (data / preferences / announcements) are already the right ones.

---

## Notes for future work

- Reminders do not fire notifications. Doing that properly needs the Notifications and Push APIs plus a permission flow designed so it does not startle the user.
- Data is device-local by design. Any sync between a patient and a carer would need real thought about consent and clinical data handling.
