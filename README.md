# Explain Dev

Complex development concepts, explained simply.

Explain Dev is a developer learning and reference project. **ED-011 is complete: Introduction to React is published as the first React Fundamentals article.** All three published articles offer Learn, Quick Review, and Interview modes. React retains its eight-group curriculum with 119 topics. Only Introduction to React, useState, and useEffect are published; the other 116 lessons are Coming soon. React is still the only available frontend technology; the other technologies and learning categories remain upcoming.

The approved ED-001/ED-002 foundation, responsive shell, typography, and themes are preserved. ED-003 provides the browser preferences repository and storage tests; there is still no bookmark, reading progress, or settings UI.

## Prerequisites

- A supported Node.js LTS release. This project was verified with Node **22.20.0**; `.nvmrc` selects the Node 22 LTS line. Use the latest available patch of Node 22. Node 24 and 26 LTS also satisfy the declared engine range.
- Yarn Classic **1.22.22**. Use Yarn exclusively; `yarn.lock` is the only package manager lockfile.

If your Node installation includes Corepack, you can activate Yarn with:

```sh
corepack enable
corepack prepare yarn@1.22.22 --activate
```

## Local development

```sh
nvm use
# If you do not use nvm, select a supported Node LTS version yourself.
yarn install --frozen-lockfile
yarn dev
```

Open http://localhost:3000.

| Route | Current behavior |
| --- | --- |
| `/` | Four category cards; Frontend Development links to its category page. |
| `/frontend` | Frontend introduction and seven technologies; React links to its introduction. |
| `/frontend/react` | React introduction, eight curriculum groups, and 119 topic cards; only Introduction to React, useState, and useEffect link to articles. |
| `/frontend/react/introduction-to-react` | Complete Introduction to React article covering components, props, JSX, rendering, common mistakes, and interview answers. |
| `/frontend/react/use-state` | Complete useState article, examples, mistakes, interview answers, and takeaways. |
| `/frontend/react/use-effect` | Complete useEffect article, dependencies, cleanup, Strict Mode, examples, mistakes, and interview answers. |
| Other `/frontend/*` routes | Default Next.js 404; unavailable technologies and topic routes have not been created. |
| `/backend`, `/fullstack`, `/devops` | Default Next.js 404; no placeholder routes or redirects. |
| Other unknown routes | Default Next.js 404. |

## Vercel deployment

The root `vercel.json` explicitly selects the Next.js framework, runs `yarn install --frozen-lockfile` and `yarn build`, and sets `outputDirectory` to `null` so Vercel detects the framework's output automatically. This overrides a custom output directory such as `dist`; see the [Vercel configuration reference](https://vercel.com/docs/project-configuration/vercel-json#outputdirectory).

In the Vercel project’s Build and Deployment settings, use:

- **Root Directory:** the repository root containing `package.json` and `vercel.json` (not `src` or `src/app`).
- **Framework Preset:** Next.js.
- **Build Command:** `yarn build`.
- **Install Command:** `yarn install --frozen-lockfile`.
- **Output Directory:** automatic; turn off the custom override rather than entering `dist`.

If a deployment reports `STATIC_BUILD_NO_OUT_DIR` for `dist`, check the framework preset and output override. Deploy a commit containing `vercel.json`, or correct the dashboard settings and redeploy. This application uses Next.js’s normal build output and Vercel integration; it is not configured to export a standalone static `dist` directory. A local build passing does not verify a Vercel deployment.

## Commands

```sh
yarn lint       # Next.js ESLint rules; warnings fail the check
yarn typecheck  # Strict TypeScript checking
yarn test       # Run storage, registry, navigation, and rendering tests once
yarn build     # Production build
yarn start     # Serve the production build after yarn build
```

## Stack and structure

