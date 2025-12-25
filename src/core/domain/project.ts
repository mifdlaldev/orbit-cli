/**
 * Project Domain Entity
 */

import type { PackageManager, StackPresetId } from '../types.js';

export interface Project {
  readonly name: string;
  readonly path: string;
  readonly framework: string;
  readonly packageManager: PackageManager;
  readonly stack: StackPresetId;
  readonly createdAt: Date;
}

export interface ProjectOptions {
  name: string;
  framework: string;
  packageManager?: PackageManager;
  stack?: StackPresetId;
  targetDir?: string;
}
