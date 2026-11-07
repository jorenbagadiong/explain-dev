import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/advanced-refs";

export const metadata = lessonMetadata("advanced-refs");

export default function Page() {
  return <LessonArticlePage topicId="advanced-refs" lesson={lesson} />;
}
