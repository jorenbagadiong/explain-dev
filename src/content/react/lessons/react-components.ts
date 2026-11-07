import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "A",
  sections: [
    {
      id: "what-a-component-is",
      heading: "What a component is",
      paragraphs: [
        "A component is a JavaScript function that returns markup. It can be as small as a button or as large as a page, and it packages what something looks like together with the logic behind it.",
        "Components exist so you can name a piece of UI, reuse it, and reason about it separately. Instead of copying a card’s markup into every page, you define it once and use it wherever it is needed.",
      ],
      examples: [
        {
          id: "first-component",
          classification: "complete",
          title: "Defining and using a component",
          language: "tsx",
          code: `function Avatar() {
  return <img src="/avatars/ana.png" alt="Ana Reyes" width={48} height={48} />;
}

export default function TeamMember() {
  return (
    <section>
      <Avatar />
      <h2>Ana Reyes</h2>
    </section>
  );
}`,
          description: "Avatar is defined once and used as a tag. TeamMember is its parent, and the file’s default export is what other files import.",
        },
      ],
    },
    {
      id: "component-rules",
      heading: "The rules for defining components",
      paragraphs: [
        "A few rules keep components working the way React expects.",
      ],
      list: [
        "Start the name with a capital letter. JSX treats <section> as an HTML tag and <Profile /> as your component, based only on that capital letter.",
        "Declare components at the top level of a file. A component defined inside another one becomes a new type on every render, which resets its state and is slow.",
        "Wrap a multi-line return in parentheses. Without them, JavaScript ends the statement at return and ignores the lines after it.",
        "Keep rendering pure, so the same inputs produce the same output.",
      ],
    },
    {
      id: "composing-a-tree",
      heading: "Composing components into a tree",
      paragraphs: [
        "Because a component can render other components, an application forms a tree with a root at the top. This render tree shows which component renders which, and it is useful for tracing where data comes from.",
      ],
      visual: {
        heading: "A small render tree",
        context: "Indentation shows which component renders which. The tree contains components, not the HTML they produce.",
        root: {
          id: "gallery",
          title: "Gallery",
          description: "The parent, which arranges the section.",
          children: [
            { id: "heading", title: "GalleryHeading", description: "Describes one heading." },
            {
              id: "profile",
              title: "Profile",
              description: "Rendered several times, and each use is a separate instance.",
              children: [{ id: "avatar", title: "Avatar", description: "A leaf with no component children." }],
            },
          ],
        },
        note: "This shows one render. Conditional rendering can change which branches exist from one render to the next.",
      },
    },
    {
      id: "organizing-files",
      heading: "Organizing components across files",
      paragraphs: [
        "As a file grows, move components into their own modules. A file can have one default export and any number of named exports. Default exports are common when a file holds one main component, and named exports suit several related ones.",
        "Pick one convention per project and give every component a meaningful name. Anonymous default exports, such as export default () => {}, are harder to find when debugging.",
      ],
      examples: [
        {
          id: "named-and-default",
          classification: "snippet",
          title: "Default and named exports together",
          language: "tsx",
          code: `export function Profile() {
  return <p>Maria Santos</p>;
}

export default function Gallery() {
  return <Profile />;
}`,
          description: "Another file would import these as import Gallery, { Profile } from \"./gallery\". The default import can use any local name, while the named import must match.",
        },
      ],
      closing: "Do not split a component only to make a file shorter. Split when a piece has its own job or is used in more than one place.",
    },
  ],
  mistakes: [
    {
      id: "lowercase-name",
      heading: "Naming a component in lowercase",
      problem: "A function called profile renders nothing useful when written as <profile />, because JSX treats any lowercase tag as a built-in element and never calls your function.",
      correction: "Capitalize the name where the component is defined and where it is used.",
    },
    {
      id: "nested-definitions",
      heading: "Defining a component inside another component",
      problem: "A nested definition looks tidy and can read the parent’s variables. But every render creates a new function, which React treats as a brand-new component type, so the child loses its state and its DOM on every update.",
      correction: "Declare every component at the top level, and pass what the child needs through props.",
      examples: [
        {
          id: "top-level-child",
          classification: "complete",
          title: "Keep the child at the top level",
          language: "tsx",
          code: `import { useState } from "react";

function SearchField({ label }: { label: string }) {
  const [text, setText] = useState("");

  return (
    <label>
      {label}
      <input value={text} onChange={event => setText(event.target.value)} />
    </label>
  );
}

export default function SearchPanel() {
  return <SearchField label="Search lessons" />;
}`,
          description: "SearchField keeps its typed text across parent renders because its type stays the same.",
        },
      ],
    },
    {
      id: "return-without-parentheses",
      heading: "Breaking a return across lines without parentheses",
      problem: "Writing return on its own line followed by JSX returns undefined. JavaScript inserts a semicolon after return, so the markup below is never reached.",
      correction: "Open a parenthesis on the same line as return, or keep the JSX on that line.",
    },
    {
      id: "components-as-functions",
      heading: "Calling a component as a plain function",
      problem: "Writing {Avatar()} appears to work, but the call runs as part of its parent, so the result is not a separate component instance. Any Hooks inside belong to the parent, which breaks once that call becomes conditional.",
      correction: "Render components with tags, as in <Avatar />, and let React decide when to call them.",
    },
  ],
  interview: [
    {
      id: "define-component",
      question: "What is a React component?",
      answer: "It is a function that returns markup describing part of the UI, along with any logic that part needs. Components are the unit of reuse and composition, and an application is a tree of them with a root at the top.",
    },
    {
      id: "capital-letter",
      question: "Why do component names have to be capitalized?",
      answer: "JSX uses case to decide what a tag means. A lowercase tag compiles to a string naming a built-in element, while a capitalized tag refers to a value in scope. Without the capital, your function is never called.",
    },
    {
      id: "nesting-problem",
      question: "What goes wrong if you define a component inside another component?",
      answer: "The inner function is recreated on each render, so React sees a different component type every time. It unmounts the old one and mounts a new one, which loses state and DOM, and also costs performance. Top-level definitions avoid this.",
    },
    {
      id: "instances",
      question: "If you render the same component three times, do the three share state?",
      answer: "No. Each use is a separate instance at its own position in the tree, with its own state. To share a value between them, you would move it to a common parent and pass it down.",
    },
    {
      id: "render-tree",
      question: "What is the render tree, and why is it useful?",
      answer: "It models which components render which during a render pass. It helps with tracing data flow and with spotting performance impact, because a change near the root can affect everything below it, while leaves tend to re-render most often.",
    },
    {
      id: "default-or-named",
      question: "When would you use a default export over a named export?",
      answer: "A default export suits a file with one main component, and named exports suit several related values. A file can only have one default. Teams often standardize on one style, because named exports keep names consistent across imports.",
    },
  ],
  takeaways: [
    "A component is a capitalized function that returns markup.",
    "Declare components at the top level, never inside another component.",
    "Render components as tags, and let React decide when to call them.",
    "Each use of a component is its own instance in a tree.",
  ],
  quickReview: {
    definition: "A component is a named, reusable function that returns a description of part of the UI.",
    keyPoints: [
      "The capital letter tells JSX it is your component.",
      "Top-level definitions keep the component type stable across renders.",
      "Each rendered use is an independent instance.",
      "An application forms a render tree starting from a root.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "Compose with tags",
      language: "tsx",
      code: `function Greeting() {
  return <h2>Welcome back</h2>;
}

export default function Page() {
  return (
    <main>
      <Greeting />
    </main>
  );
}`,
      description: "Two top-level components, with the parent rendering the child as a tag.",
    },
    commonMistakes: [
      "Using a lowercase component name, so React treats it as an HTML tag.",
      "Defining a component inside another one, which resets its state every render.",
      "Calling a component as a function instead of rendering it as a tag.",
    ],
    interviewTrap: "“Do two uses of the same component share state?” No. Each is its own instance. State is shared by moving it to a common parent.",
    takeaway: "Name a piece of UI, define it once at the top level, and compose it into a tree.",
  },
  sources: [
    { label: "Your First Component", href: "https://react.dev/learn/your-first-component" },
    { label: "Importing and Exporting Components", href: "https://react.dev/learn/importing-and-exporting-components" },
    { label: "Understanding Your UI as a Tree", href: "https://react.dev/learn/understanding-your-ui-as-a-tree" },
  ],
};
