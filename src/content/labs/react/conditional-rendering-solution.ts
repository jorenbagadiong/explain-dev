import type { ReferenceSolution } from "@/lib/lab/types";
export const conditionalRenderingSolution = {
  "code": "import { useState } from \"react\";\nexport default function Details() {\n  const [shown, setShown] = useState(false);\n  return <main><button type=\"button\" aria-label=\"Toggle details\" aria-controls=\"details\" aria-expanded={shown} onClick={() => setShown(previous => !previous)}>{shown ? \"Hide details\" : \"Show details\"}</button>{shown && <section id=\"details\">Extra details are visible.</section>}</main>;\n}",
  "explanation": [
    {
      "title": "Remember visibility",
      "body": "A boolean state value starts false. The functional update flips the latest value."
    },
    {
      "title": "Conditionally mount",
      "body": "The logical expression renders a panel only when shown is true. The false branch leaves no panel DOM node."
    },
    {
      "title": "Describe the control",
      "body": "aria-expanded reflects the same state; aria-controls points at its stable target, while the text names the next action."
    }
  ]
} satisfies ReferenceSolution;
