/**
 * Astro Framework Configuration
 */

import type { Framework } from './types.js';

const astro: Framework = {
  id: 'astro',
  name: 'Astro',
  description: 'The web framework for content-driven websites',
  category: 'nodejs',
  website: 'https://astro.build',
  requiredTools: ['node', 'npm'],

  installCommand: {
    npm: 'npm create astro@latest -- --yes',
    yarn: 'yarn create astro --yes',
    pnpm: 'pnpm create astro@latest --yes',
    bun: 'bun create astro@latest --yes',
    flags: {},
  },

  stacks: [
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Just Astro',
      postInstallDeps: [],
      postInstallDevDeps: [],
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Astro + Tailwind + MDX',
      postInstallDeps: ['@astrojs/mdx'],
      postInstallDevDeps: ['@astrojs/tailwind', 'prettier-plugin-astro'],
    },
    {
      id: 'full',
      name: 'Full Stack',
      description: 'Standard + React + Testing',
      postInstallDeps: ['@astrojs/react', 'react', 'react-dom'],
      postInstallDevDeps: ['vitest', 'husky'],
    },
  ],
};

export default astro;
