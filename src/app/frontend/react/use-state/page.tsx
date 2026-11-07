import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { CodeBlock } from "@/components/learning/code-block";
import { categories } from "@/components/navigation/categories";
import { useStateArticle as article } from "@/content/react/use-state";
import { frontendTechnologies } from "@/lib/learning/frontend-technologies";
import { reactTopics } from "@/lib/learning/react-topics";

const frontend = categories.find((category) => category.id === "frontend");
const react = frontendTechnologies.find((technology) => technology.id === "react");
const topic = reactTopics.find((entry) => entry.id === "use-state");

export const metadata: Metadata = {
  title: `${article.heading} | Explain Dev`,
  description: topic?.summary,
};

function Paragraphs({ paragraphs }: { paragraphs: readonly string[] }) {
  return paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 leading-8 text-muted-foreground">{paragraph}</p>);
}

export default function UseStatePage() {
  if (!frontend || frontend.status !== "available" || !react || react.status !== "available" || !topic || topic.status !== "available") notFound();
  const sections = [article.overview, article.usage, article.updates, article.examples, article.mistakes, article.interview, article.takeaways];

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
          <p className="mb-4 text-xs font-medium tracking-[0.16em] text-primary uppercase">React · State fundamentals</p>
          <h1 id="article-heading" className="text-4xl leading-tight font-semibold tracking-[-0.045em] sm:text-5xl">{article.heading}</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{topic.summary}</p>
        </header>

        <nav aria-label="On this page" className="mt-8 rounded-xl border bg-muted/30 p-5 sm:p-6">
          <p className="mb-3 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">On this page</p>
          <ol className="grid gap-x-6 sm:grid-cols-2">
            {sections.map((section) => <li key={section.id}><a href={`#${section.id}`} className="inline-flex min-h-11 items-center rounded-md py-2 text-sm text-primary underline-offset-4 hover:underline">{section.heading}</a></li>)}
          </ol>
        </nav>

        <section id={article.overview.id} className="mt-12 scroll-mt-28">
          <h2 className="text-2xl font-semibold tracking-tight">{article.overview.heading}</h2>
          <Paragraphs paragraphs={article.overview.paragraphs} />
          <CodeBlock example={article.overview.syntax} />
          <p className="leading-8 text-muted-foreground">{article.overview.syntax.description}</p>
        </section>

        <section id={article.usage.id} className="mt-12 scroll-mt-28">
          <h2 className="text-2xl font-semibold tracking-tight">{article.usage.heading}</h2>
          <Paragraphs paragraphs={article.usage.paragraphs} />
          <ul className="mt-4 list-outside list-disc space-y-3 pl-5 leading-8 text-muted-foreground marker:text-primary">{article.usage.useCases.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3 className="mt-6 text-lg font-semibold">When state is unnecessary</h3>
          <ul className="mt-4 list-outside list-disc space-y-3 pl-5 leading-8 text-muted-foreground marker:text-primary">{article.usage.alternatives.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <section id={article.updates.id} className="mt-12 scroll-mt-28">
          <h2 className="text-2xl font-semibold tracking-tight">{article.updates.heading}</h2>
          <Paragraphs paragraphs={article.updates.paragraphs} />
          {article.updates.comparison.map((example) => <div key={example.id}><CodeBlock example={example} /><p className="leading-8 text-muted-foreground">{example.description}</p></div>)}
          <p className="mt-4 leading-8 text-muted-foreground">{article.updates.conclusion}</p>
        </section>

        <section id={article.examples.id} className="mt-12 scroll-mt-28">
          <h2 className="text-2xl font-semibold tracking-tight">{article.examples.heading}</h2>
          <Paragraphs paragraphs={article.examples.paragraphs} />
          {article.examples.items.map((example) => <div key={example.id} className="mt-8"><h3 className="text-lg font-semibold">{example.title}</h3><CodeBlock example={example} /><p className="leading-8 text-muted-foreground">{example.description}</p></div>)}
        </section>

        <section id={article.mistakes.id} className="mt-12 scroll-mt-28">
          <h2 className="text-2xl font-semibold tracking-tight">{article.mistakes.heading}</h2>
          <ol className="mt-6 space-y-7">
            {article.mistakes.items.map((mistake, index) => <li key={mistake.id}><h3 className="text-lg font-semibold">{index + 1}. {mistake.heading}</h3><p className="mt-3 leading-8 text-muted-foreground">{mistake.problem}</p><p className="mt-2 leading-8 text-muted-foreground"><span className="font-medium text-foreground">Correction: </span>{mistake.correction}</p></li>)}
          </ol>
        </section>

        <section id={article.interview.id} className="mt-12 scroll-mt-28">
          <h2 className="text-2xl font-semibold tracking-tight">{article.interview.heading}</h2>
          <ol className="mt-6 space-y-7">
            {article.interview.questions.map((question, index) => <li key={question.id}><h3 className="text-lg font-semibold">{index + 1}. {question.question}</h3><p className="mt-3 leading-8 text-muted-foreground">{question.answer}</p></li>)}
          </ol>
        </section>

        <section id={article.takeaways.id} className="mt-12 scroll-mt-28">
          <h2 className="text-2xl font-semibold tracking-tight">{article.takeaways.heading}</h2>
          <ul className="mt-4 list-outside list-disc space-y-3 pl-5 leading-8 text-muted-foreground marker:text-primary">{article.takeaways.items.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        <footer className="mt-12 border-t pt-6">
          <h2 className="text-lg font-semibold">Continue with the official React documentation</h2>
          <ul className="mt-3 flex flex-wrap gap-x-6">{article.sources.map((source) => <li key={source.href}><a href={source.href} className="inline-flex min-h-11 items-center rounded-md py-2 text-sm text-primary underline underline-offset-4">{source.label}</a></li>)}</ul>
        </footer>
      </article>
    </div>
  );
}
