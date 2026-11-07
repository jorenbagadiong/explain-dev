"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House } from "lucide-react";

import { categories } from "@/components/navigation/categories";
import { cn } from "@/lib/utils";

const linkClassName =
  "flex min-h-11 items-center gap-3 rounded-md px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary";

export function CategoryNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation">
      <Link
        href="/"
        aria-current={pathname === "/" ? "page" : undefined}
        onClick={onNavigate}
        className={cn(linkClassName, "font-medium")}
      >
        <House className="size-4 shrink-0" aria-hidden="true" />
        Home
      </Link>
      <p className="mt-9 mb-3 px-3 text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        Learning categories
      </p>
      <ul className="space-y-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const content = (
            <>
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span>{category.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  {category.status === "coming-soon" ? "Coming soon" : "Available"}
                </span>
              </span>
            </>
          );

          return (
            <li key={category.id}>
              {category.status === "available" ? (
                <Link
                  href={category.href}
                  aria-current={
                    pathname === category.href || pathname.startsWith(`${category.href}/`)
                      ? "page"
                      : undefined
                  }
                  onClick={onNavigate}
                  className={linkClassName}
                >
                  {content}
                </Link>
              ) : (
                <div className="flex items-start gap-3 px-3 py-3 text-sm text-muted-foreground">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
