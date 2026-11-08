# ED-020 verification

## Final project checks

| Command | Actual result | Evidence |
| --- | --- | --- |
| `yarn lint` | Passed, zero warnings | `lint.log` |
| `yarn typecheck` | Passed, after restoring the original next-env.d.ts | `typecheck.log` |
| `yarn test` | **37 files, 2,058 passed**, no skipped tests | `tests.log` |
| `yarn build` | Passed, default fallback build; all existing static routes retained | `build.log` |
| dedicated app build | Passed with `NEXT_PUBLIC_LAB_PREVIEW_ORIGIN=http://127.0.0.1:4100` | `build-dedicated.log` |
| preview-host build | Passed, v3 runtime and exact local parent allowlist | `build-preview-host.log` |
| curriculum manifest check | Passed, 119 available lessons | `manifest.log` |
| source preservation / Git | 320 unrelated existing source files unchanged; original next-env restored; no staged files, commit, push, merge or deploy | `preservation.json`, `git-status.txt` |

No new dependency, package/lockfile edit, backend, persistence or animation library. Yarn was the only package manager. Baseline also passed 2,024 tests and the production build. Its first test attempt hit sandbox-denied local ports; the existing server integration tests passed when rerun with permission. Yarn's writable-cache/global-folder notices are environmental. An intermediate build caught an overly narrow literal type in a negative test fixture; the fixture was corrected. The old four-requirement registry assertion was explicitly updated to all seven requirements.

## Browser grading (final implementation)

Chromium **156.0.8078.4** (full build, headless) and Firefox **157.0**, production app served locally at localhost:3118. Dedicated host: 127.0.0.1:4100 with exact parent allowlist. No engines/libraries installed for ED-020.

| Engine | Mode | Grading checks | Unexpected page errors | Raw report |
| --- | --- | ---: | ---: | --- |
| Chromium | same-origin fallback | **99/99** | 0 | `chromium-fallback/grading-report.json` |
| Firefox | same-origin fallback | **99/99** | 0 | `firefox-fallback/grading-report.json` |
| Chromium | dedicated cross-site | **99/99** | 0 | `chromium-dedicated/grading-report.json` |
| Firefox | dedicated cross-site | **99/99** | 0 | `firefox-dedicated/grading-report.json` |

Each report covers the starter, 17 integrity programs (six valid alternatives plus incorrect/error/nonresponsive programs), 15 repeated unchanged-code requests, editing during grading, stale-result invalidation, Reset/undo, supersession, recovery after hangs, and the editor/visible counter/run ID remaining unchanged. The added navigation attack verifies that a test's blocked navigation leaves the visible counter at 2 and its frame ready. An autofocus variant verifies parent focus restoration.

Both engines/modes cover **320, 375, 768, 1024 and 1440px × light/dark**, keyboard Run Tests activation, visible focus ring, 44px target, atomic status summary, seven labelled result rows, no horizontal overflow and unchanged stored preferences/no new keys. Existing mobile tabs and editor interaction are additionally covered by the inherited suites.

## Protocol and regressions

| Suite | Actual result | Evidence |
| --- | --- | --- |
| Dishonest grading peer, Chromium | **10/10** | `protocol-chromium.json` |
| Dishonest grading peer, Firefox | **10/10** | `protocol-firefox.json` |
| Ordinary preview navigation after grading, both engines | **4/4** | `navigation-owner.json` |
| ED-019 matrix, Chromium fallback | **147/147** | `regression/matrix/chromium-fallback/report.json` |
| ED-019 matrix, Firefox fallback | **144/144** | `regression/matrix/firefox-fallback/report.json` |
| ED-019 matrix, Chromium dedicated | **162/162** | `regression/matrix/chromium-dedicated/report.json` |
| ED-019 matrix, Firefox dedicated | **159/159** | `regression/matrix/firefox-dedicated/report.json` |
| ED-018 lab regression, Chromium | **159/159** | `regression/ed018-lab-verification.json` |
| Curriculum / modes / preferences, Chromium | **24/24** | `regression/curriculum-chromium.json` |
| Curriculum / modes / preferences, Firefox | **24/24** | `regression/curriculum-firefox.json` |
| Parent sidebar disclosures / lesson navigation | **171/171** | `regression/ed017/branch-verification.json` |

Inherited tools were copied into ED-020, with outputs redirected, v3 protocol fixtures and the new Run Tests tab stop. No original ED-018/019 documentation or tools were changed. The full matrices verify the existing sandbox, opaque origin, parent DOM/storage denial, network/navigation canaries, WebRTC mitigation, message forgery/flood/version mismatch, compiler/runtime errors, editor/undo, resources, responsive layouts and themes. Full matrix runs preceded the final document-wide CSP ownership refinement; the final 99-check suites in all four combinations plus the targeted two-browser navigation checks verify that refinement. No security policy was relaxed.

