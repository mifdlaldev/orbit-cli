/**
 * Tool Check Helpers
 * Functions to check installed tools and versions
 */

import { execSync } from 'node:child_process';

export interface ToolCheckResult {
  ok: boolean;
  version?: string | undefined;
}

/**
 * Execute command and get version
 */
function getVersion(command: string): string | undefined {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    // Extract version number (e.g., "v20.10.0" -> "20.10.0")
    const match = output.match(/v?(\d+\.\d+\.\d+)/);
    return match?.[1] ?? output;
  } catch {
    return undefined;
  }
}

/**
 * Check Node.js
 */
export function checkNode(): ToolCheckResult {
  const version = getVersion('node --version');
  return { ok: !!version, version };
}

/**
 * Check npm
 */
export function checkNpm(): ToolCheckResult {
  const version = getVersion('npm --version');
  return { ok: !!version, version };
}

/**
 * Check git
 */
export function checkGit(): ToolCheckResult {
  const version = getVersion('git --version');
  return { ok: !!version, version };
}

/**
 * Check pnpm
 */
export function checkPnpm(): ToolCheckResult {
  const version = getVersion('pnpm --version');
  return { ok: !!version, version };
}

/**
 * Check yarn
 */
export function checkYarn(): ToolCheckResult {
  const version = getVersion('yarn --version');
  return { ok: !!version, version };
}

/**
 * Check bun
 */
export function checkBun(): ToolCheckResult {
  const version = getVersion('bun --version');
  return { ok: !!version, version };
}

/**
 * Check PHP
 */
export function checkPhp(): ToolCheckResult {
  const version = getVersion('php --version');
  return { ok: !!version, version };
}

/**
 * Check Composer
 */
export function checkComposer(): ToolCheckResult {
  const version = getVersion('composer --version');
  return { ok: !!version, version };
}
