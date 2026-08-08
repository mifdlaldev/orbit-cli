# project-validation Specification

## Purpose

Everything the operator types must be checked before it reaches a filesystem path or a
subprocess argv. This capability covers project-name rules, framework-id checks, input
sanitisation, and path-traversal prevention.

Implementation on disk: `src/utils/validation.ts` and
`src/utils/safe-path.ts`. Unit tests:
`src/__tests__/unit/utils/validation.test.ts` — 42 tests, the only test file in
the repository.

Zod is a production dependency and is imported by nothing (AGENTS.md §5 P-03). Validation
here is hand-written regex plus explicit deny-lists. Do not migrate to Zod unless asked.

## Requirements

### Requirement: Project-name rules

[VERIFIED] — `npm run test:run` → 42 passed, 1 file

A project name SHALL be non-empty, at most 50 characters, and SHALL match
`/^[a-z][a-z0-9-]*$/` — lowercase letters, digits and hyphens, starting with a letter.
Each rejection SHALL return a specific reason, not a generic failure.

#### Scenario: Accepted names

- **WHEN** `validateProjectName` receives `my-app`, `myapp123`, `a`, or
  `hello-world-app`
- **THEN** it returns `{ valid: true }`

#### Scenario: Empty name

- **WHEN** the name is `''`
- **THEN** it returns `valid: false` with error `Project name is required`

#### Scenario: Over the length limit

- **WHEN** the name is 51 characters
- **THEN** it returns `valid: false` with an error mentioning `50 characters`

#### Scenario: Uppercase letters

- **WHEN** the name is `MyApp`
- **THEN** it returns `valid: false` with an error mentioning `lowercase`

#### Scenario: Disallowed characters

- **WHEN** the name is `my_app`, `my.app`, or `my@app`
- **THEN** it returns `valid: false`

#### Scenario: Does not start with a letter

- **WHEN** the name is `123app`
- **THEN** it returns `valid: false` with an error mentioning `start with a letter`
- **AND WHEN** the name is `-myapp`
- **THEN** it returns `valid: false`

The leading-hyphen case matters beyond aesthetics: a name beginning with `-` reaching a
scaffolder's argv would be parsed as a flag.

### Requirement: Reject Windows reserved device names

[VERIFIED] — 21 parameterised test cases in the suite

The 21 MS-DOS legacy device names SHALL be rejected case-insensitively: `con`, `prn`,
`aux`, `nul`, `com1`–`com9`, `lpt1`–`lpt9`. The error SHALL say
`Windows reserved device name`.

#### Scenario: Each reserved name

- **WHEN** `validateProjectName` receives any of the 21 names
- **THEN** it returns `valid: false` with an error containing
  `Windows reserved device name`

### Requirement: Reject names that collide with build conventions

[VERIFIED] — 4 test cases

`node_modules`, `package`, `dist`, `build`, `src`, `test` SHALL be rejected as reserved
project names.

#### Scenario: Reserved build directory names

- **WHEN** the name is `dist`, `build`, `src`, or `test`
- **THEN** it returns `valid: false` with an error containing `reserved project name`

Note on coverage: `node_modules` and `package` are also on the deny-list but are
unreachable through it — `node_modules` fails the regex on `_` first, and both are
therefore untested. The test file states this explicitly at line 96.

### Requirement: Framework-id allow-list

[VERIFIED] — 11 test assertions

`validateFrameworkId` SHALL narrow a string to `FrameworkId`, accepting only the seven
catalog ids and rejecting everything else.

#### Scenario: Valid ids

- **WHEN** given `nextjs`, `nuxt`, `astro`, `sveltekit`, `vue`, `remix`, or `laravel`
- **THEN** it returns `true`

#### Scenario: Invalid ids

- **WHEN** given `react`, `angular`, `invalid`, or `''`
- **THEN** it returns `false`

### Requirement: Strip shell metacharacters and control characters

[VERIFIED] — 12 test assertions

`sanitizeInput` SHALL remove every character in `<>;&|$` `` ` `` `\'"(){}[]!*?~#`, remove
`\x00`–`\x1F` and `\x7F`, and trim surrounding whitespace.

