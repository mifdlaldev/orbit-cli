/**
 * Create Command
 * Full interactive flow for project creation
 */

import * as p from '@clack/prompts';
import { setTimeout } from 'node:timers/promises';
import { showBanner } from '../ui/banner.js';
import { registry } from '../frameworks/index.js';
import { colors } from '../ui/colors.js';
import { displayError } from '../ui/error-display.js';
import {
  ValidationError,
  EnvironmentError,
  InternalError,
  VALIDATION,
  INTERNAL,
} from '../core/errors/index.js';
import type { PackageManager, StackPresetId } from '../frameworks/types.js';

interface CreateOptions {
  template?: string | undefined;
  pm?: string | undefined;
  stack?: string | undefined;
  yes?: boolean | undefined;
}

export async function runCreate(
  projectName: string | undefined,
  options: CreateOptions,
): Promise<void> {
  try {
    // Skip banner if non-interactive
    if (!options.yes) {
      await showBanner();
    }

    p.intro(colors.primary('Create a new project'));

    // ═══════════════════════════════════════════════════════════
    // 1. PROMPT GROUP - Collect all inputs
    // ═══════════════════════════════════════════════════════════

    const project = await p.group(
      {
        // --- Project Name ---
        name: () => {
          if (projectName) return Promise.resolve(projectName);
          return p.text({
            message: 'What is your project name?',
            placeholder: 'my-awesome-app',
            validate: (value) => {
              if (!value) return VALIDATION.V001.hint;
              if (!/^[a-z0-9-]+$/.test(value)) {
                return VALIDATION.V002.hint;
              }
              if (value.length > 50) return VALIDATION.V003.hint;
              return undefined;
            },
          });
        },

        // --- Framework ---
        framework: async () => {
          if (options.template) {
            // Validate template exists
            const fw = await registry.get(options.template);
            if (!fw) {
              throw new ValidationError(
                VALIDATION.V004.code,
                VALIDATION.V004.title,
                VALIDATION.V004.message(options.template),
                VALIDATION.V004.hint,
              );
            }
            return options.template;
          }
          const frameworks = await registry.getAll();
          return p.select({
            message: 'Which framework would you like to use?',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options: frameworks.map((fw) => ({
              value: fw.id,
              label: fw.name,
              hint: fw.description,
            })) as any,
          });
        },

        // --- Stack Preset ---
        stack: async ({ results }) => {
          if (options.stack) return options.stack as StackPresetId;
          const fw = await registry.get(results.framework as string);
          if (!fw) return 'standard' as StackPresetId;
          return p.select({
            message: 'Choose your stack preset:',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options: fw.stacks.map((s) => ({
              value: s.id,
              label: s.name,
              hint: s.description,
            })) as any,
          });
        },

        // --- Package Manager ---
        packageManager: () => {
          if (options.pm) return Promise.resolve(options.pm as PackageManager);
          return p.select({
            message: 'Which package manager?',
            initialValue: 'npm',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            options: [
              { value: 'npm', label: 'npm', hint: 'Default' },
              { value: 'pnpm', label: 'pnpm', hint: 'Fast, efficient' },
              { value: 'yarn', label: 'yarn', hint: 'Classic' },
              { value: 'bun', label: 'bun', hint: 'Ultra fast' },
            ] as any,
          });
        },

        // --- Confirmation ---
        confirm: ({ results }) => {
          if (options.yes) return Promise.resolve(true);
          return p.confirm({
            message: `Create "${results.name}" with ${results.framework} (${results.stack}) using ${results.packageManager}?`,
            initialValue: true,
          });
        },
      },
      {
        onCancel: () => {
          p.cancel('Operation cancelled.');
          process.exit(0);
        },
      },
    );

    // ═══════════════════════════════════════════════════════════
    // 2. VALIDATION - User declined
    // ═══════════════════════════════════════════════════════════

    if (!project.confirm) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    // ═══════════════════════════════════════════════════════════
    // 3. EXECUTION - Run installation tasks
    // ═══════════════════════════════════════════════════════════

    await p.tasks([
      {
        title: 'Creating project directory',
        task: async () => {
          // TODO: mkdir logic
          await setTimeout(500); // Simulated delay
          return 'Directory created';
        },
      },
      {
        title: `Installing ${project.framework}`,
        task: async () => {
          // TODO: Execute create command
          await setTimeout(2000); // Simulated delay
          return `${project.framework} installed`;
        },
      },
      {
        title: 'Installing additional dependencies',
        task: async () => {
          // TODO: Post-install deps
          await setTimeout(1000);
          return 'Dependencies installed';
        },
      },
      {
        title: 'Initializing git',
        task: async () => {
          // TODO: git init
          await setTimeout(300);
          return 'Git initialized';
        },
      },
    ]);

    // ═══════════════════════════════════════════════════════════
    // 4. SUCCESS - Show completion message
    // ═══════════════════════════════════════════════════════════

    p.outro(`
${colors.success('✓')} Project created successfully!

${colors.dim('Next steps:')}
  cd ${project.name}
  ${project.packageManager} run dev

${colors.dim('Happy coding!')} 🚀
    `);
  } catch (error) {
    // ═══════════════════════════════════════════════════════════
    // ERROR HANDLING
    // ═══════════════════════════════════════════════════════════

    if (error instanceof ValidationError) {
      displayError(error.toJSON());
      process.exit(error.exitCode);
    }

    if (error instanceof EnvironmentError) {
      displayError(error.toJSON());
      process.exit(error.exitCode);
    }

    // Unknown error
    const internalError = new InternalError(
      INTERNAL.I001.code,
      INTERNAL.I001.title,
      INTERNAL.I001.message(error instanceof Error ? error.message : String(error)),
      INTERNAL.I001.hint,
    );

    displayError(internalError.toJSON());

    if (process.env.DEBUG) {
      console.error(error);
    }

    process.exit(internalError.exitCode);
  }
}
