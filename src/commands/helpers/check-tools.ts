/**
 * Tool Check Helpers
 * Functions to check installed tools and versions
 *
 * SECURITY: Uses spawnSync with shell:false to prevent command injection
 */

import { spawnSync } from 'node:child_process';

export interface ToolCheckResult {
  ok: boolean;
  version?: string | undefined;
}

/**
 * Execute command safely using spawnSync
 * SECURITY: spawnSync with shell:false prevents command injection
 *
 * @param tool - The tool binary name (e.g., 'node', 'npm')
 * @param args - Arguments array (e.g., ['--version'])
 * @returns Version string or undefined if not found
 */
function getVersion(tool: string, args: readonly string[] = ['--version']): string | undefined {
  try {
    const result = spawnSync(tool, [...args], {
      encoding: 'utf-8',
      shell: false, // SECURITY: Prevent command injection
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 5000, // 5 second timeout to prevent hangs
    });

    if (result.status !== 0 || result.error) {
      return undefined;
    }

    const output = result.stdout.trim();
    // Extract version number (e.g., "v20.10.0" -> "20.10.0")
    const versionRegex = /v?(\d+\.\d+\.\d+)/;
    const match = versionRegex.exec(output);
    return match?.[1] ?? output;
  } catch {
    return undefined;
  }
}

/**
 * Check Node.js
 */
export function checkNode(): ToolCheckResult {
  const version = getVersion('node');
  return { ok: !!version, version };
}

/**
 * Check npm
 */
export function checkNpm(): ToolCheckResult {
  const version = getVersion('npm');
  return { ok: !!version, version };
}

/**
 * Check git
 */
export function checkGit(): ToolCheckResult {
  const version = getVersion('git');
  return { ok: !!version, version };
}

/**
 * Check pnpm
 */
export function checkPnpm(): ToolCheckResult {
  const version = getVersion('pnpm');
  return { ok: !!version, version };
}

/**
 * Check yarn
 */
export function checkYarn(): ToolCheckResult {
  const version = getVersion('yarn');
  return { ok: !!version, version };
}

/**
 * Check bun
 */
export function checkBun(): ToolCheckResult {
  const version = getVersion('bun');
  return { ok: !!version, version };
}

/**
 * Check PHP
 */
export function checkPhp(): ToolCheckResult {
  const version = getVersion('php');
  return { ok: !!version, version };
}

/**
 * Check Composer
 */
export function checkComposer(): ToolCheckResult {
  const version = getVersion('composer');
  return { ok: !!version, version };
}
