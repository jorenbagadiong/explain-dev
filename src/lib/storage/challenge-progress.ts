import { attemptGrading, decodeProgress, editProgress, initialProgress, isStoredProgress, MAX_DRAFT_LENGTH, progressKey, reconcileProgress, recordGrading, resetCode, revealHint, revealSolution, type ChallengeProgress, type ProgressDefinition } from "@/lib/lab/progress";
import type { GradingResult } from "@/lib/lab/grading";

export const DRAFT_SAVE_DELAY_MS = 500;
export type SaveError = "locked" | "conflict" | "unavailable" | "quota" | "too-large" | "unsupported" | "invalid";
export interface ProgressSnapshot {
  ready: boolean;
  data: ChallengeProgress;
  dirty: boolean;
  owner: boolean;
  saveState: "idle" | "saving" | "saved" | "error";
  error: SaveError | null;
  notice: "restored" | "invalid" | "revision-changed" | null;
  generation: number;
}
export interface ProgressEnvironment {
  storage: () => Pick<Storage, "getItem" | "setItem">;
  /** Callback holds the exclusive lease until its returned Promise resolves. */
  acquire: (callback: (owned: boolean) => Promise<void>) => Promise<void>;
  now?: () => Date;
}

// One coordinator per challenge page. No storage access during construction/SSR.
// Web Locks provide exclusion; a raw-head comparison also refuses unexpected external writes.
export class ChallengeProgressSession {
  readonly key: string;
  private snapshot: ProgressSnapshot;
  private listeners = new Set<() => void>();
  private environment: ProgressEnvironment | null = null;
  private expectedRaw: string | null | undefined;
  private loaded = false;
  private active = false;
  private conflict = false;
  private unsupported = false;
  private epoch = 0;
  private leaseUnavailable = false;
  private release: (() => void) | null = null;
  private acquiring: Promise<void> | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(readonly definition: ProgressDefinition) {
    this.key = progressKey(definition.challengeId);
    this.snapshot = { ready: false, data: initialProgress(definition), dirty: false, owner: false, saveState: "idle", error: null, notice: null, generation: 0 };
  }
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private publish(patch: Partial<ProgressSnapshot>) { this.snapshot = { ...this.snapshot, ...patch }; this.listeners.forEach((listener) => listener()); }
  private now() { return (this.environment?.now?.() ?? new Date()).toISOString(); }
  private fail(error: SaveError) { this.publish({ ready: true, saveState: "error", error }); return false; }
  private stopTimer() { clearTimeout(this.timer); this.timer = undefined; }
  private read() { return this.environment!.storage().getItem(this.key); }
  private adopt(raw: string | null) {
    const decoded = decodeProgress(raw, this.definition);
    this.expectedRaw = raw;
    this.loaded = true;
    this.conflict = false;
    this.unsupported = decoded.kind === "unsupported";
    let data = initialProgress(this.definition);
    let notice: ProgressSnapshot["notice"] = decoded.kind === "invalid" ? "invalid" : null;
    if (decoded.kind === "valid" && !("cleared" in decoded.data)) {
      data = reconcileProgress(decoded.data, this.definition);
      notice = decoded.data.gradingRevision === this.definition.gradingRevision ? "restored" : "revision-changed";
    } else if (decoded.kind === "valid") data.writeRevision = decoded.data.writeRevision;
    this.publish({ data, dirty: false, notice, error: null, saveState: data.savedAt ? "saved" : "idle" });
  }
  connect(environment: ProgressEnvironment): Promise<void> {
    this.environment = environment;
    this.active = true;
    return this.acquire();
  }
  private acquire(): Promise<void> {
    if (this.snapshot.owner) return Promise.resolve();
    if (this.acquiring) return this.acquiring;
    const epoch = ++this.epoch;
    let finish!: () => void;
    const ready = new Promise<void>((resolve) => { finish = () => { if (epoch === this.epoch) this.acquiring = null; resolve(); }; });
    this.acquiring = ready;
    // StrictMode's initial setup/cleanup happens before this microtask, so it cannot retain a phantom lease.
    void Promise.resolve().then(async () => {
      if (epoch !== this.epoch) { finish(); return; }
      await this.environment!.acquire(async (owner) => {
        if (epoch !== this.epoch) { finish(); return; }
        this.leaseUnavailable = false;
        this.publish({ owner });
        try {
          const raw = this.read();
          if (!this.loaded) this.adopt(raw);
          else if (this.expectedRaw === undefined) {
            if (raw === null) this.expectedRaw = null;
            else if (!this.snapshot.dirty) this.adopt(raw);
            else this.observeRemote(raw);
          } else if (raw !== this.expectedRaw) this.observeRemote(raw);
          this.publish({ ready: true });
          if (this.unsupported) this.fail("unsupported");
          else if (!owner) this.fail("locked");
          else if (!this.conflict) this.publish({ error: null, saveState: this.snapshot.dirty ? "saving" : this.snapshot.data.savedAt ? "saved" : "idle" });
        } catch { this.loaded = true; this.fail("unavailable"); }
        let held: Promise<void> | undefined;
        if (owner) held = new Promise<void>((resolve) => { this.release = resolve; });
        finish();
        if (owner && this.snapshot.dirty) this.flush();
        await held;
      });
    }).catch(() => {
      if (epoch === this.epoch) {
        try { if (!this.loaded) this.adopt(this.read()); } catch { /* Reads may also be disabled. */ }
        this.loaded = true;
        this.leaseUnavailable = true;
        this.publish({ owner: false }); this.fail("unavailable");
      }
      finish();
    });
    return ready;
  }
  private change(data: ChallengeProgress, immediate = false) {
    if (!this.active || data === this.snapshot.data) return;
    this.stopTimer();
    this.publish({ data, dirty: true, saveState: "saving", error: null });
    if (data.draftCode.length > MAX_DRAFT_LENGTH) { this.fail("too-large"); return; }
    if (!this.snapshot.owner) { this.fail(this.leaseUnavailable ? "unavailable" : "locked"); return; }
    if (this.conflict) { this.fail("conflict"); return; }
    if (this.unsupported) { this.fail("unsupported"); return; }
    if (immediate) this.flush();
    else this.timer = setTimeout(() => this.flush(), DRAFT_SAVE_DELAY_MS);
  }
  edit(code: string) { this.change(editProgress(this.snapshot.data, code, this.now())); }
  reset() { this.change(resetCode(this.snapshot.data, this.definition, this.now()), true); }
  attempt() { this.change(attemptGrading(this.snapshot.data), true); }
  record(result: GradingResult, source: string) { this.change(recordGrading(this.snapshot.data, result, source, this.now()), true); }
  hint() { this.change(revealHint(this.snapshot.data, this.definition.hintCount), true); }
  solution(expectedGeneration = this.snapshot.generation): boolean {
    if (!this.active || expectedGeneration !== this.snapshot.generation) return false;
    this.change(revealSolution(this.snapshot.data), true);
    return true;
  }

