export type ReactTopicId =
  | "use-state"
  | "use-effect"
  | "use-ref"
  | "use-memo"
  | "use-callback"
  | "use-context";

export type ReactTopic = {
  id: ReactTopicId;
  title: string;
  summary: string;
  categoryId: "frontend";
  technologyId: "react";
  order: number;
} & (
  | { status: "coming-soon"; href?: never }
  | { status: "available"; href: string }
);

// Metadata only. Published article content is maintained separately.
export const reactTopics: readonly ReactTopic[] = [
  {
    id: "use-state",
    title: "useState",
    summary: "Manage state that triggers component re-renders when updated.",
    categoryId: "frontend",
    technologyId: "react",
    status: "available",
    href: "/frontend/react/use-state",
    order: 1,
  },
  {
    id: "use-effect",
    title: "useEffect",
    summary: "Synchronize a component with external systems.",
    categoryId: "frontend",
    technologyId: "react",
    status: "coming-soon",
    order: 2,
  },
  {
    id: "use-ref",
    title: "useRef",
    summary: "Store mutable values or DOM references without triggering re-renders.",
    categoryId: "frontend",
    technologyId: "react",
    status: "coming-soon",
    order: 3,
  },
  {
    id: "use-memo",
    title: "useMemo",
    summary: "Cache the result of a calculation between renders.",
    categoryId: "frontend",
    technologyId: "react",
    status: "coming-soon",
    order: 4,
  },
  {
    id: "use-callback",
    title: "useCallback",
    summary: "Cache a function reference between renders.",
    categoryId: "frontend",
    technologyId: "react",
    status: "coming-soon",
    order: 5,
  },
  {
    id: "use-context",
    title: "useContext",
    summary: "Read values from the nearest matching context provider.",
    categoryId: "frontend",
    technologyId: "react",
    status: "coming-soon",
    order: 6,
  },
];
