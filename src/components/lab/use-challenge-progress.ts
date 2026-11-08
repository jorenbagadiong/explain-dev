"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type { ProgressDefinition } from "@/lib/lab/progress";
import { ChallengeProgressSession } from "@/lib/storage/challenge-progress";

export function useChallengeProgress(definition: ProgressDefinition) {
  const [session] = useState(() => new ChallengeProgressSession(definition));
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  useEffect(() => {
    void session.connect({
      storage: () => window.localStorage,
      acquire: async (callback) => {
        if (!navigator.locks) throw new Error("Exclusive browser storage locks are unavailable.");
        await navigator.locks.request(session.key, { ifAvailable: true }, (lock) => callback(Boolean(lock)));
      },
    });
    const flush = () => { if (document.visibilityState === "hidden") session.flush(); };
    const hide = () => session.suspend();
    const show = () => { void session.retry(); };
    const storage = (event: StorageEvent) => {
      try { if (event.storageArea !== window.localStorage) return; } catch { return; }
      if (event.key === session.key || event.key === null) session.observeRemote(event.newValue);
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", hide);
    window.addEventListener("pageshow", show);
    window.addEventListener("storage", storage);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("pageshow", show);
      window.removeEventListener("storage", storage);
      session.dispose();
    };
  }, [session]);
  return { session, snapshot };
}
