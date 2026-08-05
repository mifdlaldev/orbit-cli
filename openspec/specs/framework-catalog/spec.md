# framework-catalog Specification

## Purpose

The framework catalog is the in-repo database of supported frameworks: identity, category,
website, install commands, stack presets, required tools. It is loaded lazily so that
starting the CLI does not pay for seven module imports.

Implementation on disk: `src/frameworks/` — `types.ts` plus one module per
framework plus the `registry` singleton in `index.ts`.

**Read this before using the catalog:** the catalog has exactly one consumer,
`src/commands/list.ts`. The create path ignores it and hardcodes its own command
table (AGENTS.md §5 D-01). Every `installCommand` and every `postInstallDeps` list in this
catalog is therefore dead data today.

## Requirements

### Requirement: Seven frameworks, stable ids

[VERIFIED] — `node dist/index.js list bogus` prints the full id list; exit `1`

The catalog SHALL contain exactly these ids: `nextjs`, `nuxt`, `astro`, `sveltekit`,
`vue`, `remix`, `laravel`. Each SHALL declare `category` as `nodejs` or `php`.

#### Scenario: Ids enumerated

- **WHEN** `registry.getAvailableIds()` is reached via `orbit list bogus`
- **THEN** the seven ids above are printed in that order

#### Scenario: Categories partition the catalog

- **WHEN** the operator runs `orbit list`
- **THEN** six frameworks are `nodejs` and one — `laravel` — is `php`

### Requirement: Every framework declares name, description, website, required tools

[VERIFIED] — `node dist/index.js list nextjs` renders all four fields

Each framework SHALL provide a human display name, a one-line description, a website URL,
and the list of external tools required to scaffold it.

#### Scenario: Next.js entry

- **WHEN** the operator runs `orbit list nextjs`
- **THEN** name `Next.js`, description `The React Framework for the Web`, website
  `https://nextjs.org`, and required tools `node, npm` are printed

### Requirement: Every framework declares three stack presets

[VERIFIED] — `node dist/index.js list nextjs` prints exactly three presets

Each framework SHALL declare presets with ids `minimal`, `standard`, `full`, each carrying
a display name, a description, and optional `postInstallDeps` / `postInstallDevDeps`.

#### Scenario: Next.js presets

- **WHEN** the operator runs `orbit list nextjs`
- **THEN** `Minimal`, `Standard`, `Full Stack` are printed with their descriptions

Divergence to be aware of: the preset ids here are `minimal | standard | full`, but the
`StackConfig` values actually applied during creation live in a third, unrelated table at
`src/core/usecases/create-project.ts:174-207`, which only defines `standard` and `full`
and falls back to empty dependency arrays for anything else. Reconciling these is part of
D-01.

### Requirement: Lazy loading with caching

[VERIFIED] — `node dist/index.js list nextjs` loads one framework module and succeeds;
`orbit list` loads all seven.

Framework definitions SHALL be loaded via dynamic `import()` on first access and cached in
memory for the process lifetime. An unknown id SHALL resolve to `undefined` rather than
throwing.

#### Scenario: Single framework requested

- **WHEN** `registry.get('nextjs')` is called
- **THEN** only `./nextjs.js` is imported

#### Scenario: Same framework requested twice

- **WHEN** `registry.get('nextjs')` is called again in the same process
- **THEN** the cached instance is returned and no second import occurs

#### Scenario: Unknown id

- **WHEN** `registry.get('bogus')` is called
- **THEN** it returns `undefined` and no import is attempted

### Requirement: Per-package-manager install commands

[UNTESTED] — this data is never executed by any code path.

Each framework SHALL declare an `installCommand` giving the invocation string for `npm`,
`yarn`, `pnpm` and `bun`, plus a `flags` map for `typescript`, `eslint`, `tailwind` and
`srcDir`.

#### Scenario: Next.js declares four package-manager variants

- **THEN** `src/frameworks/nextjs.ts:15-26` declares
  `npx create-next-app@latest`, `yarn create next-app`, `pnpm create next-app`,
  `bunx create-next-app`

Status: these strings are correct as written, and they are exactly what B-03's broken
runtime mapping fails to produce. A fix for B-03 should consume this field instead of the
hardcoded table in `framework-installer.ts`. Until then, do not describe these strings as
the commands ORBIT runs — they are not.

### Requirement: One canonical Framework type

[BROKEN] — defect D-06.

The catalog SHALL expose exactly one `Framework` interface and exactly one `FrameworkId`
type, and every consumer SHALL import them from that single declaration.

#### Scenario: Two incompatible Framework interfaces coexist — observed

- **GIVEN** `src/frameworks/types.ts:11` and `src/core/domain/framework.ts:44` both declare
  an interface named `Framework`
- **THEN** they are not interchangeable: the former has `installCommand`, the latter has
  `versions`
- **AND** `FrameworkId` is declared identically in both, and a third time in
  `src/core/types.ts:5`, which has no importer

#### Scenario: An agent picks the wrong Framework type

- **WHEN** new code imports `Framework` from `core/domain`
- **AND** assigns a value coming out of `registry.get()`
- **THEN** it will not typecheck, because the registry yields the `frameworks/types.ts`
  shape

Tracked as AGENTS.md §5 D-06. Resolve it in a change proposal, not opportunistically.
