import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "typing-props",
      heading: "Typing props",
      paragraphs: [
        "TypeScript describes what a component accepts, and it checks each usage. Props are a single object, so a component is typed by giving that object a type. A type alias or an interface both work, and optional props can get a default through destructuring.",
        "React’s types come from @types/react and @types/react-dom, which you need to install for a TypeScript project. Files with JSX must use the .tsx extension.",
      ],
      examples: [
        {
          id: "props",
          classification: "complete",
          title: "A component with typed props",
          language: "tsx",
          code: `type BadgeProps = {
  label: string;
  tone?: "neutral" | "success";
};

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  return <span data-tone={tone}>{label}</span>;
}`,
          description: "A union of strings allows only meaningful values, so <Badge tone=\"green\" /> is a compile error rather than a silent styling bug.",
        },
      ],
    },
    {
      id: "children-and-html",
      heading: "Children and native props",
      paragraphs: [
        "React.ReactNode describes anything that can be rendered, including text, numbers, elements, null, and arrays. React.ReactElement is narrower, covering only JSX elements. Prefer ReactNode for children, unless you truly need an element.",
        "When wrapping a native element, ComponentProps gets all of its props, so that callers can pass anything the element supports, without you listing it. CSSProperties types the style prop.",
      ],
      examples: [
        {
          id: "wrapper",
          classification: "complete",
          title: "Wrapping a native button",
          language: "tsx",
          code: `import type { ComponentProps, ReactNode } from "react";

type ActionButtonProps = ComponentProps<"button"> & {
  icon?: ReactNode;
};

export function ActionButton({ icon, children, type = "button", ...buttonProps }: ActionButtonProps) {
  return (
    <button type={type} {...buttonProps}>
      {icon}
      {children}
    </button>
  );
}`,
          description: "Callers get onClick, disabled, aria attributes, and the rest automatically. The rest props are checked against what a button accepts.",
        },
      ],
    },
    {
      id: "state-and-reducers",
      heading: "State and reducers",
      paragraphs: [
        "useState infers its type from the initial value, so useState(0) needs no annotation. Pass a type argument when the initial value does not show the whole picture, such as null for something that comes later. A discriminated union makes impossible states impossible, and it narrows correctly when checked.",
        "With useReducer, type the state and action, and annotate the reducer’s return type. A union of actions means that each case in the switch sees the right fields.",
      ],
      examples: [
        {
          id: "union-state",
          classification: "client",
          title: "State as a discriminated union",
          language: "tsx",
          code: `"use client";

import { useState } from "react";

type SendState =
  | { status: "idle" }
  | { status: "failed"; message: string };

export function Retry() {
  const [sendState, setSendState] = useState<SendState>({ status: "idle" });

  return (
    <div>
      <button onClick={() => setSendState({ status: "failed", message: "Try again later." })}>Send</button>
      {sendState.status === "failed" && <p role="alert">{sendState.message}</p>}
    </div>
  );
}`,
          description: "message only exists on the failed variant, and TypeScript allows reading it only after that check.",
        },
      ],
    },
    {
      id: "events",
      heading: "Event handlers",
      paragraphs: [
        "An inline handler gets its event type from context, so it needs no annotation. A handler defined separately needs one. Types such as ChangeEvent and MouseEvent take the element type as a parameter, and that determines what currentTarget gives you.",
        "To find the right type for an unfamiliar event, hover over the attribute in an editor, or write the handler inline first. The @types/react package includes types for most DOM events.",
      ],
      examples: [
        {
          id: "event-types",
          classification: "client",
          title: "Annotating a separate handler",
          language: "tsx",
          code: `"use client";

import { useState, type ChangeEvent } from "react";

export function NameField() {
  const [name, setName] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setName(event.currentTarget.value);
  }

  return <input aria-label="Name" value={name} onChange={handleChange} />;
}`,
          description: "currentTarget is typed as HTMLInputElement, so value is known to exist.",
        },
      ],
    },
    {
      id: "refs-and-context",
      heading: "Refs and context",
      paragraphs: [
        "A DOM ref is typed with the element, and it starts at null, because the element does not exist until React attaches it. So check for null when you use it. In React 19, useRef requires an argument, and ref can be passed as a normal prop to a function component.",
        "Context needs a default value, and often there is no sensible one. A common approach is to allow null in the type, then write a custom Hook that throws a helpful error when there is no provider. Every caller then gets a non-null type.",
      ],
      examples: [
        {
          id: "context-types",
          classification: "client",
          title: "A checked context Hook",
          language: "tsx",
          code: `"use client";

import { createContext, useContext } from "react";

type User = { name: string };

const UserContext = createContext<User | null>(null);

export function useUser() {
  const user = useContext(UserContext);
  if (user === null) throw new Error("useUser must be used inside a UserContext provider.");
  return user;
}

export function Greeting() {
  const user = useUser();

  return <p>Hello, {user.name}</p>;
}`,
          description: "The null check narrows the type, so callers of useUser have a User with no checks of their own, and a missing provider produces a clear error.",
        },
      ],
    },
    {
      id: "honest-types",
      heading: "Types should describe what is true",
      paragraphs: [
        "Types are erased when the code runs, so they check your code without checking outside data. A response from fetch is whatever the server sent, regardless of the annotation. If the data matters, validate it at runtime, at the boundary where it enters your application.",
        "An as assertion or any tells the compiler to stop checking. Use them sparingly, since an incorrect assertion moves a compile error into a crash later on. Prefer narrowing with a real check.",
      ],
      examples: [
        {
          id: "narrowing",
          classification: "complete",
          title: "Narrowing unknown data",
          language: "typescript",
          code: `type Lesson = { title: string };

function isLesson(value: unknown): value is Lesson {
  return typeof value === "object" && value !== null && "title" in value && typeof value.title === "string";
}

export function readTitle(data: unknown) {
  return isLesson(data) ? data.title : "Untitled";
}`,
          description: "unknown forces a check before use, and this check is real code that runs, unlike a type assertion.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "any-everywhere",
      heading: "Using any to make errors go away",
      problem: "any turns off checking for that value and everything derived from it. The compiler then stops catching typos and wrong shapes, and the bug appears at runtime, which is the exact thing TypeScript was meant to prevent.",
      correction: "Use a specific type, or unknown with a real check.",
    },
    {
      id: "trusting-fetch",
      heading: "Assuming that an annotation validates a response",
      problem: "await response.json() as User only changes what the compiler believes. If the server sends something else, the code still runs, and it fails later somewhere else, far from the actual cause.",
      correction: "Validate outside data at the boundary, with a check that runs.",
    },
    {
      id: "non-null-ref",
      heading: "Overusing the non-null assertion on refs",
      problem: "ref.current! tells the compiler that the value exists, whether or not it does. If it runs before the element attaches or after removal, the app crashes in exactly the place the type was warning you about.",
      correction: "Check for null, or use optional chaining.",
    },
    {
      id: "fc-children",
      heading: "Assuming that all components accept children",
      problem: "Modern React types do not add children implicitly, so passing children to a component that does not declare them is a compile error. Older tutorials may show code relying on the old behavior.",
      correction: "Declare children: ReactNode in the props where you need it.",
    },
    {
      id: "optional-instead-of-union",
      heading: "Making everything optional",
      problem: "A status with optional data and error fields allows every combination, including none of them. Each consumer must then handle cases that should never occur, and the type no longer documents what is true.",
      correction: "Use a discriminated union that describes each real state.",
    },
  ],
  interview: [
    {
      id: "ts-children",
      question: "What is the difference between ReactNode and ReactElement?",
      answer: "ReactNode is anything renderable: elements, strings, numbers, null, undefined, booleans, and arrays of those. ReactElement is only a JSX element. For children, ReactNode is usually right, since a component rarely cares what kind of thing it is rendering.",
    },
    {
      id: "ts-events",
      question: "How do you type an event handler?",
      answer: "Inline handlers get their type from context, so no annotation is needed. A separate handler uses a type such as ChangeEvent<HTMLInputElement>. Hovering over the attribute shows the right type in an editor. currentTarget then has the specific element type.",
    },
    {
      id: "ts-state-null",
      question: "How do you type state that starts as null?",
      answer: "Pass a type argument, such as useState<User | null>(null), since inference from null alone would be too narrow. TypeScript then requires a check before reading properties. For states with several shapes, a discriminated union is often better than separate nullable fields.",
    },
    {
      id: "ts-runtime",
      question: "Does TypeScript validate data at runtime?",
      answer: "No. Types are erased, so they say nothing about what a server actually returns. Annotating a fetch result only makes the compiler believe it. If the data matters, validate it at runtime, at the point where it enters the application.",
    },
    {
      id: "ts-context",
      question: "How do you type a context that has no sensible default?",
      answer: "Use createContext<T | null>(null), and write a custom Hook that throws when the value is null. The check narrows the type, so consumers get T directly, and a missing provider gives a clear message rather than a confusing error elsewhere.",
    },
    {
      id: "ts-wrap",
      question: "How do you type a component that wraps a native element?",
      answer: "Use ComponentProps with the element name, intersected with any custom props, then spread the rest onto the element. Callers get every native attribute, checked against that element. In React 19, ref is included as a normal prop, without forwardRef.",
    },
  ],
  takeaways: [
    "Type props as one object, and use unions for meaningful values.",
    "Use ReactNode for children, and ComponentProps for wrappers.",
    "Use unions for state with several shapes.",
    "Types are erased, so validate outside data at runtime.",
  ],
  quickReview: {
    definition: "TypeScript with React means modelling props, events, state, and refs with types that describe what is actually true.",
    keyPoints: [
      "useState infers from its initial value.",
      "useRef<HTMLInputElement>(null) needs null checks.",
      "Inline handlers get their type from context.",
      "as and any turn off checking.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Children as ReactNode",
      language: "tsx",
      code: `import type { ReactNode } from "react";

export function Panel({ children }: { children: ReactNode }) {
  return <section>{children}</section>;
}`,
      description: "ReactNode accepts anything that React can render.",
    },
    commonMistakes: [
      "Using any to silence an error.",
      "Assuming an annotation validates a response.",
      "Overusing ! on refs.",
    ],
    interviewTrap: "“Since I annotated the fetch result, is the data safe?” No. Types are erased at runtime, so nothing has been checked.",
    takeaway: "A type is only useful if it is true, so make it true.",
  },
  sources: [
    { label: "Using TypeScript", href: "https://react.dev/learn/typescript" },
    { label: "useRef reference", href: "https://react.dev/reference/react/useRef" },
    { label: "createContext reference", href: "https://react.dev/reference/react/createContext" },
    { label: "useReducer reference", href: "https://react.dev/reference/react/useReducer" },
    { label: "React 19 release post", href: "https://react.dev/blog/2024/12/05/react-19" },
  ],
};
