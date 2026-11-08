# ED-022 architecture decision before implementation

Baseline: clean `main`, HEAD `aefb368`; ED-021 `ed2cfbf`, ED-020 `5d3ab5b`, ED-015 `d38b295`, ED-019 `d728f77` verified. Initial `next-env.d.ts` bytes and source hashes are saved under `/tmp/explain-dev-ed022/`. No commit, push, merge or deployment is authorized.

The existing runtime and storage coordinator can support five challenges; the smallest required change is removing Counter-only assumptions from the closed grading-ID allowlist, per-ID test validation, workspace/result presentation and reference importer. Add four static route folders to retain the established routing convention. Keep one editor, runtime, private-port protocol and per-challenge persistence coordinator; no plugin framework or dependency.

Protocol v4 retains the existing envelope, exact schemas, session/run/source/origin checks, caps and challenge-bound result acceptance, while expanding the finite ID allowlist. Old hosts fail closed. Security headers, opaque sandbox and host selection stay unchanged. Static test metadata is separate from sandbox-only execution. Ordinary lessons never import the grader/editor; Practice index reads progress without acquiring edit leases or loading editors.

Each challenge defines content revision `v1`, a grading-contract revision, starter revision, concept, objectives, three hints and a separately lazy-loaded solution. Persistence v1 is reused. For v1 content, its existing grading-revision key is retained (preserving Counter evidence); a later content revision prefixes the grading revision, so changing either invalidates current evidence while retaining source/history. Revision labels remain bounded by the existing validator. Starter revisions remain independent.

Implement Controlled Input, List Filtering and Conditional Rendering first. Then validate the cleanup harness before publishing the fourth new challenge.

## Effect cleanup test design (before implementation)

Contract: one 1,000 ms interval updates a readable `Ticks: integer` display, initially zero, once per tick. Cleanup must release the interval on unmount. Alternatives using class lifecycle methods are acceptable: grade behavior, not Hook spellings. Recursive timeouts and other subscription types are outside this explicitly documented interval exercise.

Inside a disposable grading sandbox, install a controlled interval scheduler before learner module evaluation. Its handles, active-interval map, virtual clock and snapshots live in a trusted closure; none is exported on a window API or sent to learner code. Replace only normal interval registration/cancellation plus cancellation through clearTimeout's shared timer ID convention. Reserve inert, far-future native timeout handles so returned IDs remain positive and cannot collide with native heartbeat/deadline IDs; release those reservations on cancellation or disposal. Runtime heartbeat and grader deadlines are captured/created outside this instrumentation. Advance virtual time inside React act, so tests do not depend on real wall-clock sleeps.

Observe setup (one live interval, initial zero), tick behavior, unmount (zero live intervals), advancing time while unmounted (zero callbacks), remount and repeated cycles (exactly one interval while mounted, zero afterward). Check the active map *before* forced disposal: absent DOM updates are never proof of cleanup. New roots on remount reuse the same evaluated component to expose module-scope stale subscriptions. Each independent test reevaluates the source; disposal restores globals and discards remaining handles even after a failure. Bound virtual callbacks and retain existing test/frame deadlines.

Validate the scheduler with unit tests, then exercise reference, class/alternative and missing-cleanup/wrong-delay/duplicate/stale implementations in real Chromium and Firefox sandbox frames before adding the published challenge content. The instrumentation is educational evidence in the learner's shared realm, not tamper-proof assessment. No privileged grader controller, timer snapshot or parent API is exposed; CSP, sandbox and MessagePort capabilities are unchanged.
