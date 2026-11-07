import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-action-state";

export const metadata = lessonMetadata("use-action-state");

export default function Page() {
  return <LessonArticlePage topicId="use-action-state" lesson={lesson} />;
}
