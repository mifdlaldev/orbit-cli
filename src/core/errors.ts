/**
 * Custom Error Classes
 */

export abstract class OrbitError extends Error {
  abstract readonly code: string;
  abstract readonly exitCode: number;
  readonly isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends OrbitError {
  readonly code = 'VALIDATION_ERROR';
  readonly exitCode = 1;
}

export class EnvironmentError extends OrbitError {
  readonly code = 'ENVIRONMENT_ERROR';
  readonly exitCode = 2;
}

export class InstallationError extends OrbitError {
  readonly code = 'INSTALLATION_ERROR';
  readonly exitCode = 3;
}

export class FileSystemError extends OrbitError {
  readonly code = 'FILESYSTEM_ERROR';
  readonly exitCode = 4;
}

export class CommandExecutionError extends OrbitError {
  readonly code = 'COMMAND_ERROR';
  readonly exitCode = 5;

  constructor(
    message: string,
    readonly command: string,
    readonly stderr?: string,
  ) {
    super(message);
  }
}
