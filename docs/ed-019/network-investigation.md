# ED-019 network investigation (Phase 4)

## The ED-018 unexplained requests: attributed

**ED-018 observation.** In one early run (before request provenance was logged), the canary on `127.0.0.1:4802` received `GET /` (`sec-fetch-dest: document`, no referrer) followed by `GET /favicon.ico`. The same pattern appeared once on port 4801 of the pre-implementation probe. It was not reproducible, and its source was unknown.

**ED-019 instrumentation.** Every server the tests start (preview host, HTTP canary, UDP canary and idle sentinel) records:

- method, path, query and time
- User-Agent and remote port
- `Sec-Fetch-Dest`, `-Mode` and `-Site`
- `Referer` and `Origin`

The test browser records every request it issues or fails: URL, method, resource type, frame URL, whether it's a navigation, redirect source and failure reason. In Chromium it also records CDP initiators. Harness-originated requests carry a fixed User-Agent. A server-side record is attributed when it matches a browser-recorded request. Records whose User-Agent differs from the test browser's are reported as **external clients**.

**Reproduced with provenance.** The identical pattern recurred three times during ED-019, each time from the same client:

| When (local) | Server | Request | User-Agent | Fetch metadata |
| --- | --- | --- | --- | --- |
| 2026-11-08, first dedicated matrix run (report superseded) | preview host :4100 | `GET /` | `Mozilla/5.0 (Windows NT 10.0; Win64; x64) … Chrome/157.0.0.0` | `dest=document`, `site=none`, no referrer |
| second dedicated matrix run (superseded) | preview host :4100 | `GET /` | same Windows Chrome 157 | same |
| 16:07:19.870 and 16:07:19.908 | canary :4802 (ED-018 suite copy) | `GET /`, then `GET /favicon.ico` | same Windows Chrome 157 | `document`/`none`, then `image`/`same-origin` |

The third occurrence is preserved in [regression/ed018-lab-verification.json](regression/ed018-lab-verification.json) (`canaryHits`).

**Conclusion.** The requests came from a **desktop Chrome 157 on the Windows host**, outside the test environment. They did not come from the test browser, the preview or learner code:

- The test browser is Linux Chromium 156 (HeadlessChrome) or Firefox 157.
- `sec-fetch-site: none` with no referrer means the URL was opened directly, not loaded by a page.
- None of the test browser's recorded requests match.
- The preview cannot open top-level documents (no `allow-popups` or top navigation), and every preview-originated vector was blocked.
- The pattern (document, then favicon) is a normal top-level page load in a desktop browser.

Each time, the request arrived shortly after a test server began listening on a new local port. This is consistent with the editor's remote port auto-forwarding (VS Code over WSL) opening a newly detected port in the host browser. The **launching program is not confirmed**: VS Code's server and client logs contain no entries for these ports, and the investigation deliberately did not inspect the owner's browser history. A 25 s idle-port test in ED-019 drew no visitor, so not every new port is opened.

**Status:** attributed to an external client on the developer machine, not to the application. Network isolation is not affected. The idle sentinel port received no requests in any of the four final matrix runs, and the final reports list no external-client requests.

## Request classes observed in the final runs

| Class | How identified | Chromium dedicated | Firefox dedicated |
| --- | --- | --- | --- |
| Main-app requests | top frame, app origin | included in 780 browser records | included in 676 |
| Preview-document requests | frame = preview, preview-host origin | 292 host-server requests, all matched | 211, all matched |
| Learner-code requests | canaries | 0 HTTP, 0 STUN | 0, 0 |
| Navigation requests (preview self-navigation) | canary + `isNavigationRequest` | 0 reached the canary (refused by `frame-src`) | 0 |
| Browser-generated (favicon and similar) | server log without a matching page request | none unattributed | none |
| Test-harness requests | fixed User-Agent | Practice header probe | same |
| External clients | User-Agent ≠ test browser | none in the final run | none |

Fallback runs had 717 (Chromium) and 616 (Firefox) browser requests, with 0 canary, STUN or sentinel traffic.

## Preview requests per run

The preview loads `preview.html` (no-cache), `preview.css` and the runtime. Chromium recorded 4 requests per run in every mode (memory-cache hits still appear as requests). Firefox recorded 1–2 in dedicated mode and 1 in fallback.
