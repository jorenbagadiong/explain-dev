# ED-022 performance

Measured against local production builds before/after ED-022 using fresh Chromium contexts. `tools/measure-assets.cjs` records parent-page script response bodies, including idle link-prefetch traffic, and estimates gzip with Node zlib level 9. Sandbox runtime is measured separately from the generated static file. These are body-size estimates, not deployed CDN/Brotli transfer sizes, mobile benchmarks or heap guarantees. Raw data: `before-assets.json`, `after-assets.json`.

| Surface | Before raw B | After raw B | Delta raw B | Before gzip B | After gzip B | Delta gzip B |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| article | 556,752 | 556,764 | +12 | 168,800 | 168,810 | +10 |
| practice | 1,054,278 | 1,066,731 | +12,453 | 334,490 | 338,985 | +4,495 |
| runtime | 773,010 | 783,183 | +10,173 | 215,416 | 218,601 | +3,185 |

The article sample is `/frontend/react/use-state`; Practice is the original Counter route. Each of the four new challenge routes loads the same measured parent script total as Counter. The final Practice index is 572,828 raw / 174,520 gzip bytes and mounts no editor or iframe. No pre-ED-022 index size was captured, so no index delta is claimed.

## Investigated regression

Initial measurement found an extra 9,006 raw / 3,116 gzip bytes on ordinary lessons. The shared sidebar's Practice link prefetched the new progress-status graph, including static grading metadata/validation. Disabling speculative prefetch on that single Practice link removes the graph from lesson downloads. The link and all navigation still work. Final article delta is just 12 raw / 10 gzip bytes for the navigation flag; no editor, compiler or grading execution is downloaded on ordinary lessons. The import-graph and prefetch boundary tests guard this.

Practice adds 4,495 estimated gzip bytes in the parent. The sandbox runtime adds 3,185 gzip bytes for the additional behavioral graders and timer scheduler. Compiler and React dependencies are reused; no package or lockfile edit, external runtime request, backend, analytics or new animation library.

## Lazy references and resources

The existing Counter reference remains a separate 1,696 raw / 810 gzip-byte chunk. Response inspection confirms it is absent on initial Practice entry and loads only after warning/reveal. All five references use literal, challenge-specific dynamic imports; no aggregate solution payload is applied to the editor. Reference code is displayed as escaped text.

There is one active editor and one interactive frame per challenge page. Grading adds one disposable frame without replacing the interactive preview, then removes it. Practice index has none; it reads progress without acquiring locks or writing records. Baseline Counter repetition and all-five responsive assertions check frame/editor counts. Synchronous draft writes retain ED-021's 500 ms debounce, 50,000 UTF-16-unit source limit and bounded JSON schema. Existing storage policy/keys and failure handling are unchanged, now isolated across five IDs.

Cleanup uses virtual interval time, avoiding multi-second sleeps in each lifecycle test. At most 32 active interval registrations and 100 callbacks per advance are permitted. Far-future native handle reservations are released on learner cancellation or test disposal. Existing compile/execution guards and frame deadlines are unchanged. These bounds are defense in depth, not complete CPU/memory isolation; the inherited Firefox fallback and deployed-host limitations remain.
