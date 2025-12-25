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
    npm: 'npx create-remix@latest',
    yarn: 'yarn create remix',
    pnpm: 'pnpm create remix@latest',
    bun: 'bunx create-remix@latest',
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
