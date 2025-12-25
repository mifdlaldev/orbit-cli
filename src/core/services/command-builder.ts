/**
 * Install Command Builder
 * Builds the correct install command for each framework/pm/stack combination
 */

import type { Framework, StackPreset, PackageManager } from '../../frameworks/types.js';

interface BuildResult {
  primary: { command: string; args: string[] };
  postInstall?: { command: string; args: string[] }[] | undefined;
}

export function buildInstallCommand(
  framework: Framework,
  projectName: string,
  pm: PackageManager,
  stack: StackPreset,
  options: {
    typescript?: boolean;
    eslint?: boolean;
    tailwind?: boolean;
  } = {},
): BuildResult {
  const baseCmd = framework.installCommand[pm];
  const [command, ...baseArgs] = baseCmd.split(' ');

  // Add project name
  const args = [...baseArgs, projectName];

  // Add flags
  const flags = framework.installCommand.flags;
  if (options.typescript && flags.typescript) {
    args.push(flags.typescript);
  }
  if (options.eslint && flags.eslint) {
    args.push(flags.eslint);
  }
  if (options.tailwind && flags.tailwind) {
    args.push(flags.tailwind);
  }

  // Build post-install commands
  const postInstall: { command: string; args: string[] }[] = [];

  if (stack.postInstallDeps && stack.postInstallDeps.length > 0) {
    const addCmd = pm === 'npm' ? 'install' : 'add';
    postInstall.push({
      command: pm,
      args: [addCmd, ...stack.postInstallDeps],
    });
  }

  if (stack.postInstallDevDeps && stack.postInstallDevDeps.length > 0) {
    const addCmd = pm === 'npm' ? 'install' : 'add';
    const devFlag = pm === 'npm' ? '-D' : '-D';
    postInstall.push({
      command: pm,
      args: [addCmd, devFlag, ...stack.postInstallDevDeps],
    });
  }

  return {
    primary: { command: command ?? pm, args },
    postInstall: postInstall.length > 0 ? postInstall : undefined,
  };
}
