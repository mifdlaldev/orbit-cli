/**
 * Doctor Command
 * Check system requirements and installed tools
 */

import * as p from '@clack/prompts';
import { colors, c } from '../ui/colors.js';
import {
  checkNode,
  checkNpm,
  checkGit,
  checkPnpm,
  checkYarn,
  checkBun,
  checkPhp,
  checkComposer,
} from './helpers/check-tools.js';

interface ToolCheck {
  name: string;
  required: boolean;
  check: () => { ok: boolean; version?: string | undefined };
}

export function runDoctor(): void {
  p.intro(colors.primary('System Check'));

  const s = p.spinner();
  s.start('Checking environment...');

  // Define checks
  const checks: ToolCheck[] = [
    { name: 'Node.js', required: true, check: checkNode },
    { name: 'npm', required: true, check: checkNpm },
    { name: 'git', required: true, check: checkGit },
    { name: 'pnpm', required: false, check: checkPnpm },
    { name: 'yarn', required: false, check: checkYarn },
    { name: 'bun', required: false, check: checkBun },
    { name: 'PHP', required: false, check: checkPhp },
    { name: 'Composer', required: false, check: checkComposer },
  ];

  const results: {
    name: string;
    ok: boolean;
    version?: string | undefined;
    required: boolean;
  }[] = [];

  // Run checks
  for (const tool of checks) {
    const result = tool.check();
    results.push({
      name: tool.name,
      ok: result.ok,
      version: result.version,
      required: tool.required,
    });
  }

  s.stop('Environment check complete');

  // Display results
  console.log();
  for (const r of results) {
    const version = r.version ? `v${r.version}` : '';
    if (r.ok) {
      console.log(c.ok(`${r.name.padEnd(12)} ${colors.dim(version)}`));
    } else if (r.required) {
      console.log(c.fail(`${r.name.padEnd(12)} ${colors.error('(not found - REQUIRED)')}`));
    } else {
      console.log(c.warn(`${r.name.padEnd(12)} ${colors.dim('(not found - optional)')}`));
    }
  }
  console.log();

  const allRequiredMet = results.every((r) => !r.required || r.ok);

  if (allRequiredMet) {
    p.outro(colors.success("All requirements met! You're ready to go. 🚀"));
  } else {
    p.outro(colors.error('Missing required tools. Please install them first.'));
    process.exit(1);
  }
}
