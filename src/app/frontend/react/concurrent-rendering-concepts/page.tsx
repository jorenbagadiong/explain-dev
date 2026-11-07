import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/concurrent-rendering";

export const metadata = lessonMetadata("concurrent-rendering");

export default function Page() {
  return <LessonArticlePage topicId="concurrent-rendering" lesson={lesson} />;
}
