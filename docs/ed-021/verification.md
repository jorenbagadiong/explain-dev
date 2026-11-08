# ED-021 verification

## Commands actually executed

Baseline after the authorized ED-020 commit: `yarn lint`, `yarn typecheck`, `yarn test` (2,058 tests), and `yarn build` all passed; the retained baseline logs show their output.

Final source: `yarn lint` passed with zero warnings, `yarn typecheck` passed, `yarn test` passed **2,119 tests in 40 files**, and `yarn build` passed with all static routes generated. Final-audit command logs are retained at `/tmp/explain-dev-ed021-final-audit/{lint,typecheck,tests,build}.log` and are excluded from the commit. Yarn's sandbox cache/global-folder notices are environmental and did not fail the commands. No dependency installation occurred.

The final production server was tested locally at `http://localhost:3118`. The final audit reran persistence, grading, protocol and editor/security suites in both engines. The curriculum and navigation rows retain the prior ED-021 implementation runs; those routes did not change during this audit. The preview runtime/protocol/security configuration stayed unchanged. No claims are made for an unexecuted deployed-host test.

## Executed browser matrix

| Suite | Chromium 156.0.8078.4 | Firefox 157.0 | Evidence |
| --- | ---: | ---: | --- |
| Final reliability: locks, storage exceptions, status and closing owner | 20/20 | 20/20 | `<engine>/audit-report.json` |
| ED-021 persistence and assistance | 73/73 | 73/73 | `<engine>/progress-report.json` |
| Seven-test grading and isolation fixtures | 99/99 | 99/99 | `regression/<engine>-fallback/grading-report.json` |
| Private protocol, forged/stale/markup/deadline/version | 10/10 | 10/10 | `regression/protocol-<engine>.json` |
| Security/editor/error/theme/responsive matrix (development fallback) | 147/147 | 144/144 | `regression/matrix/<engine>-fallback/report.json` |
| Curriculum / 119 lesson routes / eight groups / three learning modes / preferences | 24/24 | 24/24 | `regression/curriculum-<engine>.json` |
| Sidebar branches, desktop/mobile navigation and history | 171/171 | not rerun separately | `regression/ed017/branch-verification.json` |

All reports have zero failed assertions and zero collected unexpected errors. Suite counts are assertions, not numbers of independent users or scenarios. Firefox's inherited finite-probe calibration differs from Chromium as documented in ED-020. The security runs use the same-origin development fallback, not a deployed dedicated host. No sandbox, protocol or CSP restriction was weakened.

## What was checked

- Debounced edit → refresh → restore; refresh before debounce; immediate SPA navigation and return; empty source; 50,000-unit accepted / 50,001 rejected without overwriting.
- Real iframe init messages contain the trusted starter and never restored learner source. Restored code and completed solution do not execute or auto-reveal on return; explicit Run/Run Tests remains required.
- Reset remains one undoable transaction. Clear cancellation does nothing; confirmed Clear removes all learning data, resets undo and retains only an empty tombstone.
- Progressive keyboard hints retain their ordered prefix across refresh. View reference first warns, reveal preserves the editor, copy does not apply code, and reference viewing alone cannot complete a challenge. The explained reference passes all seven behavioral tests after explicit grading.
- All-seven completion saves immediately and survives refresh; edits invalidate current verification while preserving historical completion/best. Partial failure cannot claim a current pass or erase history. Old grading/starter revisions preserve source without claiming current completion.
- Corrupt/future JSON, quota and disabled storage behave visibly and recover without losing the editor. Real same-origin tabs exercise first-owner lease, blocked follower, changed-head conflicts, explicit reload/replacement and Clear's stale-resurrection guard.
- 320, 375, 768, 1024 and 1440 CSS-pixel viewports, both themes and both engines: no page overflow, keyboard hint operation with visible focus, minimum 44-pixel support-action height, origin-local keys. Four full-page screenshots per engine capture 375/1440 light/dark; representative mobile screenshot was visually inspected.
- Existing grading fixtures cover constant/stateful/partial/wrong/missing/misleading/slow/error/nonresponsive programs, repeated isolated reruns and feedback safety. Security regressions cover blocked network/storage/parent access, message boundaries, errors, editor/undo, navigation and theme. Retained reports provide the exact checks.

New unit tests cover strict keys/types/ISO dates/bounds, challenge separation, corrupt/future schemas, contract fingerprint/revisions, pure transitions/history, debounce/flush/disposal, StrictMode lease cleanup, lock conflicts, storage recovery (including simultaneous API denial), failed explicit reloads, overflow, generation guards for late solution imports and Reset versus Clear. Support-view SSR tests keep hints/reference hidden until explicitly revealed.

## Preservation and acceptance

`source-preservation.json` records 336 baseline source hashes: 324 unchanged, 12 intentional ED-021 edits, eight new source/test modules and no unexpected source changes. ED-015 article/reading code, preferences, runtime, protocol, host scripts/policies and original ED-018/019/020 documentation are unchanged. The unrelated `next-env.d.ts` change is restored byte-for-byte from its initial copy after builds.

ED-021's implementation acceptance criteria are satisfied within the tested browser matrix. The later Final Audit and Commit request explicitly supersedes the earlier no-commit restriction for ED-021 only; no push, merge or deployment is performed. Local source/progress privacy, no new services/dependencies, deterministic conflicts, confirmed clear and inert restoration are implemented and verified.

## Unverified and release blockers

Safari/WebKit is unavailable in this environment; no Safari/WebKit pass is claimed. Physical-device and screen-reader/assistive-technology testing has not occurred. The ED-019 dedicated production preview host, deployment origin separation and deployed headers/CSP still require release validation; no production deployment was performed. Client-side feedback is not tamper-proof certification. Unsupported Web Locks visibly disables saving. Browser termination without lifecycle delivery can lose pending debounced edits. These limitations remain documented; implementation-complete does not mean production release approval.

## Final audit scope

No product defect was verified. Three targeted unit regressions were added for pending status after a successful save, failed writes restoring only the last successful revision, and owner close with a pending debounce. A new browser audit exercises absent/rejected Web Locks, throwing reads/writes, accessible unsaved status, explicit recovery, a clock-controlled pending-state check, pagehide/close handover, cancelled reload and confirmed replacement. An initial Firefox harness failure inspected the DOM in an input-event microtask before React committed; the corrected test controls the debounce clock and waits for rendering. It passes in both engines without an application change. Browser pagehide is dispatched by the focused handover harness before closing the owner; the full persistence suite separately verifies real refresh and SPA navigation lifecycle flushes.

`commit-files.txt` is the exact commit allowlist. Only authored documentation, source/tests and reusable runners are committed. Generated reports/logs/screenshots and snapshots mentioned here are local audit evidence, excluded as requested. No generated Next/runtime/host files or unrelated ED-015/ED-019 documentation is included. See `final-audit.md` for the reliability findings, reproduction commands and final Git separation.
