import type { UserPreferences } from "@/types/preferences";

export const PREFERENCES_STORAGE_KEY = "explain-dev:v1:preferences";

// Freeze both the object and its arrays; reads always return a fresh copy.
export const DEFAULT_PREFERENCES = Object.freeze({
  version: 1 as const,
  bookmarkedTopicIds: Object.freeze<string[]>([]),
  readTopicIds: Object.freeze<string[]>([]),
});

function defaultPreferences(): UserPreferences {
  return {
    version: DEFAULT_PREFERENCES.version,
    bookmarkedTopicIds: [...DEFAULT_PREFERENCES.bookmarkedTopicIds],
    readTopicIds: [...DEFAULT_PREFERENCES.readTopicIds],
  };
}

function isStringArray(value: unknown): value is string[] {
  // Array.from also exposes sparse slots as undefined during save validation.
  return Array.isArray(value) && Array.from(value).every((id) => typeof id === "string");
}

function isUserPreferences(value: unknown): value is UserPreferences {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const keys = Object.keys(value);
  return (
    keys.length === 3 &&
    keys.includes("version") &&
    keys.includes("bookmarkedTopicIds") &&
    keys.includes("readTopicIds") &&
    "version" in value && value.version === 1 &&
    "bookmarkedTopicIds" in value && isStringArray(value.bookmarkedTopicIds) &&
    "readTopicIds" in value && isStringArray(value.readTopicIds)
  );
}

export function getPreferences(): UserPreferences {
  if (typeof window === "undefined") return defaultPreferences();

  try {
    const stored = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (stored !== null) {
      const parsed: unknown = JSON.parse(stored);
      if (isUserPreferences(parsed)) return parsed;
    }
  } catch {
    // Storage may be blocked, or the saved JSON may be malformed.
  }

  // Reading missing or invalid data never writes or deletes anything.
  return defaultPreferences();
}

export function savePreferences(preferences: UserPreferences): boolean {
  if (typeof window === "undefined") return false;

  try {
    if (!isUserPreferences(preferences)) return false;

    // Save only the validated schema, without retaining caller-owned arrays.
    const snapshot: UserPreferences = {
      version: 1,
      bookmarkedTopicIds: [...preferences.bookmarkedTopicIds],
      readTopicIds: [...preferences.readTopicIds],
    };
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch {
    // Includes blocked storage, serialization failures, and quota exhaustion.
    return false;
  }
}

export function clearPreferences(): boolean {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.removeItem(PREFERENCES_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