#### Scenario: Shell metacharacters

- **WHEN** given `my;app`, `my&app`, `my|app`, `my$app`, or ``my`app``
- **THEN** it returns `myapp`

#### Scenario: Quotes and control characters

- **WHEN** given `my'app`, `my"app`, `my\x00app`, `my\napp`, or `my\rapp`
- **THEN** it returns `myapp`

#### Scenario: Valid characters survive

- **WHEN** given `my-app-123`
- **THEN** it returns `my-app-123` unchanged

Note: `sanitizeInput` is defence in depth only. Nothing in ORBIT passes user input to a
shell — every subprocess uses `spawn`/`spawnSync` with `shell: false`. See the
`command-execution` spec.

### Requirement: Sanitise before validating

[VERIFIED] — 2 test assertions

`validateAndSanitizeProjectName` SHALL sanitise first, then validate the sanitised value,
and SHALL return both the verdict and the sanitised string so the caller uses the same
value that was checked.

#### Scenario: Clean name passes through

- **WHEN** given `my-app`
- **THEN** it returns `{ valid: true, sanitized: 'my-app' }`

### Requirement: Refuse project paths outside the working directory

[VERIFIED] as a unit-level guard by reading `src/utils/safe-path.ts`;
[UNTESTED] end to end — no test exercises `safe-path.ts`, and the `create` flow that calls
it cannot complete (see the `cli-create` spec).

Before any subprocess starts, the target directory SHALL be resolved and rejected if it
escapes `process.cwd()`, if it already exists, or if its parent is not writable.

#### Scenario: Traversal attempt

- **WHEN** the resolved path is not inside `process.cwd()`
- **THEN** `ensureSafeProjectDir` returns
  `{ safe: false, error: 'Invalid project path (possible directory traversal)' }`

#### Scenario: Directory already exists

- **WHEN** the target directory exists
- **THEN** it returns `{ safe: false, error: 'Directory "<name>" already exists' }`

#### Scenario: Parent not writable

- **WHEN** the parent directory is not writable
- **THEN** it returns `{ safe: false, error: 'Parent directory is not writable' }`

### Requirement: One validation rule, applied consistently

[BROKEN] — defect D-02.

The same project-name rule SHALL apply at every layer. A value accepted by a deeper layer
but rejected by a shallower one means the deeper layer is not a safety net.

#### Scenario: Deep layer accepts what the shallow layer rejects — observed

- **GIVEN** the name `-app`
- **WHEN** `validateProjectName` (`src/utils/validation.ts:42`, regex
  `/^[a-z][a-z0-9-]*$/`) checks it
- **THEN** it is rejected
- **BUT WHEN** `CreateProjectUseCase.validateInput`
  (`src/core/usecases/create-project.ts:137`, regex `/^[a-z0-9-]+$/`) checks the same value
- **THEN** it is accepted

Consequence: any caller reaching the use case without going through the flow — a future
programmatic API, a test — gets the weaker rule, and a leading `-` can reach a
scaffolder's argv as a flag. The use-case check also omits the Windows reserved names and
the build-name deny-list entirely. The non-interactive CLI path (added with the B-01 fix,
2026-08-08) still routes through `collectCreateInput`, which validates with the strong
rule first, so the weak rule is not currently reachable from the CLI.

#### Scenario: Error codes exist for the rules that are not enforced

- **GIVEN** `src/core/errors/messages.ts` defines `ORBIT-V004` (unknown framework),
  `ORBIT-V005` (unknown stack preset), `ORBIT-V006` (invalid package manager)
- **WHEN** the use case validates input
- **THEN** only `ORBIT-V001`, `ORBIT-V002` and `ORBIT-V003` are ever thrown

V004–V006 are now thrown by the flag-validation path in `create-flow.ts`
(`collectCreateInput`, added with B-01 fix, 2026-08-08): `-t bogus` → V004, `-s bogus` →
V005, `-p cargo` → V006, each observed exiting `1` with the code-tagged message. The use
case itself still only throws V001–V003.
