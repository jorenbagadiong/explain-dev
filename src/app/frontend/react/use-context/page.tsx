import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-context";

export const metadata = lessonMetadata("use-context");

export default function Page() {
  return <LessonArticlePage topicId="use-context" lesson={lesson} />;
}
