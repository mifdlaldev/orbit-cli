/**
 * Framework Domain Entity
 * Defines the structure of supported frameworks in ORBIT CLI
 */

/**
 * Supported framework identifiers
 */
export type FrameworkId = 'nextjs' | 'nuxt' | 'astro' | 'sveltekit' | 'vue' | 'remix' | 'laravel';

/**
 * Framework category
 */
export type FrameworkCategory = 'nodejs' | 'php';

/**
 * Framework version information
 */
export interface FrameworkVersion {
  readonly version: string;
  readonly releaseDate: string;
  readonly isLTS: boolean;
  readonly isLatest: boolean;
  readonly minNodeVersion?: string | undefined;
  readonly minPhpVersion?: string | undefined;
}

/**
 * Stack preset configuration
 */
export interface StackPreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly dependencies: readonly string[];
  readonly devDependencies: readonly string[];
  readonly scripts?: Record<string, string> | undefined;
  readonly config?: Record<string, unknown> | undefined;
}

/**
 * Framework definition
 */
export interface Framework {
  readonly id: FrameworkId;
  readonly name: string;
  readonly description: string;
  readonly category: FrameworkCategory;
  readonly website: string;
  readonly versions: readonly FrameworkVersion[];
  readonly stacks: readonly StackPreset[];
  readonly requiredTools: readonly string[];
}
