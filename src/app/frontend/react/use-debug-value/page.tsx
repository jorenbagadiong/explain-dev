import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-debug-value";

export const metadata = lessonMetadata("use-debug-value");

export default function Page() {
  return <LessonArticlePage topicId="use-debug-value" lesson={lesson} />;
}
