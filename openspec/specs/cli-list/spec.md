# cli-list Specification

## Purpose

`orbit list` is the discovery surface: it tells the operator which frameworks ORBIT knows
about, and for one framework, its stack presets and tool requirements. It reads the
framework catalog and prints; it never touches the filesystem or the network.

Implementation on disk: `src/commands/list.ts` over the registry in
`src/frameworks/index.ts`.

Important scope note: what `list` prints comes from `src/frameworks/*.ts`, and
`create` does **not** use those definitions (AGENTS.md §5 D-01). `list` therefore
describes a catalog that the create path does not implement.

## Requirements

### Requirement: List all frameworks grouped by category

[VERIFIED] — `node dist/index.js list` → exit `0`

With no argument the command SHALL print every framework in the catalog, grouped under a
`Node.js Frameworks:` heading and a `PHP Frameworks:` heading, each entry showing the
display name and the one-line description. A group with no members SHALL be omitted.

#### Scenario: Default invocation

- **WHEN** the operator runs `orbit list`
- **THEN** six frameworks appear under `Node.js Frameworks:` — Next.js, Nuxt, Astro,
  SvelteKit, Vue, Remix
- **AND** one framework appears under `PHP Frameworks:` — Laravel
- **AND** the outro reads
  `Run 'orbit create <name> --template <framework>' to get started`
- **AND** the process exits `0`

Note: that outro advertises `--template`, which `create` accepts on the command line but
never reads (AGENTS.md §5 B-01). The message is currently misleading.

### Requirement: Show details for one framework

[VERIFIED] — `node dist/index.js list nextjs` → exit `0`

Given a valid framework id the command SHALL print the display name, the description, the
website URL, every stack preset as name plus description, and the comma-separated list of
required tools.

#### Scenario: Known framework id

- **WHEN** the operator runs `orbit list nextjs`
- **THEN** the output contains `Next.js`, `The React Framework for the Web`, and
  `Website: https://nextjs.org`
- **AND** three stack presets are listed: `Minimal`, `Standard`, `Full Stack`
- **AND** `Required Tools:` lists `node, npm`
- **AND** the process exits `0`

### Requirement: Reject an unknown framework id with a usable error

[VERIFIED] — `node dist/index.js list bogus; echo $?` → `1`

Given an id that is not in the catalog the command SHALL say so, SHALL print every valid
id so the operator can correct the typo, and SHALL exit `1`.

#### Scenario: Unknown framework id

- **WHEN** the operator runs `orbit list bogus`
- **THEN** the output contains `Framework "bogus" not found.`
- **AND** all seven valid ids are listed: `nextjs`, `nuxt`, `astro`, `sveltekit`, `vue`,
  `remix`, `laravel`
- **AND** the process exits `1`

### Requirement: Works without a TTY

[VERIFIED] — `node dist/index.js list nextjs >/dev/null 2>&1; echo $?` → `0`, run with
stdout redirected and no PTY attached.

The command SHALL complete in a non-interactive context — pipes, redirection, CI — because
it collects no input.

#### Scenario: Output redirected to a file

- **GIVEN** no PTY is attached and stdout is a file
- **WHEN** the operator runs `orbit list`
- **THEN** the command completes and exits `0`

This is the contrast case for AGENTS.md §5 B-02: `create` crashes under exactly these
conditions, `list` does not.
