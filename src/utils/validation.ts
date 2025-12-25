/**
 * Validation Utilities
 * Input validation and sanitization functions
 *
 * SECURITY: All user input must be validated before use
 */

import type { FrameworkId } from '../core/domain/framework.js';

/**
 * Valid framework IDs
 */
const VALID_FRAMEWORKS: readonly FrameworkId[] = [
  'nextjs',
  'nuxt',
  'astro',
  'sveltekit',
  'vue',
  'remix',
  'laravel',
] as const;

/**
 * Validate project name
 * - Only lowercase letters, numbers, and hyphens
 * - Must start with a letter
 * - Max 50 characters
 */
export function validateProjectName(name: string): {
  valid: boolean;
  error?: string | undefined;
} {
  if (!name || name.length === 0) {
    return { valid: false, error: 'Project name is required' };
  }

  if (name.length > 50) {
    return { valid: false, error: 'Project name must be 50 characters or less' };
  }

  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    return {
      valid: false,
      error:
        'Project name must start with a letter and contain only lowercase letters, numbers, and hyphens',
    };
  }

  // Check for reserved names
  const reserved = ['node_modules', 'package', 'dist', 'build', 'src', 'test'];
  if (reserved.includes(name)) {
    return { valid: false, error: `"${name}" is a reserved name` };
  }

  return { valid: true };
}

/**
 * Validate framework ID
 */
export function validateFrameworkId(id: string): id is FrameworkId {
  return VALID_FRAMEWORKS.includes(id as FrameworkId);
}

/**
 * Sanitize user input
 * Remove potentially dangerous characters for shell commands
 */
export function sanitizeInput(input: string): string {
  // Remove shell metacharacters and control characters
  return input
    .replace(/[<>;&|$`\\'"(){}[\]!*?~#]/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Validate and sanitize project name (combined)
 */
export function validateAndSanitizeProjectName(name: string): {
  valid: boolean;
  sanitized: string;
  error?: string | undefined;
} {
  const sanitized = sanitizeInput(name);
  const result = validateProjectName(sanitized);
  return {
    ...result,
    sanitized,
  };
}
