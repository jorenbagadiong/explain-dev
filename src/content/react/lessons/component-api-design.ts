import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "props-are-an-api",
      heading: "Props are a public API",
      paragraphs: [
        "A component’s props are its interface, and every caller depends on them. A clear API makes correct use easy and mistakes hard. A confusing one spreads workarounds through the code, and it is expensive to change once many callers exist.",
        "Good design usually means fewer props, each with an obvious meaning, and with invalid combinations ruled out by the types.",
      ],
    },
    {
      id: "naming",
      heading: "Naming and conventions",
      paragraphs: ["Familiar names reduce what callers have to learn, so follow what the platform and the rest of your code already do."],
      list: [
        "Use on for event props, such as onSelect, and pass the relevant value as an argument.",
        "Name booleans as states that read naturally: isOpen, disabled, hasError.",
        "Reuse native names where you wrap an element, such as value, onChange, disabled, and className.",
        "Name props after what they mean to the caller, not how they are used internally.",
      ],
    },
    {
      id: "impossible-states",
      heading: "Making invalid combinations impossible",
      paragraphs: [
        "Several booleans let callers ask for things that make no sense, such as both primary and danger. A single variant prop cannot be contradictory. TypeScript unions go further, tying props that only make sense together.",
      ],
      examples: [
        {
          id: "union-props",
          classification: "complete",
          title: "A union that rules out bad combinations",
          language: "tsx",
          code: `type LinkOrButtonProps =
  | { href: string; onClick?: never; children: string }
  | { href?: never; onClick: () => void; children: string };

export function ActionLink(props: LinkOrButtonProps) {
  if (props.href !== undefined) {
    return <a href={props.href}>{props.children}</a>;
  }

  return (
    <button type="button" onClick={props.onClick}>
      {props.children}
    </button>
  );
}

export default function Example() {
  return (
    <>
      <ActionLink href="/docs">Read the docs</ActionLink>
      <ActionLink onClick={() => window.print()}>Print</ActionLink>
    </>
  );
}`,
          description: "Passing both href and onClick, or neither, is a compile error. It also renders the correct element for each, which matters for keyboard and screen reader behavior.",
        },
      ],
    },
    {
      id: "composition-points",
      heading: "Choosing where to allow composition",
      paragraphs: [
        "Decide which parts of a component callers can replace. A string title prop is simple but rigid. A ReactNode slot accepts anything, but gives you less control over consistency. The right answer depends on how much you want to standardize.",
      ],
      comparison: [
        {
          id: "data-props",
          title: "Data props",
          items: ["title=\"Delete file\"", "Consistent appearance.", "Fails when someone needs a link inside it."],
        },
        {
          id: "slot-props",
          title: "Slots and children",
          items: ["title={<h2>Delete file</h2>}", "Very flexible.", "Consistency depends on the caller."],
        },
      ],
      examples: [
        {
          id: "compound-components",
          classification: "complete",
          title: "Exposing several small parts",
          language: "tsx",
          code: `import type { ReactNode } from "react";

function Card({ children }: { children: ReactNode }) {
  return <article className="card">{children}</article>;
}

function CardTitle({ children }: { children: ReactNode }) {
  return <h3 className="card-title">{children}</h3>;
}

function CardBody({ children }: { children: ReactNode }) {
  return <div className="card-body">{children}</div>;
}

export default function LessonCard() {
  return (
    <Card>
      <CardTitle>Rendering lists</CardTitle>
      <CardBody>Turn data into repeatable UI.</CardBody>
    </Card>
  );
}`,
          description: "Callers arrange the parts, and each part keeps its styling consistent. This avoids an ever-growing list of props on Card.",
        },
      ],
    },
    {
      id: "evolving",
      heading: "Designing for change",
      paragraphs: [
        "APIs need to evolve without breaking callers. Adding an optional prop with a sensible default is safe. Removing a prop, or changing its meaning, is not, so give yourself room when first designing.",
      ],
      list: [
        "Prefer a variant string over a boolean when a third option seems likely.",
        "Give new props defaults that preserve current behavior.",
        "Mark outgoing props as deprecated in their TypeScript docs before removing them.",
        "Add props when a real need appears, because each one must be supported from then on.",
      ],
    },
  ],
  mistakes: [
    {
      id: "boolean-traps",
      heading: "Using booleans for options that may grow",
      problem: "isLarge seems fine until a medium size is needed. You then get isLarge and isSmall, and nothing prevents setting both, so the component has to pick a winner that callers cannot predict.",
      correction: "Use a union, such as size=\"sm\" | \"md\" | \"lg\".",
    },
    {
      id: "non-native-names",
      heading: "Renaming native props without a reason",
      problem: "text instead of value, or handler instead of onChange, forces everyone to learn a new vocabulary. It also prevents passing props straight through, so wrappers need extra mapping code.",
      correction: "Use the native names when the behavior matches the native behavior.",
    },
    {
      id: "implementation-leak",
      heading: "Exposing implementation details as props",
      problem: "A prop such as useGridLayout ties callers to how a component works today. When the internals change, the prop becomes meaningless, yet it still needs to be supported.",
      correction: "Describe the outcome the caller wants, and keep the implementation private.",
    },
    {
      id: "too-many-optional",
      heading: "Making everything optional",
      problem: "A component with all optional props compiles when required data is missing, which moves the error to runtime and leaves the component to guess. Callers then cannot tell from the types what is actually needed.",
      correction: "Require what is required, and provide defaults only where one truly makes sense.",
    },
    {
      id: "prop-for-each-need",
      heading: "Adding a prop for each new request",
      problem: "Each small request adds another prop and another branch, until the component’s API is too large to learn. Most props only serve one caller, yet all callers pay for the complexity.",
      correction: "Offer a composition point, so callers can handle special cases themselves.",
    },
  ],
  interview: [
    {
      id: "api-good",
      question: "What makes a good component API?",
      answer: "Few props with obvious meanings, names that follow platform conventions, and types that rule out invalid combinations. It makes correct use easy, it hides implementation, and it leaves room for extension through composition rather than through more options.",
    },
    {
      id: "api-union",
      question: "How can TypeScript improve a component’s API?",
      answer: "Unions replace contradictory booleans, and discriminated unions tie related props together, so a component takes href or onClick but not both. Required props are enforced, and ComponentProps brings in native attributes with correct types.",
    },
    {
      id: "api-flexibility",
      question: "How do you balance flexibility and consistency?",
      answer: "Data props give consistency but limit callers. Slots allow anything, but consistency depends on the caller. I standardize what must be consistent, such as spacing and accessibility, and open up composition points for content that varies.",
    },
    {
      id: "api-compound",
      question: "What are compound components?",
      answer: "A set of related components designed to work together, such as Card, CardTitle, and CardBody. Callers arrange them freely, and each part keeps its own styling. It avoids a long prop list, and it scales well to many layouts.",
    },
    {
      id: "api-breaking",
      question: "How would you change a component’s API used across a large codebase?",
      answer: "Add the new option alongside the old, with defaults that preserve behavior, and mark the old one as deprecated. Then migrate callers over time, possibly with a codemod, and remove the old prop once it is unused.",
    },
    {
      id: "api-boolean-or-variant",
      question: "When would you use a boolean rather than a variant string?",
      answer: "When the option is truly two-state and unlikely to grow, such as disabled or isOpen. For appearance or size, a union is usually better, because a third option is likely and it prevents setting contradictory flags.",
    },
  ],
  takeaways: [
    "Props are a public API, and they are costly to change later.",
    "Follow platform naming, and describe outcomes rather than internals.",
    "Use unions to make invalid combinations impossible.",
    "Offer composition points instead of a prop for every need.",
  ],
  quickReview: {
    definition: "Component API design means choosing props and composition points that make correct use easy and can evolve safely.",
    keyPoints: [
      "Use on for events, and native names where they apply.",
      "A variant union beats several booleans.",
      "Compound components avoid long prop lists.",
      "New optional props with defaults are safe changes.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A variant instead of booleans",
      language: "tsx",
      code: `type Size = "sm" | "md" | "lg";

export function Badge({ size = "md", children }: { size?: Size; children: React.ReactNode }) {
  return <span className={"badge-" + size}>{children}</span>;
}`,
      description: "Only one size can be chosen, and a fourth is easy to add later.",
    },
    commonMistakes: [
      "Using booleans for options that may grow.",
      "Exposing internals as props.",
      "Adding a prop for each request.",
    ],
    interviewTrap: "“Are more props more flexible?” Not really. Each adds combinations to support, and composition usually gives more flexibility with less API.",
    takeaway: "Design props the way you would design a function others must depend on.",
  },
  sources: [
    { label: "Passing Props to a Component", href: "https://react.dev/learn/passing-props-to-a-component" },
    { label: "Children reference", href: "https://react.dev/reference/react/Children" },
    { label: "Responding to Events", href: "https://react.dev/learn/responding-to-events" },
  ],
};
