import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/event-handling";

export const metadata = lessonMetadata("event-handling");

export default function Page() {
  return <LessonArticlePage topicId="event-handling" lesson={lesson} />;
}
