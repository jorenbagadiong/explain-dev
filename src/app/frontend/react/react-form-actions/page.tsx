import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/form-actions";

export const metadata = lessonMetadata("form-actions");

export default function Page() {
  return <LessonArticlePage topicId="form-actions" lesson={lesson} />;
}
