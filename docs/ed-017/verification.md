# ED-017 verification

## Project commands

| Command | Actual result |
| --- | --- |
| `yarn lint` | Passed, zero warnings; see `lint.log` |
| `yarn typecheck` | Passed; see `typecheck.log` |
| `yarn test` | 25 files, 1,775 tests passed; see `tests.log` |
| `yarn build` | Passed, existing static route inventory retained; see `build.log` |
| `node docs/ed-013/tools/sync-manifest.mjs --check` | Passed, manifest matches all 119 available lessons; see `manifest.log` |
| ED-015 preservation checker + ED-017 SHA256 inventory | All pre-existing files unchanged; see `preservation.json` |

The first build attempt ran within the sandbox and failed when Turbopack's CSS worker could not bind its local port. An outside-sandbox retry reused the failed cache and also failed; moving only `.next/cache/turbopack` to a temporary backup and rebuilding with permission passed in 9.96s. No production configuration or dependency changed. Browser attempts against the failed/stale build were discarded and rerun against the successful production build. Some sandbox Yarn commands emit existing writable-cache/global-folder notices. The existing manifest tool emits Node's typeless-package warning.

## Focused tests

The metadata projection test compares all group/lesson IDs, titles, ordering and URLs against the canonical registries, checks 119 unique IDs/URLs, and verifies the serializable model contains only navigation fields. Render tests cover every active lesson across eight groups, exact URL matching/prefix collisions, collapsed overview/unknown routes, control/panel relationships and ID uniqueness with simultaneous desktop/mobile trees. Original category route-boundary tests remain; their primary-link scope is explicit now that nested lesson links exist. Ancestor semantics are explicitly checked as location rather than page.

The browser suite exercises real hydration, event handlers and effects: exclusive open/collapse; Enter/Space; route-initialized expansion; cross-group SPA navigation; Back/Forward; same-group navigation; intentional collapse; theme/mode updates; mobile selection, active focus, dismissal, focus trap/restoration, resize, body lock; independent navigation scroll and active-row reveal. It compares every canonical link in each width/theme combination. The additional script checks DOM IDs and button/panel associations, sampled text contrast and same-group/manual-state regressions.

## Browser results

Engine: cached **Chromium headless shell 156.0.8078.4**. No browser/project dependencies installed. Production server: `http://127.0.0.1:3117`.

- ED-017 navigation suite: **1,280 checks passed**, zero failures/console/hydration errors. Five widths (320,375,768,1024,1440) × dark/light. Direct loading last lesson in each of eight groups. All 119 link IDs/titles/URLs compared per combination. Short-height desktop additionally checked. See `browser-verification.json` / `navigation-browser.log`.
- Extra association/contrast/same-group suite: **42 checks passed**, zero failures. Minimum sampled text contrast **6.077:1**, above 4.5:1 for those samples. See `extra-verification.json` / `extra-browser.log`.
- Existing ED-013 browser regression: **119 routes**, detail checks for `use-state` and `react-introduction`, **1,483 passed**, zero failed, zero console issues. Covers article modes, answer reveal, curriculum links, responsive overflow, keyboard/Back to top in detailed cases. See `all-routes.log`.
- Matched screenshots: **16 before + 16 after**, zero console/hydration errors; see `visual-verification.md`.

Accessibility findings: native links/buttons; visible focus; associated panels; collapsed content excluded; exact current-page semantics; 44px-minimum targets; wrapped titles; reduced-motion chevrons; one scroll frame; Radix focus lock/restoration preserved. No blocking issue found in these checks. No screen-reader, physical-device, multi-engine or actual browser zoom audit was performed.

## Reproduction and scope

Run the four Yarn scripts and manifest check above. Start `yarn start --hostname 127.0.0.1 --port 3117` after a production build. Use `node docs/ed-017/tools/verify-browser.cjs`, `verify-extra.cjs`, or `capture.cjs after`. These accept `BASE`, `PLAYWRIGHT_CORE`, `CHROME_PATH`; defaults point to the already installed local browser cache. Do not overwrite the original baseline when reproducing screenshots. Existing regression: `BASE=http://127.0.0.1:3117 PLAYWRIGHT_CORE=<installed-path> node docs/ed-013/tools/browser-smoke.cjs --detail use-state react-introduction`.

No lesson content/routes, preferences, storage schema, dependencies, package or Yarn lockfile edits. No new persistence or content payload in sidebar. ED-016 alone committed as `518d1d7`; ED-017 remains unstaged/uncommitted alongside the preserved ED-015 work. No push, merge or deployment. `git-status.txt` records final status; `files.txt` inventories ED-017 documentation/evidence.
