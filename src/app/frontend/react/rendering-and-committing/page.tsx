import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/render-and-commit";

export const metadata = lessonMetadata("render-and-commit");

export default function Page() {
  return <LessonArticlePage topicId="render-and-commit" lesson={lesson} />;
}
