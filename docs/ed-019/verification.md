# ED-019 verification

Passing tests demonstrate the listed properties in the listed engines. They are **not** proof of complete isolation, and nothing was verified on a deployed host.

## Commands (final state, default fallback build)

| Command | Result | Log |
| --- | --- | --- |
| `yarn lint` | Pass | [lint.log](lint.log) |
| `yarn typecheck` | Pass | [typecheck.log](typecheck.log) |
| `yarn test` | **2 024 tests passed** (ED-018: 1 989) | [tests.log](tests.log) |
| `yarn build` | Pass, 125 route entries | [build.log](build.log) |
| `LAB_PARENT_ORIGINS=https://explain-dev.example yarn build:preview-host` | Pass (content-hashed runtime) | [build-preview-host.log](build-preview-host.log) |
| `node scripts/build-preview-host.mjs` without `LAB_PARENT_ORIGINS` | Fails as designed (exit 1) | — |
| `yarn dev:isolated` | Started; app `frame-src http://127.0.0.1:4100`, host `frame-ancestors http://localhost:3000`, preview rendered `Count: 0` in dedicated mode; stopped cleanly | — |

New unit and integration tests are in `src/lib/lab/preview-host.test.ts` (35 tests):

- origin validation (accepted forms; rejected `http` non-loopback, paths, trailing slash, wildcards, credentials, query, uppercase, `null`, `'self'`)
- CSP and headers, immutable caching only for the hashed runtime, preview.html rewriting
- the local host server: headers, 404 without redirect for `/`, `host.json`, traversal, encoded traversal, case, `/favicon.ico`; 405 for POST; request recording
- preview-target selection
- protocol version-skew detection
- `next.config.ts` in dedicated mode (Practice `frame-src`) and build failure on an invalid origin

Updated existing tests (made stronger, not weaker):

- `sandbox-config.test.ts` now also asserts the Practice `frame-src 'self'` rule.
- `protocol.test.ts`'s wrong-version case uses `LAB_PROTOCOL_VERSION + 1` instead of the literal `2`, which became the current version.

## Browser verification

| Suite | Engine / mode | Checks | Report |
| --- | --- | --- | --- |
| Cross-browser matrix | Chromium 156 dedicated | 161 / 161 | [matrix/chromium-dedicated/report.json](matrix/chromium-dedicated/report.json) |
| | Firefox 157 dedicated | 158 / 158 | [matrix/firefox-dedicated/report.json](matrix/firefox-dedicated/report.json) |
| | Chromium 156 fallback | 146 / 146 | [matrix/chromium-fallback/report.json](matrix/chromium-fallback/report.json) |
| | Firefox 157 fallback | 143 / 143 | [matrix/firefox-fallback/report.json](matrix/firefox-fallback/report.json) |
| | WebKit | **not run: blocked** | [cross-browser.md](cross-browser.md) |
| ED-018 lab suite (regression copy) | Chromium fallback | 158 / 158 | [regression/ed018-lab-verification.json](regression/ed018-lab-verification.json) |
| Curriculum: 119 lessons, 8 groups, 3 modes, preferences, console/hydration | Chromium / Firefox | 24 / 24, 24 / 24 | [regression/curriculum-chromium.json](regression/curriculum-chromium.json), [regression/curriculum-firefox.json](regression/curriculum-firefox.json) |
| ED-017 navigation: sidebar, drawer, active lesson, 5 widths × 2 themes | Chromium | 1 280 / 1 280 | [regression/ed017/browser-verification.json](regression/ed017/browser-verification.json) |
| ED-017 parent disclosures | Chromium | 171 / 171 | [regression/ed017/branch-verification.json](regression/ed017/branch-verification.json) |

One intended expectation was updated in the ED-018 suite copy. A link click inside the preview is now blocked and reported ("Links to other pages are disabled"), and the preview stays usable; ED-018 expected the preview to be torn down. Everything else in that suite is unchanged.

## Probes (evidence for design decisions)

| Probe | Finding | Log |
| --- | --- | --- |
| [navigation-controls-probe.cjs](tools/navigation-controls-probe.cjs) | Only the parent `frame-src` refuses all self-navigation vectors before a request (both engines); the Navigation API and meta removal do not help; the click guard blocks anchors | [navigation-controls-probe.log](navigation-controls-probe.log) |
| [navigation-api-opaque.cjs](tools/navigation-api-opaque.cjs) | Opaque-origin frames: `navigation.entries()` is empty and no `navigate` events fire (both engines) | [navigation-api-opaque.log](navigation-api-opaque.log) |
| [webrtc-probe.cjs](tools/webrtc-probe.cjs) | Chromium sends STUN from the sandbox; CSP `webrtc` is unrecognized; constructor removal gives 0 packets | [webrtc-probe.log](webrtc-probe.log) |
| [firefox-isolation-strategy.cjs](tools/firefox-isolation-strategy.cjs) | Firefox at its site-isolation default: dedicated host 52 ms parent gap vs fallback 3 650 ms; Playwright default 3 248 / 2 679 ms | [firefox-isolation-strategy.log](firefox-isolation-strategy.log) |
| [editor-focus-after-preview.cjs](tools/editor-focus-after-preview.cjs) | Firefox focus defect reproduced, then fixed | — |

## Phase 8–9 coverage (from the matrix, per engine)

- **Functional:**
  - The editor loads with the starter.
  - Edited code genuinely runs (counts 1, 2, 1, 0, −1), and edited text changes the preview.
  - Compile errors are recoverable; runtime, event and hooks errors are contained.
  - Reset with a single undo works.
  - Navigating away removes the preview (Chromium; skipped where the parent shares the thread).
  - Reopening gives a fresh session.
- **App:** the curriculum suite in both engines, and ED-017 navigation (desktop sidebar, mobile drawer, active-lesson highlighting) in Chromium. Theme switching reaches the preview without a re-run (ED-018 suite). Stored preferences are unchanged, and the lab adds no storage keys.
- **Accessibility and responsive:**
  - keyboard order Run → Reset → editor; Tab indents; Escape then Tab leaves; Ctrl/⌘+Enter runs
  - live status region; visible focus; reduced motion honored
  - mobile tabs with arrow keys and Home; edits kept across views
  - 320–1440 px × both themes: no overflow, 44 px targets, preview theme matches, no parent errors
- **Screenshots:** `matrix/<engine>-<mode>/screenshots/` (375 and 1440 px in both themes, plus the after-security state), and `regression/ed018-lab-screenshots/`.

## Not tested

- WebKit (blocked), real Safari (macOS/iOS), physical phones and tablets (touch was emulated in Chromium; Firefox ran without touch emulation).
- Screen readers and other assistive technology: semantics were checked; no assistive technology was run.
- A deployed preview host: Vercel Build Output was generated locally only.
- Firefox at its real-world isolation default for the full matrix: Playwright cannot inspect out-of-process frames there, so only the responsiveness probe ran with strategy 1.
