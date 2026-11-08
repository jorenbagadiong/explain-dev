# Before/after visual evidence

Same production browser (Chromium headless shell 156.0.8078.4), routes, viewport height 900, dark/light theme, reduced motion, and initial Learn/top-of-page state. All six routes were captured at 375 and 1440 in both themes before and after: **24 matched pairs / 48 screenshots**. The intermediate prototype has 12 additional screenshots of only home/curriculum/useState.

| Screen | Before desktop dark | After desktop dark | Before mobile light | After mobile light |
| --- | --- | --- | --- | --- |
| Homepage | [Before](screenshots/baseline/home-1440-dark.png) | [After](screenshots/after/home-1440-dark.png) | [Before](screenshots/baseline/home-375-light.png) | [After](screenshots/after/home-375-light.png) |
| Frontend overview | [Before](screenshots/baseline/frontend-1440-dark.png) | [After](screenshots/after/frontend-1440-dark.png) | [Before](screenshots/baseline/frontend-375-light.png) | [After](screenshots/after/frontend-375-light.png) |
| React curriculum | [Before](screenshots/baseline/curriculum-1440-dark.png) | [After](screenshots/after/curriculum-1440-dark.png) | [Before](screenshots/baseline/curriculum-375-light.png) | [After](screenshots/after/curriculum-375-light.png) |
| Introduction to React | [Before](screenshots/baseline/introduction-1440-dark.png) | [After](screenshots/after/introduction-1440-dark.png) | [Before](screenshots/baseline/introduction-375-light.png) | [After](screenshots/after/introduction-375-light.png) |
| useState | [Before](screenshots/baseline/use-state-1440-dark.png) | [After](screenshots/after/use-state-1440-dark.png) | [Before](screenshots/baseline/use-state-375-light.png) | [After](screenshots/after/use-state-375-light.png) |
| React Server Components | [Before](screenshots/baseline/server-components-1440-dark.png) | [After](screenshots/after/server-components-1440-dark.png) | [Before](screenshots/baseline/server-components-375-light.png) | [After](screenshots/after/server-components-375-light.png) |

All complementary mobile-dark and desktop-light images are in [baseline](screenshots/baseline) and [after](screenshots/after). Capture conditions, errors, resource sizes and timings are in the phase browser JSON files.

## Observations

These are subjective design judgments, not measured engagement claims:

- Home gains an editorial two-column composition, actual exploration links and layered workspace. Mobile keeps the first action above the smaller decorative composition.
- Curriculum gains a coherent introduction and numbered group identity, with compact cards rather than 119 oversized panels. Identity/order/link data is unchanged.
- Articles gain a compact, distinct title surface with quieter violet/cyan lighting. The reading column and flat text/code remain unchanged in purpose; code captions, concepts and callouts have restrained depth.
- Light uses neutral shadows and quieter lighting; dark uses low-intensity ambient color on neutral surfaces. Primary brand/text tokens remain unchanged.
- Perspective/rotation belong to decorative planes. Article code is not rotated; it remains selectable and scrollable.

Motion is verified separately because reduced-motion still screenshots cannot demonstrate it. There is one short decorative entrance and fine-pointer card feedback; the group-edge scroll effect never hides text. Enlarged-text, touch, keyboard, focus and actual-background contrast checks are documented in accessibility.md and browser-verification.json. No user study was performed and increased engagement is unverified.

## Additional final detail captures (not before/after pairs)

Eight viewport captures show curriculum density, flat code, hierarchy semantics and revealed answers at 375/light and 1440/dark: [curriculum](screenshots/after/curriculum-detail-1440-dark.png), [code](screenshots/after/code-detail-375-light.png), [diagram](screenshots/after/diagram-detail-1440-dark.png), and [revealed answer](screenshots/after/answer-detail-375-light.png). Complementary detail captures are in the same directory. These were visually reviewed in addition to mobile/desktop hero screenshots.
