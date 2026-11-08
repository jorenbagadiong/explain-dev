# ED-022 verification

## Baseline and final commands

Baseline at clean `main` / `aefb368`: `yarn lint`, `yarn typecheck`, `yarn test` (2,119 tests in 40 files) and `yarn build` passed. Final: all four commands pass; **2,151 tests in 43 files**, lint zero warnings, complete static production build including the four added challenge routes. `next-env.d.ts` was restored byte-for-byte before final typecheck. `git diff --check` passes. Logs are the corresponding `baseline-*.log` and `{lint,typecheck,tests,build}.log` files here. Yarn cache/global-folder notices are environmental, not lint warnings. No dependency installation occurred.

New unit coverage: six controlled timer-scheduler tests, 11 multi-challenge contract/reference/progress tests, six shared content/results/SSR tests, an ordinary-lesson prefetch boundary regression and the existing registry tests expanded to four more challenges. Existing storage, compiler, protocol, host-policy, lesson and navigation tests remain enabled. A positive-handle assertion failed on the initial scheduler (`positive-handle-before.log`), then passed after native handle reservation.

## Browser matrix actually executed

Local production server `http://localhost:3118`, headless Chromium 156.0.8078.4 and Firefox 157.0. No deployment.

| Suite | Chromium | Firefox | Evidence |
| --- | ---: | ---: | --- |
| Five-challenge adversarial grading | 60/60 | 60/60 | `<engine>/final-grading.json` |
| Five-challenge UI / persistence / assistance / responsive themes | 136/136 | 136/136 | `<engine>/experience.json` |
| Five-challenge private protocol, foreign/stale results and navigation | 65/65 | 65/65 | `regression/protocol-<engine>.json` |
| Original Counter grading/isolation/editor regression | 99/99 | 99/99 | `regression/<engine>-fallback/grading-report.json` |
| Sandbox/network/error/editor matrix, development fallback | 147/147 | 144/144 | `regression/matrix/<engine>-fallback/report.json` |
| 119 React lessons, eight groups, three modes and preferences | 24/24 | 24/24 | `regression/curriculum-<engine>.json` |
| Sidebar/mobile/history branches | 171/171 | covered by shared UI/navigation suites, no separate 171-check rerun | `regression/ed017/branch-verification.json` |

All listed runs completed with zero failed assertions/unexpected collected errors. Counts represent assertions/program fixtures, not independent users. The all-five grading/UI/protocol runs and navigation were completed on the final build, after the positive-handle fix and Practice-prefetch adjustment. Counter/security/curriculum suites were executed before those final narrowly scoped changes; the scheduler is installed only for Cleanup grading and security policy stayed unchanged. No dedicated-host ED-022 browser run is claimed. The inherited fallback matrix skips its dedicated-host-only compromised-host subsection; the separate 65-check protocol suite covers the actual current parent component and all five challenge IDs.

## Grading and lifecycle results

17 valid reference/alternative programs pass per engine; 43 broken/error/timeout programs never complete. Multiple state/reducer/class implementations are accepted. All five references also pass their seven tests through the real editor UI. Native interactive previews are explicitly run and exercised: Counter increments, Name input changes Greeting, fruit search filters, details mount/unmount, and real interval ticks occur.

Cleanup was designed and validated while unpublished (six unit tests, 14 browser fixtures per engine), then published. Final tests include positive native-handle compatibility. `cleanup-evidence.json` per engine shows a mounted-flag leak passing setup/ticks/cadence but failing unmount/no-lingering/remount/repeated-cycles with “Unmount left 1 live interval(s).” Missing visible updates after unmount is not accepted as cleanup. Correct effect, reducer, class, shared-cancellation and positive-handle solutions pass. See grading.md for every test and its limits.

## Persistence and support UI

For each of the five IDs: initial Not Started with no default write; rapid edit → SPA navigation → index In Progress → restore; edit → immediate refresh → latest text; real iframe init inspected to exclude saved source; hint prefix persists; warning precedes the matching reference; reveal/copy preserve editor and cannot complete; explicit all-seven grading persists revision completion; editing/refresh retains historical completion and clears current verification; Reset is one undoable transaction; cancelled Clear changes nothing; confirmed Clear removes only that challenge's data; other challenge keys remain byte-identical; index returns to Not Started.

The unchanged ED-021 coordinator's unit tests retain debounce, lifecycle flush, disabled storage, quota, unsupported locks, ownership, conflict, corrupt/future format, size, overflow and recovery coverage. Per-ID schema and revision tests additionally reject cross-challenge data and invalidate either changed content or changed grading revisions. This milestone adds no unsafe storage fallback.

## Layout, keyboard and screenshots

Every challenge in both engines: 320, 375, 768, 1024 and 1440 CSS-pixel widths, light/dark themes, keyboard hint operation with visible focus, correct theme, no page horizontal overflow, one editor/interactive frame, and parent-DOM/storage denial in an opaque allow-scripts-only sandbox with WebRTC constructors removed. Forty full-page screenshots (five challenges × two widths × two themes × two engines) are stored as `<engine>/react-<slug>-{375,1440}-{dark,light}.png`. Representative desktop/light Controlled Input and mobile/dark Cleanup captures were visually reviewed. Full-page automation captures may place sticky navigation mid-image or omit offscreen iframe compositor content; native preview behavior is independently asserted in the live browser.

## Security and preservation

Compiler/execution remains in the sandbox; CSP, sandbox tokens, host policies, module allowlist, source limits, private-port/session/run validation, guard/watchdog limits and origin checks are preserved. Protocol v4 fails closed against old hosts. The canary matrix records zero canary/STUN/sentinel exfiltration and no unexpected external client requests for its finite tested vector set. This does not prove all networking mechanisms blocked.

`preservation.json` compares 344 source hashes: 329 unchanged, 15 intentional ED-022 edits, 21 new source modules/routes/tests. ED-015 article/visual files, preference storage, ED-021 persistence implementation/schema, compiler, security policies, dependencies and original milestone documents are unchanged. The one deliberate navigation edit is only `prefetch={false}` on Practice. Initial next-env bytes are preserved; no staging, commit, push, merge or deployment.

## Limits

Safari/WebKit, physical devices and assistive technologies are unverified. Dedicated production preview hosting, deployed origin separation and CSP/header validation remain release blockers. The same-origin fallback can freeze Firefox for uninstrumented blocking built-ins; the finite calibrated resource probes do not prove CPU isolation. Types in learner source are stripped, not checked. Finite client-side educational tests cannot prove arbitrary correctness, prevent tampering or certify Hook usage. Interval grading does not cover arbitrary subscriptions/recursive timeouts or real background-timer precision. Web Locks unavailable means saving fails visibly; abrupt process termination can lose pending edits.

All 15 ED-022 implementation criteria are satisfied within the documented local test scope. This is implementation completion, not production release approval.
