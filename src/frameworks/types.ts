/**
 * Framework Types
 * Complete type definitions for framework configurations
 */

export type FrameworkId = 'nextjs' | 'nuxt' | 'astro' | 'sveltekit' | 'vue' | 'remix' | 'laravel';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
export type StackPresetId = 'minimal' | 'standard' | 'full';

export interface Framework {
  readonly id: FrameworkId;
  readonly name: string;
  readonly description: string;
  readonly category: 'nodejs' | 'php';
  readonly website: string;
  readonly installCommand: InstallCommand;
  readonly stacks: readonly StackPreset[];
  readonly requiredTools: readonly string[];
}

export interface InstallCommand {
  readonly npm: string;
  readonly yarn: string;
  readonly pnpm: string;
  readonly bun: string;
  readonly flags: {
    readonly typescript?: string;
    readonly eslint?: string;
    readonly tailwind?: string;
    readonly srcDir?: string;
  };
}

export interface StackPreset {
  readonly id: StackPresetId;
  readonly name: string;
  readonly description: string;
  readonly postInstallDeps?: readonly string[];
  readonly postInstallDevDeps?: readonly string[];
}
