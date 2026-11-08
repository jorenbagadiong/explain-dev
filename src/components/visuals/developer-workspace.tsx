import { Atom, Braces } from "lucide-react";

const preview = `import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() =>
      setCount(n => n + 1)
    }>
      Count: {count}
    </button>
  );
}`;

// A decorative, server-rendered composition. No simulated controls or execution.
export function DeveloperWorkspace({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-hidden="true" className={`developer-workspace${compact ? " developer-workspace-compact" : ""}`}>
      <div className="workspace-orbit" />
      <div className="workspace-backplane" />
      <div className="workspace-editor">
        <div className="workspace-caption"><Braces className="size-4 text-primary" /><span>Counter.tsx</span><span className="ml-auto text-muted-foreground">React</span></div>
        <pre className="workspace-code"><code>{preview}</code></pre>
        <div className="workspace-mobile"><span>State</span><span>→</span><span>Render</span><span>→</span><span>UI</span></div>
      </div>
      <div className="workspace-flow"><span className="workspace-flow-label">From an idea to an interface</span><div><span>Compose</span><span>→</span><span>Render</span><span>→</span><span>Commit</span></div></div>
      <div className="workspace-react"><Atom className="size-7" /></div>
    </div>
  );
}
