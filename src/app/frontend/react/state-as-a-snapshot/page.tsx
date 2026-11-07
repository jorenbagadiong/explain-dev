import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/state-snapshots";

export const metadata = lessonMetadata("state-snapshots");

export default function Page() {
  return <LessonArticlePage topicId="state-snapshots" lesson={lesson} />;
}
