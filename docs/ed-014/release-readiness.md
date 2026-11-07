# ED-014 release readiness

**Assessment: the measured Chromium/static-build scope passes after six verified corrections. Full cross-browser and accessibility release sign-off remains pending the unperformed checks below.**

Baseline ED-013 is committed as `6dec9dd` (`feat: publish complete React curriculum (ED-013)`). Review follow-up is dated 2026-11-08; the maintainer subsequently authorized committing the ED-014 fixes and audit evidence, with pushing left to the maintainer. The supplied brief ends at “13.2 HTML size”; this report does not invent requirements after that heading.

## Results

- 119 published lessons, eight groups, zero Coming-soon topics; stable IDs, ordering, groups, and routes preserved.
- Six findings verified fixed: stale connection timer cleanup, optimistic duplicate keys, insertion-Effect timing, render-only Error Boundary guidance, outdated blanket Transition batching, and contradictory README publication/measurement wording.
- No Critical or High verified defect found in the checks performed. One Low test-coverage gap remains open (ED014-TEST-001); the raw-JS observation is informational rather than evidence of a performance defect.
- Existing lint/typecheck/tests/build pass: 1,752 tests in 23 files; 125 static pages.
- Prior-pass evidence: 384 compilable ED-013 examples passed individually; 17 extracted Vitest files passed 22 tests. These separate checks were not repeated during review. The fresh review browser example run passes **21** checks on 13 actual examples plus two explicit audit probes, retaining the pending-key assertion and adding successful confirmation of both identical comments without pending labels.
- Fresh all-route/eight-representative Chromium smoke passes 2,359 checks; the additional browser/accessibility/resource harness passes 71. After the final wording clarification and rebuild, all-route smoke plus deeper Error Boundary checks pass another 1,337 checks. No application console/hydration issues observed. The separate runs and their exact scope are recorded in review-verification.md.
- Prior-pass evidence: 127 source links resolved. Review now records 128 source URLs because the exact React 19.3 `#changelog` anchor is also cited; that section and its upstream #37290 link were consulted directly, but the full HTTP link sweep was not rerun. Fresh built-output checks cover all 119 exact title/heading/breadcrumb identities; higher-risk technical/editorial review is scoped in technical-accuracy.md.
- Initial-pass file measurements found 663,515 raw shared script references and a median article HTML size of 89,518 raw bytes. Fresh Chromium resource checks again report 550,921 decoded JS bytes requested and 167,572 gzip body bytes on cold local loads. The all-route file-size sweep was not repeated during review. No speculative content architecture change was justified.

## Remaining sign-off work

| State | Check | What is needed |
| --- | --- | --- |
| Unavailable; not tested | Firefox | Existing engine/device access, or a separately approved installation |
| Unavailable; not tested | Safari/WebKit | Existing engine/device access, or a separately approved installation |
| Not performed | Real browser zoom: 100% | A normal browser at actual 100% zoom; an unzoomed headless viewport is not credited |
| Not performed | Real browser zoom: 200% | Actual browser zoom, including controls, wrapping, and keyboard access |
| Not performed | Real browser zoom: 400% | Actual browser zoom, including reflow and fixed-control visibility |
| Unavailable; not tested | Screen-reader verification | Record actual reader/version/OS/browser and tasks; DOM inspection is not a substitute |
| Not performed | External example execution | RTL/user-event/jsdom versions and installation require separate authorization |
| Open coverage gap | Complete RSC/runtime example coverage | Exercise examples in an appropriate framework runtime; ordinary React DOM fixtures and strict compilation do not establish this |
| Not performed | Deployed performance | Deployment/CDN/cache/field measurements |
| Not performed | Physical or low-end device performance | Real devices and representative CPU/network measurements |

No limitations have been accepted on the user’s behalf. No additional package/browser installation, feature expansion, route redesign, preference-schema change, or publishing action was performed. A maintainer can assess whether the measured scope is sufficient for their release; this audit does not claim full WCAG compliance or cross-browser certification.

## Review map

- [Findings and evidence](findings.md)
- [Technical accuracy and all external examples](technical-accuracy.md)
- [Accessibility](accessibility.md)
- [Browser/reflow/zoom coverage](cross-browser.md)
- [Performance measurements](performance.md)
- [Test and manifest integrity](test-integrity.md)
- [Verification and reproduction](verification.md)
- [Fresh review verification and proposed commit](review-verification.md)

The lesson changes are limited to eight modules. README corrections, two manifest reference additions, and the consulted-reference record for the changelog anchor accompany them; the rest of ED-014 is audit tooling/evidence. The generated next-env.d.ts diff existed before the audit, was checked unchanged during review, and is excluded from the proposed commit. Existing lesson-route/shared-component/storage files, dependencies, and design tokens match ED-013.
