# ED-013 verification log

Results recorded here come from commands actually run. Browser engine: Chromium headless shell through a Playwright install outside this project. Firefox, Safari, and physical devices are not covered.

Doc reading was done through a fetch tool that summarizes pages, so `verified-references.json` means the page's content was consulted on that date, not that every line was compared.

## B01

11 lessons published: 15 of 119 available. Lint and typecheck passed, 504 tests passed, and the build passed. Browser smoke covered all 15 routes, plus jsx and component-lifecycle in detail at 320, 375, 768, 1024, and 1440px in both themes. Two early smoke failures were script errors, investigated by tracing the real focus order: truncated hrefs looked like a repeated focus stop, and a race with Radix's focus return. Lesson text appears in no `.next/static` file, and a lesson page's HTML is about 83 KB.


## B02 to B20

Each batch passed `run-batch.sh`: lint, typecheck, tests, build, browser smoke, and a manifest check. Per-batch test counts are in `progress.md`.

## Executed examples

Examples are compiled by the test suite, and not run. The 17 `complete` examples that import Vitest were also extracted and executed once, in a scratch project outside this repository, on 2026-11-08: 17 files and 22 tests passed. Client and server examples were not executed.

## Final run, 2026-11-08

From a deleted `.next` directory, on `main` with every ED-013 change uncommitted:

- `yarn lint`: passed. `yarn typecheck`: passed. `yarn test`: 1,752 passed in 23 files. `yarn build`: passed, 125 static pages.
- `sync-manifest --check`: 119 topics, 119 available, 4 existing, 115 published, 0 pending, 0 blocked.
- Browser smoke, Chromium headless shell 156, production server: 119 routes, plus jsx, state-snapshots, use-optimistic, component-composition, accessible-forms, rendering-performance, server-components, and typescript-react in detail at 320, 375, 768, 1024, and 1440px in dark and light. 2,359 checks passed, 0 failed, 0 console issues.
- Client output: five sampled strings of lesson text were found in 0 of 14 files in `.next/static`. Every route loads 663,515 bytes of uncompressed JavaScript. HTML is 70,746 to 178,072 bytes, with a median of 89,518.

After this run, one line of `/frontend` metadata was restored to its original wording, and the README and this log were updated. The gates were then rerun: lint, typecheck, and build passed, 1,752 tests passed, the manifest check passed, and the per-route browser smoke passed all 119 routes with 1,191 checks, 0 failed, and 0 console issues. The detailed width and theme checks were not repeated after that one-line metadata change.

Not covered: Firefox, Safari, physical devices, real browser zoom, screen readers, and a full accessibility audit.
