import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/escape-hatches";

export const metadata = lessonMetadata("escape-hatches");

export default function Page() {
  return <LessonArticlePage topicId="escape-hatches" lesson={lesson} />;
}
