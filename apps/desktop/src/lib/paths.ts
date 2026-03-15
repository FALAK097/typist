export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

export function isSamePath(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return normalizePath(a).toLowerCase() === normalizePath(b).toLowerCase();
}

export function getBaseName(filePath: string): string {
  return filePath.split(/[\\/]/).at(-1) ?? filePath;
}

export function getRelativePath(filePath: string, rootPath: string | null): string {
  if (!rootPath) {
    return getBaseName(filePath);
  }

  const normalizedFilePath = normalizePath(filePath);
  const normalizedRootPath = normalizePath(rootPath).replace(/\/+$/, "");

  const fileLower = normalizedFilePath.toLowerCase();
  const rootLower = normalizedRootPath.toLowerCase();

  if (fileLower.startsWith(`${rootLower}/`)) {
    return normalizedFilePath.slice(normalizedRootPath.length + 1);
  }

  return getBaseName(normalizedFilePath);
}

export function isFileInsideWorkspace(filePath: string, rootPath: string | null): boolean {
  if (!rootPath) {
    return false;
  }

  const normalizedFilePath = normalizePath(filePath);
  const normalizedRootPath = normalizePath(rootPath).replace(/\/+$/, "");
  return normalizedFilePath.toLowerCase().startsWith(`${normalizedRootPath.toLowerCase()}/`);
}

