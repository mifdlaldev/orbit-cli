/**
 * Doctor Flow
 * Orchestrates the system check process, bridging UI and backend
 */

import ora from 'ora';
import * as p from '@clack/prompts';
import chalk from 'chalk';
import { createContainer } from '../core/container.js';
import type { FrameworkId } from '../core/domain/index.js';
import { symbols } from '../ui/symbols.js';

/**
 * Run the doctor check flow
 */
export async function runDoctorFlow(framework?: FrameworkId | undefined): Promise<boolean> {
  const container = createContainer();
  const spinner = ora('Checking system requirements...').start();

  try {
    // Use 'nextjs' as default for base requirements
    const targetFramework = framework ?? 'nextjs';
    const result = await container.usecases.checkEnvironment.execute(targetFramework);

    spinner.stop();

    // Display results
    p.log.info('System Check Results:');
    console.log();

    for (const tool of result.tools) {
      const status = tool.isInstalled
        ? chalk.green(`${symbols.check} ${tool.name}`)
        : tool.isRequired
          ? chalk.red(`${symbols.cross} ${tool.name}`)
          : chalk.yellow(`${symbols.warning} ${tool.name}`);

      const version = tool.version ? chalk.dim(` v${tool.version}`) : '';
      const path = tool.path ? chalk.dim(` (${tool.path})`) : '';
      const required = !tool.isInstalled && tool.isRequired ? chalk.red(' [required]') : '';

      console.log(`  ${status}${version}${path}${required}`);
    }

    console.log();

    if (result.allMet) {
      p.log.success(chalk.green('All requirements met! Ready to create projects.'));
      return true;
    } else {
      p.log.error(chalk.red(`Missing requirements: ${result.missing.join(', ')}`));
      p.log.info('Please install the missing tools and try again.');
      return false;
    }
  } catch (error) {
    spinner.fail('System check failed');
    p.log.error((error as Error).message);
    return false;
  }
}

/**
 * Check a specific tool
 */
export async function checkTool(toolName: string): Promise<boolean> {
  const container = createContainer();
  const spinner = ora(`Checking ${toolName}...`).start();

  try {
    const result = await container.usecases.checkEnvironment.checkTool(toolName);

    if (result.isInstalled) {
      spinner.succeed(
        `${toolName} v${result.version ?? 'unknown'} found at ${result.path ?? 'unknown'}`,
      );
      return true;
    } else {
      spinner.fail(`${toolName} not found`);
      return false;
    }
  } catch (error) {
    spinner.fail(`Failed to check ${toolName}`);
    return false;
  }
}
