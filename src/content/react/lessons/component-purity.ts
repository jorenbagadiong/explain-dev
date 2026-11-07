import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "what-pure-means",
      heading: "What a pure component is",
      paragraphs: [
        "A pure function does two things: it does not change anything that existed before it was called, and it gives the same output for the same inputs. React assumes every component behaves this way during rendering, so the same props, state, and context must produce the same JSX.",
        "Think of a recipe. Following it with the same ingredients gives the same dish, and following it does not change anyone else’s kitchen.",
      ],
      examples: [
        {
          id: "impure-and-pure",
          classification: "complete",
          title: "Passing input instead of writing to outside variables",
          language: "tsx",
          code: `// Avoid: let guest = 0; then guest = guest + 1 inside Cup.
// That result depends on how many times Cup has been called.
function Cup({ guest }: { guest: number }) {
  return <h2>Tea cup for guest #{guest}</h2>;
}

export default function TeaSet() {
  return (
    <>
      <Cup guest={1} />
      <Cup guest={2} />
    </>
  );
}`,
          description: "Cup’s output now depends only on its prop, so it can be called in any order, any number of times.",
        },
      ],
    },
    {
      id: "local-mutation",
      heading: "Local mutation is fine",
      paragraphs: [
        "Purity is about what the outside can observe. Changing a variable or array you just created during the same render is safe, because nothing outside the component can see it. This is called local mutation.",
      ],
      examples: [
        {
          id: "local-array",
          classification: "complete",
          title: "Building a local array while rendering",
          language: "tsx",
          code: `export default function SeatingChart({ seats }: { seats: number }) {
  const rows = [];

  for (let seat = 1; seat <= seats; seat += 1) {
    rows.push(<li key={seat}>Seat {seat}</li>);
  }

  return <ol>{rows}</ol>;
}`,
          description: "rows is created fresh on each render, so pushing to it cannot affect anything else.",
        },
      ],
    },
    {
      id: "where-side-effects-go",
      heading: "Where side effects belong",
      paragraphs: [
        "Your application still has to change things: updating data, sending requests, and starting animations. Those side effects happen outside rendering. Event handlers are the first choice, because they run in response to a user action and do not need to be pure.",
        "If no event fits, because the code must run due to the component being on screen, an Effect runs it after rendering. Treat that as a last resort, and check first whether the logic can be expressed through rendering alone.",
      ],
      comparison: [
        {
          id: "during-render",
          title: "Safe while rendering",
          items: ["Calculating from props, state, and context.", "Creating and changing new local values.", "Returning JSX."],
        },
        {
          id: "outside-render",
          title: "Do it outside rendering",
          items: ["Sending a network request.", "Changing the DOM directly.", "Writing to browser storage, or to a variable outside the component."],
        },
      ],
    },
    {
      id: "why-purity-matters",
      heading: "Why React needs purity",
      paragraphs: [
        "Purity is what makes React’s other abilities safe, rather than being a style preference.",
      ],
      list: [
        "Strict Mode calls components twice in development, which exposes impure code, and has no effect in production.",
        "React can skip rendering a component whose inputs have not changed, since its result can safely be reused.",
        "React can restart rendering when data changes partway through, because abandoned work had no side effects.",
        "The same component can run on the server for many requests.",
      ],
    },
  ],
  mistakes: [
    {
      id: "mutating-outer-variable",
      heading: "Changing a variable declared outside the component",
      problem: "A counter that lives outside the component and increments during rendering depends on how often React calls it. The output changes between calls, and Strict Mode’s double call makes it visibly wrong.",
      correction: "Pass the value as a prop, or use state if it must change over time.",
    },
    {
      id: "mutating-props-state",
      heading: "Mutating props or state during rendering",
      problem: "Sorting a prop array in place or pushing to a state array during rendering changes data that other renders and components rely on. The bug may appear far from the code that caused it.",
      correction: "Copy first, or use non-mutating methods such as toSorted, and keep the result in a local variable.",
    },
    {
      id: "side-effect-in-body",
      heading: "Doing side effects in the component body",
      problem: "Calling a request function or writing to localStorage in the body seems convenient. But it runs on every render, possibly more than once, and may run on the server, where those browser APIs do not exist.",
      correction: "Move it to an event handler, or to an Effect when it must follow being displayed.",
    },
    {
      id: "strict-mode-hidden",
      heading: "Dismissing Strict Mode’s double call as a bug",
      problem: "Seeing a log twice leads some developers to remove Strict Mode or add guards so the code runs only once. That hides impure components instead of fixing them, and the underlying bug stays in place.",
      correction: "Treat a visible difference between the two calls as the signal, and make the component pure.",
    },
    {
      id: "dynamic-values-in-render",
      heading: "Reading changing values while rendering",
      problem: "Calling Date.now() or Math.random() while rendering makes the output differ from call to call, which breaks the same-input, same-output rule. It can also produce a server and client mismatch during hydration.",
      correction: "Pass the value in as a prop, or read it in an event handler or Effect and keep it in state.",
    },
  ],
  interview: [
    {
      id: "pure-definition",
      question: "What does it mean for a React component to be pure?",
      answer: "During rendering it does not change anything that existed beforehand, and given the same props, state, and context, it returns the same JSX. React relies on this assumption to call components whenever it needs to.",
    },
    {
      id: "local-mutation-q",
      question: "Does purity forbid all mutation inside a component?",
      answer: "No. Mutating values you created during the same render is fine, because nothing outside can observe it. Filling a new local array in a loop is a common example. What is forbidden is changing values that already existed.",
    },
    {
      id: "strict-mode-double",
      question: "Why does React call components twice in Strict Mode?",
      answer: "To surface impure code during development. A pure component gives the same result both times, so a difference reveals a bug. It only happens in development, and it does not affect production behavior.",
    },
    {
      id: "purity-benefits",
      question: "What does purity let React do?",
      answer: "It can skip components whose inputs have not changed, restart rendering if newer data arrives because abandoned work has no side effects, and render on a server. Each of those would be unsafe if calling a component had consequences.",
    },
    {
      id: "side-effect-home",
      question: "Where should side effects live if not in rendering?",
      answer: "In event handlers first, since they run because of a user action. If it must run because the component is displayed, such as a subscription, an Effect runs it after commit. Many supposed needs for an Effect can be handled by calculating during rendering.",
    },
    {
      id: "impure-example",
      question: "What is an example of an impure component that would still appear to work?",
      answer: "A component incrementing a module-level counter for an ID. It renders fine at first, but its output depends on call order and count, so Strict Mode gives different numbers, and server and client results may disagree. useId is the correct tool there.",
    },
  ],
  takeaways: [
    "Same inputs, same output, and no changes to what already existed.",
    "Local mutation during a render is allowed.",
    "Side effects go in event handlers first, and Effects when nothing else fits.",
    "Strict Mode’s double call exists to reveal impurity.",
  ],
  quickReview: {
    definition: "A pure component calculates its output from its inputs and changes nothing that existed before rendering.",
    keyPoints: [
      "React may call a component at any time, and more than once.",
      "Local variables created during the render may be mutated.",
      "Strict Mode double-calls in development only.",
      "Purity enables skipping, restarting, and server rendering.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Copy before sorting",
      language: "tsx",
      code: `export default function Sorted({ names }: { names: readonly string[] }) {
  const sorted = [...names].sort();

  return <p>{sorted.join(", ")}</p>;
}`,
      description: "The copy is local, so sorting it leaves the prop untouched.",
    },
    commonMistakes: [
      "Incrementing a module-level variable while rendering.",
      "Sorting a prop array in place.",
      "Fetching or writing to storage in the component body.",
    ],
    interviewTrap: "“Is Strict Mode’s double render a bug to work around?” No. It is a development check for impure code, and it does not happen in production.",
    takeaway: "Rendering is a calculation, and everything that changes the world happens somewhere else.",
  },
  sources: [
    { label: "Keeping Components Pure", href: "https://react.dev/learn/keeping-components-pure" },
    { label: "Responding to Events", href: "https://react.dev/learn/responding-to-events" },
  ],
};
