import { readFileSync } from "node:fs";
import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BACK_TO_TOP_THRESHOLD, BackToTop } from "./back-to-top";

// These stubs follow React's useSyncExternalStore contract closely enough to run
// the real handlers in the Node suite. They do not prove browser scrolling, which
// the separate browser pass verifies.
const react = vi.hoisted(() => ({
  slots: [] as unknown[],
  cursor: 0,
  subscribe: null as ((onChange: () => void) => () => void) | null,
  unsubscribe: null as (() => void) | null,
  serverSnapshot: null as (() => boolean) | null,
}));
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useState<T>(initial: T) {
    const index = react.cursor++;
    if (!(index in react.slots)) react.slots[index] = initial;
    return [react.slots[index], (next: T) => { react.slots[index] = next; }];
  },
  useSyncExternalStore(subscribe: (onChange: () => void) => () => void, getSnapshot: () => boolean, getServerSnapshot: () => boolean) {
    react.serverSnapshot = getServerSnapshot;
    if (react.subscribe !== subscribe) {
      react.unsubscribe?.();
      react.subscribe = subscribe;
      react.unsubscribe = subscribe(() => undefined);
    }
    return getSnapshot();
  },
}));

type ButtonProps = { onClick: () => void; onFocus: () => void; onBlur: () => void; children?: ReactNode; [key: string]: unknown };
const render = () => {
  react.cursor = 0;
  return BackToTop({}) as ReactElement<ButtonProps> | null;
};
const unmount = () => {
  react.unsubscribe?.();
  react.subscribe = null;
  react.unsubscribe = null;
  react.slots = [];
};

const focusTarget = { focus: vi.fn() };
let browser: { scrollY: number; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn>; scrollTo: ReturnType<typeof vi.fn>; matchMedia: ReturnType<typeof vi.fn> };
let getElementById: ReturnType<typeof vi.fn>;
const setReducedMotion = (matches: boolean) => browser.matchMedia.mockReturnValue({ matches });

beforeEach(() => {
  react.slots = [];
  react.cursor = 0;
  react.subscribe = null;
  react.unsubscribe = null;
  focusTarget.focus = vi.fn();
  browser = { scrollY: 0, addEventListener: vi.fn(), removeEventListener: vi.fn(), scrollTo: vi.fn(), matchMedia: vi.fn(() => ({ matches: false })) };
  getElementById = vi.fn(() => focusTarget);
  vi.stubGlobal("window", browser);
  vi.stubGlobal("document", { getElementById });
  vi.stubGlobal("localStorage", { setItem: vi.fn(), removeItem: vi.fn(), getItem: vi.fn() });
  vi.stubGlobal("sessionStorage", { setItem: vi.fn(), removeItem: vi.fn(), getItem: vi.fn() });
});

describe("Back to Top visibility", () => {
  it("is hidden initially, including in server output where window does not exist", () => {
    expect(render()).toBeNull();
    vi.stubGlobal("window", undefined);
    expect(react.serverSnapshot?.()).toBe(false);
  });

  it("stays hidden up to and including the threshold", () => {
    expect(BACK_TO_TOP_THRESHOLD).toBe(400);
    browser.scrollY = 399;
    expect(render()).toBeNull();
    browser.scrollY = 400;
    expect(render()).toBeNull();
  });

  it("appears after crossing the threshold, including a direct load already scrolled down", () => {
    browser.scrollY = 401;
    expect(render()).not.toBeNull();
  });

  it("hides again after returning near the top", () => {
    browser.scrollY = 900;
    expect(render()).not.toBeNull();
    browser.scrollY = 120;
    expect(render()).toBeNull();
  });
});

describe("Back to Top semantics", () => {
  it("renders a labelled native button with a decorative icon and a 44px target", () => {
    browser.scrollY = 900;
    const html = renderToStaticMarkup(render()!);
    expect(html).toMatch(/^<button\b/);
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-label="Back to top"');
    expect(html).toContain("size-11");
    expect(html).toMatch(/<svg\b[^>]*aria-hidden="true"/);
    expect(html).not.toMatch(/tabindex|role=/i);
  });

  it("uses a stacking level below the header and Sheet, and respects safe areas", () => {
    browser.scrollY = 900;
    const className = String(renderToStaticMarkup(render()!).match(/class="([^"]+)"/)?.[1]);
    expect(className).toContain("z-20");
    expect(className).toContain("fixed");
    expect(className).toContain("env(safe-area-inset-bottom)");
    expect(className).toContain("env(safe-area-inset-right)");
  });

  it("activates through the button's click handler, which Enter and Space trigger natively", () => {
    browser.scrollY = 900;
    const button = render()!;
    expect(button.type).not.toBe("div");
    button.props.onClick();
    expect(browser.scrollTo).toHaveBeenCalledTimes(1);
  });
});

