import { describe, expect, it } from "vitest";

import { createExecutionGuard, EXECUTION_LIMIT_MS, ExecutionLimitError } from "./execution-guard";

function harness(limitMs = 100) {
  let time = 0;
  let pending: (() => void) | null = null;
  const trips: ExecutionLimitError[] = [];
  const instance = createExecutionGuard({ now: () => time, scheduleReset: (reset) => { pending = reset; }, limitMs, onTrip: (error) => trips.push(error) });
  return {
    ...instance,
    trips,
    advance: (ms: number) => { time += ms; },
    /** Simulates the event loop reaching the next macrotask. */
    yieldToEventLoop: () => { const reset = pending; pending = null; reset?.(); },
  };
}

describe("execution guard", () => {
  it("uses a one-second default limit", () => {
    expect(EXECUTION_LIMIT_MS).toBe(1_000);
  });

  it("allows work within the limit and resets when the event loop turns", () => {
    const guard = harness();
    guard.guard();
    guard.advance(90);
    guard.guard();
    guard.yieldToEventLoop();
    guard.advance(90);
    guard.guard();
    guard.advance(90);
    expect(() => guard.guard()).not.toThrow();
    expect(guard.isTripped()).toBe(false);
  });

  it("trips once when a task runs past the limit, then stays tripped", () => {
    const guard = harness();
    guard.guard();
    guard.advance(101);
    expect(() => guard.guard()).toThrow(ExecutionLimitError);
    expect(guard.trips).toHaveLength(1);
    guard.yieldToEventLoop();
    guard.advance(1);
    expect(() => guard.guard()).toThrow(ExecutionLimitError);
    expect(guard.trips).toHaveLength(1);
    expect(guard.isTripped()).toBe(true);
  });

  it("explains the likely cause without claiming certainty", () => {
    expect(new ExecutionLimitError(1_000).message).toMatch(/usually means an infinite loop or endless recursion/);
  });
});
