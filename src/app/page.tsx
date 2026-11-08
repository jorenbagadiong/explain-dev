import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { DeveloperWorkspace } from "@/components/visuals/developer-workspace";
import { categories } from "@/components/navigation/categories";

export default function Home() {
  return (
    <>
      <div className="explore-hero">
        <div className="explore-hero-copy">
          <p className="hero-eyebrow"><span aria-hidden="true" />A clearer way to learn</p>
          <h1 className="hero-title">Explore development concepts</h1>
          <p className="hero-description">Understand frontend, backend, full-stack, and DevOps concepts through clear explanations and practical examples.</p>
          <div className="hero-actions">
            <Link href="/frontend/react" className="hero-primary-link">Explore React <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
            <Link href="/frontend/react/introduction-to-react" prefetch={false} className="hero-secondary-link">Start with the fundamentals <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <DeveloperWorkspace />
      </div>

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
                  {category.label}
                  {category.status === "available" && <ArrowUpRight className="size-4 text-primary" aria-hidden="true" />}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{category.description}</p>
              </>
            );
            const cardClassName = "depth-card block h-full rounded-xl border bg-background p-6 sm:p-7";

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
