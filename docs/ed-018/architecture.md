# ED-018 Coding Lab architecture

Status: **research prototype**, verified in Chromium 156 only. See [security.md](security.md) for what is and is not guaranteed.

## Dependency decision

Approved by the project owner on 2026-11-08 after the Phase 2 evaluation ([sandbox-evaluation.md](sandbox-evaluation.md)). Installed with `yarn add --exact`; versions, licenses and transitive packages were checked before and after installation.

| Package | Version | Used in | Purpose |
| --- | --- | --- | --- |
| `sucrase` | 3.35.1 | preview runtime only | Strip TypeScript, compile JSX, convert ESM → CommonJS (line-preserving) |
| `acorn` | 8.19.0 | preview runtime only | Parse compiled JS for the module policy and guard insertion (already in the lockfile via ESLint; deduplicated) |
| `acorn-walk` | 8.3.5 | preview runtime only | AST traversal |
| `@codemirror/state` | 6.7.6 | Practice route (lazy chunk) | Editor state |
| `@codemirror/view` | 6.43.15 | Practice route | Editor view |
| `@codemirror/commands` | 6.11.1 | Practice route | Keymaps, history, tab-focus mode |
| `@codemirror/language` | 6.13.1 | Practice route | Highlighting, indentation |
| `@codemirror/lang-javascript` | 6.2.5 | Practice route | JSX/TSX language support |

New transitive packages: `@codemirror/autocomplete`, `@codemirror/lint`, `@codemirror/streamparser`, `@lezer/common`, `@lezer/highlight`, `@lezer/javascript`, `@lezer/lr`, `@marijn/find-cluster-break`, `crelt`, `style-mod`, `w3c-keyname`, `lines-and-columns`, `ts-interface-checker` (Apache-2.0), and Sucrase's CLI-only `commander`, `mz`, `thenify`, `thenify-all`, `any-promise`, `pirates` (installed, not bundled). All others are MIT. No further packages were added. `@lezer/highlight` is deliberately **not** imported directly; syntax colours are derived from `defaultHighlightStyle.specs`.

Sandpack, react-live, Babel standalone, esbuild-wasm, WebContainers and Monaco were rejected in Phase 2.

## Runtime architecture

```
 Practice route (app origin, trusted)                     Preview (opaque origin "null", untrusted)
 ───────────────────────────────────                      ─────────────────────────────────────────
 Server Components: challenge text, requirements, notice   /lab-runtime/preview.html  (static, no inline script)
 └─ PracticeWorkspaceLoader  (client, next/dynamic ssr:false)   └─ /lab-runtime/runtime.js (Vite IIFE, React 19.3.1 dev build,
    └─ PracticeWorkspace  (state: code, run, status)                 Sucrase, Acorn, guard, module loader)
       ├─ CodeEditor (CodeMirror 6)                                  1. refuses to run unless self.origin === "null" inside a frame
       └─ PreviewFrame key={runId}                                   2. posts hello → parent origin
          <iframe sandbox="allow-scripts">  ── hello ◄────────────── 3. accepts one init (source === parent, origin === app,
          validates source + origin "null" + schema                     schema, exactly one port)
          ── init {session, runId, file} + MessagePort ──────────►   4. compiles → compile-error, or
          ◄── port: heartbeat / rendered / compile-error /             blob: script → factory(require, module, exports, guard)
                    runtime-error (session + runId checked)          5. createRoot(...).render(<App/>) → rendered
          watchdogs: hello 10 s, render 8 s, heartbeat 5 s,          heartbeat every 1 s; errors via onUncaughtError,
          second load event ⇒ navigation ⇒ remove iframe              window error, unhandledrejection, execution guard
```

- **One run = one fresh iframe.** `PreviewFrame` is keyed by `runId`; disposing removes the iframe, which discards its document, timers and listeners. Verified: one iframe after 15 runs; no busy renderer after removal.
- **Compilation happens inside the preview.** The parent never parses or executes learner code. The compiler (`src/lib/lab/compiler.ts`) is pure and also unit-tested in Node.
- **Execution** uses a `blob:` script in the opaque-origin document. No `eval` or `new Function` anywhere (the preview CSP forbids both).
- **Module policy:** static imports of `react`, `react-dom`, `react-dom/client` and the JSX runtimes only. Dynamic `import()`, `import.meta`, `require()`, top-level `await`, re-exports from other modules and names starting with `__lab` are compile errors. A default export is required.
- **Execution guard** (`src/lab-runtime/execution-guard.ts`): a call at every function entry and loop iteration throws once the current task has run > 1 s without reaching a macrotask (MessageChannel reset). Sticky once tripped. Defense in depth only.
- **React development build** in the preview, so learners get full error messages (for example the Rules of Hooks error) and component stacks. The parent app's React build is unchanged.

## Challenge model

`src/lib/lab/types.ts` defines `LabChallenge`: stable `id`, route `slug`, `technologyId`, existing `lessonId`, `title`, `description`, `difficulty`, `instructions`, `requirements`, `hints`, `starterFiles` (first file is rendered). Content lives in `src/content/labs/react/*.ts`; the registry and lesson resolution in `src/lib/lab/challenges.ts`. Lesson titles, routes and group names are resolved from `reactTopics` / `reactCurriculumGroups` and never copied (enforced by tests).

First challenge: `react-use-state-counter` → `/practice/react/use-state-counter`, lesson `use-state`, group React Hooks, beginner. Starter renders `Count: 0` with three TODO handlers.

## Routing and navigation

- `/practice` — Server Component index listing challenges with links to their lessons.
- `/practice/react/use-state-counter` — static route folder, matching the lesson-per-folder convention. The challenge page is server-rendered; only the workspace is a client boundary, loaded with `next/dynamic` (`ssr: false`).
- Shared `CategoryNavigation` (desktop sidebar and mobile Sheet) gains a **Practice** link after Home, with `aria-current="page"` on `/practice` and `"location"` on descendants. It imports only `src/lib/lab/practice-route.ts` (a constant), so global navigation carries no challenge data. ED-017 behavior is unchanged (1 280 + 171 ED-017 checks re-run).
- `PrototypeNotice` is its own module so `/practice` (prefetched from the sidebar on every page) does not pull in the workspace loader.

## State

Edited code lives in `PracticeWorkspace` state for the session. Mobile tabs only toggle visibility, so switching views never unmounts the editor. Reset restores the starter as a single, isolated, undoable CodeMirror transaction and re-runs it. No drafts are persisted; no storage keys are added; the preferences schema is untouched (verified).

## Build

`yarn build` = `yarn build:lab-runtime && next build`. `build:lab-runtime` runs the already-installed Vite 8 with `vite.lab-runtime.config.mts` (library mode, IIFE, `process.env.NODE_ENV="development"`) to produce `public/lab-runtime/runtime.js` (git-ignored, regenerated on every build and on `yarn dev`). `next.config.ts` adds response headers for `/lab-runtime/:path*` only. Vercel's `yarn build` command picks this up unchanged.

## Future architecture decisions (not taken in ED-018)

1. **Dedicated preview site** (for example a separate Vercel project on its own registrable domain) — recommended before any authentication or user data. See [security.md](security.md).
2. Type checking (would require the TypeScript compiler, ~1.6 MB gzip, ideally in a worker).
3. Multi-file challenges, console output panel, automated grading (tests executed inside the sandbox, results reported over the port).
4. Persisted drafts under a separate versioned storage key with reset.
5. Cross-browser verification (Firefox, Safari/WebKit, mobile devices).
