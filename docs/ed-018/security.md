# ED-018 Coding Lab security

This completes the Phase 3 threat model in [threat-model.md](threat-model.md) (kept unchanged as the pre-implementation record) with the decision that was taken and the evidence gathered. **All browser evidence is from Chromium 156.0.8078.4 on Linux** (full build in headless mode, plus the headless shell where noted). Firefox, Safari/WebKit and real mobile devices were not available and are **untested**.

## Prototype, not a production-safe coding environment

The Coding Lab is a research prototype. It confines learner code to an isolated, network-denied preview, and that boundary was demonstrated in Chromium. It is not a CPU or memory sandbox, has only been verified in one engine, and shares a site with the application. It is reasonable for the current site, which has no accounts, cookies or secrets. It should not be extended to authenticated users or user data until the hardening items at the end of this document are done.

## Isolation decision

**Chosen: same deployment, opaque-origin sandbox.** The preview is `/lab-runtime/preview.html` on the app's own origin, loaded in `<iframe sandbox="allow-scripts">` (never `allow-same-origin`), and the response carries the CSP `sandbox allow-scripts` directive, so the document has an opaque origin even when opened directly.

**Evaluated: dedicated origin.** Hosting the preview on its own registrable domain (for example a second Vercel project) is feasible: the preview is static files, and the runtime's parent-origin check and `frame-ancestors` would take the app origin from configuration. It was not adopted in ED-018 because it requires a second deployment (deployment is out of scope) and it adds no confidentiality in the tested browser. A cross-site preview had the same sandbox results as the same-origin opaque preview in the pre-implementation probe ([isolation-probe-chromium.json](isolation-probe-chromium.json)). Its value is defense in depth: process isolation in browsers that isolate by site but not sandboxed frames, and no shared site if the sandbox were ever misconfigured. It is the first recommended hardening step.

The effective configuration was verified on the running app: the iframe `sandbox` attribute is exactly `allow-scripts`, `self.origin` inside the preview is `"null"`, and the headers below are served only under `/lab-runtime/`.

```
Content-Security-Policy: default-src 'none'; script-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src data: blob:;
  connect-src 'none'; font-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none';
  manifest-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'self'; sandbox allow-scripts
Permissions-Policy: accelerometer=(), camera=(), display-capture=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
Referrer-Policy: no-referrer
X-Content-Type-Options: nosniff
```

Application pages get no new headers. `Cross-Origin-Resource-Policy: same-origin` was deliberately not set: it would block the opaque-origin document from loading its own runtime.

## Trust boundary and messaging

- The parent never evaluates, imports or parses learner code. Compilation and execution happen only inside the sandboxed document.
- **Handshake:** the parent accepts exactly one `hello` per frame, only if `event.source === iframe.contentWindow`, `event.origin === "null"`, the frame has loaded exactly once, and the message matches the exact schema. It replies with `init` and transfers a fresh `MessagePort`. Messages from other windows are ignored; malformed or duplicate ones are counted in `data-rejected-messages` and dropped.
- **Binding:** every port message must carry the per-frame random session (UUID v4, the capability) and the current `runId`. The private port, new for every run, prevents injection by other frames. The session and run checks reject anything stale or replayed.
- **Schema:** exact-key validation, enumerated types and kinds, length caps (source ≤ 50 000 characters, message ≤ 2 000, detail ≤ 4 000). Anything from the preview is rendered as React text, never as HTML.
- The runtime accepts `init` only from `window.parent` with the app's origin, once, with exactly one port, and posts `hello` only to the app's origin. It refuses to run if `self.origin !== "null"` or if it is not framed.
- Learner code shares the runtime's realm, so it can forge status about its own run (for example, report a fake error). This affects only that run's display.

## Verified properties (Chromium 156)

Source: [lab-verification.json](lab-verification.json), 158 checks, 0 failures. Attacks were typed into the real editor and run in the real preview. A local canary server on a second port recorded any request that escaped.

