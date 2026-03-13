import { useEffect, useRef, useState } from "react";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { Markdown } from "tiptap-markdown";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

import { SlashCommand } from "./slash-command";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CopyIcon,
  DotsHorizontalIcon,
  FileDownIcon,
  GearIcon,
  LinkIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PlusIcon,
  RevealInFolderIcon,
  SearchIcon
} from "./icons";

import type { MarkdownEditorProps, MarkdownEditorToast } from "../types/markdown-editor";

export const MarkdownEditor = ({
  content,
  fileName,
  filePath,
  saveStateLabel,
  wordCount,
  readingTime,
  onChange,
  onToggleSidebar,
  isSidebarCollapsed,
  onCreateNote,
  toggleSidebarShortcut,
  newNoteShortcut,
  onOpenSettings,
  onOpenCommandPalette,
  commandPaletteShortcut,
  onNavigateBack,
  onNavigateForward,
  canGoBack,
  canGoForward,
  autoOpenPDFSetting
}: MarkdownEditorProps) => {
  const lastSyncedMarkdown = useRef(content);
  const toastTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4]
        }
      }),
      Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank"
        }
      }),
      Image,
      TaskList,
      TaskItem.configure({
        nested: true
      }),
      Table.configure({
        resizable: true
      }),
      TableRow,
      TableHeader,
      TableCell,
      SlashCommand,
      Placeholder.configure({
        placeholder: "Start with a title, then let markdown shortcuts shape the page."
      }),
      Markdown.configure({
        linkify: true,
        transformPastedText: true,
        transformCopiedText: true,
        breaks: true
      })
    ],
    enableInputRules: true,
    enablePasteRules: true,
    content: content,
    editorProps: {
      attributes: {
        class: [
          "tiptap-editor",
          "mx-auto max-w-[800px] px-10 py-5 pb-20 text-[15px] leading-[1.7] text-foreground outline-none",
          "[&>p]:mb-4",
          "[&>ul]:mb-4 [&>ol]:mb-4 [&>blockquote]:mb-4 [&>pre]:mb-4 [&>hr]:my-8",
          "[&>h1]:mt-10 [&>h1]:mb-3 [&>h1]:text-3xl [&>h1]:font-semibold [&>h1]:leading-tight",
          "[&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:leading-tight",
          "[&>h3]:mt-7 [&>h3]:mb-2 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:leading-tight",
          "[&>h4]:mt-6 [&>h4]:mb-2 [&>h4]:text-lg [&>h4]:font-semibold [&>h4]:leading-tight",
          "[&>ul]:list-disc [&>ol]:list-decimal [&>ul]:pl-6 [&>ol]:pl-6",
          "[&>ul[data-type='taskList']]:list-none [&>ul[data-type='taskList']]:pl-0",
          "[&>ul[data-type='taskList']_li]:flex [&>ul[data-type='taskList']_li]:gap-2.5 [&>ul[data-type='taskList']_li]:items-start",
          "[&>ul[data-type='taskList']_li>label]:inline-flex [&>ul[data-type='taskList']_li>label]:items-center [&>ul[data-type='taskList']_li>label]:mt-1",
          "[&>blockquote]:pl-4 [&>blockquote]:border-l-2 [&>blockquote]:border-border [&>blockquote]:text-muted-foreground",
          "[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:bg-muted [&_code]:font-mono [&_code]:text-[0.875em]",
          "[&>pre]:p-4 [&>pre]:rounded-xl [&>pre]:bg-muted [&>pre]:overflow-auto",
          "[&>pre_code]:p-0 [&>pre_code]:bg-transparent",
          "[&>a]:text-primary [&>a]:underline [&>a]:underline-offset-2",
          "[&>table]:w-full [&>table]:border-collapse [&>table]:mb-5",
          "[&>table_th]:bg-muted [&>table_th]:font-semibold",
          "[&>table_th]:border [&>table_th]:border-border [&>table_th]:px-3 [&>table_th]:py-2 [&>table_th]:align-top",
          "[&>table_td]:border [&>table_td]:border-border [&>table_td]:px-3 [&>table_td]:py-2 [&>table_td]:align-top",
          "[&>img]:max-w-full [&>img]:h-auto [&>img]:rounded-xl"
        ].join(" "),
        spellcheck: "true"
      }
    },
    onUpdate: ({ editor: nextEditor }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
      const nextMarkdown = (nextEditor.storage as any).markdown.getMarkdown() as string;
      lastSyncedMarkdown.current = nextMarkdown;
      onChange(nextMarkdown);
    }
  });

  useEffect(() => {
    if (!editor || content === lastSyncedMarkdown.current) {
      return;
    }

    editor.commands.setContent(content, {
      emitUpdate: false
    });
    lastSyncedMarkdown.current = content;
  }, [content, editor]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toast, setToast] = useState<MarkdownEditorToast | null>(null);

  const showToast = (title: string, description: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    setToast({ title, description });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyPath = async () => {
    if (filePath) {
      try {
        await navigator.clipboard.writeText(filePath);
        showToast("Path copied to clipboard", "");
      } catch (err) {
        console.error("Failed to copy path:", err);
        showToast("Failed to copy path", "");
      }
    }
  };

  const handleCopy = async () => {
    if (content) {
      try {
        await navigator.clipboard.writeText(content);
        showToast("Copied as Markdown", "");
      } catch (err) {
        console.error("Failed to copy content:", err);
        showToast("Failed to copy content", "");
      }
    }
  };

  const handleOpenExternal = async () => {
    if (filePath && window.typist) {
      try {
        const didReveal = await window.typist.revealInFinder(filePath);
        if (!didReveal) {
          showToast("Could not open in Finder", "");
        }
      } catch (err) {
        console.error("Failed to open in Finder:", err);
        showToast("Could not open in Finder", "");
      }
    }
  };

  const handleExportPDF = async () => {
    if (!editor || !fileName) {
      showToast("Could not export PDF", "No file name available");
      return;
    }

    try {
      const { default: html2pdf } = await import("html2pdf.js");
      let element = document.querySelector(".tiptap-editor") as HTMLElement | null;
      if (!element) {
        showToast("Could not export PDF", "Editor content not found");
        return;
      }

      // Clone the element to avoid modifying the original
      const clonedElement = element.cloneNode(true) as HTMLElement;
      
      // Convert OKLCH colors to RGB for html2canvas compatibility
      const style = document.createElement('style');
      style.textContent = `
        .tiptap-editor {
          --background: rgb(255, 255, 255);
          --foreground: rgb(38, 38, 38);
          --card: rgb(255, 255, 255);
          --card-foreground: rgb(38, 38, 38);
          --muted: rgb(245, 245, 245);
          --muted-foreground: rgb(120, 120, 120);
          --primary: rgb(55, 65, 81);
          --primary-foreground: rgb(252, 252, 252);
          --border: rgb(229, 229, 229);
          color: rgb(38, 38, 38);
        }
      `;
      clonedElement.appendChild(style);

      const filename = fileName.replace(/\.md$/i, ".pdf");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const pdfInstance = html2pdf().set({
        margin: 10,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { orientation: "portrait", unit: "mm", format: "a4" }
      });

      // Use cloned element with RGB colors
      const pdfDataUrl = await pdfInstance.from(clonedElement).outputPdf();
      
      // Create temporary link for download
      const link = document.createElement('a');
      link.href = pdfDataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Auto-open PDF if setting is enabled
      if (window.typist && autoOpenPDFSetting) {
        console.log("Auto-open PDF setting is enabled. PDF downloaded as:", filename);
      }

      showToast("PDF exported successfully", `Saved as ${filename}`);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      showToast("Failed to export PDF", err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <section className="relative h-full min-h-0 flex flex-col bg-background">
      <div className="flex items-center px-4 py-2 border-b border-border/40 gap-2">
        {/* Left: toolbar + title */}
         <div className="flex items-center gap-1 flex-shrink-0 min-w-0">
           {onToggleSidebar && (
             <Tooltip>
               <TooltipTrigger asChild>
                 <Button
                   variant="ghost"
                   size="icon-sm"
                   className="text-muted-foreground hover:text-foreground hover:bg-muted flex-shrink-0"
                   onClick={onToggleSidebar}
                   type="button"
                 >
                   {isSidebarCollapsed ? <PanelRightIcon size={16} /> : <PanelLeftIcon size={16} />}
                 </Button>
               </TooltipTrigger>
               <TooltipContent side="bottom">
                 {isSidebarCollapsed ? `Show Sidebar (${toggleSidebarShortcut ?? "⌘B"})` : `Hide Sidebar (${toggleSidebarShortcut ?? "⌘B"})`}
               </TooltipContent>
             </Tooltip>
           )}
           <Tooltip>
             <TooltipTrigger asChild>
               <Button
                 variant="ghost"
                 size="icon-sm"
                 disabled={!canGoBack}
                 onClick={onNavigateBack}
                 className="flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted disabled:text-muted-foreground/40 disabled:opacity-40"
                 type="button"
               >
                 <ArrowLeftIcon size={14} />
               </Button>
             </TooltipTrigger>
             <TooltipContent side="bottom">Back</TooltipContent>
           </Tooltip>
           <Tooltip>
             <TooltipTrigger asChild>
               <Button
                 variant="ghost"
                 size="icon-sm"
                 disabled={!canGoForward}
                 onClick={onNavigateForward}
                 className="flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted disabled:text-muted-foreground/40 disabled:opacity-40"
                 type="button"
               >
                 <ArrowRightIcon size={14} />
               </Button>
             </TooltipTrigger>
             <TooltipContent side="bottom">Forward</TooltipContent>
           </Tooltip>
           <Tooltip>
             <TooltipTrigger asChild>
               <Button
                 variant="ghost"
                 size="icon-sm"
                 className="text-muted-foreground hover:text-foreground hover:bg-muted flex-shrink-0"
                 onClick={onCreateNote}
                 type="button"
               >
                 <PlusIcon size={16} />
               </Button>
             </TooltipTrigger>
             <TooltipContent side="bottom">
               {`New Note (${newNoteShortcut ?? "⌘N"})`}
             </TooltipContent>
           </Tooltip>
           {fileName && (
             <>
               <span className="text-border/60 text-xs flex-shrink-0 mx-0.5">·</span>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <span
                     className="text-sm font-medium text-foreground truncate max-w-[180px]"
                   >
                     {fileName.replace(/\.(md|markdown)$/i, "")}
                   </span>
                 </TooltipTrigger>
                 <TooltipContent side="bottom">
                   {fileName.replace(/\.(md|markdown)$/i, "")}
                 </TooltipContent>
               </Tooltip>
             </>
           )}
        </div>

        {/* Center: search bar */}
        {onOpenCommandPalette && (
          <div className="flex-1 flex justify-center px-2 min-w-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full max-w-sm justify-between px-3 py-1.5 text-sm text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
              onClick={onOpenCommandPalette}
              type="button"
            >
              <div className="flex items-center gap-2">
                <SearchIcon size={13} className="opacity-60 flex-shrink-0" />
                <span>Search typist</span>
              </div>
              <span className="font-mono text-xs opacity-50 ml-4 flex-shrink-0">{commandPaletteShortcut ?? "⌘P"}</span>
            </Button>
          </div>
        )}

          {/* Right: actions */}
          <div className="flex items-center gap-1 relative flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  type="button"
                >
                  <DotsHorizontalIcon size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">More options</TooltipContent>
            </Tooltip>
            {onOpenSettings && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={onOpenSettings}
                    type="button"
                  >
                    <GearIcon size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Settings</TooltipContent>
              </Tooltip>
            )}
          
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-50 py-1 overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-full justify-start gap-2 rounded-none px-3 py-1.5 text-sm"
                  onClick={() => { handleCopy(); setIsMenuOpen(false); }}
                  disabled={!content}
                  type="button"
                >
                  <CopyIcon size={14} className="opacity-70" />
                  Copy as MD
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-full justify-start gap-2 rounded-none px-3 py-1.5 text-sm"
                  onClick={() => { handleCopyPath(); setIsMenuOpen(false); }}
                  disabled={!filePath}
                  type="button"
                >
                  <LinkIcon size={14} className="opacity-70" />
                  Copy file path
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-full justify-start gap-2 rounded-none px-3 py-1.5 text-sm"
                  onClick={() => { handleOpenExternal(); setIsMenuOpen(false); }}
                  disabled={!filePath}
                  type="button"
                >
                  <RevealInFolderIcon size={14} className="opacity-70 shrink-0" />
                  Open in Finder
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto w-full justify-start gap-2 rounded-none px-3 py-1.5 text-sm"
                  onClick={() => { void handleExportPDF(); setIsMenuOpen(false); }}
                  disabled={!content}
                  type="button"
                >
                  <FileDownIcon size={14} className="opacity-70" />
                  Export as PDF
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto relative [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <EditorContent editor={editor} />
      </div>
      <div className="absolute bottom-6 right-10 flex items-center gap-3 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-sm z-10 pointer-events-none">
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <span>{wordCount} words</span>
          <span>{readingTime} min read</span>
        </div>
        <div className="w-[1px] h-3 bg-border" />
        <p className="text-xs font-medium text-foreground m-0">{saveStateLabel}</p>
      </div>
      {toast ? (
        <div
          className="fixed bottom-4 right-4 z-50 flex items-start gap-3 max-w-[360px] px-4 py-3 bg-card border border-border rounded-lg shadow-lg"
          role="status"
          aria-live="polite"
        >
          <div className="mt-0.5 text-foreground" aria-hidden="true">
            <CheckCircleIcon size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-medium text-foreground leading-snug">{toast.title}</p>
            {toast.description ? (
              <p className="m-0 mt-0.5 text-xs text-muted-foreground leading-snug break-words">{toast.description}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
};
