# cli-doctor Specification

## Purpose

`orbit doctor` reports whether the host machine has the tools ORBIT needs before a
project can be scaffolded. It is a read-only probe: it installs nothing and writes
nothing.

Implementation on disk: `src/commands/doctor.ts` calling
`src/commands/helpers/check-tools.ts`. See AGENTS.md §5 D-04 — a second,
unreachable implementation of this capability also exists.

## Requirements

### Requirement: Probe a fixed set of eight tools

[VERIFIED] — `node dist/index.js doctor`

The command SHALL probe exactly these tools, in this order: Node.js, npm, git, pnpm,
yarn, bun, PHP, Composer. Node.js, npm and git are required; the other five are
optional.

#### Scenario: All required tools present, some optional missing

- **GIVEN** node, npm, git and bun are installed and pnpm, yarn, php, composer are not
- **WHEN** the operator runs `orbit doctor`
- **THEN** each installed tool is listed with `✓` and its detected version
- **AND** each missing optional tool is listed with `⚠` and the suffix
  `(not found - optional)`
- **AND** the outro reads `All requirements met! You're ready to go. 🚀`
- **AND** the process exits `0`

Observed output on the reference machine (AGENTS.md §3):

```
✓ Node.js      v24.18.1
✓ npm          v11.16.0
✓ git          v2.43.0
⚠ pnpm         (not found - optional)
⚠ yarn         (not found - optional)
✓ bun          v1.3.14
⚠ PHP          (not found - optional)
⚠ Composer     (not found - optional)
```

### Requirement: Version detection is a bounded, shell-free subprocess

[VERIFIED] — `node dist/index.js doctor` exits 0 on a machine where four of the eight
probes fail, proving each failing probe terminates rather than hanging.

Each probe SHALL invoke `<tool> --version` through `spawnSync` with `shell: false` and a
5000 ms timeout, and SHALL parse the version with the regular expression
`/v?(\d+\.\d+\.\d+)/`. A non-zero status, a spawn error, or a timeout SHALL be reported
as "not found" rather than propagated as an exception.

#### Scenario: Tool binary is absent from PATH

- **GIVEN** `pnpm` is not on `PATH`
- **WHEN** the probe runs
- **THEN** `spawnSync` fails and the probe returns `{ ok: false, version: undefined }`
- **AND** the command continues to the next tool without aborting

#### Scenario: Tool prints a version that is not three-part semver

- **GIVEN** a probe whose stdout contains no `\d+.\d+.\d+` match
- **WHEN** the version is parsed
- **THEN** the trimmed raw stdout is used as the version string

### Requirement: Exit code reflects required-tool availability

[VERIFIED for the success path] — `node dist/index.js doctor; echo $?` → `0`

The command SHALL exit `0` when every required tool is present. When a required tool is
missing it SHALL report which one and exit non-zero.

#### Scenario: A required tool is missing

- **GIVEN** `git` is not installed
- **WHEN** the operator runs `orbit doctor`
- **THEN** `git` is listed as missing and required
- **AND** the process exits non-zero

[UNTESTED] for this scenario: the reference machine has node, npm and git all installed,
so the failure branch of `src/commands/doctor.ts` has never been executed. Do
not claim it works. Verify it by temporarily shadowing a required binary on `PATH`.

### Requirement: Probing is side-effect free

[VERIFIED] — `node dist/index.js doctor` was run inside an empty `/tmp` directory and
created no files.

The command SHALL NOT create, modify, or delete any file, and SHALL NOT install any
package.

#### Scenario: Run in an empty directory

- **GIVEN** an empty working directory
- **WHEN** the operator runs `orbit doctor`
- **THEN** the directory is still empty afterwards
