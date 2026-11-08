# ED-020 performance

## JavaScript

Measured against fresh production builds at the start and end of ED-020 (`before-assets.json`, `after-assets.json`). Parent script bodies come from real browser response bodies for each route; gzip is a Node zlib level-9 estimate, not CDN transfer. Sandbox runtime is the generated fallback IIFE. No new package or browser test framework.

| Scope | Before raw B | After raw B | Delta raw B | Before gzip B | After gzip B | Delta gzip B |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| article | 556,752 | 556,752 | +0 | 168,800 | 168,800 | +0 |
| practice | 1,023,572 | 1,031,886 | +8,314 | 325,308 | 327,969 | +2,661 |
| runtime | 767,759 | 773,010 | +5,251 | 213,633 | 215,416 | +1,783 |

Article route: `/frontend/react/use-state`. Practice: `/practice/react/use-state-counter`. Article JavaScript has unchanged measured raw/gzip totals and resource inventory. The static import-graph tests also exclude the grading runtime, compiler, editor and results UI from ordinary pages. Test definitions are metadata; execution exists only in the sandbox bundle.

## Warm grading samples

15 requests per configuration; median (min–max), milliseconds. Heap values are bytes, parent only, no forced GC; null means unavailable.

| Configuration | Button to results/frame removal, ms | Parent heap before → after |
| --- | ---: | ---: |
| chromium-fallback | 169 (162–217) | 14487768 → 14463933 |
| chromium-dedicated | 162 (143–170) | 14359250 → 14360789 |
| firefox-fallback | 334 (297–877) | unavailable |
| firefox-dedicated | 303 (258–747) | unavailable |

## Execution and repeated runs

Each grading request creates one disposable frame through the existing PreviewFrame/runtime, compiles the current snapshot once, then reuses the compiled factory for all seven fresh module/root evaluations. Unchanged code is compiled once again on the next request because a new isolated realm is required to discard global side effects; the visible preview is neither recompiled nor reset. No per-test recompilation.

`grading-report.json` under each engine/mode records 15 successive unchanged-code grading durations (button to displayed results/frame removal), raw per-fixture timings, parent heap before/after, and cleanup checks. These are loopback QA measurements with warm browser caches, sometimes alongside another browser suite; they are not a field-performance benchmark. The per-test and suite durations shown in the UI measure execution inside the sandbox and exclude its initial loading/compilation.

The companion `performance-summary.json` summarizes all four reports without dropping samples. Firefox has no `performance.memory` API here and reports null; no memory number is invented. Chromium heap figures are parent-only, with no forced GC, and do not establish the absence of a leak. All 15 repeats leave one visible iframe and no grading iframe. The interactive counter remains at 2, its run ID and editor contents remain unchanged. Suspended work and loop-limit stops are followed by successful corrected-code grading.

Resource limits are unchanged: JavaScript guards do not interrupt every native built-in call and do not impose a hard memory budget. The existing ED-019 resource suites measure those properties separately. A Firefox finite stress probe using 26 repetitions exceeded the existing heartbeat watchdog in this environment; its copied diagnostic probe was calibrated to 25 while preserving every product deadline and the unbounded resource tests. See `firefox-finite-probe.log` and the final matrix reports.

Not measured: deployed network/CDN latency, physical mobile-device performance, sandbox-process total RAM/GC, WebKit or Safari.
