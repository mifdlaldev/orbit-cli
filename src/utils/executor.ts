/**
 * Safe Command Executor
 * SECURITY: Always use spawn with shell: false
 */

import { spawn, type SpawnOptions } from 'child_process';
import { CommandExecutionError } from '../core/errors.js';

export interface ExecResult {
  code: number;
  stdout: string;
  stderr: string;
}

export async function execute(
  command: string,
  args: readonly string[],
  options?: Partial<SpawnOptions>,
): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, [...args], {
      shell: false, // SECURITY: Never use shell!
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options,
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });
    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });

    child.on('error', (err) => {
      reject(new CommandExecutionError(err.message, `${command} ${args.join(' ')}`, stderr));
    });
  });
}
