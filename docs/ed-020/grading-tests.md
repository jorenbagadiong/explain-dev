# Counter behavioral tests

Every test starts from a newly evaluated module and fresh React mount. Initial zero is checked in each test before interactions, so no test depends on another test's state or Reset handler. Source-code patterns and setter/variable names are never inspected.

| Stable ID | Independent action sequence and expected values |
| --- | --- |
| initial-zero | mount → 0 |
| increment | mount → 0; Increment → 1 |
| repeated-increment | mount → 0; Increment → 1 → 2 → 3 |
| decrement | mount → 0; Increment → 1 → 2; Decrement → 1 |
| reset | mount → 0; Increment → 1 → 2; Reset → 0 |
| negative-values | mount → 0; Decrement → −1 → −2 |
| combined-interactions | mount → 0; Increment → 1 → 2; Decrement → 1; Reset → 0; Decrement → −1; Increment → 0 → 1 |

Interaction contract: one readable `Count: integer` display (any nesting), or an output/status/live region labelled Count containing the integer. One visible, enabled native button/input or role=button per accessible name Increment, Decrement and Reset. aria-label and aria-labelledby are respected. Duplicate displays/actions fail clearly. React updates are awaited through act; no source patterns, literal setter names, incidental IDs or delays determine success. Deferred/debounced application timers are outside this simple immediate-counter contract.

## Integrity fixtures

`tools/fixtures.cjs` contains learner programs entered into the real editor by `tools/verify-grading.cjs`. Correct state-value setters, functional setters, useReducer with different variable names/labelled symbol buttons, class state with nested count markup, and a module-level store all pass. An autofocus variant additionally tests that the inert disposable frame cannot steal keyboard focus.

Known incorrect programs cover missing increment, decrement in the wrong direction, Reset to 99, initial 5, a memoized increment with a stale closure, and clamping negative values. Each must fail its relevant stable test ID. JSX syntax failure must produce no executed-test rows. Render and event exceptions must produce errors. An instrumented infinite loop is stopped; a never-resolving suspended root times out. Correct code runs successfully afterwards.

Each engine also runs 15 successive grading requests, preserving the editor, undo and visible counter at 2. Code edits clear old results; editing during grading cancels it; Reset cancels it and remains one undoable transaction; a newer request supersedes unfinished work. Responsive checks cover all requested widths in both themes.

## Adversarial output tests

Unit validation rejects invented/missing/reordered/duplicate IDs, extra/missing keys, wrong challenges or runs, invalid statuses, oversized feedback, nonfinite/negative/huge durations and contradictory completion. UI tests assert status text, a single atomic live summary, escaped feedback and retry/loading/error/timeout states.

`tools/verify-grading-protocol.cjs` replaces the sandbox runtime with a deliberately dishonest protocol peer (no learner code imported into the app):

- an ordinary preview cannot deliver grading results;
- 12 malformed/oversized/spoofed/stale/future result messages are rejected before a valid result;
- valid markup-shaped feedback is displayed as escaped text;
- a preview sending heartbeats but no result reaches the grading deadline and is removed while the interactive preview stays ready;
- a v2 host fails closed against v3.

These tests verify containment and validation, not truthful execution by a compromised client. See the raw engine reports and verification.md for actual outcomes.
