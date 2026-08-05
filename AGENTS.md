# AGENTS.md — ORBIT CLI

Ground-truth briefing for AI agents and humans working in this repository.

**Why this file exists.** This project was built by AI agents working from a large set of
planning documents, and those documents claimed features were finished that were not. The
code was inherited with a working `list` and `doctor`, a `create` command that cannot
complete a single run, and documentation asserting it was production-ready. This file is
the arbiter of what is actually true.

Precedence: **the code wins over this file; this file wins over every other document.** If
you find this file contradicts the code, fix this file in the same turn (rule R8).

Provenance: extracted from `mifdlaldev/orbit-cli-old` via `git subtree split`, carrying the
9 commits that touched the package. The historical planning documents (`Agent-0/`,
`.agent/`, `scripts/`) were deliberately left behind — **they are not part of this
repository and must not be cited here.** If you need the history of a decision, it is in
the old repo, and it is history, not status.

---

## 1. Non-negotiable rules

Hard blocks. Violating any one is a failed task regardless of how good the rest looks.

### R1 — Never state a fact about this code you have not observed

Before writing a claim about behaviour, structure, or status, you must have read the file
in this session or run the command in this session.

- Forbidden: "the CLI supports `--template`", "validation uses Zod", "that bug was fixed" —
  unless you just verified it.
- Required form when unverified: "I have not verified X." Then verify it, or stop.

### R2 — Documentation is not evidence

`README.md`, this file, and anything in `openspec/` are **claims**. Only these satisfy R1:

| Evidence type | How to obtain |
| :--- | :--- |
| Source content | Read the file |
| Type correctness | `npm run typecheck` |
| Build works | `npm run build` |
| Tests pass | `npm run test:run` |
| Lint state | `npm run lint` |
| Runtime behaviour | Execute `node dist/index.js <args>` and read the output |
| Exit code | Run the command, then read `$?` |

### R3 — Never mark work done without running it

"Should work", "the types line up", "the logic is correct" are not completion. For a CLI,
completion means you executed the built binary and read its output. A change touching
`create` requires running `create` — see §6.

### R4 — Report failures verbatim

Paste the actual error. Never soften a failure. Never present a partial fix as a fix. If a
gate did not run, write "did not run"; never imply it passed.

### R5 — Never invent an identifier

No invented file paths, flags, env vars, error codes, npm scripts, or function names. Error
codes come only from `src/core/errors/messages.ts`. Scripts come only from `package.json`.

### R6 — Do not extend scope silently

There is a known defect backlog (§5). Fixing an unrelated one while doing another task is
scope creep. Fix what was asked; list what you noticed.

### R7 — Do not revert or delete work you did not create

The worktree may be shared with the user or another agent. Unexpected changes are somebody
else's in-flight work. `node_modules/` and `dist/` are gitignored build output — their
presence or absence is not a signal.

### R8 — Update this file when reality changes

Fixing an item in §5 means moving it out and adjusting §4. A stale AGENTS.md is the exact
failure mode this file exists to prevent.

---

## 2. Repository layout

```
/                          git root, remote: github.com/mifdlaldev/orbit-cli
├── src/                   the package source — 60 .ts files, 3876 lines
├── openspec/              intent layer: specs and change proposals
├── .github/               CI workflow, dependabot, issue templates
├── AGENTS.md              this file
├── README.md              user-facing, honest about what does not work
├── package.json           @mifdlaldev/orbit-cli, bin: orbit
├── tsconfig.json          strict + exactOptionalPropertyTypes + noUncheckedIndexedAccess
├── tsup.config.ts         ESM bundle, dts disabled
├── vitest.config.ts       node environment
├── eslint.config.js
└── LICENSE                MIT
```

Everything ships from `dist/` (`package.json` → `"files": ["dist"]`).

### Layer map

```
src/index.ts              commander entry, lazy-imports each command
src/commands/             thin CLI wrappers: create.ts, list.ts, doctor.ts
  helpers/check-tools.ts  spawnSync tool probes, used ONLY by doctor.ts
src/flows/                create-flow.ts, doctor-flow.ts — prompts + orchestration
src/core/container.ts     factory DI, wires services into usecases
src/core/domain/          pure types: framework.ts, project.ts, environment.ts
src/core/usecases/        create-project.ts, check-environment.ts
src/core/services/        framework-installer, config-applier, git-initializer, tool-detector
src/core/errors/          types.ts (codes, exit codes), classes.ts, messages.ts
src/core/errors.ts        LEGACY duplicate error system — see D-05
src/frameworks/           7 framework definitions + lazy-loading registry
src/ui/                   banner, colors, gradients, box, symbols, text, spinner, prompts, error-display
src/utils/                validation, safe-path, safe-executor, executor, safe-env, filesystem, logger
src/__tests__/            ONE file: unit/utils/validation.test.ts
```

