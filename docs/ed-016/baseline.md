# ED-016 sidebar baseline

The attached brief is titled ED-015; the user's requested next milestone is ED-016. This record uses ED-016 for the sidebar enhancement and preserves the uncommitted cinematic ED-015 work. ED-014 was already committed as `84f0a0e`; no duplicate or unrelated commit was created.

Branch `main`, HEAD `554a7c8`. At entry, eleven tracked ED-015 files were modified and its evidence/workspace directories were untracked. SHA-256 hashes of all 101 pre-existing ED-015 files are recorded in `ed-015-preservation.json`. No reset, stash, clean or overwriting of that work.

## Existing navigation

- Global `AppHeader` contains the existing Code2 brand link to `/`; it sits above the sidebar. Its global layout and controls are outside this sidebar-only redesign; the existing brand mark is the directly related header presentation.
- `AppSidebar` is sticky below the 80px header, fixed at 16rem, hidden below 1024px, and scrolls independently. Footer copy is normal flow content with an auto margin, not a sticky overlay.
- One `CategoryNavigation` renders Home, then Frontend/Backend/Full-Stack/DevOps from the shared category definitions. Only Home and Frontend have links. Upcoming items are plain elements.
- `usePathname` controls selection with exact or slash-boundary matching. Frontend remains active for nested curriculum/articles. There is no separate route state.
- There are **no expandable groups, lesson links, collapse buttons, persisted expansion state, or active-item auto-scrolling** in this sidebar. The 119 lessons are discovered through the main curriculum. This milestone will not invent those features or duplicate their data.
- Mobile uses the same CategoryNavigation in a controlled Radix Sheet. Escape, backdrop close, focus trap/restoration, navigation dismissal, body scroll lock, and resize-to-desktop dismissal already exist. The Sheet itself has the scroll container; there is no nested mobile navigation scroller.

## Before evidence

A fresh production baseline build passed. `screenshots/before` contains matched 375/1440 × dark/light captures on home, frontend, curriculum, introduction, useState and React Server Components. Mobile images show the **open** Sheet, desktop images the persistent sidebar. `before-screenshots.json` records conditions and errors.

## Visual observations and plan

The original sidebar is readable but flat: Home and category rows have little surface hierarchy, active highlighting is similar for an exact category route and a deeper lesson, and section labels use widely spaced uppercase. Mobile's header and category list have a large gap and do not share the newer depth treatment.

Prototype desktop using a local CSS module and existing components: calm surface depth, a restrained active rail, clear exact/descendant visual strength, compact icon tiles, sentence-case label and visible focus. Keep the global brand intact; refine the existing mobile Sheet heading with its Code2 mark during mobile rollout. Preserve all destinations, ordering, handlers and aria-current behavior. No new navigation groups, accordion, dependencies, storage, or Client Components.
