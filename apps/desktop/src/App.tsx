import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { CommandPalette } from "./components/CommandPalette";
import { MarkdownEditor } from "./components/MarkdownEditor";
import { SettingsPanel } from "./components/SettingsPanel";
import { Sidebar } from "./components/Sidebar";
import type { AppSettings, DirectoryNode, SearchResult, ThemeMode } from "./shared/workspace";
import { useWorkspaceStore } from "./store/workspace";
import { applyTheme, themes } from "./theme/themes";

type PaletteItem = {
  id: string;
  title: string;
  subtitle?: string;
  hint?: string;
  shortcut?: string;
  section: string;
  kind: "command" | "file" | "theme";
  onSelect: () => void;
  onPreview?: () => void;
};

type FlatFile = {
  path: string;
  name: string;
  relativePath: string;
};

function normalizePath(filePath: string) {
  return filePath.replace(/\\/g, "/");
}

function getRelativePath(filePath: string, rootPath: string | null) {
  if (!rootPath) {
    return filePath.split(/[\\/]/).at(-1) ?? filePath;
  }

  const normalizedFilePath = normalizePath(filePath);
  const normalizedRootPath = normalizePath(rootPath).replace(/\/+$/, "");

  if (normalizedFilePath.startsWith(`${normalizedRootPath}/`)) {
    return normalizedFilePath.slice(normalizedRootPath.length + 1);
  }

  return normalizedFilePath.split("/").at(-1) ?? normalizedFilePath;
}

function isFileInsideWorkspace(filePath: string, rootPath: string | null) {
  if (!rootPath) {
    return false;
  }

  const normalizedFilePath = normalizePath(filePath);
  const normalizedRootPath = normalizePath(rootPath).replace(/\/+$/, "");
  return normalizedFilePath.startsWith(`${normalizedRootPath}/`);
}

