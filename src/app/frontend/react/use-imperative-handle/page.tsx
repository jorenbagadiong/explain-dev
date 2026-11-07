import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-imperative-handle";

export const metadata = lessonMetadata("use-imperative-handle");

export default function Page() {
  return <LessonArticlePage topicId="use-imperative-handle" lesson={lesson} />;
}
