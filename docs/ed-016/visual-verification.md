# Sidebar before/after evidence

Same browser (Chromium headless shell 156.0.8078.4), routes, width/height, theme and content state. Desktop is 1440×900 with the sidebar visible; mobile is 375×900 with the existing Sheet open. All six routes were captured in both themes at both widths: **24 matched pairs / 48 images**. Twelve additional desktop prototype images preceded mobile refinement.

| Route | Desktop dark before | Desktop dark after | Mobile light before | Mobile light after |
| --- | --- | --- | --- | --- |
| Homepage | [Before](screenshots/before/home-1440-dark.png) | [After](screenshots/after/home-1440-dark.png) | [Before](screenshots/before/home-375-light.png) | [After](screenshots/after/home-375-light.png) |
| Frontend overview — exact | [Before](screenshots/before/frontend-1440-dark.png) | [After](screenshots/after/frontend-1440-dark.png) | [Before](screenshots/before/frontend-375-light.png) | [After](screenshots/after/frontend-375-light.png) |
| React curriculum — active Frontend section | [Before](screenshots/before/curriculum-1440-dark.png) | [After](screenshots/after/curriculum-1440-dark.png) | [Before](screenshots/before/curriculum-375-light.png) | [After](screenshots/after/curriculum-375-light.png) |
| Introduction to React | [Before](screenshots/before/introduction-1440-dark.png) | [After](screenshots/after/introduction-1440-dark.png) | [Before](screenshots/before/introduction-375-light.png) | [After](screenshots/after/introduction-375-light.png) |
| useState | [Before](screenshots/before/use-state-1440-dark.png) | [After](screenshots/after/use-state-1440-dark.png) | [Before](screenshots/before/use-state-375-light.png) | [After](screenshots/after/use-state-375-light.png) |
| React Server Components | [Before](screenshots/before/advanced-1440-dark.png) | [After](screenshots/after/advanced-1440-dark.png) | [Before](screenshots/before/advanced-375-light.png) | [After](screenshots/after/advanced-375-light.png) |

Complementary desktop-light/mobile-dark images and all prototypes are in the screenshot directories. The before/after screenshot JSON files record the exact routes/themes/widths; no console errors occurred. Final desktop active states and the mobile header/category rows were visually reviewed.

Subjective observations: quieter surface depth ties navigation to the cinematic design; a fine rail and tinted surface make selection more visible; fixed label weight avoids active-route wrapping changes; sentence-case section labels reduce visual noise. The existing Code2 brand stays recognizable. These are design assessments, not measured user-engagement improvements.

The sidebar still contains Home and four learning categories. “Active React” means the existing Frontend section is highlighted on React routes; no nonexistent React sidebar item, new curriculum list or accordion was invented. All other application presentation remains the pre-existing ED-015 work.
