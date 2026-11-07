import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-deferred-value";

export const metadata = lessonMetadata("use-deferred-value");

export default function Page() {
  return <LessonArticlePage topicId="use-deferred-value" lesson={lesson} />;
}
