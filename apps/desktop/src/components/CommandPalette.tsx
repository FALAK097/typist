import { useEffect, useMemo, useRef } from "react";

type CommandPaletteItem = {
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

type CommandPaletteProps = {
  isOpen: boolean;
  query: string;
  items: CommandPaletteItem[];
  selectedIndex: number;
  onChangeQuery: (value: string) => void;
  onClose: () => void;
  onHoverItem: (index: number) => void;
  onMove: (direction: 1 | -1) => void;
  onSelect: () => void;
};

const paletteIcons: Record<CommandPaletteItem["kind"], string> = {
  command: "⌘",
  file: "#",
  theme: "◐"
};

export function CommandPalette({
  isOpen,
  query,
  items,
  selectedIndex,
  onChangeQuery,
  onClose,
  onHoverItem,
  onMove,
  onSelect
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const sections = useMemo(() => {
    const groups: Array<{ title: string; items: Array<{ item: CommandPaletteItem; index: number }> }> = [];

    items.forEach((item, index) => {
      const group = groups.at(-1);

      if (!group || group.title !== item.section) {
        groups.push({
          title: item.section,
          items: [{ item, index }]
        });
        return;
      }

      group.items.push({ item, index });
    });

    return groups;
  }, [items]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    itemRefs.current[selectedIndex]?.scrollIntoView({
      block: "nearest"
    });
  }, [isOpen, selectedIndex]);

  if (!isOpen) {
    return null;
  }

  return (
    <section className="modal-shell" role="presentation" onMouseDown={onClose}>
      <div
        className="modal-card palette-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="palette-header">
          <div>
            <p className="panel-label">Command Palette</p>
            <h2 id="command-palette-title">Move fast without losing context</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close command palette" onClick={onClose}>
            Esc
          </button>
        </div>
        <div className="palette-input-row">
          <input
            ref={inputRef}
            className="palette-input"
            aria-label="Search files, commands, and themes"
            placeholder="Search files, commands, themes, and text"
            value={query}
            onChange={(event) => onChangeQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                onMove(1);
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                onMove(-1);
              }

              if (event.key === "Enter") {
                event.preventDefault();
                onSelect();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                onClose();
              }
            }}
          />
          <div className="palette-shortcut-cluster" aria-hidden="true">
            <span className="shortcut-key">↑</span>
            <span className="shortcut-key">↓</span>
            <span className="shortcut-key">↵</span>
          </div>
        </div>
        <div className="palette-list" role="listbox" aria-label="Command palette results">
          {sections.length === 0 ? (
            <div className="palette-empty">
              <p>No results yet</p>
              <span>Try a file name, "theme", or a word inside your notes.</span>
            </div>
          ) : (
            sections.map((section) => (
              <div key={section.title} className="palette-section">
                <p className="palette-section-title">{section.title}</p>
                {section.items.map(({ item, index }) => (
                  <button
                    key={item.id}
                    ref={(element) => {
                      itemRefs.current[index] = element;
                    }}
                    className={`palette-item ${selectedIndex === index ? "is-active" : ""}`}
                    type="button"
                    role="option"
                    aria-selected={selectedIndex === index}
                    onMouseEnter={() => {
                      onHoverItem(index);
                      item.onPreview?.();
                    }}
                    onClick={item.onSelect}
                  >
                    <div className="palette-item-leading">
                      <span className={`palette-item-icon is-${item.kind}`}>{paletteIcons[item.kind]}</span>
                      <div className="palette-item-copy">
                        <span className="palette-item-title">{item.title}</span>
                        {item.subtitle ? <small>{item.subtitle}</small> : null}
                      </div>
                    </div>
                    <div className="palette-item-trailing">
                      {item.hint ? <span className="palette-item-hint">{item.hint}</span> : null}
                      {item.shortcut ? <span className="palette-item-shortcut">{item.shortcut}</span> : null}
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
        <div className="palette-footer">
          <span>Enter to open</span>
          <span>Arrow keys to navigate</span>
          <span>Esc to close</span>
        </div>
      </div>
    </section>
  );
}
