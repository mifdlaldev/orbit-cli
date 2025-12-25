/**
 * Domain Module Index
 * Re-exports all domain entities
 */

// Framework
export type {
  FrameworkId,
  FrameworkCategory,
  FrameworkVersion,
  StackPreset,
  Framework,
} from './framework.js';

// Project
export type { PackageManager, ProjectOptions, ProjectConfig, ProjectResult } from './project.js';

// Environment
export type { ToolStatus, EnvironmentStatus, SystemInfo } from './environment.js';
