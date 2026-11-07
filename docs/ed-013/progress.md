# ED-013 progress

The registry (`src/lib/learning/react-topics.ts`) owns topic identity. `curriculum-manifest.json` tracks per-topic status, so read it for detail rather than this file.

## Resume protocol

For "Continue ED-013" or "Resume React curriculum generation":

```bash
git status --short --branch
node docs/ed-013/tools/sync-manifest.mjs --check   # reports drift, and downgrades missing files on a plain run
yarn test
```

1. Reconcile the manifest against actual files. Never trust a status alone.
2. Find the earliest batch with `workflowStatus: "pending"`, and continue there.
3. Do not regenerate published lessons or overwrite manual edits.

## Batch workflow

```bash
# 1. Read the official docs, and add each URL actually read to verified-references.json.
# 2. Write src/content/react/lessons/<topic-id>.ts for each topic in the batch.
node docs/ed-013/tools/sync-manifest.mjs
node docs/ed-013/tools/generate-routes.mjs <topic-id> ...
yarn lint && yarn typecheck && yarn test     # gates A, B, C (source check), D
node docs/ed-013/tools/publish-batch.mjs <topic-id> ...
node docs/ed-013/tools/sync-manifest.mjs
yarn lint && yarn typecheck && yarn test && yarn build
node_modules/.bin/next start -p 3111         # in a separate process, stopped by its own PID
node docs/ed-013/tools/browser-smoke.cjs --detail <representative-id>
git checkout -- next-env.d.ts                # next build rewrites this file
```

Do not commit or push. That stays with the user.

## Batch log

| Batch | Topics | Status | Last verified |
| --- | --- | --- | --- |
| B01 | 11 Fundamentals lessons | Published | lint, typecheck, 504 tests, build, browser smoke 2026-11-07 |
| B02 | component-state state-snapshots state-update-queues immutable-objects immutable-arrays sharing-state lifting-state | Published, 22 of 119 available | lint, typecheck, 588 passed, build, browser smoke 2026-11-07 |
| B03 | controlled-uncontrolled state-preservation state-structure reducer-patterns context-data-flow avoiding-unnecessary-state | Published, 28 of 119 available | lint, typecheck, 660 passed (660), build, browser smoke 2026-11-07 |
| B04 | use-ref use-memo use-callback use-context use-reducer use-action-state | Published, 34 of 119 available | lint, typecheck, 732 passed (732), build, browser smoke 2026-11-07 |
| B05 | use-optimistic use-imperative-handle use-layout-effect use-insertion-effect use-effect-event use-transition | Published, 40 of 119 available | lint, typecheck, 839 passed (839), build, browser smoke 2026-11-07 |
| B06 | use-deferred-value use-id use-sync-external-store use-debug-value use-form-status | Published, 45 of 119 available | lint, typecheck, 864 passed (864), build, browser smoke 2026-11-07 |
| B07 | component-composition children-composition reusable-components custom-hooks ui-logic-separation component-responsibilities prop-drilling | Published, 52 of 119 available | lint, typecheck, 948 passed (948), build, browser smoke 2026-11-07 |
| B08 | context-providers error-boundaries react-portals ref-props imperative-interfaces component-api-design react-create-context | Published, 59 of 119 available | lint, typecheck, 1032 passed (1032), build, browser smoke 2026-11-07 |
| B09 | controlled-inputs uncontrolled-inputs form-submission form-validation form-actions submission-states | Published, 65 of 119 available | lint, typecheck, 1104 passed (1104), build, browser smoke 2026-11-07 |
| B10 | form-errors optimistic-forms accessible-forms focus-management keyboard-interactions complex-forms | Published, 71 of 119 available | lint, typecheck, 1176 passed (1176), build, browser smoke 2026-11-07 |
| B11 | react-rerenders reconciliation-identity rendering-performance react-memo memoization-strategies | Published, 76 of 119 available | lint, typecheck, 1236 passed (1236), build, browser smoke 2026-11-07 |
| B12 | react-lazy react-suspense transitions deferred-rendering react-profiler | Published, 81 of 119 available | lint, typecheck, 1296 passed (1296), build, browser smoke 2026-11-07 |
| B13 | react-compiler avoiding-renders measuring-performance performance-antipatterns | Published, 85 of 119 available | lint, typecheck, 1344 passed (1344), build, browser smoke 2026-11-07 |
| B14 | server-components client-boundaries server-client-rendering hydration streaming | Published, 90 of 119 available | lint, typecheck, 1404 passed (1404), build, browser smoke 2026-11-07 |
| B15 | suspense-boundaries error-recovery-boundaries react-use-api server-functions concurrent-rendering | Published, 95 of 119 available | lint, typecheck, 1513 passed (1513), build, browser smoke 2026-11-07 |
| B16 | external-stores advanced-refs escape-hatches rendering-architecture version-sensitive-features | Published, 100 of 119 available | lint, typecheck, 1538 passed (1538), build, browser smoke 2026-11-07 |
| B17 | react-activity react-view-transition | Published, 102 of 119 available | lint, typecheck, 1548 passed (1548), build, browser smoke 2026-11-07 |
| B18 | testing-components react-testing-library vitest-fundamentals testing-interactions testing-async-ui testing-custom-hooks | Published, 108 of 119 available | lint, typecheck, 1620 passed (1620), build, browser smoke 2026-11-07 |
| B19 | mocking-dependencies accessibility-fundamentals semantic-react-html keyboard-accessibility rules-of-hooks effect-best-practices | Published, 114 of 119 available | lint, typecheck, 1692 passed (1692), build, browser smoke 2026-11-08 |
| B20 | react-debugging react-antipatterns component-maintainability typescript-react error-handling | Published, 119 of 119 available | lint, typecheck, 1752 passed (1752), build, browser smoke 2026-11-08 |
