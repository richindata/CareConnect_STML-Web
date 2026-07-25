# CareConnect — STML Web

**CareConnect** is an accessible, responsive, offline-capable Progressive Web App concept for people living with **short-term memory loss (STML)** and the people who care for them.

It covers the full account journey — create account, sign in, reset password — and a caregiver dashboard behind an auth guard. Built for SWEN 661; a coursework prototype, not a medical device.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server — opens your browser automatically; service worker enabled so install/offline can be tested |
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
| Tests | Vitest + Testing Library, queried by role and label |

There is no server and no network call of any kind.

---

## Routing

Routes are declared in [src/router.tsx](src/router.tsx) and shared with the tests, so the suite exercises the real routing table.

| Path | Page | Access |
| --- | --- | --- |
| `/` | Sign in | Signed-out |
| `/create-account` | Create account (issues a recovery code) | Signed-out |
| `/forgot-password` | Reset password with a recovery code | Signed-out |
| `/dashboard` | Caregiver dashboard | Behind `RequireAuth` |
| `/my-day`, `/meds`, `/mail`, `/ai`, `/settings` | Section placeholders | Behind `RequireAuth` |
| `*` | Redirects to `/` | — |

Signed-in routes share the `AppLayout` masthead shell and sit behind `RequireAuth`, which redirects to sign-in when there is no session and remembers where the visitor was headed.

Because these are real URLs rather than hash fragments, any host serving the build must rewrite unknown paths to `index.html`. `public/_redirects` and `vercel.json` cover Netlify and Vercel; the service worker's `navigateFallback` handles it once installed.

---

## Responsive design

Mobile-first CSS with two breakpoints, verified at the three target widths:

| Width | Layout |
| --- | --- |
| **375px** (mobile) | Single-column dashboard; primary nav collapses to a hamburger that discloses a full-width dropdown panel; the account control shows the avatar alone. |
| **768px** (tablet) | Primary nav becomes a horizontal row; dashboard stays single-column but stat cards flow 2-up; the account name returns. |
| **1440px** (desktop) | Dashboard splits into the schedule / side-panel two-column grid; everything at its full width, capped at 72rem and centred. |

The navigation **transform** is the notable piece: [PrimaryNav](src/components/PrimaryNav.tsx) reads the viewport through the `useMediaQuery` hook and renders either the inline list or the hamburger disclosure from a single set of link definitions, so screen readers never see duplicate navigation. The panel closes on Escape, on outside tap, and after following a link (`useDismiss`).

All interactive targets are at least 44×44px (`--tap`), meeting WCAG 2.5.5 for both touch and pointer.

Custom hooks doing the responsive and overlay work:

- [`useMediaQuery`](src/hooks/useMediaQuery.ts) — subscribes to a media query, plus a `useIsWideLayout` helper for the nav breakpoint.
- [`useDismiss`](src/hooks/useDismiss.ts) — Escape + click-outside, shared by the nav panel and the account menu.
- [`useOnlineStatus`](src/hooks/useOnlineStatus.ts), [`useDocumentTitle`](src/hooks/useDocumentTitle.ts).

---

## State management

Plain **Context API**, one provider per concern rather than a single store:

- [`AuthProvider`](src/context/AuthProvider.tsx) — session user, `signIn`, `signOut`; reads/writes the persisted session.
- [`AnnouncerProvider`](src/context/AnnouncerProvider.tsx) — a polite live region for validation and status messages.

Account records and the session live in `localStorage` via [src/lib/auth.ts](src/lib/auth.ts). See the security note below — this is a demo, not real auth.

**Security note — this is not real authentication.** Accounts and the session live entirely in `localStorage`, so anyone with the browser can read or edit them, and `RequireAuth` is a navigation guard, not a security boundary. Passwords and recovery codes are hashed with PBKDF2-SHA256 (210k iterations, per-account salt) and compared in constant time, so the prototype demonstrates the right *shape* — but nothing here is safe to store real credentials against. Password reset is gated on a recovery code shown once at sign-up (there is no server to email a reset link from).

---

## Accessibility

**Semantic HTML first.** One `<main>`, one `<h1>`, a real `<form>` with real `<label>`s for both fields. The placeholder is decoration, never the label. The required asterisks are `aria-hidden` because the `required` attribute already conveys that to assistive technology.

**Keyboard.** Everything is reachable with `Tab` / `Shift + Tab` in DOM order, with no positive `tabindex`. Focus is visible everywhere — a 3px outline in a hue that contrasts against both themes, never removed. `Enter` submits from either field.

**Errors.** Validation messages sit next to the field in text, set `aria-invalid`, and are linked with `aria-describedby`, so a screen reader reads the problem when the field takes focus. Focus jumps to the first invalid field on submit, and an error clears as soon as you correct it. Nothing is signalled by colour alone.

**Input.** `type="email"` plus `inputMode="email"` for the right mobile keyboard, and `autocomplete="email"` / `"current-password"` so password managers work.

**Visual.** Colour pairs clear WCAG AA (4.5:1 body, 3:1 for large text and UI borders) in light and dark. Inputs are at least 44px tall and the submit button 56px. `prefers-reduced-motion` is respected, and `prefers-color-scheme` switches the whole page between light and dark.

---

## Responsive

One fluid card rather than breakpoint-swapped layouts, so there is no width where it looks wrong:

- **Desktop / tablet** — the card caps at 440px and centres; padding and type scale with `clamp()`.
- **Phone** — the card takes the full width, with tightened padding below 384px.
- **Landscape phones** — the layout top-aligns below 704px height so the card cannot be clipped.

To check it on a real device: `npm run dev -- --host`, then open the `Network:` URL it prints.

---

## PWA

- **Installable** — web app manifest with 192/512 icons plus a dedicated maskable icon, and theme colours for light and dark.
- **Offline** — the app shell is precached at build time; images and fonts use a cache-first runtime strategy.
- **Update flow** — `registerType: 'prompt'`. A new version never swaps itself in mid-task; a banner offers "Reload now" or "Later".
- **Honest status** — an offline banner reassures rather than alarms, and the install prompt is deferred out of the browser's mini-infobar into a calm dismissible banner.

`PwaStatus` is what registers the service worker, so it stays mounted on the sign-in page. Its banners only appear when there is something to say, so the default view matches the design exactly.

Service worker behaviour is enabled in dev (`devOptions.enabled`). For a Lighthouse run use `npm run build && npm run preview`.

---

## Testing

```bash
npm test
```

22 tests covering the account journey (create → recovery code → sign in), credential validation, the reset flow and recovery-code retirement, the auth guard and redirects, the dashboard, and the **responsive navigation** at both desktop and mobile widths (driven by a settable `matchMedia` stub in [src/test/setup.ts](src/test/setup.ts)). Queries go through the accessibility tree — `getByRole`, `getByLabelText`, `toHaveAccessibleDescription` — so a change that breaks a screen reader breaks the build.

jsdom has no layout engine, so contrast, focus-ring rendering, and the responsive breakpoints need a real browser. Verify those manually, along with a screen reader pass (VoiceOver on macOS/iOS, NVDA on Windows).

---

## Project layout

```
src/
  components/   PwaStatus — install, update, and offline banners
  context/      AnnouncerProvider — polite live region for validation errors
  hooks/        Online status, document title
  pages/        SignInPage, ErrorPage
  test/         Vitest setup, render helper, suite
```
