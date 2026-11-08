# ED-018 verification

Passing tests demonstrate the specific properties listed here, in Chromium 156. They are **not** proof of complete sandbox security; see [security.md](security.md) for residual risks.

## Commands (final state)

| Command | Result | Log |
| --- | --- | --- |
| `yarn lint` | Pass (0 warnings) | [lint.log](lint.log) |
| `yarn typecheck` | Pass | [typecheck.log](typecheck.log) |
| `yarn test` | **34 files, 1 989 tests passed** (before ED-018: 25 files, 1 781 tests) | [tests.log](tests.log) |
| `yarn build` | Pass; preview runtime and 125 static route entries | [build.log](build.log) |

New unit and integration tests:

| File | Covers |
| --- | --- |
| `src/lib/lab/compiler.test.ts` | Starter compiles and runs; TS stripped without type checking; line preservation; syntax errors with line and column; parser errors; unsupported, dynamic and re-exported imports; `import.meta`, `require`, top-level await; reserved names; default export; size limit; guard stops `while`/`for`/`do`/`for-of`, catch-and-continue and microtask floods; no false positive for yielding work; semantics preserved (labels, concise arrows, classes, ASI) |
| `src/lab-runtime/execution-guard.test.ts` | Limit, reset on event-loop turn, sticky trip |
| `src/lib/lab/protocol.test.ts` | `allow-scripts` only; exact schemas; forged, extra-key, oversized and prototype-polluted messages rejected; diagnostics bounded |
| `src/lib/lab/diagnostics.test.ts` | Stack-line extraction (Chromium and Firefox formats, other URLs ignored), code frames, component stacks |
| `src/lib/lab/challenges.test.ts` | Unique stable IDs and slugs; lesson references exist and are available; no duplicated lesson title or route; route file exists; starter compiles and contains TODOs; counter requirements |
| `src/app/practice/page.test.ts`, `.../use-state-counter/page.test.ts` | Server markup, breadcrumbs, metadata, registry-resolved lesson link, instructions, requirements, hints, visible limitations, workspace props |
| `src/components/lab/sandbox-config.test.ts` | Header scope and CSP directives, no `unsafe-eval` or `allow-same-origin`; no inline script in `preview.html`; iframe attributes; session capabilities |
| `src/components/lab/lazy-boundary.test.ts` | Layout, home, `/practice` and all 121 frontend pages cannot statically reach lab modules or sandbox packages; workspace only via `next/dynamic` with `ssr: false` |
| `category-navigation.test.ts` (appended) | Practice link placement, `aria-current` page or location, no prefix collisions |

## Browser verification

Chromium 156.0.8078.4 (Playwright 1.64.1, full build in headless mode unless noted), production build served by `next start`.

| Suite | Checks | Result | Report |
| --- | --- | --- | --- |
| Coding Lab: behavior, errors, security, keyboard, mobile, 5 widths × 2 themes | 158 | 0 failures | [lab-verification.json](lab-verification.json), [tool](tools/verify-lab.cjs) |
| Regression: 119 lessons, 8 groups, learning modes, preferences, console and hydration | 24 | 0 failures | [regression-verification.json](regression-verification.json), [tool](tools/verify-regression.cjs) |
| ED-017 navigation re-run (unchanged checks, output redirected): 8 groups × 5 widths × 2 themes, drawer focus, active lesson, touch targets, overflow | 1 280 | 0 failures | [ed017-regression/browser-verification.json](ed017-regression/browser-verification.json) |
| ED-017 parent disclosure re-run | 171 | 0 failures | [ed017-regression/branch-verification.json](ed017-regression/branch-verification.json) |
| Disposal positive control | — | Hung renderer about 1.5 s CPU per 1.5 s; 0 after removal | [disposal-control.log](disposal-control.log) |
| Process isolation comparison (full Chromium vs headless shell) | — | Parent gap 55 ms vs 1 512 ms during a bounded 1.5 s hang | [process-isolation-comparison.log](process-isolation-comparison.log) |
| Pre-implementation isolation probe (same-origin and cross-site) | — | See [security.md](security.md) | [isolation-probe-chromium.json](isolation-probe-chromium.json) |

Highlights from the lab suite:

- **Learner edits genuinely change the preview.** The starter shows `Count: 0` and its TODO buttons do nothing. The typed solution counts `1, 2, 1, 0, -1` across Increment, Increment, Decrement, Reset, Decrement. Renaming the label shows `Clicks: 0`. On mobile, edited code shows `Mobile: 0`, then `Mobile: 1` after a tap.
- **Reset** restores the starter, re-runs it, and one undo restores exactly the replaced code.
- **Errors are recoverable:**
  - Compile errors show line and column with a code frame.
  - Runtime, event-handler and Rules of Hooks errors show meaningful messages, the source line and a component stack.
  - The parent never crashes and has no uncaught errors.
- **Security:** every attack in the [security table](security.md#verified-properties-chromium-156) was blocked. The canary received only the two deliberate navigation requests.
- **Keyboard:**
  - Tab goes Run → Reset → editor.
  - Tab indents inside the editor; Escape then Tab leaves it.
  - Ctrl/⌘+Enter runs.
  - Focus is visible.
  - Mobile tabs respond to the arrow keys and Home.
- **Navigation:**
  - Practice is `aria-current="page"` on `/practice` and `"location"` on the challenge.
  - Leaving the page removes the preview.
  - Returning starts fresh, because drafts are not persisted (by design).
- **Responsive and themes:**
  - At 320, 375, 768, 1024 and 1440 px in dark and light, there is no horizontal page overflow, no hydration warnings, and toolbar buttons are at least 44 px.
  - Pages under 1024 px use tabs; wider pages show both panels.
  - The preview theme matches the app, and live theme changes reach the running preview without a re-run.
- **Reduced motion:** all contexts ran with `prefers-reduced-motion: reduce`. Spinners use `motion-reduce:animate-none`, and the global reduced-motion rule applies.

## Screenshots

[screenshots/](screenshots/):

- **Challenge page:** `challenge-{320,375,768,1024,1440}-{dark,light}.png`. Mobile captures are viewport-sized; wider ones are full-page, where the sticky header can appear mid-image (a capture artifact).
- **Practice index:** `practice-{375,1440}-{dark,light}.png`.
- **States:** `edited-preview`, `compile-error`, `runtime-error` and `loop-stopped` at 1440 dark.

## Not tested

- Firefox, Safari/WebKit and Chromium-based browsers other than Chromium 156.
- Real phones and tablets: touch was emulated with `hasTouch`.
- Screen readers: semantics were verified (roles, names, live status region, tab pattern), but no assistive technology was run.
- Vercel deployment: nothing was deployed. Header behavior on Vercel follows `next.config.ts` `headers()` but was verified only with `next start`.
- Throttled CPU or network, and long-running sessions beyond 15 consecutive runs.
