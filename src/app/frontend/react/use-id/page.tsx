import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-id";

export const metadata = lessonMetadata("use-id");

export default function Page() {
  return <LessonArticlePage topicId="use-id" lesson={lesson} />;
}
