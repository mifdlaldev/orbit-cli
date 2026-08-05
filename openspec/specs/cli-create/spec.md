# cli-create Specification

## Purpose

`orbit create` is the primary feature: scaffold a new project by delegating to the
framework's own official create tool, then optionally apply a stack preset and initialise
git.

**This capability does not work.** No requirement below is `[VERIFIED]`. Four blocking
defects — AGENTS.md §5 B-01, B-02, B-03, B-04 — prevent a single successful run. The
requirements record the *intended* contract so a fix has something to be measured
against; the scenarios record what actually happens.

Implementation on disk:

```
src/index.ts:19-29            declares create + flags -t, -p, -s, -y
src/commands/create.ts:37     runCreate(_projectName, options)
src/flows/create-flow.ts:18   collectCreateInput()  — five interactive prompts
src/flows/create-flow.ts:123  runCreateFlow()       — ora spinner + container
src/core/usecases/create-project.ts:64  execute()   — 5-step orchestration
src/core/services/framework-installer.ts:24  install()
```

## Requirements

### Requirement: Accept project configuration from CLI flags

[BROKEN] — defect B-01.

The command SHALL accept the project name as a positional argument and SHALL honour
`-t, --template <framework>`, `-p, --pm <manager>`, `-s, --stack <stack>`. A flag that is
supplied SHALL be used, and the prompt for that value SHALL be skipped.

#### Scenario: Every value supplied on the command line — observed failure

- **WHEN** the operator runs `orbit create my-app -t nextjs -p npm -s minimal`
- **THEN** the intent is that no prompt appears and `my-app/` is scaffolded with Next.js
- **BUT** the observed behaviour is that all five prompts appear anyway

Reproduction and cause: `src/commands/create.ts:38` names the first parameter
`_projectName` and never reads it; `options.template`, `options.pm` and `options.stack`
are never referenced anywhere in the file; line 55 calls `collectCreateInput()` with no
arguments.

#### Scenario: Only some values supplied — observed failure

- **WHEN** the operator runs `orbit create my-app -t nextjs`
- **THEN** the intent is to prompt only for package manager, stack and options
- **BUT** the observed behaviour is that the name and framework are prompted for as well

### Requirement: Support non-interactive execution

[BROKEN] — defect B-02.

With `--yes` and sufficient flags, the command SHALL run to completion without a TTY, so
it can be used in CI, in pipes, and by automated agents.

#### Scenario: No TTY attached — observed crash

- **WHEN** the operator runs `node dist/index.js create my-app --yes -t nextjs -p npm -s minimal < /dev/null`
- **THEN** the intent is a scaffolded `my-app/` and exit `0`
- **BUT** the observed behaviour is the error
  `TTY initialization failed: uv_tty_init returned EINVAL (invalid argument)`,
  rendered under the heading `✗ Unexpected error`, exit code `99`, and no directory
  created

Cause: `--yes` is only consulted at `src/commands/create.ts:43` to skip the banner. There
is no non-interactive code path; `collectCreateInput()` runs unconditionally and
`@clack/prompts` requires a TTY.

Note: the hint printed with this crash points at
`https://github.com/mifdlaldev/orbit-cli/issues` (the placeholder URL was fixed when this
repository was created — AGENTS.md §5 P-05).

### Requirement: Delegate scaffolding to the framework's official create tool

[BROKEN] — defect B-03.

For the selected framework and package manager, the command SHALL invoke that framework's
official scaffolder through the chosen package manager, with `shell: false`.

#### Scenario: npm — correct command

- **GIVEN** framework `nextjs` and package manager `npm`
- **WHEN** the installer builds the command
- **THEN** it produces `npx create-next-app@latest <name> --typescript --eslint`

This mapping is correct as written. It is the only correct one.

#### Scenario: pnpm, yarn or bun — observed wrong commands

- **GIVEN** framework `nextjs` and package manager `pnpm`
- **THEN** the intent is `pnpm create next-app <name> --typescript --eslint`
- **BUT** the observed command is `pnpm create <name> --typescript --eslint` — the
  create-package name is gone

