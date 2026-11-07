import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/form-submission";

export const metadata = lessonMetadata("form-submission");

export default function Page() {
  return <LessonArticlePage topicId="form-submission" lesson={lesson} />;
}
