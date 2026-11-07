"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

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
        onCloseAutoFocus={(event) => {
          // The trigger is hidden after switching to the desktop layout.
          if (window.matchMedia("(min-width: 1024px)").matches) {
            event.preventDefault();
            document.getElementById("app-home-link")?.focus();
          }
        }}
      >
        <SheetHeader>
          <SheetTitle>Explore Explain Dev</SheetTitle>
          <SheetDescription>Find your next area of development.</SheetDescription>
        </SheetHeader>
        <div className="mt-8">
          <CategoryNavigation onNavigate={() => setOpen(false)} />
        </div>
        <p className="mt-auto pt-10 text-xs leading-relaxed text-muted-foreground">
          Complex development concepts, explained simply.
        </p>
      </SheetContent>
    </Sheet>
  );
}
