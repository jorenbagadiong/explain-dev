import type { ReactLessonNavigationData } from "@/lib/learning/react-navigation";
import styles from "@/components/navigation/navigation.module.css";

import { CategoryNavigation } from "@/components/navigation/category-navigation";

export function AppSidebar({ lessonNavigation }: { lessonNavigation: ReactLessonNavigationData | null }) {
  return (
    <aside data-navigation-scroll="" aria-label="Learning sidebar" className={`${styles.sidebar} sticky top-20 hidden h-[calc(100svh-5rem)] w-64 shrink-0 flex-col overflow-y-auto border-r lg:flex`}>
      <CategoryNavigation lessonNavigation={lessonNavigation} />
      <div className={styles.footer}>
        <p>One concept at a time.</p>
        <p>
          A little clarity.<br />A better developer.
        </p>
      </div>
    </aside>
  );
}
