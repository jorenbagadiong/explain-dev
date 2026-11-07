import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { TopicCard } from "@/components/learning/topic-card";
import { categories } from "@/components/navigation/categories";
import { frontendTechnologies } from "@/lib/learning/frontend-technologies";
import { reactCurriculumGroups } from "@/lib/learning/react-curriculum";
import { reactTopics } from "@/lib/learning/react-topics";

const frontend = categories.find((category) => category.id === "frontend");
const react = frontendTechnologies.find((technology) => technology.id === "react");
const description = "Learn the core concepts behind building interactive user interfaces with React.";
const publishedCount = reactTopics.filter((topic) => topic.status === "available").length;

export const metadata: Metadata = {
  title: `${react?.name ?? "Technology"} | Explain Dev`,
  description: `${description} Follow the curriculum from fundamentals to advanced patterns.`,
};

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
          React is a JavaScript library for building user interfaces with components: reusable pieces that describe parts of the screen. This collection introduces the concepts behind composing those pieces into interactive applications.
        </p>
      </section>

      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {publishedCount === reactTopics.length ? `All ${reactTopics.length} lessons are available now.` : `${publishedCount} of ${reactTopics.length} lessons are available now, and the rest are coming soon.`} Follow the curriculum from fundamentals to advanced patterns, or jump to a group below.
      </p>

      <nav aria-label="React curriculum" className="mt-8 rounded-xl border bg-muted/30 p-5 sm:p-6">
        <p className="mb-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">Explore the curriculum</p>
        <ol className="grid gap-x-6 sm:grid-cols-2">
          {[...reactCurriculumGroups].sort((a, b) => a.order - b.order).map((group) => (
            <li key={group.id}><a href={`#${group.id}`} className="inline-flex min-h-11 items-center rounded-md py-2 text-sm text-primary underline-offset-4 hover:underline">{group.title}</a></li>
          ))}
        </ol>
      </nav>

      {[...reactCurriculumGroups].sort((a, b) => a.order - b.order).map((group) => (
        <section key={group.id} id={group.id} aria-labelledby={`${group.id}-heading`} className="mt-14 scroll-mt-28 border-t pt-8 sm:mt-16">
          <h2 id={`${group.id}-heading`} className="text-2xl font-semibold tracking-tight">{group.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{group.description}</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 sm:gap-5">
            {reactTopics.filter((topic) => topic.groupId === group.id).sort((a, b) => a.order - b.order).map((topic) => (
              <li key={topic.id}><TopicCard topic={topic} /></li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