describe("Back to Top scrolling", () => {
  it("scrolls the window to the top smoothly when reduced motion is not requested", () => {
    browser.scrollY = 900;
    setReducedMotion(false);
    render()!.props.onClick();
    expect(browser.matchMedia).toHaveBeenCalledWith("(prefers-reduced-motion: reduce)");
    expect(browser.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("scrolls instantly when reduced motion is requested", () => {
    browser.scrollY = 900;
    setReducedMotion(true);
    render()!.props.onClick();
    expect(browser.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
  });

  it("reads the preference at activation, so a changed setting applies without a listener", () => {
    browser.scrollY = 900;
    const button = render()!;
    expect(browser.matchMedia).not.toHaveBeenCalled();
    setReducedMotion(true);
    button.props.onClick();
    expect(browser.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
  });
});

describe("Back to Top listeners", () => {
  it("adds one passive scroll listener across re-renders and threshold crossings", () => {
    for (const scrollY of [0, 900, 50, 900]) {
      browser.scrollY = scrollY;
      render();
    }
    expect(browser.addEventListener).toHaveBeenCalledTimes(1);
    expect(browser.addEventListener).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true });
    expect(browser.removeEventListener).not.toHaveBeenCalled();
  });

  it("removes the same listener on unmount", () => {
    render();
    const listener = browser.addEventListener.mock.calls[0][1];
    unmount();
    expect(browser.removeEventListener).toHaveBeenCalledWith("scroll", listener);
  });

  it("starts clean after route navigation remounts it at the top of the next page", () => {
    browser.scrollY = 900;
    expect(render()).not.toBeNull();
    unmount();
    browser.scrollY = 0;
    expect(render()).toBeNull();
    expect(browser.addEventListener).toHaveBeenCalledTimes(2);
    expect(browser.removeEventListener).toHaveBeenCalledTimes(1);
  });
});

describe("Back to Top side effects", () => {
  it("never writes to storage", () => {
    browser.scrollY = 900;
    const button = render()!;
    button.props.onFocus();
    button.props.onClick();
    button.props.onBlur();
    for (const storage of [localStorage, sessionStorage]) {
      expect(storage.setItem).not.toHaveBeenCalled();
      expect(storage.removeItem).not.toHaveBeenCalled();
    }
  });

  it("does not move focus when it appears or disappears through scrolling", () => {
    for (const scrollY of [900, 0, 900]) {
      browser.scrollY = scrollY;
      render();
    }
    expect(getElementById).not.toHaveBeenCalled();
    expect(focusTarget.focus).not.toHaveBeenCalled();
  });

  it("hands focus to the main landmark on activation, without a competing scroll", () => {
    browser.scrollY = 900;
    render()!.props.onClick();
    expect(getElementById).toHaveBeenCalledWith("main-content");
    expect(focusTarget.focus).toHaveBeenCalledWith({ preventScroll: true });
  });

  it("stays mounted while focused near the top, so keyboard scrolling cannot drop focus", () => {
    browser.scrollY = 900;
    render()!.props.onFocus();
    browser.scrollY = 0;
    const focused = render();
    expect(focused).not.toBeNull();
    focused!.props.onBlur();
    expect(render()).toBeNull();
  });

  it("still scrolls when the page has no focus target", () => {
    getElementById.mockReturnValue(null);
    browser.scrollY = 900;
    render()!.props.onClick();
    expect(browser.scrollTo).toHaveBeenCalledTimes(1);
  });
});

describe("Back to Top integration", () => {
  it("is rendered once by the shared article layout and not by individual articles", () => {
    const usages = (source: string) => source.match(/<BackToTop\b/g)?.length ?? 0;
    expect(usages(readFileSync("src/components/learning/article-layout.tsx", "utf8"))).toBe(1);
    for (const route of ["introduction-to-react", "thinking-in-declarative-ui", "use-state", "use-effect"]) {
      expect(usages(readFileSync(`src/app/frontend/react/${route}/page.tsx`, "utf8"))).toBe(0);
    }
    expect(usages(readFileSync("src/components/layout/app-shell.tsx", "utf8"))).toBe(0);
  });
});
