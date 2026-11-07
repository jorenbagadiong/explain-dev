import { Braces } from "lucide-react";

import type { ReactTopic } from "@/lib/learning/react-topics";

export function TopicCard({ topic }: { topic: ReactTopic }) {
  return (
    <article className="h-full rounded-xl border bg-background p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <Braces className="size-5" aria-hidden="true" />
        </span>
        <span className="rounded-md border bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
          {topic.status === "coming-soon" ? "Coming soon" : "Available"}
        </span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{topic.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{topic.summary}</p>
    </article>
  );
}
