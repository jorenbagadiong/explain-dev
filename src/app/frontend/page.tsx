import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock3 } from "lucide-react";

import { categories } from "@/components/navigation/categories";
import { frontendTechnologies } from "@/lib/learning/frontend-technologies";

const frontend = categories.find((category) => category.id === "frontend");
const description = "Explore the technologies and concepts used to build modern web interfaces.";

export const metadata: Metadata = {
  title: `${frontend?.label ?? "Category"} | Explain Dev`,
  description: `${description} Detailed learning content is coming in future milestones.`,
};

export default function FrontendPage() {
  if (!frontend || frontend.status !== "available") notFound();
  const Icon = frontend.icon;

  return (
    <>
      <Link href="/" className="mb-8 inline-flex min-h-11 items-center gap-2 rounded-md text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All categories
      </Link>
      <div className="mb-6 flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h1 className="max-w-2xl text-4xl leading-tight font-semibold tracking-[-0.045em] sm:text-5xl">
        {frontend.label}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        {description}
      </p>

      <section aria-labelledby="technologies-heading" className="mt-12 sm:mt-14">
        <h2 id="technologies-heading" className="text-xl font-semibold tracking-tight">Explore frontend technologies</h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Start with a technology to see its planned learning areas. React is open to explore, including the first published useState article. More technologies and topics will follow.
        </p>
        <ul className="mt-6 grid gap-4 md:grid-cols-2 sm:gap-5">
          {frontendTechnologies.map((technology) => {
            const TechnologyIcon = technology.icon;
            const content = (
              <>
                <div className="mb-7 flex items-center justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <TechnologyIcon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-md border bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                    {technology.status === "available" ? "Available" : "Coming soon"}
                  </span>
                </div>
                <h3 className="flex items-center justify-between gap-3 text-lg font-semibold tracking-tight">
                  {technology.name}
                  {technology.status === "available" && <ArrowUpRight className="size-4 text-primary" aria-hidden="true" />}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{technology.description}</p>
              </>
            );
            const cardClassName = "block h-full rounded-xl border bg-background p-6 sm:p-7";

            return (
              <li key={technology.id}>
                {technology.status === "available" ? (
                  <Link href={technology.href} className={`${cardClassName} transition-colors hover:border-primary/50 hover:bg-accent/30`}>
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

      <section aria-labelledby="content-status-heading" className="mt-10 flex max-w-2xl items-start gap-4 rounded-xl border bg-muted/30 p-6 sm:mt-12 sm:p-7">
        <Clock3 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <h2 id="content-status-heading" className="text-base font-semibold tracking-tight">More learning content is coming soon</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            React has an introduction and a published useState article. The other technologies and remaining Hook articles are coming in future milestones.
          </p>
        </div>
      </section>
    </>
  );
}