  /** Synchronous, while the exclusive lease is already held: usable on pagehide and React unmount. */
  flush(): boolean {
    this.stopTimer();
    if (!this.snapshot.dirty) return true;
    if (!this.snapshot.owner) return this.fail(this.leaseUnavailable ? "unavailable" : "locked");
    if (this.unsupported) return this.fail("unsupported");
    if (this.conflict) return this.fail("conflict");
    if (this.snapshot.data.draftCode.length > MAX_DRAFT_LENGTH) return this.fail("too-large");
    try {
      const raw = this.read();
      if (this.expectedRaw === undefined && raw === null) this.expectedRaw = null;
      if (raw !== this.expectedRaw) { this.conflict = true; return this.fail("conflict"); }
      const data = { ...this.snapshot.data, savedAt: this.now(), writeRevision: this.snapshot.data.writeRevision + 1 };
      if (!isStoredProgress(data, this.definition)) return this.fail("invalid");
      const next = JSON.stringify(data);
      this.environment!.storage().setItem(this.key, next);
      this.expectedRaw = next;
      this.publish({ data, dirty: false, saveState: "saved", error: null, notice: null });
      return true;
    } catch (error) { return this.fail(error instanceof Error && error.name === "QuotaExceededError" ? "quota" : "unavailable"); }
  }
  async retry(): Promise<boolean> {
    await this.acquire();
    if (!this.snapshot.owner) return this.fail(this.leaseUnavailable ? "unavailable" : "locked");
    if (this.unsupported) return this.fail("unsupported");
    if (this.expectedRaw === undefined) {
      try { const raw = this.read(); if (raw === null) this.expectedRaw = null; else if (!this.snapshot.dirty) this.adopt(raw); else { this.conflict = true; return this.fail("conflict"); } }
      catch { return this.fail("unavailable"); }
    }
    if (!this.snapshot.dirty) { if (this.conflict) return this.fail("conflict"); this.publish({ saveState: this.snapshot.data.savedAt ? "saved" : "idle", error: null }); return true; }
    return this.flush();
  }
  observeRemote(raw: string | null) {
    if (raw === this.expectedRaw) return;
    this.stopTimer(); this.conflict = true; this.fail("conflict");
  }
  /** Explicit UI resolution; callers confirm before discarding an unsaved editor buffer. */
  loadSaved(): boolean {
    try {
      this.stopTimer();
      const raw = this.read(), decoded = decodeProgress(raw, this.definition);
      if (decoded.kind === "unsupported") {
        this.expectedRaw = raw; this.unsupported = true; this.conflict = false;
        return this.fail("unsupported");
      }
      if (decoded.kind === "invalid") {
        this.expectedRaw = raw; this.conflict = false; this.unsupported = false;
        this.publish({ dirty: true, notice: "invalid" });
        return this.fail("invalid");
      }
      this.adopt(raw); this.publish({ generation: this.snapshot.generation + 1 });
      if (!this.snapshot.owner) this.fail(this.leaseUnavailable ? "unavailable" : "locked");
      return true;
    } catch { return this.fail("unavailable"); }
  }
  /** Explicit, confirmed replacement only. Never auto-resolves a conflict. */
  replaceSaved(): boolean {
    if (!this.snapshot.owner) return this.fail(this.leaseUnavailable ? "unavailable" : "locked");
    try {
      const raw = this.read(), decoded = decodeProgress(raw, this.definition);
      if (decoded.kind === "unsupported") { this.expectedRaw = raw; this.unsupported = true; this.conflict = false; return this.fail("unsupported"); }
      this.expectedRaw = raw; this.conflict = false;
      const revision = decoded.kind === "valid" ? decoded.data.writeRevision : 0;
      this.publish({ data: { ...this.snapshot.data, writeRevision: revision }, dirty: true });
      return this.flush();
    } catch { return this.fail("unavailable"); }
  }
  /** A data-free tombstone prevents an old open tab from silently resurrecting cleared progress. */
  clear(): boolean {
    if (!this.snapshot.owner) return this.fail(this.leaseUnavailable ? "unavailable" : "locked");
    try {
      if (this.read() !== this.expectedRaw) { this.conflict = true; return this.fail("conflict"); }
      const tombstone = { version: 1, challengeId: this.definition.challengeId, cleared: true, writeRevision: this.snapshot.data.writeRevision + 1 };
      if (!isStoredProgress(tombstone, this.definition)) return this.fail("invalid");
      const raw = JSON.stringify(tombstone);
      this.environment!.storage().setItem(this.key, raw);
      this.stopTimer(); this.expectedRaw = raw; this.conflict = false; this.unsupported = false;
      this.publish({ data: { ...initialProgress(this.definition), writeRevision: tombstone.writeRevision }, dirty: false, saveState: "idle", error: null, notice: null, generation: this.snapshot.generation + 1 });
      return true;
    } catch { return this.fail("unavailable"); }
  }
  suspend() {
    this.flush(); this.epoch++; this.acquiring = null; this.release?.(); this.release = null; this.publish({ owner: false });
  }
  dispose() { this.suspend(); this.active = false; this.stopTimer(); }
}
