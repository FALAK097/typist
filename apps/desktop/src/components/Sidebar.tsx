import type { DirectoryNode } from "../shared/workspace";

function getBaseName(targetPath: string | null) {
  if (!targetPath) {
    return null;
  }

  return targetPath.split(/[\\/]/).at(-1) ?? targetPath;
}

type SidebarProps = {
  rootPath: string | null;
  tree: DirectoryNode[];
  activePath: string | null;
  recentFiles: string[];
  activeThemeName: string;
  noteCount: number;
  onOpenFile: (filePath: string) => void;
  onCreateNote: () => void;
  onOpenPalette: () => void;
  onOpenSettings: () => void;
};

function TreeNode({
  node,
  activePath,
  depth,
  onOpenFile
}: {
  node: DirectoryNode;
  activePath: string | null;
  depth: number;
  onOpenFile: (filePath: string) => void;
}) {
  if (node.type === "directory") {
    return (
      <div className="sidebar-node">
        <div className="sidebar-directory" style={{ paddingLeft: `${depth * 14 + 18}px` }}>
          <span className="sidebar-directory-icon">▾</span>
          <span>{node.name}</span>
        </div>
        {node.children.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            activePath={activePath}
            depth={depth + 1}
            onOpenFile={onOpenFile}
          />
        ))}
      </div>
    );
  }

  return (
    <button
      className={`sidebar-file ${activePath === node.path ? "is-active" : ""}`}
      style={{ paddingLeft: `${depth * 14 + 18}px` }}
      onClick={() => onOpenFile(node.path)}
      type="button"
    >
      <span>{node.name}</span>
    </button>
  );
}

export function Sidebar({
  rootPath,
  tree,
  activePath,
  recentFiles,
  activeThemeName,
  noteCount,
  onOpenFile,
  onCreateNote,
  onOpenPalette,
  onOpenSettings
}: SidebarProps) {
  const workspaceName = getBaseName(rootPath) ?? "Documents / Typist";

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark" aria-hidden="true">
          <span className="sidebar-brand-dot" />
          <span className="sidebar-brand-dot" />
          <span className="sidebar-brand-dot" />
        </div>
        <p className="sidebar-eyebrow">Workspace</p>
        <h1>Typist</h1>
        <p className="sidebar-caption">{workspaceName}</p>
      </div>

      <div className="sidebar-summary">
        <div className="sidebar-stat">
          <span className="sidebar-stat-value">{noteCount}</span>
          <span className="sidebar-stat-label">notes</span>
        </div>
        <div className="sidebar-stat">
          <span className="sidebar-stat-value">{activeThemeName}</span>
          <span className="sidebar-stat-label">theme</span>
        </div>
      </div>

      <div className="sidebar-actions">
        <button className="sidebar-primary-action" type="button" onClick={onCreateNote}>
          New note
        </button>
        <button className="sidebar-secondary-action" type="button" onClick={onOpenPalette}>
          Open palette
        </button>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-section-title">Recent</p>
        {recentFiles.length === 0 ? (
          <p className="sidebar-empty">Recently opened notes will appear here.</p>
        ) : (
          recentFiles.map((filePath) => (
            <button key={filePath} className="sidebar-file recent" type="button" onClick={() => onOpenFile(filePath)}>
              <span>{getBaseName(filePath)}</span>
            </button>
          ))
        )}
      </div>

      <div className="sidebar-section sidebar-tree">
        <p className="sidebar-section-title">Notes</p>
        {tree.length === 0 ? (
          <p className="sidebar-empty">Create your first note from the command palette.</p>
        ) : (
          tree.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              activePath={activePath}
              depth={0}
              onOpenFile={onOpenFile}
            />
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button className="settings-launcher" type="button" onClick={onOpenSettings}>
          Settings
        </button>
      </div>
    </aside>
  );
}
