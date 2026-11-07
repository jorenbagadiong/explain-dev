# Explain Dev

Complex development concepts, explained simply.

Explain Dev is a developer learning and reference project. **ED-004 is complete:** Frontend Development is available at `/frontend`, with working category links, active navigation, and a category introduction. Backend Development, Full-Stack Engineering, and DevOps & Cloud remain **Coming soon**. Detailed learning content is not available yet.

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
| `/frontend` | Frontend introduction, planned coverage, and a coming-soon content message. |
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
yarn test       # Run storage and navigation tests once
yarn build     # Production build
yarn start     # Serve the production build after yarn build
```

## Stack and structure

- Next.js 16 App Router and React 19; Server Components by default.
- Strict TypeScript 6.0 and the `@/*` alias pointing to `src/*`.
- Tailwind CSS 4 with `@tailwindcss/postcss`. All theme tokens and the class-based dark variant live in `src/app/globals.css`; no JavaScript Tailwind configuration is needed. This follows the [Tailwind PostCSS setup](https://tailwindcss.com/docs/installation/using-postcss).
- shadcn/ui initialized manually through `components.json`, CSS variables, the `cn` utility, and the locally owned Button component, following its [manual installation approach](https://ui.shadcn.com/docs/installation/manual). Button uses Radix Slot, class-variance-authority, clsx, and tailwind-merge. Sheet uses Radix Dialog for modal semantics, keyboard focus management, Escape dismissal, and focus return. Controls use a 44px touch target.
- lucide-react icons and next-themes. Client Components are limited to theme controls, route-aware navigation, the mobile menu, and Sheet primitives. The default is dark; next-themes manages preference persistence and its pre-hydration theme script. Application preferences have a separate focused repository; theme is not part of its schema.
- Inter is bundled from `@fontsource/inter` (Latin, weights 400–700), avoiding a remote font request during builds.
- ESLint flat configuration with Next.js accessibility, React, and TypeScript rules.

```text
src/app/                       Shared root layout, homepage, global styles
src/app/frontend/page.tsx       Server-rendered Frontend introduction and metadata
src/components/layout/         Shared shell, header, sidebar, and mobile menu
src/components/navigation/     Typed category configuration and route-aware navigation
src/components/theme-provider.tsx
src/components/theme-toggle.tsx
src/components/ui/             Locally owned shadcn/ui Button and Sheet
src/lib/utils.ts               Class name merging
src/lib/storage/               Preferences repository and colocated tests
src/types/preferences.ts       Versioned preferences model
vitest.config.mjs              Minimal Node test environment and @ alias
```

The dependency lockfile pins actual resolved versions. TypeScript is held to 6.0 and ESLint to 9 because the current Next.js lint plugins do not declare compatibility with TypeScript 7 or ESLint 10. Yarn reports that ESLint 9 is no longer supported upstream; migrate when the Next.js plugins support ESLint 10. No authentication, APIs, database, content browser, search, or progress features are included.

## Application shell

- The root layout mounts `AppShell` around page content. The shared shell owns the header, navigation, skip link, main landmark, and footer; pages supply their own headings and content.
- At 1024px and above, navigation appears in a sticky desktop sidebar. Smaller widths use a modal Sheet, leaving the full width available for content. Category cards use one column on mobile and two from 768px.
- `src/components/navigation/categories.ts` is the single source of category labels, descriptions, icons, and availability. The discriminated union requires an href for an available category and prevents one on upcoming categories. Only add an available link after implementing its route. Available navigation items use `aria-current` when their route or a descendant is active.
- Frontend Development is explicitly available at `/frontend`. Its homepage card and navigation entry use Next.js Link, with a visible arrow on the card and `aria-current="page"` on active navigation. The other three categories remain non-interactive with a visible “Coming soon” status and no href. Home remains available in both navigation layouts. There are no topic cards, search, bookmarks, or progress features.
- Both `/` and `/frontend` inherit the same shell from the root layout. Frontend is a Server Component with page metadata; only the existing focused navigation component uses `usePathname()` for active state. Category display names are defined once in the shared configuration and reused by cards, navigation, and the Frontend heading.
- The menu closes on Escape, close-button activation, outside click, and navigation selection. Resizing to desktop dismisses it and focuses the visible home branding link rather than the now-hidden mobile trigger.

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

Run `yarn test` for the colocated storage and navigation tests. Vitest uses a Node environment and a small mocked localStorage, with no DOM environment, React Testing Library, or added browser-test dependencies. Navigation tests render the real component with React’s existing server renderer and a mocked pathname. Vite is installed as Vitest's required peer dependency.

## Verification

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

Proposed next: organize frontend technologies and their navigation, starting with a scoped technology registry. Technology routes, topic listings, and educational articles are future work and have not been implemented in ED-004.
