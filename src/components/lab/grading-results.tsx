import { CircleCheck, CircleX, Clock3, ListChecks, LoaderCircle, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COUNTER_TESTS, type GradingResult, type TestStatus } from "@/lib/lab/grading";
import styles from "./lab.module.css";

export type GradingState =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "finished"; result: GradingResult }
  | { kind: "blocked"; message: string; timeout: boolean };
const labels: Record<TestStatus, string> = { passed: "Passed", failed: "Failed", error: "Error", timeout: "Timed out" };
const icons = { passed: CircleCheck, failed: CircleX, error: TriangleAlert, timeout: Clock3 };
export function GradingResults({ state, onRetry }: { state: GradingState; onRetry: () => void }) {
  const passed = state.kind === "finished" ? state.result.results.filter((row) => row.status === "passed").length : 0;
  const announcement = state.kind === "idle" ? "Run Tests for a fresh check of the current draft." : state.kind === "running" ? "Running seven counter tests…" : state.kind === "blocked" ? (state.timeout ? "Tests timed out. Check the feedback and retry." : "Tests could not finish. Check the feedback and retry.") : `${passed} of ${COUNTER_TESTS.length} tests passed.${state.result.completed ? " Challenge complete." : " Review the results and try again."}`;
  return (
    <section aria-label="Test results" className={styles.gradingResults} data-grading-status={state.kind}>
      <h3 className="flex items-center gap-2 font-semibold"><ListChecks aria-hidden="true" className="size-4 text-primary" />Test results</h3>
      <p role="status" aria-atomic="true" className="mt-2 text-sm leading-6" data-grading-summary="">
        {state.kind === "running" ? <LoaderCircle aria-hidden="true" className="mr-2 inline size-4 animate-spin motion-reduce:animate-none" /> : null}{announcement}
      </p>
      {state.kind === "blocked" ? <p className="mt-3 text-sm leading-6" data-grading-error="">{state.message}</p> : null}
      {state.kind === "finished" ? (
        <ol className="mt-4 grid gap-3">
          {state.result.results.map((row, index) => {
            const Icon = icons[row.status];
            return <li key={row.id} className={styles.gradingRow} data-test-id={row.id} data-test-status={row.status}>
              <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${row.status === "passed" ? "text-primary" : "text-destructive"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{COUNTER_TESTS[index].title}</p>
                <p className="mt-1 text-xs font-medium">{labels[row.status]} · {Math.round(row.durationMs)} ms</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{row.feedback}</p>
              </div>
            </li>;
          })}
        </ol>
      ) : null}
      {state.kind === "finished" ? <p className="mt-3 text-xs text-muted-foreground">Suite time: {Math.round(state.result.durationMs)} ms</p> : null}
      {state.kind === "finished" || state.kind === "blocked" ? <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>Retry tests</Button> : null}
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Browser-side checks are learning feedback, not tamper-proof assessment. They do not certify your implementation.</p>
    </section>
  );
}
