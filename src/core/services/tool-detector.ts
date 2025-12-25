/**
 * ToolDetector Service
 * Detect installed tools and their versions on the system
 *
 * SECURITY: Uses spawn with shell:false - NEVER use exec!
 */

import { spawn } from 'node:child_process';
import type { ToolStatus } from '../domain/environment.js';

export class ToolDetector {
  /**
   * Detect if a tool is installed and get its version
   */
  async detect(toolName: string): Promise<ToolStatus> {
    const path = await this.findPath(toolName);

    if (!path) {
      return {
        name: toolName,
        version: null,
        path: null,
        isInstalled: false,
        isRequired: true,
      };
    }

    const version = await this.getVersion(toolName);

    return {
      name: toolName,
      version,
      path,
      isInstalled: true,
      isRequired: true,
    };
  }

  /**
   * Find executable path using 'which' (unix) or 'where' (windows)
   */
  private async findPath(command: string): Promise<string | null> {
    const isWindows = process.platform === 'win32';
    const finder = isWindows ? 'where' : 'which';

    try {
      const result = await this.exec(finder, [command]);
      return result.stdout.trim().split('\n')[0] || null;
    } catch {
      return null;
    }
  }

  /**
   * Get version by running '<tool> --version'
   */
  private async getVersion(tool: string): Promise<string | null> {
    try {
      const result = await this.exec(tool, ['--version']);
      // Parse version from output (varies by tool)
      const match = result.stdout.match(/(\d+\.\d+\.\d+)/);
      return match?.[1] || null;
    } catch {
      return null;
    }
  }

  /**
   * Execute command safely using spawn (NOT exec!)
   * SECURITY: shell is always false to prevent command injection
   */
  private exec(command: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        shell: false, // SECURITY: Never use shell!
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }
}
