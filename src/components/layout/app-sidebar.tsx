import { CategoryNavigation } from "@/components/navigation/category-navigation";

export function AppSidebar() {
  return (
    <aside aria-label="Learning sidebar" className="sticky top-20 hidden h-[calc(100svh-5rem)] w-64 shrink-0 flex-col overflow-y-auto border-r p-5 lg:flex">
      <CategoryNavigation />
      <div className="mt-auto px-3 pt-12">
        <p className="text-sm font-medium">One concept at a time.</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          A little clarity.<br />A better developer.
        </p>
      </div>
    </aside>
  );
}
