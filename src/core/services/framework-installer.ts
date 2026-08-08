/**
 * FrameworkInstaller Service
 * Install framework projects using package managers
 *
 * SECURITY: Uses spawn with shell:false - NEVER use exec!
 */

import { spawn } from 'node:child_process';
import * as path from 'node:path';
import type { FrameworkId, PackageManager } from '../domain/index.js';
import { CommandError, ValidationError } from '../errors/classes.js';
import { COMMAND, VALIDATION } from '../errors/messages.js';
import { registry } from '../../frameworks/index.js';

export interface InstallInput {
  name: string;
  framework: FrameworkId;
  version: string;
  packageManager: PackageManager;
  options?: { typescript?: boolean; eslint?: boolean } | undefined;
}

const COMMAND_TIMEOUT_MS = 600_000;

export class FrameworkInstaller {
  /**
   * Install framework project
   */
  async install(input: InstallInput): Promise<string> {
    const { command, args } = await this.getInstallCommand(input);

    await this.executeCommand(command, args, process.cwd());

    return path.join(process.cwd(), input.name);
  }

  /**
   * Build the install command from the framework registry
   * Single source of truth: src/frameworks/*.ts
   */
  private async getInstallCommand(input: InstallInput): Promise<{
    command: string;
    args: string[];
  }> {
    const framework = await registry.get(input.framework);
    if (!framework) {
      throw new ValidationError(
        VALIDATION.V004.code,
        VALIDATION.V004.title,
        VALIDATION.V004.message(input.framework),
        VALIDATION.V004.hint,
      );
    }

    const template = framework.installCommand[input.packageManager];
    const parts = template.trim().split(/\s+/);
    const [command, ...baseArgs] = parts;
    if (!command) {
      throw new CommandError(
        COMMAND.C002.code,
        COMMAND.C002.title,
        `Empty install command for ${input.framework} + ${input.packageManager}`,
        'Check the framework definition in src/frameworks/.',
      );
    }
    const args = [...baseArgs, input.name];

    if (input.options?.typescript && framework.installCommand.flags.typescript) {
      args.push(...framework.installCommand.flags.typescript.split(/\s+/));
    }
    if (input.options?.eslint && framework.installCommand.flags.eslint) {
      args.push(...framework.installCommand.flags.eslint.split(/\s+/));
    }

    return { command, args };
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
      let settled = false;

      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        child.kill('SIGKILL');
        reject(
          new CommandError(
            COMMAND.C003.code,
            COMMAND.C003.title,
            COMMAND.C003.message,
            COMMAND.C003.hint,
          ),
        );
      }, COMMAND_TIMEOUT_MS);

      child.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        if (code === 0) {
          resolve();
        } else {
          reject(
            new CommandError(
              COMMAND.C002.code,
              COMMAND.C002.title,
              COMMAND.C002.message(command, code ?? 1),
              stderr || COMMAND.C002.hint,
            ),
          );
        }
      });

      child.on('error', (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        reject(
          new CommandError(
            COMMAND.C002.code,
            COMMAND.C002.title,
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
