# ED-019 security

Evidence comes from Chromium 156.0.8078.4 and Firefox 157.0 (Playwright builds) on Linux, against production builds served locally. **WebKit, real Safari, physical devices and assistive technologies were not tested** (see [cross-browser.md](cross-browser.md)). Nothing here demonstrates a deployed environment.

**Not production-ready.** The isolation design is implemented and verified locally, but the preview host is not deployed, WebKit and Safari are untested, and the default configuration (no host set) runs the weaker same-origin fallback.

## Trust boundaries

| Boundary | Mechanism | Verified |
| --- | --- | --- |
| App ↔ preview document | `sandbox="allow-scripts"` + CSP `sandbox allow-scripts` (opaque origin) | Parent DOM, storage, cookies, state, location and history: SecurityError in both engines. Direct opening of the preview is still sandboxed (ED-018). |
| App site ↔ preview site (dedicated mode) | Separate site (`localhost` vs `127.0.0.1` locally; `*.vercel.app` or a separate domain in production) | Practice CSP `frame-src` and host `frame-ancestors` are exact origins. Process isolation depends on the engine (below). |
| Learner code ↔ network | Preview CSP (`connect-src 'none'` and friends) + parent `frame-src` + runtime controls | 21 exfiltration vector groups (29 individual mechanisms) and 11 navigation vectors: **0 requests** to the canaries in both engines and both modes (below). |
| Messages | Source check, `origin === "null"`, one-time hello, per-frame UUID v4 session, private `MessagePort`, exact schemas, size caps, run IDs, flood limit, version check | Compromised-preview scenarios below, plus forged messages from the preview, from the parent window and from another frame. |

## What changed for security in ED-019

1. **Dedicated preview host** (optional, configurable): a separate site, a static allowlist of files, no redirects, content-hashed runtime, `frame-ancestors` = exact app origins, and the parent-origin allowlist compiled into the runtime.
2. **Practice `frame-src`** (both modes). A parent page's `frame-src` governs every navigation of its child frames, including ones the child starts itself. `location.href`/`assign`/`replace`, `window.location`, `navigation.navigate()`, meta refresh, redirect chains and links to other origins are **refused before any request is sent**. Chromium then loads an error page into the frame (a second `load` event). Firefox keeps the current document and fires `securitypolicyviolation` on the parent. `PreviewFrame` handles both and removes the preview with "Navigation is disabled…". This closes ED-018's residual risk 1 (one escaping request per navigation).
3. **Link guard in the runtime**: a capture-phase click handler blocks `<a href>`/`<area href>` (except `#` links) before navigation, including `a.click()` and `ping`, and reports "Links to other pages are disabled". The preview stays usable.
4. **WebRTC disabled in the runtime.** CSP does not govern WebRTC: `connect-src` does not apply, and Chromium reports the proposed `webrtc` directive as unrecognized. In Chromium the preview sent STUN packets to an arbitrary UDP host. `RTCPeerConnection`, `webkitRTCPeerConnection` and `mozRTCPeerConnection` are deleted and redefined as non-configurable `undefined` before learner code exists, so 0 packets were observed afterwards ([webrtc-probe.log](webrtc-probe.log)). This is defense in depth in the same JavaScript realm, not a browser-enforced boundary. It holds because other RTC interfaces cannot be constructed and new realms (frames, workers) are blocked by CSP.
5. **Protocol hardening:**
   - version 2, with fail-closed version-skew detection
   - more than 50 unexpected messages ⇒ preview closed ("protocol violation")
   - hello accepted before or after the first `load` event, fixing an engine-dependent race that broke ED-018 in Firefox (see cross-browser.md); any later load is still treated as navigation
6. **Editor focus fix** for Firefox after interacting with the out-of-process preview (functional, not security).

## Network: vectors tested (all modes, both engines)

Ground truth comes from a local HTTP canary, a UDP canary (STUN) and an idle sentinel port. Full lists are in `tools/verify-matrix.cjs`.

- **Exfiltration (one run):** fetch, fetch keepalive, same-host fetch, XHR, WebSocket, EventSource, Image, CSS `url()`, CSS `@import` and `@font-face`, `<link>` prefetch/preload/stylesheet/preconnect/dns-prefetch, external `<script>`, `<iframe>`, `<object>`/`<embed>`, `<audio>`/`<video>`/poster, SVG `<image>`, `sendBeacon`, Worker, SharedWorker, `window.open`, form (`target=_blank`), WebRTC.
- **Navigation (one run each):** `location.href`, `location.assign`, `location.replace`, `window.location`, `navigation.navigate`, meta refresh, redirect chain, anchor click, anchor `ping`, form navigation, `location.reload`.
- **Results:** 0 HTTP canary requests, 0 STUN packets, 0 sentinel requests. Every server-side request from the test browser matched a request it recorded.
- **Not covered:** this is a finite list. DNS-only leaks (for example `dns-prefetch` resolving an attacker-controlled name) cannot be observed with local canaries. Browser extensions, OS-level networking and features not listed were not tested. **Network isolation is strongly supported by evidence, but not proven complete.**

## Navigation escape (Phase 5)

Probe: [tools/navigation-controls-probe.cjs](tools/navigation-controls-probe.cjs) → [navigation-controls-probe.log](navigation-controls-probe.log); [navigation-api-opaque.log](navigation-api-opaque.log).

