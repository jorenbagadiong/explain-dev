import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/react-lazy";

export const metadata = lessonMetadata("react-lazy");

export default function Page() {
  return <LessonArticlePage topicId="react-lazy" lesson={lesson} />;
}
