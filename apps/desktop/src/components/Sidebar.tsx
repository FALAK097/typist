import type { DirectoryNode } from "../shared/workspace";

type SidebarProps = {
  rootPath: string | null;
  tree: DirectoryNode[];
  activePath: string | null;
  onOpenFile: (filePath: string) => void;
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
        <div className="sidebar-directory" style={{ paddingLeft: `${depth * 14 + 14}px` }}>
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
      style={{ paddingLeft: `${depth * 14 + 14}px` }}
      onClick={() => onOpenFile(node.path)}
      type="button"
    >
      <span className="sidebar-file-icon">#</span>
      <span>{node.name}</span>
    </button>
  );
}

export function Sidebar({ rootPath, tree, activePath, onOpenFile }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <p className="sidebar-eyebrow">Workspace</p>
        <h1>{rootPath ? rootPath.split("/").at(-1) : "Typist"}</h1>
      </div>
      <div className="sidebar-tree">
        {tree.length === 0 ? (
          <p className="sidebar-empty">Open a folder to browse Markdown notes.</p>
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
    </aside>
  );
}
