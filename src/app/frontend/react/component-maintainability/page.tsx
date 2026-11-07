import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/component-maintainability";

export const metadata = lessonMetadata("component-maintainability");

export default function Page() {
  return <LessonArticlePage topicId="component-maintainability" lesson={lesson} />;
}
