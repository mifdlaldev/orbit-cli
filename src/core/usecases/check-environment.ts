/**
 * CheckEnvironmentUseCase
 * Check if system meets requirements for a framework
 */

import type { FrameworkId } from '../domain/framework.js';
import type { EnvironmentStatus, ToolStatus } from '../domain/environment.js';
import { ToolDetector } from '../services/tool-detector.js';

export class CheckEnvironmentUseCase {
  private readonly detector: ToolDetector;

  constructor(detector?: ToolDetector | undefined) {
    this.detector = detector ?? new ToolDetector();
  }

  /**
   * Check environment for a specific framework
   */
  async execute(framework: FrameworkId): Promise<EnvironmentStatus> {
    const requiredTools = this.getRequiredTools(framework);
    const results = await Promise.all(requiredTools.map((tool) => this.detector.detect(tool)));

    return {
      tools: results,
      allMet: results.every((r) => r.isInstalled || !r.isRequired),
      missing: results.filter((r) => !r.isInstalled && r.isRequired).map((r) => r.name),
    };
  }

  /**
   * Get required tools for a framework
   */
  private getRequiredTools(framework: FrameworkId): string[] {
    const base = ['node', 'npm'];

    switch (framework) {
      case 'laravel':
        return [...base, 'php', 'composer'];
      default:
        return base;
    }
  }

  /**
   * Check a single tool
   */
  async checkTool(toolName: string): Promise<ToolStatus> {
    return this.detector.detect(toolName);
  }
}
