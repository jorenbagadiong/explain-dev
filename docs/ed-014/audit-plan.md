# ED-014 React curriculum quality and release audit

Audit date: 2026-11-08 (Asia/Taipei). Baseline: `6dec9dd` on `main`.

The supplied brief ends at the heading “13.2 HTML size”. This audit follows the available requirements; no missing requirements are assumed.

## Baseline established before ED-014 edits

- ED-013 was uncommitted when inspected. The user explicitly requested its commit; `6dec9dd` contains its 255 files. No branch switch, stash, reset, clean, push, merge, deployment, or PR was performed.
- The only remaining tracked baseline change is generated `next-env.d.ts`, whose route-type imports point to `.next/types` following the production build. It was excluded from the ED-013 commit.
- Installed: Next 16.4.5, React/React DOM 19.3.1, TypeScript 6.0.3, Vitest 5.1.0, React types 19.3.0. Yarn Classic 1.22.22. `tsconfig.json` enables strict checking. No dependencies changed.
- Initial gates independently passed: `yarn lint`, `yarn typecheck`, `yarn test` (1,752 tests / 23 files), `yarn build` (125 static pages), `node docs/ed-013/tools/sync-manifest.mjs --check` (119 available; 4 existing + 115 ED-013 publications).
- Identity/order live in `src/lib/learning/react-topics.ts`; eight groups live in `react-curriculum.ts`; the ED-013 manifest records routes/content. Four older articles use dedicated compositions; 115 lessons use `LessonArticlePage`. All routes are static imports and Server Components. Mode and answer controls receive server-rendered slots.
- Existing browser harness uses an already-installed Playwright Core outside this project. Chromium is cached; Firefox and WebKit are not. Existing tests use Node plus server-rendered markup, not a DOM test environment.

## Work and evidence

1. Reconcile all 119 identities, routes, modules, titles, breadcrumbs, statuses, sources, and example counts. Separate legacy blocks from classified ED-013 examples.
2. Review high-risk Learn/Review/Interview guidance against official React/Next documentation appropriate to installed versions. Automated candidate scans are not semantic proof.
3. Check compiler isolation and client/server validation limits; review all external examples without installing packages; execute representative behavior where supported.
4. Inspect shared accessibility implementation; run all-route Chromium smoke and deeper checks across all eight groups, five widths, and both themes. Record real zoom and screen-reader limitations separately.
5. Measure emitted/referenced/requested JS, compressed representation sizes, actual browser resource metrics, and HTML sizes. Do not infer runtime cost from uncompressed file sizes.
6. Record findings before minimal corrections; rerun relevant checks and final gates. Produce a release-readiness assessment with explicit unperformed/blocked checks.

## Constraints

Preserve the 119 IDs/routes/order, eight groups, educational coverage, three modes, navigation, Back to Top, theme and preferences schema, Server Component boundaries, design tokens, dependencies, and existing tests. The initial audit/review scope left ED-014 uncommitted; the maintainer subsequently authorized its commit and will handle the push. Findings distinguish verified defects from risks and suggestions, with evidence, severity rationale, correction, verification, and final status.
