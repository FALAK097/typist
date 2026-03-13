import type { ShortcutSetting } from "./workspace.js";

export type ShortcutId =
  | "command-palette"
  | "new-note"
  | "open-file"
  | "open-folder"
  | "save"
  | "settings"
  | "previous-note"
  | "next-note"
  | "toggle-sidebar"
  | "navigate-back"
  | "navigate-forward"
  // Editor formatting shortcuts
  | "editor-h1"
  | "editor-h2"
  | "editor-h3"
  | "editor-bullet"
  | "editor-ordered"
  | "editor-quote"
  | "editor-codeblock"
  | "editor-bold"
  | "editor-italic"
  | "editor-strike"
  | "editor-inlinecode"
  | "editor-link";

export type ShortcutGroup = "app" | "editor";

export type ShortcutDefinition = ShortcutSetting & {
  id: ShortcutId;
  label: string;
  group: ShortcutGroup;
};

type ParsedShortcut = {
  primary: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
};

export type ShortcutEventLike = {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  repeat?: boolean;
};

export const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  // App shortcuts
  { id: "command-palette", label: "Command Palette", keys: "⌘ P", group: "app" },
  { id: "new-note", label: "New Note", keys: "⌘ N", group: "app" },
  { id: "open-file", label: "Open File", keys: "⌘ O", group: "app" },
  { id: "open-folder", label: "Open Folder", keys: "⇧ ⌘ O", group: "app" },
  { id: "save", label: "Save", keys: "⌘ S", group: "app" },
  { id: "settings", label: "Settings", keys: "⌘ ,", group: "app" },
  { id: "previous-note", label: "Previous Note", keys: "⌥ ↑", group: "app" },
  { id: "next-note", label: "Next Note", keys: "⌥ ↓", group: "app" },
  { id: "toggle-sidebar", label: "Toggle Sidebar", keys: "⇧ ⌘ \\", group: "app" },
  { id: "navigate-back", label: "Navigate Back", keys: "⌘ [", group: "app" },
  { id: "navigate-forward", label: "Navigate Forward", keys: "⌘ ]", group: "app" },
  // Editor shortcuts
  { id: "editor-h1", label: "Heading 1", keys: "⌘ ⌥ 1", group: "editor" },
  { id: "editor-h2", label: "Heading 2", keys: "⌘ ⌥ 2", group: "editor" },
  { id: "editor-h3", label: "Heading 3", keys: "⌘ ⌥ 3", group: "editor" },
  { id: "editor-bullet", label: "Bullet List", keys: "⌘ ⇧ 8", group: "editor" },
  { id: "editor-ordered", label: "Numbered List", keys: "⌘ ⇧ 7", group: "editor" },
  { id: "editor-quote", label: "Quote", keys: "⌘ ⇧ .", group: "editor" },
  { id: "editor-codeblock", label: "Code Block", keys: "⌘ ⌥ C", group: "editor" },
  { id: "editor-bold", label: "Bold", keys: "⌘ B", group: "editor" },
  { id: "editor-italic", label: "Italic", keys: "⌘ I", group: "editor" },
  { id: "editor-strike", label: "Strikethrough", keys: "⌘ ⇧ X", group: "editor" },
  { id: "editor-inlinecode", label: "Inline Code", keys: "⌘ E", group: "editor" },
  { id: "editor-link", label: "Link", keys: "⌘ K", group: "editor" },
];

const MODIFIER_TOKENS = new Set(["⌘", "⌥", "⇧"]);

const NORMALIZED_KEY_ALIASES: Record<string, string> = {
  up: "arrowup",
  arrowup: "arrowup",
  "↑": "arrowup",
  down: "arrowdown",
  arrowdown: "arrowdown",
  "↓": "arrowdown",
  left: "arrowleft",
  arrowleft: "arrowleft",
  "←": "arrowleft",
  right: "arrowright",
  arrowright: "arrowright",
  "→": "arrowright",
  space: " ",
  comma: ",",
  esc: "escape",
  escape: "escape",
  enter: "enter",
  return: "enter",
  tab: "tab",
  backspace: "backspace",
  delete: "delete"
};

const DISPLAY_KEY_ALIASES: Record<string, string> = {
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  " ": "Space",
  escape: "Esc",
  enter: "Enter",
  tab: "Tab",
  backspace: "Backspace",
  delete: "Delete"
};

