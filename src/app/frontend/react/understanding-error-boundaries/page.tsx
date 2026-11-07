import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/error-boundaries";

export const metadata = lessonMetadata("error-boundaries");

export default function Page() {
  return <LessonArticlePage topicId="error-boundaries" lesson={lesson} />;
}
