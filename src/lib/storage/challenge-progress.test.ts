import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStateCounterChallenge as challenge } from "@/content/labs/react/use-state-counter";
import { initialProgress, MAX_DRAFT_LENGTH, progressKey, type ProgressDefinition } from "@/lib/lab/progress";
import { ChallengeProgressSession, DRAFT_SAVE_DELAY_MS, type ProgressEnvironment } from "./challenge-progress";
const definition: ProgressDefinition = { challengeId: challenge.id, gradingRevision: challenge.gradingRevision, starterRevision: challenge.starterRevision, starterCode: challenge.starterFiles[0].code, totalTests: 7, hintCount: 3 };
const now = new Date("2026-11-08T10:00:00.000Z");
function harness() {
  const values = new Map<string, string>(), leases = new Set<string>(), sessions: ChallengeProgressSession[] = [];
  const storage = { getItem: vi.fn((key: string) => values.get(key) ?? null), setItem: vi.fn((key: string, value: string) => { values.set(key, value); }) };
  const env = (id: string): ProgressEnvironment => ({ storage: () => storage, now: () => now, acquire: async (callback) => {
    if (leases.has(id)) { await callback(false); return; }
    leases.add(id); try { await callback(true); } finally { leases.delete(id); }
  } });
  const create = (d = definition) => { const s = new ChallengeProgressSession(d); sessions.push(s); return s; };
  return { values, storage, env, create, stop: () => sessions.forEach((s) => s.dispose()) };
}
let h: ReturnType<typeof harness>;
beforeEach(() => { vi.useFakeTimers(); h = harness(); });
afterEach(() => { h.stop(); vi.useRealTimers(); });
const start = async () => { const s = h.create(); await s.connect(h.env(s.key)); return s; };
const tick = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

