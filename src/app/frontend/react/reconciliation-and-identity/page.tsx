import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/reconciliation-identity";

export const metadata = lessonMetadata("reconciliation-identity");

export default function Page() {
  return <LessonArticlePage topicId="reconciliation-identity" lesson={lesson} />;
}
