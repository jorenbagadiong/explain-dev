import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "map-data-to-elements",
      heading: "Turning data into elements",
      paragraphs: [
        "Most lists start as data. Rather than writing each item’s markup by hand, you keep the data in an array and use map to turn each item into an element. Adding an item to the data then adds it to the screen, with no extra markup.",
        "React can render an array of elements directly, so the result of map can go straight inside braces.",
      ],
      examples: [
        {
          id: "basic-map",
          classification: "complete",
          title: "Mapping an array to list items",
          language: "tsx",
          code: `interface Lesson {
  id: number;
  title: string;
}

const lessons: readonly Lesson[] = [
  { id: 1, title: "Writing UI with JSX" },
  { id: 2, title: "Passing data with props" },
];

export default function LessonList() {
  return (
    <ul>
      {lessons.map(lesson => (
        <li key={lesson.id}>{lesson.title}</li>
      ))}
    </ul>
  );
}`,
          description: "Each list item gets a key from its data, which is how React tells items apart across updates. The next lesson covers keys in depth.",
        },
      ],
    },
    {
      id: "filter-then-map",
      heading: "Filtering before you map",
      paragraphs: [
        "To show a subset, use filter first and then map the result. Both return new arrays and leave the original untouched, so this is safe to do during rendering.",
        "Calculating the visible items during rendering, rather than storing them in state, keeps them correct automatically whenever the source data or the filter changes.",
      ],
      examples: [
        {
          id: "filter-and-map",
          classification: "complete",
          title: "Rendering a filtered list",
          language: "tsx",
          code: `interface Task {
  id: string;
  title: string;
  isDone: boolean;
}

export default function OpenTasks({ tasks }: { tasks: readonly Task[] }) {
  const openTasks = tasks.filter(task => !task.isDone);

  if (openTasks.length === 0) {
    return <p>Nothing left to do.</p>;
  }

  return (
    <ul>
      {openTasks.map(task => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}`,
          description: "The empty case is handled explicitly, because an empty list would otherwise render as a blank area with no explanation.",
        },
      ],
    },
    {
      id: "multiple-nodes",
      heading: "Rendering several nodes per item",
      paragraphs: [
        "Sometimes each item needs more than one DOM node, such as a term and a definition. The short <>...</> syntax cannot take a key, so use the explicit Fragment from React.",
      ],
      examples: [
        {
          id: "fragment-key",
          classification: "complete",
          title: "A keyed Fragment",
          language: "tsx",
          code: `import { Fragment } from "react";

interface Term {
  id: string;
  word: string;
  meaning: string;
}

export default function Glossary({ terms }: { terms: readonly Term[] }) {
  return (
    <dl>
      {terms.map(term => (
        <Fragment key={term.id}>
          <dt>{term.word}</dt>
          <dd>{term.meaning}</dd>
        </Fragment>
      ))}
    </dl>
  );
}`,
          description: "Fragment leaves no trace in the DOM, so dt and dd remain direct children of dl, which the HTML structure requires.",
        },
      ],
    },
    {
      id: "when-lists-get-large",
      heading: "When a list is not enough",
      paragraphs: [
        "A plain map renders every item, which is fine for most lists. If a long list is genuinely slow, measure first. Common remedies include pagination, or virtualization, which renders only what is visible and usually comes from a library outside React itself.",
      ],
    },
  ],
  mistakes: [
    {
      id: "missing-return",
      heading: "Forgetting to return from a block-bodied arrow function",
      problem: "An arrow function with braces, as in item => { <li /> }, needs an explicit return. Without one, every call returns undefined, so the list renders nothing and shows no error.",
      correction: "Add return, or use parentheses for an implicit return, as in item => (<li />).",
    },
    {
      id: "missing-keys",
      heading: "Omitting keys",
      problem: "Elements created by map without a key make React log a warning, and it falls back to matching items by position. When the list changes order, this can attach state to the wrong item.",
      correction: "Give each element a stable key that comes from the data.",
    },
    {
      id: "key-on-wrong-element",
      heading: "Putting the key on the wrong element",
      problem: "A key placed on an inner element, such as the li inside a mapped ListItem component, has no effect, because React compares the elements in the array itself. The warning stays, and identity is still positional.",
      correction: "Put the key on the outermost element returned from the map callback, as in <ListItem key={id} />.",
    },
    {
      id: "sort-mutates",
      heading: "Sorting the original array during rendering",
      problem: "Array sort and reverse change the array in place. Calling them on props or state during rendering mutates data the component does not own, which breaks purity and can corrupt the source.",
      correction: "Use toSorted, or copy first with [...items].sort(), so the original stays untouched.",
    },
  ],
  interview: [
    {
      id: "how-to-render-list",
      question: "How do you render a list in React?",
      answer: "Keep the data in an array and use map to turn each item into an element with a stable key. React renders the resulting array in place. To show a subset, I filter first and calculate the result during rendering.",
    },
    {
      id: "why-map-not-foreach",
      question: "Why use map rather than forEach to render a list?",
      answer: "map returns a new array, and that array is what React renders. forEach returns undefined, so nothing would appear unless you pushed into an array yourself. Pushing to a local array also works, but map is more direct.",
    },
    {
      id: "fragment-keys",
      question: "How do you give a key to a group of nodes without adding a wrapper?",
      answer: "Use the explicit Fragment imported from React, as in <Fragment key={id}>. The shorthand <>...</> cannot take attributes. The Fragment adds no DOM node, which matters inside structures such as dl or table.",
    },
    {
      id: "filtered-list-state",
      question: "Should a filtered list be stored in state?",
      answer: "Usually not. It can be calculated from the source list and the filter during rendering, so it always stays correct. Storing it creates a second copy that must be kept in sync, and useMemo can cache the calculation if it proves expensive.",
    },
    {
      id: "long-lists",
      question: "What would you do if a list of many items were slow to render?",
      answer: "First measure, because the cost may be elsewhere. Then consider pagination or virtualization, which only renders what is visible, and check that each row’s work is reasonable. I would not add memoization before knowing it addresses the actual cost.",
    },
  ],
  takeaways: [
    "Keep lists as data, and map them to elements.",
    "Filter first, and calculate results during rendering.",
    "Keys belong on the element directly returned from the map callback.",
    "Use the explicit Fragment when an item needs several nodes.",
  ],
  quickReview: {
    definition: "Rendering a list means mapping an array of data to an array of keyed elements.",
    keyPoints: [
      "map returns the elements, and filter chooses which items to show.",
      "A block-bodied arrow function needs an explicit return.",
      "Short Fragment syntax cannot take a key, so import Fragment.",
      "Do not sort props or state in place during rendering.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Mapping with keys",
      language: "tsx",
      code: `export default function Names({ people }: { people: readonly { id: string; name: string }[] }) {
  return <ul>{people.map(person => <li key={person.id}>{person.name}</li>)}</ul>;
}`,
      description: "One keyed element per item, using a stable ID from the data.",
    },
    commonMistakes: [
      "Writing item => { <li /> } and returning nothing.",
      "Placing the key inside the mapped component instead of on it.",
      "Calling sort on the original array while rendering.",
    ],
    interviewTrap: "“Where does the key go?” On the element returned from map, not on an element inside that component, because React compares the array’s direct items.",
    takeaway: "Describe one item, map it over the data, and let the data drive the screen.",
  },
  sources: [
    { label: "Rendering Lists", href: "https://react.dev/learn/rendering-lists" },
    { label: "Keeping Components Pure", href: "https://react.dev/learn/keeping-components-pure" },
  ],
};
