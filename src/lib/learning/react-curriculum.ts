export type ReactCurriculumGroupId =
  | "fundamentals"
  | "state-data-flow"
  | "hooks"
  | "component-architecture"
  | "forms-interaction"
  | "performance-rendering"
  | "advanced-react"
  | "testing-best-practices";

export interface ReactCurriculumGroup {
  id: ReactCurriculumGroupId;
  title: string;
  description: string;
  order: number;
}

// Learning groups within React; these are not global navigation categories.
export const reactCurriculumGroups = [
  {
    id: "fundamentals",
    title: "React Fundamentals",
    description: "Start with declarative UI, components, and how React renders a screen.",
    order: 1,
  },
  {
    id: "state-data-flow",
    title: "State & Data Flow",
    description: "Understand state over time and how data moves between components.",
    order: 2,
  },
  {
    id: "hooks",
    title: "React Hooks",
    description: "Explore the stable built-in Hooks from React and React DOM, one API at a time.",
    order: 3,
  },
  {
    id: "component-architecture",
    title: "Component Architecture",
    description: "Compose reusable components and give each piece a clear responsibility.",
    order: 4,
  },
  {
    id: "forms-interaction",
    title: "Forms & User Interaction",
    description: "Build forms and interactions that communicate clearly and work with a keyboard.",
    order: 5,
  },
  {
    id: "performance-rendering",
    title: "Performance & Rendering",
    description: "Understand rendering costs, measure bottlenecks, and choose useful optimizations.",
    order: 6,
  },
  {
    id: "advanced-react",
    title: "Advanced React",
    description: "Explore rendering boundaries, external systems, and version-sensitive React features.",
    order: 7,
  },
  {
    id: "testing-best-practices",
    title: "Testing & Best Practices",
    description: "Test behavior, debug problems, and keep React applications accessible and maintainable.",
    order: 8,
  },
] as const satisfies readonly ReactCurriculumGroup[];
