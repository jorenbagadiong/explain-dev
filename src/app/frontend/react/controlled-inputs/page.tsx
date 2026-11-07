import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/controlled-inputs";

export const metadata = lessonMetadata("controlled-inputs");

export default function Page() {
  return <LessonArticlePage topicId="controlled-inputs" lesson={lesson} />;
}
