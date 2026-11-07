import { LessonArticlePage, lessonMetadata } from "@/components/learning/lesson-article";
import { lesson } from "@/content/react/lessons/ui-logic-separation";

export const metadata = lessonMetadata("ui-logic-separation");

export default function Page() {
  return <LessonArticlePage topicId="ui-logic-separation" lesson={lesson} />;
}
