# cli-create Specification

## Purpose

`orbit create` is the primary feature: scaffold a new project by delegating to the
framework's own official create tool, then optionally apply a stack preset and initialise
git.

**Status 2026-08-08:** the four blocking defects (AGENTS.md §5 B-01..B-04) are fixed and
the non-interactive and PTY paths are verified end to end with Next.js. Paths that
require tools absent from the reference machine (pnpm, yarn, bun, php, composer) and the
non-minimal stack presets remain untested.

Implementation on disk:

```
src/index.ts:19-29            declares create + flags -t, -p, -s, -y
src/commands/create.ts:37     runCreate(name, options)
src/flows/create-flow.ts:18   collectCreateInput(name, options)
src/flows/create-flow.ts:123  runCreateFlow()       — ora spinner + container
src/core/usecases/create-project.ts:64  execute()   — 5-step orchestration
src/core/services/framework-installer.ts:24  install()
```

## Requirements

### Requirement: Accept project configuration from CLI flags

[VERIFIED] — defect B-01 fixed 2026-08-08.

The command SHALL accept the project name as a positional argument and SHALL honour
`-t, --template <framework>`, `-p, --pm <manager>`, `-s, --stack <stack>`. A flag that is
supplied SHALL be used, and the prompt for that value SHALL be skipped.

#### Scenario: Every value supplied on the command line

- **WHEN** the operator runs
  `node dist/index.js create demo-app2 --yes -t nextjs -p npm -s minimal < /dev/null`
- **THEN** no prompt appears, `demo-app2/` is scaffolded with Next.js, the output contains
  `✓ Project created at /tmp/orbit-qa/demo-app2`, and the exit code is `0`

Observed 2026-08-08: exit `0`, scaffold created. `create-flow.ts` builds the input from
flags first (`collectCreateInput(name, options)`) and prompts only for missing fields.

#### Scenario: Invalid flag value is rejected with a code

- **WHEN** the operator runs
  `node dist/index.js create x -t bogus -p npm -s minimal --yes < /dev/null`
- **THEN** the output is `✗ Unknown framework / Framework "bogus" is not supported.` and
  the exit code is `1`

Observed 2026-08-08: exit `1`, ORBIT-V004. Invalid `--pm` yields ORBIT-V006, invalid
`--stack` yields ORBIT-V005.

#### Scenario: Missing values on a TTY are prompted individually

- **WHEN** the operator runs `orbit create my-app -t nextjs` on a TTY
- **THEN** prompts appear only for package manager, stack and options, not for the name or
  framework

Not directly executable in the current harness (clack requires a two-way PTY; see
B-02 note below). The branching logic is `interactive && !options.yes` per field in
`create-flow.ts`.

### Requirement: Support non-interactive execution

[VERIFIED] — defect B-02 fixed 2026-08-08.

With `--yes` and sufficient flags, the command SHALL run to completion without a TTY, so
it can be used in CI, in pipes, and by automated agents. When a required value is missing
and no TTY is available, the command SHALL fail with a clean diagnostic instead of a
crash.

#### Scenario: Full non-TTY run completes

- **WHEN** the operator runs
  `node dist/index.js create demo-app --yes -t nextjs -p npm -s minimal < /dev/null`
- **THEN** the project is scaffolded and the exit code is `0`

Observed 2026-08-08: exit `0`, `359 packages` installed, output ends with
`✓ Project created at ...` and a `Next steps` note. `create-flow.ts` checks
`process.stdin.isTTY && process.stdout.isTTY` before any clack call.

#### Scenario: Non-TTY without enough flags fails cleanly

- **WHEN** the operator runs `node dist/index.js create flagtest2 -t nextjs < /dev/null`
- **THEN** the output is `✗ Interactive input required / Missing a package manager (--pm)`
  and the exit code is `1`

Observed 2026-08-08: exit `1`, ORBIT-V007, no stack trace, no `uv_tty_init` crash. The
old behaviour (exit `99`, `TTY initialization failed: uv_tty_init returned EINVAL`) no
longer occurs.

### Requirement: Delegate scaffolding to the framework's official create tool

