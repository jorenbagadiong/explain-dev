# Accessibility

Evidence: source inspection of shared components, the 2,359-check Chromium route/width/theme harness, and 71 additional checks in [browser-results.json](browser-results.json). This is not a WCAG 2.2 AA conformance certification.

## Shared implementation reviewed

| Component | Source/observed behavior |
| --- | --- |
| Header and desktop navigation | Named home/theme controls, decorative icons hidden, native links, current-page state, global focus-visible outlines |
| Mobile Sheet | Radix modal semantics, title/description, keyboard focus containment, Escape dismissal, focus return; resizing to desktop has a visible home-link target |
| Breadcrumbs and ArticleLayout | Named nav, ordered links, current topic, wrapping; one h1 and ordered section headings; main has `tabIndex=-1` |
| ArticleModes | **Button-group pattern**, not tabs: three native buttons with aria-pressed/aria-controls, named regions, Learn initially active, inactive regions use native hidden |
| ArticlePanels and AnswerReveal | Native Learn details/summary; independent Interview buttons with stable controls targets, expanded state, and hidden answer regions |
| CodeBlock | Escaped code inside figure/caption/pre/code; independent horizontal overflow; code stays within viewport in measured layouts |
| ConceptVisual | Textual context/steps/caveats, ordered sequence or nested list; descriptions carry meaning without depending only on color |
| Theme toggle | Named native button, 44px target; toggle/reload persistence checked |
| Back to Top | Named 44px native button, focus-visible styling, window scroll listener cleanup, safe-area offsets, reduced-motion branch and focus handoff |

Keyboard checks confirmed Enter/Space activation, selected states, focus retained on mode/reveal controls, and no focus left in hidden content after user-initiated mode changes. The three mode buttons remain individual Tab stops, which is appropriate for the button-group implementation; arrow-key tablist behavior is not claimed. Interview answers start hidden. All 119 compiled pages have matching titles/headings/breadcrumb identities, and representative DOM checks found no duplicate IDs or dangling aria-controls.

The mobile dialog keeps focus within itself, closes with Escape, and returns focus. Deep route checks covered absence of a repeated-focus trap; this is a useful smoke check rather than an exhaustive proof of every focus path.

## Back to Top

Source and browser checks confirm the window is the scroll container, button visibility follows the 400px threshold, and activation focuses `main-content` before scrolling. The main element is programmatically focusable. `focus({preventScroll:true})` avoids a second focus-induced scroll. Reduced-motion contexts returned directly to `scrollY=0`. The button remains mounted while focused when scrolling across the threshold, avoiding focus loss; offsets include safe-area insets and keep it below header/Sheet layers.

The five-width/both-theme checks found no page-level horizontal overflow or clipping of representative code/visuals. Mobile position and target dimensions were checked; exhaustive overlap checks against every possible scroll position/control were not performed in ED-014. Smooth-motion animation timing was inspected in source but not exhaustively measured.

## Contrast and motion

Computed sRGB luminance checks in both themes measured primary/foreground/muted text against the background. Light ratios were approximately 6.68 / 17.40 / 6.54; dark ratios 9.45 / 17.09 / 7.69. All exceed 4.5 for those sampled token/background pairs. This does not establish every alpha-blended, selected, hover, focus, or non-text contrast combination. Global focus outlines and reduced-motion CSS remain unchanged.

## Unperformed checks

**Not tested — screen-reader verification unavailable.** No screen reader/version/browser/OS combination was exercised. DOM visibility and accessible names do not substitute for an actual assistive-technology session.

Real browser zoom at 100%, 200%, and 400%, Firefox, WebKit, physical touch devices, forced colors, exhaustive non-text contrast, and every fixed-control overlap position remain unverified. The unzoomed headless viewport does not establish the real 100% browser-zoom check. Viewport resizing is supplementary reflow evidence only; see [cross-browser.md](cross-browser.md). No confirmed shared-component accessibility barrier was found in the performed checks, and no accessibility code changes were made speculatively. Fresh review evidence is separate in review-browser-results.json and review-verification.md.
