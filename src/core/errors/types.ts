/**
 * Error Types
 * Core error interfaces and types for ORBIT CLI
 */

/**
 * Error code categories
 */
export type ErrorCategory = 'V' | 'E' | 'F' | 'C' | 'I';

/**
 * Error code format: ORBIT-{CATEGORY}{NUMBER}
 * - V = Validation (input errors)
 * - E = Environment (missing tools)
 * - F = Filesystem (file/dir errors)
 * - C = Command (execution errors)
 * - I = Internal (unexpected errors)
 */
export type ErrorCode =
  | `ORBIT-V${string}`
  | `ORBIT-E${string}`
  | `ORBIT-F${string}`
  | `ORBIT-C${string}`
  | `ORBIT-I${string}`;

/**
 * Standard error interface
 */
export interface OrbitError {
  code: ErrorCode;
  title: string;
  message: string;
  hint?: string | undefined;
  stack?: string | undefined;
}

/**
 * Error message template
 */
export interface ErrorTemplate<T extends unknown[] = []> {
  code: ErrorCode;
  title: string;
  message: T extends [] ? string : (...args: T) => string;
  hint: string;
}

/**
 * Exit codes
 */
export const EXIT_CODES = {
  SUCCESS: 0,
  VALIDATION_ERROR: 1,
  ENVIRONMENT_ERROR: 2,
  FILESYSTEM_ERROR: 3,
  COMMAND_ERROR: 4,
  INTERNAL_ERROR: 99,
} as const;

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];
