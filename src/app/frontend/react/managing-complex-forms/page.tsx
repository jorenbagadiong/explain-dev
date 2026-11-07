import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/complex-forms";

export const metadata = lessonMetadata("complex-forms");

export default function Page() {
  return <LessonArticlePage topicId="complex-forms" lesson={lesson} />;
}
