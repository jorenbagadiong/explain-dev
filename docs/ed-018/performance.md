# ED-018 performance

Measured 2026-11-08 with [tools/measure-performance.cjs](tools/measure-performance.cjs) in Chromium 156 (headless, 1440×900). Production builds were served locally by `next start` with gzip enabled. **Baseline** = HEAD `22aaec1` plus the uncommitted ED-015 files (the pre-ED-018 state), built in a temporary worktree. Raw data: [performance-baseline.json](performance-baseline.json), [performance-ed-018.json](performance-ed-018.json). Local loopback timings exclude network latency and are not representative of real devices.

## JavaScript loaded by the parent page

"Encoded" is bytes over the wire (gzip). Totals include scripts fetched by Next.js link prefetching while the page was idle.

| Route | Baseline encoded / decoded | ED-018 encoded / decoded | Difference |
| --- | --- | --- | --- |
| `/` | 167 411 / 552 624 | 167 646 / 553 489 | +235 B / +865 B (Practice link in shared navigation) |
| `/frontend/react` | 167 411 / 552 624 | 167 646 / 553 489 | +235 B / +865 B |
| `/frontend/react/use-state` | 168 910 / 555 887 | 169 145 / 556 752 | +235 B / +865 B |
| `/practice` | — (404) | 171 643 / 563 531 | new route (includes the prefetched challenge loader chunk, no editor) |
| `/practice/react/use-state-counter` | — (404) | 325 387 / 1 022 069 | +156 242 B encoded vs a lesson page: CodeMirror and the workspace, loaded lazily after hydration |

Every script on `/`, `/frontend/react`, the useState lesson and `/practice` was fetched and searched. None contains CodeMirror, Sucrase or Acorn code. Sucrase and Acorn are absent from all parent bundles, including the challenge route; they exist only in the preview runtime. The static import-graph test (`src/components/lab/lazy-boundary.test.ts`) enforces the same boundary for the layout, home, `/practice` and all 121 frontend pages (`/frontend`, `/frontend/react` and 119 lessons).

## Preview runtime (loaded only inside the preview frame)

| Asset | Transferred (gzip) | Uncompressed |
| --- | --- | --- |
| `/lab-runtime/runtime.js` | 214 141 B | 767 232 B |
| `/lab-runtime/preview.css` | 730 B | 1 877 B |
| `/lab-runtime/preview.html` | — | 361 B |

Most of the runtime is React DOM's **development** build, chosen so learners see complete React errors. Sucrase and Acorn add roughly 44 KB and 36 KB gzip (Bundlephobia estimates). A production React build would make the runtime much smaller but replace messages with "Minified React error #…" codes. It is cached after the first run.

## Timings (median of 5 cold browser contexts)

| Metric | Median | Samples (ms) |
| --- | --- | --- |
| Editor initialization (EditorView construction) | 23.6 ms | 23.6, 24.0, 22.7, 23.9, 20.4 |
| Preview ready (iframe created → runtime hello) | 99.5 ms | 102.6, 97.6, 99.5, 99.5, 102.8 |
| Preview rendered (iframe created → first commit) | 131.0 ms | 130.8, 129.4, 131.6, 132.1, 131.0 |
| Navigation start → workspace showing a rendered preview | 454 ms | 446, 453, 455, 454, 456 |

Timings are exposed as `performance.mark("explain-dev-lab:*")` entries only; nothing is sent anywhere.

## Build output

| | Baseline | ED-018 |
| --- | --- | --- |
| `.next/static` total | 957 510 B | 1 430 975 B (+473 465 B: CodeMirror and Practice chunks, not loaded by ordinary pages) |
| Preview runtime build (Vite) | — | about 0.3 s ([build.log](build.log)) |
| Full `yarn build` wall time | 12 s | 9 s (machine noise; not a meaningful difference) |
| Build route entries (including `/_not-found`, `/icon.svg`) | 123 | 125 (`/practice`, `/practice/react/use-state-counter`, both static) |

## Resource usage and disposal

- **No continuous recompilation.** Code is compiled only when the learner runs it (button or Ctrl/⌘+Enter), never on every keystroke.
- **One frame per run.** Each run replaces the iframe. After 15 consecutive runs there was exactly one iframe, and the parent JS heap went from 14.64 MB to 15.16 MB (no forced GC, so approximate).
- **Disposal.** CDP process sampling ([disposal-control.log](disposal-control.log)): while a preview hung in an uninstrumented regex, one renderer used about 1.5 s of CPU per 1.5 s. After the watchdog removed the preview, no renderer used more than 0.2 s in 2 s. The same held for the memory test.
- **Heartbeat cost.** One small message per second from the preview, and a 1 s watchdog timer in the parent while a preview exists. Navigating away removes both.
- **Limits.** Instrumented loops and functions call a cheap guard (one `performance.now()`). This does not eliminate nontermination risks; see [security.md](security.md).
