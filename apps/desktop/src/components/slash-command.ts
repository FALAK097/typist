import { Extension } from "@tiptap/core";
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionOptions,
  type SuggestionProps
} from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance, type Props } from "tippy.js";
import "tippy.js/dist/tippy.css";
import { getShortcutKeys } from "../shared/shortcuts";
import type { ShortcutSetting } from "../shared/workspace";
import { SlashCommandList } from "./slash-command-list";
import type { SlashCommandItem, SlashCommandListHandle, SlashCommandWithKey } from "../types/slash-command";

type EditorCommandId = SlashCommandWithKey["id"];

/** Map from slash command id → the editor-shortcut id in shortcuts.ts */
const SHORTCUT_ID_MAP: Partial<Record<EditorCommandId, Parameters<typeof getShortcutKeys>[1]>> = {
  h1: "editor-h1",
  h2: "editor-h2",
  h3: "editor-h3",
  bullet: "editor-bullet",
  ordered: "editor-ordered",
  quote: "editor-quote",
  codeblock: "editor-codeblock",
  bold: "editor-bold",
  italic: "editor-italic",
  strike: "editor-strike",
  inlinecode: "editor-inlinecode",
  link: "editor-link",
};

const BASE_COMMANDS: Omit<SlashCommandWithKey, "shortcut">[] = [
  { id: "h1", title: "Heading 1", description: "Large section heading", keywords: ["h1", "heading", "title", "#"], group: "Headings", icon: "Heading01Icon" },
  { id: "h2", title: "Heading 2", description: "Medium section heading", keywords: ["h2", "heading", "##"], group: "Headings", icon: "Heading02Icon" },
  { id: "h3", title: "Heading 3", description: "Small section heading", keywords: ["h3", "heading", "###"], group: "Headings", icon: "Heading03Icon" },
  { id: "bullet", title: "Bullet List", description: "Create an unordered list", keywords: ["list", "bullet", "ul", "-"], group: "Lists", icon: "BulletIcon" },
  { id: "ordered", title: "Numbered List", description: "Create an ordered list", keywords: ["list", "number", "ordered", "ol", "1."], group: "Lists", icon: "ListViewIcon" },
  { id: "task", title: "Task List", description: "Checklist with markdown tasks", keywords: ["task", "todo", "checklist", "- [ ]"], group: "Lists", icon: "CheckListIcon" },
  { id: "quote", title: "Quote", description: "Insert blockquote", keywords: ["quote", "blockquote", ">"], group: "Blocks", icon: "QuoteDownIcon" },
  { id: "codeblock", title: "Code Block", description: "Insert fenced code block", keywords: ["code", "pre", "```"], group: "Blocks", icon: "CodeSquareIcon" },
  { id: "table", title: "Table", description: "Insert markdown table", keywords: ["table", "grid", "|---|"], group: "Blocks", icon: "Table01Icon" },
  { id: "rule", title: "Horizontal Rule", description: "Insert thematic break", keywords: ["rule", "divider", "---"], group: "Blocks", icon: "HorizontalResizeIcon" },
  { id: "bold", title: "Bold", description: "Mark selected text as bold", keywords: ["bold", "strong", "**"], group: "Inline", icon: "TextBoldIcon" },
  { id: "italic", title: "Italic", description: "Mark selected text as italic", keywords: ["italic", "emphasis", "*"], group: "Inline", icon: "TextItalicIcon" },
  { id: "strike", title: "Strikethrough", description: "Cross out selected text", keywords: ["strike", "strikethrough", "~~"], group: "Inline", icon: "TextStrikethroughIcon" },
  { id: "inlinecode", title: "Inline Code", description: "Mark selected text as code", keywords: ["inline", "code", "`"], group: "Inline", icon: "CodeSimpleIcon" },
  { id: "link", title: "Link", description: "Insert markdown link", keywords: ["link", "url", "[]()"], group: "Inline", icon: "Link01Icon" },
  { id: "image", title: "Image", description: "Insert markdown image", keywords: ["image", "img", "![]()"], group: "Inline", icon: "Image01Icon" },
];

