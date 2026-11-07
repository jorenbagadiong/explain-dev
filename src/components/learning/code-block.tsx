import type { CodeExample } from "@/content/react/use-state";

export function CodeBlock({ example }: { example: CodeExample }) {
  return (
    <figure className="my-6 min-w-0 overflow-hidden rounded-xl border bg-muted/30">
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 text-xs sm:px-5">
        <span className="font-medium">{example.title}</span>
        <span className="font-mono text-muted-foreground">{example.language.toUpperCase()}</span>
      </figcaption>
      <pre className="max-w-full overflow-x-auto p-4 font-mono text-[13px] leading-7 sm:p-5"><code>{example.code}</code></pre>
    </figure>
  );
}
