/**
 * Laravel Framework Configuration
 */

import type { Framework } from './types.js';

const laravel: Framework = {
  id: 'laravel',
  name: 'Laravel',
  description: 'The PHP Framework for Web Artisans',
  category: 'php',
  website: 'https://laravel.com',
  requiredTools: ['php', 'composer'],

  installCommand: {
    npm: 'composer create-project laravel/laravel --no-interaction --prefer-dist --no-progress',
    yarn: 'composer create-project laravel/laravel --no-interaction --prefer-dist --no-progress',
    pnpm: 'composer create-project laravel/laravel --no-interaction --prefer-dist --no-progress',
    bun: 'composer create-project laravel/laravel --no-interaction --prefer-dist --no-progress',
    flags: {},
  },

  stacks: [
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Just Laravel',
      postInstallDeps: [],
      postInstallDevDeps: [],
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Laravel + Breeze + Inertia Vue',
      postInstallDeps: [],
      postInstallDevDeps: [],
    },
    {
      id: 'full',
      name: 'Full Stack',
      description: 'Standard + Pest + Telescope',
      postInstallDeps: [],
      postInstallDevDeps: [],
    },
  ],
};

export default laravel;
