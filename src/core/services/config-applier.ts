/**
 * ConfigApplier Service
 * Apply stack preset configurations to projects
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import type { PackageManager } from '../domain/index.js';

export interface StackConfig {
  readonly dependencies: readonly string[];
  readonly devDependencies: readonly string[];
  readonly files?: Record<string, string> | undefined;
  readonly scripts?: Record<string, string> | undefined;
}

export class ConfigApplier {
  /**
   * Apply stack preset configurations to project
   */
  async apply(
    projectPath: string,
    stackConfig: StackConfig,
    packageManager: PackageManager = 'npm',
  ): Promise<void> {
    // 1. Install additional dependencies
    if (stackConfig.dependencies.length > 0) {
      await this.installDeps(projectPath, stackConfig.dependencies, false, packageManager);
    }

    if (stackConfig.devDependencies.length > 0) {
      await this.installDeps(projectPath, stackConfig.devDependencies, true, packageManager);
    }

    // 2. Apply configuration files
    if (stackConfig.files) {
      for (const [filename, content] of Object.entries(stackConfig.files)) {
        const filepath = path.join(projectPath, filename);
        // Ensure directory exists
        await fs.mkdir(path.dirname(filepath), { recursive: true });
        await fs.writeFile(filepath, content, 'utf-8');
      }
    }

    // 3. Update package.json scripts
    if (stackConfig.scripts) {
      await this.updatePackageJson(projectPath, { scripts: stackConfig.scripts });
    }
  }

  /**
   * Install dependencies using package manager
   */
  private async installDeps(
    projectPath: string,
    deps: readonly string[],
    isDev: boolean,
    packageManager: PackageManager,
  ): Promise<void> {
    const args = this.getInstallArgs(packageManager, deps, isDev);

    return new Promise((resolve, reject) => {
      const child = spawn(packageManager, args, {
        cwd: projectPath,
        shell: false, // SECURITY: Never use shell!
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Failed to install dependencies: exit code ${code}`));
        }
      });

      child.on('error', reject);
    });
  }

  /**
   * Get install arguments for package manager
   */
  private getInstallArgs(pm: PackageManager, deps: readonly string[], isDev: boolean): string[] {
    const devFlag: Record<PackageManager, string> = {
      npm: '-D',
      yarn: '-D',
      pnpm: '-D',
      bun: '-d',
    };

    const baseArgs: Record<PackageManager, string[]> = {
      npm: ['install'],
      yarn: ['add'],
      pnpm: ['add'],
      bun: ['add'],
    };

    const args = [...baseArgs[pm], ...deps];
    if (isDev) {
      args.push(devFlag[pm]);
    }
    return args;
  }

  /**
   * Update package.json with new properties
   */
  private async updatePackageJson(
    projectPath: string,
    updates: Record<string, unknown>,
  ): Promise<void> {
    const pkgPath = path.join(projectPath, 'package.json');

    try {
      const content = await fs.readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(content) as Record<string, unknown>;

      // Merge updates
      for (const [key, value] of Object.entries(updates)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Deep merge for objects like scripts
          pkg[key] = { ...(pkg[key] as Record<string, unknown>), ...value };
        } else {
          pkg[key] = value;
        }
      }

      await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    } catch (error) {
      // If package.json doesn't exist, skip silently
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