| Control | Chromium 156 | Firefox 157 |
| --- | --- | --- |
| None (ED-018 behavior) | Every vector reaches the canary | Every vector reaches the canary |
| Navigation API `navigate` + `preventDefault` | **No effect**: opaque-origin documents have no entries and fire no `navigate` events | Same |
| Removing inserted `<meta http-equiv=refresh>` | No effect (refresh still happens) | Same |
| Runtime capture-phase click guard | Anchors blocked, 0 requests | Same |
| **Parent `frame-src` (ED-019)** | **All vectors refused, 0 requests**; error page load + CSP violation | **All vectors refused, 0 requests**; CSP violation, frame keeps its document |

CSP `navigate-to` is not used: browsers do not implement it. Enabling the Navigation API would require `allow-same-origin`, which was rejected.

Detection-to-removal time in the app: 200–320 ms in both engines, with two outliers: 424 ms (Firefox fallback `location.reload`) and 779 ms (Chromium dedicated `location.href`). See the matrix reports.

Allowed by design: a navigation to the preview's own origin (`frame-src` permits it). In dedicated mode, that request reaches only the static preview host, which logs and 404s it. In fallback mode, it reaches the app's own origin.

## Messages: compromised-preview scenarios (dedicated mode, both engines)

A stub host replaced the real preview and spoke protocol v2 maliciously.

| Scenario | Result (Chromium / Firefox) |
| --- | --- |
| valid baseline | ready / ready |
| wrong session | 1 rejected, then ready |
| stale and future `runId` | 2 rejected, then ready |
| malformed (unknown type, extra key, HTML field, garbage, null, array) | 6 rejected, then ready |
| oversized diagnostic (5 000 chars) and oversized detail | 2 rejected, then ready |
| markup in a valid diagnostic | shown as literal text; no `<img>`, `<script>` or `<b>` element created |
| reordered (error before render) | deterministic: runtime-error stays |
| second hello after the handshake | 1 rejected |
| flood (60 messages) | closed after 51 ("unexpected messages") |
| delayed render (9.5 s) | closed at the 8 s render timeout; the late message was ignored (port closed) |
| protocol version 1 hello | fail closed ("version mismatch") in about 0.5–1 s; nothing executed |
| host unavailable | "couldn't start" after 10.0–10.1 s; Run again recovered in under 0.2 s |

Learner code cannot reach the port. It can still post forged window messages, which were all rejected (7 per run), and its own status reports for its run are untrusted and displayed only as text.

## Resource exhaustion and parent responsiveness

The metric is the maximum parent timer gap (50 ms sampling). Details are in the matrix reports and [firefox-isolation-strategy.log](firefox-isolation-strategy.log).

| Case | Chromium dedicated | Chromium fallback | Firefox (Playwright default, no OOP iframes) | Firefox site-isolation default (strategy 1) |
| --- | --- | --- | --- | --- |
| Finite uninstrumented block (~0.7 s Chromium, ~3.6 s Firefox) | 68 ms | 65 ms | 3 755 ms (dedicated), 3 794 ms (fallback) | **52 ms dedicated / 3 650 ms fallback** |
| Infinite render loop, microtask flood, allocation (guarded) | stopped ≈1.2 s, gap ≤ 62 ms | ≤ 58 ms | stopped ≈1.2–1.8 s, gap ≈1.0–1.1 s | not measured |
| Uninstrumented non-terminating regex | watchdog closed it at ≈6 s; gap 52 ms; **no busy renderer afterwards** | same | **not run**: would freeze the tab indefinitely (parent shares the thread) | not run |

Key findings:

- **Chromium** isolates the sandboxed preview in both modes.
- **Firefox** with its desktop default (site isolation) keeps the parent responsive **only with the dedicated cross-site host**. With the same-origin fallback, a blocking preview freezes the page; with a non-terminating uninstrumented hang, it freezes the tab indefinitely. Playwright's Firefox disables out-of-process iframes (`fission.webContentIsolationStrategy = 0` in its `playwright.cfg`), so the automated matrix understates Firefox's real isolation in dedicated mode. Strategy 1 was measured separately; Playwright cannot inspect out-of-process frames in Firefox.
- **Safari/WebKit:** unknown (blocked).
- Large output (50 000 list items) rendered in 0.7 s (Chromium) and 1.8 s (Firefox). 20 rapid Run clicks left exactly one frame showing the latest run. 15 and 20 sequential runs left one frame. Navigating away during a hang (Chromium) completed in 49 ms and removed the frame.

## Residual risks and release blockers

1. **Preview host not deployed.** Production uses the fallback until `NEXT_PUBLIC_LAB_PREVIEW_ORIGIN` is set. The fallback is network-safe in both tested engines, but **freezes Firefox tabs** on blocking code. *Release blocker for Firefox users unless the dedicated host is deployed.*
2. **WebKit and Safari untested** (missing system libraries; no Safari available). *Release blocker.*
3. **Non-terminating uninstrumented code** (catastrophic regex, huge built-in operations) freezes the tab in any engine or mode that runs the preview in the parent's process. Guards are not a CPU sandbox.
4. **Finite vector list.** DNS-level leaks and unlisted mechanisms are not proven blocked.
5. **WebRTC mitigation is JavaScript-level** in the shared realm. It holds against the constructors tested, but it is not enforced by the browser.
6. **Firefox focus fix** is verified only under automation. Real-Firefox confirmation is pending.
7. **No TypeScript type checking** (unchanged).
8. **Real devices and assistive technology** untested.
