import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { categories } from "@/components/navigation/categories";

export default function Home() {
  return (
    <>
      <p className="mb-5 flex items-center gap-3 text-[10px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
        <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
        A clearer way to learn
      </p>
      <h1 className="max-w-2xl text-4xl leading-tight font-semibold tracking-[-0.045em] sm:text-5xl">
        Explore development concepts
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        Understand frontend, backend, full-stack, and DevOps concepts through clear explanations and practical examples.
      </p>

      <section aria-labelledby="categories-heading" className="mt-12 sm:mt-14">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 id="categories-heading" className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Learning categories
          </h2>
          <p className="text-xs text-muted-foreground">The library is taking shape</p>
        </div>
        <ul className="grid gap-4 md:grid-cols-2 sm:gap-5">
          {categories.map((category) => {
            const Icon = category.icon;
            const content = (
              <>
                <div className="mb-7 flex items-center justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-md border bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                    {category.status === "coming-soon" ? "Coming soon" : "Available"}
                  </span>
                </div>
                <h3 className="flex items-center justify-between gap-3 text-lg font-semibold tracking-tight">
                  {category.title}
                  {category.status === "available" && <ArrowUpRight className="size-4 text-primary" aria-hidden="true" />}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{category.description}</p>
              </>
            );
            const cardClassName = "block h-full rounded-xl border bg-background p-6 sm:p-7";

            return (
              <li key={category.id}>
                {category.status === "available" ? (
                  <Link href={category.href} className={`${cardClassName} transition-colors hover:border-primary/50 hover:bg-accent/30`}>
                    {content}
                  </Link>
                ) : (
                  <article className={cardClassName}>{content}</article>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
