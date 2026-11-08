# ED-018 threat model — React Coding Lab (Phase 3)

Applies to the recommended design in [sandbox-evaluation.md](sandbox-evaluation.md): a self-hosted preview document in an `allow-scripts`-only sandboxed iframe. Status: **design, not yet implemented.** Each "guarantee" below is a property that has to be verified in a real browser during implementation; none is assumed from documentation alone.

## Assets

- The parent application's DOM, navigation state, and React tree.
- Parent-origin storage: `localStorage` preferences (`explain-dev` preferences key) and the next-themes `theme` key. The app has no cookies, sessions, auth, or secrets today. This model still treats the parent origin as sensitive, because future auth or progress features would inherit it.
- The learner's own draft code (low sensitivity, but should not leave the browser without consent).
- The learner's browser resources (CPU, memory, tab responsiveness).

## Trust boundary

```
 Parent app (https://<app-origin>)            Preview iframe (opaque origin "null")
 ─ trusted ─────────────────────────          ─ UNTRUSTED ─────────────────────────────
 editor, challenge text, run controls  ──►    preview.html + runtime.js (ours, trusted code)
   postMessage {type:"run", runId,            executes learner code (untrusted) with an
   source} targetOrigin "*"                   allowlisted require(); renders into #root
                                       ◄──    postMessage status/compile-error/runtime-error
   accepts ONLY if event.source ===             (schema-validated, size-capped, runId-matched)
   iframe.contentWindow && origin "null"
```

Everything that runs inside the iframe after the first `run` message is untrusted, including our own runtime, because learner code shares its realm and can tamper with it. The parent therefore **never trusts message content** beyond rendering it as escaped text.

## Controls in the recommended design

