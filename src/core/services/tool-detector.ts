/**
 * Tool Detector Service
 * Detects installed development tools
 */

import { execute } from '../../utils/executor.js';

export interface DetectedTool {
  name: string;
  command: string;
  isInstalled: boolean;
  version: string | undefined;
}

export class ToolDetector {
  async detect(command: string, versionArg = '--version'): Promise<DetectedTool> {
    try {
      const result = await execute(command, [versionArg]);
      const version = result.stdout.trim().split('\n')[0];
      return {
        name: command,
        command,
        isInstalled: result.code === 0,
        version: result.code === 0 ? version : undefined,
      };
    } catch {
      return {
        name: command,
        command,
        isInstalled: false,
        version: undefined,
      };
    }
  }

  async detectAll(commands: string[]): Promise<DetectedTool[]> {
    return Promise.all(commands.map((cmd) => this.detect(cmd)));
  }
}
