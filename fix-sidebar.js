const fs = require('fs');
const file = 'apps/desktop/src/components/Sidebar.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add states to Sidebar props
const oldTreeNodeProps = `function TreeNode({
  node,
  activePath,
  depth,
  onOpenFile,
  onDeleteFile,
  onRenameFile
}: {
  node: DirectoryNode;
  activePath: string | null;
  depth: number;
  onOpenFile: (filePath: string) => void;
  onDeleteFile: (filePath: string) => void;
  onRenameFile: (filePath: string, newName: string) => void;
}) {`;

const newTreeNodeProps = `function TreeNode({
  node,
  activePath,
  depth,
  onOpenFile,
  onRequestDelete,
  onRequestRename
}: {
  node: DirectoryNode;
  activePath: string | null;
  depth: number;
  onOpenFile: (filePath: string) => void;
  onRequestDelete: (node: { path: string; name: string }) => void;
  onRequestRename: (node: { path: string; name: string }) => void;
}) {`;
code = code.replace(oldTreeNodeProps, newTreeNodeProps);

// Update recursive call
code = code.replace(
  `            onDeleteFile={onDeleteFile}\n            onRenameFile={onRenameFile}`,
  `            onRequestDelete={onRequestDelete}\n            onRequestRename={onRequestRename}`
);

// Update dropdown menu items
const oldMenu = `<div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg py-1 z-50 min-w-[120px]">
              <button
                className="w-full px-3 py-1.5 text-sm text-left hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  const newName = prompt("Enter new name:", node.name);
                  if (newName && newName !== node.name) {
                    onRenameFile(node.path, newName);
                  }
                  setShowMenu(false);
                }}
              >
                Rename
              </button>
              <button
                className="w-full px-3 py-1.5 text-sm text-left text-red-500 hover:bg-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFile(node.path);
                  setShowMenu(false);
                }}
              >
                Delete
              </button>
            </div>`;

const newMenu = `
              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute left-full top-0 ml-1 bg-popover border border-border rounded-md shadow-lg py-1 z-50 min-w-[140px]">
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestRename({ path: node.path, name: node.name });
                  setShowMenu(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                Rename
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left text-red-500 hover:bg-red-500/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDelete({ path: node.path, name: node.name });
                  setShowMenu(false);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                Delete
              </button>
            </div>`;
code = code.replace(oldMenu, newMenu);

// Now update Sidebar
const oldSidebarExport = `export function Sidebar({`;
const newSidebarExport = `export function Sidebar({`;
// It's already there

const sidebarTop = `  onRenameFile
}: SidebarProps) {
  const workspaceName = getBaseName(rootPath) ?? "Documents / Typist";`;

const newSidebarTop = `  onRenameFile
}: SidebarProps) {
  const workspaceName = getBaseName(rootPath) ?? "Documents / Typist";
  
  const [nodeToRename, setNodeToRename] = useState<{ path: string; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  
  const [nodeToDelete, setNodeToDelete] = useState<{ path: string; name: string } | null>(null);

  const handleRequestRename = (node: { path: string; name: string }) => {
    // Strip extension for nicer editing if it's .md
    const baseName = node.name.replace(/\\.(md|markdown)$/i, "");
    setNodeToRename(node);
    setRenameValue(baseName);
  };

  const handleConfirmRename = () => {
    if (nodeToRename && renameValue.trim() && renameValue !== nodeToRename.name) {
      onRenameFile(nodeToRename.path, renameValue);
    }
    setNodeToRename(null);
  };

  const handleRequestDelete = (node: { path: string; name: string }) => {
    setNodeToDelete(node);
  };

  const handleConfirmDelete = () => {
    if (nodeToDelete) {
      onDeleteFile(nodeToDelete.path);
    }
    setNodeToDelete(null);
  };
`;
code = code.replace(sidebarTop, newSidebarTop);

// Update root tree node calls
code = code.replace(
  `                onDeleteFile={onDeleteFile}\n                onRenameFile={onRenameFile}`,
  `                onRequestDelete={handleRequestDelete}\n                onRequestRename={handleRequestRename}`
);

// Add modal overlays
const oldReturnEnd = `      </div>
    </aside>
  );
}`;

const newReturnEnd = `      </div>

      {nodeToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border shadow-lg rounded-lg p-6 w-[400px] max-w-[90vw]">
            <h2 className="text-lg font-semibold mb-4">Rename Note</h2>
            <input
              type="text"
              autoFocus
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmRename();
                if (e.key === 'Escape') setNodeToRename(null);
              }}
            />
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                onClick={() => setNodeToRename(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                onClick={handleConfirmRename}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {nodeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border shadow-lg rounded-lg p-6 w-[400px] max-w-[90vw]">
            <h2 className="text-lg font-semibold mb-2">Delete Note</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{nodeToDelete.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                onClick={() => setNodeToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}`;

code = code.replace(oldReturnEnd, newReturnEnd);

fs.writeFileSync(file, code);
