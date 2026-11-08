"use client";

import { useId, useState } from "react";
import { Copy, Lightbulb, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { challengeStatus, MAX_DRAFT_LENGTH } from "@/lib/lab/progress";
import type { ChallengeProgressSession, ProgressSnapshot, SaveError } from "@/lib/storage/challenge-progress";
import type { ReferenceSolution } from "@/lib/lab/types";
import { isChallengeId } from "@/lib/lab/grading";
import { loadReferenceSolution } from "@/lib/lab/reference-solutions";
import styles from "./lab.module.css";

const errors: Record<SaveError, string> = {
  locked: "Another open tab owns saving for this challenge. Close that challenge tab, then retry. Edits here are not saved yet.",
  conflict: "Saved progress changed in another tab. Your editor has been kept. Choose which draft to keep before saving.",
  unavailable: "Browser storage or exclusive saving is unavailable. Your changes are kept in this tab only. Allow site storage and retry.",
  quota: "Browser storage is full. This draft is not saved. Free some site storage, then retry.",
  "too-large": `This draft exceeds the ${MAX_DRAFT_LENGTH.toLocaleString("en-US")}-character save limit. Reduce it to save; the previous saved draft is kept.`,
  unsupported: "Saved progress uses a newer storage format. It has not been overwritten. Use a compatible app version or explicitly clear progress.",
  invalid: "Progress could not be saved safely. Keep a copy of your code and retry.",
};
const statusNames = { "not-started": "Not Started", "in-progress": "In Progress", completed: "Completed" };

export function LearningProgress({ session, snapshot, hints, onReset, onClear, onLoad }: {
  session: ChallengeProgressSession;
  snapshot: ProgressSnapshot;
  hints: readonly string[];
  onReset: () => void;
  onClear: () => void;
  onLoad: () => void;
}) {
  const id = useId();
  const { data } = snapshot;
  const [confirmSolution, setConfirmSolution] = useState(false);
  const [solution, setSolution] = useState<ReferenceSolution | null>(null);
  const [solutionState, setSolutionState] = useState("");
  const [copyState, setCopyState] = useState("");
  const reveal = async () => {
    setSolutionState("Loading reference solution…");
    try {
      if (!isChallengeId(session.definition.challengeId)) throw new Error("Unknown challenge.");
      const reference = await loadReferenceSolution(session.definition.challengeId);
      if (!session.solution(snapshot.generation)) return;
      setSolution(reference); setConfirmSolution(false); setSolutionState("Reference solution revealed. Your editor is unchanged.");
    } catch { setSolutionState("The reference could not load. Try revealing it again."); }
  };
  const copy = async () => {
    if (!solution) return;
    try { await navigator.clipboard.writeText(solution.code); setCopyState("Solution copied. Paste it yourself if you choose."); }
    catch { setCopyState("Copy is unavailable. Select the reference text and copy it manually."); }
  };
  return (
    <section aria-label="Challenge progress" className={styles.learningProgress} data-learning-progress="" data-challenge-status={challengeStatus(data)}>
      <h3 className="font-semibold">Your progress</h3>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="text-muted-foreground">Challenge status</dt><dd className="mt-1 font-medium" data-progress-status="">{statusNames[challengeStatus(data)]}</dd></div>
        <div><dt className="text-muted-foreground">Current draft</dt><dd className="mt-1" data-draft-verification="">{data.verification ? `Last verified: ${data.verification.passedCount}/${data.totalTests} passed` : "Not verified. Run Tests to check this draft."}</dd></div>
        <div><dt className="text-muted-foreground">Best verified result for this revision</dt><dd className="mt-1" data-best-result="">{data.bestPassedCount}/{data.totalTests} passed</dd></div>
        <div><dt className="text-muted-foreground">Local save</dt><dd className="mt-1"><span role="status" aria-atomic="true" data-save-status="">{snapshot.saveState === "saving" ? "Saving…" : snapshot.saveState === "saved" ? "Saved in this browser" : snapshot.saveState === "error" ? "Not saved — see the message below" : "No draft changes to save"}</span>{data.savedAt ? <time className="mt-1 block text-xs text-muted-foreground" dateTime={data.savedAt}>Last saved {new Date(data.savedAt).toLocaleTimeString()}</time> : null}</dd></div>
      </dl>
      {data.completion ? <p className="mt-3 text-xs leading-6 text-muted-foreground" data-historical-completion="">{data.completion.revision === data.gradingRevision ? "Completed this challenge revision" : "Completed an earlier challenge revision"} on {new Date(data.completion.at).toLocaleString()}. Later edits keep this history; they do not verify the current draft.</p> : null}
      {snapshot.notice === "restored" ? <p className="mt-3 text-sm leading-6" data-draft-restored="">Saved draft restored as text. Select Run or Run Tests when ready; restoring does not update the preview.</p> : null}
      {snapshot.notice === "invalid" ? <p className="mt-3 text-sm leading-6">Saved progress was unreadable. Nothing was deleted and the editor is kept. A new edit or explicit retry can replace the invalid record.</p> : null}
      {snapshot.notice === "revision-changed" ? <p className="mt-3 text-sm leading-6">The grading requirements changed. Your draft is kept, but previous test evidence does not verify this revision.</p> : null}
      {data.starterRevision !== session.definition.starterRevision ? <p className="mt-3 text-sm leading-6">The starter was updated. Your draft is kept. Reset Code uses the latest starter.</p> : null}
      {snapshot.error ? <div className="mt-3 rounded-lg border p-3 text-sm leading-6" data-save-error="">
        <p>{errors[snapshot.error]}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => { void session.retry(); }}>Retry saving</Button>
          {snapshot.error === "conflict" ? <>
            <Button type="button" variant="outline" onClick={onLoad}>Load saved draft</Button>
            <Button type="button" variant="outline" onClick={() => { if (window.confirm("Replace the other saved draft with the code and progress currently in this tab?")) session.replaceSaved(); }}>Save this draft instead</Button>
          </> : null}
        </div>
      </div> : null}
      <p className="mt-3 text-xs leading-6 text-muted-foreground">Stored only in this browser. Clearing site data may remove it; progress does not sync across devices. Completion is learning feedback, not certification.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onReset}><RotateCcw aria-hidden="true" />Reset Code</Button>
        <Button type="button" variant="outline" onClick={onClear} data-clear-progress=""><Trash2 aria-hidden="true" />Clear Progress</Button>
      </div>
      <div className="mt-5 border-t pt-4">
        <h4 id={`${id}-hints`} className="flex items-center gap-2 text-sm font-semibold"><Lightbulb aria-hidden="true" className="size-4 text-primary" />Hints</h4>
        <ol className="mt-3 list-outside list-decimal space-y-3 pl-5 text-sm leading-7 text-muted-foreground" aria-labelledby={`${id}-hints`} data-revealed-hints="">
          {hints.slice(0, data.revealedHintCount).map((hint) => <li key={hint}>{hint}</li>)}
        </ol>
        {data.revealedHintCount < hints.length ? <Button type="button" variant="outline" className="mt-3" onClick={() => session.hint()}>Reveal hint {data.revealedHintCount + 1} of {hints.length}</Button> : <p className="mt-2 text-xs text-muted-foreground">All three hints revealed.</p>}
      </div>
      <div className="mt-5 border-t pt-4" data-reference-section="">
        <h4 className="text-sm font-semibold">Reference solution</h4>
        {!solution && !confirmSolution ? <>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Try the challenge first. Viewing or copying the reference does not complete it.{data.solutionRevealed ? " You previously viewed this solution." : ""}</p>
          <Button type="button" variant="outline" className="mt-3" onClick={() => setConfirmSolution(true)}>View reference solution</Button>
        </> : null}
        {confirmSolution ? <div className="mt-3 rounded-lg border p-3 text-sm leading-6">
          <p>This reveals the complete challenge implementation. Your editor will stay unchanged. Continue?</p>
          <div className="mt-2 flex flex-wrap gap-2"><Button type="button" onClick={() => { void reveal(); }}>Reveal reference solution</Button><Button type="button" variant="outline" onClick={() => setConfirmSolution(false)}>Keep practicing</Button></div>
        </div> : null}
        <p role="status" className="mt-2 text-xs text-muted-foreground">{solutionState}</p>
        {solution ? <>
          <pre className={styles.referenceCode} tabIndex={0} aria-label="Challenge reference solution"><code>{solution.code}</code></pre>
          <Button type="button" variant="outline" className="mt-3" onClick={() => { void copy(); }}><Copy aria-hidden="true" />Copy solution</Button>
          <p role="status" className="mt-2 text-xs text-muted-foreground">{copyState}</p>
          <dl className="mt-4 space-y-3">{solution.explanation.map((item) => <div key={item.title}><dt className="text-sm font-medium">{item.title}</dt><dd className="mt-1 text-sm leading-7 text-muted-foreground">{item.body}</dd></div>)}</dl>
        </> : null}
      </div>
    </section>
  );
}
