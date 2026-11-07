import { Accessibility, Atom, Braces, Code2, FileCode2, Gauge, PanelsTopLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type FrontendTechnologyId =
  | "html-css"
  | "javascript"
  | "typescript"
  | "react"
  | "nextjs"
  | "accessibility"
  | "performance";

export type FrontendTechnology = {
  id: FrontendTechnologyId;
  name: string;
  description: string;
  icon: LucideIcon;
} & (
  | { status: "available"; href: string }
  | { status: "coming-soon"; href?: never }
);

// Only expose a route after its technology page has been implemented.
export const frontendTechnologies: readonly FrontendTechnology[] = [
  {
    id: "html-css",
    name: "HTML & CSS",
    description: "Structure web pages and shape their layout, presentation, and responsive behavior.",
    icon: Code2,
    status: "coming-soon",
  },
  {
    id: "javascript",
    name: "JavaScript",
    description: "Understand the language that brings behavior and interactivity to the browser.",
    icon: Braces,
    status: "coming-soon",
  },
  {
    id: "typescript",
    name: "TypeScript",
    description: "Describe data with types and build confidence as your JavaScript applications grow.",
    icon: FileCode2,
    status: "coming-soon",
  },
  {
    id: "react",
    name: "React",
    description: "Build interactive user interfaces with reusable components.",
    icon: Atom,
    href: "/frontend/react",
    status: "available",
  },
  {
    id: "nextjs",
    name: "Next.js",
    description: "Explore routing, rendering, and the foundations of React applications with Next.js.",
    icon: PanelsTopLeft,
    status: "coming-soon",
  },
  {
    id: "accessibility",
    name: "Web Accessibility",
    description: "Make web experiences usable with keyboards, assistive technologies, and diverse access needs.",
    icon: Accessibility,
    status: "coming-soon",
  },
  {
    id: "performance",
    name: "Frontend Performance",
    description: "Understand how to measure and improve the speed and responsiveness of web interfaces.",
    icon: Gauge,
    status: "coming-soon",
  },
];
