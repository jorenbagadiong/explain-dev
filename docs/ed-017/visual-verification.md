# ED-017 visual verification

Production build in cached Chromium headless shell 156.0.8078.4; Inter loaded, reduced motion, 900px height. Baselines captured before application edits. Before/after filenames use the same route, width and theme. There are 16 images per phase, 32 total. See `before-screenshots.json` and `after-screenshots.json` for route inventory and console results (zero errors).

| Scenario | Route | Evidence filename stem |
| --- | --- | --- |
| React Fundamentals | `/frontend/react/introduction-to-react` | `fundamentals` |
| React Hooks | `/frontend/react/use-state` | `hooks` |
| Long titles / Component Architecture | `/frontend/react/designing-component-apis` | `long-title` |
| Final active lesson in 17-lesson Testing group | `/frontend/react/error-handling-and-recovery` | `long-group` |

Each stem has `-375-dark.png`, `-375-light.png`, `-1440-dark.png`, `-1440-light.png` in both `screenshots/before/` and `screenshots/after/`. At 375 the Sheet is open; at 1440 the sidebar is visible. After images explicitly focus the active lesson with keyboard modality, showing its focus outline as well as the active indicator. Before images show the original navigation, which had no lesson controls or matching focused lesson state.

Representative matched pairs:

| View | Before | After |
| --- | --- | --- |
| Desktop dark, Hooks | [Before](screenshots/before/hooks-1440-dark.png) | [After](screenshots/after/hooks-1440-dark.png) |
| Desktop light, Fundamentals | [Before](screenshots/before/fundamentals-1440-light.png) | [After](screenshots/after/fundamentals-1440-light.png) |
| Mobile dark, wrapped titles | [Before](screenshots/before/long-title-375-dark.png) | [After](screenshots/after/long-title-375-dark.png) |
| Mobile light, deepest active row | [Before](screenshots/before/long-group-375-light.png) | [After](screenshots/after/long-group-375-light.png) |

Visual inspection: active rows have a distinct accent surface and left rail, parents are quieter, and keyboard outlines remain outside the row without clipping. Long labels wrap rather than truncate; e.g. Choosing component responsibilities wraps in the Component Architecture list. The long-group drawer scrolls down to its final active lesson; its header/close button can therefore be above the visible portion of the same scroll container. Escape works immediately and the close button remains keyboard/scroll reachable. This retains one drawer scroll area rather than introducing nested scrolling.

Functional overflow/target/scroll/focus verification also covered 320, 375, 768, 1024 and 1440px in both themes, plus a 300px-high desktop viewport. Full results are in `browser-verification.json` and `extra-verification.json`.

Limitations: automated Chromium plus visual screenshot inspection; no physical touch device, Safari/Firefox, assistive-technology session or actual browser zoom audit. Focused lesson states have no pre-existing visual equivalent. Text contrast samples are measurements, not a full WCAG certification. No new design outside the navigation was assessed or changed.
