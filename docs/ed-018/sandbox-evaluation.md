# ED-018 sandbox technology evaluation (Phase 2)

Evidence gathered 2026-11-08 from the npm registry (`npm view`), the published Sandpack tarballs, the Sandpack GitHub repository/API and docs, Bundlephobia, and the Next.js 16.4.5 docs bundled in `node_modules`. Nothing was installed.

## Requirements recap

Edit TSX for a small React exercise, run it, see it rendered, get compile/runtime errors, reset to starter code, leave the page without side effects. User code is untrusted. The app is static Next.js 16 / React 19.3.1 on Vercel with no CSP today.

## Candidates

### A. Sandpack (`@codesandbox/sandpack-react` 2.20.0, `@codesandbox/sandpack-client` 2.19.8)

Facts verified:

- Latest release 2.20.0 on 2025-02-14 ("feat: update to react 19 (#1251)"); peer range `react ^16.8 || ^17 || ^18 || ^19`. Last push to the repo 2025-04-24; 164 open issues.
- Maintenance: in issue [#1243](https://github.com/codesandbox/sandpack/issues/1243) maintainers said in 2025 that it was still maintained but neglected. A March 2026 comment quotes an announcement that Sandpack "is no longer actively maintained" with "no further feature development or official support". I could not find the original announcement; secondary sources ([Hashnode](https://hashnode.com/posts/how-to-build-interactive-code-playgrounds-with-sandpack-2026-edition/69ba537bc22d3eeb8a4e1574), [Stork](https://www.stork.ai/en/codesandbox)) repeat it. **Treat as reported, unconfirmed but credible.**
- Preview runs on a CodeSandbox-hosted bundler: default `bundlerURL` is `${version}-sandpack.codesandbox.io` (reachable today, HTTP 200). Packages are fetched from `prod-packager-packages.codesandbox.io`. Learner code is posted to that third-party origin.
- The published client sets the preview iframe to `sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts allow-downloads allow-pointer-lock"`. **Isolation comes entirely from the third-party origin, not from the sandbox attribute.** User code can open popups, show modals, submit forms, start downloads, and make arbitrary network requests. We cannot set CSP on CodeSandbox's origin.
- Self-hosting the bundler means building the `codesandbox-client` monorepo (`yarn build:deps && yarn build:sandpack`) and hosting the `www` output on a separate origin.
- Bundles CodeMirror 6, `@stitches/core` (runtime CSS-in-JS; SSR needs `getSandpackCssText`), `react-devtools-inline` 4.4.0, `react-is` ^17. `sandpack-client` unpacked size is 67 MB (includes Nodebox and static-server).

### B. Custom sandboxed iframe + browser transpiler (self-hosted)

A static preview document served by this app inside `<iframe sandbox="allow-scripts">` (no `allow-same-origin` → opaque origin). A small runtime bundle in the iframe holds React 19.3.1 (the version already installed), a transpiler, and a module loader that only resolves `react`, `react/jsx-runtime`, and `react-dom/client`. A strict static CSP header with the `sandbox` directive enforces isolation even if the URL is opened directly.

Transpiler options inside B:

| Option | Size (min / gzip) | Notes |
| --- | --- | --- |
| `sucrase` 3.35.1 | 198 KB / 44 KB | TS/TSX/JSX → JS, fast, **line-preserving** (runtime stack lines map 1:1 to the editor). Transform only, no type checking. No plugin API. |
| `acorn` 8.19.0 + `acorn-walk` 8.3.5 | 118 KB / 36 KB + 8 KB / 2 KB | Real ES parser over Sucrase output. Enforces the import allowlist, rejects `import()`, and injects loop guards. |
| `typescript` 6.0.3 (already installed) | 9.1 MB raw / 1.65 MB gzip unminified | `transpileModule` + custom transformer could do everything with zero new deps, but ships about 1 MB+ gzip into every preview. Rejected for weight. |
| `@babel/standalone` 8.1.1 | 2.2 MB / 560 KB | Plugin support, but about 10× Sucrase+Acorn. Rejected for weight. |
| `esbuild-wasm` 0.28.2 | 14.5 MB unpacked | No AST-level plugin hook for loop guards; large wasm download. Rejected. |

### C. `react-live` 5.0.1

Evaluates code with `new Function` **in the host page's realm**. That gives no isolation from the parent DOM, cookies, or storage, and it violates the ED-018 rule against `eval`/`new Function`. Rejected.

### D. StackBlitz (`@webcontainer/api` 1.6.4, `@stackblitz/sdk` 1.11.1)

WebContainers run Node in the browser and require the host page to be cross-origin isolated (COOP/COEP headers). That constrains the whole app's embeds and assets, cold boot is heavy (npm install inside the browser), and production use is subject to StackBlitz licensing terms. The SDK alternative embeds stackblitz.com, a third-party full IDE with no control over the editor UX or the preview CSP. Rejected as disproportionate for single-file React exercises.

## Comparison

| Criterion | A. Sandpack | B. Custom iframe (Sucrase + Acorn) | C. react-live | D. StackBlitz |
| --- | --- | --- | --- | --- |
| React 19 | Peer range OK (2.20.0); preview React version comes from the CDN package set | Uses the exact installed 19.3.1 | Peer OK | Any (npm in browser) |
| Next.js 16 | Client-only component; Stitches SSR CSS needs extra wiring; untested here | Plain client component + static asset; no framework coupling | Fine | Requires COOP/COEP on host pages |
| TS/TSX | Yes (bundler) | Yes (Sucrase; types stripped, not checked) | Via Sucrase internally | Yes |
| Isolation | Third-party origin; permissive sandbox incl. `allow-same-origin`, popups, forms | Opaque origin (`allow-scripts` only) + CSP `sandbox`; same site | **None** (same realm) | Third-party origin |
| Dependencies | Arbitrary npm via CodeSandbox CDN | Allowlist only (`react`, `react/jsx-runtime`, `react-dom/client`) | Scope object | Arbitrary npm |
| Editor | CodeMirror 6 built in | Separate decision (see below) | Plain textarea-style | Full IDE |
| Preview | Yes | Yes | Inline in page | Yes |
| Errors | Built-in overlay | Must build: compile (line/col), runtime, React root error callbacks | Basic | IDE-level |
| Network control | None (cannot set CSP on their origin) | `connect-src 'none'` and friends | None | None |
| Performance | Bundler iframe + CDN fetches per session | About 80 KB gzip runtime + React; no network after load | Small | Very heavy |
| Mobile | Usable; CodeMirror | Must design; CodeMirror or textarea | OK | Poor |
| Accessibility | CodeMirror a11y; overlay less controllable | Fully owned (labels, live regions, focus) | Limited | Third-party |
| Vercel | Static; runtime depends on codesandbox.io uptime | Static asset + `headers()`; no third-party runtime | Fine | Header constraints |
| Maintenance | Upstream reportedly unmaintained; third-party service risk | We own about 300–500 lines of runtime; well-maintained small deps | Low but insecure | Vendor/licensing |
| Privacy | Learner code sent to a third party | Stays in the browser | Stays in page | Third party |

## Decision (pending approval)

**Recommend B: a self-hosted, sandboxed iframe runtime using Sucrase + Acorn.** It is the smallest solution that is both viable and *stronger* than Sandpack on the properties ED-018 cares about: tighter sandbox flags, enforceable CSP and network denial, a dependency allowlist, no third-party runtime, and no learner code leaving the browser. It also avoids betting the feature on a reportedly unmaintained project and an external hosted bundler.

Why the alternatives were rejected:

- **Sandpack**: reported end of maintenance; hosted-bundler dependency on codesandbox.io; permissive sandbox flags we cannot tighten; no CSP control; learner code leaves the site; heavy dependency tree. It would be the fastest to demo, which is exactly the "visually impressive editor ≠ working environment" trap.
- **react-live**: same-realm `new Function`; no isolation.
- **StackBlitz**: COOP/COEP requirements, weight, licensing, third-party UX.
- **TypeScript / Babel standalone / esbuild-wasm as the transpiler**: 10–20× heavier than Sucrase + Acorn for no functional gain at this scope.

Honest limitations of B (also in [threat-model.md](threat-model.md)):

- The preview is **same-site** with the app, so browsers may run it in the same process and thread. An infinite loop that escapes the loop guards can freeze the tab, and the parent watchdog cannot run while the thread is blocked. Mitigation: compile-time loop guards plus run timeouts. Full mitigation is hosting the preview on a separate site later (a documented hardening step, not ED-018).
- We own the runtime code and its tests.

### Build approach for the preview runtime (no new tooling)

React 19 ships no UMD build, so the iframe needs a bundle. Use the **already-installed Vite 8** in library/IIFE mode to build `src/lab-runtime/` into `public/lab-runtime/runtime.js`, chained before `next build`. A static `public/lab-runtime/preview.html` loads only that external script, so the preview CSP needs no `'unsafe-inline'` scripts and no nonce. Rejected alternative: a Next.js route as the preview document. It would need a second root layout, its inline flight scripts would need `'unsafe-inline'`, its client router expects network and storage access that the opaque origin denies, and dev mode needs `'unsafe-eval'`.

## Dependencies requiring approval

All are MIT-licensed. The preview runtime packages would be bundled **only** into `public/lab-runtime/runtime.js`, never into app pages.

Required for option B:

| Package | Exact version | Purpose | Published | Transitive deps |
| --- | --- | --- | --- | --- |
| `sucrase` | 3.35.1 | TSX/TS → JS in the preview, line-preserving | 2025-11-19 | `@jridgewell/gen-mapping`, `lines-and-columns`, `ts-interface-checker` (+ CLI-only `commander`, `mz`, `pirates`, `tinyglobby`, which are installed but not bundled) |
| `acorn` | 8.19.0 | Parse transpiled JS: import allowlist, reject `import()`, loop guards | 2026-10-05 | none |
| `acorn-walk` | 8.3.5 | AST traversal for the above | 2026-02-19 | `acorn` |

Editor (separate choice):

| Option | Packages (exact) | Cost | Tradeoff |
| --- | --- | --- | --- |
| **E1 (recommended)** CodeMirror 6, minimal set, lazy-loaded on the lab route only | `@codemirror/state` 6.7.6, `@codemirror/view` 6.43.15, `@codemirror/commands` 6.11.1, `@codemirror/language` 6.13.1, `@codemirror/lang-javascript` 6.2.5 (pulls `@lezer/*`, `@codemirror/autocomplete`, `@codemirror/lint`, `crelt`, `style-mod`, `w3c-keyname`, `@marijn/find-cluster-break`) | Roughly 150–250 KB gzip on the lab route only (Bundlephobia per-package figures overlap; to be measured after install) | Syntax highlighting, indentation, undo history, touch support, screen-reader-labelled `contenteditable`, and Escape-then-Tab to leave the editor. Actively released in 2026. |
| E2 Native `<textarea>` | none | 0 KB | Fully accessible and mobile-native, but no highlighting or auto-indent, and Tab handling has to be built by hand. Acceptable for a PoC; weak learning UX. |

Explicitly **not** requested: `@codesandbox/*`, `react-live`, `@babel/standalone`, `esbuild-wasm`, `@webcontainer/api`, `@monaco-editor/react` (Monaco is heavy and poor on mobile).

Per the ED-018 decision gate, no dependency has been installed and no execution code has been written.
