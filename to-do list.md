# CareConnect Implementation To-Do List

## 1) Accessibility and UX Foundation
- [x] Audit semantic HTML across all routes (signed-out pages, dashboard, placeholders).
- [x] Keep native semantics first (button for actions, link for navigation, label/input pairings).
- [x] Verify heading hierarchy consistency per route.
- [x] Confirm landmark structure (`main`, `header`, `nav`, section headings).

## 2) Keyboard Navigation (Tab, Enter, Escape)
- [x] Verify tab order for sign-in, create account, forgot password, dashboard nav, and account menu.
- [x] Ensure Enter submits each auth form from expected fields.
- [x] Add Escape behavior to close account menu.
- [x] Restore focus to menu trigger after Escape/menu close.
- [x] Add outside-click or focus-loss handling to close menu safely.

## 3) ARIA Roles and Labels
- [x] Review all interactive controls for accessible name coverage.
- [x] Keep `aria-invalid` + `aria-describedby` mappings correct on form errors.
- [x] Add/confirm `aria-controls` for popup trigger relationships where applicable.
- [x] Validate menu semantics match interaction behavior.
- [x] Keep live-region announcements concise and meaningful.

## 4) Focus Management (Menus, Modals, Forms)
- [x] On menu open, move focus to first actionable control.
- [x] On menu close, return focus to trigger.
- [x] Keep route-change focus handoff to main content predictable.
- [x] Keep first-invalid-field focus behavior on form submit.
- [x] Draft a reusable modal focus-trap pattern for future dialogs.

## 5) Performance
- [x] Capture baseline metrics (build output + Lighthouse; see `docs/perf/item-5-baseline.md`).
- [x] Add route-level code splitting for non-critical authenticated sections.
- [x] Reduce unnecessary re-renders in layout and auth flows (memoized `PwaStatus`/`AccountMenu`; providers already memoized).
- [x] Review PWA precache/runtime caching patterns and remove noisy mismatches.
- [x] Confirm icon/image assets are optimized for size.
- [x] Re-run Lighthouse and compare against baseline after changes (scores unchanged at 100 — fix targets SPA navigation, not initial load; see notes).

## 6) SEO
- [ ] Add canonical URL to document head.
- [ ] Add Open Graph tags (`og:title`, `og:description`, `og:type`, `og:url`, `og:image`).
- [ ] Add Twitter card metadata.
- [ ] Add `sitemap.xml` in `public/` and reference it in `robots.txt`.
- [ ] Add route-aware public-page descriptions (sign in/create account/forgot password).
- [ ] Decide indexing policy for authenticated/private app states.
- [ ] Add minimal WebApplication JSON-LD if aligned with project goals.

## 7) Testing and Validation
- [x] Add tests for keyboard behavior (Escape close, focus restoration, Enter submit).
- [x] Add tests for focus movement on route change and validation errors.
- [ ] Run typecheck, lint, tests, and build after each phase.
- [ ] Perform manual screen-reader and keyboard-only pass in real browser.

## 8) Documentation
- [ ] Update README to reflect current multi-page auth/dashboard scope.
- [ ] Document any SEO/indexing decisions and performance targets.
- [ ] Record accessibility behavior guarantees for future contributors.
- [x] Generate sample screenshots for each top-level checklist item and store them in `docs/screenshots/`.

## Suggested Execution Order
1. Accessibility behavior fixes + tests.
2. Performance improvements and measurement.
3. SEO metadata/sitemap/indexing updates.
4. Full regression pass and README refresh.
