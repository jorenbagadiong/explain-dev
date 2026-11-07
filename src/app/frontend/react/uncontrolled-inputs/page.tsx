import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/uncontrolled-inputs";

export const metadata = lessonMetadata("uncontrolled-inputs");

export default function Page() {
  return <LessonArticlePage topicId="uncontrolled-inputs" lesson={lesson} />;
}