Runtime call path for `create`, as written on disk:

```
index.ts → commands/create.ts → flows/create-flow.ts
        → core/container.ts → usecases/create-project.ts
        → services/{framework-installer, config-applier, git-initializer}
```

`doctor` does **not** use that path. `commands/doctor.ts` calls
`commands/helpers/check-tools.ts` directly and never touches the container.
`flows/doctor-flow.ts` and `usecases/check-environment.ts` exist but no command reaches
them (D-04).

---

## 3. Verified facts

Every row was produced by running the command in this repository. Re-verify before relying
on it; environment-dependent rows are marked.

**Measured on:** 2026-08-05, Linux, in
`/media/bismillah/DATA/Projects/PROJECT-GITHUB/orbit-cli`, after `git subtree split` from
the old repo.

### Toolchain on this machine (environment-dependent)

| Tool | Version |
| :--- | :--- |
| node | v24.18.1 |
| npm | 11.16.0 |
| git | 2.43.0 |
| bun | 1.3.14 |
| pnpm | not installed |
| yarn | not installed |
| php | not installed |
| composer | not installed |
| tmux | not installed — use `script` for a PTY, see §6 |

`package.json` declares `"engines": { "node": ">=18.20.0" }`. Local node is 24. Nothing
verified here is automatically true on Node 18.

### Quality gates

| Command | Result |
| :--- | :--- |
| `npm ci` | 222 packages, exit 0 |
| `npm run typecheck` | exit 0, **0 errors** |
| `npm run build` | exit 0, tsup ESM bundle, ~550 ms |
| `npm run test:run` | **42 tests pass, 1 test file** (`utils/validation.test.ts` only) |
| `npm run lint` | **62 errors, 57 warnings** — this is the baseline, report the delta |
| `npm audit` | 11 vulnerabilities (2 critical, 8 high, 1 moderate) — **all devDependencies**, vitest/vite/rollup/esbuild chain |
| `npm audit --omit=dev` | **0 vulnerabilities** — production tree clean |

Do not "fix" the audit findings unless asked; the fix is a vitest major upgrade.

### Runtime behaviour — `node dist/index.js <args>` after `npm run build`

| Invocation | Verified result | Exit |
| :--- | :--- | :--- |
| `--help` | Lists `create`, `list`, `doctor`, `help` | 0 |
| `--version` | `0.1.0` | 0 |
| `doctor` | Probes 8 tools, prints ✓/⚠ per tool, outro "All requirements met!" | 0 |
| `list` | Groups 6 Node.js frameworks + 1 PHP framework | 0 |
| `list nextjs` | Name, description, website, 3 stack presets, required tools | 0 |
| `list bogus` | "Framework "bogus" not found." + lists 7 valid ids | 1 |
| `bogus-cmd` | commander unknown-command error | 1 |
| `create my-app --yes -t nextjs -p npm -s minimal` (non-TTY) | **CRASH**: `TTY initialization failed: uv_tty_init returned EINVAL (invalid argument)`, no directory created | 99 |
| `create` (real PTY, all prompts answered) | Reaches `⠋ Preparing project...` and **never completes**; no directory after >100 s | — |

### Version string lives in two places

`package.json` `"version"` and `src/index.ts:12` `const VERSION`, plus a display-only
literal in `src/ui/banner.ts:24`. All three currently read `0.1.0`. Changing one without
the others creates a mismatch — `--version` reads `src/index.ts`, not `package.json`.

### Repository state

`main` tracks `origin/main` on `github.com/mifdlaldev/orbit-cli`. Public. No release, no
npm publish — intentionally, until `create` works. CI runs on push and PR (§7).

---

## 4. What each command actually does

Short version so you do not have to guess:

- **`list`** — reads `src/frameworks/*.ts` through the lazy registry and prints. Works.
  Note it prints an outro advertising `--template`, a flag `create` never reads.
- **`doctor`** — `spawnSync <tool> --version` with a 5000 ms timeout, 8 tools, parses
  `/v?(\d+\.\d+\.\d+)/`. Works. The missing-required-tool branch has never been executed.
