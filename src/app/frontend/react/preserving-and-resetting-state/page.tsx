import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/state-preservation";

export const metadata = lessonMetadata("state-preservation");

export default function Page() {
  return <LessonArticlePage topicId="state-preservation" lesson={lesson} />;
}
