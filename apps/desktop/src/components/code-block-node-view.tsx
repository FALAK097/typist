import { useRef, type ChangeEvent } from 'react';
import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';

import { SUPPORTED_LANGUAGES } from '@/types/code-block-node-view';

export const CodeBlockNodeView = (props: ReactNodeViewProps) => {
  const { node, updateAttributes, editor } = props;
  const codeRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const language = e.target.value;
    updateAttributes({ language });
  };

  const currentLanguage = (node.attrs.language as string | null) || 'plaintext';
  const isEditing = editor.isActive('codeBlock');

  return (
    <NodeViewWrapper
      as="pre"
      className="relative group hljs my-2 outline-none"
      data-testid="code-block"
    >
      {/* Language selector - ONLY show when editing */}
      {isEditing && (
        <div className="absolute top-2 right-2 z-20">
          <select
            value={currentLanguage}
            onChange={handleLanguageChange}
            onMouseDown={(e) => e.stopPropagation()}
            className="px-2 py-1 text-xs font-medium bg-popover text-popover-foreground border border-border rounded-sm shadow-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='currentColor' d='M2.5 4.5L5 7l2.5-2.5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 4px center',
              backgroundSize: '10px',
              paddingRight: '20px',
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      )}

      <div ref={codeRef} className="hljs-content">
        <NodeViewContent as="div" className="hljs" />
      </div>
    </NodeViewWrapper>
  );
};
