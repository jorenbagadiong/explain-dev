import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleExamples, ArticleLayout, ArticleSection } from "@/components/learning/article-layout";
import { CodeBlock } from "@/components/learning/code-block";
import { useStateArticle as article } from "@/content/react/use-state";
import { reactTopics } from "@/lib/learning/react-topics";

const topic = reactTopics.find((entry) => entry.id === "use-state");

export const metadata: Metadata = {
  title: `${article.heading} | Explain Dev`,
  description: topic?.summary,
};

export default function UseStatePage() {
  if (!topic || topic.status !== "available") notFound();
  const sections = [article.overview, article.usage, article.updates, article.examples, article.mistakes, article.interview, article.takeaways];

  return (
    <ArticleLayout topic={topic} heading={article.heading} eyebrow="React · State fundamentals" sections={sections} sources={article.sources}>
      <ArticleSection section={article.overview}>
        <CodeBlock example={article.overview.syntax} />
        <p className="leading-8 text-muted-foreground">{article.overview.syntax.description}</p>
      </ArticleSection>
      <ArticleSection section={article.usage}>
        <ul className="mt-4 list-outside list-disc space-y-3 pl-5 leading-8 text-muted-foreground marker:text-primary">{article.usage.useCases.map((item) => <li key={item}>{item}</li>)}</ul>
        <h3 className="mt-6 text-lg font-semibold">When state is unnecessary</h3>
        <ul className="mt-4 list-outside list-disc space-y-3 pl-5 leading-8 text-muted-foreground marker:text-primary">{article.usage.alternatives.map((item) => <li key={item}>{item}</li>)}</ul>
      </ArticleSection>
      <ArticleSection section={article.updates}>
        {article.updates.comparison.map((example) => <div key={example.id}><CodeBlock example={example} /><p className="leading-8 text-muted-foreground">{example.description}</p></div>)}
        <p className="mt-4 leading-8 text-muted-foreground">{article.updates.conclusion}</p>
      </ArticleSection>
      <ArticleExamples section={article.examples} />
      <ArticleSection section={article.mistakes}>
        <ol className="mt-6 space-y-7">
          {article.mistakes.items.map((mistake, index) => <li key={mistake.id}><h3 className="text-lg font-semibold">{index + 1}. {mistake.heading}</h3><p className="mt-3 leading-8 text-muted-foreground">{mistake.problem}</p><p className="mt-2 leading-8 text-muted-foreground"><span className="font-medium text-foreground">Correction: </span>{mistake.correction}</p></li>)}
        </ol>
      </ArticleSection>
      <ArticleSection section={article.interview}>
        <ol className="mt-6 space-y-7">
          {article.interview.questions.map((question, index) => <li key={question.id}><h3 className="text-lg font-semibold">{index + 1}. {question.question}</h3><p className="mt-3 leading-8 text-muted-foreground">{question.answer}</p></li>)}
        </ol>
      </ArticleSection>
      <ArticleSection section={article.takeaways}>
        <ul className="mt-4 list-outside list-disc space-y-3 pl-5 leading-8 text-muted-foreground marker:text-primary">{article.takeaways.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </ArticleSection>
    </ArticleLayout>
  );
}
