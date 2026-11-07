import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/accessible-forms";

export const metadata = lessonMetadata("accessible-forms");

export default function Page() {
  return <LessonArticlePage topicId="accessible-forms" lesson={lesson} />;
}
