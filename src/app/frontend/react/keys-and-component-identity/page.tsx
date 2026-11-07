import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/list-keys";

export const metadata = lessonMetadata("list-keys");

export default function Page() {
  return <LessonArticlePage topicId="list-keys" lesson={lesson} />;
}
