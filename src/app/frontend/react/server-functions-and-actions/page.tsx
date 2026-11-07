import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/server-functions";

export const metadata = lessonMetadata("server-functions");

export default function Page() {
  return <LessonArticlePage topicId="server-functions" lesson={lesson} />;
}
