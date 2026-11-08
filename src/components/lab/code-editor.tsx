"use client";

import { useEffect, useRef } from "react";
import { defaultKeymap, history, historyKeymap, indentWithTab, isolateHistory, simplifySelection, temporarilySetTabFocusMode } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { bracketMatching, defaultHighlightStyle, HighlightStyle, indentOnInput, syntaxHighlighting } from "@codemirror/language";
import { EditorState, Transaction } from "@codemirror/state";
import { drawSelection, EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from "@codemirror/view";

// Map CodeMirror's default palette to theme-aware CSS variables (defined in lab.module.css).
const SYNTAX_COLORS: Record<string, string> = {
  "#404740": "var(--lab-syntax-meta)",
  "#708": "var(--lab-syntax-keyword)",
  "#219": "var(--lab-syntax-atom)",
  "#164": "var(--lab-syntax-literal)",
  "#a11": "var(--lab-syntax-string)",
  "#e40": "var(--lab-syntax-regexp)",
  "#00f": "var(--lab-syntax-definition)",
  "#30a": "var(--lab-syntax-local)",
  "#085": "var(--lab-syntax-type)",
  "#167": "var(--lab-syntax-class)",
  "#256": "var(--lab-syntax-special)",
  "#00c": "var(--lab-syntax-property)",
  "#940": "var(--lab-syntax-comment)",
  "#f00": "var(--lab-syntax-invalid)",
};

const themedHighlightStyle = HighlightStyle.define(
  defaultHighlightStyle.specs.map((spec) => (typeof spec.color === "string" && SYNTAX_COLORS[spec.color] ? { ...spec, color: SYNTAX_COLORS[spec.color] } : spec)),
);

const editorTheme = EditorView.theme({
  "&": { height: "100%", color: "var(--foreground)", backgroundColor: "transparent", fontSize: "13px" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", lineHeight: "1.7" },
  ".cm-content": { padding: "12px 0", caretColor: "var(--primary)" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--primary)", borderLeftWidth: "2px" },
  ".cm-gutters": { backgroundColor: "transparent", color: "var(--muted-foreground)", border: "none", borderRight: "1px solid var(--border)" },
  ".cm-activeLine": { backgroundColor: "color-mix(in oklch, var(--primary) 6%, transparent)" },
  ".cm-activeLineGutter": { backgroundColor: "color-mix(in oklch, var(--primary) 10%, transparent)", color: "var(--foreground)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": { backgroundColor: "color-mix(in oklch, var(--primary) 28%, transparent) !important" },
  ".cm-matchingBracket": { backgroundColor: "color-mix(in oklch, var(--primary) 18%, transparent)", outline: "1px solid color-mix(in oklch, var(--primary) 45%, transparent)" },
});

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  label: string;
  describedBy?: string;
  onReady?: (initializationMs: number) => void;
}

export function CodeEditor({ value, onChange, onRun, label, describedBy, onReady }: CodeEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const callbacks = useRef({ onChange, onRun });
  const initialValue = useRef(value);

  useEffect(() => {
    callbacks.current = { onChange, onRun };
  }, [onChange, onRun]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const started = performance.now();
    const view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: initialValue.current,
        extensions: [
          lineNumbers(),
          highlightActiveLineGutter(),
          history(),
          drawSelection(),
          indentOnInput(),
          bracketMatching(),
          highlightActiveLine(),
          javascript({ jsx: true, typescript: true }),
          syntaxHighlighting(themedHighlightStyle),
          editorTheme,
          keymap.of([
            // Before defaultKeymap, which binds Mod-Enter to insertBlankLine.
            { key: "Mod-Enter", preventDefault: true, run: () => { callbacks.current.onRun(); return true; } },
            // Escape, then Tab, leaves the editor (WCAG 2.1.2 No Keyboard Trap).
            { key: "Escape", run: (target) => { simplifySelection(target); return temporarilySetTabFocusMode(target); } },
            ...defaultKeymap,
            ...historyKeymap,
            indentWithTab,
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) callbacks.current.onChange(update.state.doc.toString());
          }),
          EditorView.contentAttributes.of({
            "aria-label": label,
            ...(describedBy ? { "aria-describedby": describedBy } : {}),
            autocapitalize: "off",
            autocorrect: "off",
            spellcheck: "false",
            translate: "no",
          }),
        ],
      }),
    });
    viewRef.current = view;
    onReady?.(performance.now() - started);
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // The editor is created once; label/description changes are not expected during its lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply external changes (Reset) as one undoable transaction. Learner edits already match `value`.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
        selection: { anchor: 0 },
        scrollIntoView: true,
        // A separate, non-joinable history event: one undo restores exactly the code that was replaced.
        annotations: [Transaction.userEvent.of("reset"), isolateHistory.of("full")],
      });
    }
  }, [value]);

  // After the learner interacts with the preview (a separate, out-of-process frame), Firefox 157 can keep focus on the
  // preview iframe when the editor is pressed, and element.focus() alone does not move it. Blur the frame, then focus.
  const ensureFocus = () => {
    requestAnimationFrame(() => {
      const view = viewRef.current;
      if (!view || view.hasFocus) return;
      const active = document.activeElement;
      if (active instanceof HTMLIFrameElement) active.blur();
      view.focus();
    });
  };

  return <div ref={hostRef} data-code-editor="" className="h-full min-h-0" onPointerDown={ensureFocus} />;
}
