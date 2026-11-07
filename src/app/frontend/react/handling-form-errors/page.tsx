import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/form-errors";

export const metadata = lessonMetadata("form-errors");

export default function Page() {
  return <LessonArticlePage topicId="form-errors" lesson={lesson} />;
}
