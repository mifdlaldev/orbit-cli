/**
 * Single content source for the landing page.
 *
 * HONESTY RULE: every claim below must be traceable to a verified fact
 * (AGENTS.md §3/§5). Status strings carry the date the fact was verified.
 * The build fails if `frameworks` ids diverge from src/frameworks registry
 * (see scripts/assert-catalog.ts).
 */

export interface FrameworkEntry {
  id: string;
  name: string;
  category: 'nodejs' | 'php';
  website: string;
  tagline: string;
}

export const frameworks: readonly FrameworkEntry[] = [
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'nodejs',
    website: 'https://nextjs.org',
    tagline: 'The React Framework for the Web',
  },
  {
    id: 'nuxt',
    name: 'Nuxt',
    category: 'nodejs',
    website: 'https://nuxt.com',
    tagline: 'The Intuitive Vue Framework',
  },
  {
    id: 'astro',
    name: 'Astro',
    category: 'nodejs',
    website: 'https://astro.build',
    tagline: 'The web framework for content-driven websites',
  },
  {
    id: 'sveltekit',
    name: 'SvelteKit',
    category: 'nodejs',
    website: 'https://kit.svelte.dev',
    tagline: 'Web development, streamlined',
  },
  {
    id: 'vue',
    name: 'Vue',
    category: 'nodejs',
    website: 'https://vuejs.org',
    tagline: 'The Progressive JavaScript Framework',
  },
  {
    id: 'remix',
    name: 'Remix',
    category: 'nodejs',
    website: 'https://remix.run',
    tagline: 'Full stack web framework',
  },
  {
    id: 'laravel',
    name: 'Laravel',
    category: 'php',
    website: 'https://laravel.com',
    tagline: 'The PHP Framework for Web Artisans',
  },
];

export interface CommandEntry {
  id: 'list' | 'doctor' | 'create';
  name: string;
  description: string;
  flags: string;
  state: 'verified' | 'partial';
}

/**
 * Verified 2026-08-08 (AGENTS.md §3 runtime table, §5 fixed defects).
 * state 'verified' = ran to completion with exit 0 on the reference machine.
 * state 'partial' = works for the exercised path only.
 */
export const commands: readonly CommandEntry[] = [
  {
    id: 'list',
    name: 'list',
    description: 'List every supported framework, or show details for one.',
    flags: 'orbit list [framework]',
    state: 'verified',
  },
  {
    id: 'doctor',
    name: 'doctor',
    description: 'Probe Node.js, npm, git, pnpm, yarn, bun, PHP and Composer.',
    flags: 'orbit doctor',
    state: 'verified',
  },
  {
    id: 'create',
    name: 'create',
    description: 'Scaffold a new project with the framework\u2019s official create tool.',
    flags: 'orbit create [name] -t <template> -p <pm> -s <stack> --yes',
    state: 'partial',
  },
];

export interface StatusEntry {
  label: string;
  detail: string;
  verifiedOn: string;
}

/**
 * Status snapshot. Detail strings are claims — each one verified on the
 * date below; do not edit them without re-running the verification.
 */
export const status: readonly StatusEntry[] = [
  {
    label: 'list and doctor verified',
    detail:
      'Both commands run end to end: probes 8 tools, lists 7 frameworks, exits 0.',
    verifiedOn: '2026-08-08',
  },
  {
    label: 'create fixed, four npm paths verified',
    detail:
      'B-01..B-04 are fixed. Full scaffolds (Next.js, Nuxt, Astro, SvelteKit, all with the npm package manager and minimal stack) run to completion with exit 0, headless and under a PTY.',
    verifiedOn: '2026-08-08',
  },
  {
    label: 'Other paths declared, not yet executed',
    detail:
      'Vue, Remix, Laravel, the pnpm/yarn/bun package managers, and the standard/full stacks are wired but have not run on the reference machine.',
    verifiedOn: '2026-08-08',
  },
];

export const site = {
  name: 'ORBIT CLI',
  tagline: 'One command. Seven frameworks. Your project.',
  repoUrl: 'https://github.com/mifdlaldev/orbit-cli',
  issuesUrl: 'https://github.com/mifdlaldev/orbit-cli/issues',
  license: 'MIT',
} as const;
