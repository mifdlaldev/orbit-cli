/**
 * Framework Domain Entity
 */

export type FrameworkId = 'nextjs' | 'nuxt' | 'astro' | 'sveltekit' | 'vue' | 'remix' | 'laravel';

export interface Framework {
  readonly id: FrameworkId;
  readonly name: string;
  readonly description: string;
  readonly category: 'nodejs' | 'php';
  readonly website: string;
}

export interface FrameworkVersion {
  readonly version: string;
  readonly releaseDate: string;
  readonly isLTS: boolean;
  readonly isLatest: boolean;
  readonly minNodeVersion?: string;
}

export interface StackPreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly dependencies: readonly string[];
  readonly devDependencies: readonly string[];
}
