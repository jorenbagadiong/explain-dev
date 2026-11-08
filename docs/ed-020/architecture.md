# ED-020 grading architecture

## Audit and scope

Branch `main`, baseline `d38b295` (ED-015), with ED-018 `6b629eb` and ED-019 `d728f77` already committed. The only pre-existing dirty file was `next-env.d.ts`; its exact contents are preserved. No commit, push, merge or deployment. ED-018/019 documentation and sandbox policy remain unchanged. `baseline-git-status.txt`, `baseline-commit.txt` and the source hashes in `baseline-assets.json` record the starting state. Baseline: 2,024 tests and production build passed. A sandbox-denied port in the first baseline test run required rerunning with permission for the existing host integration tests.

ED-018 supplies the CodeMirror editor, Sucrase/Acorn compiler, guarded module factory and sandbox runtime. ED-019 supplies the configurable dedicated host, strict opaque-origin sandbox, network policy, versioned session/run-bound MessagePort, message caps/flood limit, watchdogs and disposal. ED-020 extends those components; it does not add an execution engine, dependency, backend, storage or authentication.

## Boundary

```
Practice workspace (trusted app)
  editor + visible PreviewFrame (existing, unchanged during grading)
  Run Tests → immutable source snapshot, monotonically increasing grading run ID
    → disposable PreviewFrame using exactly the existing source, sandbox and handshake
       isolated preview (opaque origin, same ED-019 CSP)
         compile once, load the guarded factory once
         for each test: evaluate a fresh module, mount a fresh React root,
           await React.act(render / click / cleanup), inspect actual DOM
         return bounded results on private MessagePort
    ← schema/session/run/challenge validation → text-only results panel
  remove grading frame on completion/error/timeout/edit/Reset/new run/navigation
```

A separate disposable frame, rather than another root in the visible document, prevents learner module globals, timers, styles, event listeners and React test scheduling from modifying the interactive preview. This is the same PreviewFrame component and runtime, with an optional supported grading challenge in init. No second unsafe executor, parent imports, eval or new Function. The offscreen grading frame has a layout viewport so DOM geometry works; its parent is inert and aria-hidden, and the iframe is removed from tab order. A grading-only parent blur listener also returns iframe focus to the latest focused app control: browsers can focus inner autofocus nodes despite inert on the iframe container. A learner autofocus fixture checks that tests retain focus on the control. These listeners are removed on disposal.

## Model and definitions

`src/lib/lab/grading.ts` contains the stable challenge ID, seven ordered requirements/action sequences, statuses (`passed`, `failed`, `error`, `timeout`), result types, limits and result validator. Requirements are shared with the challenge's visible checklist. The parent displays canonical titles; the preview cannot replace them.

`src/lab-runtime/counter-grader.ts` contains the small execution runner. It never reads source strings. Each test begins from a fresh factory/module evaluation and React root at zero, then applies its own deterministic sequence. Module globals are not shared across tests. The browser fixtures include a module-level store to exercise this. The suite requires no browser test framework or extra library: React's existing development `act` implementation is used inside the sandbox only.

The readable display is either one `Count: <integer>` text value (nested markup supported), or a status/output named Count with an integer value. Actions use exactly one visible, enabled control with accessible name Increment, Decrement or Reset. Labels, aria-label and aria-labelledby are supported; buttons may contain different visible icons/text. IDs, tags around the count and variable names are not prescribed. Full accessible-name computation for arbitrary widgets is not implemented; this is a deliberately small counter contract.

## React updates and failure handling

Each render, click and unmount is wrapped in `await act(async () => ...)`, following [React's act guidance](https://react.dev/reference/react/act). Assertions run after React flushes the interaction. Empty suspended roots wait on a MutationObserver for committed DOM, bounded by a 1,500 ms test deadline; no guessed sleep is used by the grader. The first unresponsive test aborts the remaining tests as timeouts rather than running overlapping act scopes. Compilation errors return before loading learner code or running any test. Render/module/event failures are captured as per-test errors and escaped feedback; loop guards still close the frame.

Asynchronous behavior that never settles, deliberate hangs, resource exhaustion and malicious code cannot be made safe by this runner. Parent hello/render/heartbeat watchdogs remain, with a 12 s grading deadline after connection even if heartbeats continue. Timers, observers, ports and listeners are cleaned up or destroyed with the disposable browsing context. Browser/process scheduling can delay any watchdog; the ED-019 CPU/memory limits still apply.

## Protocol and stale work

Protocol **v3** adds only optional `gradingChallengeId` on init and `grading-result`. Version v2 hosts fail closed. A result must contain the supported challenge ID, matching positive safe-integer run ID, exactly seven canonical test IDs in order (no duplicates/extras), enumerated statuses, nonempty feedback ≤500 characters per test, finite bounded durations and completion consistent with every status. The existing source, origin, private port, UUID session, exact-key validation and 50-message flood limit are reused. Ordinary previews reject grading-result messages. See [MDN's postMessage security guidance](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).

Each grading click captures current code without touching editor history or the visible run. Changing code immediately invalidates the active grading ID and removes its frame/results. Run, Reset and a newer Run Tests do the same. The event callback also checks the active grading ID, and frame cleanup closes its port. Because parent frame-src violation events do not identify their iframe, the workspace assigns those notifications to the grading run and retains that ownership after disposal until an explicit ordinary-preview Run/focus. This also discards Firefox reports delivered after the grading frame is gone. The independent visible frame keeps its load/heartbeat monitors and runtime link guard. Attribution is limited: a direct timer-driven navigation from an unfocused existing visible preview in that interval remains CSP-blocked but may not show its own diagnostic. Simultaneous navigation attempts cannot be precisely attributed by that document-wide event. Theme changes do not invalidate code/results. There is no localStorage/sessionStorage grading key or completion persistence.

## Trust and release constraints

The preview shares a realm with learner code. Schema checks bound and safely display its messages; they cannot establish that its claims are true. Client-side grading is educational feedback, **not tamper-proof certification or high-stakes assessment**. This limitation is visible in the UI.

No CSP, sandbox flags, origin policy, networking capability or host fallback selection was relaxed. A dedicated host still fails closed if down or incompatible. The existing same-origin fallback remains available for development when no origin is configured, with ED-019's weaker process isolation; it is not a production-safe release decision. The separate production host/origins, deployed header verification, Safari/WebKit coverage and physical-device review remain release blockers. No public deployment was enabled or performed, and none of those blockers is claimed resolved.
