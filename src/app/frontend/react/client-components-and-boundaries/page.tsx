import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/client-boundaries";

export const metadata = lessonMetadata("client-boundaries");

export default function Page() {
  return <LessonArticlePage topicId="client-boundaries" lesson={lesson} />;
}
