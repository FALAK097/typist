import type { DragPosition } from "../types/sidebar";
import type { DirectoryNode, FileDocument, SidebarItemSetting, WorkspaceSnapshot } from "../shared/workspace";

import { getBaseName, isFileInsideWorkspace } from "./paths";

export function toSidebarItemSetting(node: DirectoryNode): SidebarItemSetting {
  return {
    kind: node.type,
    path: node.path
  };
}

export function orderSidebarNodes(nodes: DirectoryNode[], orderedItems: SidebarItemSetting[]): DirectoryNode[] {
  const remaining = new Map(nodes.map((node) => [node.path, node]));
  const ordered: DirectoryNode[] = [];

  for (const item of orderedItems) {
    const match = remaining.get(item.path);
    if (!match || match.type !== item.kind) {
      continue;
    }

    ordered.push(match);
    remaining.delete(item.path);
  }

  return [...ordered, ...remaining.values()];
}

export function reorderSidebarNodes(
  nodes: DirectoryNode[],
  sourcePath: string,
  targetPath: string,
  position: DragPosition
): DirectoryNode[] {
  const sourceIndex = nodes.findIndex((node) => node.path === sourcePath);
  const targetIndex = nodes.findIndex((node) => node.path === targetPath);

  if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
    return nodes;
  }

  const nextNodes = [...nodes];
  const [sourceNode] = nextNodes.splice(sourceIndex, 1);
  const adjustedTargetIndex = nextNodes.findIndex((node) => node.path === targetPath);
  const insertIndex = position === "before" ? adjustedTargetIndex : adjustedTargetIndex + 1;
  nextNodes.splice(insertIndex, 0, sourceNode);
  return nextNodes;
}

export function upsertSidebarFolder(nodes: DirectoryNode[], workspace: WorkspaceSnapshot): DirectoryNode[] {
  const nextFolder: DirectoryNode = {
    type: "directory",
    name: getBaseName(workspace.rootPath),
    path: workspace.rootPath,
    children: workspace.tree
  };

  const nextNodes = nodes.filter((node) => !(node.type === "file" && isFileInsideWorkspace(node.path, workspace.rootPath)));
  const existingIndex = nextNodes.findIndex((node) => node.type === "directory" && node.path === workspace.rootPath);

  if (existingIndex === -1) {
    return [...nextNodes, nextFolder];
  }

  return nextNodes.map((node, index) => (index === existingIndex ? nextFolder : node));
}

export function upsertSidebarFile(nodes: DirectoryNode[], file: Pick<FileDocument, "path" | "name">): DirectoryNode[] {
  const isCoveredByFolder = nodes.some((node) => node.type === "directory" && isFileInsideWorkspace(file.path, node.path));

  if (isCoveredByFolder) {
    return nodes.filter((node) => !(node.type === "file" && node.path === file.path));
  }

  const nextFile: DirectoryNode = {
    type: "file",
    name: file.name,
    path: file.path
  };

  const existingIndex = nodes.findIndex((node) => node.type === "file" && node.path === file.path);
  if (existingIndex === -1) {
    return [...nodes, nextFile];
  }

  return nodes.map((node, index) => (index === existingIndex ? nextFile : node));
}

export function removeSidebarPath(nodes: DirectoryNode[], targetPath: string): DirectoryNode[] {
  return nodes.flatMap<DirectoryNode>((node) => {
    if (node.path === targetPath) {
      return [];
    }

    if (node.type === "directory") {
      return [{ ...node, children: removeSidebarPath(node.children, targetPath) }];
    }

    return [node];
  });
}

export function renameSidebarFile(
  nodes: DirectoryNode[],
  oldPath: string,
  renamedFile: Pick<FileDocument, "path" | "name">
): DirectoryNode[] {
  return nodes.map((node) => {
    if (node.type === "directory") {
      return { ...node, children: renameSidebarFile(node.children, oldPath, renamedFile) };
    }

    if (node.path !== oldPath) {
      return node;
    }

    return {
      type: "file",
      path: renamedFile.path,
      name: renamedFile.name
    };
  });
}

