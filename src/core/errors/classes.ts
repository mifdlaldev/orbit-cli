/**
 * Error Classes
 * Custom error classes for ORBIT CLI
 */

import type { ErrorCode, OrbitError, ExitCode } from './types.js';
import { EXIT_CODES } from './types.js';

/**
 * Base error class for all ORBIT errors
 */
export class OrbitBaseError extends Error implements OrbitError {
  readonly code: ErrorCode;
  readonly title: string;
  readonly hint: string | undefined;
  readonly exitCode: ExitCode;

  constructor(
    code: ErrorCode,
    title: string,
    message: string,
    hint?: string | undefined,
    exitCode: ExitCode = EXIT_CODES.INTERNAL_ERROR,
  ) {
    super(message);
    this.name = 'OrbitError';
    this.code = code;
    this.title = title;
    this.hint = hint;
    this.exitCode = exitCode;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): OrbitError {
    return {
      code: this.code,
      title: this.title,
      message: this.message,
      hint: this.hint,
      stack: this.stack,
    };
  }
}

/**
 * Validation errors (invalid input)
 */
export class ValidationError extends OrbitBaseError {
  constructor(code: ErrorCode, title: string, message: string, hint?: string | undefined) {
    super(code, title, message, hint, EXIT_CODES.VALIDATION_ERROR);
    this.name = 'ValidationError';
  }
}

/**
 * Environment errors (missing tools)
 */
export class EnvironmentError extends OrbitBaseError {
  constructor(code: ErrorCode, title: string, message: string, hint?: string | undefined) {
    super(code, title, message, hint, EXIT_CODES.ENVIRONMENT_ERROR);
    this.name = 'EnvironmentError';
  }
}

/**
 * Filesystem errors (file/dir issues)
 */
export class FilesystemError extends OrbitBaseError {
  constructor(code: ErrorCode, title: string, message: string, hint?: string | undefined) {
    super(code, title, message, hint, EXIT_CODES.FILESYSTEM_ERROR);
    this.name = 'FilesystemError';
  }
}

/**
 * Command errors (execution failures)
 */
export class CommandError extends OrbitBaseError {
  constructor(code: ErrorCode, title: string, message: string, hint?: string | undefined) {
    super(code, title, message, hint, EXIT_CODES.COMMAND_ERROR);
    this.name = 'CommandError';
  }
}

/**
 * Internal errors (unexpected issues)
 */
export class InternalError extends OrbitBaseError {
  constructor(code: ErrorCode, title: string, message: string, hint?: string | undefined) {
    super(code, title, message, hint, EXIT_CODES.INTERNAL_ERROR);
    this.name = 'InternalError';
  }
}
