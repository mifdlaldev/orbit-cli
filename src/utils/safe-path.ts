/**
 * Safe Path Utilities
 * SECURITY: Prevent path traversal attacks
 */

import { resolve, relative, isAbsolute } from 'path';

/**
 * Safely resolve a path within a base directory
 * Prevents path traversal (../ attacks)
 */
export function resolveSafe(basePath: string, targetPath: string): string | null {
  const resolvedBase = resolve(basePath);
  const resolvedTarget = resolve(basePath, targetPath);

  // Check if resolved path is within base
  const relativePath = relative(resolvedBase, resolvedTarget);
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    return null; // Path traversal detected
  }

  return resolvedTarget;
}

/**
 * Check if a path is safe (no traversal)
 */
export function isPathSafe(basePath: string, targetPath: string): boolean {
  return resolveSafe(basePath, targetPath) !== null;
}
