/**
 * Next.js Framework Configuration
 */

import type { Framework } from './types.js';

const nextjs: Framework = {
  id: 'nextjs',
  name: 'Next.js',
  description: 'The React Framework for the Web',
  category: 'nodejs',
  website: 'https://nextjs.org',
  requiredTools: ['node', 'npm'],

  installCommand: {
    npm: 'npx create-next-app@latest',
    yarn: 'yarn create next-app',
    pnpm: 'pnpm create next-app',
    bun: 'bunx create-next-app',
    flags: {
      typescript: '--ts',
      eslint: '--eslint',
      tailwind: '--tailwind',
      srcDir: '--src-dir',
    },
  },

  stacks: [
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Just Next.js with TypeScript',
      postInstallDeps: [],
      postInstallDevDeps: [],
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Next.js + Tailwind + ESLint',
      postInstallDeps: [],
      postInstallDevDeps: ['prettier', 'prettier-plugin-tailwindcss'],
    },
    {
      id: 'full',
      name: 'Full Stack',
      description: 'Standard + Testing + Husky',
      postInstallDeps: ['zod'],
      postInstallDevDeps: ['vitest', '@testing-library/react', 'husky', 'lint-staged'],
    },
  ],
};

export default nextjs;
