import { useStateCounterChallenge } from "@/content/labs/react/use-state-counter";
import { frontendTechnologies } from "@/lib/learning/frontend-technologies";
import { reactCurriculumGroups } from "@/lib/learning/react-curriculum";
import { reactTopics, type ReactTopic } from "@/lib/learning/react-topics";
import { PRACTICE_HREF } from "./practice-route";
import type { LabChallenge } from "./types";

export { PRACTICE_HREF };

// Registry of published challenges. Order is display order.
export const labChallenges: readonly LabChallenge[] = [useStateCounterChallenge];

export function getLabChallenge(id: string): LabChallenge | undefined {
  return labChallenges.find((challenge) => challenge.id === id);
}

export function challengeHref(challenge: Pick<LabChallenge, "technologyId" | "slug">): string {
  return `${PRACTICE_HREF}/${challenge.technologyId}/${challenge.slug}`;
}

export type AvailableReactTopic = Extract<ReactTopic, { status: "available" }>;

/** Resolves the referenced lesson from the curriculum registry. Titles and routes are never duplicated. */
export function getChallengeLesson(challenge: LabChallenge): AvailableReactTopic | undefined {
  const topic = reactTopics.find((entry) => entry.id === challenge.lessonId);
  return topic?.status === "available" ? topic : undefined;
}

export interface LabChallengeContext {
  challenge: LabChallenge;
  href: string;
  lesson: AvailableReactTopic;
  technology: { name: string; href: string };
  group: { id: string; title: string };
}

export function getLabChallengeContext(id: string): LabChallengeContext | undefined {
  const challenge = getLabChallenge(id);
  if (!challenge) return undefined;
  const lesson = getChallengeLesson(challenge);
  const technology = frontendTechnologies.find((entry) => entry.id === challenge.technologyId);
  const group = lesson && reactCurriculumGroups.find((entry) => entry.id === lesson.groupId);
  if (!lesson || !group || technology?.status !== "available") return undefined;
  return {
    challenge,
    href: challengeHref(challenge),
    lesson,
    technology: { name: technology.name, href: technology.href },
    group: { id: group.id, title: group.title },
  };
}
