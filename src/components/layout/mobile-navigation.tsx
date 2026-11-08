"use client";

import { useEffect, useState } from "react";
import { Code2, Menu } from "lucide-react";

import styles from "@/components/navigation/navigation.module.css";

import { CategoryNavigation } from "@/components/navigation/category-navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation"
        >
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent
        className={styles.drawerSurface}
        onCloseAutoFocus={(event) => {
          // The trigger is hidden after switching to the desktop layout.
          if (window.matchMedia("(min-width: 1024px)").matches) {
            event.preventDefault();
            document.getElementById("app-home-link")?.focus();
          }
        }}
      >
        <SheetHeader className={styles.drawerHeader}>
          <SheetTitle className={styles.drawerTitle}><span className={styles.brandMark} aria-hidden="true"><Code2 className="size-4" /></span><span>Explore Explain Dev</span></SheetTitle>
          <SheetDescription>Find your next area of development.</SheetDescription>
        </SheetHeader>
        <div className={styles.drawerNav}>
          <CategoryNavigation onNavigate={() => setOpen(false)} />
        </div>
        <p className={styles.drawerFooter}>
          Complex development concepts, explained simply.
        </p>
      </SheetContent>
    </Sheet>
  );
}
