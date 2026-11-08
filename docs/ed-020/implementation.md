# ED-020 implementation

Only the existing Coding Lab and its tests are extended. No dependency, lockfile, security policy, lesson content, route, global style, preference schema or navigation implementation change. ED-018 and ED-019 documents are preserved.

## Files

New application/test files:

- `src/lib/lab/grading.ts`: typed seven-test definition, result model, limits and strict validation.
- `src/lib/lab/grading.test.ts`: malformed-result and grading protocol coverage.
- `src/lab-runtime/counter-grader.ts`: fresh factory/root per test, actual DOM interaction and React act, bounded execution and cleanup.
- `src/components/lab/grading-results.tsx`: compact text/icon result rows, summary, feedback, duration, retry and trust disclosure.
- `src/components/lab/grading-results.test.ts`: loading/error/timeout/pass/fail, canonical titles, announcements and escaped output.

Modified application/test files:

- `src/lib/lab/protocol.ts`: v3 grading init/result, existing exact envelope/session/run validation reused.
- `src/lib/lab/types.ts`: requirement comment now reflects behavioral grading.
- `src/lib/lab/challenges.test.ts`: ED-018's four-item checklist expectation updated to the full seven requirements.
- `src/content/labs/react/use-state-counter.ts`: stable ID shared with grading metadata, accessible interaction instructions, seven canonical requirements; starter code unchanged.
- `src/lab-runtime/main.ts`: invoke grading in grading-mode frames using the existing compiler/guarded factory; capture test exceptions and retain normal preview behavior.
- `src/components/lab/preview-frame.tsx`: supported grading init, mode-bound validated completion, grading deadline, same sandbox/host/watchdogs/disposal, hidden frame focus attributes.
- `src/components/lab/practice-workspace.tsx`: Run Tests, immutable grading jobs, immediate invalidation/cancellation, inert disposable frame, results. Preview Run/Reset/editor behavior retained.
- `src/components/lab/challenge-page.tsx`: pass challenge ID and replace the obsolete grading-unavailable copy.
- `src/components/lab/lab.module.css`: result rows and offscreen grading viewport only.
- `src/components/lab/lazy-boundary.test.ts`: additionally exclude results UI from ordinary article import graphs.
- `src/app/practice/react/use-state-counter/page.test.ts`: assert updated Run Tests instructions.

Created `docs/ed-020/`: five required documents, baseline/raw results/logs/screenshots, integrity fixtures and reproducible browser tools. `files.txt` inventories every evidence file. `git-status.txt` records final state. Existing historical suites were copied here with output paths redirected, v3 protocol fixtures, and the extra toolbar tab stop; original ED-018/019 tools/documents are not overwritten.

## Product behavior

Run Tests grades current editor content immediately, even when it has not been run in the interactive preview. It does not modify the source, undo history, preview run ID or counter state. Clicking again replaces the grading job; editing, Run or Reset discards old results and closes any active grading frame. Retry uses the current code. Code changes never leave an old completion visible.

Each result has an icon and text status, authoritative requirement title, observed/expected feedback and duration. The panel announces only a concise atomic summary, rather than every row, and reports running, compile/runtime error and timeout states. A completion message appears only for seven validated passing results. No completion or draft data is persisted.

## Verification-driven changes

- React can finish act without DOM output for an unresolved suspended root. Added MutationObserver readiness plus test deadline; no arbitrary sleep in the runner.
- Offscreen placement, tabindex and inert alone do not fully prevent inner autofocus in the tested browsers. Added a grading-only parent focus guard/restoration with cleanup, an inert parent, and an autofocus integrity fixture.
- The original challenge checklist had four requirements. It now uses all seven test titles, and its legacy registry test was updated explicitly.
- Grading exceptions are reported per test and their sandbox error/rejection events are prevented from becoming uncaught browser errors. Interactive-preview error handling is unchanged.
- Browser frame-src violations are document-wide. The workspace now nominates the grading frame as owner while tests run, so blocked test navigation cannot stop the unrelated visible preview; a two-browser attack fixture verifies its count remains at 2.
- Browser focus checks recognize both outlines and shadcn's existing focus-visible ring.

Deployment restrictions remain those documented in ED-019. Protocol v3 requires an updated host and app; old hosts fail closed, and no deployment was performed.