| Attempt from learner code | Result |
| --- | --- |
| `window.parent.document`, parent app state (`parent.next`), `parent.location.href`, `parent.history` | SecurityError |
| Parent and own `localStorage`, `sessionStorage`, `document.cookie`, IndexedDB | SecurityError |
| `top.location = …` (parent navigation) | Blocked by the sandbox; the parent URL is unchanged |
| `fetch` (external and app), XHR, WebSocket, `sendBeacon`, `<img>`, CSS `url()`, external `<script>`, form submission | Blocked; **0 canary hits**; only `preview.html`, `preview.css` and `runtime.js` were loaded by the frame |
| `eval`, `Function(…)` | EvalError (CSP) |
| `new Worker(blob:)`, `BroadcastChannel` to the parent | Blocked; nothing received by the parent |
| `window.open`, `alert`, `confirm` | Returns `null` or `false`; no popup or dialog |
| Static import of `lodash`, `fs`, a URL or CSS; dynamic `import()`; `import.meta`; `require()` | Compile error with a message and line number |
| 7 forged `postMessage` payloads from the preview (hello, rendered, injected HTML error, init, garbage, null, 200 KB) | All 7 rejected; status unchanged; no markup injected |
| Messages from the parent window and from a separate injected frame | Ignored; run and status unchanged |
| Opening `/lab-runtime/preview.html` directly | Opaque origin, storage denied, runtime refuses to run |
| Parent URL, title, preferences, theme and cookies after all of the above | Unchanged |
| `while (true)`, `for (;;)` in render or event handler; endless microtask chain | Stopped by the guard about 1.2 s after Run; preview removed; maximum parent timer gap 50–51 ms (50 ms sampling interval) |
| Unbounded recursion | `RangeError` reported as a runtime error |
| 8 MB and 400 MB allocations in a loop | Stopped by the guard before memory exhaustion ([disposal-control.log](disposal-control.log)) |
| Catastrophic regular expression (uninstrumented, effectively non-terminating) | Heartbeat watchdog closed the preview after about 5 s; parent gap 50 ms; **no renderer still busy after removal**. The positive control saw about 1.5 s of CPU per 1.5 s window while it hung. |
| `location.href = …` and link clicks inside the preview | Detected (second `load`); the preview is removed. **One request did leave** (see residual risk 1). |

## Residual and unmitigated risks

1. **Self-navigation leaks one request.** Learner code can navigate its own frame (`location.href`, a link). Neither the sandbox nor CSP prevents that request, and `navigate-to` is not implemented by browsers. The parent detects the second `load` and removes the frame, but the request has already been sent, with any data learner code put in the URL. That data is only the learner's own code: the frame cannot read anything else. Verified: one canary request per attempt.
2. **Responsiveness depends on the browser's process model.** Chromium 156 (full build) put the same-site sandboxed frame in another process: during a bounded 1.5 s uninstrumented hang the parent's timer gap was 58 ms. **In the Chromium headless shell, which has no site isolation, the parent froze for 1 472 ms** ([process-isolation-comparison.log](process-isolation-comparison.log)). In such a browser, a non-terminating uninstrumented hang (for example a catastrophic regex) freezes the whole tab, and no watchdog can run. Firefox and Safari were not tested. A dedicated cross-site preview improves this only where the browser isolates by site.
3. **Guards are not a security boundary.** Learner code can defeat its own guard (for example, by overriding `performance.now`). Blocking that never reaches instrumented code (regular expressions, single huge built-in operations) is not interrupted. Legitimate synchronous work longer than 1 s is stopped as a false positive. Async loops that `await` real timers are not stopped (low CPU; discarded on the next run or navigation).
4. **Memory.** The guard stopped both allocation tests, but a single very large allocation or fast growth can still exhaust a renderer. The browser contains the crash; when heartbeats stop, the parent closes the preview.
5. **Shared site.** The preview shares the app's site, so cookies set later with `SameSite` semantics treat it as same-site, and side-channel mitigations rely on process isolation. There are no cookies or secrets today. Revisit before adding authentication.
6. **`script-src 'self' blob:` and `style-src 'unsafe-inline'`.** Learner code may load the app's own public scripts into the sandbox (harmless: opaque origin, no network) and use inline styles. CSS cannot exfiltrate data because image and font sources are denied, as verified.
7. **No TypeScript type checking.** Types are removed by Sucrase, not checked. This is disclosed in the UI and docs.
8. **Unexplained request during development.** In one early verification run, before request provenance was logged, the canary received `GET /` and `/favicon.ico` (`sec-fetch-dest: document`, no referrer). The same pattern appeared once on a fresh port of the pre-implementation probe. It was not reproducible in five targeted reproductions or in any later run with User-Agent and remote-address logging. Its source is unknown. The evidence (a top-level document load while the test page never navigated and no popup opened) suggests a client outside the test browser, but this is not proven.
9. **Browser coverage.** Only Chromium was tested. The sandbox, opaque origins, CSP3 `sandbox` and MessageChannel are standard and widely implemented, but they were not demonstrated in other engines here.

## Hardening before production use with user data

1. Serve the preview from a dedicated site with its own deployment; restrict `frame-ancestors` to the app origin and configure the expected parent origin in the runtime.
2. Verify in Firefox, Safari/WebKit and on iOS/Android devices, including the responsiveness tests.
3. Add a CSP and `X-Frame-Options`/`frame-ancestors` for application pages (requires nonces and dynamic rendering per the Next.js guide, or hashes).
4. Consider running compilation in a worker inside the preview and adding stricter, per-challenge module allowlists.
