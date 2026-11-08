import type { ReferenceSolution } from "@/lib/lab/types";
export const listFilteringSolution = {
  "code": "import { useState } from \"react\";\nconst fruits = [\"Apple\", \"Apricot\", \"Banana\", \"Blueberry\", \"Cherry\", \"Grape\", \"Pineapple\"];\nexport default function FruitSearch() {\n  const [query, setQuery] = useState(\"\");\n  const matches = fruits.filter(fruit => fruit.toLowerCase().includes(query.toLowerCase()));\n  return <main><label>Search fruits<input value={query} onChange={event => setQuery(event.target.value)} /></label><ul aria-label=\"Fruits\">{matches.map(fruit => <li key={fruit}>{fruit}</li>)}</ul>{matches.length === 0 && <p role=\"status\" aria-label=\"Results\">No fruits found.</p>}</main>;\n}",
  "explanation": [
    {
      "title": "Store only the query",
      "body": "The dataset is fixed. Only the search text needs state; the visible results can be derived."
    },
    {
      "title": "Normalize for matching",
      "body": "Compare lower-case strings with includes to accept case-insensitive partial matches."
    },
    {
      "title": "Render current results",
      "body": "Filtering on each render avoids stale duplicate state. Stable keys identify fruit items, and the empty message follows the result count."
    }
  ]
} satisfies ReferenceSolution;
