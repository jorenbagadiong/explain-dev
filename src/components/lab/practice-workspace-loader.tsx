"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { PracticeWorkspaceProps } from "./practice-workspace";
import styles from "./lab.module.css";

function WorkspaceSkeleton() {
  return (
    <div className={styles.skeleton} data-lab-loading="">
      <p className="sr-only" role="status">Loading the code editor and preview…</p>
      <div className={styles.skeletonPanel} aria-hidden="true" />
      <div className={styles.skeletonPanel} aria-hidden="true" />
    </div>
  );
}

// The editor and every sandbox-related module load only here, on Practice routes, and only in the browser.
const PracticeWorkspace = dynamic(() => import("./practice-workspace").then((module) => module.PracticeWorkspace), {
  ssr: false,
  loading: WorkspaceSkeleton,
});

class WorkspaceBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="mt-8 rounded-xl border p-6">
        <p className="font-medium">The Coding Lab couldn&apos;t load.</p>
        <p className="mt-2 text-sm text-muted-foreground">Check your connection and reload the page. The rest of Explain Dev is unaffected.</p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    );
  }
}

export function PracticeWorkspaceLoader(props: Omit<PracticeWorkspaceProps, "onMetric">) {
  return (
    <WorkspaceBoundary>
      <PracticeWorkspace {...props} onMetric={reportMetric} />
    </WorkspaceBoundary>
  );
}

// Development and verification aid: timings are exposed as a performance mark only, never sent anywhere.
function reportMetric(name: string, ms: number) {
  try {
    performance.mark(`explain-dev-lab:${name}`, { detail: { ms } });
  } catch {
    // Marks are optional.
  }
}
