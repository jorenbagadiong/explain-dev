import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/server-components";

export const metadata = lessonMetadata("server-components");

export default function Page() {
  return <LessonArticlePage topicId="server-components" lesson={lesson} />;
}
