import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/effect-best-practices";

export const metadata = lessonMetadata("effect-best-practices");

export default function Page() {
  return <LessonArticlePage topicId="effect-best-practices" lesson={lesson} />;
}
