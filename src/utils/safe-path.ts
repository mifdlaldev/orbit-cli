/**
 * Safe Path Utilities
 * Path traversal prevention and safe path resolution
 *
 * SECURITY: Prevent directory traversal attacks
 */

import * as path from 'node:path';
import * as fs from 'node:fs/promises';

/**
 * Check if a path is inside the current working directory
 * Prevents "../../../etc/passwd" style attacks
 */
export function isInsideCwd(targetPath: string, cwd?: string | undefined): boolean {
  const basePath = cwd ?? process.cwd();
  const resolvedBase = path.resolve(basePath);
  const resolvedTarget = path.resolve(basePath, targetPath);

  // Must start with the base path (no traversal outside)
  return resolvedTarget.startsWith(resolvedBase + path.sep) || resolvedTarget === resolvedBase;
}

/**
 * Resolve a path safely within CWD
 * Returns null if path would escape CWD
 */
export function resolveSafePath(userPath: string, cwd?: string | undefined): string | null {
  const basePath = cwd ?? process.cwd();

  // Check for obvious traversal attempts
  if (userPath.includes('..')) {
    // Still check if the resolved path is safe
    const resolved = path.resolve(basePath, userPath);
    if (!isInsideCwd(resolved, basePath)) {
      return null;
    }
    return resolved;
  }

  const resolved = path.resolve(basePath, userPath);
  if (!isInsideCwd(resolved, basePath)) {
    return null;
  }

  return resolved;
}

/**
 * Check if a directory exists and is writable
 */
export async function isWritableDir(dirPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(dirPath);
    if (!stats.isDirectory()) {
      return false;
    }
    await fs.access(dirPath, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a path exists
 */
export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure target directory is safe for project creation
 */
export async function ensureSafeProjectDir(
  projectName: string,
  cwd?: string | undefined,
): Promise<{ safe: boolean; path: string; error?: string | undefined }> {
  const basePath = cwd ?? process.cwd();
  const projectPath = resolveSafePath(projectName, basePath);

  if (!projectPath) {
    return {
      safe: false,
      path: '',
      error: 'Invalid project path (possible directory traversal)',
    };
  }

  // Check if directory already exists
  if (await pathExists(projectPath)) {
    return {
      safe: false,
      path: projectPath,
      error: `Directory "${projectName}" already exists`,
    };
  }

  // Check if parent is writable
  const parentDir = path.dirname(projectPath);
  if (!(await isWritableDir(parentDir))) {
    return {
      safe: false,
      path: projectPath,
      error: 'Parent directory is not writable',
    };
  }

  return { safe: true, path: projectPath };
}
