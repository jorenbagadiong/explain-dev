"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import styles from "./navigation.module.css";

// Keep overview links separate from disclosure controls in both navigation surfaces.
export function NavigationBranch({ label, initiallyOpen, overview, children }: {
  label: string;
  initiallyOpen: boolean;
  overview: ReactNode;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(initiallyOpen);
  const panelId = useId();

  return (
    <>
      <div className={styles.branchRow}>
        {overview}
        <button type="button" id={`${panelId}-trigger`} className={styles.branchToggle} aria-label={label}
          aria-expanded={expanded} aria-controls={panelId}
          onClick={() => setExpanded((value) => !value)}>
          <ChevronDown aria-hidden="true" className={styles.chevron} />
        </button>
      </div>
      <div id={panelId} hidden={!expanded} aria-labelledby={`${panelId}-trigger`}>{children}</div>
    </>
  );
}
