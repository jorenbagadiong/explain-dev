# ED-015 verification and acceptance

Branch `main`; starting commit `554a7c8`. Initially clean. No existing ED-014 work was changed or discarded. No automatic commit, merge, push or deployment. Temporary local production servers were used only for QA and stopped at teardown.

## Commands actually executed

| Check | Final result |
| --- | --- |
| `yarn lint` | Pass, zero ESLint warnings |
| `yarn typecheck` | Pass, strict checking retained |
| `yarn test` | **1,752 passed, 23 files**, no removed/skipped tests |
| `yarn build` | Pass; 125 prerendered outputs including all 119 existing lessons; unchanged route inventory |
| `node docs/ed-013/tools/sync-manifest.mjs --check` | Pass; 119 available, eight existing groups; manifest matches registry/files |
| Existing `docs/ed-013/tools/browser-smoke.cjs` | **119 routes, 1,191 checks**, zero failures or console issues |
| `docs/ed-015/tools/verify-browser.cjs` | **1,915 checks passed**, zero console/page/hydration errors |
| `docs/ed-015/tools/capture.cjs` | 24 baseline + 12 prototype + 24 matching final screenshots; no errors or page overflow |
| `docs/ed-015/tools/capture-details.cjs` | 8 additional detail screenshots; 4 no-JavaScript routes and native disclosures passed |

The baseline commands passed as well. Builds ran with permission outside the sandbox to allow Turbopack's worker port; no build failure or retry was necessary. Some sandbox Yarn runs used the writable temporary cache after reporting the preferred cache/global folders unwritable. The existing manifest tool emits Node's typeless-package warning; package configuration was deliberately not changed to suppress it.

## Browser scope

Cached **Chromium headless shell 156.0.8078.4**. Deep checks: home, frontend, curriculum, Introduction to React, useState, and React Server Components, at 320/375/768/1024/1440 × 900, both themes. All 119 article routes were independently exercised with Learn/Quick Review/Interview, answer reveal and direct navigation using the existing smoke tool. No cross-browser coverage is claimed.

Detailed checks include keyboard selection and focus retention, no activation scroll, full URL/hash preservation on mode changes, hidden-panel isolation, independent reveal/hide, reading/curriculum anchors, native keyboard code scrolling, flat code transforms, Back to Top focus handoff, sidebar breakpoint, Sheet focus containment and return, theme reload persistence, unchanged seeded preferences and no mode/reveal storage writes. 2,230 actual-background text samples passed 4.5:1, minimum about **5.695:1**. These samples do not establish full WCAG conformance.

Actual 200% text resizing passed both themes, including enlarged code. The first detailed run found two curriculum text-resize overflows; both were corrected with available-space-aware artwork and rem-aware columns. [Initial evidence](initial-browser-verification.json) is retained; final [browser-verification.json](browser-verification.json) has no failures. Real browser zoom was attempted but not established; DPR and viewport emulation are not passed off as zoom. Screen-reader, Firefox, Safari, physical low-end-device and field-performance verification remain **unverified**.

## Acceptance map

| Criteria | Evidence/status |
| --- | --- |
| 1–3: audit, before screenshots, coherent direction | baseline.md, design-direction.md and 24 baseline images — passed |
| 4–7: homepage/curriculum/cards/article visual changes | prototype review followed by shared rollout; visual-verification.md — implemented and reviewed |
| 8–10: reading, code and conceptual accuracy retained | Source preservation, tests, scrolling/overflow checks, detail captures — passed in tested scope |
| 11–13: themes, reduced motion, mobile | Five widths, both themes, reduced/normal motion and coarse-pointer probes — passed |
| 14: performance | +22 B emitted JS, +2,607 B gzip-estimated CSS; local resource/timing/frame evidence in performance.md. No observed long-task/hover lag in those probes. Field/low-end-device impact remains unverified; no universal regression-free claim |
| 15–18: 119 published routes, unchanged URLs, modes, Back to Top | Manifest, all-route smoke, detailed focus/interaction checks — passed |
| 19: accessibility preserved | Automated/manual keyboard and screenshot review scope passed; actual browser zoom, assistive technology and full audit unverified |
| 20–24: dependencies/lint/typecheck/tests/build | No package/lockfile changes; all final commands passed |
| 25–27: evidence, Git status, no publishing actions | Matching screenshot sets, documented source diff, no commits/push/deploy — passed |

## Reproduction

Use the existing supported Node/Yarn environment. Run the four commands above and the manifest check. Start `yarn start --hostname 127.0.0.1 --port 3115` after a production build. The audit scripts accept `BASE`, `PLAYWRIGHT_CORE` and `CHROME_PATH` to use an already installed browser/Playwright copy; they do not install dependencies. `capture.cjs baseline|prototype|after` and `measure-build.mjs baseline|prototype|after` write phase evidence; avoid overwriting the committed baseline when reproducing final checks. `verify-browser.cjs` and `capture-details.cjs` write the detailed results. Existing all-route smoke uses the same BASE/PLAYWRIGHT_CORE environment. Stop the owned server afterward.

## Preservation and follow-up

No changes to `src/content`, individual lesson routes, topic/curriculum registries, storage, theme provider/configuration, Back to Top logic, ED-013 manifest or ED-014 evidence. No new dependencies, Client Components, API, quiz, gamification, live code execution or AI feature. All new illustration/motion is CSS/server-rendered presentation.

Evidence-based follow-up: manually verify browser zoom and assistive-technology navigation, and collect deployment/low-end-device metrics before making stronger performance or engagement claims. Do not start another milestone automatically. No user testing was performed; engagement improvement is a design goal, not a measured outcome.
