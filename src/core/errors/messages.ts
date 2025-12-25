/**
 * Error Messages Constants
 * All error message templates for ORBIT CLI
 */

import type { ErrorCode } from './types.js';

// ═══════════════════════════════════════════════════════════
// VALIDATION ERRORS (V)
// ═══════════════════════════════════════════════════════════

export const VALIDATION = {
  V001: {
    code: 'ORBIT-V001' as ErrorCode,
    title: 'Project name is required',
    message: 'Please provide a project name.',
    hint: 'Usage: orbit create <project-name>',
  },

  V002: {
    code: 'ORBIT-V002' as ErrorCode,
    title: 'Invalid project name',
    message: (name: string) => `"${name}" is not a valid project name.`,
    hint: 'Use lowercase letters, numbers, and dashes only.',
  },

  V003: {
    code: 'ORBIT-V003' as ErrorCode,
    title: 'Project name too long',
    message: (length: number) => `Name is ${length} characters (max 50).`,
    hint: 'Choose a shorter name.',
  },

  V004: {
    code: 'ORBIT-V004' as ErrorCode,
    title: 'Unknown framework',
    message: (fw: string) => `Framework "${fw}" is not supported.`,
    hint: 'Run "orbit list" to see available frameworks.',
  },

  V005: {
    code: 'ORBIT-V005' as ErrorCode,
    title: 'Unknown stack preset',
    message: (stack: string) => `Stack "${stack}" is not available.`,
    hint: 'Available: minimal, standard, full',
  },

  V006: {
    code: 'ORBIT-V006' as ErrorCode,
    title: 'Invalid package manager',
    message: (pm: string) => `"${pm}" is not a valid package manager.`,
    hint: 'Available: npm, yarn, pnpm, bun',
  },
} as const;

// ═══════════════════════════════════════════════════════════
// ENVIRONMENT ERRORS (E)
// ═══════════════════════════════════════════════════════════

export const ENVIRONMENT = {
  E001: {
    code: 'ORBIT-E001' as ErrorCode,
    title: 'Node.js not found',
    message: 'Node.js is required but was not found on your system.',
    hint: 'Install Node.js from https://nodejs.org',
  },

  E002: {
    code: 'ORBIT-E002' as ErrorCode,
    title: 'Node.js version too old',
    message: (current: string, required: string) =>
      `Found Node.js ${current}, but ${required} or higher is required.`,
    hint: 'Update Node.js or use nvm: nvm install 20',
  },

  E003: {
    code: 'ORBIT-E003' as ErrorCode,
    title: 'npm not found',
    message: 'npm is required but was not found.',
    hint: 'npm usually comes with Node.js. Reinstall Node.js.',
  },

  E004: {
    code: 'ORBIT-E004' as ErrorCode,
    title: 'git not found',
    message: 'git is required for version control.',
    hint: 'Install git from https://git-scm.com',
  },

  E005: {
    code: 'ORBIT-E005' as ErrorCode,
    title: 'PHP not found',
    message: 'PHP is required for Laravel projects.',
    hint: 'Install PHP 8.1+ from https://php.net',
  },

  E006: {
    code: 'ORBIT-E006' as ErrorCode,
    title: 'Composer not found',
    message: 'Composer is required for Laravel projects.',
    hint: 'Install Composer from https://getcomposer.org',
  },
} as const;

// ═══════════════════════════════════════════════════════════
// FILESYSTEM ERRORS (F)
// ═══════════════════════════════════════════════════════════

export const FILESYSTEM = {
  F001: {
    code: 'ORBIT-F001' as ErrorCode,
    title: 'Directory already exists',
    message: (path: string) => `Directory "${path}" already exists.`,
    hint: 'Choose a different name or delete the existing directory.',
  },

  F002: {
    code: 'ORBIT-F002' as ErrorCode,
    title: 'Permission denied',
    message: (path: string) => `Cannot access "${path}".`,
    hint: 'Check file permissions or try a different location.',
  },

  F003: {
    code: 'ORBIT-F003' as ErrorCode,
    title: 'Cannot write to directory',
    message: (path: string) => `Cannot create files in "${path}".`,
    hint: 'Check write permissions or try a different location.',
  },

  F004: {
    code: 'ORBIT-F004' as ErrorCode,
    title: 'Invalid path',
    message: 'Path traversal is not allowed.',
    hint: 'Use a simple directory name without ".." or absolute paths.',
  },
} as const;

// ═══════════════════════════════════════════════════════════
// COMMAND ERRORS (C)
// ═══════════════════════════════════════════════════════════

export const COMMAND = {
  C001: {
    code: 'ORBIT-C001' as ErrorCode,
    title: 'Command not allowed',
    message: (cmd: string) => `Command "${cmd}" is not permitted.`,
    hint: 'This is a security restriction.',
  },

  C002: {
    code: 'ORBIT-C002' as ErrorCode,
    title: 'Command failed',
    message: (cmd: string, exitCode: number) => `"${cmd}" exited with code ${exitCode}.`,
    hint: 'Check the output above for details.',
  },

  C003: {
    code: 'ORBIT-C003' as ErrorCode,
    title: 'Command timeout',
    message: 'The operation took too long and was cancelled.',
    hint: 'Check your network connection and try again.',
  },
} as const;

// ═══════════════════════════════════════════════════════════
// INTERNAL ERRORS (I)
// ═══════════════════════════════════════════════════════════

export const INTERNAL = {
  I001: {
    code: 'ORBIT-I001' as ErrorCode,
    title: 'Unexpected error',
    message: (detail: string) => detail || 'An unexpected error occurred.',
    hint: 'Please report this issue at https://github.com/username/orbit-cli/issues',
  },
} as const;
