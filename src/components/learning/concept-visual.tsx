import { CodeBlock } from "@/components/learning/code-block";
import type { ArticleConceptVisual, CodeExample } from "@/content/react/article-types";

// Examples are existing article records, matched by stable ID rather than copied.
export function ConceptVisual({ visual, examples = [] }: { visual: ArticleConceptVisual; examples?: readonly CodeExample[] }) {
  return (
    <figure className="my-8 rounded-xl border bg-muted/20 p-4 sm:p-6">
      <figcaption className="text-lg font-semibold">{visual.heading}</figcaption>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{visual.context}</p>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2">
        {visual.steps.map((step, index) => {
          const example = examples.find((item) => item.id === step.id);
          return (
            <li key={step.id} className="min-w-0 border-t border-primary/30 pt-4">
              <p className="mb-2 font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="font-semibold leading-7">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.description}</p>
              {example && <><CodeBlock example={example} /><p className="text-sm leading-7 text-muted-foreground">{example.description}</p></>}
            </li>
          );
        })}
      </ol>
      <p className="mt-6 border-t pt-4 text-sm leading-7 text-muted-foreground">{visual.note}</p>
    </figure>
  );
}
