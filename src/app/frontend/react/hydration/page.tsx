import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/hydration";

export const metadata = lessonMetadata("hydration");

export default function Page() {
  return <LessonArticlePage topicId="hydration" lesson={lesson} />;
}
