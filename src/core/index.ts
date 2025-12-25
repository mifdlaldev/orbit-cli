/**
 * Core Module Index
 * Main entry point for core layer exports
 */

// Container
export { createContainer, type Container } from './container.js';

// Domain Types
export type {
  FrameworkId,
  FrameworkCategory,
  FrameworkVersion,
  StackPreset,
  Framework,
  PackageManager,
  ProjectOptions,
  ProjectConfig,
  ProjectResult,
  ToolStatus,
  EnvironmentStatus,
  SystemInfo,
} from './domain/index.js';

// Use Cases
export {
  CheckEnvironmentUseCase,
  CreateProjectUseCase,
  type CreateProjectInput,
  type ProgressReporter,
} from './usecases/index.js';

// Errors
export {
  OrbitBaseError,
  ValidationError,
  EnvironmentError,
  FilesystemError,
  CommandError,
  InternalError,
  EXIT_CODES,
} from './errors/index.js';

// Error Messages
export { VALIDATION, ENVIRONMENT, FILESYSTEM, COMMAND, INTERNAL } from './errors/messages.js';
