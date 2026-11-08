# Implementation record

## Prototype gate (before shared rollout)

The homepage, curriculum introduction and useState-only hero were built and captured in [screenshots/prototype](screenshots/prototype): 12 images, 375/1440, both themes. Other article heroes were deliberately left unchanged at this point.

Review: the violet brand and readable neutral surfaces are retained. The homepage now has real React/fundamentals links above the mobile artwork, and the desktop workspace adds a clear composition rather than fake metrics. The curriculum keeps its exact introduction and group navigation. The useState hero gives the title a distinct, compact surface without moving code or paragraphs into 3D. All 12 captures had no page overflow or console errors. Prototype emitted JS remained exactly 677,904 bytes; CSS grew from 33,077 to 40,467 raw bytes. Detailed single-run timings are recorded, not treated as engagement/performance proof.

Refinement identified: move the decorative React tile up so it cannot overlap the editor's corner label. Keep the editor's text plane unrotated; only the decorative backplane/orbit use rotation/perspective. The composition is suitable to roll out after that small positioning refinement.

## Shared rollout

The validated treatment is applied through shared presentation, not individual lesson edits:

| File | Change |
| --- | --- |
| `src/app/page.tsx` | Editorial hero, real React/fundamentals links, decorative workspace; secondary link prefetch disabled after resource measurement found an unnecessary article-chunk request |
| `src/components/visuals/developer-workspace.tsx` | Server-rendered composition: flat illustrative Counter code, rotated backplane/orbit, lifted concept plane, React tile; aria-hidden and noninteractive |
| `src/app/frontend/page.tsx` | Quiet overview accent and shared category/technology card depth |
| `src/app/frontend/react/page.tsx` | Hero, existing anchor index, numbered group headers and compact cards; every metadata record/order/link preserved |
| `src/app/globals.css` | Theme-derived surfaces/shadows, CSS perspective, motion vocabulary and responsive/reduced-motion rules |
| `src/components/learning/article-layout.tsx` | Compact shared article hero, reading-index surface, restrained comparison panels |
| `src/components/learning/article-modes.tsx` | Styling hook only; existing state, buttons, hidden regions and relationships unchanged |
| `src/components/learning/code-block.tsx` | Styling hooks only; pre/code/text/language and native overflow unchanged; no copy feature existed to replace |
| `src/components/learning/concept-visual.tsx` | Surface and hierarchy-node styling hooks; all nodes/steps/order unchanged |
| `src/components/learning/article-panels.tsx` | Callout/Interview surface hooks; content and controls unchanged |
| `src/components/learning/topic-card.tsx` | Shared compact dimensional card classes; publication/navigation behavior unchanged |

No new Client Component, new font/image asset, pointer tracker, browser storage usage, or animation library. All 119 article content files, static routes, registries, manifests, preference code, theme provider and Back to Top implementation remain unchanged.

## Motion and responsive decisions

- Workspace entrance: one 600ms translation/opacity settlement, never hidden and never a loop.
- Hover: 3px lift and 0.6-degree perspective tilt on navigable cards, only for fine pointers that support hover and do not request reduced motion. Focus receives ring/border/shadow emphasis without needing hover.
- Scroll: a short decorative group-edge line uses a progressive `view()` timeline where supported. It does not animate paragraphs or hide content. Unsupported browsers retain a static border.
- Reduced motion: animations/transitions are disabled, with the existing Back to Top motion preference preserved. No global will-change or per-frame JavaScript.
- Mobile: simplified workspace, no secondary floating layers; curriculum artwork hidden; comparison/code semantics unchanged. Available reading width, rather than viewport alone, determines whether the curriculum artwork is shown.

## Verification-driven refinements

The first deep run passed 1,913 of 1,915 checks, with only two failures: the curriculum overflowed in dark/light at **actual 200% text enlargement**. Inspection found both squeezed three-column card text and overflowing decorative code. The fix uses a rem-based auto-fill grid (17rem minimum, capped at available width) and a 50rem container query for the decorative workspace. This preserves normal one/two/three-column layouts but yields space when text grows. The check was retained, not weakened; initial evidence is in `initial-browser-verification.json`.

Resource measurements also showed the new secondary introduction Link prefetching the article interaction chunk on the homepage. `prefetch={false}` defers that request until navigation, retaining a functional semantic link. Final captures repeat measurements after this change.
