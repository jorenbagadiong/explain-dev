import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleComparison, ArticleExample, ArticleLayout, ArticleSection } from "@/components/learning/article-layout";
import { LearnInterview } from "@/components/learning/article-panels";
import { ConceptVisual } from "@/components/learning/concept-visual";
import { introductionToReactArticle as article } from "@/content/react/introduction-to-react";
import { reactTopics } from "@/lib/learning/react-topics";

const topic = reactTopics.find((entry) => entry.id === "react-introduction");

export const metadata: Metadata = {
  title: `${article.heading} | Explain Dev`,
  description: topic?.summary,
};

export default function IntroductionToReactPage() {
  if (!topic || topic.status !== "available") notFound();
  const sections = [article.overview, article.whyReact, article.declarativeUi, article.components, article.props, article.jsx, article.rendering, article.reactVsJavaScript, article.whenToUse, article.mistakes, article.interview, article.takeaways];

  return (
    <ArticleLayout topic={topic} heading={article.heading} eyebrow="React · Fundamentals" sections={sections} sources={article.sources} quickReview={article.quickReview} questions={article.interview.questions}>
      <ArticleSection section={article.overview} />
      <ArticleSection section={article.whyReact}><ArticleComparison columns={article.whyReact.comparison} /></ArticleSection>
      <ArticleSection section={article.declarativeUi}>
        <ArticleComparison columns={article.declarativeUi.comparison} />
        <ArticleExample example={article.declarativeUi.imperativeExample} />
        <ArticleExample example={article.declarativeUi.declarativeExample} />
      </ArticleSection>
      <ArticleSection section={article.components}>
        <ArticleExample example={article.components.basicExample} />
        <ArticleExample example={article.components.compositionExample} />
        <ConceptVisual visual={article.compositionVisual} />
      </ArticleSection>
      <ArticleSection section={article.props}>
        <ArticleComparison columns={article.props.comparison} />
        <ArticleExample example={article.props.typedPropsExample} />
        <ArticleExample example={article.props.callbackExample} />
      </ArticleSection>
      <ArticleSection section={article.jsx}><ArticleExample example={article.jsx.example} /></ArticleSection>
      <ArticleSection section={article.rendering}>
        <ConceptVisual visual={article.visual} />
        <ArticleExample example={article.rendering.interactiveExample} />
        <p className="mt-4 leading-8 text-muted-foreground">{article.rendering.conclusion}</p>
      </ArticleSection>
      <ArticleSection section={article.reactVsJavaScript}><ArticleComparison columns={article.reactVsJavaScript.comparison} /></ArticleSection>
      <ArticleSection section={article.whenToUse}><ArticleComparison columns={article.whenToUse.comparison} /></ArticleSection>
      <ArticleSection section={article.mistakes}>
        <ol className="mt-6 space-y-7">
          {article.mistakes.items.map((mistake, index) => (
            <li key={mistake.id}>
              <h3 className="text-lg font-semibold">{index + 1}. {mistake.heading}</h3>
              <p className="mt-3 leading-8 text-muted-foreground">{mistake.problem}</p>
              <p className="mt-2 leading-8 text-muted-foreground"><span className="font-medium text-foreground">Correction: </span>{mistake.correction}</p>
              {mistake.examples?.map((example) => <ArticleExample key={example.id} example={example} />)}
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
