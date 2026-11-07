import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-sync-external-store";

export const metadata = lessonMetadata("use-sync-external-store");

export default function Page() {
  return <LessonArticlePage topicId="use-sync-external-store" lesson={lesson} />;
}
