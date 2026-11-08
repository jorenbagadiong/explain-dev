// Defense in depth against accidental nontermination inside the sandboxed preview.
//
// The compiler inserts a guard call at every function entry and loop iteration. The guard measures how long
// the current task has run without the event loop reaching the next macrotask. If that exceeds the limit,
// the guard throws, and it keeps throwing for the rest of the run (sticky), so learner try/catch cannot resume.
// A synchronous loop and an endless microtask chain both stop macrotasks, so both are caught.
//
// Limits: this is not a CPU or memory sandbox. Code that blocks without calling instrumented code (a slow regular
// expression, one huge allocation, a long built-in call) is not interrupted. Isolation comes from the sandbox.

export const EXECUTION_LIMIT_MS = 1_000;

export class ExecutionLimitError extends Error {
  constructor(limitMs: number) {
    super(`Stopped after ${limitMs / 1000} second${limitMs === 1000 ? "" : "s"} without a pause. This usually means an infinite loop or endless recursion.`);
    this.name = "ExecutionLimitError";
  }
}

export interface ExecutionGuardOptions {
  now: () => number;
  /** Must run the callback in a later macrotask (for example via MessageChannel). */
  scheduleReset: (reset: () => void) => void;
  limitMs?: number;
  onTrip?: (error: ExecutionLimitError) => void;
}

export function createExecutionGuard({ now, scheduleReset, limitMs = EXECUTION_LIMIT_MS, onTrip }: ExecutionGuardOptions) {
  let taskStart = -1;
  let tripped: ExecutionLimitError | null = null;
  const reset = () => { taskStart = -1; };

  function guard(): void {
    if (tripped) throw tripped;
    const time = now();
    if (taskStart < 0) {
      taskStart = time;
      scheduleReset(reset);
      return;
    }
    if (time - taskStart > limitMs) {
      tripped = new ExecutionLimitError(limitMs);
      onTrip?.(tripped);
      throw tripped;
    }
  }

  return { guard, isTripped: () => tripped !== null };
}
