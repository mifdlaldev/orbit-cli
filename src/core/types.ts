/**
 * Shared Types
 */

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
export type StackPresetId = 'minimal' | 'standard' | 'full';

export interface CreateCommandOptions {
  template?: string;
  pm?: PackageManager;
  stack?: StackPresetId;
  yes?: boolean;
}

export interface ProjectConfig {
  name: string;
  framework: string;
  packageManager: PackageManager;
  stack: StackPresetId;
  path: string;
}