[VERIFIED] for the npm package manager across four frameworks (nextjs, nuxt, astro,
sveltekit); other package managers and the remaining frameworks [UNTESTED] — see
scenarios.

For the selected framework and package manager, the command SHALL invoke that framework's
official scaffolder through the chosen package manager, with `shell: false`. The command
strings SHALL come from `src/frameworks/*.ts` `installCommand[pm]` — the same source
`list` displays (defect D-01 fixed).

#### Scenario: npm — correct command, verified by execution across four frameworks

- **GIVEN** framework `nextjs` and package manager `npm`
- **WHEN** the installer builds the command
- **THEN** it spawns `npx --yes create-next-app@latest --yes <name> --ts --eslint`

Observed 2026-08-08: full non-TTY runs of `create <name> --yes -t <fw> -p npm -s minimal`
exited `0` and scaffolded a complete project for all four exercised frameworks:

| framework | scaffolder | observed result |
| :--- | :--- | :--- |
| nextjs | `npx --yes create-next-app@latest --yes <name> --ts --eslint` | "Success! Created demo-app", 359 packages, exit 0 |
| nuxt | `npx --yes nuxi@latest init --template minimal --packageManager npm --no-gitInit <name>` | "✨ Nuxt project has been created with the minimal template", exit 0 |
| astro | `npm create astro@latest -- --yes <name>` | full scaffold (astro.config.mjs, node_modules), exit 0 |
| sveltekit | `npx --yes sv create --template minimal --install npm <name> --types ts --add eslint` | "You're all set!", eslint.config.js present, exit 0 |

`framework-installer.ts` reads `framework.installCommand[packageManager]`, splits the
template, appends the name, then appends `flags.typescript` / `flags.eslint` when
selected. It no longer rebuilds argv with `args.slice(1)`.

#### Scenario: pnpm, yarn and bun commands — not executed on this machine

- **GIVEN** framework `nextjs` and package manager `pnpm`
- **THEN** the command produced is `pnpm create next-app --yes <name> --ts --eslint`

[UNTESTED]: pnpm, yarn and bun are not installed on the reference machine (AGENTS.md §3).
The command strings are declared in `src/frameworks/*.ts` and were cross-checked against
each scaffolder's official CLI by a librarian agent on 2026-08-08 (e.g. nuxi requires
`--packageManager <pm> --template minimal --no-gitInit` in non-TTY mode), but no run has
been observed.

#### Scenario: Laravel uses composer regardless of package manager

- **GIVEN** framework `laravel`
- **THEN** the command is
  `composer create-project laravel/laravel --no-interaction --prefer-dist --no-progress <name>`

[UNTESTED]: neither `php` nor `composer` is installed on the reference machine, so this
path has never been executed.

#### Scenario: create-remix is deprecated

- **GIVEN** framework `remix`
- **THEN** the command uses `create-react-router@latest` with `--yes`

Observed 2026-08-08: `create-remix@latest` prints a deprecation stub pointing at
`create-react-router@latest`; `src/frameworks/remix.ts` was updated accordingly (not yet
executed on this machine).

### Requirement: Scaffolding must terminate

[VERIFIED] — defect B-04 fixed 2026-08-08.

The install step SHALL either complete, fail with a diagnostic, or time out. It SHALL NOT
hang indefinitely.

#### Scenario: Full PTY run completes

- **WHEN** `create` is driven under a real PTY
  (`timeout 500 script -qfc "node dist/index.js create ptyfull --yes -t nextjs -p npm -s minimal" ptyfull.log`)
- **THEN** the spinner advances, the scaffolder runs, the project appears, and the exit
  code is `0`

Observed 2026-08-08: exit `0`, `Success! Created ptyfull at ...`, spinner text advanced
`Preparing project...` → `Installing nextjs...` → `✔ Project created successfully!`.
Three fixes: the reporter stops the ora spinner while a child process runs
(`onChildSpawn`/`onChildExit`), every scaffolder is invoked with its official
non-interactive flag, and `executeCommand` kills the child after a 600 s timeout raising
ORBIT-C003.

#### Scenario: Command timeout raises a code

