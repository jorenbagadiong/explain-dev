import type { ArticleConceptVisual, ArticleHierarchyVisual, ArticleQuickReview, ArticleSection, ArticleSource, CodeExample, CommonMistake, ComparisonColumn, InterviewQuestion } from "./article-types";

interface ThinkingInDeclarativeUiArticle {
  heading: string;
  overview: ArticleSection;
  imperativeVsDeclarative: ArticleSection & { comparison: readonly ComparisonColumn[]; imperativeExample: CodeExample; conclusion: string };
  uiAsFunction: ArticleSection & { example: CodeExample };
  uiStates: ArticleSection & { example: CodeExample };
  stateDriven: ArticleSection;
  conditional: ArticleSection & { patternsExample: CodeExample; formExample: CodeExample };
  composition: ArticleSection & { example: CodeExample };
  avoidingDom: ArticleSection & { comparison: readonly ComparisonColumn[] };
  imperativeCode: ArticleSection & { useCases: readonly string[]; example: CodeExample };
  mistakes: ArticleSection & { items: readonly CommonMistake[] };
  interview: ArticleSection & { questions: readonly InterviewQuestion[] };
  takeaways: ArticleSection & { items: readonly string[] };
  quickReview: ArticleQuickReview;
  imperativeVisual: ArticleConceptVisual;
  visual: ArticleConceptVisual;
  statesVisual: ArticleHierarchyVisual;
  sources: readonly ArticleSource[];
}

