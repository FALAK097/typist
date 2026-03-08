import { useEffect, useMemo, useRef } from "react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { marked } from "marked";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

type MarkdownEditorProps = {
  content: string;
  fileName: string | null;
  filePath: string | null;
  saveStateLabel: string;
  themeName: string;
  wordCount: number;
  readingTime: number;
  onChange: (value: string) => void;
};

function getPathLabel(filePath: string | null) {
  if (!filePath) {
    return "Documents / Typist";
  }

  const segments = filePath.split(/[\\/]/);
  return segments.slice(-2).join(" / ");
}

marked.setOptions({
  breaks: true,
  gfm: true
});

const turndown = new TurndownService({
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  headingStyle: "atx",
  hr: "---"
});

turndown.use(gfm);

function markdownToHtml(markdown: string) {
  return marked.parse(markdown) as string;
}

function htmlToMarkdown(html: string) {
  return turndown.turndown(html).replace(/\n{3,}/g, "\n\n").trimEnd();
}

export function MarkdownEditor({
  content,
  fileName,
  filePath,
  saveStateLabel,
  themeName,
  wordCount,
  readingTime,
  onChange
}: MarkdownEditorProps) {
  const lastSyncedMarkdown = useRef(content);
  const initialHtml = useMemo(() => markdownToHtml(content), [content]);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4]
        }
      }),
      Placeholder.configure({
        placeholder: "Start with a title, then let markdown shortcuts shape the page."
      })
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "tiptap-editor",
        spellcheck: "true"
      }
    },
    onUpdate: ({ editor: nextEditor }) => {
      const nextMarkdown = htmlToMarkdown(nextEditor.getHTML());
      lastSyncedMarkdown.current = nextMarkdown;
      onChange(nextMarkdown);
    }
  });

  useEffect(() => {
    if (!editor || content === lastSyncedMarkdown.current) {
      return;
    }

    editor.commands.setContent(markdownToHtml(content), {
      emitUpdate: false
    });
    lastSyncedMarkdown.current = content;
  }, [content, editor]);

  return (
    <section className="editor-shell">
      <div className="editor-topbar">
        <div className="editor-title-block">
          <p className="panel-label">Note</p>
          <h1>{fileName?.replace(/\.(md|markdown)$/i, "") ?? "Untitled"}</h1>
          <p className="editor-subtitle">{getPathLabel(filePath)}</p>
        </div>
        <div className="editor-topbar-meta">
          <p className="editor-status">{saveStateLabel}</p>
          <div className="editor-metrics">
            <span>{wordCount} words</span>
            <span>{readingTime} min read</span>
            <span>{themeName}</span>
          </div>
        </div>
      </div>
      <div className="editor-canvas">
        <EditorContent editor={editor} />
      </div>
    </section>
  );
}
