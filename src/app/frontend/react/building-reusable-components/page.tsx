import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/reusable-components";

export const metadata = lessonMetadata("reusable-components");

export default function Page() {
  return <LessonArticlePage topicId="reusable-components" lesson={lesson} />;
}
