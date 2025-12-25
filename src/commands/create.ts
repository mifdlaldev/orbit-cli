/**
 * Create Command
 * Main command for creating new projects
 */

import type { CreateCommandOptions } from '../core/types.js';

export async function runCreate(
  name: string | undefined,
  options: CreateCommandOptions,
): Promise<void> {
  // Lazy load heavy dependencies
  const { showBanner } = await import('../ui/banner.js');

  // Show banner in interactive mode
  if (!options.yes) {
    await showBanner();
  }

  // TODO: Implement create flow
  console.log('Create command:', { name, options });
}
