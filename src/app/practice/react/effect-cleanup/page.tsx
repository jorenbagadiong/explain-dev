import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChallengePage } from "@/components/lab/challenge-page";
import { getLabChallengeContext } from "@/lib/lab/challenges";

const CHALLENGE_ID = "react-effect-cleanup";
const context = getLabChallengeContext(CHALLENGE_ID);

export const metadata: Metadata = {
  title: context ? `${context.challenge.title} · Practice | Explain Dev` : "Practice | Explain Dev",
  description: context?.challenge.description,
};

export default function EffectCleanupPracticePage() {
  if (!context) notFound();
  return <ChallengePage context={context} />;
}
