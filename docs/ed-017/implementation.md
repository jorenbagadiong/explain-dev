# ED-017 sidebar lesson navigation

Follow-up: Frontend Development and React now have independent parent disclosure controls. See [collapsible-parents.md](collapsible-parents.md) for the latest behavior and verification; the original ED-017 browser reports/screenshots below predate this follow-up.

## Baseline and Git

ED-016 was committed separately as `518d1d7` at the user's request. ED-015 and the pre-existing generated `next-env.d.ts` development-import change remain unstaged/uncommitted. Their SHA256 values are recorded in `pre-existing-work.json`; `preservation.json` records the final comparison. No reset/stash/clean or unrelated source edits.

The original sidebar contained Home and four learning categories, shared with the Radix mobile Sheet. Only Home/Frontend were links. There was no React group/lesson list or expansion state. The desktop aside and mobile Sheet were already independently scrollable. Their layout, original category ordering, future-category statuses and dismissal behavior remain the baseline.

Before screenshots cover direct article routes for Fundamentals, Hooks, a long-title group and the final lesson in the longest group, at 375/1440 × dark/light, height 900. Mobile shows the open Sheet. No lesson list existed in the before state.

## Implementation

`src/lib/learning/react-navigation.ts` projects the existing registries into serializable navigation metadata on the server: React's canonical name/URL, ordered group IDs/titles, and available lesson IDs/titles/URLs. No new lesson definitions, summaries or content imports. All eight groups and 119 lessons retain their exact metadata and ordering. AppShell passes the same model through AppHeader/MobileNavigation and AppSidebar; client components import only its TypeScript type.

`ReactLessonNavigation` nests React and its eight groups under the existing Frontend category. One semantic button per group controls a uniquely identified, labelled panel. Only the open group's lesson list is mounted. A single local state value permits zero or one open group. There are no persistence keys, global stores or new dependencies.

The inner accordion is keyed by the current pathname. Direct loads and SPA/Back/Forward transitions initialize it to the active lesson's group. Navigation within that group keeps it expanded; cross-group navigation opens the destination group. Manual collapse or selection of another group remains respected until the route changes. Theme/article-mode updates do not reopen it. Home, Frontend and the React overview start with collapsed groups.

Lesson selection uses exact href equality. Only the current lesson has `aria-current="page"`; ancestor Frontend/React links use `aria-current="location"` on descendant paths. Unknown/prefix-collision URLs cannot highlight a lesson. Existing exact and descendant category styling remains differentiated.

On a route or navigation-frame resize, a cancellable animation frame checks whether the active row is clipped, then adjusts only the closest existing navigation container's scrollTop. There is no window scrollIntoView, scroll listener, nested overflow area or animated scrolling. A ResizeObserver is disconnected on cleanup. Explicit manual group changes do not retrigger active-group reveal.

The existing Radix Sheet reuses this component/model. Opening an article's drawer focuses its active lesson without moving the page. Link selection closes the drawer; group buttons keep it open. Escape, backdrop, close button, focus trap, trigger focus restoration, breakpoint dismissal and body scroll lock remain managed by the existing Sheet and handlers.

Scoped CSS adds compact 44px-minimum rows, shallow indentation, wrapping labels, an accent surface/left indicator on the active lesson, and visible focus outlines. Group labels remain visually weaker. The only new motion is a short chevron transition, disabled with reduced motion. No global theme or article design changes.

## Exact application/test files

Modified:

- `src/components/layout/app-shell.tsx`
- `src/components/layout/app-header.tsx`
- `src/components/layout/app-sidebar.tsx`
- `src/components/layout/mobile-navigation.tsx`
- `src/components/navigation/category-navigation.tsx`
- `src/components/navigation/category-navigation.test.ts`
- `src/components/navigation/navigation.module.css`

Created:

- `src/components/navigation/navigation-branch.tsx`
- `src/components/navigation/react-lesson-navigation.tsx`
- `src/components/navigation/react-lesson-navigation.test.ts`
- `src/lib/learning/react-navigation.ts`
- `src/lib/learning/react-navigation.test.ts`

Documentation, scripts, raw reports and 32 screenshots are under `docs/ed-017/`; `files.txt` lists them individually. No package, lockfile, canonical registry, route, lesson content, learning mode, storage utility or preference schema changes. README's pre-existing ED-015 edit is preserved byte-for-byte.
