# ED-022 challenge inventory

All five routes share one real TSX editor, preview and behavioral Run Tests flow. Every challenge has a stable ID, content revision `v1`, separate grading/starter revision, concept, difficulty, learning objectives, compiling TODO starter, seven tests, three progressive hints and an independently loaded explained reference. IDs and ordering are validated by unit tests. Lesson links resolve from the existing registry.

| Challenge | Stable ID / route suffix | Concept and level | Linked lesson | Grading revision |
| --- | --- | --- | --- | --- |
| Build a Counter | `react-use-state-counter` / `use-state-counter` | useState · Beginner | `use-state` | `counter-behavior-v1` |
| Controlled Input | `react-controlled-input` / `controlled-input` | Controlled inputs · Beginner | `controlled-inputs` | `controlled-input-behavior-v1` |
| List Filtering | `react-list-filtering` / `list-filtering` | Derived state and lists · Beginner | `rendering-lists` | `list-filtering-behavior-v1` |
| Conditional Rendering | `react-conditional-rendering` / `conditional-rendering` | Conditional mounting · Beginner | `conditional-rendering` | `conditional-rendering-behavior-v1` |
| useEffect Cleanup | `react-effect-cleanup` / `effect-cleanup` | Effect lifecycle and cleanup · Intermediate | `use-effect` | `effect-cleanup-behavior-v1` |

Routes begin `/practice/react/`. Starter revisions are `<slug>-starter-v1`, except the preserved `counter-starter-v1`.

## Observable accessibility contracts

Counter retains its previous contract: one readable Count display and enabled Increment, Decrement and Reset controls.

Controlled Input: one editable text input labelled Name, initially empty; one readable status/output named Greeting containing `Hello, stranger!` when empty, otherwise `Hello, <name>!`. State-driven solutions are taught, but grading does not inspect Hook/variable spellings.

List Filtering: an editable text/search input labelled Search fruits and a list labelled Fruits. The fixed ordered dataset is **Apple, Apricot, Banana, Blueberry, Cherry, Grape, Pineapple**. Match substrings case-insensitively, keep dataset order, and restore everything on an empty query. A Results status shows `No fruits found.` exactly when empty. The list remains present when empty.

Conditional Rendering: one enabled native button named Toggle details (aria-label), a stable aria-controls target, accurate aria-expanded, and Show details / Hide details visible action text. The target is absent initially; when mounted it contains `Extra details are visible.`. Removal is checked against the DOM, not CSS visibility.

Cleanup: one readable `Ticks: integer` display starting at zero. Mount registers one 1,000 ms interval, updates once per tick, and unmount cancels it. New mounts reset state. This exercise explicitly uses intervals, not recursive timeouts or arbitrary subscriptions. Hook and class lifecycle solutions are accepted.

## Independent learning data

The existing `explain-dev:v1:challenge-progress:<id>` storage service is reused unchanged. Each challenge restores inert source, history, current verification, hints and reference-view flag from its own strictly validated key. Restoring never forwards that text to the initial preview. Run and Run Tests explicitly capture it. A new grade/content revision invalidates current evidence; a starter revision never overwrites the draft. The `v1` content revision maps to the existing grading tag for Counter compatibility; later content revisions prefix the grading tag.

Progress is Not Started, In Progress or historically Completed for the current revision, with current-draft Last verified separately labelled. Reset selects the latest starter as one undoable transaction and keeps history. Confirmed Clear removes code/history/assistance and resets undo, retaining only a data-free revision marker. Clear for one challenge cannot alter another key. First-owner Web Locks and explicit conflict resolution remain ED-021 policy; no device sync or backend.

The Practice index lists title, concept, difficulty, link and read-only progress without creating editor leases, writing drafts or mounting editors. Hints reveal a persisted prefix, one at a time. References require a warning then reveal, never overwrite the editor, and can be explicitly copied. Viewing/copying cannot complete a challenge.