function flattenFiles(nodes: DirectoryNode[], rootPath: string | null): FlatFile[] {
  const items: FlatFile[] = [];

  for (const node of nodes) {
    if (node.type === "file") {
      items.push({
        path: node.path,
        name: node.name,
        relativePath: getRelativePath(node.path, rootPath)
      });
      continue;
    }

    items.push(...flattenFiles(node.children, rootPath));
  }

  return items;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

export function App() {
  const typist = window.typist;

  if (!typist) {
    return (
      <main className="boot-error-shell">
        <section className="boot-error-card">
          <p className="panel-label">Renderer Boot Error</p>
          <h1>Typist could not connect to the Electron preload API.</h1>
          <p>Check the terminal for preload errors, then restart `pnpm dev:desktop`.</p>
        </section>
      </main>
    );
  }

  return <DesktopApp typist={typist} />;
}

function DesktopApp({ typist }: { typist: NonNullable<Window["typist"]> }) {
  const {
    rootPath,
    tree,
    activeFile,
    draftContent,
    isDirty,
    isSaving,
    lastSavedAt,
    error,
    setWorkspace,
    setTree,
    setActiveFile,
    updateDraftContent,
    markSaved,
    setSaving,
    setError
  } = useWorkspaceStore();

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [isWorkspaceMode, setIsWorkspaceMode] = useState(true);
  const deferredPaletteQuery = useDeferredValue(paletteQuery);

  const files = useMemo(() => flattenFiles(tree, rootPath), [rootPath, tree]);
  const wordCount = useMemo(() => {
    const text = draftContent.trim();
    return text ? text.split(/\s+/).length : 0;
  }, [draftContent]);
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  const activeTheme = useMemo(
    () => themes.find((theme) => theme.id === (previewTheme ?? settings?.themeId)) ?? themes[0],
    [previewTheme, settings?.themeId]
  );

  useEffect(() => {
    const boot = async () => {
      const nextSettings = await typist.getSettings();
      setSettings(nextSettings);
      applyTheme(nextSettings.themeId, nextSettings.themeMode);

      const workspace = await typist.openDefaultWorkspace();
      if (workspace) {
        setWorkspace(workspace);
        setIsWorkspaceMode(true);
      }
    };

    void boot();
  }, [setWorkspace, typist]);

  useEffect(() => {
    return typist.onWorkspaceChanged(async ({ tree: nextTree, changedPath }) => {
      setTree(nextTree);

      if (changedPath === activeFile?.path && !isDirty) {
        const refreshedFile = await typist.readFile(changedPath);
        setActiveFile(refreshedFile);
      }
    });
  }, [activeFile?.path, isDirty, setActiveFile, setTree, typist]);

  useEffect(() => {
    if (!activeFile || !isDirty || isSaving) {
      return;
    }

    const timer = window.setTimeout(async () => {
      setSaving(true);
      try {
        const savedFile = await typist.saveFile(activeFile.path, draftContent);
        markSaved(savedFile);
      } catch (saveError) {
        setSaving(false);
        setError(saveError instanceof Error ? saveError.message : "Unable to save file.");
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [activeFile?.path, draftContent, isDirty, isSaving, markSaved, setError, setSaving, typist]);

  useEffect(() => {
    if (!isPaletteOpen) {
      setSearchResults([]);
      return;
    }

    const query = deferredPaletteQuery.trim().toLowerCase();

    if (!isWorkspaceMode || !query || query.startsWith("theme")) {
      setSearchResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      const results = await typist.searchWorkspace(query);
      setSearchResults(results);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [deferredPaletteQuery, isPaletteOpen, isWorkspaceMode, typist]);

  useEffect(() => {
    if (!settings) {
      return;
    }

    if (previewTheme) {
      applyTheme(previewTheme, settings.themeMode);
      return;
    }

    applyTheme(settings.themeId, settings.themeMode);
  }, [previewTheme, settings]);

  const saveSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const next = await typist.updateSettings(patch);
    setSettings(next);
    return next;
  }, [typist]);

  const openFile = useCallback(async (filePath: string) => {
    const file = await typist.readFile(filePath);
    setActiveFile(file);
    setIsWorkspaceMode(isFileInsideWorkspace(file.path, rootPath));
    const nextSettings = await typist.getSettings();
    setSettings(nextSettings);
    setIsPaletteOpen(false);
  }, [rootPath, setActiveFile, typist]);

  const createNote = useCallback(async () => {
    const baseDir = isWorkspaceMode ? rootPath : settings?.defaultWorkspacePath ?? null;

    if (!baseDir) {
      return;
    }

    const file = await typist.createFile(baseDir, `note-${Date.now()}.md`);
    setActiveFile(file);
    setIsWorkspaceMode(true);
    const nextSettings = await typist.getSettings();
    setSettings(nextSettings);
    setIsPaletteOpen(false);
  }, [isWorkspaceMode, rootPath, setActiveFile, settings?.defaultWorkspacePath, typist]);

  const currentFileIndex = files.findIndex((item) => item.path === activeFile?.path);

  const moveNote = useCallback(async (direction: 1 | -1) => {
    if (currentFileIndex === -1 || files.length === 0) {
      return;
    }

    const nextIndex = (currentFileIndex + direction + files.length) % files.length;
    await openFile(files[nextIndex].path);
  }, [currentFileIndex, files, openFile]);

  const cycleTheme = useCallback(async () => {
    if (!settings) {
      return;
    }

    const currentIndex = themes.findIndex((theme) => theme.id === settings.themeId);
    const nextTheme = themes[(currentIndex + 1 + themes.length) % themes.length];
    await saveSettings({ themeId: nextTheme.id });
  }, [saveSettings, settings]);

  const paletteItems = useMemo<PaletteItem[]>(() => {
    const query = paletteQuery.trim().toLowerCase();
    const items: PaletteItem[] = [];

    if (!query) {
      items.push(
        {
          id: "new-note",
          title: "New note",
          subtitle: "Create a fresh markdown note in your workspace",
          hint: "Action",
          shortcut: "Cmd N",
          section: "Actions",
          kind: "command",
          onSelect: () => void createNote()
        },
        {
          id: "previous-note",
          title: "Previous note",
          subtitle: "Jump to the note just before the current one",
          hint: "Navigate",
          shortcut: "Ctrl Shift [",
          section: "Actions",
          kind: "command",
          onSelect: () => void moveNote(-1)
        },
        {
          id: "next-note",
          title: "Next note",
          subtitle: "Move forward through notes in the workspace",
          hint: "Navigate",
          shortcut: "Ctrl Shift ]",
          section: "Actions",
          kind: "command",
          onSelect: () => void moveNote(1)
        },
        {
          id: "settings",
          title: "Settings",
          subtitle: "Adjust workspace defaults and visual themes",
          hint: "Panel",
          shortcut: "Cmd ,",
          section: "Actions",
          kind: "command",
          onSelect: () => {
            setIsSettingsOpen(true);
            setIsPaletteOpen(false);
          }
        }
      );
    }

    if (query.includes("theme") || query.includes("aura") || query.includes("night") || query.includes("ayu") || query.includes("forest")) {
      items.push({
        id: "cycle-theme",
        title: "Cycle theme",
        subtitle: "Move to the next theme family",
        hint: "Theme",
        shortcut: "Shift T",
        section: "Themes",
        kind: "command",
        onSelect: () => void cycleTheme()
      });

      themes.forEach((theme) => {
        const modeLabel = settings?.themeMode ?? "light";
        items.push({
          id: `theme-${theme.id}`,
          title: `Use theme: ${theme.name}`,
          subtitle: `${modeLabel}:${theme.id}`,
          hint: "Preview",
          section: "Themes",
          kind: "theme",
          onPreview: () => setPreviewTheme(theme.id),
          onSelect: async () => {
            setPreviewTheme(null);
            await saveSettings({ themeId: theme.id });
            setIsPaletteOpen(false);
          }
        });
      });
    }

    const matchingFiles = files.filter((file) => {
      if (!query) {
        return false;
      }

      return `${file.name} ${file.relativePath}`.toLowerCase().includes(query);
    });

    matchingFiles.slice(0, 12).forEach((file) => {
      items.push({
        id: file.path,
        title: file.name,
        subtitle: file.relativePath,
        hint: "File",
        section: "Files",
        kind: "file",
        onSelect: () => void openFile(file.path)
      });
    });

    searchResults.slice(0, 8).forEach((result) => {
      items.push({
        id: `search-${result.path}-${result.line}`,
        title: result.name,
        subtitle: `${result.snippet} · line ${result.line}`,
        hint: "Match",
        section: "Matches",
        kind: "file",
        onSelect: () => void openFile(result.path)
      });
    });

    return items;
  }, [createNote, cycleTheme, files, moveNote, openFile, paletteQuery, saveSettings, searchResults, settings]);

  useEffect(() => {
    if (!isPaletteOpen) {
      setPreviewTheme(null);
      setPaletteQuery("");
      setSelectedIndex(0);
      return;
    }

    setSelectedIndex(0);
  }, [isPaletteOpen]);

  useEffect(() => {
    const candidate = paletteItems[selectedIndex];
    candidate?.onPreview?.();
  }, [paletteItems, selectedIndex]);

  useEffect(() => {
    const onKeyDown = async (event: KeyboardEvent) => {
      const modifier = event.metaKey || event.ctrlKey;

      if (event.key === "Escape") {
        setIsPaletteOpen(false);
        setIsSettingsOpen(false);
        setPreviewTheme(null);
        return;
      }

      if (modifier && event.key.toLowerCase() === "p") {
        event.preventDefault();
        setIsPaletteOpen((value) => !value);
        return;
      }

      if (modifier && event.key === ",") {
        event.preventDefault();
        setIsSettingsOpen((value) => !value);
        return;
      }

      if (event.shiftKey && !modifier && event.key.toLowerCase() === "t") {
        event.preventDefault();
        void cycleTheme();
        return;
      }

      if (event.ctrlKey && event.shiftKey && event.key === "[") {
        event.preventDefault();
        void moveNote(-1);
        return;
      }

      if (event.ctrlKey && event.shiftKey && event.key === "]") {
        event.preventDefault();
        void moveNote(1);
        return;
      }

      if (modifier && event.key.toLowerCase() === "s" && activeFile) {
        event.preventDefault();
        setSaving(true);
        try {
          const savedFile = await typist.saveFile(activeFile.path, draftContent);
          markSaved(savedFile);
        } catch (saveError) {
          console.error("Manual save failed:", saveError);
          setError(getErrorMessage(saveError));
        } finally {
          setSaving(false);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeFile, draftContent, markSaved, setError, setSaving, typist]);

  useEffect(() => {
    return typist.onCommand(async (command) => {
      if (command === "quick-open") {
        setIsPaletteOpen(true);
        return;
      }

      if (command === "new-file") {
        await createNote();
        return;
      }

      if (command === "open-file") {
        const file = await typist.openDocument();
        if (file) {
          setActiveFile(file);
          setIsWorkspaceMode(false);
        }
        return;
      }

      if (command === "open-folder") {
        const workspace = await typist.openFolder();
        if (workspace) {
          setWorkspace(workspace);
          setIsWorkspaceMode(true);
        }
        return;
      }

      if (command === "save" && activeFile) {
        setSaving(true);
        try {
          const savedFile = await typist.saveFile(activeFile.path, draftContent);
          markSaved(savedFile);
        } catch (saveError) {
          console.error("Menu save failed:", saveError);
          setError(getErrorMessage(saveError));
        } finally {
          setSaving(false);
        }
      }
    });
  }, [activeFile, createNote, draftContent, markSaved, setActiveFile, setError, setSaving, setWorkspace, typist]);

  const saveStateLabel = isSaving
    ? "Saving..."
    : isDirty
      ? "Unsaved"
      : lastSavedAt
        ? `Saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
        : "Ready";

  return (
    <div className="app-shell">
      <Sidebar
        rootPath={rootPath}
        tree={tree}
        activePath={activeFile?.path ?? null}
        recentFiles={settings?.recentFiles ?? []}
        activeThemeName={activeTheme.name}
        noteCount={files.length}
        onOpenFile={(filePath) => void openFile(filePath)}
        onCreateNote={() => void createNote()}
        onOpenPalette={() => setIsPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      <main className="workspace-shell single-pane">
        {error ? <div className="error-banner">{error}</div> : null}
        <MarkdownEditor
          content={draftContent}
          fileName={activeFile?.name ?? null}
          filePath={activeFile?.path ?? null}
          saveStateLabel={saveStateLabel}
          themeName={activeTheme.name}
          wordCount={wordCount}
          readingTime={readingTime}
          onChange={updateDraftContent}
        />
      </main>
      <CommandPalette
        isOpen={isPaletteOpen}
        query={paletteQuery}
        items={paletteItems}
        selectedIndex={selectedIndex}
        onChangeQuery={setPaletteQuery}
        onClose={() => {
          setIsPaletteOpen(false);
          setPreviewTheme(null);
        }}
        onHoverItem={setSelectedIndex}
        onMove={(direction) => {
          if (paletteItems.length === 0) {
            return;
          }

          setSelectedIndex((value) => (value + direction + paletteItems.length) % paletteItems.length);
        }}
        onSelect={() => paletteItems[selectedIndex]?.onSelect()}
      />
      <SettingsPanel
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onChooseFolder={async () => {
          const selection = await typist.openDialog("directory");
          if (!selection) {
            return;
          }

          const nextSettings = await saveSettings({ defaultWorkspacePath: selection.path });
          const workspace = await typist.openFolder(nextSettings.defaultWorkspacePath);
          if (workspace) {
            setWorkspace(workspace);
            setIsWorkspaceMode(true);
          }
        }}
        onChangeMode={async (mode: ThemeMode) => {
          await saveSettings({ themeMode: mode });
        }}
        onChangeTheme={async (themeId) => {
          await saveSettings({ themeId });
        }}
      />
    </div>
  );
}
