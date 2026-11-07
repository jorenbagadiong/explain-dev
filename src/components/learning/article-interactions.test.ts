import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ArticleModes } from "./article-modes";
import { AnswerReveal } from "./answer-reveal";

// Small Hook stubs exercise the real event handlers in the existing Node suite.
// Browser QA verifies React hydration, DOM focus, keyboard, and native events.
const hooks = vi.hoisted(() => ({ slots: [] as unknown[], cursor: 0, id: "test" }));
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useId: () => hooks.id,
  useState<T>(initial: T) {
    const slots = hooks.slots;
    const index = hooks.cursor++;
    if (!(index in slots)) slots[index] = initial;
    return [slots[index], (next: T | ((previous: T) => T)) => {
      slots[index] = typeof next === "function" ? (next as (previous: T) => T)(slots[index] as T) : next;
    }];
  },
}));

type ElementProps = { children?: ReactNode; onClick?: () => void; [key: string]: unknown };
function elements(node: ReactNode): ReactElement<ElementProps>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<ElementProps>(node)) return [];
  return [node, ...elements(node.props.children)];
}
function harness(render: () => ReactNode, id: string) {
  const slots: unknown[] = [];
  return () => {
    hooks.slots = slots;
    hooks.cursor = 0;
    hooks.id = id;
    return elements(render());
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", { setItem: vi.fn(), removeItem: vi.fn() });
  vi.stubGlobal("history", { pushState: vi.fn(), replaceState: vi.fn() });
});

describe("article mode interactions", () => {
  const props = { learn: "Full lesson", review: "Review notes", interview: "Practice questions" };

  it("defaults to Learn with a simple button group and associated hidden panels", () => {
    const nodes = harness(() => ArticleModes(props), "modes")();
    const buttons = nodes.filter((node) => node.type === "button");
    expect(buttons.map((node) => node.props.children)).toEqual(["Learn", "Quick Review", "Interview"]);
    expect(buttons.map((node) => node.props["aria-pressed"])).toEqual([true, false, false]);
    expect(nodes.find((node) => node.props.role === "group")?.props["aria-label"]).toBe("Article mode");
    const panels = nodes.filter((node) => node.props.role === "region");
    expect(panels.map((node) => node.props.hidden)).toEqual([false, true, true]);
    buttons.forEach((button, index) => {
      expect(button.props.type).toBe("button");
      expect(button.props["aria-controls"]).toBe(panels[index].props.id);
      expect(panels[index].props["aria-labelledby"]).toBe(button.props.id);
    });
    expect(nodes.some((node) => node.props.role === "tab")).toBe(false);
  });

  it("selects each mode through its button handler, preserving content and avoiding URL/storage writes", () => {
    const render = harness(() => ArticleModes(props), "modes");
    for (const index of [1, 2, 0]) {
      render().filter((node) => node.type === "button")[index].props.onClick?.();
      const nodes = render();
      expect(nodes.filter((node) => node.type === "button").map((node) => node.props["aria-pressed"])).toEqual([0, 1, 2].map((value) => value === index));
      const panels = nodes.filter((node) => node.props.role === "region");
      expect(panels.map((node) => node.props.hidden)).toEqual([0, 1, 2].map((value) => value !== index));
      expect(panels.map((node) => node.props.children)).toEqual(Object.values(props));
    }
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(localStorage.removeItem).not.toHaveBeenCalled();
    expect(history.pushState).not.toHaveBeenCalled();
    expect(history.replaceState).not.toHaveBeenCalled();
  });
});

describe("suggested answer interactions", () => {
  it("hides an answer initially and exposes its control relationship", () => {
    const nodes = harness(() => AnswerReveal({ question: "Why?", children: "Because." }), "answer")();
    const button = nodes.find((node) => node.type === "button")!;
    expect(button.props.children).toBe("Reveal answer");
    expect(button.props["aria-expanded"]).toBe(false);
    expect(button.props["aria-label"]).toBe("Reveal answer: Why?");
    expect(nodes.find((node) => node.props.id === button.props["aria-controls"])?.props.hidden).toBe(true);
  });

  it("reveals and hides the correct answer while other cards remain independent", () => {
    const first = harness(() => AnswerReveal({ question: "First?", children: "First answer." }), "first");
    const second = harness(() => AnswerReveal({ question: "Second?", children: "Second answer." }), "second");
    const button = (nodes: ReturnType<typeof first>) => nodes.find((node) => node.type === "button")!;
    button(first()).props.onClick?.();
    expect(button(first()).props["aria-expanded"]).toBe(true);
    expect(button(first()).props.children).toBe("Hide answer");
    expect(button(second()).props["aria-expanded"]).toBe(false);
    const html = renderToStaticMarkup(first()[0]);
    expect(html).toContain("First answer.");
    button(second()).props.onClick?.();
    button(first()).props.onClick?.();
    expect(button(first()).props["aria-expanded"]).toBe(false);
    expect(button(second()).props["aria-expanded"]).toBe(true);
  });
});