Cause: `src/core/services/framework-installer.ts:76-86` rebuilds the argv as
`['create', ...cmd.args.slice(1)]`, and `cmd.args[0]` is the create-package name itself.
Further observed cases from the same defect:

| framework + pm | Command produced | Fault |
| :--- | :--- | :--- |
| nuxt + pnpm | `pnpm create init <name>` | lost `nuxi@latest` |
| nuxt + yarn | `yarn create init <name>` | lost `nuxi@latest` |
| astro + bun | `bunx create astro@latest <name>` | `bunx create` is not a command |
| nextjs + bun | `bunx create-next-app@latest <name> ...` | happens to be correct |

#### Scenario: Laravel is exempt from package-manager rewriting

- **GIVEN** framework `laravel`
- **THEN** the command is `composer create-project laravel/laravel <name>` regardless of
  the selected JavaScript package manager

[UNTESTED]: neither `php` nor `composer` is installed on the reference machine, so this
path has never been executed.

### Requirement: Scaffolding must terminate

[BROKEN] — defect B-04.

The install step SHALL either complete, fail with a diagnostic, or time out. It SHALL NOT
hang indefinitely.

#### Scenario: Interactive scaffolder under an active spinner — observed hang

- **WHEN** `create` is driven under a real PTY with every prompt answered
  (`timeout 120 script -qfc "node dist/index.js create" out.log`)
- **THEN** the intent is that the scaffolder runs and the project appears
- **BUT** the observed behaviour is the display stuck at `⠋ Preparing project...` for more
  than 100 seconds, no project directory created, and the run only ends when the external
  `timeout` kills it

Cause: `framework-installer.ts:99` passes `stdio: ['inherit','inherit','pipe']` while
`create-flow.ts:125` holds a live `ora` spinner. The child scaffolder tries to prompt on
the same TTY the spinner is repainting. Additionally there is no timeout anywhere on this
path — contrast `utils/safe-executor.ts:105`, which implements one but is never called
(AGENTS.md §5 D-03, P-02).

### Requirement: Orchestration order

[UNTESTED] — the code below exists but has never run to completion, because B-04 blocks
step 3.

`CreateProjectUseCase.execute` SHALL perform, in order: (1) validate input, (2) check the
environment and abort if a required tool is missing, (3) install the framework, (4) apply
the stack config when the stack is not `minimal`, (5) initialise git unless disabled. It
SHALL report each step through the `ProgressReporter` callbacks.

#### Scenario: Missing required tool aborts before installing

- **GIVEN** a required tool for the framework is absent
- **WHEN** step 2 runs
- **THEN** a failure result is returned carrying `Missing requirement: <tool>` for each
  missing tool
- **AND** no scaffolder is invoked

#### Scenario: Minimal stack skips config application

- **GIVEN** stack `minimal`
- **THEN** `ConfigApplier` is not invoked

### Requirement: Git initialisation is best-effort

[UNTESTED] — unreachable while B-04 stands.

Unless git is disabled, the command SHALL run `git init`, `git add .`, then
`git commit -m "Initial commit from ORBIT CLI"` inside the new project. A git failure
SHALL NOT fail project creation.

#### Scenario: git is not installed

- **GIVEN** `git` is absent
- **WHEN** initialisation is attempted
- **THEN** a warning is printed and the flow continues to report success

Source: `src/core/services/git-initializer.ts:29-49` resolves rather than rejects on both
the `close`-with-non-zero and `error` paths.

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

Source: `src/flows/create-flow.ts:34` calling `src/utils/safe-path.ts:80`.

Caveat: the scaffolder itself is spawned with `cwd: process.cwd()`
(`framework-installer.ts:27`), so it writes wherever ORBIT was invoked. Never run `create`
inside this repository.

### Requirement: Report next steps on success

[UNTESTED] — never reached.

On success the command SHALL print the created path and the next steps
`cd <name>` and `<packageManager> run dev`.

#### Scenario: Successful creation

- **WHEN** creation succeeds
- **THEN** the output contains `Project created at <path>` and a `Next steps` note

Source: `src/flows/create-flow.ts:146-149`, `create-project.ts:215-217`.
