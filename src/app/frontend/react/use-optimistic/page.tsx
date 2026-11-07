import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-optimistic";

export const metadata = lessonMetadata("use-optimistic");

export default function Page() {
  return <LessonArticlePage topicId="use-optimistic" lesson={lesson} />;
}
