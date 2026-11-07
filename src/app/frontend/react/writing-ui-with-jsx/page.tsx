import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/jsx";

export const metadata = lessonMetadata("jsx");

export default function Page() {
  return <LessonArticlePage topicId="jsx" lesson={lesson} />;
}
