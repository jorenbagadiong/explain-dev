# ED-021 performance and privacy

## Measurement

`tools/measure-assets.cjs` used fresh Chromium contexts against local production builds before and after ED-021. It collected parent-page script response bodies after network idle and the ready workspace, summing uncompressed bytes and estimating gzip with Node zlib level 9. Runtime bytes come from the built static file. These are repeatable body-size estimates, not deployed transfer sizes, Brotli/CDN measurements, startup benchmarks or heap guarantees. Raw file-level data is retained locally in `before-assets.json` and `after-assets.json`; generated artifacts are excluded from the commit.

| Surface | Before raw B | After raw B | Delta raw B | Before gzip B | After gzip B | Delta gzip B |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| article | 556,752 | 556,752 | +0 | 168,800 | 168,800 | +0 |
| practice | 1,031,886 | 1,054,278 | +22,392 | 327,969 | 334,490 | +6,521 |
| runtime | 773,010 | 773,010 | +0 | 215,416 | 215,416 | +0 |

Practice adds **6,521 estimated gzip bytes** on entry. Ordinary article JavaScript and the compiler/grading preview runtime have zero size increase. No new dependency or lockfile change. The client-only Practice boundary still keeps progress, editor, compiler and solution modules out of ordinary article imports (automated lazy-boundary test).

The reference solution is a separate **1,696-byte raw / 810-byte gzip** chunk, excluded from initial Practice totals. Browser response inspection confirmed it was absent initially and loaded only after View → Reveal. The solution is text, not a compiled program applied to the editor.

## Storage usage

Both Chromium and Firefox recorded identical `JSON.stringify(record).length * 2` estimates (UTF-16 value bytes, excluding key/engine overhead):

| Stored value | Estimate |
| --- | ---: |
| Completed reference draft with three hints and viewed flag | 2,260 B |
| Maximum 50,000 ASCII-unit draft plus metadata | 100,760 B |
| Clear marker with no learner code/history | 174 B |

These are value-size estimates, not physical disk usage or browser quota accounting. Escaped/control characters can increase JSON size; decoding bounds the serialized record at 304,000 UTF-16 units before parsing. Oversized edits remain in memory and cannot replace a previously saved draft. Writes catch quota/security failures.

Edits update memory immediately and coalesce localStorage serialization/writes after 500 ms. Explicit metadata actions and lifecycle flushes save immediately. No polling, network saving, per-keystroke storage write, dependency initialization on reading routes or new animation library. Synchronous localStorage work is bounded by the draft limit; hardware timing has not been benchmarked. Existing sandbox compile/execute/memory resource limits are unchanged.

## Privacy and limits

One per-challenge parent-origin key stores source, learner-facing summaries, assistance flags and bounded revision metadata. No test transcript, MessagePort, session/run capability, frame/runtime object or authentication data is stored. Nothing is sent to a backend, analytics service or cloud store. Explicit Run/Run Tests sends source only to the configured sandbox frame as before; restore never does so.

Clear removes learner content/history and leaves only the data-free revision marker to block stale-tab resurrection. Other tabs can still hold unsaved source in memory; keeping it later requires explicit conflict resolution. Site-data clearing can remove records, devices cannot sync, and browser crashes before saving can lose pending edits. Same-origin scripts or developer tools can edit local records; progress is educational feedback rather than certification. Web Locks unavailable means saving visibly fails instead of allowing racing writes.

Dedicated-host production behavior, deployed CSP/origin/headers, Safari/WebKit, physical devices and assistive technologies are not verified by these measurements. ED-019's release blockers remain in place; ED-021 adds no deployment path.
