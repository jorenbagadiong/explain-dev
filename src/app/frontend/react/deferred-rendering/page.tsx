import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/deferred-rendering";

export const metadata = lessonMetadata("deferred-rendering");

export default function Page() {
  return <LessonArticlePage topicId="deferred-rendering" lesson={lesson} />;
}
