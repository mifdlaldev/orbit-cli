/**
 * List Command
 * Display available frameworks and their details
 */

import * as p from '@clack/prompts';
import { colors } from '../ui/colors.js';
import { registry } from '../frameworks/index.js';

export async function runList(frameworkId?: string): Promise<void> {
  p.intro(colors.primary('Available Frameworks'));

  if (frameworkId) {
    // Show specific framework details
    const fw = await registry.get(frameworkId);

    if (!fw) {
      console.log();
      console.log(colors.error(`Framework "${frameworkId}" not found.`));
      console.log();
      console.log(colors.dim('Available frameworks:'));
      const ids = registry.getAvailableIds();
      for (const id of ids) {
        console.log(`  ${colors.primary(id)}`);
      }
      console.log();
      process.exit(1);
    }

    console.log();
    console.log(colors.text(colors.bold(fw.name)));
    console.log(colors.dim(fw.description));
    console.log(colors.dim(`Website: ${fw.website}`));
    console.log();
    console.log(colors.info('Stack Presets:'));

    for (const stack of fw.stacks) {
      console.log(`  ${colors.primary(stack.name.padEnd(12))} ${colors.dim(stack.description)}`);
    }

    console.log();
    console.log(colors.info('Required Tools:'));
    console.log(`  ${fw.requiredTools.join(', ')}`);
  } else {
    // List all frameworks
    const frameworks = await registry.getAll();

    // Node.js frameworks
    const nodeFrameworks = frameworks.filter((f) => f.category === 'nodejs');
    if (nodeFrameworks.length > 0) {
      console.log();
      console.log(colors.dim('Node.js Frameworks:'));
      for (const fw of nodeFrameworks) {
        console.log(`  ${colors.primary(fw.name.padEnd(12))} ${colors.dim(fw.description)}`);
      }
    }

    // PHP frameworks
    const phpFrameworks = frameworks.filter((f) => f.category === 'php');
    if (phpFrameworks.length > 0) {
      console.log();
      console.log(colors.dim('PHP Frameworks:'));
      for (const fw of phpFrameworks) {
        console.log(`  ${colors.primary(fw.name.padEnd(12))} ${colors.dim(fw.description)}`);
      }
    }
  }

  console.log();
  p.outro(colors.dim("Run 'orbit create <name> --template <framework>' to get started"));
}
