import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/rendering-performance";

export const metadata = lessonMetadata("rendering-performance");

export default function Page() {
  return <LessonArticlePage topicId="rendering-performance" lesson={lesson} />;
}
