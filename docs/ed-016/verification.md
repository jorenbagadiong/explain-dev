# ED-016 verification

## Scope and Git

ED-014 was already committed as `84f0a0e`. Sidebar work is tracked as ED-016 per the user's message. No duplicate commit was made, and ED-015 remains uncommitted. All 101 pre-existing ED-015 file hashes match; that includes its pages, global stylesheet, reading components, README and evidence. No reset/stash/clean, dependency change, content change, route addition or destination reorder.

The only application changes for this milestone are the existing header brand styling hooks, sidebar frame, shared category navigation, mobile Sheet presentation, scoped CSS module and five navigation assertions. `implementation.md` lists every file. Existing Sheet primitives, theme implementation, article modes/content, Back to Top and preferences remain unchanged.

## Final static checks

- `yarn lint`: passed, zero ESLint warnings.
- `yarn typecheck`: passed; strictness unchanged.
- `yarn test`: **1,757 tests passed in 23 files**, including five new exact/descendant presentation checks. All original assertions remain.
- `yarn build`: passed with all existing static lesson routes.
- Existing manifest validation: passed, **119 available lessons**, unchanged groups/IDs/routes.
- `node docs/ed-016/tools/check-preservation.mjs`: passed, **101 ED-015 files byte-identical**.

Some sandbox commands reported an unwritable preferred Yarn cache/global folder and used a temporary writable cache. Existing manifest validation reports Node's typeless-package warning. Neither was suppressed through unrelated configuration changes. Production builds used permission outside the sandbox for the Turbopack worker port.

## Browser verification

Engine: cached **Chromium headless shell 156.0.8078.4**. No new browser or project dependency.

The navigation suite passed **1,136 checks** at 320, 375, 768, 1024 and 1440px (height 900), in dark/light, over home, frontend, curriculum, Introduction to React, useState and React Server Components. No unexpected console/page/hydration errors.

Coverage: original two-link order and three noninteractive upcoming categories; exact/current-section state on direct routes and refresh; consistent row height across exact/descendant styles; 44px-or-larger links; keyboard focus and tab order; Escape/backdrop/close controls; focus return; navigation dismissal; background scroll lock; sidebar breakpoint; theme reload persistence and byte-identical seeded preferences. The sidebar and drawer both scroll independently at short heights; the footer remains reachable. SPA navigation preserves sidebar scroll position, and resizing an open drawer to desktop closes it and focuses the existing brand link.

There were **732 sampled actual-background contrast comparisons**, including the gradient surfaces, with minimum approximately **5.552:1**. This is sampled viewport evidence, not a complete contrast/assistive-technology audit.

Supplementary checks passed **19 assertions** for complete forward/reverse focus wrapping, touch-trigger activation, zero running animations/transition durations under reduced motion, no continuous navigation animation, and normal main-content wheel scrolling after leaving the sidebar.

200% text testing used measured root font enlargement on desktop and measured leaf-text doubling within the narrow 320px drawer. Both themes passed without navigation clipping/overflow. Narrow-drawer text testing is explicitly scoped to navigation; it is not a claim of full-page browser zoom. No viewport/DPR emulation is described as actual zoom.

The existing all-lesson smoke suite passed **119 routes and 1,191 checks**, with zero failures or console issues; see `all-routes.log`. It exercises Learn, Quick Review, Interview, answer reveals, direct loading and curriculum route coverage. Existing Back to Top regression tests also passed in the full unit suite; its implementation is unchanged. Expansion and active-item auto-scroll are **not applicable**, since those features did not exist and were not added. Physical touch devices, actual browser zoom, screen-reader testing, Firefox/Safari and full WCAG 2.2 AA conformance remain unverified.

## Visual evidence and performance

`screenshots/before` and `screenshots/after` contain 24 matched pairs: six routes × 375/1440 × dark/light, with the mobile Sheet open and desktop sidebar visible. There are 12 intermediate desktop prototype screenshots. Desktop exact/descendant states and mobile title/rows were visually reviewed. The global header keeps its brand/name/route/controls; only the existing mark's small surface treatment changes.

No new Client Components, route state store, persistence, pointer tracking or per-scroll React animation was added. Effects are CSS background/border/color transitions; reduced motion disables them. Build totals are in `build-sizes.json` and include framework code; they do not establish parsed/executed bytes, field responsiveness, physical-device performance or transfer compression. No performance improvement claim is made.

## Reproduction

Run the static commands above and `node docs/ed-013/tools/sync-manifest.mjs --check`. Serve the production build on port 3116. `tools/capture.cjs before|prototype|after`, `tools/verify-browser.cjs` and `tools/verify-extra.cjs` use an existing Playwright/browser installation; override `PLAYWRIGHT_CORE`, `CHROME_PATH` and `BASE` on another machine. The existing ED-013 browser smoke tool accepts the same environment. Keep the original baseline evidence when reproducing. Stop the owned server after verification.

## Asset-size observation

Compared with the preserved ED-015 baseline build, all emitted JS changed from 677,926 to 678,889 raw bytes (+963 B). CSS changed from 46,673 to 50,360 raw bytes (+3,687 B), or 9,654 to 10,270 B under Node's gzip estimate (+616 B). These are whole-build file sizes, not network transfer, route execution cost or field responsiveness. The existing Client Components were reused; no runtime library, continuous animation or per-pointer state was added.

The owned temporary production server was stopped after final verification. No commit or push occurred.
