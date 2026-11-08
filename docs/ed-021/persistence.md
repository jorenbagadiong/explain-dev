# ED-021 persistence contract

## Key and record

`explain-dev:v1:challenge-progress:<stable challengeId>`; currently `react-use-state-counter`. Existing preferences and theme keys are independent. Validation always checks the ID inside the record against the requested challenge.

```ts
{
  version: 1,
  challengeId: string,
  gradingRevision: string,
  starterRevision: string,
  draftCode: string,
  started: boolean,
  completion: { revision: string, at: string } | null,
  verification: { passedCount: number, at: string } | null,
  bestPassedCount: number,
  totalTests: number,
  revealedHintCount: number,
  solutionRevealed: boolean,
  lastEditedAt: string | null,
  savedAt: string,
  writeRevision: number
}
```

Stored records require all exact keys and canonical ISO timestamps; unknown fields are rejected. Revision labels are bounded. Scores/hint counts must be integers in range, current-contract totals must match metadata, completion and perfect verification must be consistent with the best score. The transient initial in-memory record can have `savedAt: null`, `writeRevision: 0`; it is not written on a visit. Each successful write adds a timestamp and increments a positive safe-integer revision. No capabilities, transcripts or iframe tokens are saved.

Draft limit: **50,000 UTF-16 code units**, matching the existing source limit. Empty strings are valid. Oversized editor contents remain in memory with a visible failure; the last saved value is kept. Serialized input is bounded before parsing (six escaped characters per source unit plus bounded metadata). Malformed/current-invalid data uses the starter without writing or deleting during a read, with a visible notice; subsequent learner activity can replace the invalid record. Future schema versions are refused without overwriting and require a compatible version or confirmed clear. Invalid/future explicit reload attempts retain the current editor buffer. Quota/security/getter/write failures are caught and reported.

## Revisions and transitions

Current grading revision: `counter-behavior-v1`; starter: `counter-starter-v1`. Bump grading revision when requirements, selectors/interaction contract or grader behavior changes. The SHA-256 contract test covers stable IDs and required action sequences; implementation-only grader changes also need review. Bump starter revision when starter text changes.

| Action | Historical completion | Current verification | Other behavior |
| --- | --- | --- | --- |
| Visit | restored if valid | restored summary, never rerun | no write |
| Edit | kept | cleared | In Progress unless historically completed; debounce |
| Run | kept | kept if source unchanged | explicit execution, no completion inference |
| Run Tests | kept | cleared while checking | starts progress, saves attempt |
| Partial/error result | kept | partial summary if suite returns one | best score never decreases |
| All seven passed | current revision earned | 7/7 | saves completion immediately |
| Reveal hint/solution | kept | kept | starts activity, never completes by itself |
| Reset Code | kept | cleared | latest starter, undoable, hints/view flag kept |
| Clear Progress | removed | removed | confirmed; editor/undo/assistance reset |
| Different grading revision | retained with old revision | cleared; best reset | source preserved, current status In Progress |
| Different starter revision | kept | unchanged unless reset/edit | old draft kept; update notice |

`Completed` means historical completion of the current grading revision, with separate Current draft / Last verified and Best verified fields. Editing after completion cannot imply the edited draft passes. Grading is accepted only for the current exact source snapshot and supported challenge, after ED-020 result validation. Full live grading rows and runtime failures are not persisted.

## Deterministic tabs and synchronous flush

A same-origin Web Lock named after the challenge key is held while its tab is on the challenge. First successful opener owns saving. Other tabs are explicitly unsaved/read-only for persistence until that challenge tab closes or navigates away. Their editors remain usable in memory. They must retry ownership, and a changed head requires an explicit reload or confirmed replacement. No timestamp comparison decides a winner, so clock skew cannot cause older drafts to win. LocalStorage head comparison remains a second guard against external writes.

Debounce: 500 ms. Immediate metadata writes and synchronous visibility-hidden/pagehide/unmount flush use the already-held lease. Pagehide releases it; pageshow reacquires without overwriting a changed head. Browser process crashes or termination without lifecycle events can still lose a not-yet-saved edit. Unsupported Web Locks means saving stays unavailable rather than doing racing writes. This is documented failure behavior, not cross-tab synchronization or cloud sync.

Clear marker:

```ts
{ version: 1, challengeId, cleared: true, writeRevision }
```

It retains **no source or learning history**. Keeping a revision marker avoids the missing-key ABA case: an older tab cannot silently re-save its pre-clear buffer. A learner can explicitly choose to save that separate in-memory buffer later. Clear reports success only after the validated marker is written; failures leave the current buffer/data intact. Counter overflow is rejected, not written as an invalid record.

The data is origin-local, plain browser storage. Clearing site data may remove it, and another browser/device cannot retrieve it. Host quotas and availability vary. Same-origin scripts/developer tools can tamper with local records; this is not secure certification. The preview's opaque origin does not get parent storage access. No storage key is shared with the dedicated preview host.
