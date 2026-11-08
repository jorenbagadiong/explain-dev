"use client";

import { useId, useState, type ReactNode } from "react";

// Server-rendered content is passed as slots; only visibility needs client state.
export function ArticleModes({ learn, review, interview }: { learn: ReactNode; review: ReactNode; interview: ReactNode }) {
  const [mode, setMode] = useState("learn");
  const id = useId();
  const modes = [{ id: "learn", label: "Learn", content: learn }, { id: "review", label: "Quick Review", content: review }, { id: "interview", label: "Interview", content: interview }];

  return (
    <div className="mt-8">
      <div role="group" aria-label="Article mode" className="article-mode-selector grid grid-cols-3 gap-1 rounded-xl border bg-muted/30 p-1.5">
        {modes.map((item) => (
          <button key={item.id} id={`${id}-${item.id}-button`} type="button" aria-pressed={mode === item.id} aria-controls={`${id}-${item.id}-panel`} onClick={() => setMode(item.id)} className="min-h-11 rounded-lg px-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:underline aria-pressed:decoration-2 aria-pressed:underline-offset-4 sm:px-4">
            {item.label}
          </button>
        ))}
      </div>
      <noscript><p className="mt-4 text-sm text-muted-foreground">The full Learn view is available below. Switching modes and interview answer buttons require JavaScript; Learn’s answer disclosures work without it.</p></noscript>
      {modes.map((item) => (
        <div key={item.id} id={`${id}-${item.id}-panel`} role="region" aria-labelledby={`${id}-${item.id}-button`} hidden={mode !== item.id}>
          {item.content}
        </div>
      ))}
    </div>
  );
}
