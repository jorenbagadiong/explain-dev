import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/form-validation";

export const metadata = lessonMetadata("form-validation");

export default function Page() {
  return <LessonArticlePage topicId="form-validation" lesson={lesson} />;
}
