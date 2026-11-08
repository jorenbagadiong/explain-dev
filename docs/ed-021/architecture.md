# ED-021 architecture

## Baseline and boundaries

Branch `main`. ED-015 `d38b295` and ED-019 `d728f77` were already committed. The user explicitly requested committing ED-020 before starting ED-021: it was committed as **5d3ab5b**, excluding the pre-existing `next-env.d.ts` edit. The final-audit follow-up authorizes a separate ED-021 commit; no push, merge or deployment is authorized or performed. No conflicts were found. Baseline logs and `baseline-source.json` record the starting point; lint, typecheck, 2,058 tests and production build passed.

ED-018/019/020 architecture and implementation were reviewed: client-only CodeMirror workspace, trusted static starter, compiler and actual behavioral grading exclusively in opaque sandboxed frames, protocol v3 private MessagePort/session/run validation, dedicated-host selection and development fallback. None of those security policies, runtime modules, host configuration or protocol shapes are changed by ED-021. Existing preferences use their own strict `explain-dev:v1:preferences` schema; that utility and key remain untouched.

## Small separation of responsibilities

- `src/lib/lab/progress.ts`: typed v1 records, bounded decoding, pure progress transitions and challenge revision reconciliation.
- `src/lib/storage/challenge-progress.ts`: one page-local coordinator, debounce, synchronous flush, exclusive save lease, head comparisons, error/conflict handling and clear marker.
- `src/components/lab/use-challenge-progress.ts`: React subscription and browser lifecycle/storage-event adapter. Construction/SSR touches no browser storage. The editor mounts only after the initial restore/lease attempt finishes.
- `LearningProgress`: compact progress summary, save/error controls, ordered hints, explicitly revealed reference text and clipboard feedback. Save status is also visible by the editor toolbar.
- Counter metadata supplies stable ID, grading/starter revisions and three trusted hints. A separate solution module is dynamically imported only after the reveal warning is confirmed.

The current draft has a single owner in memory: the coordinator snapshot. The editor subscribes to it. The existing preview run and disposable grading job retain their separate immutable source snapshots. Restoring source never sets a preview run. The initial preview receives only the trusted static starter from metadata, not persisted text; Run and Run Tests explicitly capture the draft when clicked. Browser tests inspect the real init payload in both engines.

No new Context/store library, package, backend, analytics or storage framework. The coordinator exists to make unload saving and cross-tab ownership testable independently from React.

## Persistence lifecycle and concurrency

Edits notify the editor immediately and debounce writes for 500 ms. Grading attempts/results, hint reveals, solution reveals and Reset Code save immediately. Visibility-hidden, pagehide and React unmount flush synchronously while a previously acquired exclusive Web Lock is held. No asynchronous unload write is required. Pagehide releases the lease; pageshow retries acquisition. See [Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API), [storage events](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event) and [pagehide limitations](https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event).

One open challenge tab owns saving. Secondary tabs can keep local edits but cannot write while the owner is open. They show a save failure and instructions to close the owning challenge tab and retry. A storage event does not replace the editor. After ownership becomes available, a changed stored head remains a conflict until the learner chooses Load saved draft or confirms Save this draft instead. Every write also compares the stored raw head under the lease. This policy does not order drafts by wall clocks or silently pick a winner. Browser locks are cooperative; developer tools or unrelated same-origin scripts are outside this trust guarantee.

If Web Locks are unavailable, there is no unsafe unlocked-write fallback: source can be edited/run in memory, but saving clearly fails. Disabled storage, quota, oversized input and unknown formats do not silently destroy the buffer. Recovery preserves edits even if both the lease API and storage were initially denied. Failed explicit reloads of incompatible/corrupt data keep the current buffer.

Clear Progress needs confirmation. It writes a data-free tombstone and resets learning state, the editor and undo history. The tombstone prevents an older open tab from mistaking cleared data for an unchanged empty slot. Other tabs' unsaved in-memory buffers are not erased; they cannot resurrect them silently. Reset Code instead restores the current starter as one undoable editor transaction and keeps completion, best score and assistance history.

## Evidence and learning state

Challenge status is derived rather than redundantly stored. First visit is Not Started. Editing, grading, hints or reference viewing starts progress. Only a validated complete seven-test result for the current source/revision earns completion. Historical completion survives edits, partial failures and Reset; current-draft verification is cleared on edits and replaced by a new grading summary. The UI says Last verified, not that saved code was freshly executed on restore. Full live results are not persisted; the idle panel asks for a fresh check.

A changed grading revision invalidates best/current verification, retaining the draft and historical completed revision. Changed starter metadata never overwrites a draft; Reset explicitly selects the latest starter. A contract fingerprint test forces review when the required seven behavioral sequences change. Grader/interaction changes also require an intentional revision bump.

Hints render only the first revealed count and reveal one additional hint per action. Three curated hints progress from remembering values, through state-driven rendering, to functional updates. The reference is separate trusted text with explanations for useState, updater functions, event handlers and rerendering. Viewing/copying never applies it to the editor or completes the challenge. Delayed reference imports carry a generation check so a reveal started before Clear/reload/disposal cannot restore cleared progress.

## Privacy and release status

Only learner-facing source/progress plus schema/revision coordination metadata is stored, per challenge and origin. No frame capabilities, run/session IDs, MessagePorts, full test transcripts or privileged runtime objects are persisted. Stored source is inert text; CodeMirror highlighting and reference text display do not execute it. There is no backend or external tracking, and no device synchronization.

Client-side progress and grading are editable educational feedback, not tamper-proof certification. ED-019's undeployed dedicated production host/origin/header verification, Safari/WebKit and physical-device coverage remain release blockers. The weaker same-origin development fallback and existing resource/CSP-diagnostic limits are unchanged. ED-021 introduces no deployment path.
