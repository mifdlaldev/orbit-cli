import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  dts: false, // Disabled due to gradient-string type issue
  sourcemap: true,
  splitting: true,
  treeshake: true,
  minify: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
  external: ['figlet'],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
