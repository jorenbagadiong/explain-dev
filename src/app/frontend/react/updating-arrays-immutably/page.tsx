import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/immutable-arrays";

export const metadata = lessonMetadata("immutable-arrays");

export default function Page() {
  return <LessonArticlePage topicId="immutable-arrays" lesson={lesson} />;
}
