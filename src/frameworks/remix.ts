/**
 * Remix Framework Configuration
 */

import type { Framework } from './types.js';

const remix: Framework = {
  id: 'remix',
  name: 'Remix',
  description: 'Full stack web framework',
  category: 'nodejs',
  website: 'https://remix.run',
  requiredTools: ['node', 'npm'],

  installCommand: {
    npm: 'npx --yes create-react-router@latest --yes',
    yarn: 'yarn create react-router --yes',
    pnpm: 'pnpm create react-router --yes',
    bun: 'bunx create-react-router@latest --yes',
    flags: {},
  },

  stacks: [
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Just Remix',
      postInstallDeps: [],
      postInstallDevDeps: [],
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Remix + Tailwind',
      postInstallDeps: [],
      postInstallDevDeps: ['tailwindcss', 'postcss', 'autoprefixer'],
    },
    {
      id: 'full',
      name: 'Full Stack',
      description: 'Standard + Prisma + Testing',
      postInstallDeps: ['@prisma/client', 'zod'],
      postInstallDevDeps: ['prisma', 'vitest', '@testing-library/react'],
    },
  ],
};

export default remix;