- **GIVEN** a child scaffolder does not exit within 600 s
- **THEN** the child is killed and ORBIT-C003 (`Command timeout`) is reported

[UNTESTED]: the timeout branch has not been observed firing; the constant is
`COMMAND_TIMEOUT_MS = 600_000` in `framework-installer.ts`.

### Requirement: Orchestration order

[VERIFIED] for the minimal-stack path; stack application
[UNTESTED].

`CreateProjectUseCase.execute` SHALL perform, in order: (1) validate input, (2) check the
environment and abort if a required tool is missing, (3) install the framework, (4) apply
the stack config when the stack is not `minimal`, (5) initialise git unless disabled. It
SHALL report each step through the `ProgressReporter` callbacks.

#### Scenario: Minimal stack skips config application

- **GIVEN** stack `minimal`
- **THEN** `ConfigApplier` is not invoked

Observed 2026-08-08: both verified runs used `-s minimal`; the stack step printed
`Installing nextjs...` directly after environment checks and no config-apply step ran
(ORBIT's own `ora` text sequence shows no stack step for minimal).

#### Scenario: Missing required tool aborts before installing

- **GIVEN** a required tool for the framework is absent
- **WHEN** step 2 runs
- **THEN** a failure result is returned carrying `Missing requirement: <tool>` for each
  missing tool
- **AND** no scaffolder is invoked

[UNTESTED]: no required tool is absent on the reference machine.

#### Scenario: Standard and full stacks apply config

- **GIVEN** stack `standard` or `full`
- **THEN** `ConfigApplier` installs the preset's dev dependencies and writes its files
  into the scaffolded project

[UNTESTED]: only `minimal` has been executed. `getStackConfig` in
`usecases/create-project.ts:172` remains the only source actually applied (D-01 residue).

### Requirement: Git initialisation is best-effort

[VERIFIED] — the failure branch fired on 2026-08-08.

Unless git is disabled, the command SHALL run `git init`, `git add .`, then
`git commit -m "Initial commit from ORBIT CLI"` inside the new project. A git failure
SHALL NOT fail project creation.

#### Scenario: git commit finds nothing to commit

- **WHEN** the scaffolder already made a commit (create-next-app does) and ORBIT then
  runs `git add .` / `git commit`
- **THEN** a warning is printed and the flow still reports success

Observed 2026-08-08: both runs printed
`Git command failed: git commit -m Initial commit from ORBIT CLI` and still exited `0`
with `✔ Project created successfully!`. `git-initializer.ts:29-49` resolves rather than
rejects on non-zero close and on error.

### Requirement: Never write outside the target directory

[UNTESTED] as an end-to-end property; the guard function itself is
[VERIFIED] by unit tests — see the `project-validation` spec.

The command SHALL refuse a project name that resolves outside the current working
directory.

#### Scenario: Traversal attempt is rejected during input collection

- **WHEN** the project name resolves outside `process.cwd()`
- **THEN** `ensureSafeProjectDir` returns
  `Invalid project path (possible directory traversal)` and the flow stops before any
  subprocess starts

Source: `src/flows/create-flow.ts` calling `src/utils/safe-path.ts:80`. On a TTY the flow
prints the error and stops; without a TTY it throws ORBIT-F004 (or ORBIT-F001 when the
directory already exists).

Caveat: the scaffolder itself is spawned with `cwd: process.cwd()`
(`framework-installer.ts`), so it writes wherever ORBIT was invoked. Never run `create`
inside this repository.

### Requirement: Report next steps on success

[VERIFIED] — observed 2026-08-08.

On success the command SHALL print the created path and the next steps
`cd <name>` and `<packageManager> run dev`.

#### Scenario: Successful creation

- **WHEN** creation succeeds
- **THEN** the output contains `Project created at <path>` and a `Next steps` note

Observed 2026-08-08 (non-TTY run):
`✓ Project created at /tmp/orbit-qa/demo-app2` followed by a `Next steps` note containing
`cd demo-app2` and `npm run dev`, exit `0`. Source: `create-flow.ts` `displaySuccess` +
`p.note`, `create-project.ts:215-217`.
