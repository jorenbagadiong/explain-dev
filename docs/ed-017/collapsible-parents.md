# Collapsible Frontend and React parents

User-requested follow-up to ED-017: Frontend Development and React each have a separate 44px-minimum chevron disclosure button. Their labels remain overview links. Both disclosures work in the existing desktop sidebar and shared mobile Sheet, with keyboard support, visible focus, unique panel associations and reduced-motion chevrons.

Frontend opens on its exact overview or descendant routes. React opens on its overview or descendant routes. Both are collapsed on Home. Pathname-keyed state restores sensible expansion for direct loads, lesson navigation and Back/Forward. Manual collapse retains nested group expansion while the pathname is unchanged. Nothing is persisted.

Application files changed in this follow-up: `category-navigation.tsx`, `react-lesson-navigation.tsx`, `navigation.module.css`; new reusable `navigation-branch.tsx`, all in `src/components/navigation/`. Updated both navigation test files for parent initialization and group-specific assertions. The ED-017 browser script's group-count selectors now target curriculum group buttons explicitly. No article, route, package, storage or preference changes.

Verification: lint, typecheck, production build and all **1,781 tests** passed. The focused parent-disclosure browser suite passed **171 checks**, with zero console/page errors, across 320/375/768/1024/1440px in light and dark. Checks cover initial state, Enter/Space, independent collapse, retained nested state, direct loads, SPA/Back navigation, exact active lesson, mobile link dismissal, accessible panel associations, focus, target size, wrapping, and overview links. Four screenshots are in `screenshots/branches/`. Chromium headless shell 156.0.8078.4 only; no physical-device or screen-reader testing.

Reproduce with `node docs/ed-017/tools/verify-branches.cjs` against the production preview. BASE/PLAYWRIGHT_CORE/CHROME_PATH are configurable. Reports: `branch-verification.json`, `branches-browser.log`, and `branches-{lint,typecheck,tests,build}.log`. Original ED-017 full-regression reports are historical; this follow-up ran the project scripts and focused parent-disclosure checks.

No commit or push. All pre-existing ED-015 files and the original next-env.d.ts contents remain preserved.
