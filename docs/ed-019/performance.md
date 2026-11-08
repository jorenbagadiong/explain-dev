# ED-019 performance (Phase 10)

Tool: [tools/measure-performance.cjs](tools/measure-performance.cjs). Raw data: [performance/](performance/). Every value below is **median (min–max)**; all individual samples are in the JSON files.

- 5 cold browser contexts per configuration; 10 warm Run samples; 20 further runs for memory and cleanup.
- Production builds, served locally (loopback).
- ED-018 = commit `6b629eb`, built in a temporary worktree.
- The local preview-host server does not compress, so its runtime transfer is uncompressed. A production static host would serve it gzip-compressed (213.6 KB, computed).

## Practice page and preview bundle

| | ED-018 | ED-019 fallback | ED-019 dedicated |
| --- | --- | --- | --- |
| Parent scripts on the challenge route (encoded, Chromium) | 325 377 B | 325 929 B (+552 B) | 325 930 B (+553 B) |
| Preview runtime uncompressed | 767 232 B | 767 759 B (+527 B) | 767 753 B (+521 B) |
| Preview runtime gzip | 213 410 B | 213 633 B | 213 641 B |
| Runtime caching | `public, max-age=0` (revalidate) | same | `immutable`, content-hashed |
| `preview.html` caching | `max-age=0` | same | `no-cache` |

The ED-019 size increase (≈0.5 KB) comes from the protocol, the link guard, WebRTC removal and the parent-side handling.

## Timings: Chromium 156

| Metric | ED-018 | ED-019 fallback | ED-019 dedicated |
| --- | --- | --- | --- |
| Navigation → preview rendered | 458 (446–479) ms | 452 (447–458) ms | 449 (441–458) ms |
| Preview ready (frame created → hello) | 104.8 (103.8–112.9) ms | 99.2 (97.8–99.8) ms | 97.6 (94.9–104.6) ms |
| First render (frame created → rendered) | 136.1 (135.9–148.8) ms | 129.8 (127.3–131.7) ms | 129.7 (126.8–134.0) ms |
| Editor initialization | 23.1 (22.4–25.6) ms | 23.5 (22.9–24.2) ms | 24.1 (22.2–25.7) ms |
| Run → preview ready (10 runs) | 183.1 (172.7–195.7) ms | 174.1 (167.1–181.3) ms | 161.8 (142.3–177.2) ms |
| Preview requests per run | 4 (4–4) | 4 (4–4) | 4 (4–4) |
| Parent JS heap, before → after 20 runs | 11.28 → 13.39 MB | 11.28 → 13.37 MB | 11.29 → 13.36 MB |
| Frames after 20 runs | 1 | 1 | 1 |

## Timings: Firefox 157

| Metric | ED-018 | ED-019 fallback | ED-019 dedicated |
| --- | --- | --- | --- |
| Navigation → preview rendered | **failed 5/5** (hello race; see cross-browser.md) | 448 (448–652) ms | 437 (433–623) ms |
| Preview ready | failed | 120 (118–133) ms | 105 (96–110) ms |
| First render | failed | 138 (137–151) ms | 122 (115–129) ms |
| Editor initialization | failed | 18 (18–19) ms | 18 (15–18) ms |
| Run → preview ready (10 runs) | failed | 160 (143–176) ms | 128 (125–175) ms |
| Preview requests per run | — | 1 (1–1) | 1 (1–2) |
| Parent heap | — | not available (`performance.memory` is Chromium-only) | not available |
| Frames after 20 runs | — | 1 | 1 |

## Observations

- **No regression from the separate host.** Dedicated mode is equal to or slightly faster than the same-origin preview in both engines. This is within loopback noise and may also reflect the immutable runtime cache. The 0.5 KB runtime growth is not measurable in timings.
- **Variability:** Firefox shows single cold-load outliers (652 ms fallback, 623 ms dedicated; the other samples are 433–448 ms). Its Run samples have occasional slow values up to 176 ms: the first three in dedicated mode, scattered in fallback. Chromium's spread is narrow.
- **Cleanup:** one frame after every sequence. In Chromium, no renderer used more than 0.2 s CPU in the 1.5 s after a hung preview was removed (matrix resource tests). Firefox CPU per process is not measurable with the available tooling.
- **Memory:** the Chromium parent heap grew about 2.1 MB over 20 runs identically in all three configurations, without forced GC. This is not a leak attributable to ED-019.
- **Not measured:** real network latency, a deployed CDN, slow devices, WebKit.
