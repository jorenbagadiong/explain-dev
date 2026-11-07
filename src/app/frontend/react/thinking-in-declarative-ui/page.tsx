import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleComparison, ArticleExample, ArticleLayout, ArticleSection } from "@/components/learning/article-layout";
import { LearnInterview } from "@/components/learning/article-panels";
import { ConceptVisual } from "@/components/learning/concept-visual";
import { thinkingInDeclarativeUiArticle as article } from "@/content/react/thinking-in-declarative-ui";
import { reactTopics } from "@/lib/learning/react-topics";

const topic = reactTopics.find((entry) => entry.id === "declarative-ui");

export const metadata: Metadata = {
  title: `${article.heading} | Explain Dev`,
  description: topic?.summary,
};

export default function ThinkingInDeclarativeUiPage() {
  if (!topic || topic.status !== "available") notFound();
  const sections = [article.overview, article.imperativeVsDeclarative, article.uiAsFunction, article.uiStates, article.stateDriven, article.conditional, article.composition, article.avoidingDom, article.imperativeCode, article.mistakes, article.interview, article.takeaways];

  return (
    <ArticleLayout topic={topic} heading={article.heading} eyebrow="React · Fundamentals" sections={sections} sources={article.sources} quickReview={article.quickReview} questions={article.interview.questions}>
      <ArticleSection section={article.overview} />
      <ArticleSection section={article.imperativeVsDeclarative}>
        <ArticleComparison columns={article.imperativeVsDeclarative.comparison} />
        <ConceptVisual visual={article.imperativeVisual} />
        <ConceptVisual visual={article.visual} />
        <ArticleExample example={article.imperativeVsDeclarative.imperativeExample} />
        <p className="mt-4 leading-8 text-muted-foreground">{article.imperativeVsDeclarative.conclusion}</p>
      </ArticleSection>
      <ArticleSection section={article.uiAsFunction}><ArticleExample example={article.uiAsFunction.example} /></ArticleSection>
      <ArticleSection section={article.uiStates}>
        <ConceptVisual visual={article.statesVisual} />
        <ArticleExample example={article.uiStates.example} />
      </ArticleSection>
      <ArticleSection section={article.stateDriven} />
      <ArticleSection section={article.conditional}>
        <ArticleExample example={article.conditional.patternsExample} />
        <ArticleExample example={article.conditional.formExample} />
      </ArticleSection>
      <ArticleSection section={article.composition}><ArticleExample example={article.composition.example} /></ArticleSection>
      <ArticleSection section={article.avoidingDom}><ArticleComparison columns={article.avoidingDom.comparison} /></ArticleSection>
      <ArticleSection section={article.imperativeCode}>
        <ul className="mt-4 list-outside list-disc space-y-3 pl-5 leading-8 text-muted-foreground marker:text-primary">{article.imperativeCode.useCases.map((item) => <li key={item}>{item}</li>)}</ul>
        <ArticleExample example={article.imperativeCode.example} />
      </ArticleSection>
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
