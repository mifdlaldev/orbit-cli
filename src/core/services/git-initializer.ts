/**
 * GitInitializer Service
 * Initialize git repository in project
 *
 * SECURITY: Uses spawn with shell:false - NEVER use exec!
 */

import { spawn } from 'node:child_process';

export class GitInitializer {
  /**
   * Initialize git repository in project
   */
  async init(projectPath: string): Promise<void> {
    // 1. git init
    await this.runGit(projectPath, ['init']);

    // 2. git add .
    await this.runGit(projectPath, ['add', '.']);

    // 3. git commit -m "Initial commit from ORBIT CLI"
    await this.runGit(projectPath, ['commit', '-m', 'Initial commit from ORBIT CLI']);
  }

  /**
   * Run git command
   * Git failures are non-critical, so we don't throw
   */
  private runGit(cwd: string, args: string[]): Promise<void> {
    return new Promise((resolve) => {
      const child = spawn('git', args, {
        cwd,
        shell: false, // SECURITY: Never use shell!
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      child.on('close', (code) => {
        if (code !== 0) {
          // Git failure is non-critical, just log warning
          console.warn(`Git command failed: git ${args.join(' ')}`);
        }
        resolve();
      });

      child.on('error', () => {
        // Git not installed - non-critical, just resolve
        resolve();
      });
    });
  }
}
