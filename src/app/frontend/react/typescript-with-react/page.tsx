import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/typescript-react";

export const metadata = lessonMetadata("typescript-react");

export default function Page() {
  return <LessonArticlePage topicId="typescript-react" lesson={lesson} />;
}
