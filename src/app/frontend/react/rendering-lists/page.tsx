import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/rendering-lists";

export const metadata = lessonMetadata("rendering-lists");

export default function Page() {
  return <LessonArticlePage topicId="rendering-lists" lesson={lesson} />;
}
