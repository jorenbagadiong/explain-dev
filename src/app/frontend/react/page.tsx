import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock3 } from "lucide-react";

import { categories } from "@/components/navigation/categories";
import { frontendTechnologies } from "@/lib/learning/frontend-technologies";

const frontend = categories.find((category) => category.id === "frontend");
const react = frontendTechnologies.find((technology) => technology.id === "react");
const description = "Learn the core concepts behind building interactive user interfaces with React.";

export const metadata: Metadata = {
  title: `${react?.name ?? "Technology"} | Explain Dev`,
  description: `${description} Learning topics are coming in future milestones.`,
};

const futureLearningAreas = [
  "Components and JSX",
  "Props and State",
  "React Hooks",
  "Effects and Lifecycle",
  "Context API",
  "Rendering and Performance",
  "Custom Hooks",
  "Testing React Components",
];

export default function ReactPage() {
  if (!frontend || frontend.status !== "available" || !react || react.status !== "available") notFound();
  const Icon = react.icon;

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li><Link href="/" className="inline-flex min-h-11 items-center rounded-md hover:text-foreground">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
          <li><Link href={frontend.href} className="inline-flex min-h-11 items-center rounded-md hover:text-foreground">{frontend.label}</Link></li>
          <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
          <li><span aria-current="page" className="text-foreground">{react.name}</span></li>
        </ol>
      </nav>
      <div className="mb-6 flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h1 className="max-w-2xl text-4xl leading-tight font-semibold tracking-[-0.045em] sm:text-5xl">{react.name}</h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>

      <section aria-labelledby="react-overview-heading" className="mt-12 max-w-2xl sm:mt-14">
        <h2 id="react-overview-heading" className="text-xl font-semibold tracking-tight">A component-based approach to interfaces</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          React is a JavaScript library for building user interfaces with components: reusable pieces that describe parts of the screen. This collection will introduce the concepts behind composing those pieces into interactive applications.
        </p>
      </section>

      <section aria-labelledby="planned-areas-heading" className="mt-10 max-w-2xl">
        <h2 id="planned-areas-heading" className="text-xl font-semibold tracking-tight">Planned learning areas</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">These subjects describe future coverage. They are not published topics or links to lessons.</p>
        <ul className="mt-6 grid list-inside list-disc gap-x-8 gap-y-3 text-sm text-muted-foreground marker:text-primary sm:grid-cols-2">
          {futureLearningAreas.map((area) => <li key={area}>{area}</li>)}
        </ul>
      </section>

      <section aria-labelledby="react-content-status-heading" className="mt-10 flex max-w-2xl items-start gap-4 rounded-xl border bg-muted/30 p-6 sm:mt-12 sm:p-7">
        <Clock3 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <h2 id="react-content-status-heading" className="text-base font-semibold tracking-tight">{react.name} learning topics are coming soon.</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Detailed explanations and practical examples will be added in future milestones. For now, you can explore the technology introduction and return to the Frontend collection.</p>
        </div>
      </section>
    </>
  );
}
