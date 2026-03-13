export function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
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

  if (normalizedFilePath.startsWith(`${normalizedRootPath}/`)) {
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
  return normalizedFilePath.startsWith(`${normalizedRootPath}/`);
}

