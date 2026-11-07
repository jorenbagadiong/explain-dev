import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/immutable-objects";

export const metadata = lessonMetadata("immutable-objects");

export default function Page() {
  return <LessonArticlePage topicId="immutable-objects" lesson={lesson} />;
}
