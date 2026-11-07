import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UserPreferences } from "@/types/preferences";
import {
  clearPreferences,
  DEFAULT_PREFERENCES,
  getPreferences,
  PREFERENCES_STORAGE_KEY,
  savePreferences,
} from "./preferences";

function createStorage() {
  const data = new Map<string, string>();
  return {
    get length() { return data.size; },
    key: vi.fn((index: number) => [...data.keys()][index] ?? null),
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { data.set(key, value); }),
    removeItem: vi.fn((key: string) => { data.delete(key); }),
    clear: vi.fn(() => { data.clear(); }),
  } satisfies Storage;
}

function preferences(): UserPreferences {
  return { version: 1, bookmarkedTopicIds: ["react-use-state"], readTopicIds: ["react-use-ref"] };
}

const invalidValues: [string, unknown][] = [
  ["null", null],
  ["an array", []],
  ["a string", "preferences"],
  ["a number", 1],
  ["a boolean", true],
  ["an empty object", {}],
  ["missing version", { bookmarkedTopicIds: [], readTopicIds: [] }],
  ["missing bookmarks", { version: 1, readTopicIds: [] }],
  ["missing read IDs", { version: 1, bookmarkedTopicIds: [] }],
  ["unsupported version", { ...preferences(), version: 2 }],
  ["string version", { ...preferences(), version: "1" }],
  ["bookmarks not an array", { ...preferences(), bookmarkedTopicIds: "react-use-state" }],
  ["read IDs not an array", { ...preferences(), readTopicIds: {} }],
  ["null bookmarks", { ...preferences(), bookmarkedTopicIds: null }],
  ["non-string bookmark", { ...preferences(), bookmarkedTopicIds: ["valid", 42] }],
  ["non-string read ID", { ...preferences(), readTopicIds: [null] }],
  ["unexpected fields", { ...preferences(), theme: "dark" }],
];

