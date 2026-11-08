"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Atom, ChevronDown } from "lucide-react";

import type { ReactLessonNavigationData } from "@/lib/learning/react-navigation";
import { NavigationBranch } from "./navigation-branch";
import styles from "./navigation.module.css";

export function ReactLessonNavigation({ data, onNavigate }: {
  data: ReactLessonNavigationData;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const match = pathname === data.href ? "exact" : pathname.startsWith(`${data.href}/`) ? "descendant" : undefined;

  return (
    <div className={styles.reactBranch}>
      <NavigationBranch key={pathname} label={`${data.title} navigation`} initiallyOpen={Boolean(match)} overview={
        <Link href={data.href} onClick={onNavigate} className={styles.reactLink}
          data-route-match={match} aria-current={match === "exact" ? "page" : match ? "location" : undefined}>
          <Atom aria-hidden="true" className="size-4 shrink-0" />{data.title}
        </Link>
      }>
        {/* Route changes, including history navigation, initialize the active group afresh. */}
        <LessonGroups key={pathname} pathname={pathname} data={data} onNavigate={onNavigate} />
      </NavigationBranch>
    </div>
  );
}

function LessonGroups({ pathname, data, onNavigate }: {
  pathname: string;
  data: ReactLessonNavigationData;
  onNavigate?: () => void;
}) {
  const activeGroup = data.groups.find((group) => group.lessons.some((lesson) => lesson.href === pathname));
  const [openGroup, setOpenGroup] = useState<string | null>(activeGroup?.id ?? null);
  const id = useId();
  const container = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const frame = container.current?.closest<HTMLElement>("[data-navigation-scroll]");
    if (!frame || !activeGroup) return;
    let pending = 0;
    const reveal = () => {
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        const link = container.current?.querySelector<HTMLElement>('[data-lesson-link][aria-current="page"]');
        if (!link?.getClientRects().length) return;
        const bounds = frame.getBoundingClientRect();
        const row = link.getBoundingClientRect();
        if (row.top < bounds.top + 12) frame.scrollTop += row.top - bounds.top - 12;
        else if (row.bottom > bounds.bottom - 12) frame.scrollTop += row.bottom - bounds.bottom + 12;
      });
    };
    reveal();
    const observer = new ResizeObserver(reveal);
    observer.observe(frame);
    return () => { cancelAnimationFrame(pending); observer.disconnect(); };
  }, [activeGroup]);

  return (
    <ul className={styles.groupList} ref={container}>
      {data.groups.map((group) => {
        const expanded = openGroup === group.id;
        const panelId = `${id}-${group.id}`;
        return (
          <li key={group.id} data-lesson-group={group.id}>
            <button type="button" id={`${panelId}-trigger`} className={styles.groupButton}
              aria-expanded={expanded} aria-controls={panelId} data-active-group={activeGroup?.id === group.id || undefined}
              onClick={() => setOpenGroup(expanded ? null : group.id)}>
              <span>{group.title}</span><ChevronDown aria-hidden="true" className={styles.chevron} />
            </button>
            <div id={panelId} hidden={!expanded} aria-labelledby={`${panelId}-trigger`}>
              {expanded && <ul className={styles.lessonList}>
                {group.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <Link href={lesson.href} onClick={onNavigate} className={styles.lessonLink}
                      data-lesson-link="" data-lesson-id={lesson.id}
                      aria-current={pathname === lesson.href ? "page" : undefined}>
                      {lesson.title}
                    </Link>
                  </li>
                ))}
              </ul>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
