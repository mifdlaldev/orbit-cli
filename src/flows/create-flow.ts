/**
 * Create Flow
 * Orchestrates the project creation process, bridging UI and backend
 */

import ora from 'ora';
import * as p from '@clack/prompts';
import { createContainer } from '../core/container.js';
import type { CreateProjectInput, ProgressReporter } from '../core/usecases/create-project.js';
import { displaySuccess } from '../ui/error-display.js';
import { validateAndSanitizeProjectName, validateFrameworkId } from '../utils/validation.js';
import { ensureSafeProjectDir } from '../utils/safe-path.js';
import type { FrameworkId, PackageManager } from '../core/domain/index.js';

/**
 * Collect user input for project creation
 */
export async function collectCreateInput(): Promise<CreateProjectInput | null> {
  // Project name
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
  const name = nameResult as string;

  // Validate path safety
  const pathCheck = await ensureSafeProjectDir(name);
  if (!pathCheck.safe) {
    p.log.error(pathCheck.error ?? 'Invalid project path');
    return null;
  }

  // Framework selection
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
  const framework = frameworkResult as FrameworkId;

  if (!validateFrameworkId(framework)) {
    p.log.error('Invalid framework selected');
    return null;
  }

  // Package manager
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
  const packageManager = pmResult as PackageManager;

  // Stack preset
  const stackResult = await p.select({
    message: 'Which stack preset?',
    options: [
      { value: 'minimal', label: 'Minimal', hint: 'no extra config' },
      { value: 'standard', label: 'Standard', hint: 'prettier, basic tooling' },
      { value: 'full', label: 'Full', hint: 'prettier, husky, lint-staged' },
    ],
  });

  if (p.isCancel(stackResult)) return null;
  const stack = stackResult as string;

  // Options
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
  const options = optionsResult as string[];

  return {
    name,
    framework,
    version: 'latest',
    packageManager,
    stack,
    options: {
      typescript: options.includes('typescript'),
      eslint: options.includes('eslint'),
      prettier: stack !== 'minimal',
      git: options.includes('git'),
      installDeps: true,
    },
  };
}

/**
 * Run the create project flow
 */
export async function runCreateFlow(input: CreateProjectInput): Promise<boolean> {
  const container = createContainer();
  const spinner = ora('Preparing project...').start();

  const reporter: ProgressReporter = {
    onStart: (msg) => {
      spinner.text = msg;
    },
    onProgress: (step) => {
      spinner.text = step;
    },
    onComplete: (msg) => {
      spinner.succeed(msg);
    },
    onError: (err) => {
      spinner.fail(err.message);
    },
  };

  try {
    const result = await container.usecases.createProject.execute(input, reporter);

    if (result.success) {
      displaySuccess(`Project created at ${result.projectPath}`);

      // Show next steps
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
    spinner.fail('Project creation failed');
    p.log.error((error as Error).message);
    return false;
  }
}