Firefox's original finite regex stress probe could exceed the existing 5s heartbeat limit and correctly stop, while the harness waited only for ready. This occurred under concurrent load and once in dedicated mode. A focused probe confirmed the stop; 25 repetitions rendered successfully. The copied Firefox matrix uses 25 rather than 26 for this finite responsiveness probe; product limits and all unbounded regex/loop/microtask/allocation cases are unchanged. Final matrices passed. The initial dedicated report and diagnostic log are retained (`initial-firefox-dedicated-resource-timeout.json`, `firefox-finite-probe.log`). A report-directory/hostname issue in a copied curriculum harness was corrected and both engines were rerun successfully.

## Visual evidence and accessibility

Each `<engine>-<mode>/` has four responsive result screenshots (375/1440 × light/dark), plus correct, compile-error and timeout screenshots. The fallback examples include full-page captures of those states; inherited matrix/lab tools also captured the editor and preview. `files.txt` is the exact inventory. Visual review checked wrapped long requirements, actionable errors, status text/icons, retry actions, theme consistency and focus. Initial viewport captures of long result lists may show only part of the panel; full-page captures show the complete context.

Native buttons, visible focus, one concise atomic grading announcement, text statuses beyond color and an inert/aria-hidden test frame were checked. No screen reader or formal WCAG audit was run. Ordinary-page lazy-loading tests cover every frontend page; measured article JavaScript totals/inventory are unchanged. Performance samples and their limits are in performance.md.

## Known limits and release blockers

- **Educational feedback only.** A capable learner can manipulate browser execution/results; this is not certification or authoritative assessment.
- **Production remains blocked.** Dedicated production host/origins and deployed headers are undecided/unverified. No deployment performed. The existing same-origin fallback is retained for development; its weaker process isolation is not a public-release approval.
- **WebKit/Safari and physical devices unverified.** ED-019 records missing host libraries for downloaded WebKit. ED-020 did not run WebKit, real Safari, physical devices or assistive technology.
- **Resource limits unchanged.** Guards/watchdogs do not impose a hard CPU/memory sandbox. Uninterruptible native work can freeze a shared-process browser; Firefox's unbounded-hang cases are skipped where the finite probe demonstrates a shared parent thread, as in ED-019.
- **CSP diagnostic attribution.** Frame-src violation events on the parent document do not identify a child frame, and Firefox may deliver them after a grading frame is gone. Grading retains ownership until explicit ordinary-preview Run/focus, preventing stale test reports from stopping that preview. A direct timer-driven navigation from the unfocused existing visible preview in this interval stays CSP-blocked but may lack its own diagnostic. Its own load/heartbeat and runtime link guards remain. Simultaneous independent navigation attempts cannot be attributed perfectly.
- **Deliberately small contract.** Single-file TSX, existing 50,000-character source cap, documented accessible count/button contract, immediate React counter interactions; no arbitrary-widget accessible-name engine, type checker or general async testing framework. Test mounts share the disposable document's ambient realm, although factory/module/root state is fresh. No promise of malicious-code isolation between individual tests.

## Acceptance

Run Tests evaluates rendered learner behavior in the existing sandbox, six valid alternatives pass, known incorrect programs fail their relevant tests, syntax/runtime/hang failures are contained and recoverable, results are clear/actionable, editor/undo and visible counter state are preserved, stale work is discarded, no storage/dependencies/backend were added, all 119 lessons remain available, and existing learning/navigation/preferences behavior passes the listed regressions. ED-020 is locally implementation-complete within the documented prototype limits; it is not production-release approved.

## Reproduce

Run the four Yarn checks above. For fallback, `yarn build` then `yarn start --hostname localhost --port 3118`. Run `node docs/ed-020/tools/verify-grading.cjs`, `ENGINE=firefox node .../verify-grading.cjs`, or `verify-grading-protocol.cjs` / `verify-navigation-owner.cjs`. The copied ED-019 matrix uses `MODE=fallback` or `MODE=dedicated` and `ENGINE=chromium|firefox`; it starts/stops its own preview host and canary servers, so do not run two matrix instances or another host on :4100 concurrently.

Dedicated grading: build the app with `NEXT_PUBLIC_LAB_PREVIEW_ORIGIN=http://127.0.0.1:4100 yarn build`; build the host with `LAB_PARENT_ORIGINS=http://localhost:3118 yarn build:preview-host`; start the app on localhost:3118 and serve the host with **the same** `LAB_PARENT_ORIGINS=http://localhost:3118 yarn preview-host`. Run grading with `MODE=dedicated` (the app's build chooses the actual target; MODE labels the report). Tools accept BASE/PLAYWRIGHT_CORE/CHROME_PATH. Stop owned servers and restore a default `yarn build` afterwards, as done here.
