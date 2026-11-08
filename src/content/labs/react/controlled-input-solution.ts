import type { ReferenceSolution } from "@/lib/lab/types";
export const controlledInputSolution = {
  "code": "import { useState } from \"react\";\nexport default function Greeting() {\n  const [name, setName] = useState(\"\");\n  return <main><label>Name<input value={name} onChange={event => setName(event.target.value)} /></label><p role=\"status\" aria-label=\"Greeting\">Hello, {name || \"stranger\"}!</p></main>;\n}",
  "explanation": [
    {
      "title": "Control the input",
      "body": "useState stores the string. The value prop follows that state, and onChange records each new value."
    },
    {
      "title": "Derive the greeting",
      "body": "Render directly from the same string so every edit schedules an updated greeting."
    },
    {
      "title": "Handle clearing",
      "body": "An empty string selects the default. Other names are rendered as text, never HTML."
    }
  ]
} satisfies ReferenceSolution;
