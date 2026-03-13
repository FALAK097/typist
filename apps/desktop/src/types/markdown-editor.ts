import type { ShortcutSetting } from "../shared/workspace";

export type MarkdownEditorProps = {
  content: string;
  fileName: string | null;
  filePath: string | null;
  saveStateLabel: string;
  wordCount: number;
  readingTime: number;
  onChange: (value: string) => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  onCreateNote?: () => void;
  toggleSidebarShortcut?: string;
  newNoteShortcut?: string;
  onOpenSettings?: () => void;
  onOpenCommandPalette?: () => void;
  commandPaletteShortcut?: string;
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  autoOpenPDFSetting?: boolean;
  editorShortcuts?: ShortcutSetting[] | null;
};

export type MarkdownEditorToast = {
  title: string;
  description: string;
};
