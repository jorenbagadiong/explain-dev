import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/context-data-flow";

export const metadata = lessonMetadata("context-data-flow");

export default function Page() {
  return <LessonArticlePage topicId="context-data-flow" lesson={lesson} />;
}
