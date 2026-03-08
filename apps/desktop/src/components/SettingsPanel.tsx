import type { AppSettings, ThemeMode } from "../shared/workspace";
import { themes } from "../theme/themes";

type SettingsPanelProps = {
  isOpen: boolean;
  settings: AppSettings | null;
  onClose: () => void;
  onChooseFolder: () => void;
  onChangeMode: (mode: ThemeMode) => void;
  onChangeTheme: (themeId: string) => void;
};

export function SettingsPanel({
  isOpen,
  settings,
  onClose,
  onChooseFolder,
  onChangeMode,
  onChangeTheme
}: SettingsPanelProps) {
  if (!isOpen || !settings) {
    return null;
  }

  return (
    <section className="modal-shell" role="presentation" onMouseDown={onClose}>
      <div
        className="modal-card settings-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <p className="panel-label">Settings</p>
            <h2 id="settings-dialog-title">Workspace and appearance</h2>
            <p className="settings-description">Tune the space so Typist feels like a focused writing desk.</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close settings" onClick={onClose}>
            Esc
          </button>
        </div>
        <div className="settings-grid">
          <div className="settings-group settings-group-hero">
            <p className="settings-label">Default notes folder</p>
            <div className="settings-path-row">
              <input className="settings-path" readOnly value={settings.defaultWorkspacePath} />
              <button className="secondary-button" type="button" onClick={onChooseFolder}>
                Change
              </button>
            </div>
          </div>
          <div className="settings-group">
            <p className="settings-label">Appearance mode</p>
            <div className="mode-toggle">
              {(["light", "dark"] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  className={`mode-button ${settings.themeMode === mode ? "is-active" : ""}`}
                  type="button"
                  onClick={() => onChangeMode(mode)}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="settings-group">
            <p className="settings-label">Theme family</p>
            <div className="theme-grid">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  className={`theme-chip ${settings.themeId === theme.id ? "is-active" : ""}`}
                  type="button"
                  onClick={() => onChangeTheme(theme.id)}
                >
                  <span>{theme.name}</span>
                  <small>{theme.id}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
