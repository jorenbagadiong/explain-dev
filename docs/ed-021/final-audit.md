# ED-021 final reliability and commit audit

## Git separation

Audit starts on `main` at ED-020 `5d3ab5bfa7bf270cd228bc5426c864404bd9881a`. The index was empty. ED-015 is committed as `d38b295`, ED-019 as `d728f77`. Twelve tracked source/test changes and eight new source/test modules belong to ED-021. The only unrelated tracked modification is generated `next-env.d.ts`; its initial bytes were snapshotted and restored after the required production build. No reset, stash, clean, merge, push or deployment was used.

The exact proposed commit allowlist is [commit-files.txt](commit-files.txt): 35 paths, comprising 20 source/test files and 15 authored ED-021 documentation/reusable runner files. The commit message is `feat(practice): persist drafts and learning progress (ED-021)`. Generated QA logs, screenshots, JSON reports, build products, hash snapshots and status inventories are retained locally and excluded. Original ED-018/019/020 documentation and runners are excluded. No package, lockfile, navigation, article, preference, runtime/protocol/CSP/host-policy file is included.

Audit-time unrelated bytes and worktree hashes are retained in `/tmp/explain-dev-ed021-final-audit/`. Pre-edit source hashes additionally confirm 324 of 336 original source files unchanged; the other 12 are precisely the reviewed ED-021 integration/test edits. The source additions are named in the allowlist.

## Reliability findings

No product defect was verified; no application behavior was changed in this audit. Three meaningful coordinator regression tests and a focused browser audit were added. The Firefox harness initially read the visible status in an input-event microtask before React committed. The corrected test controls the browser clock, permits rendering and checks pending state before the 500 ms debounce. This fixes the harness, not the product.

| Condition | Verified outcome |
| --- | --- |
| Supported Web Locks | First successful opener holds the exclusive per-challenge save lease; edits debounce, metadata actions flush immediately. |
| Web Locks missing | Restore can read valid saved text, but no unlocked write is attempted. In-memory editing/explicit execution remain available. Accessible local-save status and an explanatory unsaved warning are shown. |
| Acquisition rejects | Same fail-closed behavior, without unhandled browser errors; explicit Retry reacquires after the failure is removed. |
| Two tabs edit | Secondary tab retains its buffer but cannot persist. Storage events never replace the editor; changed heads require explicit resolution after ownership becomes available. |
| Owner closes with pending save | Synchronous lifecycle flush happens before release. A dirty follower reacquires but refuses to overwrite the changed head; its unsaved buffer is retained. There are no concurrent async storage writes: each setItem is synchronous under the held lease. |
| Storage read/getter/write throws or quota is exhausted | No false saved state; editor remains usable in memory, existing successfully persisted content is retained. Retry recovers only when safe; an unknown changed head stays a conflict. |
| Save succeeds, then another edit | Immediately pending in the coordinator and visibly Saving before debounce; old stored source remains until a successful write of the exact current source. |
| Save fails, then refresh | Restores only the last successfully persisted draft. Unsaved in-memory text cannot survive a failed save followed by page destruction; the UI explicitly warns before that loss. |
| Conflict Load cancelled | Current unsaved buffer remains. Confirmed load explicitly discards it; confirmed replacement explicitly chooses it over the stored head. |

The existing role=status save announcement is present, with a visible detailed warning and keyboard-accessible recovery actions. Both real browser engines verified those semantics for missing locks, rejected acquisition, throwing reads and throwing writes. No unsafe fallback was introduced.

## Completion and clearing

Completion requires ED-020 validation of all seven required test results, a supported challenge and the exact current source snapshot. Completion carries `counter-behavior-v1`; a contract fingerprint guards intentional version changes. A partial result, source resemblance, hint or reference reveal cannot earn completion. Edits invalidate current verification, preserve historical completion and keep the best current-revision score. A new grading revision invalidates old best/current verification while retaining source and historical revision. Reset selects the latest starter through one undoable edit and retains history. Confirmed Clear removes source, completion, verification and assistance history, resets undo, and retains only a four-field, data-free revision marker to prevent silent stale-tab resurrection.

## Executed verification

Final audit: `yarn lint`, `yarn typecheck`, `yarn test` (2,119/2,119 in 40 files), `yarn build`, and `git diff --check` pass. The focused coordinator file has 24 passing tests.

Chromium and Firefox each pass the new reliability audit (20/20), full persistence/assistance suite (73/73), grading/isolation/editor-reset suite (99/99), and private-protocol suite (10/10). The development-fallback editor/error/security matrix passes 147/147 Chromium and 144/144 Firefox. Every report has zero failed assertions and zero collected unexpected errors. Curriculum/navigation regression evidence from implementation is retained, not represented as rerun during this audit.

Reproduction after `yarn build` and `yarn start -p 3118`:

```sh
node docs/ed-021/tools/audit-reliability.cjs
ENGINE=firefox node docs/ed-021/tools/audit-reliability.cjs
node docs/ed-021/tools/verify-progress.cjs
ENGINE=firefox node docs/ed-021/tools/verify-progress.cjs
node docs/ed-021/tools/ed020-verify-grading.cjs
ENGINE=firefox node docs/ed-021/tools/ed020-verify-grading.cjs
node docs/ed-021/tools/ed020-verify-grading-protocol.cjs
ENGINE=firefox node docs/ed-021/tools/ed020-verify-grading-protocol.cjs
MODE=fallback node docs/ed-021/tools/ed020-regression-verify-matrix.cjs
ENGINE=firefox MODE=fallback node docs/ed-021/tools/ed020-regression-verify-matrix.cjs
```

Matrix runners must be serial because they start fixed-port canaries. Browser scripts use an existing external Playwright cache; `PLAYWRIGHT_CORE` and `CHROME_PATH` override local paths. No dependency is added to the app. Reports are written under `docs/ed-021/` for local review and excluded from the commit. Command logs for this audit are retained under `/tmp/explain-dev-ed021-final-audit/`.

## Remaining limitations

Safari/WebKit, physical devices and assistive technologies are unverified. ED-019's dedicated production host, origin separation and deployed CSP/headers remain release blockers; the matrices here exercise the development fallback. Progress is browser-local and tamperable educational feedback, not certification or device sync. Missing Web Locks disables saving visibly. Browser/process termination without lifecycle delivery can lose pending edits. Other tabs can hold unsaved memory after Clear but cannot silently persist it. No push or deployment was performed.