- Next.js 16 App Router and React 19; Server Components by default.
- Strict TypeScript 6.0 and the `@/*` alias pointing to `src/*`.
- Tailwind CSS 4 with `@tailwindcss/postcss`. All theme tokens and the class-based dark variant live in `src/app/globals.css`; no JavaScript Tailwind configuration is needed. This follows the [Tailwind PostCSS setup](https://tailwindcss.com/docs/installation/using-postcss).
- shadcn/ui initialized manually through `components.json`, CSS variables, the `cn` utility, and the locally owned Button component, following its [manual installation approach](https://ui.shadcn.com/docs/installation/manual). Button uses Radix Slot, class-variance-authority, clsx, and tailwind-merge. Sheet uses Radix Dialog for modal semantics, keyboard focus management, Escape dismissal, and focus return. Controls use a 44px touch target.
- lucide-react icons and next-themes. Client Components are limited to theme controls, route-aware navigation, the mobile menu, Sheet primitives, and the two small article interaction boundaries (mode selection and answer reveals). The default is dark; next-themes manages preference persistence and its pre-hydration theme script. Application preferences have a separate focused repository; theme is not part of its schema.
- Inter is bundled from `@fontsource/inter` (Latin, weights 400–700), avoiding a remote font request during builds.
- ESLint flat configuration with Next.js accessibility, React, and TypeScript rules.

```text
src/app/                       Shared root layout, homepage, global styles
src/app/frontend/page.tsx       Server-rendered Frontend technology list and metadata
src/app/frontend/react/         Server-rendered React collection and static useState/useEffect article routes
src/components/layout/         Shared shell, header, sidebar, and mobile menu
src/components/navigation/     Typed category configuration and route-aware navigation
src/components/learning/       Topic cards, shared article chrome/sections, plain code blocks, and tests
src/components/theme-provider.tsx
src/components/theme-toggle.tsx
src/components/ui/             Locally owned shadcn/ui Button and Sheet
src/lib/utils.ts               Class name merging
src/lib/storage/               Preferences repository and colocated tests
src/lib/learning/              Technology, curriculum-group, and topic registries with tests
src/content/react/             Shared article types, separate article content, compiler helper, and tests
src/types/preferences.ts       Versioned preferences model
vitest.config.mjs              Minimal Node test environment and @ alias
```

The dependency lockfile pins actual resolved versions. TypeScript is held to 6.0 and ESLint to 9 because the current Next.js lint plugins do not declare compatibility with TypeScript 7 or ESLint 10. Yarn reports that ESLint 9 is no longer supported upstream; migrate when the Next.js plugins support ESLint 10. No authentication, APIs, database, search, bookmarks, or progress UI are included. useState and useEffect are the only published topics.

## Application shell

- The root layout mounts `AppShell` around page content. The shared shell owns the header, navigation, skip link, main landmark, and footer; pages supply their own headings and content.
- At 1024px and above, navigation appears in a sticky desktop sidebar. Smaller widths use a modal Sheet, leaving the full width available for content. Category cards use one column on mobile and two from 768px.
- `src/components/navigation/categories.ts` is the single source of category labels, descriptions, icons, and availability. The discriminated union requires an href for an available category and prevents one on upcoming categories. Only add an available link after implementing its route. Available navigation items use `aria-current` when their route or a descendant is active.
- Frontend Development is explicitly available at `/frontend`. Its homepage card and navigation entry use Next.js Link, with a visible arrow on the card and `aria-current="page"` on active navigation. The other three categories remain non-interactive with a visible “Coming soon” status and no href. Home remains available in both navigation layouts. useState and useEffect are the only published articles; search, bookmarks, and progress UI are not implemented.
- All five application routes inherit the same shell from the root layout. Learning pages and both articles are Server Components with page metadata; only the existing focused navigation component uses `usePathname()` for active state. Category display names are defined once in the shared configuration and reused by cards, navigation, and the Frontend heading.
- The menu closes on Escape, close-button activation, outside click, and navigation selection. Resizing to desktop dismisses it and focuses the visible home branding link rather than the now-hidden mobile trigger.

## Frontend technologies (ED-005)

The hierarchy is **Frontend Development → Technology → Topic**. Category and technology introductions have routes, and Introduction to React, useState, and useEffect each have a published article route. The other topic metadata entries remain upcoming. The single source of truth for technology IDs, names, descriptions, icons, status, and routes is `src/lib/learning/frontend-technologies.ts`.

| Technology | Status | Route |
| --- | --- | --- |
| HTML & CSS | Coming soon | — |
| JavaScript | Coming soon | — |
| TypeScript | Coming soon | — |
| React | Available introduction | `/frontend/react` |
| Next.js | Coming soon | — |
| Web Accessibility | Coming soon | — |
| Frontend Performance | Coming soon | — |

The registry follows the category configuration's discriminated union: available entries require an href, while upcoming entries cannot have one. `/frontend` renders its technology list directly from this registry, using semantic Next.js Links only for available entries. Upcoming entries have no handlers, links, buttons, or tab stops. There is no client state for this static presentation and no duplicate technology list in the global sidebar.

The React introduction reads its name and icon from the same registry. Its lightweight breadcrumb links Home and Frontend, then identifies React as the non-linked current page. The Introduction to React, useState, and useEffect cards link to their articles; every other curriculum card remains non-interactive.

The existing focused navigation Client Component keeps Frontend active on `/frontend` and `/frontend/react` using exact matches or a `/` segment boundary. `/frontend-tools` and other unrelated paths do not activate Frontend. The rest of the shell remains server-rendered. Theme configuration and the preferences repository are unchanged.

## React curriculum and topic metadata (ED-009)

The React technology page now organizes discovery into eight learning groups. These belong within React and do not add global navigation categories.

| Group | Topics |
| --- | ---: |
| React Fundamentals | 13 |
| State & Data Flow | 13 |
| React Hooks | 19 |
| Component Architecture | 14 |
| Forms & User Interaction | 12 |
| Performance & Rendering | 14 |
| Advanced React | 17 |
| Testing & Best Practices | 17 |
| **Total** | **119** |

`src/lib/learning/react-curriculum.ts` owns group IDs, titles, descriptions, and order. `src/lib/learning/react-topics.ts` remains the single topic-metadata registry: stable IDs, titles, short summaries, category/technology ownership, primary group, topic kind, explicit publication status, and order within the group. Hook and relevant API/component records also identify their package origin. Both registries use `as const satisfies` for compile-time validation while retaining literal types. Existing `ReactTopic`, `ReactTopicId`, and `reactTopics` exports remain available; topic IDs are inferred from the authored registry.

Every topic belongs to exactly one primary group. IDs are authored independently of groups or array indices. The six original Hook IDs, summaries, and relative order are preserved: `use-state`, `use-effect`, `use-ref`, `use-memo`, `use-callback`, and `use-context`. Conceptual lessons such as context/data flow or reducer patterns are distinct from canonical Hook records. No related-topic system was added.

**React API availability and Explain Dev article publication are separate.** The registry covers 18 verified stable React Hooks and one stable React DOM Hook, but only three topics have published articles and hrefs: Introduction to React, useState, and useEffect. The other 116 topics are `coming-soon` and have no href. The discriminated metadata type requires a route for available topics and prohibits one for upcoming topics; Hook kinds also require the matching package and Hooks group. Educational content, preferences, and progress are not stored in these registries.

The React page derives eight sections and a static keyboard-accessible table of contents from the registries. Each group has its description, h2, and ordered card grid. TopicCard retains h3 titles, summaries, status labels, and semantic Next.js Links with arrows for the two published articles. All other cards are plain articles with no controls, handlers, tab stops, or hover effects suggesting navigation. Repeated decorative brace icons were removed to keep the larger collection compact. The existing one/two/three-column grid, theme tokens, introduction, metadata, breadcrumbs, and shell remain. There is no scroll spy, client state, search, filter, or collapsed group.

### Verified API inventory

Reviewed against installed **react 19.3.1** and **react-dom 19.3.1**, their runtime exports, and official React 19.3 documentation:

- React Hooks: useState, useReducer, useActionState, useOptimistic, useContext, useRef, useImperativeHandle, useEffect, useLayoutEffect, useInsertionEffect, useEffectEvent, useMemo, useCallback, useTransition, useDeferredValue, useId, useSyncExternalStore, and useDebugValue.
- React DOM Hook: useFormStatus. Its package origin is `react-dom`.
- `use()` is classified as an API in Advanced React. It has different calling rules, including support for loops and conditions, while still requiring a component or Hook context. Its name does not make it a conventional Hook.
- `memo`, `lazy`, `createContext`, and React DOM's `createPortal` are APIs. Suspense, Activity, and ViewTransition are components. Custom Hooks are developer-created patterns. React Compiler is build tooling; merely installing React does not enable it. Client boundaries introduce the `use client` directive as a concept, not a Hook.
- `useEffectEvent` is supported by the installed release (introduced as stable in React 19.2). Activity is also available since 19.2; ViewTransition is present in the installed 19.3.1 exports and current stable documentation. Their cards remain unpublished. Adoption still requires checking browser, bundler, and framework support. React Server Components are distinguished from Next.js conventions; their integration infrastructure can be version-sensitive.
- Deprecated `react-dom.useFormState` remains exported for compatibility, but the canonical current Hook is `react.useActionState`; no duplicate lesson was added. `unstable_useCacheRefresh` is excluded from the stable Hook inventory. Legacy ref forwarding is covered conceptually alongside React 19 ref props, without treating forwardRef as a Hook or recommending it as the default modern pattern.

References: [React Hooks](https://react.dev/reference/react/hooks), [React DOM Hooks](https://react.dev/reference/react-dom/hooks), [React reference](https://react.dev/reference/react), [React APIs](https://react.dev/reference/react/apis), [Learn React](https://react.dev/learn), [use](https://react.dev/reference/react/use), [useEffectEvent](https://react.dev/reference/react/useEffectEvent), [React 19.2 release](https://react.dev/blog/2025/10/01/react-19-2), [Activity](https://react.dev/reference/react/Activity), [ViewTransition](https://react.dev/reference/react/ViewTransition), [React 19 rename/deprecation notes](https://react.dev/blog/2024/12/05/react-19), and [forwardRef](https://react.dev/reference/react/forwardRef). The supplied `/reference/react/compiler` URL returned 404; the official [React Compiler guide](https://react.dev/learn/react-compiler) was used instead. Export checks corroborate API presence; documentation establishes classification and release status.

## Published useState article (ED-007)

`/frontend/react/use-state` is the first published article route. It is a static App Router page using the existing shell, an article landmark, one primary heading, wrapping Home → Frontend → React → useState breadcrumbs, and a readable column capped at 48rem.

`src/content/react/use-state.ts` stores original prose and independently readable code strings in an explicit typed structure for this article. The topic registry continues to own identity, availability, route, and summary; the page uses the registry summary for its metadata. The shared types now live in `src/content/react/article-types.ts`. Article chrome and simple section/example presentation are shared through `src/components/learning/article-layout.tsx`; routes still compose their article-specific sections explicitly. There is no CMS, MDX, Markdown parser, generic nested-block renderer, or browser access in either content module.

The article covers:

- What useState returns and how state snapshots relate to renders.
- Practical use cases, derived values, and when refs are a better fit.
- Queued replacement versus functional updates, batching, equality bailouts, and pure updaters.
- Three complete TSX components: counter, controlled text input, and immutable typed object updates.
- Five common mistakes with corrections, seven interview questions and answers, and key takeaways.

A static table of contents points to the seven actual section IDs. The small server-rendered CodeBlock component uses native pre/code markup, a visible language label, and internal horizontal scrolling. Examples are displayed text only. There is no live execution, copy control, or syntax-highlighting dependency.

Technical explanations were reviewed against the official React documentation linked from the article: [useState](https://react.dev/reference/react/useState), [state snapshots](https://react.dev/learn/state-as-a-snapshot), [update queues](https://react.dev/learn/queueing-a-series-of-state-updates), [immutable objects](https://react.dev/learn/updating-objects-in-state), and [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks), with additional references for derived state, refs, and state lifetime. These are original explanations and examples. All three complete examples are strictly type-checked against the installed React types using TypeScript's existing compiler API and virtual files; no compiler dependency or runnable example route was added. Compilation verifies types and syntax, not the accuracy of educational claims, which were reviewed separately.

useEffect is now published alongside useState. The other four Hook URLs still return 404; no dynamic topic route, search, bookmark UI, progress UI, or backend was added.

## Published useEffect article (ED-008)

`/frontend/react/use-effect` adds the second article using the existing reading width, typography, static table of contents, breadcrumbs, CodeBlock, and application shell. Its original educational prose and code strings live in `src/content/react/use-effect.ts`, separate from registry metadata.

The nine sections cover Effect purpose and commit/SSR timing, practical use cases and alternatives, the three dependency-array forms and `Object.is`, setup/cleanup on dependency changes versus unmount, development Strict Mode caveats, complete TSX examples, seven mistakes with corrections, eight interview answers, and takeaways. The examples cover resize subscriptions, a configurable interval with a functional updater, and online/offline browser status. Each starts with an SSR-safe initial value and accesses browser APIs only inside setup. The browser online signal is described as a hint, not proof a service is reachable.

The model reuses ED-007's base types. `CommonMistake` has an optional list of code examples to support the useEffect derived-state correction. The original useState prose, code strings, and metadata are preserved. Its page delegates repeated chrome and section markup to shared components; ED-010 adds the learning presentation described below. No universal article renderer or new framework was added.

Technical claims were reviewed against [useEffect](https://react.dev/reference/react/useEffect), [synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects), [unnecessary Effects](https://react.dev/learn/you-might-not-need-an-effect), [removing dependencies](https://react.dev/learn/removing-effect-dependencies), and [StrictMode](https://react.dev/reference/react/StrictMode). Commit timing is distinguished from paint timing; empty dependencies are not presented as “exactly once”; cleanup and development checks are explained separately from unmounting.

Both articles' complete TSX examples use the same strict TypeScript compiler helper with virtual files. Focused useEffect tests compile the authored example strings in a Node VM with small Hook stubs, capture the actual setup closures, and invoke setup/cleanup to check event subscriptions, matching handler removal, timer cleanup, functional tick updates, connectivity changes, and absence of pre-setup browser reads. These tests do not emulate React scheduling or prove Strict Mode behavior, and no live example execution was added to the application. No new dependencies were installed.

## Interactive article pilot (ED-010)

ED-010 is a focused redesign of `/frontend/react/use-state` and `/frontend/react/use-effect`. It adds three learning modes to those two existing articles, not interactive content for all 119 curriculum topics. The curriculum, publication statuses, topic IDs, URLs, metadata, breadcrumbs, and global shell are unchanged.

- **Learn** is the default and retains every original technical explanation, complete TSX example, common mistake, question, answer, and takeaway. Its original seven/nine section anchors remain. The useState visual compares two replacement updates with two functional updates, using the original snippets and explicitly assuming count 0, the same event handler, and no other updates. The useEffect visual follows commit, setup, a changed-input commit, previous cleanup, new setup, and final unmount cleanup. Development Strict Mode checks and paint-timing caveats remain separate and visible.
- **Quick Review** is intentionally authored in each existing content module: definition, five key points, one syntax reminder, three common mistakes, an interview trap, and a final takeaway. It aims for a short recap without a claimed measured reading time. It preserves snapshot/queue/equality caveats for state and dependency/cleanup/Strict Mode caveats for Effects.
- **Interview** reuses all seven useState and eight useEffect question/answer records. Answers start hidden, toggle independently through Reveal/Hide answer buttons, and are presented as suggested answers. The reader is encouraged to explain first. There is no score, evaluation, timer, recording, or persistence.

`ArticleQuickReview` and `ArticleConceptVisual` are additive shared types in `src/content/react/article-types.ts`. Their data stays in the existing article modules. The original article properties are unchanged. `ConceptVisual` renders static semantic HTML and resolves any existing code examples by stable ID; no simulation, canvas, generated illustrations, or live code execution is used.

`ArticleModes` is a small Client Component receiving three **server-rendered ReactNode slots**. Static routes, headings, article composition, content modules, QuickReviewPanel, InterviewPanel, LearnInterview, ConceptVisual, and CodeBlock remain server components. InterviewPanel renders static questions and passes an answer node into the small client `AnswerReveal` boundary. No functions or non-serializable values cross the server/client boundary. This renders all three views in the initial HTML and hides inactive panels rather than importing the article renderer/content into the client bundle. The tradeoff is extra hidden markup and mounted answer controls; toggled answers retain their state while switching modes in the same page session. A reload or fresh navigation defaults to Learn and closed answers.

Mode controls use native buttons in a labelled group, with `aria-pressed`, `aria-controls`, labelled panel regions, visible selected underlining, and the existing focus tokens. This deliberately uses ordinary Tab/Shift+Tab and Enter/Space behavior rather than incomplete tab semantics. Switching modes does not change the URL, hash, query string, scroll position programmatically, or browser storage. Answer buttons expose `aria-expanded` and `aria-controls`, retain focus, and do not scroll programmatically. Inactive panels/answers use the native `hidden` attribute and leave the accessibility tree and tab order.

Progressive disclosure is limited to optional suggested answers in Learn using native `details`/`summary`; the essential lesson remains visible. These disclosures work with keyboard input and without JavaScript. With JavaScript disabled, the complete Learn view and its original anchors/code remain usable; a noscript note explains that mode switching and Interview buttons require JavaScript. No-JavaScript access to the alternate modes is not implemented. No new colors, dependencies, global CSS, sticky controls, or animations were added.

New text was reviewed against [useState](https://react.dev/reference/react/useState), [state snapshots](https://react.dev/learn/state-as-a-snapshot), [queued updates](https://react.dev/learn/queueing-a-series-of-state-updates), [useEffect](https://react.dev/reference/react/useEffect), [synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects), [unnecessary Effects](https://react.dev/learn/you-might-not-need-an-effect), and [StrictMode](https://react.dev/reference/react/StrictMode). Answer controls follow the [WAI disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/). Complete examples still use the existing strict compiler checks; short reminders are additionally compiled inside their stated component context. Node tests exercise the real interaction handlers using small Hook stubs, while browser checks cover actual hydration, keyboard events, visibility, focus, and scrolling. Hook stubs are not a DOM or React scheduler emulator.

## Published Introduction to React article (ED-011)

`/frontend/react/introduction-to-react` is the first published React Fundamentals article. It publishes the existing `react-introduction` topic: only that entry's status and href changed, and its ID, title, summary, group, kind, and order are preserved. The registry remains at 119 topics, with 3 published and 116 Coming soon.

The article is a static Server Component route using the existing ArticleLayout, ArticleModes, panels, CodeBlock, and AnswerReveal. Its content lives in `src/content/react/introduction-to-react.ts`, separate from the topic metadata. There is no CMS, MDX, dynamic route, or new dependency.

- **Learn** has twelve sections: what React is, why to use it (with tradeoffs), declarative versus imperative UI, components, props and data flow, JSX, rendering, React versus JavaScript, when to use React, common mistakes, interview questions, and key takeaways. Interview answers use the same native disclosures as the earlier articles; the rest of the lesson stays visible.
- **Quick Review** is authored separately: a definition, six key points, one short TSX reminder, three common mistakes, the "entire DOM" interview trap, and a takeaway.
- **Interview** has twelve questions, including the ten core ones, with independent Reveal/Hide controls. There is no scoring, persistence, or evaluation, and the questions are not presented as verified for any specific company.
- **Examples:** twelve code blocks in Learn (eleven complete TSX components and one imperative TypeScript snippet), plus one review reminder, all checked by the existing strict `typecheckExamples` helper. Code that illustrates a mistake appears only in comments, so everything displayed compiles. The imperative snippet is labelled as a single DOM update rather than an equivalent counter.
- **Visuals:** a component tree (App, then Header, MainContent, and Footer) and a four-step update flow, labelled as a simplified model in which not every render causes DOM mutations.

One additive type supports the tree. `ArticleHierarchyVisual` lets `ConceptVisual` render a nested list, because numbered steps would imply a sequence that component nesting does not have. Existing `ArticleConceptVisual` data and rendering are unchanged. Comparison cards are a small helper local to this route.

The `/frontend` and `/frontend/react` pages and the React page metadata named only the two earlier articles, so that copy was corrected along with its tests. The layout is unchanged.

Explanations were reviewed against the official docs: [Quick Start](https://react.dev/learn), [Describing the UI](https://react.dev/learn/describing-the-ui), [Your First Component](https://react.dev/learn/your-first-component), [Passing Props](https://react.dev/learn/passing-props-to-a-component), [Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx), [Render and Commit](https://react.dev/learn/render-and-commit), [State as a Snapshot](https://react.dev/learn/state-as-a-snapshot), [Queueing State Updates](https://react.dev/learn/queueing-a-series-of-state-updates), [Creating a React App](https://react.dev/learn/creating-a-react-app), and the [React reference](https://react.dev/reference/react). The text is original rather than copied from them.

## Browser preferences (ED-003)

This is persistence infrastructure for future features, not a bookmark or reading progress feature. No current component imports the repository, and opening the homepage does not create a preferences entry.

The single localStorage key is **`explain-dev:v1:preferences`**. It stores only this schema:

```ts
interface UserPreferences {
  version: 1;
  bookmarkedTopicIds: string[];
  readTopicIds: string[];
}
```

The focused API is exported from `src/lib/storage/preferences.ts`:

| Function | Behavior |
| --- | --- |
| `getPreferences()` | Returns a validated snapshot, or fresh defaults with empty arrays. Never writes, removes, repairs, or migrates data. |
| `savePreferences(preferences)` | Validates at runtime and writes a JSON snapshot; returns `true` on success, `false` for invalid input, unavailable storage, or a write failure. |
| `clearPreferences()` | Removes only the preferences key; returns `true` on success (including an already-missing key), `false` if storage is unavailable or removal fails. Never calls `localStorage.clear()`. |

Validation requires exactly the three own schema fields, literal version `1`, and arrays containing only strings. Malformed JSON, missing/extra fields, incorrect types, and unsupported versions return defaults without changing the stored data. The exported `DEFAULT_PREFERENCES` object and its nested arrays are frozen; each fallback read returns new mutable arrays, and valid reads return independent snapshots. No schema-validation dependency is needed.

Storage is accessed only inside guarded function calls. Module initialization does not touch browser APIs. Without `window`, reads return defaults and writes/clears return `false`. Future UI consumers should call this API from browser interactions or after mounting, rather than reading storage during server rendering. This milestone adds no React storage hook, provider, or global state.

Persistence limitations:

- Data remains in the user's browser and does not synchronize across devices. No account or backend is used.
- Clearing browser site data can remove preferences. Private browsing, blocked storage, and quota limits can prevent persistence; callers should handle the boolean failure result.
- Theme persistence remains managed separately by next-themes and is unaffected by clearing this repository's key.
- There are no migrations, storage event subscriptions, or concurrent update coordination. A successful save replaces the complete preferences snapshot. Educational content is never stored here.

Run `yarn test` for the colocated storage, registry, navigation, and page-rendering tests. Vitest uses a Node environment and a small mocked localStorage, with no DOM environment, React Testing Library, or added browser-test dependencies. Navigation tests render the real component with React’s existing server renderer and a mocked pathname. Vite is installed as Vitest's required peer dependency.

## Verification

Verified for ED-011 on Node 22.20.0:

- `yarn lint`: passed with zero ESLint warnings.
- `yarn typecheck`: passed with strict checking.
- `yarn test`: **309 tests passed** in 17 files. New checks cover registry publication, required sections and IDs, strict example compilation, mistakes, interview questions, Quick Review, visuals, rendering, anchors, breadcrumbs, and answer controls. The published-list assertions and page-copy assertions were updated to the three-article state.
- Three deliberate faults were each caught by the suite and then reverted: a type error in an example, an unpublished topic, and a flattened hierarchy.
- `yarn build`: passed. All routes, including the new article, are statically generated.
- Cached Chromium headless shell 156 ran **425 passing checks with no console issues** against the production build at 375, 768, 1024, and 1440px in both themes. They cover the curriculum card, direct load and refresh, breadcrumbs, anchors, all three modes, keyboard reveal and hide, retained focus, no automatic scrolling, focus indicators, a full Tab pass with no trap, inactive modes not being focusable, heading order, code blocks, both visuals, sampled text contrast of at least 4.5:1, the mobile Sheet, sidebar, theme switching and persistence, and the useState and useEffect articles. The first run reported 16 failures from two over-broad selectors in the temporary script; narrowing them showed 116 curriculum Coming-soon labels and hidden answers as expected.
- Article interactions left localStorage and the URL unchanged. Reflow passed at 320px and at a 720x450 viewport with DPR 2 in both themes. That is a 200% zoom equivalent, because real browser zoom controls were not available in the headless shell. With JavaScript disabled, Learn and its native disclosures stayed usable.
- A development-server pass over the curriculum and all three articles, including mode changes and answer reveals, reported no hydration warnings or console errors.
- Screenshots of the visuals, comparison cards, a mistake, Quick Review, Interview, and the Learn header were reviewed across a sample of widths and themes.
- `use-state.ts`, `use-effect.ts`, their routes, `package.json`, and `yarn.lock` are identical to the ED-010 commit.
- Not performed: testing in Firefox or Safari, testing with a screen reader, real browser zoom, or a complete WCAG audit. Contrast was sampled from computed colors, not audited for every state.

Verified for ED-010 on Node 22.20.0:

- `yarn lint`: passed with zero ESLint warnings.
- `yarn typecheck`: passed with strict checking.
- `yarn test`: **279 tests passed** in 15 files. New checks cover mode defaults/control relationships and real handler-driven selection, answer reveal/hide/independence, authored review structure and rendering, visual step identity, initially hidden suggested answers, and both short reminders compiled inside their stated component context. Existing page tests now scope original code checks to Learn and additionally assert every original paragraph, example description, mistake/correction, question/answer, and takeaway. Existing registry/navigation/storage and complete-example compiler/behavior suites passed. The first test run reported the two obsolete whole-page code counts after Review added another snippet; these assertions were updated to verify the preserved Learn code separately, retaining all original coverage. No tests were skipped or removed.
- `yarn build`: passed outside the sandbox to permit Turbopack's local worker port. No build failure or retry occurred. Both article routes and all earlier routes remain statically generated; no route was added.
- A read-only comparison evaluated the committed and current content modules and confirmed every pre-ED-010 data value is identical after excluding the two additive `quickReview` and `visual` properties. The first sandboxed comparison hit `EPERM` when spawning Git; the explicitly approved outside-sandbox retry passed. No article data was changed to satisfy this check.
- Four fresh cached Chromium headless-shell runs passed at **375×900, 768×900, 1024×900, and 1440×900**, checking both article routes in both themes and all three modes. Default Learn, programmatic/visible selection, independent Reveal/Hide answers, Enter/Space behavior, visible focus, focus retention, unchanged URLs/hashes, no extra scrolling on activation, and no storage writes during mode/answer interactions passed. All original section anchors, expected code-block counts, metadata, breadcrumbs, direct loading, and refresh passed.
- Internal code scrolling passed, including native keyboard ArrowRight scrolling for overflowing blocks at 375px. Mode/answer controls met 44px height and labels were not clipped. Sampled visible leaf paragraph/list/link/code/status text met 4.5:1 contrast in both themes; no horizontal page overflow or clipped headings was detected. Reduced motion was emulated. Long answers were revealed and checked.
- The existing sidebar, Frontend active state, mobile/tablet Sheet keyboard focus containment, Escape dismissal, focus return, navigation dismissal, theme switching/persistence, and byte-identical seeded preferences passed. Curriculum regression checks retained eight sections and 117 non-interactive upcoming cards. No unexpected console errors, page errors, or hydration warnings occurred.
- At 375px with JavaScript disabled, both routes retained visible Learn content and working keyboard-operated native answer disclosures. The first browser run stopped because Playwright's text selector skipped the noscript note; direct inspection confirmed its paragraph was visible. The test locator was corrected to `noscript p`, then the complete mobile run passed. No application change or browser crash was involved.
- Both articles and all modes passed **200% zoom-equivalent reflow** checks in both themes at a 720×450 CSS viewport with DPR 2, corresponding to a 1440×900 physical display. Actual browser chrome zoom was not available in headless shell; this is an equivalent viewport check, not a claim that browser zoom controls were exercised.
- Screenshots were captured for both articles, all widths/themes, Learn/Review/Interview views, and concept visuals. Mobile light review, desktop dark Interview, tablet light Learn, and desktop light state comparison were visually reviewed. Long element screenshots can include the existing sticky header during capture; viewport/layout assertions confirmed anchors cleared it.
- No dependencies, registry data, curriculum presentation, global shell, theme configuration/tokens, CodeBlock implementation, storage schema/repository, or deployment settings changed. Full Chromium was not retried after historical ED-006 crashes. Firefox, Safari, assistive-technology testing, and a full WCAG audit remain unperformed. Hook-stub unit tests do not emulate React scheduling or the DOM; browser checks provide actual interaction coverage.
- The temporary production server was stopped after verification.

Verified for ED-009 on Node 22.20.0:

- `yarn lint`: passed with zero ESLint warnings.
- `yarn typecheck`: passed with strict checking.
- `yarn test`: **265 tests passed** in 13 files. New coverage checks eight group identities/order/descriptions, topic identity and canonical ownership, kinds/package origins, all 18 React Hooks and the React DOM Hook against the reviewed inventory and installed exports, preservation of the original six records, exactly two published URLs, and absence of hrefs for all other topics. Grouped page tests verify metadata-driven cards, headings, anchors, unique rendering, and non-interactive upcoming cards. The former flat six-card assertion was replaced by grouped rendering checks; per-card checks now cover every topic. All existing article, TypeScript-example, storage, and navigation suites passed.
- `yarn build`: passed outside the sandbox to permit Turbopack's local worker port. No build failure or retry occurred. The route table is unchanged: `/`, `/frontend`, `/frontend/react`, both existing articles, the default not-found route, and the app icon. All application pages are statically generated.
- Four fresh cached Chromium headless-shell processes passed at **375×900, 768×900, 1024×900, and 1440×900 in both themes**. Each checked all five application routes, eight correctly ordered sections, 119 unique topic cards in their groups, two published links, 117 upcoming cards without controls, expected one/two/three-column layouts, all eight keyboard curriculum anchors, and both articles' existing section anchors.
- Both article routes passed card navigation, direct loading, refresh, unchanged metadata/breadcrumb hierarchy, expected section/code-block counts, and internal code scrolling. Curriculum breadcrumbs and Frontend active navigation passed. Mobile/tablet Sheet focus containment, Escape dismissal, focus return, and navigation dismissal passed. Theme switching/persistence and byte-identical seeded preferences passed.
- Within the available accessibility checks, headings remained unclipped, anchors cleared the sticky header, links displayed keyboard focus, tab navigation skipped upcoming cards, and sampled leaf paragraph/list/link/code/status text met 4.5:1 contrast in both themes. No horizontal page overflow, unexpected console errors, page errors, or hydration warnings occurred. Screenshots were captured at every width/theme; mobile dark introduction, mobile light Hooks, laptop dark Hooks, and desktop light introduction were visually reviewed.
- The first mobile run stopped on a browser-test assertion that checked a focus ring after anchor activation had moved focus to the target section. The assertion was corrected to inspect keyboard focus before activation, then the complete mobile run passed. No application source change was needed. No browser crashes occurred in ED-009. Full Chromium was not retried after the historical ED-006 crashes; Firefox, Safari, assistive-technology testing, and a full accessibility audit remain unperformed.
- Sandbox Yarn commands reported an unwritable preferred cache/global folder and used the writable temporary cache; lint, typecheck, and tests still passed. Browser QA used the existing cached browser and a temporary local production server, which was stopped after verification. No browser or project dependency was installed.
- Article content/routes/layout/CodeBlock, navigation, theme tokens/configuration, preference schema/repository, package manifest, lockfile, and deployment configuration are unchanged. ED-008 was committed separately as `4ddd82b` at the user's request. ED-009 was subsequently committed as `46fba00` at the user’s request before ED-010 began; nothing was pushed.

Verified for ED-008 on Node 22.20.0:

- `yarn lint`: passed with zero ESLint warnings.
- `yarn typecheck`: passed.
- `yarn test`: **138 tests passed** in 11 files. Coverage includes both available topics, four non-interactive upcoming topics, stable ordering, both article renderers, section anchors, breadcrumbs, metadata, unique content IDs, required mistakes/answers, and existing storage/navigation regressions.
- All six complete displayed TSX components across both articles passed strict semantic TypeScript checking with the installed React types. Focused useEffect setup/cleanup tests passed for resize subscriptions, intervals, and online/offline status; these invoke authored example closures with Hook stubs rather than emulate React scheduling. Educational claims were reviewed separately against the official references above.
- `yarn build`: passed. Both explicit article routes are statically generated. The build ran outside the sandbox to permit Turbopack's local worker port; no ED-008 build failure or retry occurred.
- Eight fresh cached Chromium headless-shell runs checked both articles at **375×900, 768×900, 1024×900, and 1440×900 in both themes**. Checks passed for direct loading and refresh, topic links and order, four non-interactive upcoming cards, breadcrumbs, metadata, semantic headings, and keyboard activation of every table-of-contents anchor. useEffect rendered nine sections/code blocks, seven mistakes, and eight interview answers; useState retained seven sections, six code blocks, five mistakes, and seven interview answers.
- Article width remained within 48rem. Long code lines scrolled internally, headings cleared the sticky header after anchor navigation, and no horizontal page overflow or clipped headings was detected. Sampled paragraph/list/link/code text met 4.5:1 contrast in both themes.
- Frontend active navigation, desktop sidebar, mobile/tablet Sheet focus containment, Escape dismissal, focus return, and navigation dismissal passed. Theme switching/persistence and unchanged seeded preference data passed. All four unpublished Hook URLs returned 404 without redirects.
- No unexpected console errors, page errors, or hydration warnings occurred. Headless-shell runs completed without crashes or retries. Full Chromium was not retried after the historical ED-006 crashes; this is not cross-browser verification or a complete accessibility audit.
- Screenshots were captured in both themes. Mobile light and desktop dark complete-example screenshots were visually reviewed with code scrolling reset to the start. A final production build and screenshot check included the final cleanup-wording clarification; the complete browser suite preceded that prose-only clarification.
- No dependencies, theme configuration, storage implementation, or preference schema changed. ED-008 was subsequently committed as `4ddd82b` at the user’s request before ED-009 began.

Verified for ED-007 on Node 22.20.0:

- `yarn lint`: passed with zero ESLint warnings.
- `yarn typecheck`: passed.
- `yarn test`: **120 tests passed** in nine files. Coverage includes useState-only availability and unchanged topic order, five upcoming cards with no hrefs or controls, content section/anchor integrity, unique code and interview IDs, required mistakes/answers, escaped pre/code output, breadcrumbs, metadata, and Server Component source directives. Existing storage tests and earlier suites remain; copy/status assertions were updated to reflect publication.
- The three complete displayed TSX components passed strict semantic TypeScript checking with the installed React types using virtual files. No example was executed as a live feature. Educational correctness was reviewed separately against the official React references linked above; tests alone do not establish technical accuracy.
- `yarn build`: passed with only the explicit `/frontend/react/use-state` article route added. The build ran outside the sandbox to permit Turbopack's local worker port; no ED-007 build failure or retry occurred.
- Fresh cached Chromium headless-shell processes passed at **375×900, 768×900, 1024×900, and 1440×900 in both themes**. Checks covered all four application routes, the available useState card, five non-interactive upcoming cards, direct article loading and refresh, all breadcrumbs, seven real table-of-contents anchors, six preformatted code blocks, five mistakes, and seven interview answers.
- Article width stayed within 48rem. Code scrolled internally when needed, with no horizontal page overflow or clipped headings. All section anchors left headings clear of the sticky header. Sampled article/link/code text met a 4.5:1 contrast ratio in both themes. Additional 375px and 1440px tests activated all seven section links by keyboard; at 375px, an overflowing code block accepted native focus and ArrowRight scrolling without a custom tabindex.
- Frontend remained active on the article route. Mobile/tablet Sheet keyboard focus, Escape dismissal, focus return, and navigation passed. Theme switching/persistence and unchanged seeded preference data passed. All five unpublished Hook URLs returned 404 without redirects.
- No console errors, page errors, or hydration warnings occurred in successful checks. Full Chromium was not retried after the ED-006 crashes; headless-shell runs completed without crashes. No new browser infrastructure dependency was added.
- Screenshots were captured in both themes. Desktop article light, mobile article dark, mobile code light, desktop code dark, and the React topic listing dark were visually reviewed. Code screenshot scroll positions were reset after overflow testing for that review.

Verified for ED-006 on Node 22.20.0:

- `yarn lint`: passed with zero ESLint warnings.
- `yarn typecheck`: passed.
- `yarn test`: **106 tests passed** in seven files. Registry tests cover six unique IDs/titles, Frontend/React ownership, explicit Coming-soon status, absence of hrefs, stable positive ordering, and non-empty summaries. Card/page tests cover semantic article/h3 markup, registry-driven titles and summaries, six status labels, and no controls or tab stops. The existing future-subject assertion was updated for the simplified coverage section; earlier test suites remain.
- `yarn build`: passed outside the sandbox to permit Turbopack's local worker port. Its route table remains `/`, `/frontend`, `/frontend/react`, the default not-found page, and the app icon; no topic routes were generated.
- The first full-Chromium run completed 375px and 768px, then its renderer crashed during the 1024px theme-toggle check. A fresh full-Chromium retry also crashed at tab creation before loading the app. The underlying browser crash cause was not established; no source changes were made in response.
- Retrying with the cached Chromium headless shell, using a fresh process per width, passed at **375×900, 768×900, 1024×900, and 1440×900 in both themes**. Each run verified all three application routes, all six titles/summaries/statuses, one/two/three grid columns, no card controls or tab stops, no pointer/hover affordance, no navigation after a card click, and keyboard tab order skipping the cards.
- Breadcrumb links, direct React loading, refresh, Frontend active state, mobile/tablet Sheet keyboard behavior and focus return, category/technology navigation, theme switching/persistence, and unchanged seeded preference data passed. No horizontal overflow or clipped headings was detected; sampled text contrast met 4.5:1 in both themes. Reduced motion was emulated.
- All six proposed topic URLs returned 404 without redirects. Unavailable technology/category routes also remained 404s. The intentional `/frontend-tools` 404 resource entry was excluded from unexpected-console-error checks.
- Successful headless-shell runs reported no unexpected console errors, page errors, or hydration warnings. Screenshots were captured at every width/theme; mobile React light, laptop React dark, desktop React light, and tablet Sheet dark were visually reviewed.

Verified for ED-005 on Node 22.20.0:

- `yarn lint`: passed with zero ESLint warnings.
- `yarn typecheck`: passed.
- `yarn test`: **90 tests passed** in five files. All ED-003/ED-004 tests remain; new coverage checks the seven-technology registry, stable IDs/order, React availability and route, non-interactive upcoming entries, names/descriptions, page headings, breadcrumbs, metadata, and the `/frontend-tools` active-state boundary.
- `yarn build`: passed with `/frontend/react` statically generated. The build ran outside the sandbox to allow Turbopack's local worker port; no ED-005 environment failures or retries occurred.
- Cached Chromium at 375×900, 768×900, 1024×900, and 1440×900 checked `/`, `/frontend`, and `/frontend/react` in both themes. Homepage → Frontend → React navigation, keyboard activation, breadcrumbs back to Frontend/Home, direct React loading, refresh, theme switching/persistence, and a shared header instance across client navigation passed.
- Frontend remained active on the nested React route in desktop and Sheet navigation. Mobile/tablet menu opening, navigation dismissal, modal keyboard focus containment, Escape/close controls, and focus return passed. No technology entries were added to the global sidebar.
- Seven technologies appeared in registry order; only React was a link. Upcoming entries and planned subjects had no controls or tab stops. No horizontal overflow or clipped headings was detected; breadcrumbs stayed inside the viewport. Sampled text contrast met 4.5:1 in both themes. Browser checks ran with reduced motion emulated.
- All six unavailable technology paths and a proposed React topic path returned 404 without redirects. `/frontend-tools` also returned 404 and did not activate Frontend. Its expected 404 resource console entry was excluded from unexpected-error checks.
- No unexpected console errors, page errors, or hydration warnings. Seeded preference data stayed unchanged. Screenshots were captured at every width/theme; desktop Frontend dark, mobile Frontend light, mobile React light, and tablet Sheet dark were visually reviewed.

Verified for ED-004 on Node 22.20.0:

- `yarn lint`: passed with zero ESLint warnings.
- `yarn typecheck`: passed.
- `yarn test`: **73 tests passed** in three files: all 59 existing storage tests plus 14 category/navigation tests. The new tests cover category count/order/uniqueness, explicit availability and routes, semantic links versus upcoming labels, Home navigation, active Frontend routes, and unrelated-path matching.
- `yarn build`: passed, including static generation of `/frontend`. The build ran outside the sandbox to permit Turbopack's required local worker port; there was no ED-004 build failure or retry.
- Cached Chromium at 375×900, 768×900, 1024×900, and 1440×900 verified both routes in light and dark themes: keyboard activation of the Frontend card, desktop navigation, Sheet Frontend selection and dismissal, active `aria-current`, modal focus containment, Escape/focus return, Home/back links, direct `/frontend` navigation, and refresh all passed.
- Both routes retained the same header instance and geometry during client navigation. Intended sidebar/menu breakpoints, no page overflow, sampled text contrast of at least 4.5:1, theme switching/persistence, and unchanged seeded preference data all passed. Browser checks ran with reduced motion emulated.
- Requests to `/backend`, `/fullstack`, `/devops`, and an unknown path returned 404 without redirects. Homepage metadata was preserved; Frontend metadata describes future learning content.
- No console errors, page errors, or hydration warnings. Screenshots were captured at each width/theme; desktop Frontend dark, mobile Frontend light, tablet navigation dark, and desktop homepage light were visually reviewed.

Verified for ED-003 on Node 22.20.0:

- `yarn lint`: passed with zero ESLint warnings.
- `yarn typecheck`: passed.
- `yarn test`: **59 tests passed** in one Node-based test file, covering valid and invalid reads/writes, blocked storage, quota failure, key isolation, module initialization, server-side execution, and default/snapshot mutation safety.
- `yarn build`: passed outside the sandbox, allowing Turbopack's PostCSS worker to bind its required local port. Homepage and app icon prerendered successfully.
- Reused cached Chromium for regression checks at 375×900 and 1440×900 in both themes: homepage, category statuses, links, navigation, theme persistence, keyboard behavior, and no horizontal overflow passed. Visiting the homepage, switching themes, and using navigation did not create a preferences entry.
- No browser console errors, page errors, or hydration warnings. No UI components or theme persistence code were changed in ED-003.

Verified for ED-002 on Node 22.20.0:

- `yarn lint`, `yarn typecheck`, and `yarn build`: passed. A final sandboxed build attempt was blocked from binding the PostCSS worker’s local port; moving aside the generated Turbopack cache and rerunning outside the sandbox succeeded without source changes.
- Chromium at 375×900, 768×900, 1024×900, and 1440×900 in light and dark themes: expected headings, four upcoming category cards, correct sidebar/menu breakpoint, no broken category links, and no horizontal overflow passed.
- Mobile/tablet Sheet: keyboard opening, focus containment, Escape dismissal, close button, outside click, Home selection, focus return, and closing on desktop resize passed.
- Theme preference after reload and skip-link focus passed. Browser tests ran with reduced motion emulated. Sampled body copy, availability badges, and active navigation text met a 4.5:1 contrast ratio in both themes.
- No browser console errors, page errors, or hydration warnings. Screenshots were captured for each width/theme and mobile/tablet menu states; desktop dark, mobile light, mobile dark menu, and tablet light menu screenshots were visually reviewed.

Verified for ED-001 on Node 22.20.0:

- `yarn lint`: passed with zero warnings.
- `yarn typecheck`: passed.
- `yarn build`: passed; homepage and app icon prerendered successfully.
- Chromium at 375×812 and 1440×900: HTTP 200, expected content, Inter loaded, dark default, light/dark toggling, preference persistence after reload, keyboard skip link and theme activation, and no horizontal overflow passed.
- Browser console and page error checks: no errors on the final build. Screenshots were captured for both widths and themes; mobile dark and desktop light screenshots were visually reviewed.

Browser checks used preinstalled Playwright/Chromium through a temporary script; they do not add a project test dependency. Cross-browser verification and a full accessibility audit have not been performed. To reproduce static checks, run the commands above.


## Next planned milestone

Recommended next: **Thinking in declarative UI**, the next React Fundamentals topic in curriculum order, as a separately approved publishing milestone. Only Introduction to React, useState, and useEffect are published. The other 116 topics, including the JSX and components lessons, remain a discovery plan rather than completed educational content.
