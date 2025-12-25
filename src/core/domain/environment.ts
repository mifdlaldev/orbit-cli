/**
 * Environment Domain Entity
 */

export interface ToolStatus {
  readonly name: string;
  readonly isInstalled: boolean;
  readonly version?: string;
  readonly isRequired: boolean;
}

export interface EnvironmentStatus {
  readonly tools: readonly ToolStatus[];
  readonly allMet: boolean;
  readonly missing: readonly string[];
}
