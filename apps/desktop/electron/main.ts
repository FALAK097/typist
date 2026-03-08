import { app, BrowserWindow, dialog, ipcMain, Menu } from "electron";
import { watch } from "chokidar";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AppCommand, DirectoryNode, FileOpenResult, WorkspaceSnapshot } from "../src/shared/workspace.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;
let activeWatcher: ReturnType<typeof watch> | null = null;
let activeWorkspaceRoot: string | null = null;

function isMarkdownFile(fileName: string) {
  return fileName.endsWith(".md") || fileName.endsWith(".markdown");
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 980,
    minHeight: 700,
    titleBarStyle: "hiddenInset",
    backgroundColor: "#f5f2eb",
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  if (isDev) {
    await mainWindow.loadURL("http://127.0.0.1:5173");
  } else {
    await mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "New File",
          accelerator: "CmdOrCtrl+N",
          click: () => {
            mainWindow?.webContents.send("app:command", "new-file" satisfies AppCommand);
          }
        },
        {
          label: "New Folder",
          accelerator: "CmdOrCtrl+Shift+N",
          click: () => {
            mainWindow?.webContents.send("app:command", "new-folder" satisfies AppCommand);
          }
        },
        { type: "separator" },
        {
          label: "Open File",
          accelerator: "CmdOrCtrl+O",
          click: () => {
            mainWindow?.webContents.send("app:command", "open-file" satisfies AppCommand);
          }
        },
        {
          label: "Open Folder",
          accelerator: "CmdOrCtrl+Shift+O",
          click: () => {
            mainWindow?.webContents.send("app:command", "open-folder" satisfies AppCommand);
          }
        },
        { type: "separator" },
        {
          label: "Save",
          accelerator: "CmdOrCtrl+S",
          click: () => {
            mainWindow?.webContents.send("app:command", "save" satisfies AppCommand);
          }
        }
      ]
    },
    {
      label: "View",
      submenu: [{ role: "reload" }, { role: "toggleDevTools" }]
    }
  ]);

  Menu.setApplicationMenu(menu);
}

async function readMarkdownFile(filePath: string) {
  const content = await fs.readFile(filePath, "utf8");
  return {
    path: filePath,
    name: path.basename(filePath),
    content
  };
}

async function buildDirectoryTree(dirPath: string): Promise<DirectoryNode[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const sorted = entries.sort((left, right) => {
    if (left.isDirectory() && !right.isDirectory()) {
      return -1;
    }
    if (!left.isDirectory() && right.isDirectory()) {
      return 1;
    }
    return left.name.localeCompare(right.name);
  });

  const nodes = await Promise.all(
    sorted
      .filter((entry) => entry.isDirectory() || isMarkdownFile(entry.name))
      .map(async (entry) => {
        const entryPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          return {
            type: "directory" as const,
            name: entry.name,
            path: entryPath,
            children: await buildDirectoryTree(entryPath)
          };
        }

        return {
          type: "file" as const,
          name: entry.name,
          path: entryPath
        };
      })
  );

  return nodes;
}

async function collectMarkdownFiles(nodes: DirectoryNode[]): Promise<string[]> {
  const paths: string[] = [];

  for (const node of nodes) {
    if (node.type === "file") {
      paths.push(node.path);
      continue;
    }

    paths.push(...(await collectMarkdownFiles(node.children)));
  }

  return paths;
}

async function openWorkspace(dirPath: string): Promise<WorkspaceSnapshot> {
  activeWorkspaceRoot = dirPath;
  const tree = await buildDirectoryTree(dirPath);
  const files = await collectMarkdownFiles(tree);
  const activeFilePath = files[0] ?? null;
  const activeFile = activeFilePath ? await readMarkdownFile(activeFilePath) : null;

  if (activeWatcher) {
    await activeWatcher.close();
  }

  activeWatcher = watch(dirPath, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 150,
      pollInterval: 50
    }
  });

  activeWatcher.on("all", async (_eventName, changedPath) => {
    if (!mainWindow) {
      return;
    }

    if (!isMarkdownFile(changedPath)) {
      return;
    }

    const nextTree = await buildDirectoryTree(dirPath);
    mainWindow.webContents.send("workspace:changed", {
      rootPath: dirPath,
      tree: nextTree,
      changedPath
    });
  });

  return {
    rootPath: dirPath,
    tree,
    activeFile
  };
}

async function showOpenDialog(kind: "file" | "directory"): Promise<FileOpenResult | null> {
  const properties: Array<"openFile" | "openDirectory" | "createDirectory"> =
    kind === "file" ? ["openFile"] : ["openDirectory", "createDirectory"];

  const result = await dialog.showOpenDialog({
    properties,
    filters:
      kind === "file"
        ? [{ name: "Markdown", extensions: ["md", "markdown"] }]
        : undefined
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return {
    kind,
    path: result.filePaths[0]
  };
}

ipcMain.handle("dialog:open", async (_event, kind: "file" | "directory") =>
  showOpenDialog(kind)
);

ipcMain.handle("workspace:openFolder", async (_event, dirPath?: string) => {
  let resolvedPath = dirPath;

  if (!resolvedPath) {
    const selection = await showOpenDialog("directory");
    resolvedPath = selection?.path;
  }

  if (!resolvedPath) {
    return null;
  }

  return openWorkspace(resolvedPath);
});

ipcMain.handle("workspace:openFile", async (_event, filePath: string) =>
  readMarkdownFile(filePath)
);

ipcMain.handle("workspace:saveFile", async (_event, filePath: string, content: string) => {
  await fs.writeFile(filePath, content, "utf8");
  return readMarkdownFile(filePath);
});

ipcMain.handle("workspace:createFile", async (_event, parentDir: string, fileName: string) => {
  const normalizedFileName = fileName.endsWith(".md") ? fileName : `${fileName}.md`;
  const targetPath = path.join(parentDir, normalizedFileName);
  await fs.writeFile(targetPath, "", { flag: "wx" });
  return readMarkdownFile(targetPath);
});

ipcMain.handle("workspace:createFolder", async (_event, parentDir: string, folderName: string) => {
  await fs.mkdir(path.join(parentDir, folderName), { recursive: false });

  if (!activeWorkspaceRoot) {
    return [];
  }

  return buildDirectoryTree(activeWorkspaceRoot);
});

ipcMain.handle("workspace:openDocument", async (_event) => {
  const selection = await showOpenDialog("file");

  if (!selection) {
    return null;
  }

  return readMarkdownFile(selection.path);
});

app.whenReady().then(createWindow);

app.on("window-all-closed", async () => {
  if (activeWatcher) {
    await activeWatcher.close();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});
