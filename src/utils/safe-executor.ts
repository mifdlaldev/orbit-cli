/**
 * Safe Executor Utilities
 * Secure command execution with spawn
 *
 * SECURITY: NEVER use exec! Always use spawn with shell: false
 */

import { spawn, type SpawnOptions, type ChildProcess } from 'node:child_process';

export interface SpawnResult {
  readonly code: number | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly signal: NodeJS.Signals | null;
}

export interface SafeSpawnOptions {
  cwd?: string | undefined;
  timeout?: number | undefined;
  env?: NodeJS.ProcessEnv | undefined;
  onStdout?: ((data: string) => void) | undefined;
  onStderr?: ((data: string) => void) | undefined;
}

/**
 * Sensitive environment variables to remove
 */
const SENSITIVE_ENV_KEYS = [
  'AWS_SECRET_ACCESS_KEY',
  'AWS_ACCESS_KEY_ID',
  'GITHUB_TOKEN',
  'GH_TOKEN',
  'NPM_TOKEN',
  'DATABASE_URL',
  'DB_PASSWORD',
  'API_KEY',
  'SECRET_KEY',
  'PRIVATE_KEY',
  'JWT_SECRET',
  'SESSION_SECRET',
  'ENCRYPTION_KEY',
  'SUPABASE_SERVICE_KEY',
  'STRIPE_SECRET_KEY',
] as const;

/**
 * Sanitize environment variables
 * Remove sensitive keys before passing to child process
 */
export function sanitizeEnv(env?: NodeJS.ProcessEnv | undefined): NodeJS.ProcessEnv {
  const baseEnv = env ?? process.env;
  const sanitized = { ...baseEnv };

  for (const key of SENSITIVE_ENV_KEYS) {
    delete sanitized[key];
  }

  // Also remove any key containing "SECRET", "PASSWORD", "TOKEN", "KEY"
  for (const key of Object.keys(sanitized)) {
    const upperKey = key.toUpperCase();
    if (
      upperKey.includes('SECRET') ||
      upperKey.includes('PASSWORD') ||
      upperKey.includes('_TOKEN') ||
      upperKey.includes('PRIVATE_KEY')
    ) {
      delete sanitized[key];
    }
  }

  return sanitized;
}

/**
 * Execute a command safely using spawn
 * SECURITY: shell is ALWAYS false to prevent command injection
 */
export function safeSpawn(
  command: string,
  args: readonly string[],
  options?: SafeSpawnOptions | undefined,
): Promise<SpawnResult> {
  return new Promise((resolve, reject) => {
    const spawnOptions: SpawnOptions = {
      cwd: options?.cwd ?? process.cwd(),
      shell: false, // CRITICAL: Never use shell!
      stdio: ['pipe', 'pipe', 'pipe'],
      env: sanitizeEnv(options?.env),
    };

    let child: ChildProcess;
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    try {
      child = spawn(command, [...args], spawnOptions);
    } catch (error) {
      reject(new Error(`Failed to spawn command: ${command}`));
      return;
    }

    // Set timeout if specified
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (options?.timeout) {
      timeoutId = setTimeout(() => {
        timedOut = true;
        child.kill('SIGTERM');
        // Force kill after 5 seconds
        setTimeout(() => child.kill('SIGKILL'), 5000);
      }, options.timeout);
    }

    child.stdout?.on('data', (data: Buffer) => {
      const str = data.toString();
      stdout += str;
      options?.onStdout?.(str);
    });

    child.stderr?.on('data', (data: Buffer) => {
      const str = data.toString();
      stderr += str;
      options?.onStderr?.(str);
    });

    child.on('close', (code, signal) => {
      if (timeoutId) clearTimeout(timeoutId);

      if (timedOut) {
        reject(new Error(`Command timed out after ${options?.timeout}ms`));
        return;
      }

      resolve({
        code,
        stdout,
        stderr,
        signal,
      });
    });

    child.on('error', (error) => {
      if (timeoutId) clearTimeout(timeoutId);
      reject(error);
    });
  });
}

/**
 * Execute a command and throw on non-zero exit
 */
export async function safeExec(
  command: string,
  args: readonly string[],
  options?: SafeSpawnOptions | undefined,
): Promise<string> {
  const result = await safeSpawn(command, args, options);

  if (result.code !== 0) {
    throw new Error(`Command "${command}" exited with code ${result.code}: ${result.stderr}`);
  }

  return result.stdout;
}
