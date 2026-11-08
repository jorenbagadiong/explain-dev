# ED-018 implementation

## Git baseline

- Branch `main`. ED-017 was committed as `22aaec1` before this work began. ED-018 is **not committed, pushed, merged or deployed**.
- Preserved, uncommitted: the ED-015 work and the generated `next-env.d.ts` change. After all ED-018 work, every one of the 102 entries in `docs/ed-017/pre-existing-work.json` matches its recorded SHA-256.
- Note: `next build` (and therefore `yarn build`) regenerates `next-env.d.ts` in its build form. ED-018's builds did this once; the file was restored byte for byte to the recorded development-form variant. Expect the same after any local `yarn build`.

## Phases

1. **Isolation decision first.** Before any dependency was installed, a standalone probe ([tools/isolation-probe/](tools/isolation-probe/)) served a parent page and a preview with the exact proposed CSP and sandbox flags, on same-origin and cross-site ports. It attempted every escape listed in the brief. Results: [isolation-probe-chromium.json](isolation-probe-chromium.json) and [isolation-probe-headless-shell.json](isolation-probe-headless-shell.json). Decision and rationale: [security.md](security.md).
2. **Dependencies.** The eight approved packages were installed with exact versions; licenses and transitive packages were audited ([architecture.md](architecture.md)).
3. **Compiler and guard** (pure, tested in Node), then the **preview runtime** (Vite IIFE), the **protocol**, the **parent components**, the **routes** and the **navigation entry**.
4. **Verification** in Chromium, including negative security tests, then regression, performance and documentation.

## Exact files

Modified (tracked):

- `.gitignore`: ignores the generated `public/lab-runtime/runtime.js`
- `eslint.config.mjs`: ignores that generated file
- `package.json`: eight exact-version dependencies; `dev` and `build` run `build:lab-runtime` first
- `yarn.lock`
- `src/components/navigation/category-navigation.tsx`: Practice link
- `src/components/navigation/category-navigation.test.ts`: Practice tests appended; ED-017 assertions unchanged

Created:

- `next.config.ts`: preview-only security headers
- `vite.lab-runtime.config.mts`
- `public/lab-runtime/preview.html`, `public/lab-runtime/preview.css` (`runtime.js` is generated and ignored)
- `src/app/practice/page.tsx`, `src/app/practice/page.test.ts`
- `src/app/practice/react/use-state-counter/page.tsx`, `src/app/practice/react/use-state-counter/page.test.ts`
- `src/components/lab/challenge-page.tsx`, `code-editor.tsx`, `lab.module.css`, `practice-workspace.tsx`, `practice-workspace-loader.tsx`, `preview-frame.tsx`, `prototype-notice.tsx`, `lazy-boundary.test.ts`, `sandbox-config.test.ts`
- `src/content/labs/react/use-state-counter.ts`
- `src/lab-runtime/main.ts`, `execution-guard.ts`, `execution-guard.test.ts`
- `src/lib/lab/types.ts`, `challenges.ts`, `practice-route.ts`, `protocol.ts`, `compiler.ts`, `diagnostics.ts`, and `challenges.test.ts`, `compiler.test.ts`, `diagnostics.test.ts`, `protocol.test.ts`
- `docs/ed-018/`: these documents, tools, raw reports, logs and 18 screenshots

Not changed: lesson content, curriculum registries, existing routes, learning modes, the preferences storage utility and schema, theme tokens, `globals.css`, `vercel.json`, README (it carries uncommitted ED-015 edits, so it was left alone).

## Behavior

- **Desktop (≥ 1024 px):** toolbar (Run, Reset, shortcut hint, live status), then editor and preview side by side. Problems appear under the preview with message, line and column, a code frame from the learner's own source, and a React component stack, plus **Run again** and **Reset to starter**.
- **Mobile (< 1024 px):** an ARIA tablist (Code / Preview) with arrow, Home and End keys. Both panels stay mounted, so edits and undo history survive switching. Run switches to Preview.
- **Run:** button or Ctrl/⌘+Enter in the editor. The status shows "Code changed. Run to update the preview." after edits.
- **Reset:** restores the starter as one isolated, undoable transaction and re-runs it. The notice explains Ctrl/⌘+Z.
- **Keyboard:** Tab indents inside the editor; Escape then Tab leaves it (CodeMirror tab-focus mode; Ctrl+M / ⌥⇧M toggles it). The editor has an accessible name and description.
- **Errors handled:** JSX and TypeScript syntax errors, parser-detected JS errors, unsupported or dynamic imports, missing default export, oversized source, module-evaluation errors, render errors (`onUncaughtError`), event-handler and timer errors, unhandled rejections, Rules of Hooks errors (React development messages), the execution limit, render timeout (8 s), unresponsive preview (heartbeat, 5 s), preview init failure (10 s), navigation attempts, editor crash (boundary with "Reload editor"), and workspace chunk-load failure (boundary with "Reload page").
- **Limitations shown in the UI:** research prototype; types are removed, not checked; only `react` and `react-dom/client` can be imported; network is blocked; edits last only while the page is open.

## Defects found by verification and fixed

1. **Unused imports skipped the allowlist.** Sucrase elides unused imports, so `import lodash from "lodash"` compiled silently. Fixed with `keepUnusedImports: true`; covered by tests.
2. **Reserved-name check missed declarations.** acorn-walk does not report binding identifiers, so `function __labGuard() {}` could shadow the guard. Moved to a token-level check; covered by tests.
3. **Undo after Reset skipped the latest edit.** CodeMirror merged the programmatic reset with the previous history group. Fixed with a `reset` user event and `isolateHistory("full")`; covered by a browser check.
4. **`/practice` pulled in the workspace loader.** `/practice` is prefetched from the sidebar on every page. `PrototypeNotice` was moved to its own module; the lazy-boundary test now covers `/practice`.
5. **Touch targets.** Small `sm` buttons and inline links in the lab were raised to 44 px.
