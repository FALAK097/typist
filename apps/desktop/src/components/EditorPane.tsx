import { useRef } from "react";

type EditorPaneProps = {
  content: string;
  path: string | null;
  isDirty: boolean;
  isSaving: boolean;
  saveStateLabel: string;
  onChange: (value: string) => void;
  onSave: () => void;
};

type ToolbarAction = {
  label: string;
  insert: (selected: string) => string;
};

const toolbarActions: ToolbarAction[] = [
  { label: "H1", insert: (selected) => `# ${selected || "Heading"}` },
  { label: "Bold", insert: (selected) => `**${selected || "bold text"}**` },
  { label: "Italic", insert: (selected) => `*${selected || "italic text"}*` },
  { label: "Link", insert: (selected) => `[${selected || "link text"}](https://example.com)` },
  { label: "Code", insert: (selected) => (selected.includes("\n") ? `\`\`\`\n${selected}\n\`\`\`` : `\`${selected || "code"}\``) },
  { label: "Task", insert: (selected) => `- [ ] ${selected || "todo"}` },
  { label: "Quote", insert: (selected) => `> ${selected || "Quote"}` },
  { label: "Rule", insert: () => "\n---\n" }
];

export function EditorPane({
  content,
  path,
  isDirty,
  isSaving,
  saveStateLabel,
  onChange,
  onSave
}: EditorPaneProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const applyToolbarAction = (action: ToolbarAction) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.slice(0, start);
    const selected = content.slice(start, end);
    const after = content.slice(end);
    const inserted = action.insert(selected);

    onChange(`${before}${inserted}${after}`);

    requestAnimationFrame(() => {
      const nextCaret = start + inserted.length;
      textarea.focus();
      textarea.setSelectionRange(nextCaret, nextCaret);
    });
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-label">Editor</p>
          <h2>{path?.split("/").at(-1) ?? "No file selected"}</h2>
          <p className="panel-meta">{saveStateLabel}</p>
        </div>
        <button className="primary-button" onClick={onSave} type="button" disabled={!path || !isDirty || isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
      <div className="editor-toolbar">
        {toolbarActions.map((action) => (
          <button
            key={action.label}
            className="toolbar-button"
            type="button"
            disabled={!path}
            onClick={() => applyToolbarAction(action)}
          >
            {action.label}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={content}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Open a markdown file to start writing."
        spellCheck={false}
      />
    </section>
  );
}
