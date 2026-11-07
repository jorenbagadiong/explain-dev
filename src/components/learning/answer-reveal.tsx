"use client";

import { useId, useState, type ReactNode } from "react";

export function AnswerReveal({ question, children }: { question: string; children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  const answerId = useId();

  return (
    <>
      <button type="button" aria-expanded={revealed} aria-controls={answerId} aria-label={`${revealed ? "Hide" : "Reveal"} answer: ${question}`} onClick={() => setRevealed((previous) => !previous)} className="mt-4 inline-flex min-h-11 items-center rounded-md border px-4 py-2 text-sm font-medium text-primary hover:bg-accent/30">
        {revealed ? "Hide answer" : "Reveal answer"}
      </button>
      <div id={answerId} hidden={!revealed} className="mt-5 border-t pt-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-primary uppercase">Suggested answer</p>
        {children}
      </div>
    </>
  );
}
