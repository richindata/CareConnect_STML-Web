# Item 5 Performance Baseline (2026-07-26)

## Build Baseline (before route-level splitting)
- dist/assets/index-Cs0X2wcx.js: 393.64 kB (gzip: 115.25 kB)
- dist/assets/index-DP6wVN-f.css: 39.04 kB (gzip: 7.96 kB)

## Build After Route-Level Splitting
- dist/assets/index-DavuiA-0.js: 257.81 kB (gzip: 76.66 kB)
- New lazy route chunks:
  - AskAiPage-hxLp62Eh.js: 6.14 kB (gzip: 2.05 kB)
  - CareTeamPage-DuVe6xqh.js: 6.65 kB (gzip: 2.11 kB)
  - MedicationsPage-DkPZIzbq.js: 7.45 kB (gzip: 2.35 kB)
  - RemindersPage-BroRuFLm.js: 7.15 kB (gzip: 2.29 kB)
  - MailPage-BLXs6NkK.js: 7.58 kB (gzip: 2.31 kB)

## Delta
- Main JS bundle reduction: 135.83 kB
- Main JS gzip reduction: 38.59 kB

## Icon Asset Audit
- public/icons/icon-192.png: 8,004 bytes
- public/icons/icon-512.png: 19,528 bytes
- public/icons/maskable-512.png: 12,023 bytes
- Status: icon assets are already lightweight.

## Lighthouse Status (captured 2026-07-26)
- Ran against `vite preview` (production build) on desktop preset, headless Chrome.
- Command: `npx lighthouse http://localhost:4173/ --preset=desktop --chrome-flags="--headless=new --no-sandbox --disable-gpu"`.
- chrome-launcher still throws an EPERM error deleting its temp profile folder on Windows after
  the audit finishes — cosmetic; the report is written before that cleanup step runs, so the
  scores below are unaffected.
- Reports saved to `docs/perf/baseline.report.html` and `docs/perf/baseline.report.json`.

| Category        | Score |
| ---------------- | ----- |
| Performance      | 100   |
| Accessibility    | 100   |
| Best Practices   | 100   |
| SEO              | 100   |
| Agentic Browsing | 67    |

Key metrics: FCP 0.4s, LCP 0.5s, TBT 0ms, CLS 0.013, Speed Index 0.4s, TTI 0.5s.

The "Agentic Browsing" gap tracks back to the still-open Section 6 (SEO) items — canonical URL,
Open Graph/Twitter metadata, and JSON-LD are what that category checks for.

## Re-render Reduction
- `AppLayout` re-renders on every route change (`useLocation`, needed for the
  focus-restore effect), which was cascading into `PwaStatus` and `AccountMenu` even
  though neither depends on the route or takes props. Wrapped both in `React.memo`
  (`src/components/PwaStatus.tsx`, `src/components/AccountMenu.tsx`).
- All context providers (`CareTeamProvider`, `MyDayProvider`, `MedsProvider`,
  `MailProvider`, `RemindersProvider`, `SettingsProvider`, `AssistantProvider`,
  `AuthProvider`, `SupportProvider`, `AnnouncerProvider`) already memoize their
  context value with `useMemo`/`useCallback`, so no further changes were needed there.
- Auth flow pages (sign in / create account / forgot password) re-render only on
  their own controlled-input state changes — expected React behavior, not waste.
- This change affects post-load SPA navigation, which the Lighthouse audit above
  does not exercise (it measures a single cold page load), so it does not move the
  Lighthouse scores — those were already 100 before and after.

## PWA Warning Cleanup
- Updated Vite PWA config so dev service worker is opt-in.
- Set `VITE_ENABLE_PWA_DEV=true` only when intentionally testing PWA behavior under `npm run dev`.
- This removes routine dev-server noise from unmatched precache glob patterns.
