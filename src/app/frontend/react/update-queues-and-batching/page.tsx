import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/state-update-queues";

export const metadata = lessonMetadata("state-update-queues");

export default function Page() {
  return <LessonArticlePage topicId="state-update-queues" lesson={lesson} />;
}
