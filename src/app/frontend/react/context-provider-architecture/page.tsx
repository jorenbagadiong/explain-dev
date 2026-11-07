import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/context-providers";

export const metadata = lessonMetadata("context-providers");

export default function Page() {
  return <LessonArticlePage topicId="context-providers" lesson={lesson} />;
}
