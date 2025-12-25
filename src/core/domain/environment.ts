/**
 * Environment Domain Entity
 * Defines the structure of system environment status in ORBIT CLI
 */

/**
 * Tool installation status
 */
export interface ToolStatus {
  readonly name: string;
  readonly version: string | null;
  readonly path: string | null;
  readonly isInstalled: boolean;
  readonly isRequired: boolean;
}

/**
 * Overall environment status
 */
export interface EnvironmentStatus {
  readonly tools: readonly ToolStatus[];
  readonly allMet: boolean;
  readonly missing: readonly string[];
}

/**
 * System information
 */
export interface SystemInfo {
  readonly os: 'darwin' | 'linux' | 'win32';
  readonly arch: 'x64' | 'arm64';
  readonly nodeVersion: string;
  readonly cwd: string;
  readonly homedir: string;
}
