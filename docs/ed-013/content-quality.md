# ED-013 content quality policy

## Tiers

Guidelines rather than quotas. Do not pad a lesson to reach a number.

| Tier | Topics | Typical shape |
| --- | --- | --- |
| A | Foundational concepts | 4-7 sections, 2-3 examples, 3-5 mistakes, 5-8 questions |
| B | Intermediate concepts | 6-9 sections, 3-4 examples, 5+ mistakes, 6-10 questions |
| C | Advanced or error-prone | Whatever explains the full mental model, with explicit limits and tradeoffs |

## Code block classifications

Set on every `LessonExample` and enforced by `src/content/react/lessons/lessons.test.ts`.

| Classification | Meaning | Compiled? |
| --- | --- | --- |
| `complete` | Understandable and valid on its own | Yes, as shown |
| `client` | Needs a browser environment | Yes, as shown |
| `server` | Server-only, such as an async Server Component | Yes, as shown |
| `framework` | Depends on a framework package such as `next` | Yes, as shown |
| `snippet` | A partial fragment | Yes, inside its `typecheckContext` |
| `external` | Needs a package this project does not install, such as React Testing Library | No: verified against official docs only, and labelled on the page |
| `pseudocode` | Conceptual only | No, and never presented as executable |

Compiling is necessary but not sufficient. Conceptual correctness is checked by reading against the docs.

## Publication gates

A topic becomes available only after all of these pass.

- **A, registry integrity:** existing stable ID, correct group and order, unique route, no duplicate. (`curriculum-manifest.test.ts`)
- **B, content completeness:** Learn, Quick Review, Interview, takeaways, mistakes, and examples. (`lessons.test.ts`)
- **C, technical accuracy:** the official page for each claim was read this milestone. A lesson may only cite URLs recorded in `verified-references.json`, and tests enforce that. Installed exports are checked for version-sensitive APIs. Automated tests do not prove every statement is correct, so this gate also relies on editorial review.
- **D, TypeScript:** every compiling classification passes strict checking in one program. (`lessons.test.ts`)
- **E, rendering and accessibility:** metadata, heading, breadcrumbs, anchors, modes, and answer controls. (`published-lessons.test.ts`, then `tools/browser-smoke.cjs`)
- **F, regression:** the full `yarn lint`, `yarn typecheck`, `yarn test`, and `yarn build`.

`LessonArticlePage` returns 404 until the registry says available, so an unfinished lesson cannot be reached. Because the page only renders once available, gates E and F run after the registry flip. If they fail, revert the flip for the affected topics.

## Accuracy guardrails

`lessons.test.ts` scans answers, takeaways, and reviews for known false claims, such as "memo guarantees" and "Suspense automatically handles". It also blocks APIs deprecated in the installed types, currently `FormEvent`. Mistake sections may name a misconception in order to correct it, so they are not scanned.
