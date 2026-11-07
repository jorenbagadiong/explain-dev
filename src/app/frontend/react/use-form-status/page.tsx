import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/use-form-status";

export const metadata = lessonMetadata("use-form-status");

export default function Page() {
  return <LessonArticlePage topicId="use-form-status" lesson={lesson} />;
}
