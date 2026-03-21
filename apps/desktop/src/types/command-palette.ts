export type CommandPaletteScope = "all" | "notes" | "content" | "headings" | "actions";

export type CommandPaletteItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: string;
  shortcut?: string;
  section: string;
  kind: "action" | "note" | "heading" | "match";
  onSelect: () => void;
  onPreview?: () => void;
};

export type CommandPaletteProps = {
  isOpen: boolean;
  isSearching: boolean;
  query: string;
  scope: CommandPaletteScope;
  items: CommandPaletteItem[];
  selectedIndex: number;
  onChangeQuery: (value: string) => void;
  onChangeScope: (scope: CommandPaletteScope) => void;
  onCycleScope: (direction: 1 | -1) => void;
  onClose: () => void;
  onHoverItem: (index: number) => void;
  onMove: (direction: 1 | -1) => void;
  onSelect: () => void;
};
