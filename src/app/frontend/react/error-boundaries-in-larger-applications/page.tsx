import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/error-recovery-boundaries";

export const metadata = lessonMetadata("error-recovery-boundaries");

export default function Page() {
  return <LessonArticlePage topicId="error-recovery-boundaries" lesson={lesson} />;
}
