/**
 * Core Module - Public Exports
 * Only export what UI layer needs
 */

// Types
export type { Framework, FrameworkId, FrameworkVersion, StackPreset } from './domain/framework.js';
export type { ProjectConfig, PackageManager, CreateCommandOptions } from './types.js';

// Errors
export { OrbitError, ValidationError, EnvironmentError } from './errors.js';

// Container
export { createContainer } from './container.js';
