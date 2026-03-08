/// <reference types="vite/client" />

import type { AppCommand, FileDocument, FileOpenResult, WorkspaceChangeEvent, WorkspaceSnapshot } from "./shared/workspace";

declare global {
  interface Window {
    typist?: {
      openDialog: (kind: "file" | "directory") => Promise<FileOpenResult | null>;
      openFolder: (dirPath?: string) => Promise<WorkspaceSnapshot | null>;
      openDocument: () => Promise<FileDocument | null>;
      readFile: (filePath: string) => Promise<FileDocument>;
      saveFile: (filePath: string, content: string) => Promise<FileDocument>;
      createFile: (parentDir: string, fileName: string) => Promise<FileDocument>;
      createFolder: (parentDir: string, folderName: string) => Promise<WorkspaceSnapshot["tree"]>;
      onWorkspaceChanged: (listener: (event: WorkspaceChangeEvent) => void) => () => void;
      onCommand: (listener: (command: AppCommand) => void) => () => void;
    };
  }
}

export {};
