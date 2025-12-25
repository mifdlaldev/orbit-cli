/**
 * Nuxt Framework Configuration
 */

import type { Framework } from './types.js';

const nuxt: Framework = {
  id: 'nuxt',
  name: 'Nuxt',
  description: 'The Intuitive Vue Framework',
  category: 'nodejs',
  website: 'https://nuxt.com',
  requiredTools: ['node', 'npm'],

  installCommand: {
    npm: 'npx nuxi@latest init',
    yarn: 'yarn dlx nuxi@latest init',
    pnpm: 'pnpm dlx nuxi@latest init',
    bun: 'bunx nuxi@latest init',
    flags: {},
  },

  stacks: [
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Just Nuxt',
      postInstallDeps: [],
      postInstallDevDeps: [],
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Nuxt + Tailwind + ESLint',
      postInstallDeps: [],
      postInstallDevDeps: ['@nuxtjs/tailwindcss', '@nuxtjs/eslint-config-typescript'],
    },
    {
      id: 'full',
      name: 'Full Stack',
      description: 'Standard + Pinia + Testing',
      postInstallDeps: ['@pinia/nuxt', 'zod'],
      postInstallDevDeps: ['vitest', '@vue/test-utils', 'husky'],
    },
  ],
};

export default nuxt;
