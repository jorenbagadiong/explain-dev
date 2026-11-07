import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-effect-event";

export const metadata = lessonMetadata("use-effect-event");

export default function Page() {
  return <LessonArticlePage topicId="use-effect-event" lesson={lesson} />;
}
