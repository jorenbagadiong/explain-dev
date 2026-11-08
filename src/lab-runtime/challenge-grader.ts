// Sandbox-only execution. A closed dispatcher, not a learner-extensible plugin interface.
import { act, createElement, type ComponentType } from "react";
import { createRoot, type Root } from "react-dom/client";
import { getGradingTests, FILTER_ITEMS, MAX_GRADING_FEEDBACK, TEST_TIMEOUT_MS, type ChallengeId, type GradingResult, type TestResult } from "@/lib/lab/grading";
import { installIntervalProbe } from "./interval-probe";
import { gradeCounter } from "./counter-grader";
import { accessibleName, BehaviorFailure, normalize, readable } from "./grading-dom";

const assert = (condition: unknown, message: string) => { if (!condition) throw new BehaviorFailure(message); };
function field(container: HTMLElement, label: string) {
  const matches = [...container.querySelectorAll<HTMLInputElement>('input:not([type]), input[type="text"], input[type="search"]')].filter(el => readable(el) && (el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby') ? accessibleName(el) : normalize([...el.labels ?? []].map(label => label.textContent).join(' '))) === label);
  assert(matches.length === 1, `Provide one readable text input labelled ${label}.`);
  const input = matches[0]; assert(!input.disabled && !input.readOnly, `${label} must accept edits.`); return input;
}
async function type(container: HTMLElement, label: string, value: string) {
  const input = field(container, label);
  // Use the native setter so React's value tracker sees a real external edit; no learner internals are inspected.
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
  await act(async () => { setter.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true })); });
  assert(field(container, label).value === value, `The ${label} input did not retain ${JSON.stringify(value)}.`);
}
function status(container: HTMLElement, label: string) {
  const matches = [...container.querySelectorAll('[role="status"], output')].filter(el => readable(el) && accessibleName(el) === label);
  assert(matches.length === 1, `Provide one readable status named ${label}.`); return normalize(matches[0].textContent ?? '');
}
async function inputTest(container: HTMLElement, id: string) {
  assert(field(container, 'Name').value === '', 'The name must start empty.');
  if (id === 'input-initial') return;
  const greeting = (value: string) => assert(status(container, 'Greeting') === `Hello, ${value || 'stranger'}!`, `Expected Hello, ${value || 'stranger'}! in the Greeting status.`);
  greeting('');
  const sequences: Record<string, string[]> = { 'greeting-initial': [], typing: ['Ada'], 'greeting-update': ['Grace'], clearing: ['Lin', ''], 'repeated-edits': ['Ada', 'Alan', 'A', 'Mina'], 'empty-string': ['', 'Zoe', '', 'Sam', ''] };
  for (const value of sequences[id]) { await type(container, 'Name', value); if (id !== 'typing') greeting(value); }
}
async function filterTest(container: HTMLElement, id: string) {
  const verify = (query: string) => {
    const lists = [...container.querySelectorAll('ul, ol, [role="list"]')].filter(el => readable(el) && accessibleName(el) === 'Fruits');
    assert(lists.length === 1, 'Provide one readable list named Fruits, even when empty.');
    const actual = [...lists[0].querySelectorAll('li, [role="listitem"]')].filter(readable).map(el => normalize(el.textContent ?? ''));
    const expected = FILTER_ITEMS.filter(fruit => fruit.toLowerCase().includes(query.toLowerCase()));
    assert(JSON.stringify(actual) === JSON.stringify(expected), `For query ${JSON.stringify(query)}, expected [${expected.join(', ')}], found [${actual.join(', ')}].`);
    const empty = [...container.querySelectorAll('[role="status"], output')].filter(el => readable(el) && accessibleName(el) === 'Results');
    assert(expected.length ? !empty.some(el => normalize(el.textContent ?? '') === 'No fruits found.') : empty.length === 1 && normalize(empty[0].textContent ?? '') === 'No fruits found.', 'Show No fruits found. only when the result list is empty.');
  };
  assert(field(container, 'Search fruits').value === '', 'The search starts empty.'); verify('');
  const sequences: Record<string, string[]> = { 'all-items': [], query: ['Ban'], 'case-insensitive': ['B', 'bLuE'], partial: ['ap', 'err'], 'empty-results': ['zz', 'apple'], 'clear-query': ['gr', ''], 'fresh-results': ['a', 'cher', 'BAN', 'berry', 'ap', '', 'xyz'] };
  for (const query of sequences[id]) { await type(container, 'Search fruits', query); verify(query); }
}
async function conditionalTest(container: HTMLElement, id: string) {
  let target: string | null = null;
  const verify = (visible: boolean) => {
    const buttons = [...container.querySelectorAll('button')].filter(el => readable(el) && accessibleName(el) === 'Toggle details');
    assert(buttons.length === 1 && !buttons[0].disabled, 'Provide one enabled native button named Toggle details.');
    const button = buttons[0], controls = button.getAttribute('aria-controls');
    assert(controls && (!target || controls === target), 'aria-controls must consistently name the details panel.'); target = controls;
    assert(button.getAttribute('aria-expanded') === String(visible), 'aria-expanded must match whether the panel is mounted.');
    assert(normalize(button.textContent ?? '') === (visible ? 'Hide details' : 'Show details'), 'The button text must describe its next action.');
    const panels = [...container.querySelectorAll('[id]')].filter(el => el.id === controls);
    assert(visible ? panels.length === 1 && readable(panels[0]) && normalize(panels[0].textContent ?? '') === 'Extra details are visible.' : panels.length === 0, visible ? 'Mount readable Extra details are visible. content in the controlled panel.' : 'Remove the details panel from the DOM; CSS-only hiding does not count.');
    return button;
  };
  verify(false);
  const clicks: Record<string, number> = { 'initial-hidden': 0, 'first-toggle': 1, 'second-toggle': 2, 'repeated-toggle': 6, 'dom-removal': 4, 'button-accessibility': 3, 'consistent-state': 9 };
  for (let i = 0; i < clicks[id]; i++) { await act(async () => verify(Boolean(i % 2)).click()); verify(Boolean((i + 1) % 2)); }
}
async function cleanupTest(container: HTMLElement, id: string, probe: ReturnType<typeof installIntervalProbe>, mount: () => Promise<void>, unmount: () => Promise<void>) {
  const ticks = (expected: number) => {
    const parse = (el: Element) => /^Ticks:\s*(\d+)$/.exec(normalize(el.textContent ?? ''));
    const displays = [...container.querySelectorAll('*')].filter(el => readable(el) && parse(el) && ![...el.children].some(child => parse(child)));
    assert(displays.length === 1 && Number(parse(displays[0])![1]) === expected, `Expected one readable Ticks: ${expected} display.`);
  };
  const active = () => { const observation = probe.snapshot(); assert(observation.active === 1 && observation.delays[0] === 1000, `Expected one live 1,000 ms interval; observed ${observation.active} with delays [${observation.delays.join(', ')}].`); };
  const advance = async (ms: number) => { await act(async () => probe.advance(ms)); };
  const idle = async () => { const before = probe.snapshot(); assert(before.active === 0, `Unmount left ${before.active} live interval(s). Cancel the interval in cleanup.`); await advance(5000); assert(probe.snapshot().fired === before.fired, 'An interval callback ran after unmount.'); };
  ticks(0); active();
  if (id === 'effect-setup') return;
  if (id === 'interval-contract') { await advance(999); ticks(0); await advance(1); ticks(1); await advance(3000); ticks(4); active(); return; }
  await advance(1000); ticks(1); active();
  if (id === 'mounted-ticks') { await advance(2000); ticks(3); active(); return; }
  await unmount(); await idle();
  if (id === 'unmount-cleanup' || id === 'no-lingering') return;
  const cycles = id === 'repeated-cycles' ? 3 : 1;
  for (let cycle = 0; cycle < cycles; cycle++) { await mount(); ticks(0); active(); await advance(2000); ticks(2); active(); await unmount(); await idle(); }
}
class TestTimeout extends Error {}
export async function gradeChallenge({ challengeId, createApp, runId, setErrorHandler }: {
  challengeId: ChallengeId; createApp: () => ComponentType; runId: number; setErrorHandler: (handler: ((error: unknown) => void) | null) => void;
}): Promise<GradingResult> {
  if (challengeId === 'react-use-state-counter') return gradeCounter({ createApp, runId, setErrorHandler });
  (self as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  const results: TestResult[] = [], start = performance.now(); let aborted = false;
  // Captured before any learner factory evaluation.
  const deadline = window.setTimeout.bind(window), cancel = window.clearTimeout.bind(window);
  for (const test of getGradingTests(challengeId)) {
    if (aborted) { results.push({ id: test.id, status: 'timeout', feedback: 'Not run because the previous test did not settle.', durationMs: 0 }); continue; }
    const began = performance.now(), container = document.createElement('div'); document.getElementById('root')!.append(container);
    const probe = challengeId === 'react-effect-cleanup' ? installIntervalProbe(window) : undefined;
    let root: Root | undefined, timer: number | undefined, observer: MutationObserver | undefined, error: unknown, errored = false;
    const capture = (value: unknown) => { errored = true; error = value; }; setErrorHandler(capture);
    let state: TestResult['status'] = 'passed', feedback = 'All required observations matched.';
    try {
      await Promise.race([(async () => {
        const App = createApp();
        const mount = async () => {
          root = createRoot(container, { onUncaughtError: capture, onCaughtError: capture });
          await act(async () => root!.render(createElement(App)));
          if (errored) throw error;
          if (!container.childElementCount) await new Promise<void>(resolve => { observer = new MutationObserver(() => { if (container.childElementCount) resolve(); }); observer.observe(container, { childList: true, subtree: true }); });
          if (errored) throw error;
        };
        const unmount = async () => { await act(async () => root!.unmount()); root = undefined; if (errored) throw error; };
        await mount();
        if (challengeId === 'react-controlled-input') await inputTest(container, test.id);
        else if (challengeId === 'react-list-filtering') await filterTest(container, test.id);
        else if (challengeId === 'react-conditional-rendering') await conditionalTest(container, test.id);
        else if (probe) await cleanupTest(container, test.id, probe, mount, unmount);
        if (errored) throw error;
        if (root) await unmount();
      })(), new Promise<never>((_, reject) => { timer = deadline(() => reject(new TestTimeout('The test did not finish. Check for unresolved work.')), TEST_TIMEOUT_MS); })]);
    } catch (caught) { state = caught instanceof TestTimeout ? 'timeout' : caught instanceof BehaviorFailure ? 'failed' : 'error'; feedback = (caught instanceof Error ? caught.message : 'The component threw an unexpected value.').slice(0, MAX_GRADING_FEEDBACK) || 'Unexpected error.'; aborted = state === 'timeout'; }
    finally { cancel(timer); observer?.disconnect(); if (root && !aborted) { try { await act(async () => root!.unmount()); } catch { /* Primary failure retained. */ } } probe?.dispose(); setErrorHandler(null); container.remove(); }
    results.push({ id: test.id, status: state, feedback, durationMs: Math.max(0, performance.now() - began) });
  }
  return { challengeId, runId, results, completed: results.every(test => test.status === 'passed'), durationMs: Math.max(0, performance.now() - start) };
}
