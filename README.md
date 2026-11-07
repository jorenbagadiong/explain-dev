# Explain Dev

Complex development concepts, explained simply.

Explain Dev is a developer learning and reference project. **ED-001 implements the project foundation only:** a responsive homepage, light/dark themes (dark by default), and a shadcn/ui Button linking to the repository. Educational content and additional features are not implemented.

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

Open http://localhost:3000. The only application route is `/`.

## Commands

```sh
yarn lint       # Next.js ESLint rules; warnings fail the check
yarn typecheck  # Strict TypeScript checking
yarn build     # Production build
yarn start     # Serve the production build after yarn build
```

## Stack and structure

- Next.js 16 App Router and React 19; Server Components by default.
- Strict TypeScript 6.0 and the `@/*` alias pointing to `src/*`.
- Tailwind CSS 4 with `@tailwindcss/postcss`. All theme tokens and the class-based dark variant live in `src/app/globals.css`; no JavaScript Tailwind configuration is needed. This follows the [Tailwind PostCSS setup](https://tailwindcss.com/docs/installation/using-postcss).
- shadcn/ui initialized manually through `components.json`, CSS variables, the `cn` utility, and the locally owned Button component, following its [manual installation approach](https://ui.shadcn.com/docs/installation/manual). Button uses Radix Slot, class-variance-authority, clsx, and tailwind-merge. Its default controls use a 44px touch target.
- lucide-react icons and next-themes. Only the theme provider and toggle declare `use client`. The default is dark; next-themes manages preference persistence and its pre-hydration theme script. No custom storage utilities are present.
- Inter is bundled from `@fontsource/inter` (Latin, weights 400–700), avoiding a remote font request during builds.
- ESLint flat configuration with Next.js accessibility, React, and TypeScript rules.

```text
src/app/                       Root layout, homepage, global styles
src/components/theme-provider.tsx
src/components/theme-toggle.tsx
src/components/ui/button.tsx    Locally owned shadcn/ui Button
src/lib/utils.ts               Class name merging used by Button
```

The dependency lockfile pins actual resolved versions. TypeScript is held to 6.0 and ESLint to 9 because the current Next.js lint plugins do not declare compatibility with TypeScript 7 or ESLint 10. Yarn reports that ESLint 9 is no longer supported upstream; migrate when the Next.js plugins support ESLint 10. No authentication, APIs, database, content browser, search, or progress features are included.

## Verification

Verified for ED-001 on Node 22.20.0:

- `yarn lint`: passed with zero warnings.
- `yarn typecheck`: passed.
- `yarn build`: passed; homepage and app icon prerendered successfully.
- Chromium at 375×812 and 1440×900: HTTP 200, expected content, Inter loaded, dark default, light/dark toggling, preference persistence after reload, keyboard skip link and theme activation, and no horizontal overflow passed.
- Browser console and page error checks: no errors on the final build. Screenshots were captured for both widths and themes; mobile dark and desktop light screenshots were visually reviewed.

Browser checks used preinstalled Playwright/Chromium through a temporary script; they do not add a project test dependency. Cross-browser verification and a full accessibility audit have not been performed. To reproduce static checks, run the commands above.
