import { useCallback, useEffect, useMemo, useRef } from "react";

import { FileIcon, OutlineIcon, SearchIcon, ShortcutIcon } from "@/components/icons";
import { COMMAND_PALETTE_SCOPE_OPTIONS } from "@/lib/command-palette";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import type { CommandPaletteItem, CommandPaletteProps } from "../types/command-palette";

function getItemBadgeClass(item: CommandPaletteItem) {
  switch (item.kind) {
    case "match":
      return "bg-primary/10 text-primary";
    case "heading":
      return "bg-accent text-accent-foreground";
    case "action":
      return "bg-muted text-muted-foreground";
    case "note":
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

function getItemIcon(item: CommandPaletteItem, isSelected: boolean) {
  const className = isSelected ? "text-foreground" : "text-muted-foreground";

  switch (item.kind) {
    case "heading":
      return <OutlineIcon size={16} className={className} />;
    case "match":
      return <SearchIcon size={16} className={className} />;
    case "action":
      return <ShortcutIcon size={16} className={className} />;
    case "note":
    default:
      return <FileIcon size={16} className={className} />;
  }
}

function getScopePlaceholder(scope: CommandPaletteProps["scope"]) {
  switch (scope) {
    case "notes":
      return "Open a note by title or path...";
    case "content":
      return "Search inside note text...";
    case "headings":
      return "Jump to a heading in the current note...";
    case "actions":
      return "Run commands and note actions...";
    case "all":
    default:
      return "Go to notes, headings, or actions...";
  }
}

export const CommandPalette = ({
  isOpen,
  isSearching,
  query,
  scope,
  items,
  selectedIndex,
  onChangeQuery,
  onChangeScope,
  onCycleScope,
  onClose,
  onHoverItem,
  onMove,
  onSelect,
}: CommandPaletteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const sections = useMemo(() => {
    const groups: Array<{
      title: string;
      items: Array<{ item: CommandPaletteItem; index: number }>;
    }> = [];

    items.forEach((item, index) => {
      const group = groups.at(-1);

      if (!group || group.title !== item.section) {
        groups.push({
          title: item.section,
          items: [{ item, index }],
        });
        return;
      }

      group.items.push({ item, index });
    });

    return groups;
  }, [items]);

  const activeScope = useMemo(
    () => COMMAND_PALETTE_SCOPE_OPTIONS.find((option) => option.id === scope),
    [scope],
  );

  const normalizedQuery = useMemo(() => {
    const trimmedQuery = query.trimStart();
    const activePrefix = activeScope?.prefix ?? "";

    if (activePrefix && trimmedQuery.startsWith(activePrefix)) {
      return trimmedQuery.slice(activePrefix.length).trim();
    }

    return query.trim();
  }, [activeScope?.prefix, query]);

  const emptyState = useMemo(() => {
    if (isSearching) {
      return {
        title: "Searching note text",
        description: "Scanning the workspace for content matches.",
      };
    }

    if (scope === "content" && normalizedQuery.length > 0 && normalizedQuery.length < 2) {
      return {
        title: "Search inside note text",
        description: "Type at least two characters, or use / from the keyboard to jump here.",
      };
    }

    if (!normalizedQuery) {
      switch (scope) {
        case "notes":
          return {
            title: "Find a note fast",
            description: "Search note titles and paths. Use @ to stay in note mode.",
          };
        case "content":
          return {
            title: "Search inside note text",
            description: "Type at least two characters, or use / from the keyboard to jump here.",
          };
        case "headings":
          return {
            title: "Jump through structure",
            description: "Search headings from the current note with # for quick section jumps.",
          };
        case "actions":
          return {
            title: "Run a command",
            description: "Use > to switch into actions and note commands instantly.",
          };
        case "all":
        default:
          return {
            title: "Go to anything",
            description: "Use @ notes, / text, # headings, or > actions. Tab cycles scopes.",
          };
      }
    }

    return {
      title: `No matches in ${activeScope?.label.toLowerCase() ?? "this scope"}`,
      description: "Try a different term, or switch scope with Tab.",
    };
  }, [activeScope?.label, isSearching, normalizedQuery, scope]);

  useEffect(() => {
    if (!isOpen) {
      if (previousFocusRef.current && document.body.contains(previousFocusRef.current)) {
        previousFocusRef.current.focus();
      }
      previousFocusRef.current = null;
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    itemRefs.current[selectedIndex]?.scrollIntoView({
      block: "nearest",
    });
  }, [isOpen, selectedIndex]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-labelledby="command-palette-title"
        className="w-[min(92vw,860px)] max-w-[860px] gap-0 overflow-hidden border-border/60 bg-background/95 p-0 shadow-xl backdrop-blur"
      >
        <h2 id="command-palette-title" className="sr-only">
          Universal command surface
        </h2>

        <div className="border-b border-border/50 bg-muted/25 p-4">
          <div className="rounded-[1.2rem] border border-border/60 bg-background/90 p-3 shadow-xs">
            <div className="flex items-center gap-3 rounded-[0.95rem] border border-border/50 bg-background px-3 py-2 shadow-[inset_0_1px_0_0_color-mix(in_oklab,var(--background)_88%,transparent)]">
              <div className="flex h-8 min-w-8 items-center justify-center rounded-full border border-border/60 bg-muted/70 px-2 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                {activeScope?.prefix || "All"}
              </div>
              <Input
                ref={inputRef}
                className="h-10 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
                aria-label="Search notes, note text, headings, and actions"
                placeholder={getScopePlaceholder(scope)}
                value={query}
                onChange={(event) => onChangeQuery(event.target.value)}
                onKeyDown={(event) => {
                  if ((event.metaKey || event.ctrlKey) && event.key === "a") {
                    return;
                  }

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

                  if (event.key === "Tab") {
                    event.preventDefault();
                    onCycleScope(event.shiftKey ? -1 : 1);
                  }

                  if (event.key === "Escape") {
                    event.preventDefault();
                    onClose();
                  }
                }}
              />
              <div className="hidden shrink-0 items-center gap-2 text-[11px] text-muted-foreground sm:flex">
                <span>Tab scope</span>
                <kbd className="rounded border border-border/50 bg-muted/60 px-1.5 py-0.5 font-medium text-foreground/70">
                  Enter
                </kbd>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {COMMAND_PALETTE_SCOPE_OPTIONS.map((option) => {
                const isActive = option.id === scope;

                return (
                  <Button
                    key={option.id}
                    variant={isActive ? "secondary" : "ghost"}
                    size="xs"
                    className={`rounded-full px-3 ${
                      isActive
                        ? "border border-border/60 bg-accent text-accent-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    type="button"
                    onClick={() => onChangeScope(option.id)}
                  >
                    <span className="font-mono text-[11px] text-muted-foreground/80">
                      {option.prefix || "*"}
                    </span>
                    <span>{option.label}</span>
                  </Button>
                );
              })}
              <p className="ml-auto hidden text-[11px] text-muted-foreground lg:block">
                Use @ notes, / text, # headings, or &gt; actions
              </p>
            </div>
          </div>
        </div>

        <div
          className="min-h-[340px] max-h-[480px] overflow-y-auto"
          role="listbox"
          aria-label="Command surface results"
        >
          {items.length === 0 ? (
            <div className="flex min-h-[340px] items-center justify-center px-8 py-12 text-center">
              <div className="max-w-sm">
                <p className="text-sm font-semibold text-foreground">{emptyState.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {emptyState.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="pb-3">
              {sections.map((section, sectionIndex) => (
                <section key={section.title} className={sectionIndex > 0 ? "pt-2" : undefined}>
                  <div className="sticky top-0 z-10 flex items-center justify-between border-y border-border/40 bg-background/95 px-4 py-2 backdrop-blur">
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                      {section.title}
                    </p>
                    <span className="text-[11px] text-muted-foreground">
                      {section.items.length}
                    </span>
                  </div>

                  <div className="px-2 pt-2">
                    {section.items.map(({ item, index }) => {
                      const isSelected = selectedIndex === index;

                      return (
                        <Button
                          key={item.id}
                          ref={(element) => {
                            itemRefs.current[index] = element;
                          }}
                          className={`mb-1 h-auto w-full justify-start gap-0 rounded-xl px-3 py-3 text-left transition-all duration-100 ${
                            isSelected
                              ? "bg-accent/70 text-foreground shadow-xs ring-1 ring-border/80"
                              : "text-foreground hover:bg-muted/65"
                          }`}
                          type="button"
                          variant="ghost"
                          size="sm"
                          role="option"
                          aria-selected={isSelected}
                          onMouseEnter={() => {
                            onHoverItem(index);
                            item.onPreview?.();
                          }}
                          onClick={item.onSelect}
                        >
                          <div
                            className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border ${
                              isSelected
                                ? "border-border/80 bg-background/80"
                                : "border-border/50 bg-muted/70"
                            }`}
                          >
                            {getItemIcon(item, isSelected)}
                          </div>

                          <div className="ml-3 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-medium">{item.title}</span>
                              {item.badge ? (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] uppercase ${getItemBadgeClass(
                                    item,
                                  )}`}
                                >
                                  {item.badge}
                                </span>
                              ) : null}
                            </div>
                            {item.subtitle ? (
                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {item.subtitle}
                              </p>
                            ) : null}
                          </div>

                          <div className="ml-3 flex shrink-0 items-center gap-2 self-start pt-0.5">
                            {item.meta ? (
                              <span className="text-[11px] text-muted-foreground">{item.meta}</span>
                            ) : null}
                            {item.shortcut ? (
                              <kbd className="rounded-md border border-border/50 bg-background/85 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {item.shortcut}
                              </kbd>
                            ) : null}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
