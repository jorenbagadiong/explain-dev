import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/keyboard-accessibility";

export const metadata = lessonMetadata("keyboard-accessibility");

export default function Page() {
  return <LessonArticlePage topicId="keyboard-accessibility" lesson={lesson} />;
}