- **`create`** — collects five interactive prompts, then runs a 5-step use case: validate,
  check environment, install framework, apply stack config, init git. Blocked at step 3.

---

## 5. Known defects — verified, unfixed

Do not re-diagnose these. Do not claim any is fixed without re-running the reproduction.
IDs are stable — reference them in commits, issues, and specs.

### Blocking

**B-01 — `create` discards every CLI flag.**
`src/commands/create.ts:38` names the first parameter `_projectName` with the comment
"Reserved for future CLI --name flag integration", so the name is dropped;
`options.template` / `options.pm` / `options.stack` are never read. Line 55 calls
`collectCreateInput()` with no arguments, so the interactive prompts always run. `--yes`
only skips the banner (line 43). There is no non-interactive path.

**B-02 — `create` crashes in any non-TTY context.**
Reproduce: `node dist/index.js create my-app --yes < /dev/null`. Result:
`TTY initialization failed: uv_tty_init returned EINVAL`, exit 99. Unusable in CI, pipes,
or under a non-interactive agent.

**B-03 — Package-manager command mapping is wrong for pnpm/yarn/bun.**
`src/core/services/framework-installer.ts:76-86` rebuilds the argv as
`['create', ...cmd.args.slice(1)]`, and `cmd.args[0]` is the create-package name itself:

| framework + pm | Command produced | Correct? |
| :--- | :--- | :--- |
| nextjs + npm | `npx create-next-app@latest my-app --typescript --eslint` | yes |
| nextjs + pnpm | `pnpm create my-app --typescript --eslint` | no — lost `next-app` |
| nuxt + pnpm | `pnpm create init my-app` | no — lost `nuxi@latest` |
| astro + bun | `bunx create astro@latest my-app` | no — `bunx create` is not a command |

Only the npm path is correct. The correct per-manager strings already exist unused in
`src/frameworks/*.ts` `installCommand` — a fix should consume them (see D-01).

**B-04 — Install hangs.**
`framework-installer.ts:99` uses `stdio: ['inherit','inherit','pipe']` while
`flows/create-flow.ts:125` holds a live `ora` spinner. The child scaffolder
(`create-next-app`) prompts on the same TTY the spinner is repainting. Observed: stuck at
`⠋ Preparing project...` past 100 s, project never created. There is also no timeout
anywhere on this path — `utils/safe-executor.ts:105` implements one and is never called.

### Design defects

**D-01 — Two competing sources of truth for install commands.**
Each `src/frameworks/*.ts` exports a full `installCommand` (per-manager strings plus flags)
and `stacks`. `framework-installer.ts:42-71` ignores all of it and hardcodes its own table.
So `src/frameworks/` is consumed only by `commands/list.ts`, and `list` describes a system
`create` does not implement. Stack presets are duplicated a third time at
`usecases/create-project.ts:174-207`.

**D-02 — Two divergent project-name rules, and the deeper layer is weaker.**
`utils/validation.ts:42` requires `/^[a-z][a-z0-9-]*$/` plus Windows reserved names plus a
build-name deny-list. `usecases/create-project.ts:137` independently checks
`/^[a-z0-9-]+$/`, which accepts `-app`. A leading dash reaching a scaffolder's argv is a
flag-injection surface, and the weaker check sits *below* the stronger one — defence in
depth inverted.

**D-03 — Three env sanitizers; the strongest is dead code.**
`utils/safe-executor.ts:50` `sanitizeEnv` strips 15 named keys plus any key matching
SECRET / PASSWORD / `_TOKEN` / PRIVATE_KEY — **no importer**. `utils/safe-env.ts` is a third
variant — **no importer**. The one actually used, `framework-installer.ts:140` `getSafeEnv`,
strips only 7 keys. `config-applier.ts:64` spawns the package manager with **no env
sanitization at all**.

**D-04 — `doctor` bypasses the architecture.**
`commands/doctor.ts` calls `helpers/check-tools.ts` directly. `flows/doctor-flow.ts`,
`usecases/check-environment.ts` and `services/tool-detector.ts` implement the same
capability through the container, and no command reaches them.

**D-05 — Duplicate error systems.**
`src/core/errors.ts` (legacy `OrbitError`, `CommandExecutionError`) coexists with
`src/core/errors/` (code-tagged `OrbitBaseError` + `messages.ts`). Only
`utils/executor.ts` imports the legacy one, and `utils/executor.ts` is itself reachable
only through a barrel, never called.

