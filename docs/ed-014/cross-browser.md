# Browser, responsive, and zoom coverage

| Environment | Status |
| --- | --- |
| Chromium headless shell 156.0.8078.4, Linux | Tested against local Next production server |
| Firefox | Not tested — no cached engine or executable found |
| WebKit / Safari | Not tested — no cached engine or WebKit driver found |
| Physical mobile devices | Not tested |
| Screen readers | Not tested — verification unavailable |

No browser or dependency was installed. Playwright Core was reused from `/home/joren/claude/portfolio_v2/node_modules/playwright-core`; Chromium was reused from the existing user cache. Set `PLAYWRIGHT_CORE` / `CHROME_PATH` to reuse another existing installation. Browser and server needed approved execution outside the sandbox; the first sandbox launch failed, and the first outside-browser attempt could not reach the sandbox server. Neither attempt counts as a pass. The audit-owned server was restarted outside the sandbox and later restarted again for the final build.

The original results below are preserved. Fresh review results use `review-browser-results.json` (71 passed) and `review-chromium-smoke.log` (2,359 passed). After the final prose clarification and rebuild, `review-final-chromium-smoke.log` records another all-119-route pass with deeper Error Boundary checks (1,337 passed). See [review-verification.md](review-verification.md) for the sequence and scope. None of these runs establishes Firefox, WebKit/Safari, screen-reader behavior, or real zoom.

## Route and layout depth

All **119** article routes received the existing smoke checks at **1024×900**: direct HTTP 200, title suffix, single h1, exact breadcrumb identity, Learn visibility, mode switching, first answer reveal, and Learn/Interview page overflow. Curriculum links match all published routes. Independent built-output checks also verify exact per-article metadata/heading identity, including the four intentionally descriptive legacy headings.

Eight representatives received deeper checks at **320, 375, 768, 1024, and 1440px**, height 900, in **both themes**:

| Group | Topic ID |
| --- | --- |
| Fundamentals | jsx |
| State & Data Flow | state-snapshots |
| Hooks | use-optimistic |
| Component Architecture | component-composition |
| Forms & Interaction | accessible-forms |
| Performance & Rendering | rendering-performance |
| Advanced React | server-components |
| Testing & Best Practices | typescript-react |

Deeper checks cover three modes, heading hierarchy, page/code/visual overflow, inactive content visibility, keyboard reveal/focus, Tab traversal smoke, Back to Top, and mobile Sheet Escape/focus return. Final result: **2,359 checks passed, zero failures, zero console/hydration issues**. This is 119-route smoke plus eight-route deeper coverage, not 119 equally deep layout audits.

The additional harness tested these eight plus the largest HTML outlier, `declarative-ui`, and directly loaded `/`, `/frontend`, `/frontend/react` at 375px. It checked Space activation, selected state, control IDs, hidden-region focus, dialog focus containment, theme persistence, representative token contrast, and resources: **71 passed**. Its initial nine reveal failures were an audit-locator defect (the accessible name changes on reveal), corrected with a stable aria-controls locator; no application change was needed for those failures.

## Zoom

The headless keyboard zoom probe left `innerWidth=320`, DPR=1, and visual viewport scale=1 unchanged. Therefore **real browser zoom was not established**. Real 100%, 200%, and 400% zoom are separate unperformed release checks; the unzoomed headless run is not credited as a normal-browser 100% zoom task. The five viewport widths provide supplementary reflow evidence, including the 320px CSS width commonly used for a 400%-zoom reflow target, but no equivalence to real zoom is claimed. DPR emulation was not used as a zoom substitute.

Remaining release verification should exercise actual browser zoom at 100%/200%/400% on a normal browser, plus Firefox/WebKit and assistive technology if those are release requirements. Existing limitations are recorded, not accepted on the maintainer’s behalf.
