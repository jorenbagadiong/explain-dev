# ED-018 baseline — repository audit (Phase 1)

Audit date: 2026-11-08. Nothing in this phase modified application code, packages, or lockfiles.

## Git

- Branch `main`; remote `origin` → `https://github.com/jorenbagadiong/explain-dev.git`.
- ED-017 was committed immediately before this audit as `22aaec1 feat: add nested React lesson navigation (ED-017)`, on `main` as requested (no new branch). Before committing, the ED-017-only tree (HEAD `518d1d7` + the 12 ED-017 source/test files) was verified in a throwaway worktree: `yarn typecheck`, `yarn lint`, `yarn test` (25 files, 1,781 tests) and `yarn build` all passed. The worktree was removed afterwards.
- Still uncommitted and intentionally preserved: the ED-015 work (`README.md`, `src/app/globals.css`, `src/app/page.tsx`, `src/app/frontend/page.tsx`, `src/app/frontend/react/page.tsx`, six `src/components/learning/*` files, `src/components/visuals/`, `docs/ed-015/`) and the generated `next-env.d.ts` change. All 102 entries in `docs/ed-017/pre-existing-work.json` still match their recorded SHA-256 values after the commit. No reset, stash, clean, or overwrite.

## Runtime and tooling (installed versions)

| Item | Version |
| --- | --- |
| Node | 22.20.0 (`.nvmrc` = 22) |
| Yarn | 1.22.22 (Classic), `yarn.lock` only |
| next | 16.4.5 |
| react / react-dom | 19.3.1 |
| typescript | 6.0.3 (strict, `moduleResolution: bundler`, `@/*` → `src/*`) |
| tailwindcss | 4.3.5 via `@tailwindcss/postcss` |
| vite / vitest | 8.3.6 / 5.1.0 (vite is a devDependency; `rolldown` is present in `.bin`) |
| eslint | 9 with `eslint-config-next` core-web-vitals + typescript, `--max-warnings 0` |

There is **no** `next.config.*` file, no `proxy.ts`/`middleware.ts`.

## Routing and navigation conventions

- App Router, static file routes only. Each lesson is its own folder: `src/app/frontend/react/<slug>/page.tsx` (119 lessons + overview). No dynamic `[slug]` segment. Unknown routes 404.
- Root layout `src/app/layout.tsx` wraps everything in `ThemeProvider` (next-themes) and `AppShell` (header, sticky desktop sidebar, Radix Sheet mobile navigation).
- Categories are declared in `src/components/navigation/categories.ts`; React lesson navigation metadata is projected server-side by `src/lib/learning/react-navigation.ts` (ED-017).
- Lesson pages are Server Components composed from `ArticleLayout`, `ArticleSection`, `CodeBlock`, `ConceptVisual`, etc. Client Components are limited to theme controls, navigation, the Sheet, and two article interaction boundaries.

## Content and curriculum

- Static TypeScript content in `src/content/react/` (`lessons/*.ts`, typed by `article-types.ts`) and registries in `src/lib/learning/` (`react-topics.ts`, `react-curriculum.ts`, `frontend-technologies.ts`, `curriculum-manifest` tests).
- Code examples are display-only: `CodeBlock` renders `example.code` in a `<pre><code>`. There is no code execution anywhere in the app today.

## Theme and styling

- Tailwind v4 tokens and the class-based dark variant live in `src/app/globals.css`; shadcn/ui (new-york, CSS variables) with local `Button` and `Sheet`; lucide-react icons; dark default via next-themes.
- Component-scoped CSS modules are used for navigation (`navigation.module.css`).
- Inter is self-hosted via `@fontsource/inter` (no remote font requests).

## Tests

- Vitest, `environment: "node"`, `include: src/**/*.test.ts`. No jsdom/happy-dom and no browser test runner.
- Components are tested by `renderToStaticMarkup` + string/regex assertions; `next/navigation` is mocked with `vi.mock`. Content and registry integrity have dedicated tests.
- Browser verification in earlier milestones used ad-hoc scripts under `docs/ed-0xx/tools/` (`capture.cjs`, `verify-browser.cjs`) with recorded JSON/screenshots.

## Security headers and CSP

- **None.** No `headers()` config, no CSP, no `Permissions-Policy`, no `X-Frame-Options`/`frame-ancestors`. Next.js/Vercel defaults only.
- The app has no authentication, no cookies of its own, and no server endpoints. Client storage is limited to `localStorage` preferences (`src/lib/storage/preferences.ts`) and the next-themes `theme` key.
- Next 16's own CSP guide (bundled at `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`) states nonce-based CSP requires dynamic rendering. All current pages are statically prerendered, so any CSP for the coding preview should be a static header that needs no nonce.

## Deployment assumptions

- Vercel: `vercel.json` sets framework `nextjs`, `yarn install --frozen-lockfile`, `yarn build`, automatic output directory. devDependencies are installed during the Vercel build.
- No environment variables or secrets are referenced by the codebase.
