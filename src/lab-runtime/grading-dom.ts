// Sandbox-only accessible DOM assertions shared by the closed challenge graders.
export class BehaviorFailure extends Error {}
export const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
export function readable(element: Element) {
  return element.getClientRects().length > 0 && !element.closest('[hidden], [aria-hidden="true"]') && getComputedStyle(element).visibility !== "hidden";
}
export function accessibleName(element: Element): string {
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) return normalize(labelledBy.split(/\s+/).map((id) => document.getElementById(id)?.textContent ?? "").join(" "));
  return normalize(element.getAttribute("aria-label") ?? (element instanceof HTMLInputElement ? element.value : element.textContent ?? ""));
}
export function button(container: HTMLElement, label: string): HTMLElement {
  const matches = [...container.querySelectorAll<HTMLElement>('button, input[type="button"], input[type="submit"], input[type="reset"], [role="button"]')]
    .filter((el) => readable(el) && accessibleName(el).toLowerCase() === label.toLowerCase());
  if (matches.length !== 1) throw new BehaviorFailure(`Provide one visible button with the accessible name ${label}. Found ${matches.length}.`);
  const result = matches[0];
  if (result.matches(":disabled") || result.getAttribute("aria-disabled") === "true") throw new BehaviorFailure(`${label} is disabled. Enable it so the counter can be tested.`);
  return result;
}
