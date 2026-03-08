import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownPreviewProps = {
  content: string;
};

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <section className="panel preview-panel">
      <div className="panel-header">
        <div>
          <p className="panel-label">Preview</p>
          <h2>Rendered Markdown</h2>
        </div>
      </div>
      <article className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "_Nothing to preview yet._"}</ReactMarkdown>
      </article>
    </section>
  );
}
