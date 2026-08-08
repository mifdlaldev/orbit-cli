# framework-catalog Specification

## Purpose

The framework catalog is the in-repo database of supported frameworks: identity, category,
website, install commands, stack presets, required tools. It is loaded lazily so that
starting the CLI does not pay for seven module imports.

Implementation on disk: `src/frameworks/` — `types.ts` plus one module per
framework plus the `registry` singleton in `index.ts`.

**Read this before using the catalog:** since 2026-08-08 the catalog has two consumers —
`src/commands/list.ts` and `src/core/services/framework-installer.ts` (AGENTS.md §5 D-01
fixed). `installCommand` drives what `create` actually spawns. The `postInstallDeps` lists
remain unused: the stack presets actually applied still live in
`usecases/create-project.ts` (see the stack-preset divergence note below).

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

[VERIFIED] for npm+nextjs (executed end-to-end); other package managers [UNTESTED].

Each framework SHALL declare an `installCommand` giving the invocation string for `npm`,
`yarn`, `pnpm` and `bun`, plus a `flags` map for `typescript`, `eslint`, `tailwind` and
`srcDir`. The create path SHALL consume these strings.

#### Scenario: Next.js declares four package-manager variants

- **THEN** `src/frameworks/nextjs.ts` declares
  `npx --yes create-next-app@latest --yes`, `yarn create next-app --yes`,
  `pnpm create next-app --yes`, `bunx create-next-app --yes`

Observed 2026-08-08: the npm variant ran end-to-end and scaffolded a project. The strings
were cross-checked against each scaffolder's official CLI (librarian, 2026-08-08) when
B-03 was fixed — e.g. nuxi now carries its non-TTY-required args
(`--template minimal --packageManager <pm> --no-gitInit`), remix uses
`create-react-router@latest` (create-remix is deprecated). yarn/pnpm/bun paths are
declared but not executed on this machine (tools absent).

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
