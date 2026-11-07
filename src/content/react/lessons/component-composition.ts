import type { LessonArticle } from "@/content/react/article-types";

export const lesson: LessonArticle = {
  tier: "B",
  sections: [
    {
      id: "what-composition-is",
      heading: "What composition means",
      paragraphs: [
        "Composition means building larger features by combining smaller components, rather than by extending a base component or adding configuration flags. React has no component inheritance in its everyday model. You get reuse by putting components together.",
        "A good composed feature reads like an outline. Each part has one clear job, and you can change or replace a part without needing to understand the rest.",
      ],
      examples: [
        {
          id: "composed-card",
          classification: "complete",
          title: "A feature built from small parts",
          language: "tsx",
          code: `interface Product {
  id: string;
  name: string;
  price: number;
}

function Price({ amount }: { amount: number }) {
  return <p>PHP {amount.toFixed(2)}</p>;
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article>
      <h3>{product.name}</h3>
      <Price amount={product.price} />
    </article>
  );
}

export default function ProductGrid({ products }: { products: readonly Product[] }) {
  return (
    <section aria-label="Products">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </section>
  );
}`,
          description: "Price knows nothing about cards, and ProductCard knows nothing about grids. Each can be reused or changed separately.",
        },
      ],
    },
    {
      id: "finding-boundaries",
      heading: "Finding good boundaries",
      paragraphs: [
        "Thinking in React starts by drawing boxes around parts of a design and naming them. Good names are a useful test: if you can describe a component’s job without using and, the boundary is probably sound.",
        "User interfaces and data models often share the same structure, so the shape of your data frequently suggests your components. One component usually maps to one piece of the data.",
      ],
      visual: {
        heading: "Mapping a feature to components",
        context: "A searchable product table, broken into a tree. Indentation shows which component renders which.",
        root: {
          id: "table",
          title: "FilterableProductTable",
          description: "Owns the search text, and arranges the feature.",
          children: [
            { id: "search", title: "SearchBar", description: "Receives user input." },
            {
              id: "product-table",
              title: "ProductTable",
              description: "Displays and filters the list.",
              children: [
                { id: "category-row", title: "ProductCategoryRow", description: "One category heading." },
                { id: "product-row", title: "ProductRow", description: "One product." },
              ],
            },
          ],
        },
        note: "This is one reasonable split. Another team might choose differently, so the test is whether each part stays easy to understand.",
      },
    },
    {
      id: "composition-over-config",
      heading: "Composition instead of configuration",
      paragraphs: [
        "When a component needs another variation, the easy move is to add a boolean prop. After several, the component has many paths, some of which combine badly. Composition offers another route: split out the shared parts, and let each use case assemble what it needs.",
      ],
      comparison: [
        {
          id: "flags",
          title: "Growing through flags",
          items: ["One component with many boolean props.", "Combinations multiply, and some make no sense.", "Every new need changes shared code."],
        },
        {
          id: "parts",
          title: "Growing through composition",
          items: ["Small parts that callers arrange.", "Each use case reads clearly.", "New needs often add a part and change nothing else."],
        },
      ],
      examples: [
        {
          id: "compose-not-flag",
          classification: "complete",
          title: "Composing instead of adding flags",
          language: "tsx",
          code: `import type { ReactNode } from "react";

function Dialog({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={title}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

// Avoid: <Dialog title="Delete?" showDangerButton showCancel danger />
export default function DeleteDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <Dialog title="Delete this file?">
      <p>This cannot be undone.</p>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <button type="button" onClick={onConfirm}>
        Delete
      </button>
    </Dialog>
  );
}`,
          description: "Dialog provides the frame, and DeleteDialog supplies its own content without any new props on Dialog.",
        },
      ],
    },
    {
      id: "avoid-over-splitting",
      heading: "Do not split too early",
      paragraphs: [
        "Small components are a means, not a goal. A component used once, with a few lines, and no independent job can stay inline. Over-splitting has a real cost: readers must jump across files to understand simple markup, and props get passed along with no benefit.",
        "It is usually easier to start with slightly larger components, then extract when you notice a piece with a clear name, a second use, or logic that deserves isolation.",
      ],
    },
  ],
  mistakes: [
    {
      id: "boolean-explosion",
      heading: "Adding a boolean prop for every variation",
      problem: "Each flag looks like a small change, but flags multiply into combinations nobody tested. Soon a component has branches for isCompact, isDark, and hasIcon together, and a fix for one case breaks another.",
      correction: "Extract shared parts, and let separate components compose them for each case.",
    },
    {
      id: "god-component",
      heading: "Letting one component do everything",
      problem: "A page component that fetches, filters, formats, and renders is easy to start. Over time, it becomes hard to test or change safely, because every edit risks something unrelated in the same file.",
      correction: "Split along responsibilities, keeping state at the lowest common parent.",
    },
    {
      id: "wrapper-noise",
      heading: "Creating wrappers that add nothing",
      problem: "A StyledBox around a single div, or a component that only passes props through, adds one more file to read and one more layer in DevTools without offering any new capability.",
      correction: "Remove the layer unless it names something meaningful, or enforces a consistent rule.",
    },
    {
      id: "inheritance-thinking",
      heading: "Trying to reuse through inheritance",
      problem: "Developers from class-based backgrounds may reach for a base component to extend. React’s model does not support this well, so shared behavior gets stuck in a hierarchy that is hard to change.",
      correction: "Share UI through composition, and share logic through custom Hooks.",
    },
    {
      id: "premature-abstraction",
      heading: "Abstracting after one use",
      problem: "Generalizing a component before a second use forces you to guess future needs. The guess is often wrong, which leaves options nobody uses and an abstraction that does not fit the real second case.",
      correction: "Wait for real repetition, and allow some duplication until the shared shape becomes clear.",
    },
  ],
  interview: [
    {
      id: "why-composition",
      question: "Why does React favor composition over inheritance?",
      answer: "Components are functions that return elements, so combining them is natural and explicit. Composition gives reuse without a fragile hierarchy, since behavior and structure stay visible at the call site. Shared logic can go in custom Hooks.",
    },
    {
      id: "split-when",
      question: "How do you decide when to split a component?",
      answer: "When a part has its own clear job, is used in more than one place, or holds logic worth isolating. I also watch for names containing and, or for state that only part of the component uses. I would not split purely to reduce the line count.",
    },
    {
      id: "boolean-props",
      question: "What is the problem with many boolean props?",
      answer: "They create combinations that are hard to test, and some make no sense together. The component’s logic becomes tangled with each new flag. Replacing them with composition or a single variant prop often reduces the number of possible states.",
    },
    {
      id: "data-shape",
      question: "How does your data model influence your component structure?",
      answer: "UI and data often share the same structure, so a component usually maps to one piece of the data. A list of categories with products suggests a table, a category row, and a product row, which makes data flow and naming straightforward.",
    },
    {
      id: "state-placement-composition",
      question: "Where does state go in a composed feature?",
      answer: "At the closest common parent of the components that need it. Children then receive values and callbacks. Composition shapes the tree, and state placement follows it. Good placement also limits how much of the tree re-renders on each update.",
    },
    {
      id: "over-split-cost",
      question: "Can a codebase have too many small components?",
      answer: "Yes. Reading becomes jumping across files, props are passed through layers that do not use them, and abstractions may lock in the wrong shape. I would rather have a slightly larger component with a clear purpose, and extract it once a real need shows up.",
    },
  ],
  takeaways: [
    "Build features by combining small components with clear jobs.",
    "Prefer composition to piling up boolean props.",
    "Let the data’s shape suggest your boundaries.",
    "Extract when there is a real reason, and not just to shorten a file.",
  ],
  quickReview: {
    definition: "Composition is building features by combining focused components instead of inheriting or configuring through flags.",
    keyPoints: [
      "Each component should have a job you can name.",
      "Data shape often suggests component shape.",
      "Share UI by composition, and logic by custom Hooks.",
      "Some duplication is cheaper than the wrong abstraction.",
    ],
    codeReminder: {
      id: "review-reminder",
      classification: "complete",
      title: "A composed page",
      language: "tsx",
      code: `function Header() {
  return <h1>Lessons</h1>;
}

function LessonList() {
  return <p>Three lessons available.</p>;
}

export default function Page() {
  return (
    <main>
      <Header />
      <LessonList />
    </main>
  );
}`,
      description: "The parent reads as an outline of what the page contains.",
    },
    commonMistakes: [
      "Adding a boolean prop for each variation.",
      "Creating wrappers that add no capability.",
      "Generalizing before a second use exists.",
    ],
    interviewTrap: "“Is smaller always better?” No. Over-splitting scatters simple logic. Split when a part has its own purpose.",
    takeaway: "Compose small parts until the top level reads like a description of the feature.",
  },
  sources: [
    { label: "Thinking in React", href: "https://react.dev/learn/thinking-in-react" },
    { label: "Your First Component", href: "https://react.dev/learn/your-first-component" },
    { label: "Passing Props to a Component", href: "https://react.dev/learn/passing-props-to-a-component" },
  ],
};
