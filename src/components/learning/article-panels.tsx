import { AnswerReveal } from "@/components/learning/answer-reveal";
import { CodeBlock } from "@/components/learning/code-block";
import type { ArticleQuickReview, ArticleSection, InterviewQuestion } from "@/content/react/article-types";

export function QuickReviewPanel({ review }: { review: ArticleQuickReview }) {
  return (
    <div className="mt-8 space-y-8">
      <div className="border-l-2 border-primary pl-5">
        <h2 className="text-2xl font-semibold tracking-tight">Quick Review</h2>
        <p className="mt-3 leading-8 text-muted-foreground">{review.definition}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Keep these in mind</h3>
        <ul className="mt-4 list-disc space-y-3 pl-5 leading-7 text-muted-foreground marker:text-primary">{review.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul>
      </div>
      <div><CodeBlock example={review.codeReminder} /><p className="text-sm leading-7 text-muted-foreground">{review.codeReminder.description}</p></div>
      <div>
        <h3 className="text-lg font-semibold">Common mistakes</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-muted-foreground">{review.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}</ul>
      </div>
      <aside className="learning-callout rounded-xl border bg-muted/30 p-5 sm:p-6">
        <h3 className="font-semibold">The interview trap</h3>
        <p className="mt-3 leading-7 text-muted-foreground">{review.interviewTrap}</p>
      </aside>
      <p className="border-t pt-5 font-medium leading-7">{review.takeaway}</p>
    </div>
  );
}

export function InterviewPanel({ questions }: { questions: readonly InterviewQuestion[] }) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold tracking-tight">Interview practice</h2>
      <p className="mt-3 leading-7 text-muted-foreground">Explain your answer in your own words first. Then reveal the suggested answer and compare your reasoning.</p>
      <ol className="mt-6 space-y-5">
        {questions.map((question, index) => (
          <li key={question.id} className="interview-card rounded-xl border p-5 sm:p-6">
            <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">Question {index + 1}</p>
            <h3 className="text-lg font-semibold leading-7">{question.question}</h3>
            <AnswerReveal question={question.question}><p className="leading-8 text-muted-foreground">{question.answer}</p></AnswerReveal>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Native disclosures keep the complete Learn lesson usable without JavaScript.
export function LearnInterview({ section }: { section: ArticleSection & { questions: readonly InterviewQuestion[] } }) {
  return (
    <div className="mt-6 divide-y border-y">
      {section.questions.map((question, index) => (
        <details key={question.id} className="py-2">
          <summary className="cursor-pointer rounded-md py-3 leading-7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"><h3 className="inline text-base font-semibold">{index + 1}. {question.question}</h3></summary>
          <p className="pb-4 leading-8 text-muted-foreground">{question.answer}</p>
        </details>
      ))}
    </div>
  );
}