const ELECTRON_KEY_ALIASES: Record<string, string> = {
  arrowup: "Up",
  arrowdown: "Down",
  arrowleft: "Left",
  arrowright: "Right",
  " ": "Space",
  ",": "Comma",
  escape: "Escape",
  enter: "Enter",
  tab: "Tab",
  backspace: "Backspace",
  delete: "Delete",
  "/": "Slash",
  "\\": "Backslash",
  ".": "Period"
};

function normalizeShortcutKeyToken(token: string): string | null {
  const trimmed = token.trim();

  if (!trimmed || MODIFIER_TOKENS.has(trimmed)) {
    return null;
  }

  const lower = trimmed.toLowerCase();
  if (NORMALIZED_KEY_ALIASES[lower]) {
    return NORMALIZED_KEY_ALIASES[lower];
  }

  if (trimmed.length === 1) {
    return lower;
  }

  return lower;
}

function formatShortcutKey(key: string): string {
  if (DISPLAY_KEY_ALIASES[key]) {
    return DISPLAY_KEY_ALIASES[key];
  }

  return key.length === 1 ? key.toUpperCase() : key;
}

export function parseShortcut(keys: string): ParsedShortcut | null {
  const parts = keys.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return null;
  }

  let key: string | null = null;
  for (const part of parts) {
    const normalized = normalizeShortcutKeyToken(part);
    if (normalized) {
      key = normalized;
    }
  }

  if (!key) {
    return null;
  }

  return {
    primary: parts.includes("⌘"),
    alt: parts.includes("⌥"),
    shift: parts.includes("⇧"),
    key
  };
}

export function canonicalizeShortcut(keys: string): string | null {
  const parsed = parseShortcut(keys);
  if (!parsed) {
    return null;
  }

  const parts: string[] = [];
  if (parsed.shift) {
    parts.push("⇧");
  }
  if (parsed.alt) {
    parts.push("⌥");
  }
  if (parsed.primary) {
    parts.push("⌘");
  }
  parts.push(formatShortcutKey(parsed.key));

  return parts.join(" ");
}

export function mergeShortcutSettings(shortcuts?: ShortcutSetting[] | null): ShortcutDefinition[] {
  const saved = new Map(
    (shortcuts ?? [])
      .filter((shortcut): shortcut is ShortcutSetting => typeof shortcut?.id === "string" && typeof shortcut?.keys === "string")
      .map((shortcut) => [shortcut.id, canonicalizeShortcut(shortcut.keys) ?? shortcut.keys.trim()])
  );

  return DEFAULT_SHORTCUTS.map((shortcut) => ({
    ...shortcut,
    keys: saved.get(shortcut.id) ?? shortcut.keys
  }));
}

export function getShortcutKeys(shortcuts: ShortcutSetting[] | undefined | null, id: ShortcutId): string | undefined {
  return mergeShortcutSettings(shortcuts).find((shortcut) => shortcut.id === id)?.keys;
}

export function getShortcutDisplay(shortcuts: ShortcutSetting[] | undefined | null, id: ShortcutId): string | undefined {
  const keys = getShortcutKeys(shortcuts, id);
  return keys?.replace(/\s+/g, "");
}

export function matchShortcut(event: ShortcutEventLike, shortcut: string): boolean {
  if (event.repeat) {
    return false;
  }

  const parsed = parseShortcut(shortcut);
  if (!parsed) {
    return false;
  }

  const eventKey = normalizeShortcutKeyToken(event.key);
  const primaryPressed = event.metaKey !== event.ctrlKey && (event.metaKey || event.ctrlKey);

  return (
    eventKey === parsed.key &&
    primaryPressed === parsed.primary &&
    event.altKey === parsed.alt &&
    event.shiftKey === parsed.shift
  );
}

export function toElectronAccelerator(shortcut: string): string | undefined {
  const parsed = parseShortcut(shortcut);
  if (!parsed) {
    return undefined;
  }

  const parts: string[] = [];
  if (parsed.primary) {
    parts.push("CmdOrCtrl");
  }
  if (parsed.alt) {
    parts.push("Alt");
  }
  if (parsed.shift) {
    parts.push("Shift");
  }

  const key = ELECTRON_KEY_ALIASES[parsed.key] ?? (parsed.key.length === 1 ? parsed.key.toUpperCase() : parsed.key);
  parts.push(key);

  return parts.join("+");
}