// Educational content only: topic identity, summary, availability, and route
// remain in the React topic registry. These examples are displayed, never run.
export const thinkingInDeclarativeUiArticle: ThinkingInDeclarativeUiArticle = {
  heading: "Thinking in Declarative UI",
  overview: {
    id: "what-is-declarative-ui",
    heading: "What is declarative UI?",
    paragraphs: [
      "Declarative code describes the result you want. Imperative code describes the steps to get there. Asking for the total of a list and writing a loop that adds each number can reach the same answer; what differs is how much of the process you spell out.",
      "A React component works declaratively. It reads its props and state, then returns a description of the UI for those values. It does not say how to get from the current screen to the next one. React works that out by comparing the new description with the previous one and committing the DOM changes that are needed.",
      "This does not remove imperative code. Much of it moves inside React, and your own code still runs step-by-step logic in event handlers and when it calls browser APIs. Declarative describes how you express the interface, not a ban on statements that do things.",
    ],
  },
  imperativeVsDeclarative: {
    id: "imperative-vs-declarative",
    heading: "Imperative versus declarative programming",
    paragraphs: ["Take a small cart: one button adds an item, another clears the cart, and a status line reports the count. The two approaches organize that behavior differently."],
    comparison: [
      {
        id: "imperative",
        title: "Imperative approach",
        items: [
          "Locate each DOM element involved.",
          "Read or change its properties directly.",
          "Manually keep related elements synchronized.",
          "Revisit those updates whenever application state gains a new case.",
        ],
      },
      {
        id: "declarative",
        title: "Declarative approach",
        items: [
          "Represent the relevant information as state.",
          "Describe the interface for that state.",
          "Update the state when an interaction occurs.",
          "Let React reconcile the result and commit the necessary changes.",
        ],
      },
    ],
    imperativeExample: {
      id: "imperative-cart",
      title: "Imperative comparison snippet (not a React component)",
      language: "typescript",
      code: `const cartStatus = document.querySelector<HTMLElement>("#cart-status");
const addButton = document.querySelector<HTMLButtonElement>("#add");
const clearButton = document.querySelector<HTMLButtonElement>("#clear");
let itemCount = 0;

if (cartStatus && addButton && clearButton) {
  addButton.addEventListener("click", () => {
    itemCount += 1;
    cartStatus.textContent = \`Items in cart: \${itemCount}\`;
    clearButton.disabled = false;
  });

  clearButton.addEventListener("click", () => {
    itemCount = 0;
    cartStatus.textContent = "Your cart is empty.";
    clearButton.disabled = true;
  });
}`,
      description: "Every handler must remember every element that depends on the count. Add a third element, and both handlers need another line. Example 1 below implements the same behavior declaratively.",
    },
    conclusion: "JavaScript itself is not the limitation. You can write a vanilla function that rebuilds part of a page from data, and other UI tools use declarative templates too. The contrast is between two ways of organizing updates, not between React and JavaScript.",
  },
  uiAsFunction: {
    id: "ui-as-a-function-of-state",
    heading: "UI as a function of state",
    paragraphs: [
      "A helpful way to picture a component is UI = f(state, props): the interface is the result of applying your component to its current inputs.",
      "This is a mental model, not a React API. There is no function named f, you do not call your own components, and real components can also read context. The value of the model is the habit it builds: when the screen is wrong, ask which input is wrong, or how the description uses it.",
    ],
    example: {
      id: "declarative-counter",
      title: "Example 1: A declarative counter",
      language: "tsx",
      code: `import { useState } from "react";

export default function CartCounter() {
  const [itemCount, setItemCount] = useState(0);

  return (
    <section>
      <p>{itemCount === 0 ? "Your cart is empty." : \`Items in cart: \${itemCount}\`}</p>
      <button type="button" onClick={() => setItemCount(previous => previous + 1)}>
        Add item
      </button>
      <button type="button" disabled={itemCount === 0} onClick={() => setItemCount(0)}>
        Clear cart
      </button>
    </section>
  );
}`,
      description: "Handlers only change the count. The status text and the disabled button are both described from that one value, so they cannot disagree. The functional update calculates from the latest pending count. In the Next.js App Router, a component using state also needs the \"use client\" directive at the top of its file.",
    },
  },
  uiStates: {
    id: "thinking-in-ui-states",
    heading: "Thinking in UI states",
    paragraphs: [
      "Before writing JSX, list the situations the interface can be in. A panel that loads data is usually idle, loading, successful, or failed, and each situation maps to something different on screen.",
      "Modeling that with separate booleans such as isLoading and hasError allows combinations that should never happen, such as both being true. A TypeScript discriminated union keeps one status at a time and attaches data only to the status that has it, so a message exists only on success.",
    ],
    example: {
      id: "request-states",
      title: "Example 2: Loading and error states",
      language: "tsx",
      code: `import { useState, type ReactElement } from "react";

type RequestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; reason: string };

function StatusMessage({ state }: { state: RequestState }): ReactElement {
  switch (state.status) {
    case "idle":
      return <p>Your report has not been requested yet.</p>;
    case "loading":
      return <p>Loading your report…</p>;
    case "success":
      return <p>{state.message}</p>;
    case "error":
      return <p>Something went wrong: {state.reason}</p>;
  }
}

export default function ReportPanel() {
  const [state, setState] = useState<RequestState>({ status: "idle" });
  const isLoading = state.status === "loading";

  return (
    <section>
      <h2>Monthly report</h2>
      <div aria-live="polite">
        <StatusMessage state={state} />
      </div>
      <button type="button" disabled={isLoading} onClick={() => setState({ status: "loading" })}>
        Start loading
      </button>
      <button
        type="button"
        disabled={!isLoading}
        onClick={() => setState({ status: "success", message: "Your report is ready." })}
      >
        Finish successfully
      </button>
      <button
        type="button"
        disabled={!isLoading}
        onClick={() => setState({ status: "error", reason: "The connection was lost." })}
      >
        Finish with an error
      </button>
    </section>
  );
}`,
      description: "The buttons stand in for a real request, so the example stays self-contained. TypeScript narrows state inside each case, and if you add a status without handling it, the declared return type makes the switch a compile error. isLoading is calculated during rendering rather than stored.",
    },
  },
  stateDriven: {
    id: "state-driven-rendering",
    heading: "State-driven rendering",
    paragraphs: [
      "A state update requests a render. Calling a setter does not change the variable in the code already running; it asks React to render again with the next value, and React may batch several updates from one event.",
      "During rendering, React calls your component to calculate the UI for that state, along with the components nested inside it by default. Each render works from its own snapshot of props and state.",
      "React then compares the result with the previous one and commits only the DOM changes needed, after which the browser paints. If nothing differs, nothing is mutated, so a render does not necessarily produce a DOM change.",
      "Because React decides when to call your components, they should remain pure during rendering: calculate the output, and do not mutate existing values, touch the DOM, or start a request. In development, Strict Mode calls components twice to help expose code that breaks this rule.",
    ],
  },
  conditional: {
    id: "conditional-rendering",
    heading: "Conditional rendering",
    paragraphs: [
      "React has no special syntax for conditions, because they are ordinary JavaScript. Use an if statement or an early return when a case produces a different result altogether, a conditional expression to choose between two results inside JSX, and logical AND to show something or omit it.",
      "Logical AND has one common pitfall. In {count && <Badge />}, a count of 0 makes the whole expression evaluate to 0, and React renders that number instead of nothing. Compare explicitly with count > 0 so the left side is a boolean.",
    ],
    patternsExample: {
      id: "conditional-patterns",
      title: "Early returns, conditional expressions, and logical AND",
      language: "tsx",
      code: `interface InboxProps {
  isLoading: boolean;
  unreadCount: number;
}

export default function Inbox({ isLoading, unreadCount }: InboxProps) {
  // Early return: this case has a different result altogether.
  if (isLoading) {
    return <p>Loading messages…</p>;
  }

  return (
    <section>
      {/* Conditional expression: choose between two results. */}
      <h2>{unreadCount > 0 ? \`\${unreadCount} unread\` : "All caught up"}</h2>

      {/* Logical AND: show or omit, comparing the number explicitly. */}
      {unreadCount > 0 && <button type="button">Mark all as read</button>}
    </section>
  );
}`,
      description: "Each pattern suits a different shape of condition. Choose whichever reads most clearly, because they all describe the same kind of result.",
    },
    formExample: {
      id: "form-feedback",
      title: "Example 3: Declarative form feedback",
      language: "tsx",
      code: `import { useId, useState } from "react";

export default function EmailField() {
  const [email, setEmail] = useState("");
  const inputId = useId();
  const feedbackId = useId();
  const trimmedEmail = email.trim();
  const hasError = trimmedEmail !== "" && !trimmedEmail.includes("@");

  return (
    <div>
      <label htmlFor={inputId}>Email address</label>
      <input
        id={inputId}
        type="email"
        value={email}
        aria-invalid={hasError}
        aria-describedby={feedbackId}
        onChange={event => setEmail(event.target.value)}
      />
      <p id={feedbackId} aria-live="polite">
        {hasError ? "Include an @ in the address." : "We only use this to send lesson updates."}
      </p>
    </div>
  );
}`,
      description: "The input is controlled, so state always holds its value. hasError and the message are calculated from that value on each render, and nothing has to remember to update them. The label and description stay connected for assistive technology. This is a teaching check, not full email validation.",
    },
  },
  composition: {
    id: "declarative-composition",
    heading: "Declarative component composition",
    paragraphs: [
      "Components let the description stay readable as it grows. Break the interface where a piece has its own responsibility, pass it what it needs through props, and let the parent read as an outline of the screen.",
      "Clear responsibilities matter more than the number of components. Split when a piece is reused or has its own job, not only to make a file shorter. A wrapper that passes every prop straight through adds one more place to look without adding clarity.",
    ],
    example: {
      id: "task-composition",
      title: "Example 4: Component composition",
      language: "tsx",
      code: `interface Task {
  id: number;
  title: string;
  isDone: boolean;
}

function TaskRow({ task }: { task: Task }) {
  return (
    <li>
      {task.title}: {task.isDone ? "Done" : "To do"}
    </li>
  );
}

function TaskList({ tasks }: { tasks: readonly Task[] }) {
  if (tasks.length === 0) {
    return <p>No tasks yet.</p>;
  }

  return (
    <ul>
      {tasks.map(task => (
        <TaskRow key={task.id} task={task} />
      ))}
    </ul>
  );
}

const todaysTasks: readonly Task[] = [
  { id: 1, title: "Review pull request", isDone: true },
  { id: 2, title: "Write release notes", isDone: false },
];

export default function TaskBoard() {
  return (
    <section>
      <h2>Today</h2>
      <TaskList tasks={todaysTasks} />
    </section>
  );
}`,
      description: "TaskBoard supplies the data, TaskList decides between the empty and filled views, and TaskRow describes one item. Each is typed and can be understood without reading the others.",
    },
  },
  avoidingDom: {
    id: "avoiding-unnecessary-dom-manipulation",
    heading: "Avoiding unnecessary DOM manipulation",
    paragraphs: [
      "React assumes the DOM nodes it creates still match its last committed result. If your code changes those nodes directly, the two can disagree: a later commit may overwrite your change, and removing a node React still manages can crash a later update.",
      "This is not a rule against all DOM access. The distinction is between changing what React owns and working with the DOM in ways React does not manage.",
    ],
    comparison: [
      {
        id: "express-through-state",
        title: "Express through state and props",
        items: [
          "Text, attributes, and classes that React renders.",
          "Showing, hiding, or adding elements in a component’s output.",
          "Anything another part of the UI depends on.",
        ],
      },
      {
        id: "access-directly",
        title: "Reasonable direct access",
        items: [
          "Focusing, scrolling, or measuring a node through a ref.",
          "Reading browser state in an event handler or Effect.",
          "Changing a container whose contents React never renders.",
        ],
      },
    ],
  },
  imperativeCode: {
    id: "when-imperative-code-is-appropriate",
    heading: "When imperative code is appropriate",
    paragraphs: [
      "Some browser behavior is a command rather than a description. There is no attribute that means focus this input now, so you ask for it directly. React gives you two ways to do that safely: refs reach a specific DOM node, and Effects keep a component synchronized with a system outside React after it commits. Separate lessons cover each in depth.",
    ],
    useCases: [
      "Focusing an input: call focus through a ref, usually from an event handler.",
      "Scrolling an element: call scrollIntoView on a node held in a ref.",
      "Integrating a third-party widget: give it a container through a ref, then set it up and clean it up in an Effect.",
      "Working with browser APIs: subscribe to something like a media query in an Effect, and unsubscribe in its cleanup.",
    ],
    example: {
      id: "focus-with-ref",
      title: "Imperative focus through a ref",
      language: "tsx",
      code: `import { useId, useRef } from "react";

export default function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  return (
    <div>
      <label htmlFor={inputId}>Search lessons</label>
      <input id={inputId} ref={inputRef} type="search" />
      <button type="button" onClick={() => inputRef.current?.focus()}>
        Jump to search
      </button>
    </div>
  );
}`,
      description: "React still describes the input and the button. The single imperative call happens in response to a click and changes nothing React renders.",
    },
  },
  mistakes: {
    id: "common-mistakes",
    heading: "Common mistakes",
    paragraphs: ["Most of these come from keeping imperative habits, or from storing something that should be described."],
    items: [
      {
        id: "modifying-react-dom",
        heading: "Directly modifying React-managed DOM unnecessarily",
        problem: "Reaching for querySelector feels direct, on the assumption that the DOM is yours to edit. React does not see that change, so its next commit can overwrite it, and removing a node it still manages can crash a later update.",
        correction: "Change state, and let the output describe the result.",
        examples: [
          {
            id: "dismiss-with-state",
            title: "Remove an element through state",
            language: "tsx",
            code: `import { useState } from "react";

export default function SavedNotice() {
  const [isDismissed, setIsDismissed] = useState(false);

  // Avoid: document.querySelector("#notice")?.remove();
  if (isDismissed) {
    return null;
  }

  return (
    <p>
      Your changes were saved.
      <button type="button" onClick={() => setIsDismissed(true)}>
        Dismiss
      </button>
    </p>
  );
}`,
            description: "Dismissing is a state change, so React removes the paragraph itself and stays consistent with the page.",
          },
        ],
      },
      {
        id: "mutating-state",
        heading: "Mutating state",
        problem: "Pushing to an array seems simpler than copying it. But passing that same array to the setter gives React an identical reference. Under its Object.is comparison React can treat that as no change and skip the render, leaving the screen stale.",
        correction: "Treat state as read-only, and pass a new object or array to the setter.",
        examples: [
          {
            id: "replace-state",
            title: "Replace an array instead of mutating it",
            language: "tsx",
            code: `import { useState } from "react";

export default function TagList() {
  const [tags, setTags] = useState<readonly string[]>([]);

  function addTag() {
    // Avoid: tags.push("new"); setTags(tags);
    setTags(previous => [...previous, \`tag-\${previous.length + 1}\`]);
  }

  return (
    <div>
      <button type="button" onClick={addTag}>
        Add tag
      </button>
      <ul>
        {tags.map(tag => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
    </div>
  );
}`,
            description: "The spread creates a new array, so React sees a changed value and renders the update.",
          },
        ],
      },
      {
        id: "render-equals-dom-update",
        heading: "Treating rendering as the same thing as DOM updates",
        problem: "If every render seems to mean a DOM update, you may try to prevent renders that were never a problem, or expect the screen to change just because a component ran. Rendering only calculates a result, and committing is the later step that may change nothing.",
        correction: "Think of them as two steps. To debug the screen, check what the render produced. To investigate performance, measure before optimizing.",
      },
      {
        id: "redundant-state",
        heading: "Creating redundant state",
        problem: "Storing a value you could calculate seems to make it easy to read, but now two values must stay in sync. Each handler has to remember both, and a missed update shows stale data.",
        correction: "Keep the minimal state, and calculate everything else during rendering.",
        examples: [
          {
            id: "calculate-during-render",
            title: "Calculate a value from state",
            language: "tsx",
            code: `import { useState } from "react";

export default function PriceSummary() {
  const [quantity, setQuantity] = useState(1);
  const unitPrice = 250;

  // Avoid: a separate total state that every handler must also update.
  const total = quantity * unitPrice;

  return (
    <div>
      <p>Total: {total}</p>
      <button type="button" onClick={() => setQuantity(previous => previous + 1)}>
        Add one
      </button>
    </div>
  );
}`,
            description: "total is recalculated from quantity on every render, so it cannot fall out of date.",
          },
        ],
      },
      {
        id: "effects-for-calculations",
        heading: "Using Effects for calculations that belong in rendering",
        problem: "An Effect can look like the place to respond when something changes. But for a calculation, React first renders and commits the stale value, then runs the Effect, whose state update causes another render. That is extra work and a stale intermediate result.",
        correction: "Calculate during rendering. Keep Effects for synchronizing with systems outside React.",
        examples: [
          {
            id: "filter-during-render",
            title: "Filter during rendering",
            language: "tsx",
            code: `import { useId, useState } from "react";

const lessons: readonly string[] = ["JSX", "Props", "State", "Effects"];

export default function LessonSearch() {
  const [query, setQuery] = useState("");
  const inputId = useId();

  // Avoid: storing results in state and setting them from a useEffect.
  const results = lessons.filter(lesson =>
    lesson.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div>
      <label htmlFor={inputId}>Filter lessons</label>
      <input id={inputId} value={query} onChange={event => setQuery(event.target.value)} />
      <ul>
        {results.map(lesson => (
          <li key={lesson}>{lesson}</li>
        ))}
      </ul>
    </div>
  );
}`,
            description: "The results are ready within the same render as the new query, so there is no intermediate commit.",
          },
        ],
      },
      {
        id: "contradictory-booleans",
        heading: "Representing mutually exclusive states with contradictory booleans",
        problem: "Adding one more boolean for each new situation feels harmless. But isSending and isSent can both be true if a single update is missed, and the UI then has no sensible way to describe that combination.",
        correction: "Use one status value that can hold only valid states, and calculate any convenient booleans from it.",
        examples: [
          {
            id: "single-status",
            title: "One status instead of two booleans",
            language: "tsx",
            code: `type SendStatus = "typing" | "sending" | "sent";

// Avoid: separate isSending and isSent booleans that can both be true.
export default function SendButton({ status }: { status: SendStatus }) {
  const isSending = status === "sending";

  return (
    <button type="submit" disabled={isSending}>
      {status === "sent" ? "Sent" : "Send"}
    </button>
  );
}`,
            description: "Only three states can exist, and isSending is calculated, so it can never disagree with status.",
          },
        ],
      },
      {
        id: "never-imperative",
        heading: "Assuming declarative React means imperative browser APIs are never needed",
        problem: "Taking declarative as an absolute rule leads to awkward workarounds, such as storing focus in state and hoping something reacts to it. Focus, scrolling, measurement, and third-party widgets all need direct calls.",
        correction: "Describe what React renders, and use refs and Effects for the rest. The focus example above shows how small that imperative part can be.",
      },
    ],
  },
  interview: {
    id: "interview-questions",
    heading: "Interview questions",
    paragraphs: ["Try each answer aloud before opening it. These are common topics to practice, not questions confirmed to come from any particular employer."],
    questions: [
      {
        id: "what-is-declarative-ui",
        question: "What is declarative UI?",
        answer: "You describe what the interface should look like for a given state, rather than the steps to change it. In React, a component returns that description from its props and state, and React works out the DOM updates.",
      },
      {
        id: "declarative-vs-imperative",
        question: "How does declarative programming differ from imperative programming?",
        answer: "Imperative code specifies how: locate this element, then change it. Declarative code specifies what: the result you want. Imperative steps still exist in a declarative system, but they sit behind an abstraction, so you maintain a description instead of every transition between screens.",
      },
      {
        id: "why-react-declarative",
        question: "Why is React described as declarative?",
        answer: "Because components return a description of the UI, not DOM instructions. When state changes, you do not write the update path. React renders the new description, compares it with the previous result, and commits the differences. You can still write imperative code in handlers and Effects.",
      },
      {
        id: "ui-function",
        question: "What does UI = f(state, props) mean?",
        answer: "It is a mental model: the interface is the result of applying a component to its current inputs. It is not a literal API, and context is also an input. It is useful because it points debugging at the inputs and encourages components that stay pure.",
      },
      {
        id: "how-dom-updates",
        question: "How does React update the DOM?",
        answer: "A state update queues a render. React calls the affected components, compares the output with the previous result, and in the commit phase applies only the DOM operations needed. The browser then paints. On the initial render, React creates the nodes and adds them to the page.",
      },
      {
        id: "render-causes",
        question: "What causes a component to render?",
        answer: "The initial render, a state update in the component or an ancestor, or a change to a context value it reads. By default, a parent rendering also renders its children, even when their props are unchanged, unless an optimization such as memo applies.",
      },
      {
        id: "why-pure",
        question: "Why should rendering remain pure?",
        answer: "React decides when and how often to call components, and Strict Mode calls them twice in development. A component that changes outside values while rendering can give different results between calls and cause bugs that are hard to trace. Side effects belong in event handlers or Effects.",
      },
      {
        id: "avoid-dom",
        question: "When should you avoid direct DOM manipulation?",
        answer: "When the node is managed by React and the change could be expressed through state or props, such as text, classes, or adding and removing elements. React does not know about manual changes, so a later commit can overwrite them, and removing a managed node can cause a crash.",
      },
      {
        id: "imperative-appropriate",
        question: "When is imperative code appropriate in React?",
        answer: "For things that are commands rather than descriptions: focusing an input, scrolling, measuring, or controlling a third-party widget. I would use a ref to reach the node, call it from an event handler when a user action caused it, and use an Effect with cleanup to synchronize with an external system.",
      },
      {
        id: "model-request-states",
        question: "How would you model loading, success, and error states?",
        answer: "With one status value instead of independent booleans, because booleans allow impossible combinations such as loading and failed together. In TypeScript I would use a discriminated union, so data exists only on success and a reason only on error, then render each case.",
      },
      {
        id: "render-vs-commit",
        question: "What is the difference between rendering and committing?",
        answer: "Rendering is React calling components to calculate the UI, and it should have no side effects. Committing is when React applies the resulting changes to the DOM. If the output is the same as before, a render can complete with no DOM changes.",
      },
      {
        id: "derived-values",
        question: "Why should derived values usually be calculated during rendering?",
        answer: "It keeps one source of truth, so the value cannot fall out of sync. Storing it and updating it from an Effect is also slower, because React commits a stale result and then renders again. If the calculation is genuinely expensive, useMemo can cache it.",
      },
    ],
  },
  takeaways: {
    id: "key-takeaways",
    heading: "Key takeaways",
    paragraphs: [],
    items: [
      "Describe the interface for each state, and let handlers change state instead of the DOM.",
      "UI = f(state, props) is a useful mental model, not a React API.",
      "List the states an interface can be in, and use one status value when they are mutually exclusive.",
      "Keep the minimal state, and calculate everything else during rendering.",
      "Rendering calculates, committing applies changes, and a render may change nothing in the DOM.",
      "Keep rendering pure, and use refs and Effects for the imperative work that remains.",
      "The practical benefit is fewer update paths to keep correct as an interface grows.",
    ],
  },
  quickReview: {
    definition: "Declarative UI means writing what the screen should show for the current data, instead of the DOM steps to get it there.",
    keyPoints: [
      "Components return a description of the UI from their props and state.",
      "Handlers update state; React renders, compares, and commits the necessary DOM changes.",
      "UI = f(state, props) is a mental model, not an API.",
      "Model mutually exclusive situations with one status value, not contradictory booleans.",
      "Calculate derived values during rendering, and keep rendering pure.",
    ],
    codeReminder: {
      id: "review-reminder",
      title: "One status, one description",
      language: "tsx",
      code: `type Status = "idle" | "saving" | "saved";

const labels: Record<Status, string> = {
  idle: "Not saved yet",
  saving: "Saving…",
  saved: "Saved",
};

export default function SaveLabel({ status }: { status: Status }) {
  return <p>{labels[status]}</p>;
}`,
      description: "The output follows directly from the input, and Record requires a label for every status.",
    },
    commonMistakes: [
      "Editing React-managed DOM directly, so React’s result and the page disagree.",
      "Mutating state, or storing values that could be calculated.",
      "Using an Effect to calculate something that belongs in rendering.",
    ],
    interviewTrap: "“Does declarative React mean you should never interact with the DOM?” No. Imperative DOM operations are appropriate for focus, scrolling, and integrations, but React-managed UI should generally be expressed through state and props.",
    takeaway: "Fix the state and the description, and the screen follows. Reach for the DOM only for what cannot be described.",
  },
  imperativeVisual: {
    heading: "Imperative flow",
    context: "Your code carries the event all the way to the DOM.",
    steps: [
      { id: "event", title: "Event", description: "A user clicks a button." },
      { id: "find-element", title: "Find element", description: "Your handler locates each affected DOM node." },
      { id: "change-dom", title: "Change DOM", description: "Your handler changes each node itself." },
    ],
    note: "This is a simplified conceptual flow. Every element that depends on the event needs its own update.",
  },
  visual: {
    heading: "Declarative flow",
    context: "Your code stops at the state update, and React carries out the rest.",
    steps: [
      { id: "event", title: "Event", description: "A user clicks a button." },
      { id: "update-state", title: "Update state", description: "Your handler requests the next value." },
      { id: "render-ui", title: "Render UI", description: "React calls your components to calculate the new description." },
      { id: "commit-changes", title: "Commit necessary DOM changes", description: "React applies only what differs, which may be nothing." },
    ],
    note: "This is a simplified conceptual flow. It leaves out details such as batching, and the DOM still changes through imperative operations inside React.",
  },
  statesVisual: {
    heading: "A state-driven interface",
    context: "Each state maps to its own interface. Indentation shows which state can follow which.",
    root: {
      id: "idle",
      title: "Idle",
      description: "Nothing requested yet. Show a prompt and the action to start.",
      children: [
        {
          id: "loading",
          title: "Loading",
          description: "A request is in progress. Show progress and prevent a duplicate request.",
          children: [
            { id: "success", title: "Success", description: "One possible outcome. Show the result." },
            { id: "error", title: "Error", description: "The other possible outcome. Explain what went wrong." },
          ],
        },
      ],
    },
    note: "Success and Error are alternative outcomes, and one request reaches only one of them. Real interfaces often add transitions, such as a retry from Error back to Loading.",
  },
  sources: [
    { label: "Thinking in React", href: "https://react.dev/learn/thinking-in-react" },
    { label: "Describing the UI", href: "https://react.dev/learn/describing-the-ui" },
    { label: "State as a Snapshot", href: "https://react.dev/learn/state-as-a-snapshot" },
    { label: "Render and Commit", href: "https://react.dev/learn/render-and-commit" },
    { label: "Conditional Rendering", href: "https://react.dev/learn/conditional-rendering" },
    { label: "Choosing the State Structure", href: "https://react.dev/learn/choosing-the-state-structure" },
    { label: "You Might Not Need an Effect", href: "https://react.dev/learn/you-might-not-need-an-effect" },
    { label: "useState reference", href: "https://react.dev/reference/react/useState" },
    { label: "useEffect reference", href: "https://react.dev/reference/react/useEffect" },
  ],
};
