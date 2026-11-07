# Verification log

Date: 2026-11-08, Asia/Taipei. Branch: main. ED-013 commit: `6dec9dd`. These verification results were recorded before the maintainer authorized the ED-014 commit.

The tables below preserve the **initial ED-014 pass before review follow-up**. Fresh review runs and the extended optimistic regression are recorded separately in [review-verification.md](review-verification.md); do not treat the earlier artifacts as fresh runs.

## Initial-pass baseline and corrected application checks

| Command / check | Baseline | Corrected build |
| --- | --- | --- |
| yarn lint | Pass | Pass outside sandbox after one sandbox traversal error |
| yarn typecheck | Pass | Pass |
| yarn test | 1,752 / 23 files | 1,752 / 23 files |
| yarn build | 125 static pages | 125 static pages |
| sync-manifest.mjs --check | 119 available, manifest matches | Matches after adding two newly cited source URLs |
| browser-smoke.cjs, eight detail IDs | 2,359 passed, 0 failed, 0 console issues | 2,359 passed, 0 failed, 0 console issues |

The final browser pass ran against a restarted production server after the corrected build. README/audit-report edits after that pass do not alter the application build. Build output and next-env.d.ts are generated; the pre-existing next-env import diff was excluded from ED-013 and is not an ED-014 implementation change.

## Initial-pass audit evidence

| Check | Result / artifact |
| --- | --- |
| Inventory | 119 topics/routes, eight groups, 402 classified examples plus 43 legacy records; inventory.json |
| Source/built-output scan | 119 exact title/heading/breadcrumb checks pass; 13,279 strings, no placeholders, no missing installed named React/DOM exports, no exact repeated interview answers; content-scan.json |
| Independent strict example programs | 384 passed; compilation.json |
| Extracted Vitest examples | 17 files, 22 tests passed; vitest-examples.json |
| Actual React DOM example/probe behavior | 20 passed; runtime-results.json; original three failures preserved in runtime-before.json |
| Extra page/accessibility checks | 71 passed; browser-results.json |
| Documentation links | 127 / 127 resolve with HTTP 200 after redirects; reference-results.json; not equivalent to line-by-line review |
| Build measurement | 119 HTML files, shared script references, compression estimates, 894 paragraph searches without client matches; build-measurements.json |
| Browser transfer/coverage | Nine cold routes including largest HTML outlier; browser-results.json; actual encoded/decoded body sizes kept separate |
| git diff --check | Pass |

## Reproduction

Run from the repository root, using Yarn and the existing dependencies:

```sh
yarn lint
yarn typecheck
yarn test
yarn build
node docs/ed-013/tools/sync-manifest.mjs --check
node docs/ed-014/inventory.mjs --write
node docs/ed-014/scan-content.mjs
node docs/ed-014/compile-examples.mjs
node docs/ed-014/run-vitest-examples.mjs
node docs/ed-014/check-references.mjs
node docs/ed-014/measure-build.mjs
node docs/ed-014/runtime-bundle.mjs
```

Start a production server in a separate process with `yarn start -p 3111`, then run:

```sh
node docs/ed-013/tools/browser-smoke.cjs --detail jsx state-snapshots use-optimistic component-composition accessible-forms rendering-performance server-components typescript-react
node docs/ed-014/browser-audit.cjs
node docs/ed-014/runtime-browser.cjs
```

The browser scripts reuse an existing Playwright Core installation/cache; use PLAYWRIGHT_CORE, CHROME_PATH, and BASE to override paths/server. The link checker needs network access. The runtime bundle is audit-only and writes into `/tmp/explain-dev-ed014-runtime`; it is never imported by the application. The initial failing runtime evidence is historical; rerunning the corrected source overwrites only runtime-results.json unless REPORT is explicitly changed.

## Checks not performed / environmental limits

- Firefox, WebKit/Safari, and physical devices: unavailable, not passed.
- Actual 200%/400% browser zoom: keyboard probe had no effect, not passed. Viewport resizing is supplementary evidence only.
- **Not tested — screen-reader verification unavailable.**
- External RTL/user-event/jsdom execution and every server example in an RSC deployment: not performed; no dependency installation attempted.
- Complete all-example behavioral execution, full transformed-content leakage proof, exhaustive accessibility contrast/overlap checks, field Web Vitals, low-end-device CPU, and deployed CDN behavior: not performed.

No limitation above was silently accepted for the maintainer. No ED-014 commit, push, deployment, merge, or PR was performed.
