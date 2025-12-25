/**
 * Vue Framework Configuration
 */

import type { Framework } from './types.js';

const vue: Framework = {
  id: 'vue',
  name: 'Vue',
  description: 'The Progressive JavaScript Framework',
  category: 'nodejs',
  website: 'https://vuejs.org',
  requiredTools: ['node', 'npm'],

  installCommand: {
    npm: 'npm create vue@latest',
    yarn: 'yarn create vue',
    pnpm: 'pnpm create vue',
    bun: 'bun create vue@latest',
    flags: {},
  },

  stacks: [
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Just Vue',
      postInstallDeps: [],
      postInstallDevDeps: [],
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Vue + Router + Pinia',
      postInstallDeps: ['vue-router', 'pinia'],
      postInstallDevDeps: ['tailwindcss'],
    },
    {
      id: 'full',
      name: 'Full Stack',
      description: 'Standard + Testing + Husky',
      postInstallDeps: ['zod', 'axios'],
      postInstallDevDeps: ['vitest', '@vue/test-utils', 'husky'],
    },
  ],
};

export default vue;
