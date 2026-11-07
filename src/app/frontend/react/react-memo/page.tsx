import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-memo";

export const metadata = lessonMetadata("react-memo");

export default function Page() {
  return <LessonArticlePage topicId="react-memo" lesson={lesson} />;
}
