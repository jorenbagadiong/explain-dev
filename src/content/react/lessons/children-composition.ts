import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "children-as-a-hole",
      heading: "children as a hole to fill",
      paragraphs: [
        "A component using the children prop has a hole that its parent can fill with any JSX. A Panel can provide a frame, a Layout can provide structure, and neither has to know what goes inside.",
        "This matters for more than flexibility. Because the parent creates the inner elements, data can go straight to where it is used, which removes the need to pass it through the frame.",
      ],
      examples: [
        {
          id: "panel-children",
          classification: "complete",
          title: "A frame around unknown content",
          language: "tsx",
          code: `import type { ReactNode } from "react";

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      <div className="panel-body">{children}</div>
    </section>
  );
}

export default function Settings({ userName }: { userName: string }) {
  return (
    <Panel title="Account">
      <p>Signed in as {userName}</p>
    </Panel>
  );
}`,
          description: "Panel never receives userName, because Settings passes the value straight to the paragraph.",
        },
      ],
    },
    {
      id: "named-slots",
      heading: "Several holes: named slots",
      paragraphs: [
        "When a layout has more than one place for content, use several props that accept JSX. Each prop is a named slot. Elements are ordinary values, so nothing special is needed.",
      ],
      examples: [
        {
          id: "named-slot-props",
          classification: "complete",
          title: "Slot props in a page layout",
          language: "tsx",
          code: `import type { ReactNode } from "react";

interface PageLayoutProps {
  header: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
}

function PageLayout({ header, sidebar, children }: PageLayoutProps) {
  return (
    <div className="page">
      <header>{header}</header>
      {sidebar && <aside>{sidebar}</aside>}
      <main>{children}</main>
    </div>
  );
}

export default function LessonPage() {
  return (
    <PageLayout header={<h1>Lessons</h1>} sidebar={<nav aria-label="Lessons">Topics</nav>}>
      <p>Choose a lesson to begin.</p>
    </PageLayout>
  );
}`,
          description: "The layout owns the arrangement, and the caller owns the content of each slot.",
        },
      ],
    },
    {
      id: "children-rendering-benefit",
      heading: "A rendering benefit",
      paragraphs: [
        "Composition can also reduce rendering. If a component with frequently changing state receives its expensive content through children, those elements were created by its parent, so they stay the same when only the component’s state changes. React can skip rendering them.",
      ],
      examples: [
        {
          id: "state-wrapper",
          classification: "complete",
          title: "State that does not re-render its children",
          language: "tsx",
          code: `import { useState, type ReactNode } from "react";

function HoverCard({ children }: { children: ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={isHovered ? "card hovered" : "card"}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
}

function ExpensiveChart() {
  return <p>Chart</p>;
}

export default function Dashboard() {
  return (
    <HoverCard>
      <ExpensiveChart />
    </HoverCard>
  );
}`,
          description: "Hovering re-renders HoverCard but not ExpensiveChart, because Dashboard created that element and did not re-render.",
        },
      ],
    },
    {
      id: "avoid-children-api",
      heading: "Avoid manipulating children",
      paragraphs: [
        "React’s Children utilities, such as Children.map, can inspect and transform what was passed, but the docs call this uncommon and fragile. children is opaque, and only contains the JSX you passed. A <MoreRows /> counts as one child, however many rows it renders.",
        "The recommended alternatives are more explicit, and they keep working when items move into other components.",
      ],
      list: [
        "Expose several components, such as a Row, and let the caller wrap each item.",
        "Accept an array of objects as a prop, such as tabs with an id, a header, and content.",
        "Use a render prop: a function prop that the component calls, passing it data, and that returns JSX.",
      ],
      examples: [
        {
          id: "render-prop",
          classification: "complete",
          title: "A render prop",
          language: "tsx",
          code: `import type { ReactNode } from "react";

interface RowListProps {
  rowIds: readonly string[];
  renderRow: (id: string, index: number) => ReactNode;
}

function RowList({ rowIds, renderRow }: RowListProps) {
  return <ul>{rowIds.map((id, index) => <li key={id}>{renderRow(id, index)}</li>)}</ul>;
}

export default function Page() {
  return <RowList rowIds={["first", "second"]} renderRow={(id, index) => <strong>{index + 1}. {id}</strong>} />;
}`,
          description: "The list controls the structure and passes data out, and the caller controls how each row looks.",
        },
      ],
    },
  ],
  mistakes: [
    {
      id: "children-map",
      heading: "Transforming children with the Children API",
      problem: "Children.map to add a class or wrapper seems direct. It only sees the elements you passed, so extracting items into a separate component silently breaks it, and it depends on a structure callers cannot see.",
      correction: "Use explicit components, an array prop, or a render prop.",
    },
    {
      id: "assuming-array",
      heading: "Assuming children is an array",
      problem: "children.length or children.map works with several children, but a single child is not wrapped in an array, so the code crashes when someone passes just one. It is opaque by design.",
      correction: "Do not inspect its structure. If you need a list, take an array prop.",
    },
    {
      id: "prop-over-children",
      heading: "Passing content as a string prop",
      problem: "A prop such as bodyText handles plain text, then fails as soon as someone needs a link or bold word inside it. Teams then add bodyHtml or similar workarounds, sometimes unsafely.",
      correction: "Accept children or a slot prop typed as ReactNode, so callers can pass any markup.",
    },
    {
      id: "too-many-slots",
      heading: "Adding too many slots",
      problem: "A component with ten slot props is hard to use and to understand, because it no longer has a clear shape. Each new slot adds more ways the layout can break.",
      correction: "Keep slots to the real structural points, and split separate concerns into their own components.",
    },
  ],
  interview: [
    {
      id: "children-what",
      question: "What is the children prop?",
      answer: "It holds whatever JSX is nested inside a component’s tag. It lets a component provide a frame or behavior around content it knows nothing about, which makes components such as cards, dialogs, and layouts reusable.",
    },
    {
      id: "slots",
      question: "How do you handle a layout with several content areas?",
      answer: "Use several props that accept JSX, sometimes called slots, such as header and sidebar, and use children for the main content. Elements are values, so no special API is needed. The caller decides what goes in each area.",
    },
    {
      id: "children-perf",
      question: "How can children improve rendering performance?",
      answer: "Elements in children are created by the parent. If a wrapper’s own state changes, but its parent does not re-render, those elements are unchanged, and React can skip them. Moving state into a wrapper that takes children is often simpler than memoizing.",
    },
    {
      id: "render-prop-q",
      question: "What is a render prop, and when would you use one?",
      answer: "A prop that is a function returning JSX, which the component calls with some data. It suits a component that owns the structure or data, while the caller controls the presentation. A custom Hook often replaces it when only logic needs sharing.",
    },
    {
      id: "children-api-why-not",
      question: "Why is the Children API discouraged?",
      answer: "It depends on what was literally passed, so it cannot see what an inner component renders, and moving items into another component breaks the logic. The docs call it uncommon and fragile, and they recommend explicit components, array props, or render props.",
    },
  ],
  takeaways: [
    "children lets a component frame content it does not know about.",
    "Use named slot props when there are several content areas.",
    "Passing content through children can avoid both prop drilling and re-renders.",
    "Avoid the Children API, and prefer explicit alternatives.",
  ],
  quickReview: {
    definition: "Composition through children lets a parent fill a component’s holes with any JSX.",
    keyPoints: [
      "Type content props as ReactNode.",
      "Elements are values, so slots need no special API.",
      "children is opaque, so do not inspect it.",
      "Render props pass data back out to the caller.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A children prop",
      language: "tsx",
      code: `import type { ReactNode } from "react";

export default function Callout({ children }: { children: ReactNode }) {
  return <aside className="callout">{children}</aside>;
}`,
      description: "Any markup can go inside, and Callout does not need to know what it is.",
    },
    commonMistakes: [
      "Using Children.map to add props or wrappers.",
      "Treating children as always being an array.",
      "Passing rich content as a string prop.",
    ],
    interviewTrap: "“Does a parent’s state change always re-render children passed to it?” Not if those elements were created higher up and that component did not re-render.",
    takeaway: "Leave a hole, and let the caller decide what fills it.",
  },
  sources: [
    { label: "Passing Props to a Component", href: "https://react.dev/learn/passing-props-to-a-component" },
    { label: "Children reference", href: "https://react.dev/reference/react/Children" },
    { label: "useMemo reference", href: "https://react.dev/reference/react/useMemo" },
  ],
};
