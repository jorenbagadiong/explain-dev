import Link from "next/link";
import { ArrowUpRight, Braces } from "lucide-react";

import type { ReactTopic } from "@/lib/learning/react-topics";

export function TopicCard({ topic }: { topic: ReactTopic }) {
  const content = (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <Braces className="size-5" aria-hidden="true" />
        </span>
        <span className="rounded-md border bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
          {topic.status === "coming-soon" ? "Coming soon" : "Available"}
        </span>
      </div>
      <h3 className="flex items-center justify-between gap-3 text-lg font-semibold tracking-tight">{topic.title}{topic.status === "available" && <ArrowUpRight className="size-4 text-primary" aria-hidden="true" />}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{topic.summary}</p>
    </>
  );
  const cardClassName = "block h-full rounded-xl border bg-background p-6";

  return topic.status === "available" ? (
    <Link href={topic.href} className={`${cardClassName} transition-colors hover:border-primary/50 hover:bg-accent/30`}>
      {content}
    </Link>
  ) : (
    <article className={cardClassName}>{content}</article>
  );
}
