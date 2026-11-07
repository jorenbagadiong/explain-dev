import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/keyboard-interactions";

export const metadata = lessonMetadata("keyboard-interactions");

export default function Page() {
  return <LessonArticlePage topicId="keyboard-interactions" lesson={lesson} />;
}
