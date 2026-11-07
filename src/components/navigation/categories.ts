import { Cloud, Layers3, PanelsTopLeft, Server } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type LearningCategory = "frontend" | "backend" | "fullstack" | "devops";

export type NavigationCategory = {
  id: LearningCategory;
  label: string;
  description: string;
  icon: LucideIcon;
} & (
  | { status: "available"; href: string }
  | { status: "coming-soon"; href?: never }
);

// Add an href only when its category page has been implemented.
export const categories: readonly NavigationCategory[] = [
  {
    id: "frontend",
    label: "Frontend Development",
    description: "Build clear, accessible interfaces and understand how the web works in the browser.",
    icon: PanelsTopLeft,
    href: "/frontend",
    status: "available",
  },
  {
    id: "backend",
    label: "Backend Development",
    description: "Explore the server-side foundations that power reliable applications and services.",
    icon: Server,
    status: "coming-soon",
  },
  {
    id: "fullstack",
    label: "Full-Stack Engineering",
    description: "Connect the pieces, from user interfaces to the systems working behind them.",
    icon: Layers3,
    status: "coming-soon",
  },
  {
    id: "devops",
    label: "DevOps & Cloud",
    description: "Understand how software is shipped, operated, and supported in the cloud.",
    icon: Cloud,
    status: "coming-soon",
  },
];
