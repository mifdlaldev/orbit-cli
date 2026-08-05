# command-execution Specification

## Purpose

ORBIT's entire job is running other people's tools: `npx create-next-app`, `composer`,
`git`, `npm install`. Every one of those invocations is an injection surface and a
secret-leak surface. This capability defines how ORBIT spawns processes.

Implementation on disk — seven spawn call sites, four of them reachable
(`grep -rn "spawn(\|spawnSync(" src`):

| Module | Reachable | Purpose |
| :--- | :--- | :--- |
| `src/commands/helpers/check-tools.ts:25` | yes, from `doctor` | `spawnSync` tool probes |
| `src/core/services/framework-installer.ts:96` | yes, from `create` | scaffolder |
| `src/core/services/config-applier.ts:64` | yes, from `create` | dependency install |
| `src/core/services/git-initializer.ts:31` | yes, from `create` | git init/add/commit |
| `src/core/services/tool-detector.ts:74` | no — D-04 | duplicate of check-tools |
| `src/utils/safe-executor.ts:97` | no — P-02 | best implementation, uncalled |
| `src/utils/executor.ts:21` | no — P-02 | legacy, uses legacy errors (D-05) |

## Requirements

### Requirement: Never invoke a shell

[VERIFIED] — `grep -rn "execSync" src` returns nothing, and
`grep -rn "shell: false" src` returns 9 hits covering all 7 spawn sites (2 of the
9 are doc comments).

Every subprocess SHALL be started with `spawn` or `spawnSync` and an explicit
`shell: false`, with arguments passed as an array. `child_process.exec` and
`child_process.execSync` SHALL NOT appear anywhere in `src/`.

#### Scenario: Every spawn site

- **WHEN** any of the seven modules above starts a process
- **THEN** the options object contains `shell: false`
- **AND** arguments are an array, never a concatenated string

#### Scenario: A future contributor reaches for exec

- **WHEN** new code needs to run a command
- **THEN** it uses `spawn`/`spawnSync` with `shell: false`

This is a hard constraint in AGENTS.md §9 and it currently holds without exception. Do not
be the change that breaks it.

Two grep false positives to expect when auditing this: `check-tools.ts:39` is
`RegExp.prototype.exec`, and `tool-detector.ts:72` is a private method that happens to be
named `exec`. Neither invokes a shell.

### Requirement: Tool probes are time-bounded

[VERIFIED] — `node dist/index.js doctor` exits `0` on a machine where four of eight probes
fail to find their binary.

`spawnSync` probes SHALL carry a timeout so a hung or interactive binary cannot stall the
CLI. The current bound is 5000 ms (`check-tools.ts:29`).

#### Scenario: Probe target does not exist

- **GIVEN** `pnpm` is not on `PATH`
- **WHEN** the probe runs
- **THEN** it returns `undefined` and `doctor` continues

### Requirement: The scaffolder invocation must be time-bounded

[BROKEN] — defect B-04.

The long-running install subprocess SHALL have a timeout, and SHALL NOT compete with the
parent process for the terminal.

#### Scenario: No timeout exists on the install path — observed

- **GIVEN** `framework-installer.ts:94-134` `executeCommand`
- **WHEN** the child never exits
- **THEN** the promise never settles; there is no timer, no `AbortSignal`, no
  `options.timeout`
- **AND** the observed result is a hang at `⠋ Preparing project...` past 100 s

#### Scenario: Child prompts on a TTY the parent is repainting — observed

- **GIVEN** `stdio: ['inherit','inherit','pipe']` at `framework-installer.ts:99`
- **AND** an active `ora` spinner held at `create-flow.ts:125`
- **WHEN** `create-next-app` writes its own prompt
- **THEN** the child's prompt and the spinner contend for the same terminal and the run
  never progresses

Contrast: `src/utils/safe-executor.ts:105-112` implements exactly the timeout this path
needs — SIGTERM at the deadline, SIGKILL 5 s later. It is imported by nothing (P-02). A fix
for B-04 should reuse it rather than write a third executor.

### Requirement: Strip secrets from the child environment

[BROKEN] — defect D-03.

