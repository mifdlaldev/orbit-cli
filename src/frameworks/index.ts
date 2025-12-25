/**
 * Framework Registry
 * Lazy loading pattern for framework configs
 */

import type { Framework, FrameworkId } from './types.js';

// Lazy loaders for each framework
const loaders: Record<FrameworkId, () => Promise<Framework>> = {
  nextjs: () => import('./nextjs.js').then((m) => m.default),
  nuxt: () => import('./nuxt.js').then((m) => m.default),
  astro: () => import('./astro.js').then((m) => m.default),
  sveltekit: () => import('./sveltekit.js').then((m) => m.default),
  vue: () => import('./vue.js').then((m) => m.default),
  remix: () => import('./remix.js').then((m) => m.default),
  laravel: () => import('./laravel.js').then((m) => m.default),
};

class FrameworkRegistry {
  private readonly cache = new Map<string, Framework>();

  getAvailableIds(): FrameworkId[] {
    return Object.keys(loaders) as FrameworkId[];
  }

  async get(id: string): Promise<Framework | undefined> {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }

    const loader = loaders[id as FrameworkId];
    if (!loader) {
      return undefined;
    }

    const framework = await loader();
    this.cache.set(id, framework);
    return framework;
  }

  async getAll(): Promise<Framework[]> {
    const ids = this.getAvailableIds();
    const frameworks = await Promise.all(ids.map((id) => this.get(id)));
    return frameworks.filter((fw): fw is Framework => fw !== undefined);
  }
}

export const registry = new FrameworkRegistry();
