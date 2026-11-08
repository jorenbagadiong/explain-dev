# ED-022 behavioral grading and cleanup evidence

The closed contract table is `src/lib/lab/grading.ts`; execution stays under `src/lab-runtime/`. Parent-side validation selects exact ordered test IDs by the claimed known challenge, rejects malformed/contradictory results, and PreviewFrame additionally binds them to the requested challenge, session and run. Protocol v4 uses the same private MessagePort, source/origin checks and bounds as before; v3 peers fail closed. No learner source executes in the parent. Counter's seven sequences remain unchanged.

Every independent test reevaluates the compiled factory and starts a fresh React root. Source is compiled once per fresh grading frame. Interaction updates are awaited with React act. Suspended roots wait for DOM readiness within the existing 1.5 s test deadline; a nonsettling test stops the rest of its suite. The parent retains its 12 s grading deadline and frame cleanup/watchdogs. Runtime errors are captured as errors, not mistaken for success. The interactive preview remains independent.

## Seven observations per challenge

| Challenge | Stable test IDs and observations |
| --- | --- |
| Counter | `initial-zero`, `increment`, `repeated-increment`, `decrement`, `reset`, `negative-values`, `combined-interactions`: preserved ED-020 mount/action/count sequences. |
| Controlled Input | `input-initial`: empty value; `greeting-initial`: default; `typing`: input retains Ada; `greeting-update`: Grace updates greeting; `clearing`: Lin → empty; `repeated-edits`: Ada → Alan → A → Mina; `empty-string`: empty → Zoe → empty → Sam → empty. Fresh initial conditions precede each sequence. |
| List Filtering | `all-items`: all seven in order; `query`: Ban; `case-insensitive`: B → bLuE; `partial`: ap → err; `empty-results`: zz → apple with correct empty-state removal; `clear-query`: gr → empty; `fresh-results`: a → cher → BAN → berry → ap → empty → xyz. Every query compares the complete visible list with the fixed dataset-derived expectation. |
| Conditional Rendering | `initial-hidden`: absent panel; `first-toggle`: one click; `second-toggle`: two; `repeated-toggle`: six; `dom-removal`: four; `button-accessibility`: three; `consistent-state`: nine. Check native enabled control, stable target, visible label, accurate expanded state, text and real mounting/removal at every step. |
| Cleanup | `effect-setup`: one 1,000 ms registration and zero; `mounted-ticks`: 1 then 3 ticks; `unmount-cleanup`: zero active after unmount; `no-lingering`: no callbacks through another 5,000 virtual ms; `remount`: fresh zero/one interval after remount; `repeated-cycles`: three additional mount/tick/unmount cycles; `interval-contract`: 999 ms → zero, +1 ms → one, +3,000 ms → four. |

These are observable contracts, not source-pattern checks. No Hook name, clearInterval spelling, variable name or literal source match is used by a grader.

## Cleanup instrumentation

The design was written in architecture.md before implementation. The first three new challenges were implemented first. The unpublished cleanup harness then passed six scheduler unit tests and 14 real sandbox fixtures per engine before its challenge content/route/reference were added.

`interval-probe.ts` replaces normal interval registration/cancellation only inside a disposable cleanup grading frame, before learner factory evaluation. Virtual handles map to callback, period and next due time in a private closure. A trusted controller advances time inside act and inspects active registrations/callback counts. Neither the controller nor snapshots are exposed as window properties, imports or learner capabilities. The existing heartbeat is created before installation and deadlines are captured from native APIs. clearTimeout can cancel an interval through the browser's shared timer-handle convention.

Returned handles reserve real positive native timeout IDs using an inert callback scheduled at the maximum signed-32-bit delay. Keeping that reservation avoids collisions with infrastructure IDs; cancellation/disposal clears it. An audit regression caught the earlier use of negative synthetic IDs, which could reject legitimate `id > 0` cleanup. The regression fails before the fix and passes after it. Final browser fixtures include that legitimate implementation.

Unmount checks inspect the active map *before* forced disposal. A fixture stops state updates using a mounted flag but leaves its interval running: setup/ticking may pass, while cleanup tests fail with the live-registration evidence. Absence of DOM updates cannot satisfy cleanup. Remount cycles reuse the same evaluated component/module, exposing module-global accumulation; independent tests use a new module. Disposal restores global descriptors and releases all remaining reservations. Registration and virtual callback caps prevent scheduler floods; existing execution guards/frame deadlines still apply.

Native timer cancellation semantics and React update flushing were checked against [MDN setInterval](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval) and [React act](https://react.dev/reference/react/act).

## Adversarial fixtures and limits

`tools/fixtures.cjs` and `verify-grading.cjs` enter source only into real opaque sandbox frames. Final suite: 60 programs per engine across five challenges. References plus reducer and class alternatives pass. Cleanup also accepts shared clearTimeout cancellation and a positive-handle check. Counter additionally retains the full 99-check historical grading/isolation suite per engine.

Incorrect fixtures include fixed/stale count or greeting, wrong empty greeting, unfiltered/case-sensitive/exact-only/stale fruit results, incorrect empty message, CSS-only panels, one-way toggles, incorrect aria-expanded, missing cleanup, a mounted-flag timer leak, duplicates, wrong cadence, stale closures and fixed ticks. Every challenge also has compile error, render error, event/timer error, guarded loop and suspended timeout fixtures. Expected incorrect programs never earn completion.

The 65-check protocol suite per engine covers all five pages: 13 malformed/spoofed results (including a schema-valid foreign challenge), escaped markup, stale/future run/session data, deadlines, version skew, and late completion after navigation to another challenge. Test results cannot migrate into another challenge's progress.

Limits: finite input/action probes cannot prove arbitrary future behavior or state ownership. An uncontrolled field or imperative implementation with indistinguishable observable behavior can pass. Hardcoding an entire known finite test mapping or tampering with the shared sandbox realm remains possible; this is educational feedback, not certification. The interval exercise does not validate recursive timeouts, arbitrary subscriptions, browser wall-clock precision or every effect/dependency pattern. Virtual time measures requested cadence and callback behavior, not background-tab scheduling.
