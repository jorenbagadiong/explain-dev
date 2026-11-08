import { LAB_PREVIEW_PATH } from "./protocol";

// Where the sandboxed preview document is loaded from.
// - "dedicated": NEXT_PUBLIC_LAB_PREVIEW_ORIGIN names a separate preview host (a different site). Recommended.
// - "same-origin": fallback when the variable is unset; the app serves /lab-runtime/ itself (ED-018 behaviour).
// next.config.ts validates the variable at build time; Next.js inlines it into the client bundle.

export type PreviewTarget =
  | { mode: "dedicated"; origin: string; url: string }
  | { mode: "same-origin"; origin: null; url: string };

export function resolvePreviewTarget(origin: string | undefined): PreviewTarget {
  const value = origin?.trim();
  if (!value) return { mode: "same-origin", origin: null, url: LAB_PREVIEW_PATH };
  if (!/^https?:\/\/[^/?#\s]+$/.test(value)) throw new Error(`NEXT_PUBLIC_LAB_PREVIEW_ORIGIN must be an exact origin: ${JSON.stringify(value)}`);
  return { mode: "dedicated", origin: value, url: `${value}/preview.html` };
}

export const LAB_PREVIEW_TARGET = resolvePreviewTarget(process.env.NEXT_PUBLIC_LAB_PREVIEW_ORIGIN);
