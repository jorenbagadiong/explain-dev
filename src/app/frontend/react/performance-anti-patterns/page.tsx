import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/performance-antipatterns";

export const metadata = lessonMetadata("performance-antipatterns");

export default function Page() {
  return <LessonArticlePage topicId="performance-antipatterns" lesson={lesson} />;
}
