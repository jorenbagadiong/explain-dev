# ED-022 implementation

## Git and scope

Started on clean `main` at `aefb368`. ED-021 `ed2cfbf`, ED-020 `5d3ab5b`, ED-015 `d38b295` and ED-019 `d728f77` were verified. `next-env.d.ts` was already committed in its development form; its initial bytes were snapshotted and restored after production build generation. No unrelated dirty work or conflicts existed. Nothing is committed, pushed, merged or deployed for ED-022. No reset, stash or clean was used.

`files.txt` is the exact modified/new source inventory; `evidence-files.txt` lists new documentation, runners, reports, logs and screenshots. `preservation.json` compares all 344 baseline source hashes: 15 deliberate modifications, 329 unchanged and 21 new source files. Outside source, only the new ED-022 documentation/evidence directory is added. Package/lockfile, ED-015 articles/visuals, lesson content/registries, existing preferences, ED-021 storage service/schema, compiler, security headers, host policies and prior milestone docs/runners are unchanged.

## Implementation decisions

- Add a closed five-ID grading contract table and ID-specific exact result validation. Retain the seven original Counter tests/revision. Protocol v4 extends the finite ID allowlist and fails closed against v3; session/run/private-port/challenge checks remain strict. No learner-extensible plugin system.
- One workspace and PreviewFrame handle all five challenges. Immutable run/job source snapshots and keyed challenge/revision boundaries prevent stale source/results/state reuse. Restoration initializes editor text only, while the initial preview always receives trusted starter text.
- Reuse the original Counter grader, extracting its unchanged accessible-DOM helpers into a sandbox-only shared module. A closed dispatcher implements input/list/conditional assertions and controlled cleanup lifecycle tests. Compilation/execution stays exclusively inside the existing opaque iframe.
- Add four static route folders and four metadata/reference pairs. Typed metadata includes concept, content/grading/starter revisions and objectives. Each solution is separately imported only after a warning and explicit reveal; copy never applies it. Generic support/result labels replace Counter-specific wording.
- Reuse ED-021's coordinator unchanged. A small progress-definition adapter scopes completion to content plus grading revision while keeping v1 Counter storage compatible. An independent read-only index status subscribes to browser storage/pageshow without creating edit leases or writing defaults.
- Show five index cards with concept, level and local status. The only navigation edit disables speculative Practice prefetch to prevent new progress/grading metadata downloads while reading lessons. Existing URLs, sidebar structure and navigation semantics are retained.

## Development findings

The first three new challenges were implemented before publishing Cleanup. The interval harness was designed, unit tested and validated against positive/negative browser fixtures first. A later compatibility regression identified negative synthetic timer IDs; these were replaced with reserved positive native handles and verified with an `id > 0` alternative. Missing cleanup and mounted-flag leak fixtures still fail through active-registration evidence, not absent DOM changes.

Typecheck caught widened literal types in new test fixtures and lint caught an obsolete Hook dependency; both were corrected. Browser harness fixes included waiting for index status to hydrate, updating a reference label/output directory, and rerunning UI loops interrupted by a local server rebuild. Only completed final runs are counted in verification.md; reports record the expected full UI check count and completion flag.

## Privacy and remaining blockers

No authentication, backend, cloud sync, external analytics, dependency or deployment path. Learner source/progress stays in the parent browser's origin-local store and reaches a sandbox only after explicit Run/Run Tests. Client-side grading is educational and tamperable. Resource guards do not prove isolation against every built-in hang or network vector. Same-origin fallback can freeze Firefox on uninstrumented blocking code.

Dedicated production preview-host/origin/deployed-header validation, Safari/WebKit, physical devices and assistive technologies remain unverified release blockers. See grading.md for finite behavioral-test limits and the interval-only cleanup contract. Recommend ED-023 address those release blockers and real-device/assistive-technology coverage before expanding challenge types further.
