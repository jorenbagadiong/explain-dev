import Link from "next/link";
import { BookOpen, ChevronRight, ListChecks } from "lucide-react";

import type { LabChallengeContext } from "@/lib/lab/challenges";
import { PRACTICE_HREF } from "@/lib/lab/challenges";
import { PracticeWorkspaceLoader } from "./practice-workspace-loader";
import { PrototypeNotice } from "./prototype-notice";

import { challengeProgressDefinition } from "@/lib/lab/progress-definition";

const DIFFICULTY_LABEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;

// Static challenge content is server-rendered; only the workspace below is a lazily loaded Client Component.
export function ChallengePage({ context }: { context: LabChallengeContext }) {
  const { challenge, lesson, technology, group } = context;
  const progressDefinition = challengeProgressDefinition(challenge);
  const headingId = "challenge-heading";

  return (
    <div className="mx-auto max-w-6xl">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li><Link href="/" className="inline-flex min-h-11 items-center rounded-md hover:text-foreground">Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
          <li><Link href={PRACTICE_HREF} className="inline-flex min-h-11 items-center rounded-md hover:text-foreground">Practice</Link></li>
          <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
          <li><span aria-current="page" className="text-foreground">{challenge.title}</span></li>
        </ol>
      </nav>
      <article aria-labelledby={headingId} className="min-w-0">
        <header className="max-w-3xl">
          <p className="mb-4 text-xs font-medium tracking-[0.16em] text-primary uppercase">{technology.name} · {group.title} · Coding Lab</p>
          <h1 id={headingId} className="text-4xl leading-tight font-semibold tracking-[-0.045em] sm:text-5xl">{challenge.title}</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{challenge.description}</p>
          <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2"><dt className="text-muted-foreground">Difficulty</dt><dd className="font-medium">{DIFFICULTY_LABEL[challenge.difficulty]}</dd></div>
            <div className="flex items-center gap-2"><dt className="text-muted-foreground">Lesson</dt><dd><Link href={lesson.href} className="inline-flex min-h-11 items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline" data-lab-lesson-link=""><BookOpen aria-hidden="true" className="size-4" />{lesson.title}</Link></dd></div>
          </dl>
        </header>

        <section aria-label="Learning objectives" className="mt-8 text-sm leading-7 text-muted-foreground"><h2 className="font-medium text-foreground">What you’ll practice</h2><ul className="mt-2 list-disc pl-5">{challenge.objectives.map(objective => <li key={objective}>{objective}</li>)}</ul></section>
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section aria-labelledby="instructions-heading" className="min-w-0 rounded-xl border p-5 sm:p-6">
            <h2 id="instructions-heading" className="text-xl font-semibold tracking-tight">Instructions</h2>
            <ol className="mt-4 list-outside list-decimal space-y-3 pl-5 leading-7 text-muted-foreground marker:text-primary">
              {challenge.instructions.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>
          <section aria-labelledby="requirements-heading" className="min-w-0 rounded-xl border p-5 sm:p-6">
            <h2 id="requirements-heading" className="flex items-center gap-2 text-xl font-semibold tracking-tight"><ListChecks aria-hidden="true" className="size-5 text-primary" />Requirements</h2>
            <ul className="mt-4 space-y-3 leading-7 text-muted-foreground">
              {challenge.requirements.map((requirement) => <li key={requirement} className="flex gap-3"><span aria-hidden="true" className="mt-3 size-1.5 shrink-0 rounded-full bg-primary" />{requirement}</li>)}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Try these in the preview, then select Run Tests to check this challenge’s behavior.</p>

          </section>
        </div>

        <PrototypeNotice />
        <h2 className="sr-only">Workspace</h2>
        <PracticeWorkspaceLoader gradingRevision={progressDefinition.gradingRevision} starterRevision={challenge.starterRevision} hints={challenge.hints} challengeId={challenge.id} challengeTitle={challenge.title} starterFile={{ name: challenge.starterFiles[0].name, code: challenge.starterFiles[0].code }} />
      </article>
    </div>
  );
}
