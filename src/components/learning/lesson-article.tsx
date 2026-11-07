import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleComparison, ArticleLayout, ArticleSection } from "@/components/learning/article-layout";
import { LearnInterview } from "@/components/learning/article-panels";
import { CodeBlock } from "@/components/learning/code-block";
import { ConceptVisual } from "@/components/learning/concept-visual";
import type { LessonArticle, LessonExample, LessonExampleClassification } from "@/content/react/article-types";
import { reactCurriculumGroups } from "@/lib/learning/react-curriculum";
import { reactTopics, type ReactTopicId } from "@/lib/learning/react-topics";

const classificationLabels: Partial<Record<LessonExampleClassification, string>> = {
  client: "Client-only example",
  server: "Server-only example",
  framework: "Framework-specific example",
  snippet: "Partial snippet",
  external: "Requires an external package",
  pseudocode: "Conceptual pseudocode",
};

function LessonExampleBlock({ example }: { example: LessonExample }) {
  const label = classificationLabels[example.classification];
  return (
    <div>
      <CodeBlock example={example} />
      <p className="leading-8 text-muted-foreground">
        {label && <span className="font-medium text-foreground">{label}. </span>}
        {example.description}
      </p>
    </div>
  );
}

export function lessonMetadata(topicId: ReactTopicId): Metadata {
  const topic = reactTopics.find((entry) => entry.id === topicId);
  return { title: `${topic?.title} | Explain Dev`, description: topic?.summary };
}

// Renders on the server from one route's static import, so lesson bodies stay out
// of shared client bundles. Unpublished topics return 404 until their gates pass.
export function LessonArticlePage({ topicId, lesson }: { topicId: ReactTopicId; lesson: LessonArticle }) {
  const topic = reactTopics.find((entry) => entry.id === topicId);
  if (!topic || topic.status !== "available") notFound();
  const group = reactCurriculumGroups.find((entry) => entry.id === topic.groupId);
  const mistakes = { id: "common-mistakes", heading: "Common mistakes", paragraphs: [] };
  const interview = { id: "interview-questions", heading: "Interview questions", paragraphs: ["Try each answer aloud before opening it. These are topics to practice, not questions confirmed to come from any particular employer."], questions: lesson.interview };
  const takeaways = { id: "key-takeaways", heading: "Key takeaways", paragraphs: [] };

  return (
    <ArticleLayout topic={topic} heading={topic.title} eyebrow={`React · ${group?.title}`} sections={[...lesson.sections, mistakes, interview, takeaways]} sources={lesson.sources} quickReview={lesson.quickReview} questions={lesson.interview}>
      {lesson.sections.map((section) => (
        <ArticleSection key={section.id} section={section}>
          {section.comparison && <ArticleComparison columns={section.comparison} />}
          {section.list && <ul className="mt-4 list-outside list-disc space-y-3 pl-5 leading-8 text-muted-foreground marker:text-primary">{section.list.map((item) => <li key={item}>{item}</li>)}</ul>}
          {section.visual && <ConceptVisual visual={section.visual} />}
          {section.examples?.map((example) => <LessonExampleBlock key={example.id} example={example} />)}
          {section.closing && <p className="mt-4 leading-8 text-muted-foreground">{section.closing}</p>}
        </ArticleSection>
      ))}
      <ArticleSection section={mistakes}>
        <ol className="mt-6 space-y-7">
          {lesson.mistakes.map((mistake, index) => (
            <li key={mistake.id}>
              <h3 className="text-lg font-semibold">{index + 1}. {mistake.heading}</h3>
              <p className="mt-3 leading-8 text-muted-foreground">{mistake.problem}</p>
              <p className="mt-2 leading-8 text-muted-foreground"><span className="font-medium text-foreground">Correction: </span>{mistake.correction}</p>
              {mistake.examples?.map((example) => <LessonExampleBlock key={example.id} example={example} />)}
            </li>
          ))}
        </ol>
      </ArticleSection>
      <ArticleSection section={interview}><LearnInterview section={interview} /></ArticleSection>
      <ArticleSection section={takeaways}>
        <ul className="mt-4 list-outside list-disc space-y-3 pl-5 leading-8 text-muted-foreground marker:text-primary">{lesson.takeaways.map((item) => <li key={item}>{item}</li>)}</ul>
      </ArticleSection>
    </ArticleLayout>
  );
}
