# ED-014 findings

Statuses distinguish open, fixed awaiting verification, verified fixed, accepted limitations, blocked, and not performed. Findings below were recorded from baseline evidence before corrections. The verification/status lines include the subsequent results.

| Finding | Severity | Final status |
| --- | --- | --- |
| ED014-CONTENT-001 | Medium | Verified fixed |
| ED014-CONTENT-002 | Medium | Verified fixed |
| ED014-CONTENT-003 | Medium | Verified fixed |
| ED014-CONTENT-004 | Medium | Verified fixed |
| ED014-CONTENT-005 | Medium | Verified fixed |
| ED014-DOC-001 | Low | Verified fixed |
| ED014-PERF-001 | Informational | Measured observation; no optimization justified |
| ED014-TEST-001 | Low | Open coverage gap; execution scope documented |

No Critical or High verified defects were found in the checks performed. This does not clear checks that were not performed.

## ED014-CONTENT-001 — connection demo does not cancel its event

- Severity: **Medium**. Demonstrates incomplete Effect cleanup, causing stale/duplicate user notifications when copied. The site displays the example; its application runtime does not execute it.
- Category: Verified defect (educational example).
- File/section: `src/content/react/lessons/use-effect-event.ts`, example `chat-room`, helper `createConnection`.
- Observed: `onConnected` schedules `window.setTimeout(handler, 100)`, while `disconnect` only logs. A disconnected room still notifies; Strict Mode produces duplicate notifications.
- Reproduction/evidence: `runtime-bundle.mjs` + `runtime-browser.cjs` extract the actual code and run installed React 19.3.1 in Chromium 156. Baseline `runtime-before.json` records four notifications after old/new Strict Mode mounts, and one after unmount; expectations were one and zero respectively.
- Authority: [React useEffect cleanup](https://react.dev/reference/react/useEffect#connecting-to-an-external-system) requires cleanup to undo setup. This directly supports canceling the timer; the observed alerts are runtime evidence.
- Minimal correction: retain the timer ID and clear it on disconnect; explain cancellation.
- Verification: both alert checks pass after correction in `runtime-results.json`; isolated strict compilation and all 1,752 existing tests pass.
- Status: Verified fixed.

## ED014-CONTENT-002 — duplicate keys for identical optimistic comments

- Severity: **Medium**. Valid repeated input produces unsupported React list identity behavior in a teaching example.
- Category: Verified defect (educational example).
- File/section: `src/content/react/lessons/use-optimistic.ts`, example `optimistic-list`.
- Observed: the reducer assigns `id: "pending-" + text`; two in-flight submissions with the same text share a key.
- Reproduction/evidence: mount the actual Comments example, hold both `addComment` promises pending, and submit “Same text” twice. Chromium emits “Encountered two children with the same key”; see `runtime-before.json`.
- Authority: [Rendering Lists](https://react.dev/learn/rendering-lists#rules-of-keys) directly requires unique sibling keys, generated when creating data rather than during rendering. [useOptimistic](https://react.dev/reference/react/useOptimistic) directly requires a pure reducer.
- Minimal correction: create a temporary UUID in the form Action and pass `{ id, text }` to the reducer. The reducer remains pure and preserves that identity across rebasing.
- Verification: identical-submission reproduction passes with two pending items and no duplicate-key warnings; isolated strict compilation passes.
- Review follow-up, 2026-11-08: an audit-owned parent now appends confirmed base-prop comments before each Action settles. The original pending-key assertion is retained. `review-runtime-results.json` additionally verifies that both identical confirmed comments remain and all pending labels clear. This covers successful confirmation; rejected requests, reverse settlement order, and deployed RSC integration are not covered by this case.
- Status: Verified fixed.

## ED014-DOC-001 — README contradicts the published curriculum

- Severity: **Low**. Misstates navigation availability for maintainers/readers.
- Category: Documentation inconsistency.
- File/section: `README.md`, current route table, stack/shell/technology overview, and ED-009 TopicCard description.
- Observed: route table says only four articles link; ED-009 paragraph says only two link and other cards are inert. Intro and registry correctly say all 119 are published.
- Evidence/reproduction: compare those paragraphs with the 119 available registry entries and the all-route Chromium smoke result (all curriculum links match the manifest).
- Minimal correction: describe all 119 current links; keep historical milestone explanations explicitly historical where appropriate.
- Verification: source diff/readback matches 119 published links. Historical ED-013 JavaScript wording now distinguishes script references from browser requests; see ED014-PERF-001.
- Review follow-up, 2026-11-08: the API inventory also incorrectly said Activity/ViewTransition cards were unpublished. It now links to the manifest’s available `/frontend/react/activity-boundaries` and `/frontend/react/view-transition` routes. Historical milestone prose is explicitly dated 2026-11-07, and the ED-014 README summary no longer assumes the work will remain uncommitted.
- Status: Verified fixed.

## ED014-CONTENT-004 — error boundaries described as render-only

- Severity: **Medium**. Misleads debugging and contradicts the lesson’s own comparison/interview answer.
- Category: Verified technical inaccuracy.
- Files/sections: `error-handling.ts` → `kinds-of-failure` and takeaways; `error-boundaries.ts` → `what-they-catch`, Quick Review interview trap.
- Original claims: “An Error Boundary only catches errors thrown while React is rendering”; “Error Boundaries only catch rendering-phase errors”; “Only rendering errors in descendants, plus those in useTransition’s startTransition.”
- Evidence: the audit-owned `effectBoundaryProbe` throws synchronously inside a child’s useEffect and the ancestor boundary renders “Effect error caught” on installed React 19.3.1. The existing error-handling comparison already correctly includes lifecycle methods and Effects. [React Component reference](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary) supports the boundary model and excludes ordinary event/async callbacks, with the useTransition exception. Effect handling here is independently runtime-observed rather than inferred from the “rendering” heading.
- Minimal correction: include descendant lifecycle/Effect errors and distinguish ordinary async callbacks from useTransition Actions.
- Verification: runtime probe passed; content tests and production build passed.
- Review follow-up, 2026-11-08: the initial correction missed the async-error mistake and Quick Review takeaway. These now distinguish synchronous descendant Effect setup/cleanup and tracked useTransition Actions from ordinary event errors and detached callbacks. Learn comparisons, takeaways, and Interview answers in both error lessons were checked and aligned. The standalone `startTransition` export is not presented as equivalent to the function returned by useTransition. Fresh results are in review-verification.md.
- Status: Verified fixed.

## ED014-CONTENT-005 — blanket Transition batching claim predates React 19.3

- Severity: **Medium**. Teaches a scheduling limitation as universal in a curriculum explicitly targeting installed React 19.3.1.
- Category: Verified technical inaccuracy, with conflicting official reference material.
- Files/sections: `use-transition.ts` → `interruption`; `transitions.ts` → visual note; `use-action-state.ts` → `queueing` visual note.
- Original claims: multiple ongoing Transitions are currently batched together; React batches multiple ongoing Actions together.
- Evidence: [React 19.3 changelog](https://react.dev/blog/2026/09/09/react-19-3#changelog) identifies independent Transition rendering in that release and links [upstream #37290](https://github.com/react/react/pull/37290), which enables the parallel-Transition flag. The release note establishes the stable version boundary; the PR explains its upstream implementation. An audit-owned installed-runtime probe leaves a slow sibling Transition suspended and observes “Fast ready” from a second Transition while “Slow pending” is still visible (`runtime-results.json`, repeated in `review-runtime-results.json`). The useTransition/startTransition reference caveats still describe batching; this conflict was checked again during review.
- Minimal correction: identify the 19.3 independent-rendering change without promising that all updates/Actions are independent; retain useActionState’s sequential queue and post-await caveats.
- Verification: installed-runtime probe passed. This test covers sibling render Transitions, not every combination of asynchronous Actions or shared state.
- Status: Verified fixed; installed-runtime probe, content tests, and build pass. Two manifest `docReferences` arrays were refreshed for the newly cited 19.3 release note; identities, ordering, routes, statuses, and groups are unchanged.
- Review follow-up, 2026-11-08: both lessons now cite the exact `#changelog` section with #37290 in its label, retain explicit batching/commit-order caveats, and avoid extending the observation to shared-state or arbitrary async Actions. The anchored URL was recorded as consulted, and the existing manifest sync tool was rerun. useActionState still teaches sequential dispatch within one Hook’s queue.

## ED014-CONTENT-003 — insertion Effect timing contradicts its caveat

- Severity: **Medium**. Teaches a DOM timing guarantee that library authors cannot rely on.
- Category: Verified technical inaccuracy.
- File/section: `src/content/react/lessons/use-insertion-effect.ts`, `when-it-runs`, first paragraph (section identity checked against the source).
- Original claim: “It runs after a component is added to the DOM but before any layout Effects fire.” The same lesson later correctly warns not to assume the DOM was updated.
- Evidence: [useInsertionEffect caveats](https://react.dev/reference/react/useInsertionEffect#caveats) directly says it can run before or after DOM updates. Applicable to installed React 19.3.1; no inference about internal commit order is needed.
- Minimal correction: retain the guarantee about preceding layout Effects, explicitly remove the DOM-update timing guarantee.
- Verification: source readback, unchanged API examples, final content tests; this is documentation-reviewed rather than an asserted runtime timing test.
- Status: Verified fixed; corrected paragraph agrees with its existing caveat, and content/build gates pass.

## ED014-PERF-001 — referenced JavaScript differs from requested/transferred bytes

- Severity: **Informational**. Size by itself demonstrates no performance defect.
- Category: Performance observation; historical measurement clarification.
- File/section: ED-013 README final verification; generated article HTML script references; [performance.md](performance.md).
- Observed: ten referenced scripts total 663,515 raw bytes; one is a 112,594-byte `nomodule` polyfill. Chromium requests nine scripts (550,921 decoded bytes) and receives 167,572 gzip body bytes, with 170,272 browser-reported transfer bytes on a cold local load.
- Evidence/reproduction: `measure-build.mjs`, `browser-audit.cjs`, `build-measurements.json`, `browser-results.json`; nine samples including the largest article. All ten references are shared across all 119 articles.
- Proposed action: correct “loads” to “references” in README, retain the measurements, and avoid a speculative architecture/bundle rewrite.
- Verification: identical script sizes after the fixes; no sampled lesson paragraphs found in client assets. This is not a parse-time/CPU or field-Web-Vitals result.
- Status: Measured observation; no optimization justified by the evidence collected.

## ED014-TEST-001 — example compilation does not enforce every environment/runtime

- Severity: **Low**. A verified coverage limitation, without an additional demonstrated broken example.
- Category: Test coverage gap.
- File/section: `src/content/react/lessons/lessons.test.ts` → corpus compilation; `src/content/react/test-utils.ts` → `typecheckCorpus`.
- Observed: compiler uses DOM/Node/React types and forced module isolation. It does not run every client example in a browser, enforce RSC bundler restrictions, or execute external packages. Five classified complete/client/server examples use explicitly described ambient implementations; partial lazy snippets assume neighbouring modules.
- Evidence: independent `compilation.json` and source review. 384 compilable ED-013 examples pass individually; this confirms module isolation. 13 extracted examples and two audit probes were exercised in Chromium; 17 complete Vitest example files ran 22 tests. The eight server examples were compile/documentation reviewed, not run as complete deployed RSC endpoints.
- Proposed follow-up: extend maintained example execution coverage to additional browser/RSC scenarios; choose and approve RTL/user-event/jsdom versions in a separate dependency change if full external execution is desired. No package installation was attempted.
- Verification: the two example defects found in this audit demonstrate why compilation alone is insufficient; those specific defects now have reproducible browser regressions.
- Status: Open coverage gap; execution scope documented, not silently accepted on the user’s behalf.