describe("browser preferences repository", () => {
  let storage: ReturnType<typeof createStorage>;

  beforeEach(() => {
    storage = createStorage();
    vi.stubGlobal("window", { localStorage: storage });
  });

  it("returns defaults on a first visit without writing to storage", () => {
    expect(getPreferences()).toEqual(DEFAULT_PREFERENCES);
    expect(storage.getItem).toHaveBeenCalledWith("explain-dev:v1:preferences");
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it.each([
    { version: 1, bookmarkedTopicIds: [], readTopicIds: [] },
    preferences(),
  ])("reads valid preferences: %j", (value) => {
    const raw = JSON.stringify(value);
    storage.setItem(PREFERENCES_STORAGE_KEY, raw);
    storage.setItem.mockClear();

    expect(getPreferences()).toEqual(value);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it.each(["", "not JSON", "{broken", '{"version":1,}'])(
    "returns defaults for malformed JSON without overwriting it: %j",
    (raw) => {
      storage.setItem(PREFERENCES_STORAGE_KEY, raw);
      storage.setItem.mockClear();

      expect(getPreferences()).toEqual(DEFAULT_PREFERENCES);
      expect(storage.getItem(PREFERENCES_STORAGE_KEY)).toBe(raw);
      expect(storage.setItem).not.toHaveBeenCalled();
      expect(storage.removeItem).not.toHaveBeenCalled();
    },
  );

  it.each(invalidValues)("rejects stored data with %s without changing it", (_label, value) => {
    const raw = JSON.stringify(value);
    storage.setItem(PREFERENCES_STORAGE_KEY, raw);
    storage.setItem.mockClear();

    expect(getPreferences()).toEqual(DEFAULT_PREFERENCES);
    expect(storage.getItem(PREFERENCES_STORAGE_KEY)).toBe(raw);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it("handles a throwing localStorage property getter in every operation", () => {
    const blockedWindow = Object.defineProperty({}, "localStorage", {
      get() { throw new DOMException("Storage is blocked", "SecurityError"); },
    });
    vi.stubGlobal("window", blockedWindow);

    expect(getPreferences()).toEqual(DEFAULT_PREFERENCES);
    expect(savePreferences(preferences())).toBe(false);
    expect(clearPreferences()).toBe(false);
  });

  it("handles a browser without a localStorage implementation", () => {
    vi.stubGlobal("window", {});

    expect(getPreferences()).toEqual(DEFAULT_PREFERENCES);
    expect(savePreferences(preferences())).toBe(false);
    expect(clearPreferences()).toBe(false);
  });

  it("handles getItem failures without trying to repair storage", () => {
    storage.getItem.mockImplementation(() => { throw new Error("Read denied"); });

    expect(getPreferences()).toEqual(DEFAULT_PREFERENCES);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it("returns false on quota failure and leaves existing data intact", () => {
    const original = JSON.stringify(preferences());
    storage.setItem(PREFERENCES_STORAGE_KEY, original);
    storage.setItem.mockImplementation(() => {
      throw new DOMException("Quota exhausted", "QuotaExceededError");
    });

    expect(savePreferences({ version: 1, bookmarkedTopicIds: [], readTopicIds: [] })).toBe(false);
    expect(storage.getItem(PREFERENCES_STORAGE_KEY)).toBe(original);
  });

  it("saves validated JSON under the single preferences key", () => {
    const value = preferences();
    expect(savePreferences(value)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledExactlyOnceWith(
      "explain-dev:v1:preferences", JSON.stringify(value),
    );
    expect(getPreferences()).toEqual(value);

    value.bookmarkedTopicIds.push("another-topic");
    expect(getPreferences().bookmarkedTopicIds).toEqual(["react-use-state"]);
  });

  it.each(invalidValues)("refuses to save runtime-invalid data with %s", (_label, value) => {
    expect(savePreferences(value as UserPreferences)).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("rejects inherited schema fields instead of saving arbitrary own fields", () => {
    const inherited = Object.assign(Object.create(preferences()), { a: 1, b: 2, c: 3 });
    expect(savePreferences(inherited)).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("refuses sparse ID arrays instead of saving null entries", () => {
    const sparseIds = new Array<string>(1);
    expect(savePreferences({ ...preferences(), readTopicIds: sparseIds })).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("handles serialization failure without writing", () => {
    const stringify = vi.spyOn(JSON, "stringify").mockImplementation(() => {
      throw new Error("Serialization failed");
    });
    expect(savePreferences(preferences())).toBe(false);
    stringify.mockRestore();
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("clears only preferences, preserving theme and other application data", () => {
    storage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences()));
    storage.setItem("theme", "light");
    storage.setItem("another-app:key", "keep");
    storage.setItem("explain-dev:v2:preferences", "future-data");

    expect(clearPreferences()).toBe(true);
    expect(storage.removeItem).toHaveBeenCalledExactlyOnceWith(PREFERENCES_STORAGE_KEY);
    expect(storage.getItem(PREFERENCES_STORAGE_KEY)).toBeNull();
    expect(storage.getItem("theme")).toBe("light");
    expect(storage.getItem("another-app:key")).toBe("keep");
    expect(storage.getItem("explain-dev:v2:preferences")).toBe("future-data");
    expect(storage.clear).not.toHaveBeenCalled();
  });

  it("treats clearing an already-missing key as success", () => {
    expect(clearPreferences()).toBe(true);
    expect(getPreferences()).toEqual(DEFAULT_PREFERENCES);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it("returns false when removeItem fails", () => {
    storage.removeItem.mockImplementation(() => { throw new Error("Remove denied"); });
    expect(clearPreferences()).toBe(false);
    expect(storage.clear).not.toHaveBeenCalled();
  });

  it("does not read storage during module initialization", async () => {
    const getter = vi.fn(() => { throw new Error("Unexpected storage access"); });
    vi.stubGlobal("window", Object.defineProperty({}, "localStorage", { get: getter }));
    vi.resetModules();

    await import("./preferences");
    expect(getter).not.toHaveBeenCalled();
  });

  it("returns independent default objects and arrays across reads", () => {
    const first = getPreferences();
    const second = getPreferences();
    first.bookmarkedTopicIds.push("changed");
    first.readTopicIds.push("changed");

    expect(second).toEqual(DEFAULT_PREFERENCES);
    expect(getPreferences()).toEqual(DEFAULT_PREFERENCES);
    expect(first).not.toBe(second);
    expect(first.bookmarkedTopicIds).not.toBe(second.bookmarkedTopicIds);
    expect(first.readTopicIds).not.toBe(second.readTopicIds);
  });

  it("keeps the exported default object and its nested arrays frozen", () => {
    expect(Object.isFrozen(DEFAULT_PREFERENCES)).toBe(true);
    expect(Object.isFrozen(DEFAULT_PREFERENCES.bookmarkedTopicIds)).toBe(true);
    expect(Object.isFrozen(DEFAULT_PREFERENCES.readTopicIds)).toBe(true);
    expect(Reflect.set(DEFAULT_PREFERENCES, "version", 2)).toBe(false);
    expect(Reflect.set(DEFAULT_PREFERENCES.bookmarkedTopicIds, "0", "changed")).toBe(false);
    expect(DEFAULT_PREFERENCES).toEqual({ version: 1, bookmarkedTopicIds: [], readTopicIds: [] });
  });

  it("returns independent snapshots for repeated reads of saved data", () => {
    savePreferences(preferences());
    const first = getPreferences();
    first.bookmarkedTopicIds.length = 0;
    first.readTopicIds.push("changed");
    expect(getPreferences()).toEqual(preferences());
  });
});

describe("server-side safety", () => {
  beforeEach(() => { vi.stubGlobal("window", undefined); });

  it("can be imported without a browser", async () => {
    vi.resetModules();
    const repository = await import("./preferences");
    expect(repository.getPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("returns safe defaults and reports writes/clears as unavailable", () => {
    expect(getPreferences()).toEqual(DEFAULT_PREFERENCES);
    expect(savePreferences(preferences())).toBe(false);
    expect(clearPreferences()).toBe(false);
  });

  it("does not use a global localStorage when there is no window", () => {
    const storage = createStorage();
    vi.stubGlobal("localStorage", storage);
    expect(getPreferences()).toEqual(DEFAULT_PREFERENCES);
    expect(savePreferences(preferences())).toBe(false);
    expect(clearPreferences()).toBe(false);
    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });
});
