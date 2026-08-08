/**
 * Create Flow
 * Orchestrates the project creation process, bridging UI and backend
 */

import { createSpinner } from '../ui/spinner.js';
import * as p from '@clack/prompts';
import { createContainer } from '../core/container.js';
import type { CreateProjectInput, ProgressReporter } from '../core/usecases/create-project.js';
import { displaySuccess } from '../ui/error-display.js';
import { validateAndSanitizeProjectName, validateFrameworkId } from '../utils/validation.js';
import { ensureSafeProjectDir } from '../utils/safe-path.js';
import type { FrameworkId, PackageManager } from '../core/domain/index.js';
import { ValidationError, FilesystemError } from '../core/errors/classes.js';
import { VALIDATION, FILESYSTEM } from '../core/errors/messages.js';

/**
 * CLI options accepted by the create command
 */
export interface CreateCliOptions {
  template?: string | undefined;
  pm?: string | undefined;
  stack?: string | undefined;
  yes?: boolean | undefined;
}

const PACKAGE_MANAGERS: readonly PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun'];
const STACK_PRESETS: readonly string[] = ['minimal', 'standard', 'full'];

function hasTty(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

/**
 * Collect user input for project creation
 * Prompts only for fields not supplied via CLI flags.
 * Non-interactive runs need every field or --yes (defaults).
 */
export async function collectCreateInput(
  nameArg: string | undefined,
  options: CreateCliOptions,
): Promise<CreateProjectInput | null> {
  const interactive = hasTty();

  // ═══════════════════════════════════════════════════════════
  // PROJECT NAME
  // ═══════════════════════════════════════════════════════════

  let name = nameArg;
  if (!name) {
    if (interactive && !options.yes) {
      const nameResult = await p.text({
        message: 'What is your project name?',
        placeholder: 'my-awesome-app',
        validate: (value) => {
          const result = validateAndSanitizeProjectName(value);
          if (!result.valid) return result.error;
          return undefined;
        },
      });
      if (p.isCancel(nameResult)) return null;
      name = nameResult as string;
    } else {
      throw new ValidationError(
        VALIDATION.V001.code,
        VALIDATION.V001.title,
        VALIDATION.V001.message,
        VALIDATION.V001.hint,
      );
    }
  }

  const nameCheck = validateAndSanitizeProjectName(name);
  if (!nameCheck.valid) {
    throw new ValidationError(
      VALIDATION.V002.code,
      VALIDATION.V002.title,
      nameCheck.error ?? VALIDATION.V002.message(name),
      VALIDATION.V002.hint,
    );
  }
  name = nameCheck.sanitized;

  const pathCheck = await ensureSafeProjectDir(name);
  if (!pathCheck.safe) {
    if (interactive) {
      p.log.error(pathCheck.error ?? 'Invalid project path');
      return null;
    }
    const detail = pathCheck.error ?? FILESYSTEM.F004.message;
    const entry = detail.includes('already exists') ? FILESYSTEM.F001 : FILESYSTEM.F004;
    throw new FilesystemError(entry.code, entry.title, detail, entry.hint);
  }

  // ═══════════════════════════════════════════════════════════
  // FRAMEWORK
  // ═══════════════════════════════════════════════════════════

  let framework: FrameworkId;
  if (options.template) {
    if (!validateFrameworkId(options.template)) {
      throw new ValidationError(
        VALIDATION.V004.code,
        VALIDATION.V004.title,
        VALIDATION.V004.message(options.template),
        VALIDATION.V004.hint,
      );
    }
    framework = options.template;
  } else if (interactive && !options.yes) {
    const frameworkResult = await p.select({
      message: 'Which framework would you like to use?',
      options: [
        { value: 'nextjs', label: 'Next.js', hint: 'React framework' },
        { value: 'nuxt', label: 'Nuxt', hint: 'Vue framework' },
        { value: 'astro', label: 'Astro', hint: 'Content-focused' },
        { value: 'sveltekit', label: 'SvelteKit', hint: 'Svelte framework' },
        { value: 'remix', label: 'Remix', hint: 'React framework' },
        { value: 'vue', label: 'Vue', hint: 'Progressive framework' },
        { value: 'laravel', label: 'Laravel', hint: 'PHP framework' },
      ],
    });
    if (p.isCancel(frameworkResult)) return null;
    framework = frameworkResult as FrameworkId;
  } else if (options.yes) {
    framework = 'nextjs';
  } else {
    throw new ValidationError(
      VALIDATION.V007.code,
      VALIDATION.V007.title,
      VALIDATION.V007.message('a template (--template)'),
      VALIDATION.V007.hint,
    );
  }

  // ═══════════════════════════════════════════════════════════
  // PACKAGE MANAGER
  // ═══════════════════════════════════════════════════════════

  let packageManager: PackageManager;
  if (options.pm) {
    if (!PACKAGE_MANAGERS.includes(options.pm as PackageManager)) {
      throw new ValidationError(
        VALIDATION.V006.code,
        VALIDATION.V006.title,
        VALIDATION.V006.message(options.pm),
        VALIDATION.V006.hint,
      );
    }
    packageManager = options.pm as PackageManager;
  } else if (interactive && !options.yes) {
    const pmResult = await p.select({
      message: 'Which package manager?',
      options: [
        { value: 'npm', label: 'npm' },
        { value: 'pnpm', label: 'pnpm', hint: 'fast, disk efficient' },
        { value: 'yarn', label: 'yarn' },
        { value: 'bun', label: 'bun', hint: 'fast runtime' },
      ],
    });
    if (p.isCancel(pmResult)) return null;
    packageManager = pmResult as PackageManager;
  } else if (options.yes) {
    packageManager = 'npm';
  } else {
    throw new ValidationError(
      VALIDATION.V007.code,
      VALIDATION.V007.title,
      VALIDATION.V007.message('a package manager (--pm)'),
      VALIDATION.V007.hint,
    );
  }

  // ═══════════════════════════════════════════════════════════
  // STACK PRESET
  // ═══════════════════════════════════════════════════════════

  let stack: string;
  if (options.stack) {
    if (!STACK_PRESETS.includes(options.stack)) {
      throw new ValidationError(
        VALIDATION.V005.code,
        VALIDATION.V005.title,
        VALIDATION.V005.message(options.stack),
        VALIDATION.V005.hint,
      );
    }
    stack = options.stack;
  } else if (interactive && !options.yes) {
    const stackResult = await p.select({
      message: 'Which stack preset?',
      options: [
        { value: 'minimal', label: 'Minimal', hint: 'no extra config' },
        { value: 'standard', label: 'Standard', hint: 'prettier, basic tooling' },
        { value: 'full', label: 'Full', hint: 'prettier, husky, lint-staged' },
      ],
    });
    if (p.isCancel(stackResult)) return null;
    stack = stackResult as string;
  } else if (options.yes) {
    stack = 'minimal';
  } else {
    throw new ValidationError(
      VALIDATION.V007.code,
      VALIDATION.V007.title,
      VALIDATION.V007.message('a stack preset (--stack)'),
      VALIDATION.V007.hint,
    );
  }

  // ═══════════════════════════════════════════════════════════
  // OPTIONS
  // ═══════════════════════════════════════════════════════════

  let selectedOptions: string[];
  if (interactive && !options.yes) {
    const optionsResult = await p.multiselect({
      message: 'Additional options:',
      options: [
        { value: 'typescript', label: 'TypeScript', hint: 'type safety' },
        { value: 'eslint', label: 'ESLint', hint: 'linting' },
        { value: 'git', label: 'Initialize Git', hint: 'git init + commit' },
      ],
      initialValues: ['typescript', 'eslint', 'git'],
      required: false,
    });
    if (p.isCancel(optionsResult)) return null;
    selectedOptions = optionsResult as string[];
  } else {
    selectedOptions = ['typescript', 'eslint', 'git'];
  }

  return {
    name,
    framework,
    version: 'latest',
    packageManager,
    stack,
    options: {
      typescript: selectedOptions.includes('typescript'),
      eslint: selectedOptions.includes('eslint'),
      prettier: stack !== 'minimal',
      git: selectedOptions.includes('git'),
      installDeps: true,
    },
  };
}

/**
 * Run the create project flow
 */
export async function runCreateFlow(input: CreateProjectInput): Promise<boolean> {
  const container = createContainer();
  const interactive = hasTty();
  const spinner = interactive ? createSpinner({ text: 'Preparing project...' }).start() : null;

  const reporter: ProgressReporter = {
    onStart: (msg) => {
      if (spinner) spinner.text = msg;
    },
    onProgress: (step) => {
      if (spinner) spinner.text = step;
    },
    onComplete: (msg) => {
      if (spinner) spinner.succeed(msg);
    },
    onError: (err) => {
      if (spinner) spinner.fail(err.message);
    },
    onChildSpawn: () => {
      spinner?.stop();
    },
    onChildExit: () => {
      if (spinner) spinner.start();
    },
  };

  try {
    const result = await container.usecases.createProject.execute(input, reporter);

    if (result.success) {
      displaySuccess(`Project created at ${result.projectPath}`);

      p.note(result.nextSteps.join('\n'), 'Next steps');
      return true;
    } else {
      if (result.errors && result.errors.length > 0) {
        for (const error of result.errors) {
          p.log.error(error);
        }
      }
      return false;
    }
  } catch (error) {
    spinner?.fail('Project creation failed');
    p.log.error((error as Error).message);
    return false;
  }
}
