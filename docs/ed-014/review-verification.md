# ED-014 review follow-up verification

Date: 2026-11-08 (Asia/Taipei). Baseline: `6dec9dd`, branch `main`. This is a fresh review pass after the initial ED-014 audit, not a relabeling of the original results. Verification and maintainer review preceded staging; the maintainer subsequently authorized committing ED-014 and will handle the push.

## Review corrections

1. **CONTENT-004:** completed the Error Boundary correction in the mistakes, Learn comparisons, takeaways, Quick Review, and Interview wording in `error-boundaries.ts` and `error-handling.ts`. Coverage includes descendant rendering/lifecycle/synchronous Effect setup and cleanup, and Actions passed to the `startTransition` returned by useTransition. Ordinary event handlers and detached async callbacks need their own handling. A final wording clarification names detached requests directly rather than implying every Promise outside an Action is unhandled; rejected Promises read with `use` remain covered as rendering failures.
2. **DOC-001:** corrected the README API inventory. The manifest confirms `react-activity` → `/frontend/react/activity-boundaries` and `react-view-transition` → `/frontend/react/view-transition`, both available and backed by existing static route files. Historical milestone descriptions are marked as 2026-11-07 snapshots. The ED-014 summary now describes verification scope without assuming the work will remain uncommitted forever.
3. **CONTENT-005:** checked the [React 19.3 changelog](https://react.dev/blog/2026/09/09/react-19-3#changelog) and [upstream #37290](https://github.com/react/react/pull/37290). The changelog establishes the stable release boundary for independent Transition rendering; the PR enables the underlying flag. Both lessons now link to the exact changelog section. The installed-19.3.1 sibling-Suspense probe also passes. Advice against depending on batching/commit order remains; useActionState dispatch is still sequential within one Hook’s queue. The anchored source URL is recorded as consulted, and the existing manifest synchronization tool updated only its two reference lists.
4. **CONTENT-002 regression coverage:** retained the exact assertion for two identical pending submissions and absence of duplicate-key warnings. A small audit-owned parent wraps the actual displayed Comments example, awaits each request, and appends the confirmed comment using a functional state update before the Action settles. One added assertion requires both confirmed “Same text” rows to remain and all `(Sending…)` labels to clear. This prevents a test from passing solely while temporary optimistic state exists. No existing application/Vitest assertion was weakened or changed; the browser check count increases from 20 to 21.

The optimistic case covers successful confirmation of both overlapping requests. It does not prove rejection/rollback, reverse settlement order, retry behavior, or RSC/network integration. The boundary probe executes a synchronous Effect-setup failure; it is not a new exhaustive runtime test of lifecycle methods, Effect cleanup, or every Action rejection path.

## Fresh checks

| Check | Actual result |
| --- | --- |
| `yarn lint` | Passed, including changed audit scripts; repeated after the final wording edit |
| `yarn typecheck` | Passed; repeated after the final wording edit |
| `yarn test` | **1,752 passed in 23 files**; repeated after the final wording edit |
| `yarn build` | Passed: **125 static pages**. Rebuilt once more after the final paragraph clarification |
| `node docs/ed-013/tools/sync-manifest.mjs --check` | Passed: 119 available, 4 existing + 115 published; no pending or blocked records |
| `git diff --check 6dec9dd` | Passed; untracked audit text and JSON also reviewed separately |
| `node docs/ed-014/runtime-bundle.mjs` | Passed with installed Vite/TypeScript/React; no dependencies installed. Expected client-directive warnings from the client-only fixture are separate from application results |
| Runtime/browser example suite | **21 passed, zero failed**, Chromium 156.0.8078.4; `review-runtime-results.json` |
| Extra Chromium page/accessibility/resource checks | **71 passed, zero failed**, no application console/hydration issues; `review-browser-results.json` |
| All-route smoke + eight group representatives | **2,359 passed, zero failed, zero console issues**; `review-chromium-smoke.log` |
| Final-build all-route smoke + Error Boundary deep checks | **1,337 passed, zero failed, zero console issues**; `review-final-chromium-smoke.log` |
| All built title/heading/breadcrumb/server-route checks | **119 passed**, no missing named React/DOM exports or placeholder candidates; `review-content-scan.json` |
| Baseline identity comparison | All 119 IDs, routes, group metadata, ordering, publication/workflow status, and content/route mappings match `6dec9dd`; only two manifest docReferences arrays differ |
| Generated input | `next-env.d.ts` SHA-256 still matches the incoming pre-existing diff; excluded from the proposed commit |

The all-route/eight-representative run preceded only the final clarification of the detached-request sentence. The subsequent final build and all-route/targeted Error Boundary deep checks cover that exact wording. Runtime fixtures use the same unchanged displayed code strings, independent of that prose clarification. Both audit-owned server processes were stopped after their checks.

## Build blockers encountered and resolved

The first sandbox `yarn build` failed because Turbopack’s CSS worker could not bind a local port (`Operation not permitted`). The approved outside-sandbox retry initially reproduced that failure. The generated `.next` directory was preserved by moving it to `/tmp/ed014-review-build-backup.7liYZj/next`, then a fresh outside-sandbox `yarn build` passed. A later incremental final build also passed. No source, dependency, registry, or configuration change was made to bypass the failure.

One server start happened before that failed build had completed and exited with “Could not find a production build.” It is not counted as a passing browser check. A new audit-owned server was started only after a successful build, and was restarted for the final copy verification. Earlier results and the original failing runtime reproduction remain preserved in their original artifact files.

## Prior evidence retained, not freshly re-executed

- `compilation.json`: prior 384 isolated TypeScript programs passed. The freshly executed main test suite still typechecks its corpus, but the separate isolated compiler command was not repeated in this review.
- `vitest-examples.json`: prior 17 extracted files / 22 tests passed; the extraction runner was not repeated.
- `reference-results.json`: prior 127 URLs returned HTTP 200. The current inventory has 128 source strings because the precise changelog anchor was added. That page and upstream PR were freshly consulted; the whole link sweep was not repeated.
- `build-measurements.json` and `content-scan.json`: initial-pass build/prose evidence. Current article metadata and inventory have separate review artifacts. Browser resource measurements were repeated in `review-browser-results.json`; no device/deployed performance conclusion is added.
- `runtime-before.json`: original failing demonstration; `runtime-results.json` and `browser-results.json`: original passing demonstrations. These were not overwritten to make them appear fresh.

`REPORT` now optionally selects output paths for the extra browser and content-scan harnesses, matching the existing runtime harness convention. Defaults are preserved. Fresh review commands used separate `review-*` files. The main all-route harness writes its summary to the two new review smoke logs.

## Reviewed commit contents

Suggested subject: `fix: complete React curriculum audit review (ED-014)`.

- The **eight** lesson modules already in ED-014: `error-boundaries`, `error-handling`, `transitions`, `use-action-state`, `use-effect-event`, `use-insertion-effect`, `use-optimistic`, and `use-transition`. Review follow-up changes only the two error lessons and two Transition lessons; the other fixes are preserved.
- `README.md`, `docs/ed-013/curriculum-manifest.json`, and `docs/ed-013/verified-references.json`.
- All reviewed documentation, reproducible audit scripts, prior evidence, and distinct fresh review artifacts under `docs/ed-014/`.
- **Exclude** pre-existing generated `next-env.d.ts`, `.next/`, cache/tsbuildinfo, and temporary files under `/tmp`.

Dependency files, application routes, curriculum registries, shared UI/theme/Back to Top components, storage/preferences, and design tokens have no diff against ED-013. Learn, Quick Review, Interview, theme, and navigation remain covered by existing tests and Chromium checks. There was no branch switch, staging, commit, push, deploy, or PR during this review.

## Separate outstanding release checks

| Release check | Status |
| --- | --- |
| Firefox | Not tested; no engine installation authorized or performed |
| Safari/WebKit | Not tested; no engine installation authorized or performed |
| Real browser zoom at 100% | Not performed; normal headless viewport is not credited as a real-zoom task |
| Real browser zoom at 200% | Not performed; keyboard zoom probe did not change viewport/DPR/scale |
| Real browser zoom at 400% | Not performed; 320px viewport testing is supplementary reflow evidence only |
| Screen reader | **Not tested — screen-reader verification unavailable.** |
| External RTL/user-event/jsdom examples | Not executed; dependencies remain absent |
| Complete RSC/server example runtime | Not performed; ordinary React DOM fixtures do not establish RSC transform, deployed endpoint, or authorization behavior |
| Deployed/CDN/field performance | Not measured |
| Physical/low-end device performance | Not measured |

No limitation was accepted on the maintainer’s behalf. Full cross-browser/accessibility release sign-off remains pending.