**D-06 — Duplicate domain types.**
`FrameworkId`, `PackageManager` and `StackPresetId` are declared in
`core/domain/framework.ts`, `core/domain/project.ts`, `frameworks/types.ts`, and again in
`core/types.ts` (no importer). The two `Framework` interfaces are not interchangeable:
`core/domain` has `versions`, `frameworks/types` has `installCommand`.

### Dead code / packaging

**P-01 — `src/cli.ts` is 0 bytes.**

**P-02 — Unused modules (no importer anywhere):** `utils/filesystem.ts`,
`utils/logger.ts`, `utils/safe-env.ts`, `core/types.ts`. Reachable only via a barrel but
never called: `utils/executor.ts`, `utils/safe-executor.ts`, `flows/doctor-flow.ts`.

**P-03 — `zod` is in `dependencies` and imported nowhere.** The only occurrences of the
string are as a scaffolded dependency inside `src/frameworks/*.ts` preset lists.

**P-04 — No type declarations are emitted.** `tsup.config.ts` sets `dts: false` (commented:
gradient-string type issue). `package.json` `exports` was corrected to stop pointing at a
non-existent `dist/index.d.ts`, so the package is installable — but it ships no types.
Re-enable `dts` before anyone consumes this as a library.

**P-05 — FIXED.** The placeholder issue URL in `src/core/errors/messages.ts:175` now points
at `https://github.com/mifdlaldev/orbit-cli/issues`.

**P-06 — Test coverage is one module.** `utils/validation` only. No test touches the
installer, use cases, flows, container, registry, or any command.

---

## 6. How to verify — mandatory before claiming done

Run from the repository root. Never skip a gate that applies.

```bash
npm ci                # first time only
npm run typecheck     # must exit 0
npm run build         # must exit 0, emits dist/
npm run test:run      # 42 tests must still pass
npm run lint          # note the delta vs the 62/57 baseline in §3
```

Then exercise the built CLI. Reading the source is not verification (R3).

```bash
cd /tmp && rm -rf orbit-qa && mkdir orbit-qa && cd orbit-qa
ORB=/media/bismillah/DATA/Projects/PROJECT-GITHUB/orbit-cli/dist/index.js
node $ORB --help
node $ORB doctor        ; echo "exit=$?"
node $ORB list          ; echo "exit=$?"
node $ORB list nextjs   ; echo "exit=$?"
node $ORB list bogus    ; echo "exit=$?"   # expect 1
```

`create` needs an interactive terminal. `tmux` is not installed here, so allocate a PTY
with `script`, and always bound it with `timeout` because of B-04:

```bash
timeout 120 script -qfc "node $ORB create" /tmp/orbit-qa/out.log
sed -e 's/\x1b\[[0-9;?]*[a-zA-Z]//g' -e 's/\r/\n/g' /tmp/orbit-qa/out.log
```

Always clean up: `rm -rf /tmp/orbit-qa`, and delete any scaffolded project.
**Never run `create` inside this repository** — it writes into `process.cwd()`
(`framework-installer.ts:27`).

### Reporting template

```
Gates:
  typecheck  exit 0
  build      exit 0
  test       42/42 pass
  lint       N errors, M warnings (baseline 62/57)
Runtime:
  <exact command> → <observed output>, exit <code>
Not verified:
  <anything you could not run, and why>
```

---

## 7. CI

`.github/workflows/ci.yml` runs on push to `main` and on pull requests, across Node 20 and
22: `npm ci`, `npm run typecheck`, `npm run build`, `npm run test:run`, then
`npm run lint` and `npm audit --omit=dev` as non-blocking informational steps (lint has a
62-error baseline, so blocking on it would fail every run).

`.github/dependabot.yml` checks npm weekly, grouped, 5 PRs max.

CI green does **not** mean `create` works. CI never runs `create`, because B-02 makes it
crash in a non-TTY environment. Do not read a green badge as a working product.

---

## 8. OpenSpec workflow

`openspec/` holds the intent layer. `openspec/specs/<capability>/spec.md` records what each
capability is supposed to do; `openspec/changes/<id>/` holds in-flight proposals with
`proposal.md`, `design.md`, `tasks.md`, and spec deltas.

Six capabilities are specified. All six pass `openspec validate --all --strict`:

