/**
 * ORBIT CLI - Entry Point
 *
 * PENTING: File ini harus MINIMAL!
 * - Hanya import commander
 * - Semua logic di-lazy load
 */

import { program } from 'commander';

// Package info
const VERSION = '1.0.0';
const NAME = 'orbit';
const DESCRIPTION = 'Universal Project Generator';

program.name(NAME).description(DESCRIPTION).version(VERSION);

// Register commands (lazy loaded internally)
program
  .command('create [name]')
  .description('Create a new project')
  .option('-t, --template <template>', 'Framework template')
  .option('-p, --pm <manager>', 'Package manager (npm|yarn|pnpm|bun)')
  .option('-s, --stack <stack>', 'Stack preset (minimal|standard|full)')
  .option('-y, --yes', 'Skip prompts, use defaults')
  .action(async (name, options) => {
    const { runCreate } = await import('./commands/create.js');
    await runCreate(name, options);
  });

program
  .command('list [framework]')
  .description('List available frameworks and versions')
  .action(async (framework) => {
    const { runList } = await import('./commands/list.js');
    await runList(framework);
  });

program
  .command('doctor')
  .description('Check system requirements')
  .action(async () => {
    const { runDoctor } = await import('./commands/doctor.js');
    await runDoctor();
  });

program.parse();
