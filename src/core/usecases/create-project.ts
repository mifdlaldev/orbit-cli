/**
 * CreateProjectUseCase
 * Orchestrate the entire project creation flow
 */

import type { FrameworkId, PackageManager } from '../domain/index.js';
import type { ProjectResult } from '../domain/project.js';
import { CheckEnvironmentUseCase } from './check-environment.js';
import { FrameworkInstaller, type InstallInput } from '../services/framework-installer.js';
import { ConfigApplier, type StackConfig } from '../services/config-applier.js';
import { GitInitializer } from '../services/git-initializer.js';
import { ValidationError } from '../errors/classes.js';
import { VALIDATION } from '../errors/messages.js';

/**
 * Input for project creation
 */
export interface CreateProjectInput {
  name: string;
  framework: FrameworkId;
  version: string;
  packageManager: PackageManager;
  stack: string;
  options: {
    typescript?: boolean | undefined;
    eslint?: boolean | undefined;
    prettier?: boolean | undefined;
    git?: boolean | undefined;
    installDeps?: boolean | undefined;
  };
}

/**
 * Progress reporter interface for UI feedback
 */
export interface ProgressReporter {
  onStart?: ((message: string) => void) | undefined;
  onProgress?: ((step: string) => void) | undefined;
  onComplete?: ((message: string) => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
}

export class CreateProjectUseCase {
  private readonly envChecker: CheckEnvironmentUseCase;
  private readonly installer: FrameworkInstaller;
  private readonly configApplier: ConfigApplier;
  private readonly gitInitializer: GitInitializer;

  constructor(
    envChecker?: CheckEnvironmentUseCase | undefined,
    installer?: FrameworkInstaller | undefined,
    configApplier?: ConfigApplier | undefined,
    gitInitializer?: GitInitializer | undefined,
  ) {
    this.envChecker = envChecker ?? new CheckEnvironmentUseCase();
    this.installer = installer ?? new FrameworkInstaller();
    this.configApplier = configApplier ?? new ConfigApplier();
    this.gitInitializer = gitInitializer ?? new GitInitializer();
  }

  /**
   * Execute the project creation flow
   */
  async execute(
    input: CreateProjectInput,
    reporter?: ProgressReporter | undefined,
  ): Promise<ProjectResult> {
    try {
      reporter?.onStart?.('Creating project...');

      // 1. Validate input
      this.validateInput(input);
      reporter?.onProgress?.('Input validated');

      // 2. Check environment
      reporter?.onProgress?.('Checking environment...');
      const envStatus = await this.envChecker.execute(input.framework);
      if (!envStatus.allMet) {
        return this.failWithMissingRequirements(envStatus.missing);
      }
      reporter?.onProgress?.('Environment ready');

      // 3. Install framework
      reporter?.onProgress?.(`Installing ${input.framework}...`);
      const installInput: InstallInput = {
        name: input.name,
        framework: input.framework,
        version: input.version,
        packageManager: input.packageManager,
      };
      const projectPath = await this.installer.install(installInput);
      reporter?.onProgress?.('Framework installed');

      // 4. Apply stack config (if not minimal)
      if (input.stack !== 'minimal') {
        reporter?.onProgress?.('Applying stack configuration...');
        const stackConfig = this.getStackConfig(input.stack);
        await this.configApplier.apply(projectPath, stackConfig, input.packageManager);
        reporter?.onProgress?.('Stack configured');
      }

      // 5. Initialize git (optional)
      if (input.options.git !== false) {
        reporter?.onProgress?.('Initializing git...');
        await this.gitInitializer.init(projectPath);
        reporter?.onProgress?.('Git initialized');
      }

      reporter?.onComplete?.('Project created successfully!');

      return {
        success: true,
        projectPath,
        nextSteps: this.generateNextSteps(input),
      };
    } catch (error) {
      reporter?.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Validate project input
   */
  private validateInput(input: CreateProjectInput): void {
    // Project name validation
    if (!input.name) {
      throw new ValidationError(
        VALIDATION.V001.code,
        VALIDATION.V001.title,
        VALIDATION.V001.message,
        VALIDATION.V001.hint,
      );
    }

    // Project name format
    if (!/^[a-z0-9-]+$/.test(input.name)) {
      throw new ValidationError(
        VALIDATION.V002.code,
        VALIDATION.V002.title,
        VALIDATION.V002.message(input.name),
        VALIDATION.V002.hint,
      );
    }

    // Project name length
    if (input.name.length > 50) {
      throw new ValidationError(
        VALIDATION.V003.code,
        VALIDATION.V003.title,
        VALIDATION.V003.message(input.name.length),
        VALIDATION.V003.hint,
      );
    }
  }

  /**
   * Create failure result for missing requirements
   */
  private failWithMissingRequirements(missing: readonly string[]): ProjectResult {
    return {
      success: false,
      projectPath: '',
      nextSteps: [],
      errors: missing.map((m) => `Missing requirement: ${m}`),
    };
  }

  /**
   * Get stack configuration
   */
  private getStackConfig(stackId: string): StackConfig {
    // Stack configurations
    const stacks: Record<string, StackConfig> = {
      standard: {
        dependencies: [],
        devDependencies: ['prettier', 'eslint-config-prettier'],
        files: {
          '.prettierrc': JSON.stringify({ semi: true, singleQuote: true, tabWidth: 2 }, null, 2),
        },
      },
      full: {
        dependencies: [],
        devDependencies: ['prettier', 'prettier-plugin-tailwindcss', 'husky', 'lint-staged'],
        scripts: {
          prepare: 'husky install',
          format: 'prettier --write .',
        },
        files: {
          '.prettierrc': JSON.stringify(
            {
              semi: true,
              singleQuote: true,
              tabWidth: 2,
              plugins: ['prettier-plugin-tailwindcss'],
            },
            null,
            2,
          ),
          '.lintstagedrc': JSON.stringify(
            { '*.{js,jsx,ts,tsx}': ['prettier --write', 'eslint --fix'] },
            null,
            2,
          ),
        },
      },
    };

    return stacks[stackId] ?? { dependencies: [], devDependencies: [] };
  }

  /**
   * Generate next steps for user
   */
  private generateNextSteps(input: CreateProjectInput): readonly string[] {
    return [`cd ${input.name}`, `${input.packageManager} run dev`];
  }
}
