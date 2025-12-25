/**
 * Safe Environment Utilities
 * SECURITY: Sanitize environment variables
 */

const BLOCKED_ENV_KEYS = new Set([
  'PATH',
  'NODE_PATH',
  'LD_PRELOAD',
  'LD_LIBRARY_PATH',
  'DYLD_INSERT_LIBRARIES',
]);

/**
 * Sanitize environment variables
 * Removes potentially dangerous keys
 */
export function sanitizeEnv(env: NodeJS.ProcessEnv, allowList?: string[]): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) continue;
    if (BLOCKED_ENV_KEYS.has(key)) continue;
    if (allowList && !allowList.includes(key)) continue;

    result[key] = value;
  }

  return result;
}
