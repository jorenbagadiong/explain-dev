import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { CodeBlock } from "@/components/learning/code-block";
import { categories } from "@/components/navigation/categories";
import type { ArticleSection as SectionContent, ArticleSource, CodeExample } from "@/content/react/article-types";
import { frontendTechnologies } from "@/lib/learning/frontend-technologies";
import type { ReactTopic } from "@/lib/learning/react-topics";

interface ArticleLayoutProps {
  topic: Extract<ReactTopic, { status: "available" }>;
  heading: string;
  eyebrow: string;
  sections: readonly SectionContent[];
  sources: readonly ArticleSource[];
  children: React.ReactNode;
}

// Shared article chrome only. Each route explicitly composes its own content.
export function ArticleLayout({ topic, heading, eyebrow, sections, sources, children }: ArticleLayoutProps) {
  const frontend = categories.find((category) => category.id === "frontend");
  const react = frontendTechnologies.find((technology) => technology.id === "react");
  if (!frontend || frontend.status !== "available" || !react || react.status !== "available") notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li><Link href="/" className="inline-flex min-h-11 items-center rounded-md hover:text-foreground">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
          <li><Link href={frontend.href} className="inline-flex min-h-11 items-center rounded-md hover:text-foreground">{frontend.label}</Link></li>
          <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
          <li><Link href={react.href} className="inline-flex min-h-11 items-center rounded-md hover:text-foreground">{react.name}</Link></li>
          <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
          <li><span aria-current="page" className="text-foreground">{topic.title}</span></li>
        </ol>
      </nav>
      <article aria-labelledby="article-heading" className="min-w-0">
        <header>
          <p className="mb-4 text-xs font-medium tracking-[0.16em] text-primary uppercase">{eyebrow}</p>
          <h1 id="article-heading" className="text-4xl leading-tight font-semibold tracking-[-0.045em] sm:text-5xl">{heading}</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{topic.summary}</p>
        </header>
        <nav aria-label="On this page" className="mt-8 rounded-xl border bg-muted/30 p-5 sm:p-6">
          <p className="mb-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">On this page</p>
          <ol className="grid gap-x-6 sm:grid-cols-2">
            {sections.map((section) => <li key={section.id}><a href={`#${section.id}`} className="inline-flex min-h-11 items-center rounded-md py-2 text-sm text-primary underline-offset-4 hover:underline">{section.heading}</a></li>)}
          </ol>
        </nav>
        {children}
        <footer className="mt-12 border-t pt-6">
          <h2 className="text-lg font-semibold">Continue with the official React documentation</h2>
          <ul className="mt-3 flex flex-wrap gap-x-6">{sources.map((source) => <li key={source.href}><a href={source.href} className="inline-flex min-h-11 items-center rounded-md py-2 text-sm text-primary underline underline-offset-4">{source.label}</a></li>)}</ul>
        </footer>
      </article>
    </div>
  );
}

export function ArticleSection({ section, children }: { section: SectionContent; children?: React.ReactNode }) {
  return (
    <section id={section.id} className="mt-12 scroll-mt-28">
      <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
      {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 leading-8 text-muted-foreground">{paragraph}</p>)}
      {children}
    </section>
  );
}

export function ArticleExamples({ section }: { section: SectionContent & { items: readonly CodeExample[] } }) {
  return (
    <ArticleSection section={section}>
      {section.items.map((example) => <div key={example.id} className="mt-8"><h3 className="text-lg font-semibold">{example.title}</h3><CodeBlock example={example} /><p className="leading-8 text-muted-foreground">{example.description}</p></div>)}
    </ArticleSection>
  );
}