/** Build the full command list with live shortcut strings from settings. */
function buildCommands(shortcuts: ShortcutSetting[] | null | undefined): SlashCommandWithKey[] {
  return BASE_COMMANDS.map((cmd) => {
    const shortcutId = SHORTCUT_ID_MAP[cmd.id];
    const keys = shortcutId ? getShortcutKeys(shortcuts, shortcutId) : undefined;
    return { ...cmd, shortcut: keys };
  });
}

const runCommand = ({
  editor,
  range,
  props
}: {
  editor: SuggestionProps<SlashCommandWithKey>["editor"];
  range: SuggestionProps<SlashCommandWithKey>["range"];
  props: SlashCommandWithKey;
}) => {
  editor.chain().focus().deleteRange(range).run();

  switch (props.id) {
    case "h1":
      editor.chain().focus().toggleHeading({ level: 1 }).run();
      return;
    case "h2":
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      return;
    case "h3":
      editor.chain().focus().toggleHeading({ level: 3 }).run();
      return;
    case "bullet":
      editor.chain().focus().toggleBulletList().run();
      return;
    case "ordered":
      editor.chain().focus().toggleOrderedList().run();
      return;
    case "task":
      editor.chain().focus().toggleTaskList().run();
      return;
    case "quote":
      editor.chain().focus().toggleBlockquote().run();
      return;
    case "codeblock":
      editor.chain().focus().toggleCodeBlock().run();
      return;
    case "inlinecode":
      editor.chain().focus().toggleCode().run();
      return;
    case "table":
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      return;
    case "image":
      editor.chain().focus().insertContent("![alt text](https://example.com/image.png)").run();
      return;
    case "bold":
      editor.chain().focus().toggleBold().run();
      return;
    case "italic":
      editor.chain().focus().toggleItalic().run();
      return;
    case "strike":
      editor.chain().focus().toggleStrike().run();
      return;
    case "link":
      editor.chain().focus().insertContent("[link text](https://example.com)").run();
      return;
    case "rule":
      editor.chain().focus().setHorizontalRule().run();
      return;
  }
};

/**
 * Creates the SlashCommand TipTap extension with a mutable ref to the current
 * shortcut settings, so the displayed shortcuts stay in sync with user changes.
 */
export function createSlashCommand(shortcutsRef: { current: ShortcutSetting[] | null | undefined }) {
  const getSuggestionItems = ({ query }: { query: string }) => {
    const commands = buildCommands(shortcutsRef.current);
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return commands;
    }

    return commands.filter((item) => {
      const haystack = [item.title, item.description, ...item.keywords].join(" ").toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  };

  const slashSuggestion: Omit<SuggestionOptions<SlashCommandWithKey>, "editor"> = {
    char: "/",
    allowSpaces: true,
    startOfLine: true,
    items: getSuggestionItems,
    command: runCommand,
    render: () => {
      let component: ReactRenderer<SlashCommandListHandle> | null = null;
      let popup: Instance<Props> | null = null;

      return {
        onStart: (props: SuggestionProps<SlashCommandWithKey>) => {
          component = new ReactRenderer(SlashCommandList, {
            props: {
              items: props.items,
              onSelect: (item: SlashCommandItem) => props.command(item as SlashCommandWithKey)
            },
            editor: props.editor
          });

          if (!props.clientRect) {
            return;
          }

          popup = tippy(document.body, {
            getReferenceClientRect: () => props.clientRect?.() ?? new DOMRect(),
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
            theme: "slash-menu"
          });
        },
        onUpdate: (props: SuggestionProps<SlashCommandWithKey>) => {
          component?.updateProps({
            items: props.items,
            onSelect: (item: SlashCommandItem) => props.command(item as SlashCommandWithKey)
          });

          if (!props.clientRect) {
            return;
          }

          popup?.setProps({
            getReferenceClientRect: () => props.clientRect?.() ?? new DOMRect()
          });
        },
        onKeyDown: (props: SuggestionKeyDownProps) => {
          if (props.event.key === "Escape") {
            popup?.hide();
            return true;
          }

          return component?.ref?.onKeyDown(props.event) ?? false;
        },
        onExit: () => {
          popup?.destroy();
          component?.destroy();
        }
      };
    }
  };

  return Extension.create({
    name: "slash-command",
    addProseMirrorPlugins() {
      return [Suggestion({ editor: this.editor, ...slashSuggestion })];
    }
  });
}

/** Convenience static export for places that don't need live shortcut updates. */
export const SlashCommand = createSlashCommand({ current: null });
