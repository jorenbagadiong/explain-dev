# Performance measurements

Baseline and corrected production builds were measured locally on 2026-11-08. There is no measured application performance defect requiring an architecture change. No speculative optimization was applied.

These file-size measurements are from the initial ED-014 pass, before review follow-up. The review repeated browser resource checks in `review-browser-results.json` with the same JS decoded/encoded/transfer totals, but did not repeat this all-route file-size/compression sweep after its prose changes. See review-verification.md for fresh versus retained evidence.

## Client JavaScript

| Measurement | Bytes / scope |
| --- | --- |
| All emitted JS assets | 677,904 across 14 `.next/static` JS files (11 chunks plus three build manifests); not all requested by articles |
| Scripts referenced by each article HTML | 663,515 raw bytes across ten shared references |
| Node gzip representation of all ten references | 207,199; illustrative compression, not browser transfer |
| Node Brotli representation of all ten references | 179,204; illustrative compression, not negotiated deployment transfer |
| Scripts actually requested by Chromium on each of nine cold samples | Nine scripts, 550,921 decoded body bytes |
| Browser-reported encoded JS body bytes | 167,572, gzip responses from local `next start` |
| Browser-reported JS transferSize sum | 170,272; Resource Timing includes its header estimate, not a packet capture |
| Excluded by modern Chromium | 112,594-byte `nomodule` polyfill referenced in HTML |

The **historical byte total is reproducible**, but the statement “each route loads 663,515 bytes” confused referenced raw bytes with modern-browser requests and compressed transfer. Ten script references are shared across all 119 articles; there is no lesson-length-dependent JS reference set in this build. This audit explicitly counts `.js` files, including the three generated manifest scripts.

Assets and every route’s sizes are in [build-measurements.json](build-measurements.json). Real resource entries, response encodings, paints, navigation timing, and post-load execution coverage are in [browser-results.json](browser-results.json). Each sample used a fresh context, 1440×900, reduced motion, no CPU/network throttling, and a local production server. This is not a mobile-network benchmark.

Framework runtime is included: the React DOM runtime and Next routing/runtime chunks dominate shared output. Known markers locate the shared article mode/reveal/Back-to-Top code in a 3,241-byte raw chunk. Navigation/Sheet and theme code reside in other shared chunks. Marker inspection does not provide exact per-library attribution; no source-map-based bundle analyzer was added.

All **894** extracted article paragraphs longer than 80 characters were searched, both literal and JSON-escaped, across emitted client JS; none matched. Routes import their own content only on the server, and shared Client Components accept rendered slots. This is strong supporting evidence against article-body leakage, not a formal proof against every possible transformed content fragment.

Decoded/requested bytes do not establish parsed or executed bytes. CDP precise coverage started **after initial loading** and observed five shared chunks executing during mode switches. It does not establish complete initial-execution cost, per-function CPU time, or parse time. Local paint/load timings are retained as raw observations only; no field INP/LCP/CLS, representative slow-device long-task study, or Lighthouse score is claimed.

## HTML

All 119 generated article HTML files were measured independently: minimum **70,746**, median **89,518**, maximum **178,072** raw bytes. The maximum is `declarative-ui`; `react-introduction` is also an outlier at 176,651. Both baseline and corrected builds have the same min/median/max. Per-route gzip/Brotli estimates are recorded separately.

Learn, Review, and Interview slots plus the RSC payload contribute to initial HTML. That preserves all modes and keeps article prose out of client code; large HTML alone does not prove an unacceptable user experience. Nine sampled cold navigations show compressed HTML and script resource sizes, but no general-device latency conclusion is drawn. There was no evidence justifying lazy-fetching article modes or changing the content architecture in this stabilization milestone.

## Limits and decision

Shared caching can amortize navigation cost, but a warm-cache study was not performed. Deployed CDN compression/cache policy, low-end-device CPU, memory retention, all-route detailed timing, and field Web Vitals remain unmeasured. Maintain the existing boundaries and measure those scenarios before choosing an optimization. See ED014-PERF-001 for traceability.