1. `<iframe sandbox="allow-scripts">`. No `allow-same-origin`, `allow-top-navigation*`, `allow-popups`, `allow-forms`, `allow-modals`, or `allow-downloads`. Also `referrerpolicy="no-referrer"`, a `title`, and a fresh iframe for every run (new realm; old timers, listeners, and memory are discarded).
2. Response headers for `/lab-runtime/*` only, via Next `headers()` (applies to `public/` assets on Vercel):
   `Content-Security-Policy: default-src 'none'; script-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src data: blob:; connect-src 'none'; font-src 'none'; media-src 'none'; object-src 'none'; frame-src 'none'; worker-src 'none'; manifest-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'self'; sandbox allow-scripts`
   plus `Permissions-Policy` denying camera, microphone, geolocation, payment, usb, and similar features, and `Cross-Origin-Resource-Policy: same-origin`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`. The CSP `sandbox` directive forces the opaque origin **even if `preview.html` is opened directly as a top-level page**.
3. Code is transformed by Sucrase, then parsed by Acorn. Static imports must be in the allowlist (`react`, `react/jsx-runtime`, `react-dom/client`). `import()`, `export * from`, and any other specifier are compile errors. Loop guards are injected into every `for`/`while`/`do`/`for-in`/`for-of` and abort after a time budget. The result runs from a `blob:` script URL inside the iframe. **No `eval`, no `new Function`, and no script injection in the parent document.**
4. Message protocol: discriminated union with a schema check on both sides, length caps (source ≤ 50 KB, messages ≤ 8 KB), `runId` matching, stale-run messages ignored, error text rendered as plain text only.
5. A parent watchdog: if a run produces no `rendered`/`error` message within N seconds, the iframe is removed and the learner sees "Preview stopped — your code took too long".
6. Unmounting the lab (navigation away) removes the iframe and the message listener.

## Risk register

| Risk | Without controls | With controls | Residual risk / honest limits |
| --- | --- | --- | --- |
| Access to parent DOM | Same-origin frame can read and write `parent.document` | Opaque origin: any `parent.document` access throws `SecurityError` | None expected; verify in the browser. |
| Parent cookies / localStorage | Shared origin storage | Opaque origin: `document.cookie` is empty, and `localStorage`/`sessionStorage`/IndexedDB throw | None expected. The CSP `sandbox` header blocks the direct-open bypass. |
| Cross-frame messaging | Spoofed messages could drive the parent UI | Source-window check, `"null"` origin check, schema, size caps, `runId` | Learner code can send arbitrary but well-formed messages from its own frame. The parent only displays them as text, so the effect stays inside the lab UI. |
| Arbitrary network requests | `fetch`, XHR, WebSocket, beacons, `<img src>` exfiltration | `connect-src 'none'`, `img-src data: blob:`, `script-src 'self' blob:`, `form-action 'none'` | The iframe can still **navigate itself** to an external URL (`location = …`); CSP `navigate-to` is not supported by browsers. Data available to exfiltrate is only the learner's own code. Prefetch/DNS hints are restricted by `default-src`, but browser support varies. |
| Dependency loading | Arbitrary npm/CDN code | Allowlist of three built-in specifiers; no CDN; no `import()` | Learners cannot use third-party libraries in ED-018 (intended). |
| Dynamic imports | Remote code execution | Rejected at compile time (Acorn `ImportExpression`) and blocked by `script-src` | — |
| Malicious / infinite JavaScript | Tab freeze | Loop guards + recursion surfaces `RangeError` + watchdog + fresh iframe per run | **Same-site iframes may share the parent's process and thread.** Code that blocks without a loop (for example a giant synchronous `Array(1e9).fill()` or a regex catastrophe) can freeze the tab until the browser's own "page unresponsive" prompt. Full fix: serve the preview from a separate site so site isolation puts it in another process. That is a later hardening step. |
| Resource exhaustion (memory, timers, DOM) | Crash or slowdown | Fresh realm per run, iframe removed on navigation, source size cap | A determined loop of allocations can still crash the renderer; the browser contains it, and we cannot prevent it in JS. |
| Unsafe HTML | XSS in parent | Parent never renders preview output as HTML; errors are text. Learner `dangerouslySetInnerHTML` affects only the sandboxed iframe | — |
| Preview origin isolation | — | Opaque origin; same *site* as the app | Spectre-class side channels are mitigated only when processes differ. The app holds no secrets today; revisit before adding auth. |
| Sandbox permissions | Popups, top navigation, modals, downloads, forms | `allow-scripts` only, plus a restrictive `Permissions-Policy` | `alert`/`confirm` are blocked (no `allow-modals`); the UI should tell learners that. |
| CSP | No CSP in the app today | Strict static CSP on the preview path only; the app's own pages are unchanged | Adding a CSP to the whole app is out of scope and would need nonces and dynamic rendering. |
| Credential exposure | — | No env vars, tokens, or server endpoints are introduced; no third-party bundler; learner code never leaves the browser | Third-party scripts added to the app later could read the editor; not applicable today. |

## What the chosen runtime does **not** guarantee

- It does not stop CPU exhaustion that avoids loops, or memory exhaustion.
- It does not stop the iframe from navigating itself away (top-level navigation is blocked).
- It does not guarantee process isolation from the app while both share a site.
- It does not type-check. TypeScript types are stripped, not verified; type errors are not reported in ED-018.
- It does not make learner code "safe"; it confines it.

## Items to verify in the browser during implementation

1. `parent.document`, `document.cookie`, and `localStorage` inside the preview behave as above in Chromium, and in Firefox/WebKit if available.
2. `script-src 'self' blob:` permits `runtime.js` and blob scripts in an opaque-origin document, and denies inline `<script>`, `fetch`, `<img src=https://…>`, and `import()`.
3. Opening `/lab-runtime/preview.html` directly still yields an opaque origin (CSP `sandbox`).
4. Infinite `while (true) {}`, `for (;;) {}`, and deep recursion are stopped and reported without freezing the app.
5. Messages from other windows and frames, and stale runs, are ignored.
6. Navigating away from the lab removes the iframe (no leaked listeners).
