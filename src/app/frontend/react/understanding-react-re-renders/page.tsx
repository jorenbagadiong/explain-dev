import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-rerenders";

export const metadata = lessonMetadata("react-rerenders");

export default function Page() {
  return <LessonArticlePage topicId="react-rerenders" lesson={lesson} />;
}
