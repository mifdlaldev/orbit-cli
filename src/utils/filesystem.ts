/**
 * File System Utilities
 */

import { access, mkdir, readdir, stat } from 'fs/promises';
import { constants } from 'fs';

export async function exists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

export async function isEmpty(path: string): Promise<boolean> {
  try {
    const files = await readdir(path);
    return files.length === 0;
  } catch {
    return true;
  }
}

export async function ensureDir(path: string): Promise<void> {
  await mkdir(path, { recursive: true });
}
