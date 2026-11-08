"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House } from "lucide-react";

import { categories } from "@/components/navigation/categories";
import styles from "@/components/navigation/navigation.module.css";

export function CategoryNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className={styles.navigation}>
      <Link
        href="/"
        aria-current={pathname === "/" ? "page" : undefined}
        data-route-match={pathname === "/" ? "exact" : undefined}
        onClick={onNavigate}
        className={styles.link}
      >
        <span className={styles.icon} aria-hidden="true"><House className="size-4" /></span>
        <span className={styles.label}>Home</span>
      </Link>
      <p className={styles.sectionLabel}>Learning categories</p>
      <ul className={styles.list}>
        {categories.map((category) => {
          const Icon = category.icon;
          const content = (
            <>
              <span className={styles.icon} aria-hidden="true"><Icon className="size-4" /></span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className={styles.label}>{category.label}</span>
                <span className={styles.status}>{category.status === "coming-soon" ? "Coming soon" : "Available"}</span>
              </span>
            </>
          );
          const match = category.status === "available"
            ? pathname === category.href ? "exact" : pathname.startsWith(`${category.href}/`) ? "descendant" : undefined
            : undefined;

          return (
            <li key={category.id}>
              {category.status === "available" ? (
                <Link href={category.href} aria-current={match ? "page" : undefined} data-route-match={match} onClick={onNavigate} className={styles.link}>
                  {content}
                </Link>
              ) : (
                <div className={styles.upcoming}>{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
