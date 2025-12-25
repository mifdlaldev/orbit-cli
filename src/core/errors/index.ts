/**
 * Error Module Index
 * Re-exports all error types, classes, and messages
 */

// Types
export type { ErrorCategory, ErrorCode, OrbitError, ErrorTemplate, ExitCode } from './types.js';
export { EXIT_CODES } from './types.js';

// Classes
export {
  OrbitBaseError,
  ValidationError,
  EnvironmentError,
  FilesystemError,
  CommandError,
  InternalError,
} from './classes.js';

// Messages
export { VALIDATION, ENVIRONMENT, FILESYSTEM, COMMAND, INTERNAL } from './messages.js';
