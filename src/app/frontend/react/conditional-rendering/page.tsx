import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/conditional-rendering";

export const metadata = lessonMetadata("conditional-rendering");

export default function Page() {
  return <LessonArticlePage topicId="conditional-rendering" lesson={lesson} />;
}
