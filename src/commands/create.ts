/**
 * Create Command
 * CLI entry point for project creation - delegates to flows
 *
 * ARCHITECTURE NOTE:
 * This file is a thin wrapper that:
 * 1. Handles CLI options parsing
 * 2. Shows banner/intro
 * 3. Delegates to flows/create-flow.ts for actual implementation
 *
 * Flow: index.ts → commands/create.ts → flows/create-flow.ts → usecases/create-project.ts
 */

import * as p from '@clack/prompts';
import { showBanner } from '../ui/banner.js';
import { colors } from '../ui/colors.js';
import { displayError } from '../ui/error-display.js';
import { collectCreateInput, runCreateFlow } from '../flows/create-flow.js';
import {
  ValidationError,
  EnvironmentError,
  InternalError,
  INTERNAL,
} from '../core/errors/index.js';

interface CreateOptions {
  template?: string | undefined;
  pm?: string | undefined;
  stack?: string | undefined;
  yes?: boolean | undefined;
}

/**
 * Run the create command
 * Entry point called from index.ts
 */
export async function runCreate(
  _projectName: string | undefined, // Reserved for future CLI --name flag integration
  options: CreateOptions,
): Promise<void> {
  try {
    // Show banner unless non-interactive mode
    if (!options.yes) {
      await showBanner();
    }

    p.intro(colors.primary('Create a new project'));

    // ═══════════════════════════════════════════════════════════
    // 1. COLLECT INPUT - Using flows/create-flow.ts
    // ═══════════════════════════════════════════════════════════

    // If projectName provided via CLI, we still use collectCreateInput
    // but it will handle defaults appropriately
    const input = await collectCreateInput();

    if (!input) {
      // User cancelled during prompts
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    // ═══════════════════════════════════════════════════════════
    // 2. EXECUTE - Using flows/create-flow.ts
    // ═══════════════════════════════════════════════════════════

    const success = await runCreateFlow(input);

    if (!success) {
      // Flow already displayed error messages
      process.exit(1);
    }

    // Flow handles success message via displaySuccess and p.note
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
