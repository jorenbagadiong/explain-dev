import { ArrowUpRight } from "lucide-react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { reactLessonNavigation } from "@/lib/learning/react-navigation";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh">
      <a href="#main-content" className="sr-only rounded-md bg-primary p-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60]">
        Skip to content
      </a>
      <AppHeader lessonNavigation={reactLessonNavigation} />
      <div className="flex">
        <AppSidebar lessonNavigation={reactLessonNavigation} />
        <div className="flex min-h-[calc(100svh-5rem)] min-w-0 flex-1 flex-col">
          <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 outline-none sm:px-10 sm:py-14 lg:px-12 lg:py-16">
            {children}
          </main>
          <footer className="mx-6 flex flex-col items-start gap-3 border-t py-5 text-xs text-muted-foreground sm:mx-10 sm:flex-row sm:items-center sm:justify-between lg:mx-12">
            <p>Complex development concepts, explained simply.</p>
            <Button asChild variant="ghost" className="-ml-3 text-xs sm:ml-0">
              <a href="https://github.com/jorenbagadiong/explain-dev">View the project <ArrowUpRight aria-hidden="true" /></a>
            </Button>
          </footer>
        </div>
      </div>
    </div>
  );
}
