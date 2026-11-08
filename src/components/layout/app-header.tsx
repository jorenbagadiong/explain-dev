import Link from "next/link";
import { Code2 } from "lucide-react";

import styles from "@/components/navigation/navigation.module.css";

import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b bg-background px-5 sm:px-8">
      <Link id="app-home-link" href="/" aria-label="Explain Dev home" className={`${styles.brandLink} flex items-center gap-3 rounded-md font-semibold tracking-tight`}>
        <span className={`${styles.brandMark} flex size-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary`}>
          <Code2 className="size-5" aria-hidden="true" />
        </span>
        <span>Explain Dev<span className="text-primary">.</span></span>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <MobileNavigation />
      </div>
    </header>
  );
}
