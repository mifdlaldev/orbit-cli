/**
 * FrameworkInstaller Service
 * Install framework projects using package managers
 *
 * SECURITY: Uses spawn with shell:false - NEVER use exec!
 */

import { spawn } from 'node:child_process';
import * as path from 'node:path';
import type { FrameworkId, PackageManager } from '../domain/index.js';
import { CommandError } from '../errors/classes.js';

export interface InstallInput {
  name: string;
  framework: FrameworkId;
  version: string;
  packageManager: PackageManager;
}

export class FrameworkInstaller {
  /**
   * Install framework project
   */
  async install(input: InstallInput): Promise<string> {
    const { command, args } = this.getInstallCommand(input);

    await this.executeCommand(command, args, process.cwd());

    return path.join(process.cwd(), input.name);
  }

  /**
   * Get install command for framework
   */
  private getInstallCommand(input: InstallInput): {
    command: string;
    args: readonly string[];
  } {
    const { framework, name, packageManager } = input;

    // Map framework to create command
    const commands: Record<FrameworkId, { command: string; args: string[] }> = {
      nextjs: {
        command: 'npx',
        args: ['create-next-app@latest', name, '--typescript', '--eslint'],
      },
      nuxt: {
        command: 'npx',
        args: ['nuxi@latest', 'init', name],
      },
      astro: {
        command: 'npm',
        args: ['create', 'astro@latest', name],
      },
      sveltekit: {
        command: 'npm',
        args: ['create', 'svelte@latest', name],
      },
      vue: {
        command: 'npm',
        args: ['create', 'vue@latest', name],
      },
      remix: {
        command: 'npx',
        args: ['create-remix@latest', name],
      },
      laravel: {
        command: 'composer',
        args: ['create-project', 'laravel/laravel', name],
      },
    };

    const cmd = commands[framework];

    // Override command based on package manager for npm-based frameworks
    if (packageManager !== 'npm' && framework !== 'laravel') {
      if (packageManager === 'pnpm') {
        return { command: 'pnpm', args: ['create', ...cmd.args.slice(1)] };
      }
      if (packageManager === 'yarn') {
        return { command: 'yarn', args: ['create', ...cmd.args.slice(1)] };
      }
      if (packageManager === 'bun') {
        return { command: 'bunx', args: cmd.args };
      }
    }

    return cmd;
  }

  /**
   * Execute installation command with spawn (SECURE)
   */
  private executeCommand(command: string, args: readonly string[], cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, [...args], {
        cwd,
        shell: false, // SECURITY: Never use shell!
        stdio: ['inherit', 'inherit', 'pipe'],
        env: this.getSafeEnv(),
      });

      let stderr = '';
      child.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(
            new CommandError(
              'ORBIT-C002',
              'Installation failed',
              `Installation failed with code ${code}`,
              stderr || 'Check the output above for details.',
            ),
          );
        }
      });

      child.on('error', (err) => {
        reject(
          new CommandError(
            'ORBIT-C002',
            'Command failed',
            err.message,
            'Make sure the command is installed and accessible.',
          ),
        );
      });
    });
  }

  /**
   * Create safe environment without sensitive vars
   * SECURITY: Remove potentially sensitive environment variables
   */
  private getSafeEnv(): NodeJS.ProcessEnv {
    const env = { ...process.env };
    // Remove potentially sensitive environment variables
    const sensitiveKeys = [
      'AWS_SECRET_ACCESS_KEY',
      'GITHUB_TOKEN',
      'NPM_TOKEN',
      'DATABASE_URL',
      'API_KEY',
      'SECRET_KEY',
      'PRIVATE_KEY',
    ];
    sensitiveKeys.forEach((key) => delete env[key]);
    return env;
  }
}