describe("challenge draft persistence coordinator", () => {
  it("is SSR-safe and reads without writing on a visit", async () => {
    const s = h.create(); expect(s.getSnapshot().ready).toBe(false); expect(h.storage.getItem).not.toHaveBeenCalled();
    await s.connect(h.env(s.key)); expect(s.getSnapshot().data).toEqual(initialProgress(definition)); expect(h.storage.setItem).not.toHaveBeenCalled();
  });
  it("debounces rapid edits and stores only the latest source", async () => {
    const s = await start(); s.edit("first"); await vi.advanceTimersByTimeAsync(300); s.edit("latest");
    await vi.advanceTimersByTimeAsync(DRAFT_SAVE_DELAY_MS - 1); expect(h.storage.setItem).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1); expect(h.storage.setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(h.values.get(s.key)!).draftCode).toBe("latest"); expect(s.getSnapshot().saveState).toBe("saved");
  });
  it("marks a new editor revision pending immediately after a successful save", async () => {
    const s = await start(); s.edit("persisted"); s.flush();
    s.edit("pending");
    expect(s.getSnapshot()).toMatchObject({ dirty: true, saveState: "saving", error: null });
    expect(JSON.parse(h.values.get(s.key)!).draftCode).toBe("persisted");
    await vi.advanceTimersByTimeAsync(DRAFT_SAVE_DELAY_MS);
    expect(s.getSnapshot()).toMatchObject({ dirty: false, saveState: "saved" });
    expect(JSON.parse(h.values.get(s.key)!).draftCode).toBe("pending");
  });
  it("keeps a failed new revision unsaved and restores only the last successful draft", async () => {
    const s = await start(); s.edit("persisted"); s.flush();
    h.storage.setItem.mockImplementation(() => { throw new Error("storage disabled"); });
    s.edit("unsaved latest"); await vi.advanceTimersByTimeAsync(DRAFT_SAVE_DELAY_MS);
    expect(s.getSnapshot()).toMatchObject({ dirty: true, saveState: "error", error: "unavailable" });
    expect(s.getSnapshot().data.draftCode).toBe("unsaved latest"); s.dispose(); await tick();
    h.storage.setItem.mockImplementation((key, value) => { h.values.set(key, value); });
    const next = await start(); expect(next.getSnapshot().data.draftCode).toBe("persisted");
  });
  it("flushes the closing owner's pending revision before a follower may save", async () => {
    const owner = await start(); owner.edit("persisted"); owner.flush();
    const follower = await start(); follower.edit("follower pending");
    owner.edit("owner final keystroke"); owner.dispose(); await tick();
    expect(await follower.retry()).toBe(false);
    expect(follower.getSnapshot()).toMatchObject({ owner: true, dirty: true, saveState: "error", error: "conflict" });
    expect(follower.getSnapshot().data.draftCode).toBe("follower pending");
    expect(JSON.parse(h.values.get(owner.key)!).draftCode).toBe("owner final keystroke");
  });
  it("flushes synchronously on navigation before the debounce, then restores an empty draft", async () => {
    const s = await start(); s.edit(""); s.dispose();
    expect(JSON.parse(h.values.get(s.key)!).draftCode).toBe(""); await tick();
    const next = await start(); expect(next.getSnapshot().data.draftCode).toBe(""); expect(next.getSnapshot().notice).toBe("restored");
  });
  it("flushes on hide and reacquires on return without duplicating leases", async () => {
    const s = await start(); s.edit("before hiding"); s.suspend(); await tick();
    expect(s.getSnapshot().owner).toBe(false); expect(JSON.parse(h.values.get(s.key)!).draftCode).toBe("before hiding");
    await s.retry(); expect(s.getSnapshot().owner).toBe(true);
  });
  it("survives a StrictMode setup/cleanup/setup without a phantom owner", async () => {
    const s = h.create(); const first = s.connect(h.env(s.key)); s.dispose(); const second = s.connect(h.env(s.key)); await Promise.all([first, second]);
    expect(s.getSnapshot().owner).toBe(true); s.edit("works"); expect(s.flush()).toBe(true);
  });
  it("never mixes two challenge keys", async () => {
    const one = await start(), otherDefinition = { ...definition, challengeId: "another-challenge" };
    const two = h.create(otherDefinition); await two.connect(h.env(two.key)); one.edit("one"); two.edit("two"); one.flush(); two.flush();
    expect(JSON.parse(h.values.get(progressKey(challenge.id))!).draftCode).toBe("one"); expect(JSON.parse(h.values.get(two.key)!).draftCode).toBe("two");
  });
  it("keeps source in memory on quota failure and retries without losing it", async () => {
    const s = await start(); h.storage.setItem.mockImplementationOnce(() => { throw new DOMException("full", "QuotaExceededError"); });
    s.edit("keep me"); expect(s.flush()).toBe(false); expect(s.getSnapshot().error).toBe("quota"); expect(s.getSnapshot().data.draftCode).toBe("keep me");
    expect(await s.retry()).toBe(true); expect(JSON.parse(h.values.get(s.key)!).draftCode).toBe("keep me");
  });
  it("handles disabled-storage getters, with no false success", async () => {
    const s = h.create(); const env = h.env(s.key); env.storage = () => { throw new DOMException("blocked", "SecurityError"); };
    await s.connect(env); expect(s.getSnapshot().ready).toBe(true); expect(s.getSnapshot().error).toBe("unavailable");
    s.edit("unsaved"); expect(s.flush()).toBe(false); expect(s.getSnapshot().dirty).toBe(true);
    env.storage = () => h.storage; expect(await s.retry()).toBe(true);
  });
  it("does not fall back to unlocked writes when Web Locks are unavailable", async () => {
    const s = h.create(); await s.connect({ ...h.env(s.key), acquire: async () => { throw new Error("unsupported"); } });
    s.edit("unsaved"); expect(s.getSnapshot().error).toBe("unavailable"); expect(s.flush()).toBe(false); expect(h.storage.setItem).not.toHaveBeenCalled();
  });
  it("bounds draft writes and keeps the previous saved draft until reduced", async () => {
    const s = await start(); s.edit("safe"); s.flush(); const old = h.values.get(s.key);
    s.edit("x".repeat(MAX_DRAFT_LENGTH + 1)); expect(s.getSnapshot().error).toBe("too-large"); expect(s.flush()).toBe(false); expect(h.values.get(s.key)).toBe(old);
    s.edit("smaller"); expect(s.flush()).toBe(true); expect(JSON.parse(h.values.get(s.key)!).draftCode).toBe("smaller");
  });
  it("does not write during corrupt-data recovery until meaningful activity", async () => {
    h.values.set(progressKey(challenge.id), "{broken"); const s = await start();
    expect(s.getSnapshot().notice).toBe("invalid"); expect(h.values.get(s.key)).toBe("{broken"); s.edit("recovered"); expect(s.flush()).toBe(true);
  });
  it("will not overwrite an unknown future schema even after edits or forced replacement", async () => {
    const raw = JSON.stringify({ version: 2, challengeId: challenge.id, draftCode: "future data" }); h.values.set(progressKey(challenge.id), raw);
    const s = await start(); s.edit("old app"); expect(s.flush()).toBe(false); expect(s.replaceSaved()).toBe(false); expect(h.values.get(s.key)).toBe(raw);
    expect(s.clear()).toBe(true); expect(JSON.parse(h.values.get(s.key)!)).toMatchObject({ cleared: true });
  });
  it("preserves a current editor during cross-tab conflicts and refuses stale writes", async () => {
    const owner = await start(); owner.edit("original"); owner.flush();
    const follower = await start(); expect(follower.getSnapshot().owner).toBe(false); follower.edit("follower edit"); expect(follower.flush()).toBe(false);
    owner.edit("newer owner edit"); owner.flush(); const newer = h.values.get(owner.key)!; follower.observeRemote(newer);
    owner.dispose(); await tick(); expect(await follower.retry()).toBe(false); expect(follower.getSnapshot().error).toBe("conflict");
    expect(h.values.get(owner.key)).toBe(newer); expect(follower.getSnapshot().data.draftCode).toBe("follower edit");
    expect(follower.replaceSaved()).toBe(true); expect(JSON.parse(h.values.get(owner.key)!).draftCode).toBe("follower edit");
  });
  it("can explicitly load the newest draft without saving the old buffer", async () => {
    const owner = await start(); owner.edit("newest"); owner.flush();
    const follower = await start(); follower.edit("temporary"); expect(follower.loadSaved()).toBe(true);
    expect(follower.getSnapshot().data.draftCode).toBe("newest"); expect(follower.getSnapshot().dirty).toBe(false);
  });
  it("keeps a clear marker so an old tab cannot silently resurrect cleared source", async () => {
    const owner = await start(); owner.edit("private old draft"); owner.hint(); owner.solution(); owner.flush();
    const follower = await start(); follower.edit("stale");
    expect(owner.clear()).toBe(true); const marker = h.values.get(owner.key)!;
    expect(marker).not.toContain("draftCode"); expect(marker).not.toContain("private old draft"); expect(owner.getSnapshot().data).toMatchObject({ started: false, revealedHintCount: 0, solutionRevealed: false });
    expect(owner.getSnapshot().generation).toBe(1); owner.dispose(); await tick();
    expect(await follower.retry()).toBe(false); expect(h.values.get(owner.key)).toBe(marker);
  });
  it("Reset Code preserves history, Clear Progress drops it, and neither exposes capabilities", async () => {
    const s = await start(); s.edit("learner"); s.hint(); s.solution(); s.reset();
    const data = JSON.parse(h.values.get(s.key)!); expect(data.draftCode).toBe(definition.starterCode); expect(data.revealedHintCount).toBe(1); expect(data.solutionRevealed).toBe(true);
    for (const field of ["session", "runId", "results", "port"]) expect(data).not.toHaveProperty(field);
    s.clear(); expect(s.getSnapshot().data).toMatchObject({ bestPassedCount: 0, completion: null, verification: null, revealedHintCount: 0, solutionRevealed: false });
  });
  it("discards delayed solution reveals after Clear, reload, or disposal", async () => {
    const s = await start(), generation = s.getSnapshot().generation;
    expect(s.clear()).toBe(true); const marker = h.values.get(s.key);
    expect(s.solution(generation)).toBe(false); expect(h.values.get(s.key)).toBe(marker);
    expect(s.getSnapshot().data.solutionRevealed).toBe(false); expect(s.getSnapshot().data.started).toBe(false);
    s.dispose(); expect(s.solution(s.getSnapshot().generation)).toBe(false);
  });
  it("never writes an invalid overflowed record or clear marker", async () => {
    const raw = JSON.stringify({ ...initialProgress(definition), savedAt: now.toISOString(), writeRevision: Number.MAX_SAFE_INTEGER });
    h.values.set(progressKey(definition.challengeId), raw); const s = await start();
    expect(s.clear()).toBe(false); s.edit("new text"); expect(s.flush()).toBe(false); expect(h.values.get(s.key)).toBe(raw);
  });
  it("keeps unsaved text when both storage and leases recover after a denial", async () => {
    const s = h.create(); let blocked = true; const base = h.env(s.key);
    const environment = { ...base, storage: () => { if (blocked) throw new Error("storage blocked"); return h.storage; }, acquire: async (callback: (owner: boolean) => Promise<void>) => { if (blocked) throw new Error("locks blocked"); await base.acquire(callback); } };
    await s.connect(environment); s.edit("keep this recovery draft"); blocked = false;
    expect(await s.retry()).toBe(true); expect(JSON.parse(h.values.get(s.key)!).draftCode).toBe("keep this recovery draft");
  });
  it("failed explicit reloads of unknown/corrupt formats keep the current buffer", async () => {
    const s = await start(); s.edit("local unsaved text");
    h.values.set(s.key, JSON.stringify({ version: 2 })); expect(s.loadSaved()).toBe(false);
    expect(s.getSnapshot().data.draftCode).toBe("local unsaved text"); expect(await s.retry()).toBe(false);
    expect(JSON.parse(h.values.get(s.key)!).version).toBe(2);
    h.values.set(s.key, "{broken"); expect(s.loadSaved()).toBe(false); expect(s.getSnapshot().data.draftCode).toBe("local unsaved text");
    expect(await s.retry()).toBe(true); expect(JSON.parse(h.values.get(s.key)!).draftCode).toBe("local unsaved text");
  });
  it("never reports successful clearing when storage fails", async () => {
    const s = await start(); s.edit("important"); s.flush(); const before = h.values.get(s.key);
    h.storage.setItem.mockImplementationOnce(() => { throw new Error("disabled"); });
    expect(s.clear()).toBe(false); expect(h.values.get(s.key)).toBe(before); expect(s.getSnapshot().data.draftCode).toBe("important");
  });
});
