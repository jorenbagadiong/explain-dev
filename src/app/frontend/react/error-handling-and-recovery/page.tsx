import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/error-handling";

export const metadata = lessonMetadata("error-handling");

export default function Page() {
  return <LessonArticlePage topicId="error-handling" lesson={lesson} />;
}
