import { ArrowUpRight, Code2 } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col px-6 sm:px-10">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:z-10"
      >
        Skip to content
      </a>
      <header className="flex items-center justify-between border-b py-6 sm:py-8">
        <div className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <Code2 className="size-5" aria-hidden="true" />
          </span>
          Explain Dev<span className="text-primary">.</span>
        </div>
        <ThemeToggle />
      </header>

      <main id="main-content" className="flex flex-1 flex-col justify-center py-20 sm:py-28">
        <p className="mb-7 flex items-center gap-3 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
          <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
          A clearer way to learn
        </p>
        <h1 className="text-5xl leading-[1.05] font-semibold tracking-[-0.06em] sm:text-7xl lg:text-8xl">
          Explain <span className="text-primary">Dev.</span>
        </h1>
        <p className="mt-7 max-w-xl text-2xl leading-relaxed tracking-tight text-muted-foreground sm:text-3xl">
          Complex development concepts, explained simply.
        </p>
        <div className="mt-10">
          <Button asChild>
            <a href="https://github.com/jorenbagadiong/explain-dev">
              View the project <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        </div>
      </main>

      <footer className="flex flex-col gap-3 border-t py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>One concept at a time.</p>
        <p>Project foundation · ED-001</p>
      </footer>
    </div>
  );
}
