import Link from "next/link";
import { BookOpen, ChevronRight, Lightbulb, ListChecks } from "lucide-react";

import type { LabChallengeContext } from "@/lib/lab/challenges";
import { PRACTICE_HREF } from "@/lib/lab/challenges";
import { PracticeWorkspaceLoader } from "./practice-workspace-loader";
import { PrototypeNotice } from "./prototype-notice";

const DIFFICULTY_LABEL = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;

// Static challenge content is server-rendered; only the workspace below is a lazily loaded Client Component.
export function ChallengePage({ context }: { context: LabChallengeContext }) {
  const { challenge, lesson, technology, group } = context;
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
            <p className="mt-4 text-xs text-muted-foreground">Check these yourself in the preview. Automatic grading isn&apos;t available yet.</p>
            <details className="mt-4 rounded-lg border p-3 text-sm">
              <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-medium"><Lightbulb aria-hidden="true" className="size-4 text-primary" />Hints</summary>
              <ul className="mt-2 list-outside list-disc space-y-2 pl-5 leading-6 text-muted-foreground marker:text-primary">
                {challenge.hints.map((hint) => <li key={hint}>{hint}</li>)}
              </ul>
            </details>
          </section>
        </div>

        <PrototypeNotice />
        <h2 className="sr-only">Workspace</h2>
        <PracticeWorkspaceLoader challengeTitle={challenge.title} starterFile={{ name: challenge.starterFiles[0].name, code: challenge.starterFiles[0].code }} />
      </article>
    </div>
  );
}
