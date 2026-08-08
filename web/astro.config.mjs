import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://mifdlaldev.github.io/orbit-cli/',
  // GitHub Pages serves the repo at the /orbit-cli/ subpath. Without base,
  // Astro emits root-absolute asset URLs (/_astro/...) that 404 there.
  base: '/orbit-cli/',
  vite: {
    plugins: [tailwindcss()]
  }
});
