# ED-021 implementation

## Result and scope

The useState counter now restores a browser-local draft, saves edits after 500 ms, displays revision-aware progress and save failures, and provides three sequential hints plus an explicitly revealed explained reference. No dependency or package/lockfile change was needed. The article, curriculum, navigation, preferences, preview runtime, protocol, CSP and host policies retain their existing architecture.

ED-020 was explicitly authorized for a separate commit (`5d3ab5b`). The final-audit follow-up explicitly authorizes committing only ED-021 files. No push, merge or deployment occurred. The pre-existing `next-env.d.ts` edit is preserved byte-for-byte after build generation; ED-015 article files are untouched.

## Exact source inventory

Modified source files
src/app/practice/react/use-state-counter/page.test.ts
src/components/lab/challenge-page.tsx
src/components/lab/grading-results.test.ts
src/components/lab/grading-results.tsx
src/components/lab/lab.module.css
src/components/lab/lazy-boundary.test.ts
src/components/lab/practice-workspace-loader.tsx
src/components/lab/practice-workspace.tsx
src/components/lab/prototype-notice.tsx
src/content/labs/react/use-state-counter.ts
src/lib/lab/grading.ts
src/lib/lab/types.ts

New source files
src/components/lab/learning-progress.test.ts
src/components/lab/learning-progress.tsx
src/components/lab/use-challenge-progress.ts
src/content/labs/react/use-state-counter-solution.ts
src/lib/lab/progress.test.ts
src/lib/lab/progress.ts
src/lib/storage/challenge-progress.test.ts
src/lib/storage/challenge-progress.ts

Documentation/evidence
docs/ed-021/ (authored docs and reusable scripts only; see commit-files.txt)

Preserved unrelated change
next-env.d.ts (restored from pre-build byte copy)

The final audit compared all 336 original source files with the pre-edit hash baseline: 12 deliberately modified, 324 unchanged, eight new. `commit-files.txt` lists exactly the source, tests, authored documentation and reusable scripts selected for the ED-021 commit. Generated QA reports, logs, screenshots, hash snapshots and build outputs are excluded and retained locally. The pre-existing `next-env.d.ts` modification is excluded.

## Integration decisions

- The pure model validates data and owns transitions; the storage coordinator owns the save lease, expected head, debounce, errors and clear generation; the hook wires browser lifecycle events. This avoids persistence inside the editor or preview runtime.
- The page-local coordinator is an external React store; it starts after hydration. The editor initially mounts from the restored text, keeping SSR deterministic. The loader key includes challenge, grading and starter revisions so state cannot be reused across them.
- Run and grading each capture an immutable source snapshot. Only explicit Run/Run Tests forwards the editor source; initial preview source is always the trusted metadata starter. Old/edited grading jobs are discarded before their result can affect progress.
- The summary labels historical completion separately from the current draft's last verification, best current-revision score, saved time and assistance. The idle live-results panel asks for a fresh check rather than contradicting restored verification history.
- Reset Code updates CodeMirror through one normal replacement transaction, retaining undo and completion/assistance history. Clear Progress confirms permanent removal and remounts editor/support state only after its marker write succeeds. Undo then cannot restore cleared code.
- Hints render a trusted prefix and advance one at a time. The separate solution module is dynamically imported after a warning and second explicit action, displayed as escaped text, and copied only on request. It never applies to the editor or awards completion. Generation guards reject late imports after clear/load/dispose.
- Retry does not resolve a changed stored head. Explicit Load saved draft confirms before discarding unsaved edits; Save this draft instead confirms replacement. Quota, disabled APIs, size and future-schema failures retain in-memory text. Even simultaneous storage/lease denial followed by recovery preserves edits.

## Tests and evidence

New pure model, coordinator and support-view tests cover strict schemas, version reconciliation, progress/history, debounce, lifecycle flush, ownership, failures, recovery, hints, solution and Reset/Clear distinctions. Existing route/lazy-boundary tests verify the moved hints and browser-only copy without making ordinary reading routes import Practice code. Browser runners are repository-local scripts using the existing external Playwright cache, not a new app dependency.

Copied ED-020 runners write only ED-021 evidence. Their storage allowlist includes the intentional new progress key. The inherited reopening assertion now expects restored source with an inert starter preview; the Firefox finite-probe calibration remains as in ED-020. Original ED-020 reports and runners are unchanged. See [verification.md](verification.md) for executed checks and limits, [persistence.md](persistence.md) for the exact schema and conflict rules, and [performance.md](performance.md) for measurements.

## Release limits and next milestone

This is local browser educational progress, not tamper-proof certification or device sync. Missing Web Locks disables saving visibly; process termination can lose an edit that has not reached the debounce or a supported lifecycle event. A clear marker intentionally retains no source/history, while other open tabs retain their unsaved memory until explicitly discarded.

ED-019's production dedicated-host/origin/header verification and Safari/WebKit remain release blockers; physical devices and assistive technologies are unverified. No production path was added. Recommend ED-022 address those release blockers and browser coverage before expanding challenge types or adding richer learning features.