Every subprocess that runs third-party code SHALL receive an environment with credentials
removed.

#### Scenario: The scaffolder gets a partially sanitised environment — observed

- **GIVEN** `framework-installer.ts:140` `getSafeEnv`
- **WHEN** the scaffolder is spawned
- **THEN** exactly 7 keys are deleted: `AWS_SECRET_ACCESS_KEY`, `GITHUB_TOKEN`,
  `NPM_TOKEN`, `DATABASE_URL`, `API_KEY`, `SECRET_KEY`, `PRIVATE_KEY`
- **AND** anything else — `AWS_ACCESS_KEY_ID`, `GH_TOKEN`, `JWT_SECRET`,
  `STRIPE_SECRET_KEY`, `SUPABASE_SERVICE_KEY`, `DB_PASSWORD`, `SESSION_SECRET`,
  `ENCRYPTION_KEY`, and every project-specific `*_TOKEN` — is passed through

#### Scenario: The dependency installer gets no sanitisation at all — observed

- **GIVEN** `config-applier.ts:63-68` spawning the package manager
- **WHEN** `npm install <deps>` runs inside the freshly created project
- **THEN** no `env` option is supplied, so the child inherits `process.env` in full,
  including every credential

#### Scenario: The strongest sanitiser is dead code — observed

- **GIVEN** `safe-executor.ts:28-72` — 15 named keys plus pattern removal of any key
  containing `SECRET`, `PASSWORD`, `_TOKEN`, or `PRIVATE_KEY`
- **AND** `safe-env.ts` — a third variant, blocking `PATH`, `NODE_PATH`, `LD_PRELOAD`,
  `LD_LIBRARY_PATH`, `DYLD_INSERT_LIBRARIES`
- **WHEN** the importers of either are searched for
- **THEN** neither has one

Three implementations, the weakest in production, one path with none. Resolving D-03 means
choosing one and routing every spawn site through it.

### Requirement: Non-critical subprocess failures must not abort the run

[UNTESTED] — the git path is unreachable while B-04 stands.

Git initialisation is a convenience, not a precondition. Its failure SHALL be reported and
the flow SHALL continue.

#### Scenario: git missing or failing

- **GIVEN** `git-initializer.ts:29-49`
- **WHEN** the child exits non-zero, or `spawn` emits `error`
- **THEN** the promise resolves, a warning is printed for the non-zero case, and creation
  is still reported as successful

### Requirement: Command failures surface as code-tagged errors

[UNTESTED] — reachable only through the install path.

A failed subprocess SHALL be reported as a `CommandError` carrying an `ORBIT-C*` code, the
captured stderr, and an actionable hint.

#### Scenario: Scaffolder exits non-zero

- **WHEN** the install child closes with a non-zero code
- **THEN** a `CommandError` with code `ORBIT-C002` is thrown, carrying the accumulated
  stderr, and the process exit code is `4` (`EXIT_CODES.COMMAND_ERROR`)

#### Scenario: Scaffolder binary cannot be spawned

- **WHEN** `spawn` emits `error`
- **THEN** a `CommandError` with code `ORBIT-C002` is thrown with the hint
  `Make sure the command is installed and accessible.`

Defined-but-unthrown codes: `ORBIT-C001` (command not allowed) and `ORBIT-C003` (command
timeout). C003 is the code a B-04 fix should use.

### Requirement: One executor, not four

[BROKEN] — defects D-04, D-05, P-02.

Subprocess execution SHALL have a single implementation.

#### Scenario: Four executors coexist — observed

- **THEN** `check-tools.ts` (`spawnSync`, timeout, used), `tool-detector.ts` (`spawn`, no
  timeout, unreachable — same capability as check-tools), `safe-executor.ts` (`spawn`,
  timeout, sanitised env, unreachable), and `executor.ts` (`spawn`, no timeout, imports the
  legacy error classes from `src/core/errors.ts`, unreachable) all exist
- **AND** the two production services `framework-installer` and `config-applier` use none
  of them — each inlines its own `spawn` call

Any change to spawn behaviour today has to be made in up to six places. That is the defect.
