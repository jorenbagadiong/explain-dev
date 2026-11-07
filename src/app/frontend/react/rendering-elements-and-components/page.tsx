import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/rendering-elements";

export const metadata = lessonMetadata("rendering-elements");

export default function Page() {
  return <LessonArticlePage topicId="rendering-elements" lesson={lesson} />;
}
