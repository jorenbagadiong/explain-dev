import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, ChevronRight } from "lucide-react";

import { PrototypeNotice } from "@/components/lab/prototype-notice";
import { getLabChallengeContext, labChallenges, type LabChallengeContext } from "@/lib/lab/challenges";

export const metadata: Metadata = {
  title: "Practice | Explain Dev",
  description: "Practice React concepts by editing real code and running it in a sandboxed preview.",
};

const DIFFICULTY_LABEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;

export default function PracticePage() {
  const challenges = labChallenges.map((challenge) => getLabChallengeContext(challenge.id)).filter((entry): entry is LabChallengeContext => Boolean(entry));

  return (
    <div className="mx-auto max-w-3xl">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li><Link href="/" className="inline-flex min-h-11 items-center rounded-md hover:text-foreground">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
          <li><span aria-current="page" className="text-foreground">Practice</span></li>
        </ol>
      </nav>
      <header>
        <p className="mb-4 text-xs font-medium tracking-[0.16em] text-primary uppercase">Coding Lab</p>
        <h1 className="text-4xl leading-tight font-semibold tracking-[-0.045em] sm:text-5xl">Practice</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">Apply a lesson by editing real React code and running it in a sandboxed preview.</p>
      </header>
      <PrototypeNotice />
      <section aria-labelledby="react-challenges-heading" className="mt-10">
        <h2 id="react-challenges-heading" className="text-2xl font-semibold tracking-tight">React challenges</h2>
        <ul className="mt-5 grid gap-4">
          {challenges.map(({ challenge, href, lesson, group }) => (
            <li key={challenge.id} className="rounded-xl border bg-background p-6" data-lab-challenge={challenge.id}>
              <p className="text-xs font-medium text-muted-foreground">{group.title} · {DIFFICULTY_LABEL[challenge.difficulty]}</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">
                <Link href={href} className="inline-flex min-h-11 items-center gap-2 underline-offset-4 hover:underline">{challenge.title}<ArrowUpRight aria-hidden="true" className="size-4 text-primary" /></Link>
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{challenge.description}</p>
              <p className="mt-3 text-sm">
                <Link href={lesson.href} className="inline-flex min-h-11 items-center gap-1.5 text-primary underline-offset-4 hover:underline"><BookOpen aria-hidden="true" className="size-4" />Lesson: {lesson.title}</Link>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
