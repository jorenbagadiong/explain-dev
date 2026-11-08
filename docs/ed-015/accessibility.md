# Accessibility scope — ED-015

The new decorative workspace is server-rendered, `aria-hidden`, contains no interactive controls, and has `pointer-events: none`. Decorative shapes and number tokens do not replace visible labels. Existing heading/link/button/region semantics, source order, skip link, breadcrumbs, mode selected underlining, answer state, mobile Dialog focus handling and Back to Top focus transfer are retained.

The detailed browser tool checks all five requested widths (320, 375, 768, 1024, 1440), both themes, six representative routes; original all-lesson smoke checks cover every published route and mode. Focus/ring, native keyboard code scrolling where supported, independent answer visibility, storage preservation, theme persistence, navigation and reading anchors are checked. Fine-pointer lift has keyboard ring/border/shadow emphasis; touch has no hover dependency. Content is never held behind an entrance animation or a scroll observer.

Contrast testing captures the **actual raster background** with text made transparent without changing layout, samples it under visible leaf text, and compares with the original computed sRGB foreground. This includes gradient composition rather than assuming a plain root background. It is sampled viewport evidence, not a full pixel-wise audit or assistive-technology test. The generated report records minimum ratios and any failures.

Reduced-motion contexts must have no running animations; CSS explicitly disables transitions and animations, and Back to Top retains its existing instant-scroll path. The normal-motion probe checks bounded entrance completion and fine-pointer feedback; a touch/coarse-pointer context checks no card transform.

The actual browser zoom shortcut is attempted and its viewport/DPR/visual scale recorded. It does not establish zoom in this headless shell; **real browser zoom remains unverified**. Instead, the suite separately performs **real CSS text enlargement to a 200% root font size**, plus doubled code font size, and verifies measured paragraph font growth and no overflow. This is text-resize evidence, not DPR emulation or a claim of browser zoom. Its first run exposed a curriculum defect, corrected with rem-aware columns and container-dependent decorative visibility. Both the initial result and the corrected rerun are retained.

Screen-reader behavior is inferred only from preserved semantic DOM/order; NVDA/VoiceOver/JAWS were not exercised. No complete WCAG 2.2 AA compliance claim, physical touch-device certification, or cross-browser accessibility sign-off is made.

## Final result

All 1,915 detailed checks passed. All 2,230 sampled text/background comparisons passed 4.5:1; the smallest sampled ratio was approximately 5.695:1. Normal-size viewports had no horizontal overflow, including 320px. Actual 200% text-resize checks passed after the documented curriculum fix. Four JavaScript-disabled routes remained readable/navigable, with working native Learn disclosures. The separate existing 119-route smoke suite passed as documented in verification.md. These are bounded checks, not full accessibility compliance.
