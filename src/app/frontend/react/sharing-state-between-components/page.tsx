import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/sharing-state";

export const metadata = lessonMetadata("sharing-state");

export default function Page() {
  return <LessonArticlePage topicId="sharing-state" lesson={lesson} />;
}
