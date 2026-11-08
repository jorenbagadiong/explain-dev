# Sidebar implementation — ED-016

ED-014 already exists at `84f0a0e`. This sidebar milestone is ED-016 per the user's message; the attached ED-015 sidebar title is treated as a numbering mismatch. No duplicate ED-014 commit and no commit of pending ED-015 work.

## Prototype and rollout

The desktop prototype was built and captured on six routes in both themes (12 images) before the mobile frame refinement. The review showed a calm surface, visible active rail, compact rows and a clear section label. Exact selection initially increased label weight; that could change wrapping, so label weight was made consistent while exact selection retains stronger background/border/rail styling. Mobile then reused the same rows/data inside the existing Sheet, with a compact Code2/title treatment and refined spacing.

## Files

| File | Responsibility |
| --- | --- |
| `src/components/navigation/navigation.module.css` | Scoped sidebar/brand/drawer surfaces, exact/descendant rail strength, stable typography, focus/hover, wrapping and reduced motion |
| `src/components/navigation/category-navigation.tsx` | Presentation classes/icon wrappers and a single derived route-match value; existing usePathname, link order, category data, aria-current and callbacks retained |
| `src/components/navigation/category-navigation.test.ts` | Original tests retained; five focused assertions for exact/descendant/unrelated-path presentation |
| `src/components/layout/app-sidebar.tsx` | Independent scrolling frame and normal-flow footer, with non-shrinking navigation/footer for short viewports |
| `src/components/layout/mobile-navigation.tsx` | Styling classes and existing Code2 mark in Sheet title; open state, media-query cleanup, close/focus handlers unchanged |
| `src/components/layout/app-header.tsx` | Styling hooks on the existing brand link/mark only; name, `/` destination, layout and controls unchanged |

The existing global header is retained; only its existing brand mark receives the directly related navigation styling. No duplicate sidebar logo/link or new section was added. The mobile title remains “Explore Explain Dev”, preserving the Dialog accessible name.

## Behavior intentionally preserved

- Home and Frontend are the only links; Backend, Full-Stack and DevOps remain noninteractive Coming-soon items.
- The current sidebar has **no** curriculum group/lesson list, expandable groups, accordion, persisted expansion or active-item scroll helper. Those checks are not applicable, not claimed as implemented.
- Slash-boundary matching remains the source of truth. `data-route-match` is derived during rendering from the existing pathname, not new state. It distinguishes exact page and active-descendant presentation while retaining current aria-current behavior.
- Sidebar width/breakpoint/sticky position are unchanged. The desktop frame and mobile Sheet remain their respective independent scroll containers; no nested nav scroller or automatic scrolling effect.
- Radix keeps Escape/backdrop/close semantics, focus trapping/restoration, body scroll locking and the existing desktop-breakpoint close handler. Navigation still closes the drawer through the same callback.
- No new dependencies, Client Components, state stores, storage writes, destinations or icon set. Decoration is hidden from assistive technology; rail pseudo-elements cannot intercept input.

## ED-015 preservation

All 101 files from the entry snapshot remain byte-identical. The new CSS is a module rather than an edit to the pending global design stylesheet. ED-015 content/pages/cards/reading components/README/evidence/workspace are untouched. Reproduce with `node docs/ed-016/tools/check-preservation.mjs`.
