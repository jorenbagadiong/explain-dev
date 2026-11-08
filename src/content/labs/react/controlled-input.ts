import { INPUT_TESTS } from "@/lib/lab/grading";
import type { LabChallenge } from "@/lib/lab/types";
export const controlledInputChallenge = {
  id: "react-controlled-input", slug: "controlled-input", technologyId: "react", lessonId: "controlled-inputs",
  revision: "v1", gradingRevision: "controlled-input-behavior-v1", starterRevision: "controlled-input-starter-v1",
  title: "Controlled Input", description: "Build a controlled name field and a greeting that follows each edit.", concept: "Controlled inputs", difficulty: "beginner",
  objectives: ["Store and edit a controlled string", "Derive display text from state", "Handle empty input"], instructions: ["Keep one enabled text input labelled Name. Start with an empty string.", "Expose a readable status named Greeting. With an empty input it must read Hello, stranger!; otherwise Hello, <name>!. Preserve the typed name exactly.", "Connect the field to React state and update the greeting on every edit, including clearing and repeated replacements.", "Run Tests checks observable DOM behavior; it does not inspect variable names or Hook spellings."], hints: ["Remember an editable string in component state.", "The input value should follow state, while its change handler records the new value.", "Render the greeting from the current string; use the default only when the string is empty."],
  requirements: INPUT_TESTS.map(test => test.title),
  starterFiles: [{name: "App.tsx", language: "tsx", code: "import { useState } from \"react\";\nexport default function App() {\n  // TODO: store the name and update it from the input.\n  const name = \"\";\n  return <main><label>Name<input value={name} onChange={() => {}} /></label><p role=\"status\" aria-label=\"Greeting\">Hello, stranger!</p></main>;\n}"}],
} as const satisfies LabChallenge;
