import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3 } from "lucide-react";

import { categories } from "@/components/navigation/categories";

const frontend = categories.find((category) => category.id === "frontend");
const description = "Explore the technologies and concepts used to build modern web interfaces.";

export const metadata: Metadata = {
  title: `${frontend?.label ?? "Category"} | Explain Dev`,
  description: `${description} Detailed learning content is coming in future milestones.`,
};

const futureCoverage = [
  "HTML & CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Web Accessibility",
  "Frontend Performance",
];

export default function FrontendPage() {
  if (!frontend || frontend.status !== "available") notFound();
  const Icon = frontend.icon;

  return (
    <>
      <Link href="/" className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-md text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All categories
      </Link>
      <div className="mb-6 flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h1 className="max-w-2xl text-4xl leading-tight font-semibold tracking-[-0.045em] sm:text-5xl">
        {frontend.label}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        {description}
      </p>

      <section aria-labelledby="coverage-heading" className="mt-12 max-w-2xl sm:mt-14">
        <h2 id="coverage-heading" className="text-xl font-semibold tracking-tight">What this category will cover</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          From the structure of a page to the way it responds to people, frontend development brings web interfaces to life. Future coverage will connect browser fundamentals, modern tools, and the practices that make interfaces accessible and fast.
        </p>
        <ul className="mt-6 grid list-inside list-disc gap-x-8 gap-y-3 text-sm text-muted-foreground marker:text-primary sm:grid-cols-2">
          {futureCoverage.map((area) => <li key={area}>{area}</li>)}
        </ul>
      </section>

      <section aria-labelledby="content-status-heading" className="mt-10 flex max-w-2xl items-start gap-4 rounded-xl border bg-muted/30 p-6 sm:mt-12 sm:p-7">
        <Clock3 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <h2 id="content-status-heading" className="text-base font-semibold tracking-tight">Learning content is coming soon</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            This category is open to explore. Detailed explanations and practical examples will be added in future milestones. The areas above describe planned coverage and are not yet available as learning pages.
          </p>
        </div>
      </section>
    </>
  );
}
