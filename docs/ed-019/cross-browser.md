# ED-019 cross-browser validation (Phase 7)

All runs used the same matrix tool ([tools/verify-matrix.cjs](tools/verify-matrix.cjs)) and production builds served locally. The app was on `http://localhost:3118`; in dedicated mode the preview host was on `http://127.0.0.1:4100`.

| Engine | Build | Dedicated host | Same-origin fallback | Notes |
| --- | --- | --- | --- | --- |
| Chromium | 156.0.8078.4 (Playwright 1.64.1, full build, headless) | **161 / 161** | **146 / 146** | Out-of-process sandboxed preview in both modes |
| Firefox | 157.0 (Playwright build 1555, headless) | **158 / 158** | **143 / 143** | Playwright disables out-of-process iframes; site-isolation default measured separately |
| WebKit | Playwright build 2370 (downloaded) | **Not run (blocked)** | **Not run (blocked)** | Host is missing system libraries (libgtk-4, libgraphene, libatomic, libxslt, libevent, libopus, GStreamer and others) |
| Real Safari, iOS/Android devices | none available | **Not tested** | **Not tested** | |

Check counts differ by design. The unbounded-hang, navigate-away-during-hang and reopen-after-hang checks run only where the parent is measured to stay responsive (Chromium). In Firefox, under Playwright, they would freeze the tab indefinitely. Fallback mode has no stub-host protocol suite. Raw reports are in `matrix/<engine>-<mode>/report.json` with logs `matrix-<engine>-<mode>.log`.

**To unblock WebKit,** the owner runs:

```sh
sudo node /home/joren/.cache/yarn/v6/npm-playwright-core-1.64.1-ca9ec82d7da6ced1b2326ec59ef097aaa9a29f94-integrity/node_modules/playwright-core/cli.js install-deps webkit
```

Then re-run `ENGINE=webkit MODE=dedicated node docs/ed-019/tools/verify-matrix.cjs`. Playwright WebKit is not identical to Safari on macOS or iOS. Real Safari testing remains necessary.

## Matrix contents (identical per engine)

- **Isolation:** sandbox attribute, preview source and mode; Practice `frame-src`; opaque origin; parent DOM, storage, cookies, state, location and history; IndexedDB, service worker, Cache Storage; `eval`/`Function`; popups; dialogs.
- **Functional:** starter, edited code runs (+1 +1 −1 reset −1), edited text, Reset with a single undo, compile error with Run again, unsupported and dynamic import, render error with line and component stack, event-handler error, Rules of Hooks error, recursion.
- **Network and navigation:** 21 exfiltration vector groups (29 mechanisms), 11 navigation vectors, canaries, attribution.
- **Messages:** forged messages from the preview and from foreign windows, flood; in dedicated mode, 11 compromised-preview scenarios, host down and recovery.
- **Resources:** finite and infinite blocks, microtasks, allocation, event-handler loop, 50 000-item output, 20 rapid Runs, 15 sequential runs, navigate away during a hang.
- **Accessibility:** Tab order, Tab indents, Escape then Tab leaves the editor, Ctrl/⌘+Enter, live status region, visible focus, reduced motion, mobile tabs (arrows and Home), edits kept across views.
- **Responsive:** 320/375/768/1024/1440 × dark/light: no overflow, preview theme matches, tabs versus panels, 44 px targets, no parent errors. Screenshots at 375 and 1440 in `matrix/<engine>-<mode>/screenshots/`.

## Engine differences found (and handled)

1. **ED-018 did not work in Firefox at all.** The runtime is a deferred script, so its hello can arrive **before** the iframe's first `load` event. ED-018 accepted the hello only after exactly one load. Chromium delivered the load first; Firefox delivered the message first, so every preview timed out ("couldn't start"). Measured on the ED-018 commit `6b629eb`: 5 of 5 Firefox cold loads failed ([performance/ed018-firefox.json](performance/ed018-firefox.json)). **Fixed:** accept the hello before or after the first load; any later load is still treated as navigation.
2. **Blocked navigation:** Chromium shows an error page (second `load`); Firefox keeps the document and fires `securitypolicyviolation` on the parent. Both are now handled.
3. **Editor focus after clicking in the preview (Firefox):** pressing the editor left focus on the iframe, and `element.focus()` alone did not move it. The editor now blurs a focused iframe and then focuses itself on press. This is verified under automation in both engines ([tools/editor-focus-after-preview.cjs](tools/editor-focus-after-preview.cjs)). **Real-Firefox confirmation is pending** (Playwright drives Firefox with synthetic input).
4. **Reporting differences** (no action needed): Firefox stacks use `App@blob:…`, runaway recursion is `InternalError: too much recursion`, `window.open` in the sandbox throws `InvalidAccessError` instead of returning `null`, and Firefox sent no STUN packets even without the WebRTC mitigation (loopback target; not proof that Firefox blocks WebRTC).
5. **Process isolation:** see [security.md](security.md#resource-exhaustion-and-parent-responsiveness). Firefox at its desktop default isolates the dedicated cross-site preview (52 ms gap) but not the same-origin fallback (3 650 ms).

## Regression in other engines

- The curriculum regression (119 lessons, 8 groups, learning modes, preferences, console/hydration) passed **24/24 in Chromium and 24/24 in Firefox** ([regression/](regression/)).
- The ED-017 navigation suites (1 280 + 171 checks) are Chromium-only tools and passed in Chromium.
