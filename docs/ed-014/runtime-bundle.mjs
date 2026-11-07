// Bundles selected *displayed* examples with the installed React, outside the app.
import { build } from "vite";
import ts from "typescript";
import path from "node:path";
import { examples } from "./inventory.mjs";

const selected = {
  commit: ["render-and-commit", "clock-commit"],
  queue: ["state-update-queues", "updater-queue"],
  effect: ["use-effect-event", "chat-room"],
  like: ["use-optimistic", "like-button"],
  comments: ["use-optimistic", "optimistic-list"],
  action: ["use-action-state", "form-action-state"],
  composition: ["component-composition", "compose-not-flag"],
  form: ["accessible-forms", "labelled-inputs"],
  memo: ["react-memo", "basic-memo"],
  suspense: ["react-use-api", "promise-read"],
  boundary: ["error-boundaries", "boundary-usage"],
  typed: ["typescript-react", "union-state"],
  store: ["use-sync-external-store", "simple-store"],
};
const modules = Object.fromEntries(Object.entries(selected).map(([name, [topicId, id]]) => {
  const example = examples.find(example => example.topicId === topicId && example.id === id);
  if (!example) throw new Error(`No example ${topicId}/${id}`);
  return [name, example.code];
}));
// Audit-owned probes are separate from the 13 extracted teaching examples.
modules.effectBoundaryProbe = `
import { Component, useEffect } from "react";
class Boundary extends Component<{children: import("react").ReactNode}, {failed:boolean}> {
  state = {failed:false};
  static getDerivedStateFromError() { return {failed:true}; }
  render() { return this.state.failed ? <p role="alert">Effect error caught</p> : this.props.children; }
}
function Child() { useEffect(() => { throw new Error("audit effect failure"); }, []); return <p>Before effect</p>; }
export default function Probe() { return <Boundary><Child /></Boundary>; }`;
modules.transitionProbe = `
import { Suspense, use, useState, useTransition } from "react";
function Slow({gate}: {gate:Promise<string>}) { return <p>{use(gate)}</p>; }
function SlowPane({gate}: {gate:Promise<string>}) {
 const [show,setShow] = useState(false); const [pending,start] = useTransition();
 return <><button onClick={() => start(() => setShow(true))}>Start slow</button><p>{pending ? "Slow pending" : "Slow settled"}</p><Suspense fallback={<p>Slow fallback</p>}>{show ? <Slow gate={gate}/> : <p>Slow initial</p>}</Suspense></>;
}
function FastPane() { const [ready,setReady] = useState(false); const [,start] = useTransition(); return <><button onClick={() => start(() => setReady(true))}>Start fast</button><p>{ready ? "Fast ready" : "Fast initial"}</p></>; }
export default function Probe({gate}: {gate:Promise<string>}) {return <><SlowPane gate={gate}/><FastPane/></>;}`;
const entry = `
import { createElement, startTransition, StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
${Object.keys(modules).map(name => `import * as ${name} from "ed014:${name}";`).join("\n")}
const examples = {${Object.keys(modules).join(",")}};
// Audit-owned parent: confirm each request in the base props before its Action settles.
function ConfirmedComments({ comments: initialComments = [], addComment }) {
  const [comments, setComments] = useState(initialComments);
  async function confirmComment(text) {
    await addComment(text);
    startTransition(() => setComments(current => [
      ...current, { id: "confirmed-" + crypto.randomUUID(), text },
    ]));
  }
  return createElement(examples.comments.default, { comments, addComment: confirmComment });
}
let root;
window.audit = {
  mount(name, props = {}, strict = false) {
    if(root) flushSync(() => root.unmount());
    document.body.innerHTML = '<div id="fixture"></div>';
    root = createRoot(document.getElementById("fixture"));
    const component = name === "comments" ? ConfirmedComments : examples[name].default ?? examples[name].Retry;
    const element = createElement(component, props);
    flushSync(() => root.render(strict ? createElement(StrictMode, null, element) : element));
  },
  unmount() { if(root) { flushSync(() => root.unmount()); root = null; } },
};`;
await build({
  configFile: false, logLevel: "warn",
  resolve: { alias: [
    { find: /^react$/, replacement: path.resolve("node_modules/react/index.js") },
    { find: /^react\/jsx-runtime$/, replacement: path.resolve("node_modules/react/jsx-runtime.js") },
    { find: /^react-dom$/, replacement: path.resolve("node_modules/react-dom/index.js") },
    { find: /^react-dom\/client$/, replacement: path.resolve("node_modules/react-dom/client.js") },
  ] },
  define: { "process.env.NODE_ENV": JSON.stringify("development") },
  plugins: [{
    name: "ed014-displayed-examples",
    resolveId(id) { if (id.endsWith("ed014:entry")) return "\0ed014:entry"; if (id.startsWith("ed014:")) return `\0${id}`; },
    load(id) {
      if (id === "\0ed014:entry") return entry;
      if (!id.startsWith("\0ed014:")) return;
      const source = modules[id.slice("\0ed014:".length)];
      if (!source) throw new Error(`Unknown audit module ${id}`);
      return ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    },
  }],
  build: { outDir: "/tmp/explain-dev-ed014-runtime", emptyOutDir: false, minify: false,
    lib: { entry: "ed014:entry", name: "ED014", formats: ["iife"], fileName: () => "examples.js" } },
});
console.log(`Bundled ${Object.keys(selected).length} displayed examples and two audit probes with installed React in /tmp/explain-dev-ed014-runtime/examples.js`);
