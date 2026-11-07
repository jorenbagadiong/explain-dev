# Technical accuracy

Review baseline: React/React DOM 19.3.1, React types 19.3.0, Next 16.4.5. Official pages consulted on 2026-11-08 identify React 19.3 / Next 16.4.5. Availability was also checked against installed exports and strict compilation; a successful HTTP response is not a semantic review.

## Coverage and method

`scan-content.mjs` inspected all 119 articles, 13,279 extracted strings, and 445 code records. It checks compiled HTML titles/headings/breadcrumb identities, route server directives, named React/React DOM runtime imports, placeholder candidates, and exact repeated interview answers. All 119 routes matched; no missing runtime exports, placeholder markers, exact repeated interview answers, or HTML-injection examples were found. Its 201 absolute-claim candidates include corrections of misconceptions and legitimate contracts; they are not 201 defects. A first scan incorrectly treated the lowercase `todo-flow` identifier as TODO; the scanner was corrected, and content was preserved.

The editorial pass read Learn explanations, mistakes, Quick Review, and interview answers for the following high-risk topic sets. It prioritized API contracts, environmental assumptions, and cross-mode consistency. This is targeted technical review, not a claim that keyword tests prove every sentence correct.

| Area | Registry IDs reviewed | Main result / evidence |
| --- | --- | --- |
| Effects, cleanup, Strict Mode | `use-effect`, `component-lifecycle`, `effect-best-practices`, `use-effect-event`, `use-layout-effect`, `use-insertion-effect`, `custom-hooks`, `rules-of-hooks` | Dependency/paint/development distinctions retained. Fixed CONTENT-001 and CONTENT-003. [useEffect](https://react.dev/reference/react/useEffect), [StrictMode](https://react.dev/reference/react/StrictMode), [useEffectEvent](https://react.dev/reference/react/useEffectEvent), [insertion caveats](https://react.dev/reference/react/useInsertionEffect#caveats). |
| Snapshots, queues, identity, rendering | `use-state`, `state-snapshots`, `state-update-queues`, `render-and-commit`, `react-rerenders`, `reconciliation-identity`, `concurrent-rendering`, `rendering-architecture` | Setters do not rewrite current snapshots; renders need not mutate DOM; keys identify siblings; concurrency is interruptible work, not worker threads. [Snapshots](https://react.dev/learn/state-as-a-snapshot), [queues](https://react.dev/learn/queueing-a-series-of-state-updates), [list keys](https://react.dev/learn/rendering-lists). Actual updater/input-preservation examples executed. |
| Memoization and Compiler | `use-memo`, `use-callback`, `react-memo`, `memoization-strategies`, `react-compiler` | Caches are optimizations; own state/context still update memoized readers. Compiler is opt-in tooling and is not enabled here. [memo](https://react.dev/reference/react/memo), [useMemo](https://react.dev/reference/react/useMemo), [Next compiler setup](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler). |
| Suspense, lazy, transitions, deferred values | `react-lazy`, `react-suspense`, `suspense-boundaries`, `use-transition`, `transitions`, `use-deferred-value`, `deferred-rendering`, `react-use-api` | Ordinary Effect fetching does not activate Suspense; stable promises, boundary placement, urgent inputs, post-await wrapping, and rendering versus request deferral are distinguished. Fixed CONTENT-005. [Suspense](https://react.dev/reference/react/Suspense), [use](https://react.dev/reference/react/use), [Transition](https://react.dev/reference/react/useTransition), [deferred values](https://react.dev/reference/react/useDeferredValue). Stable-promise and independent-Transition probes executed. |
| Optimism, Actions, DOM forms | `use-optimistic`, `use-action-state`, `form-actions`, `optimistic-forms`, `submission-states`, `use-form-status` | Distinguishes temporary and confirmed state, queued action-state dispatches, function-action resets, client Actions versus Server Functions, and react-dom Hook origin. Fixed CONTENT-002. [useOptimistic](https://react.dev/reference/react/useOptimistic), [useActionState](https://react.dev/reference/react/useActionState), [useFormStatus](https://react.dev/reference/react-dom/hooks/useFormStatus). Actual optimism/validation/success examples executed. |
| Server/client, hydration, streaming | `server-components`, `client-boundaries`, `server-client-rendering`, `hydration`, `streaming`, `server-functions` | RSC is not SSR; client code can be prerendered; import boundaries differ from render ancestry. Serializability, server input validation, streaming status limits, and hydration matching are covered. [use client](https://react.dev/reference/rsc/use-client), [Next boundaries](https://nextjs.org/docs/app/getting-started/server-and-client-components), [hydrateRoot](https://react.dev/reference/react-dom/client/hydrateRoot). Framework endpoint behavior was not fully executed. |
| Error handling and recovery | `error-boundaries`, `error-recovery-boundaries`, `error-handling` | Fixed CONTENT-004; descendant synchronous Effect failures reach a boundary, while ordinary asynchronous callbacks need their own handling. [Component](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary). Render-failure example and Effect-failure probe executed. |
| Context and reducers | `use-context`, `react-create-context`, `context-data-flow`, `context-providers`, `use-reducer`, `reducer-patterns` | Nearest provider, Object.is, default versus undefined, state/dispatch splitting, reducer purity, and queued snapshots reviewed. [useContext](https://react.dev/reference/react/useContext), [useReducer](https://react.dev/reference/react/useReducer). |
| External state | `use-sync-external-store`, `external-stores` | Stable immutable snapshots, stable subscriptions, matching server snapshots, blocking store mutations, and per-request server state caveats reviewed. [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore). Store subscriber example executed. |
| Recent APIs and refs | `advanced-refs`, `ref-props`, `use-imperative-handle`, `use-id`, `version-sensitive-features`, `react-activity`, `react-view-transition` | React 19 ref props/cleanup, 19.2 Activity/Effect Events, and 19.3 Fragment refs/ViewTransition/browser availability checked. [19.3 release](https://react.dev/blog/2026/09/09/react-19-3), [Activity](https://react.dev/reference/react/Activity), [ViewTransition](https://react.dev/reference/react/ViewTransition). Rendering imported client Context from an RSC is supported in 19.3; creating/reading Context there is still unsupported. |

Detailed original claims, corrections, applicability, source versus runtime evidence, and final status are in [findings.md](findings.md). Other lessons received structural/automated checks and source-link checks; this report does not imply an equally deep editorial pass on every lower-risk lesson.

## Documentation conflict resolved with installed-runtime evidence

The [19.3 release changelog](https://react.dev/blog/2026/09/09/react-19-3#changelog) explicitly describes independent Transition rendering and links [upstream #37290](https://github.com/react/react/pull/37290), which enables that behavior. This establishes the release boundary independently of the probe. useTransition/startTransition reference caveats still describe batching multiple Transitions. The sibling-transition probe uses installed React 19.3.1 and demonstrates a fast Transition committing while another sibling remains suspended, repeated in the fresh review run. Both lessons cite the precise changelog section and avoid promises about batching or commit order for shared state or arbitrary asynchronous Actions. Sequential dispatches within one useActionState queue remain sequential.

## Example inventory and verification

| Classification | ED-013 records | Verification |
| --- | ---: | --- |
| complete | 251 | Individually compiled; selected browser examples and 17 Vitest files executed |
| client | 71 | Individually compiled with DOM types; selected actual browser execution |
| snippet | 57 | Context-wrapped compilation for TS/TSX; three text-only CSS/config fragments reviewed as illustrative |
| external | 15 | Documentation/API review; packages not installed or executed |
| server | 8 | Individually compiled; server/RSC constraints and explicit application assumptions reviewed |
| framework / pseudocode | 0 | None classified this way |
| **Total** | **402** | **384 TS/TSX examples individually compiled; 15 external and 3 text fragments excluded** |

The four older articles contain 43 additional distinct code records without ED-013 classifications. Their existing per-article compiler/context tests still pass. The historical 402 total refers to the 115 ED-013 lessons, not every displayed example in all 119 articles. Records can also be rendered in concept visuals; this is a content-record inventory, not a count of DOM `<pre>` occurrences.

The isolated compiler forces each example into a module and supplies only its own context. Only the three partial lazy examples receive their documented neighbouring-module declarations. Five complete/client/server examples contain explicit ambient stand-ins; these pass types but are not runnable integrations without user code. No unsafe casts were added to pass checking. No classification was upgraded to runtime-verified merely because it compiled.

## All 15 external examples

Full exact code, file paths, section locations, and labels are in [external-examples.json](external-examples.json). The table records review of every external block. RTL/user-event/jsdom have **no installed version here**, so installed-version compatibility and execution cannot be claimed. API shapes were compared with current official RTL docs and user-event v14 docs. The NextConfig option was compared with Next 16.4.5 documentation and installed project types; the compiler plugin remains absent.

| Topic / example | Dependency and completeness | Review result; execution |
| --- | --- | --- |
| react-compiler / install-command | Babel compiler plugin; shell instruction | Official Next setup requires plugin; command not run |
| react-compiler / next-config | NextConfig plus Babel compiler plugin; illustrative configuration | `reactCompiler: true` matches official setup; compiler not enabled/run |
| testing-components / rtl-test | RTL + user-event + DOM environment; self-contained test/component | render/screen/setup/await-click shapes match; not executed |
| react-testing-library / render-screen | RTL + jsdom; self-contained test/component | Explicit jsdom and cleanup; supported role query; not executed |
| react-testing-library / user-event-form | RTL + user-event + DOM environment; self-contained test/component | Awaited type/click and mock assertion; not executed |
| react-testing-library / review-reminder | RTL screen; partial reminder | Description states missing import/package; not executed |
| testing-interactions / todo-flow | RTL + user-event + caller’s TodoApp | Explicit assumed local component; not executed |
| testing-interactions / keyboard-flow | RTL + user-event + caller’s ConfirmPanel | Escape/focus assertions are valid contracts, dependent on caller’s dialog; not executed |
| testing-interactions / review-reminder | RTL + user-event; partial reminder | Assumes user setup and screen; not executed |
| testing-async-ui / find-by-example | RTL + caller’s UserName + DOM environment | Awaited findByText and fetch stub; assumes the caller’s loading contract; not executed |
| testing-async-ui / wait-for-example | RTL + user-event + caller’s SaveForm | waitFor retry assertion and awaited click; not executed |
| testing-async-ui / review-reminder | RTL + expect; partial reminder | Awaited findByRole alert; not executed |
| testing-custom-hooks / hook-test-component | RTL + user-event + caller’s useToggle | Tests via visible component; not executed |
| testing-custom-hooks / render-hook-example | RTL + caller’s useCounter | renderHook/initialProps/rerender/act API shapes match; not executed |
| testing-custom-hooks / review-reminder | RTL + caller’s useCounter; partial reminder | renderHook and result.current explanation match; not executed |

References actually consulted: [RTL API](https://testing-library.com/docs/react-testing-library/api/), [user-event introduction](https://testing-library.com/docs/user-event/intro/), [Next compiler setup](https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler). All external blocks describe their external-package requirement. Review snippets intentionally assume preceding imports/setup. No new dependency is needed to view this site; optional full execution would require a separately reviewed dependency change.

## Limits

Not runtime-verified: every branch of every example, live network APIs, server authentication/database stand-ins, deployed Server Functions, a full RSC build of the examples, external testing packages, every browser’s ViewTransition support, or every scheduling relationship. The website’s own static build does not execute displayed example strings. These limits remain visible in ED014-TEST-001 and the release assessment.
