# Performance — ED-015

## Method and build output

Fresh local production builds at the same checkout, before/prototype/after. `tools/measure-build.mjs` reads the emitted assets and all 122 application HTML files (119 lessons plus home/frontend/curriculum). Node gzip uses its defaults and is an estimate, not negotiated browser transfer. No dependencies or animation runtime were added.

| Measure | Before | Final | Delta |
| --- | ---: | ---: | ---: |
| All emitted JS | 677,904 B / 14 files | 677,926 B / 14 files | +22 B |
| CSS raw | 33,077 B | 46,673 B | +13,596 B |
| CSS Node-gzip estimate | 7,047 B | 9,654 B | +2,607 B |
| Home HTML raw | 33,013 B | 38,564 B | +5,551 B |
| Curriculum HTML raw | 256,289 B | 269,756 B | +13,467 B |
| useState HTML raw | 103,882 B | 104,673 B | +791 B |
| Home HTML gzip estimate | 6,501 B | 7,571 B | +1,070 B |
| Curriculum HTML gzip estimate | 24,819 B | 26,133 B | +1,314 B |
| useState HTML gzip estimate | 19,757 B | 19,848 B | +91 B |

The JS change is the shared mode-selector styling hook; no new Client Component or lesson content was added to client code. Static decorative SVG/markup is server-rendered. CSS is cached/shared. The curriculum's repeated class/number markup and server-rendered illustration add HTML, not client state. All routes' individual output sizes are retained in [baseline-build.json](baseline-build.json) and [after-build.json](after-build.json).

## Resource and timing evidence

`tools/capture.cjs` uses fresh Chromium headless-shell contexts, six routes × two widths × two themes, a local `next start` server, no CPU/network throttle and reduced motion. It records actually requested JS decoded/encoded/transfer sizes, paints, DOMContentLoaded, observed LCP/CLS and long tasks. These are single local observations after a network-idle wait, not a controlled multi-run benchmark, a deployed LCP/INP score, or field data. Capture timing and background OS load can differ. No speedup is claimed.

Final runtime comparisons below come from the corrected-build capture. An intermediate capture found the homepage eagerly loading a 3,263-byte decoded article interaction chunk via its new introduction link; explicit deferred prefetch removed that avoidable request. The link remains functional.

The detailed browser suite records an unthrottled 60-frame rAF probe with hover and verifies the entrance animation ends. Frame intervals are a local observation, not GPU/compositor attribution or low-end-device certification. No perpetual JS animation, full-screen filter, animated box shadow, WebGL scene, or pointer-driven React re-rendering was introduced.

## Limits

No field Web Vitals, deployed/CDN behavior, CPU-throttled device lab, memory profiling, INP study, cross-browser animation trace or physical low-end-device benchmark. Local sizes and checks support a small implementation overhead; they do not prove identical performance on every device. Simplify effects if deployment/real-device evidence shows a problem.

## Matched desktop-dark observations

| Route | FCP before/after (ms) | Observed LCP before/after (ms) | CLS before/after | Requested JS decoded before/after (B) | Encoded JS before/after (B) |
| --- | --- | --- | --- | --- | --- |
| home | 88 / 108 | 88 / 108 | 0.00000 / 0.01994 | 547680 / 547680 | 166083 / 166083 |
| frontend | 64 / 64 | 64 / 64 | 0.00760 / 0.00812 | 547680 / 547680 | 166083 / 166083 |
| curriculum | 80 / 108 | 80 / 108 | 0.00045 / 0.00045 | 547680 / 547680 | 166083 / 166083 |
| introduction | 88 / 80 | 88 / 80 | 0.00013 / 0.00013 | 550921 / 550943 | 167572 / 167582 |
| use-state | 72 / 88 | 72 / 88 | 0.01402 / 0.01242 | 550921 / 550943 | 167572 / 167582 |
| server-components | 84 / 76 | 84 / 76 | 0.00014 / 0.00014 | 550921 / 550943 | 167572 / 167582 |

Across all 24 captures, maximum observed CLS was 0.02073 before and 0.05745 after. This is not a zero-layout-shift claim. The cause of individual layout shifts was not instrumented in this capture. Local font swapping may contribute; final timings fluctuate in both directions. No >50ms long tasks were observed in these capture windows. Full samples/transfer sizes remain in the browser JSON files.

The final desktop-dark homepage requested the same decoded JS total as baseline after the prefetch correction. Each sampled article requested 22 additional decoded bytes; the emitted JS total likewise increased by 22 B. These are requested/extracted bytes, not parsed/executed-byte attribution. The final rAF probe reported median/p95 16.7ms, maximum about 16.8ms, zero intervals above 50ms. No obvious lag was observed in that one unthrottled probe; physical/low-end-device performance remains unverified.
