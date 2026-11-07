# Test integrity and curriculum manifest

The baseline and corrected application passed **1,752 tests in 23 files**, strict application TypeScript, ESLint, and the production build. Existing tests were retained unchanged. Runtime examples remain displayed strings in the application; tests that render an article do not execute those strings.

## Registry and manifest

Independent inventory and existing manifest tests establish:

- 119 unique registry IDs, eight groups, 119 available topics, zero Coming-soon topics.
- Group counts: fundamentals 13; state/data flow 13; Hooks 19; architecture 14; forms 12; performance 14; advanced 17; testing/best practices 17.
- 119 unique routes/directories; every content and route file exists, with no orphan lesson modules or route directories.
- The 115 ED-013 routes statically import their own content, topic ID, and metadata factory. Four legacy compositions remain explicit. Titles/headings/breadcrumbs match their intended identities; legacy headings such as “Understanding React useState” intentionally differ from the compact registry label.
- Stable IDs, routes, group assignments, publication statuses, and curriculum order were not modified in ED-014.

`node docs/ed-013/tools/sync-manifest.mjs --check` was run before edits and after corrections. It detects missing published files by downgrading the computed status to blocked. `curriculum-manifest.test.ts` also asserts existence for each published/legacy record. The route-wiring test’s missing-file `continue` cannot bypass those independent existence assertions. `scan-content.mjs` additionally reads every route/content/built HTML file directly, so a missing file throws rather than silently disappearing from its input.

Adding the actual 19.3 release source to two corrected lessons made the manifest’s reference lists stale. This was investigated by inspecting the sync implementation, then refreshed using its normal command. The reviewed diff adds **only two docReferences**. It does not change identity/status to satisfy the check.

## Compilation

The corpus helper already sets `moduleDetection: Force`, preventing unrelated snippets from sharing script globals. The independent ED-014 compiler creates a separate program for each of **384** compilable ED-013 blocks, adding `isolatedModules` to strict options and supplying only that block’s own declared context. All pass. Three partial lazy snippets assume adjacent component modules; no other block receives their declarations. External examples and three text fragments are excluded explicitly.

Five complete/client/server examples contain documented ambient functions for user-supplied implementations. A declaration is not an executed implementation. The compiler uses both DOM and Node libraries; it does not prove RSC bundler separation, server authorization, endpoint availability, or every client lifecycle. See ED014-TEST-001. The four older articles retain their existing complete/context-wrapped compiler tests; their 43 records are reported separately rather than silently assigning new classifications.

## Behavioral verification

- `runtime-bundle.mjs` uses installed Vite/TypeScript/React to extract 13 actual code strings into an isolated browser fixture in `/tmp`. It changes no application route or dependency. Two additional fixtures are explicitly audit-owned probes, not curriculum examples.
- `runtime-before.json` records the timer and duplicate-key defects before correction. `runtime-results.json` records **20 passing checks**, including the corrected examples, state updater ordering, input preservation, form validation/reset, composed callbacks, memoized-child output, stable-promise Suspense, render/Effect error boundaries, store subscriptions, and sibling Transition independence.
- The browser fixture uses ordinary React DOM and cannot certify Next’s RSC transform. Its development bundle intentionally ignores RSC `use client` boundaries because it is a client-only fixture; bundler directive warnings are expected there.
- Review follow-up: `review-runtime-results.json` records **21** fresh passing checks. The original pending-key assertion is unchanged; a small audit-owned parent now confirms both requests into the displayed Comments component’s base props. The added assertion requires both identical comments to remain after settlement with no pending labels. This protects against optimistic rows disappearing when their temporary state clears. No existing Vitest assertion was changed.
- `run-vitest-examples.mjs` writes 17 extracted complete Vitest example files to a fresh `/tmp` directory, reuses the existing node_modules via symlink, and runs them independently of application tests: **22 passed**, zero failed. The JSON `testResults` array contains the 17 file results; Vitest’s suite total also counts nested describe suites.
- External RTL/user-event/jsdom examples were not executed, and no package was installed. Their official-API review is documented individually in technical-accuracy.md.

## Harness errors and limitations

The extra browser harness originally followed a mutable Reveal/Hide accessible name and reported nine false failures. Rebinding through the stable answer-control relationship fixed the harness; all 71 checks now pass. The initial placeholder scan matched lowercase `todo-flow`; marker casing was corrected without editing the example. Neither was an application defect.

One sandbox lint attempt failed with ENOENT while traversing the sandbox-only `.agents` directory. The same lint command passed with approved execution outside the sandbox. Compilation, source scans, and examples are supporting evidence; they do not replace semantic review, actual assistive technology, or complete browser/runtime coverage.
