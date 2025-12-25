/**
 * Project Domain Entity
 * Defines the structure of project configurations in ORBIT CLI
 */

import type { FrameworkId } from './framework.js';

/**
 * Package manager options
 */
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

/**
 * Project options configuration
 */
export interface ProjectOptions {
  readonly typescript: boolean;
  readonly eslint: boolean;
  readonly prettier: boolean;
  readonly git: boolean;
  readonly installDeps: boolean;
}

/**
 * Project configuration
 */
export interface ProjectConfig {
  readonly name: string;
  readonly directory: string;
  readonly framework: FrameworkId;
  readonly version: string;
  readonly packageManager: PackageManager;
  readonly stack: string;
  readonly options: ProjectOptions;
}

/**
 * Project creation result
 */
export interface ProjectResult {
  readonly success: boolean;
  readonly projectPath: string;
  readonly nextSteps: readonly string[];
  readonly errors?: readonly string[] | undefined;
}