| Capability | State |
| :--- | :--- |
| `cli-doctor` | works — 3 verified requirements, 1 untested failure branch |
| `cli-list` | works — 4 verified requirements |
| `cli-create` | **does not work** — 4 broken (B-01..B-04), 5 untested, 1 verified sub-case |
| `framework-catalog` | data correct but mostly unconsumed — 4 verified, 1 broken (D-06) |
| `project-validation` | strongest area — 7 verified (42 tests), 1 broken (D-02) |
| `command-execution` | 2 verified, 3 broken (B-04, D-03, D-04/D-05) |

`openspec/config.yaml` carries the project context and the artifact rules that enforce the
status tags. Read it before writing any artifact.

Slash commands live in `.opencode/commands/` when generated by
`openspec init --tools opencode`: `/opsx-explore`, `/opsx-propose`, `/opsx-apply`,
`/opsx-sync`, `/opsx-archive`, `/opsx-update`. That directory is gitignored as local tool
config; regenerate it with `openspec init --tools <your-tool>`.

CLI: `npx -y @fission-ai/openspec@1.7.0 <list|show|validate|status|doctor|context>`.
Verified at 1.7.0. Requires Node ≥ 20.19.0. `openspec spec list` is deprecated in favour of
`openspec validate --specs` and `openspec show`.

### Spec discipline — this is where hallucination leaks in

Every requirement body opens with a status tag:

- `[VERIFIED]` — observed by running the software. Cite the command.
- `[BROKEN]` — the requirement is the intent; the code fails it. Cite the defect ID from §5
  and a reproduction.
- `[UNTESTED]` — written in the code, never executed. Never use it as proof of behaviour.

Rules:

1. A requirement describing behaviour that does not exist yet belongs in
   `openspec/changes/`, **not** in `openspec/specs/`.
2. Never promote `[UNTESTED]` to `[VERIFIED]` without pasting the run output.
3. Never silently drop a `[BROKEN]` tag. Removing it claims you fixed the defect, which
   needs §6 evidence.
4. `openspec` requires every requirement body to contain `SHALL` or `MUST`, and every
   requirement to have at least one `#### Scenario:` block. State a broken requirement as
   the intended `SHALL`, then record the observed failure in the scenario — never weaken
   the requirement to match the bug.

---

## 9. Code conventions — read from the actual config files

From `tsconfig.json`: ES2022 target, ESNext modules, bundler resolution, `strict`, plus
`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`,
`exactOptionalPropertyTypes`, `noImplicitReturns`, `noUncheckedIndexedAccess`,
`isolatedModules`. Path alias `@/*` → `./src/*`.

`exactOptionalPropertyTypes` is why optional properties are written `foo?: T | undefined`
throughout. That is deliberate — though eslint's `no-duplicate-type-constituents` flags it,
which is part of the 62. Do not "clean" these without deciding which of the two configs
yields.

From `.prettierrc` and `eslint.config.js`: run `npm run format` and `npm run lint`; do not
hand-format.

Hard constraints, regardless of task:

- **ESM only.** `"type": "module"`. Relative imports carry the `.js` extension even in
  `.ts` sources.
- **Never `exec` / `execSync`.** Child processes use `spawn` / `spawnSync` with
  `shell: false`. Every existing call site does this — keep it. (Two grep false positives:
  `check-tools.ts:39` is `RegExp.prototype.exec`; `tool-detector.ts:72` is a private method
  named `exec`.)
- **Never `as any`, `@ts-ignore`, `@ts-expect-error`.** `typecheck` is at 0 errors — keep it
  there.
- **Never write outside the target project directory.** Path handling goes through
  `utils/safe-path.ts`.
- **User-facing errors use the code-tagged system** (`core/errors/classes.ts` +
  `messages.ts`), never the legacy `core/errors.ts` (D-05).
- `console.log` in `src/ui/` and `src/commands/` is intentional CLI output; the `no-console`
  warnings there are expected.

---

## 10. Boundaries

- **Never commit, amend, or push** unless explicitly asked. Propose the message and wait.
- **Never publish to npm** and never cut a GitHub Release without an explicit request.
  Nothing ships while B-01..B-04 stand.
- `node_modules/`, `dist/`, `.codegraph/`, `.omo/`, `coverage/` are generated. Never commit,
  never treat as source.
- Do not add a dependency for something the existing tree already covers. Production deps:
  `@clack/prompts`, `chalk`, `commander`, `figlet`, `gradient-string`, `ora`, `zod`
  (unused, P-03).
- Do not cite the old repository's planning documents as status. See the provenance note at
  the top.
