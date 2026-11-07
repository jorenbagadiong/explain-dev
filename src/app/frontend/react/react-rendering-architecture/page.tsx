import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/rendering-architecture";

export const metadata = lessonMetadata("rendering-architecture");

export default function Page() {
  return <LessonArticlePage topicId="rendering-architecture" lesson={lesson} />;
}
