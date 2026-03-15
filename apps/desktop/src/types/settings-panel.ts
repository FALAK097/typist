import type { AppSettings, ShortcutSetting, ThemeMode } from "../shared/workspace";

export type SettingsPanelProps = {
  isOpen: boolean;
  settings: AppSettings | null;
  onClose: () => void;
  onChooseFolder: () => void;
  onChangeMode: (mode: ThemeMode) => void;
  onChangeShortcuts: (shortcuts: ShortcutSetting[]) => void;
  onChangeAutoOpenPDF?: (enabled: boolean) => void;
};
