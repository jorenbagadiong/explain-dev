"use client";

import { useSyncExternalStore } from "react";
import { challengeStatus, decodeProgress, progressKey, reconcileProgress, type ProgressDefinition } from "@/lib/lab/progress";
const names = { "not-started": "Not Started", "in-progress": "In Progress", completed: "Completed" };
function subscribe(changed: () => void) {
  window.addEventListener('storage', changed); window.addEventListener('pageshow', changed);
  return () => { window.removeEventListener('storage', changed); window.removeEventListener('pageshow', changed); };
}
// A read-only summary: never takes an editor lease or writes a draft on the Practice index.
export function ChallengeProgressStatus({ definition }: { definition: ProgressDefinition }) {
  const status = useSyncExternalStore(subscribe, () => {
    try {
      const decoded = decodeProgress(window.localStorage.getItem(progressKey(definition.challengeId)), definition);
      if (decoded.kind === 'unsupported' || decoded.kind === 'invalid') return 'Saved progress unavailable';
      if (decoded.kind !== 'valid' || 'cleared' in decoded.data) return 'Not Started';
      return names[challengeStatus(reconcileProgress(decoded.data, definition))];
    } catch { return 'Local progress unavailable'; }
  }, () => 'Loading local progress…');
  return <p className="mt-3 text-xs text-muted-foreground" data-index-progress={definition.challengeId}>Progress: {status}</p>;
}
