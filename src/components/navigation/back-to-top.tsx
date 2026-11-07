"use client";

import { useState, useSyncExternalStore } from "react";
import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";

export const BACK_TO_TOP_THRESHOLD = 400;

// The shell has no overflow container on its page content, so the window scrolls.
function subscribe(onScroll: () => void) {
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}

// A boolean snapshot re-renders only when the threshold is crossed, not per pixel.
const isPastThreshold = () => window.scrollY > BACK_TO_TOP_THRESHOLD;
const isPastThresholdOnServer = () => false;

export function BackToTop({ focusTargetId = "main-content" }: { focusTargetId?: string }) {
  const pastThreshold = useSyncExternalStore(subscribe, isPastThreshold, isPastThresholdOnServer);
  // Stays mounted while focused, so scrolling up with the keyboard cannot drop focus.
  const [hasFocus, setHasFocus] = useState(false);

  if (!pastThreshold && !hasFocus) return null;

  function handleClick() {
    // Activation hides this button, so hand focus to the top of the page first.
    document.getElementById(focusTargetId)?.focus({ preventScroll: true });
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Back to top"
      onClick={handleClick}
      onFocus={() => setHasFocus(true)}
      onBlur={() => setHasFocus(false)}
      // z-20 sits below the header (z-30) and Sheet (z-40/50). From sm up, the
      // larger offset clears the footer's right-aligned project link.
      className="fixed right-[calc(1rem+env(safe-area-inset-right))] bottom-[calc(1rem+env(safe-area-inset-bottom))] z-20 rounded-full shadow-md sm:bottom-[calc(6rem+env(safe-area-inset-bottom))]"
    >
      <ArrowUp aria-hidden="true" />
    </Button>
  );
}
