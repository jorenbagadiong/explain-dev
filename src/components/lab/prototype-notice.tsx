// Server-only notice shared by Practice routes. Kept separate so /practice does not pull in the workspace loader.
export function PrototypeNotice() {
  return (
    <aside aria-label="About the Coding Lab" className="mt-6 rounded-xl border border-dashed bg-muted/30 p-4 text-sm leading-6 text-muted-foreground" data-lab-limitations="">
      <p><span className="font-medium text-foreground">Research prototype.</span> Your code runs in a sandboxed preview inside your browser. Nothing is sent to a server.</p>
      <ul className="mt-2 list-outside list-disc space-y-1 pl-5 marker:text-primary">
        <li>TypeScript types are removed, not checked. Type errors are not reported.</li>
        <li>Only <code className="font-mono text-foreground">react</code> and <code className="font-mono text-foreground">react-dom/client</code> can be imported. Network requests are blocked.</li>
        <li>Drafts and progress are stored only in this browser, with no device sync. Saved code stays inert until you choose Run or Run Tests.</li>
      </ul>
    </aside>
  );
}
