import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/optimistic-forms";

export const metadata = lessonMetadata("optimistic-forms");

export default function Page() {
  return <LessonArticlePage topicId="optimistic-forms" lesson={lesson} />;
}
