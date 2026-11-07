import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleLayout, ArticleSection } from "@/components/learning/article-layout";
import { LearnInterview } from "@/components/learning/article-panels";
import { CodeBlock } from "@/components/learning/code-block";
import { ConceptVisual } from "@/components/learning/concept-visual";
import type { CodeExample } from "@/content/react/article-types";
import { introductionToReactArticle as article, type ComparisonColumn } from "@/content/react/introduction-to-react";
import { reactTopics } from "@/lib/learning/react-topics";

const topic = reactTopics.find((entry) => entry.id === "react-introduction");

export const metadata: Metadata = {
  title: `${article.heading} | Explain Dev`,
  description: topic?.summary,
};

function Example({ example }: { example: CodeExample }) {
  return <div><CodeBlock example={example} /><p className="leading-8 text-muted-foreground">{example.description}</p></div>;
}

// Stacks on small screens, so comparisons never need horizontal scrolling.
function Comparison({ columns }: { columns: readonly ComparisonColumn[] }) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {columns.map((column) => (
        <div key={column.id} className="min-w-0 rounded-xl border p-5">
          <h3 className="font-semibold">{column.title}</h3>
          <ul className="mt-3 list-outside list-disc space-y-3 pl-5 text-sm leading-7 text-muted-foreground marker:text-primary">{column.items.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}

export default function IntroductionToReactPage() {
  if (!topic || topic.status !== "available") notFound();
  const sections = [article.overview, article.whyReact, article.declarativeUi, article.components, article.props, article.jsx, article.rendering, article.reactVsJavaScript, article.whenToUse, article.mistakes, article.interview, article.takeaways];

  return (
    <ArticleLayout topic={topic} heading={article.heading} eyebrow="React · Fundamentals" sections={sections} sources={article.sources} quickReview={article.quickReview} questions={article.interview.questions}>
      <ArticleSection section={article.overview} />
      <ArticleSection section={article.whyReact}><Comparison columns={article.whyReact.comparison} /></ArticleSection>
      <ArticleSection section={article.declarativeUi}>
        <Comparison columns={article.declarativeUi.comparison} />
        <Example example={article.declarativeUi.imperativeExample} />
        <Example example={article.declarativeUi.declarativeExample} />
      </ArticleSection>
      <ArticleSection section={article.components}>
        <Example example={article.components.basicExample} />
        <Example example={article.components.compositionExample} />
        <ConceptVisual visual={article.compositionVisual} />
      </ArticleSection>
      <ArticleSection section={article.props}>
        <Comparison columns={article.props.comparison} />
        <Example example={article.props.typedPropsExample} />
        <Example example={article.props.callbackExample} />
      </ArticleSection>
      <ArticleSection section={article.jsx}><Example example={article.jsx.example} /></ArticleSection>
      <ArticleSection section={article.rendering}>
        <ConceptVisual visual={article.visual} />
        <Example example={article.rendering.interactiveExample} />
        <p className="mt-4 leading-8 text-muted-foreground">{article.rendering.conclusion}</p>
      </ArticleSection>
      <ArticleSection section={article.reactVsJavaScript}><Comparison columns={article.reactVsJavaScript.comparison} /></ArticleSection>
      <ArticleSection section={article.whenToUse}><Comparison columns={article.whenToUse.comparison} /></ArticleSection>
      <ArticleSection section={article.mistakes}>
        <ol className="mt-6 space-y-7">
          {article.mistakes.items.map((mistake, index) => (
            <li key={mistake.id}>
              <h3 className="text-lg font-semibold">{index + 1}. {mistake.heading}</h3>
              <p className="mt-3 leading-8 text-muted-foreground">{mistake.problem}</p>
              <p className="mt-2 leading-8 text-muted-foreground"><span className="font-medium text-foreground">Correction: </span>{mistake.correction}</p>
              {mistake.examples?.map((example) => <Example key={example.id} example={example} />)}
            </li>
          ))}
        </ol>
      </ArticleSection>
      <ArticleSection section={article.interview}>
        <LearnInterview section={article.interview} />
      </ArticleSection>
      <ArticleSection section={article.takeaways}>
        <ul className="mt-4 list-outside list-disc space-y-3 pl-5 leading-8 text-muted-foreground marker:text-primary">{article.takeaways.items.map((item) => <li key={item}>{item}</li>)}</ul>
      </ArticleSection>
    </ArticleLayout>
  );
}
