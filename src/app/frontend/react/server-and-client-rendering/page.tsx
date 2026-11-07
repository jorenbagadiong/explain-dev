import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/server-client-rendering";

export const metadata = lessonMetadata("server-client-rendering");

export default function Page() {
  return <LessonArticlePage topicId="server-client-rendering" lesson={lesson} />;
}
