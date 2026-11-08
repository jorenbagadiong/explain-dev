# Baseline audit — ED-015

Starting commit: `554a7c8`, branch `main`, initially clean and synchronized with origin. ED-014 is committed; no pre-existing ED-014/ED-015 work was overwritten. This is the current application, not an earlier milestone snapshot.

Verified before design edits: 119 available topics, eight curriculum groups, 119 physical article routes, three article modes, answer reveals, Back to Top, themes and responsive navigation. Manifest check passed. Baseline lint/typecheck/build passed; 1,752 tests passed in 23 files.

## Evidence

Twenty-four matching viewport screenshots were captured **before redesign**: six routes × 375/1440 × dark/light, height 900, Learn/default content at the top, cached Chromium headless shell with reduced motion. See [screenshots/baseline](screenshots/baseline) and [baseline-browser.json](baseline-browser.json). The advanced sample is `/frontend/react/react-server-components`. All returned 200, with no console/page/hydration errors or page overflow in this capture.

Baseline build: 677,904 emitted JS bytes, 33,077 CSS bytes. Full per-route HTML and referenced JS sizes are in [baseline-build.json](baseline-build.json). Runtime timings are single local observations, not field benchmarks.

## Visual observations (subjective design assessment)

- Home has a clear value proposition but little visual identity beyond the violet dot. It has no immediate lesson CTA or developer-inspired composition; navigation starts with the category cards below the introduction.
- Curriculum preserves useful grouping and order, but the opening is mostly text and a large anchor box. The long collection uses the same flat border treatment throughout.
- Article titles and controls are readable and the max-width is appropriate. Hero, mode selector and reading navigation have little visual differentiation; mobile's large heading and vertical spaces push the lesson down.
- Code and diagrams are functional, accurate and semantically structured. Their flat borders offer an opportunity for subtle surface hierarchy without changing their content.
- Both themes already have useful contrast and should keep their brand tokens. The desktop sidebar, mobile Sheet, native controls and server-rendered content are strengths to preserve.

## Scope and strategy

Preserve all content/registry/routes, state logic, storage and theme behavior. Prototype the homepage, curriculum introduction and **useState only** first. Review matching screenshots and build/runtime metrics before rolling article classes out through the shared layout. CSS will carry perspective on decorative planes, static lighting, restrained card feedback and reduced-motion fallbacks; no new animation dependency or client animation engine.
