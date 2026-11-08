// Grading-only virtual interval instrumentation. The controller stays in the grader's closure.
// Native heartbeat/deadline timers are created/captured before installation.
import { BehaviorFailure } from "./grading-dom";

export function installIntervalProbe(target: Window) {
  const descriptors = new Map(['setInterval', 'clearInterval', 'clearTimeout'].map(key => [key, Object.getOwnPropertyDescriptor(target, key)]));
  const nativeClearInterval = target.clearInterval.bind(target), nativeClearTimeout = target.clearTimeout.bind(target), nativeSetTimeout = target.setTimeout.bind(target);
  const intervals = new Map<number, { callback: () => void; delay: number; next: number }>();
  let clock = 0, fired = 0, disposed = false;
  const register = (handler: TimerHandler, delay = 0, ...args: unknown[]) => {
    if (typeof handler !== 'function') throw new BehaviorFailure('Use a function interval callback.');
    if (disposed || intervals.size >= 32) throw new BehaviorFailure('Too many active intervals.');
    // Reserve a real positive handle in the shared native timer pool. Its inert callback
    // is far beyond the grading deadline; holding it prevents native ID collisions.
    const period = Math.max(1, Math.trunc(Number(delay)) || 1), id = nativeSetTimeout(() => {}, 2_147_483_647);
    intervals.set(id, { callback: () => handler(...args), delay: period, next: clock + period }); return id;
  };
  const clearInterval = (id?: number) => { if (id !== undefined && intervals.delete(id)) { nativeClearTimeout(id); return; } nativeClearInterval(id); };
  const clearTimeout = (id?: number) => { if (id !== undefined && intervals.delete(id)) { nativeClearTimeout(id); return; } nativeClearTimeout(id); };
  Object.defineProperties(target, {
    setInterval: { configurable: true, writable: true, value: register },
    clearInterval: { configurable: true, writable: true, value: clearInterval },
    clearTimeout: { configurable: true, writable: true, value: clearTimeout },
  });
  return {
    snapshot: () => ({ active: intervals.size, delays: [...intervals.values()].map(timer => timer.delay), fired }),
    advance(ms: number) {
      if (!Number.isFinite(ms) || ms < 0) throw new Error('Invalid virtual duration.');
      const end = clock + ms; let calls = 0;
      while (!disposed) {
        const due = [...intervals].filter(([, timer]) => timer.next <= end).sort((a, b) => a[1].next - b[1].next || b[0] - a[0])[0];
        if (!due) break;
        if (++calls > 100) throw new BehaviorFailure('Too many interval callbacks in a test.');
        const [, timer] = due; clock = timer.next; timer.next += timer.delay; fired++; timer.callback();
      }
      clock = end;
    },
    dispose() {
      disposed = true; for (const id of intervals.keys()) nativeClearTimeout(id); intervals.clear();
      for (const [key, descriptor] of descriptors) {
        if (descriptor) Object.defineProperty(target, key, descriptor);
        else Reflect.deleteProperty(target, key);
      }
    },
  };
}
