/**
 * SvelteKit Framework Configuration
 */

import type { Framework } from './types.js';

const sveltekit: Framework = {
  id: 'sveltekit',
  name: 'SvelteKit',
  description: 'Web development, streamlined',
  category: 'nodejs',
  website: 'https://kit.svelte.dev',
  requiredTools: ['node', 'npm'],

  installCommand: {
    npm: 'npx sv create',
    yarn: 'yarn create svelte',
    pnpm: 'pnpm create svelte',
    bun: 'bunx sv create',
    flags: {},
  },

  stacks: [
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Just SvelteKit',
      postInstallDeps: [],
      postInstallDevDeps: [],
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'SvelteKit + Tailwind + Prettier',
      postInstallDeps: [],
      postInstallDevDeps: ['tailwindcss', 'postcss', 'autoprefixer'],
    },
    {
      id: 'full',
      name: 'Full Stack',
      description: 'Standard + Drizzle + Testing',
      postInstallDeps: ['drizzle-orm', 'zod'],
      postInstallDevDeps: ['drizzle-kit', 'vitest', '@testing-library/svelte'],
    },
  ],
};

export default sveltekit;
