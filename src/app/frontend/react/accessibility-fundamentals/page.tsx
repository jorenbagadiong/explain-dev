import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/accessibility-fundamentals";

export const metadata = lessonMetadata("accessibility-fundamentals");

export default function Page() {
  return <LessonArticlePage topicId="accessibility-fundamentals" lesson={lesson} />;
}
