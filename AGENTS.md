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
├── web/                   landing page — separate Astro + Tailwind package (see §3 "web/")
├── openspec/              intent layer: specs and change proposals
├── .github/               CI workflow, dependabot, issue templates, Pages deploy
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
| `npm run lint` | **61 errors, 57 warnings** — this is the baseline, report the delta |
| `npm audit` | 11 vulnerabilities (2 critical, 8 high, 1 moderate) — **all devDependencies**, vitest/vite/rollup/esbuild chain |
| `npm audit --omit=dev` | **0 vulnerabilities** — production tree clean |

Do not "fix" the audit findings unless asked; the fix is a vitest major upgrade.

### `web/` — the landing page

`web/` is a separate npm package (Astro 7 + Tailwind CSS v4) that deploys to GitHub Pages
at https://mifdlaldev.github.io/orbit-cli/. It is NOT part of the npm package — only
`src/` ships.

| Fact | Value (verified 2026-08-08) |
| :--- | :--- |
| Build | `npm run build` in `web/` → exit 0, static output in `web/dist` |
| Typecheck | `npm run typecheck` in `web/` → 0 errors (`astro check`) |
| Catalog assertion | `web/scripts/assert-catalog.ts` runs before `astro build`; fails the build if the page's framework ids or nodejs/php split differ from `src/frameworks/` |
| Live URL | https://mifdlaldev.github.io/orbit-cli/ → HTTP 200, dark theme + hero + terminal verified in a real browser |
| Deploy | `.github/workflows/pages.yml` on push to `main` (build + upload-pages-artifact@v5 + deploy-pages@v5) |

**GitHub Pages subpath gotcha (hit 2026-08-08):** Pages serves the repo at `/orbit-cli/`,
so `astro.config.mjs` MUST set `base: '/orbit-cli/'`. Without it Astro emits root-absolute
asset URLs (`/_astro/*.css`) that 404 on the host — the page loads but renders unstyled
(default blue links, serif font). Symptom: HTML 200 but no CSS; check the `href` of the
`<link rel="stylesheet">` in the deployed HTML and that the file returns 200 at
`https://mifdlaldev.github.io/orbit-cli/_astro/...`. Local `astro preview` does NOT
reproduce this — always verify asset URLs at the deploy target.

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
| `create my-app --yes -t nextjs -p npm -s minimal` (non-TTY) | Scaffolds `demo-app` via create-next-app: installs 359 packages, prints "✓ Project created at ..." + next-steps, exits 0. `create --yes` alone (missing pm/stack) exits 1 with "Interactive input required"; invalid flags exit 1 with the matching ORBIT-V code | 0 / 1 |
| `create <name> --yes -t nuxt -p npm -s minimal` (non-TTY) | nuxi scaffolds "✨ Nuxt project has been created with the minimal template", then "✓ Project created at ...", exit 0 | 0 |
| `create <name> --yes -t astro -p npm -s minimal` (non-TTY) | create-astro scaffolds a full project (astro.config.mjs, package.json, node_modules), "✓ Project created at ...", exit 0 | 0 |
| `create <name> --yes -t sveltekit -p npm -s minimal` (non-TTY) | sv create scaffolds with eslint.config.js ("You're all set!"), "✓ Project created at ...", exit 0 | 0 |
| `create my-app -t nextjs -p npm -s minimal` (real PTY) | Spinner runs "Preparing project..." → "Installing nextjs..." → "✔ Project created successfully!"; directory created; exit 0. Full scaffold ~5 min (npm install dominates) | 0 |

### Version string lives in two places

`package.json` `"version"` and `src/index.ts:12` `const VERSION`, plus a display-only
literal in `src/ui/banner.ts:24`. All three currently read `0.1.0`. Changing one without
the others creates a mismatch — `--version` reads `src/index.ts`, not `package.json`.

### Repository state

`main` tracks `origin/main` on `github.com/mifdlaldev/orbit-cli`. Public. As of
2026-08-08: GitHub Release **v0.1.0** live (with the npm tarball attached, verified
downloadable), package published to **GitHub Packages** (via
`.github/workflows/publish.yml`, GITHUB_TOKEN `packages: write`), and the **public npmjs
publish pending** — it needs `npm adduser` (or an `NPM_TOKEN` secret on the repo). CI runs
on push and PR (§7); `web/` deploys to GitHub Pages on push to `main`.

---

## 4. What each command actually does

Short version so you do not have to guess:

- **`list`** — reads `src/frameworks/*.ts` through the lazy registry and prints. Works.
  Note it prints an outro advertising `--template`, a flag `create` never reads.
- **`doctor`** — `spawnSync <tool> --version` with a 5000 ms timeout, 8 tools, parses
  `/v?(\d+\.\d+\.\d+)/`. Works. The missing-required-tool branch has never been executed.
- **`create`** — accepts `[name]` positional + `-t/--template`, `-p/--pm`, `-s/--stack`,
  `-y/--yes`. Non-interactive when all needed values come from flags or `--yes` defaults;
  prompts only for missing fields on a TTY. Then runs a 5-step use case: validate, check
  environment, install framework, apply stack config, init git. Verified end-to-end with
  Next.js (see §3 runtime table).

---

## 5. Known defects — verified, unfixed

Do not re-diagnose these. Do not claim any is fixed without re-running the reproduction.
IDs are stable — reference them in commits, issues, and specs.

### Blocking — all four FIXED 2026-08-08

**B-01 — FIXED. `create` now reads every CLI flag.**
`src/commands/create.ts` passes the positional name and `options` into
`collectCreateInput(name, options)` in `src/flows/create-flow.ts`, which builds the input
from flags first and prompts only for missing fields on a TTY. `--yes` supplies defaults
(template `nextjs`, pm `npm`, stack `minimal`, options all on).
Verified: `node dist/index.js create demo-app2 --yes -t nextjs -p npm -s minimal
< /dev/null` → exit 0, "✓ Project created at /tmp/orbit-qa/demo-app2". Flag `-t bogus`
exits 1 with "Framework \"bogus\" is not supported." (ORBIT-V004).

**B-02 — FIXED. No crash without a TTY.**
`create-flow.ts` now checks `process.stdin.isTTY && process.stdout.isTTY` before calling
any clack prompt. Non-TTY with full flags runs headless; non-TTY missing a required value
throws the new `VALIDATION.V007` ("Interactive input required") instead of hitting clack's
`uv_tty_init`. Verified: `create flagtest2 -t nextjs < /dev/null` → exit 1, clean error
message, no stack trace, no exit 99.

**B-03 — FIXED. Per-manager commands now come from `src/frameworks/*.ts`.**
`framework-installer.ts` no longer rebuilds argv with `args.slice(1)`. It reads
`framework.installCommand[packageManager]` from the registry, splits the template string,
appends the project name, then appends `flags.typescript` / `flags.eslint` when selected.
Verified: nextjs+npm runs `npx --yes create-next-app@latest --yes demo-app --ts --eslint`,
which scaffolded successfully. The framework files were also corrected against each
scaffolder's real CLI (verified by librarian, 2026-08-08): nuxt passes
`--template minimal --packageManager <pm> --no-gitInit` (nuxi's non-TTY required args),
astro/vue/sveltekit/remix/laravel carry their official non-interactive flags, and remix
now uses `create-react-router@latest` (`create-remix@latest` prints a deprecation stub).

**B-04 — FIXED. No hang during install.**
Three changes: (1) `create-flow.ts` reporter gained `onChildSpawn`/`onChildExit` and stops
the ora spinner while any child process runs, so the scaffolder's TTY output is not
competing with spinner repaints; (2) every scaffolder is invoked with its official
non-interactive flag, so it never waits on a hidden prompt; (3) `framework-installer.ts`
`executeCommand` gained a 600 s timeout that kills the child and raises ORBIT-C003.
Verified: full PTY run (`script -qfc`) scaffolded `ptytest`, spinner text advanced
Preparing → Installing → "✔ Project created successfully!", exit 0.

### Design defects

**D-01 — Mostly FIXED. `create` now consumes `src/frameworks/*.ts`.**
`framework-installer.ts` builds every install command from `installCommand[pm]` in the
registry — `list` and `create` finally describe the same system. Remaining duplication:
stack presets still exist in both `src/frameworks/*.ts` `stacks` and
`usecases/create-project.ts:174-207`; the usecase copy is the one actually applied. Not
yet unified.

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
npm run lint          # note the delta vs the 61/57 baseline in §3
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

Any change to `web/` additionally requires the page gates:

```bash
cd web && npm ci && npm run typecheck && npm run build   # build includes the catalog assertion
```

And any change that affects deployed assets MUST be re-checked at the deploy target, not
just in local preview — the Pages subpath gotcha (§3 "web/") is invisible locally:

```bash
curl -s https://mifdlaldev.github.io/orbit-cli/ | grep -oE 'href="[^"]*\.css[^"]*"' | head -1
# the href MUST start with /orbit-cli/, then fetch it and expect 200
```

`create` scaffolds into `process.cwd()`, so run it from an empty scratch dir. A real run
installs dependencies and takes minutes; always bound it with `timeout` regardless.
`tmux` is not installed here, so allocate a PTY with `script`:

```bash
cd /tmp && rm -rf orbit-qa && mkdir orbit-qa && cd orbit-qa
timeout 500 script -qfc "node $ORB create demo-app --yes -t nextjs -p npm -s minimal" out.log
# or exercise the non-TTY path headlessly:
node $ORB create demo-app --yes -t nextjs -p npm -s minimal < /dev/null; echo "exit=$?"
sed -e 's/\x1b\[[0-9;?]*[a-zA-Z]//g' -e 's/\r/\n/g' out.log
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
  lint       N errors, M warnings (baseline 61/57)
  web build  exit 0 (if web/ changed)
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
61-error baseline, so blocking on it would fail every run). A separate `web` job runs
`npm ci && npm run typecheck && npm run build` in `web/` so a broken page build fails CI
without blocking the CLI jobs.

`.github/workflows/pages.yml` builds `web/` and deploys `web/dist` to GitHub Pages on every
push to `main` (upload-pages-artifact@v5 + deploy-pages@v5, latest verified releases).

`.github/dependabot.yml` checks npm weekly, grouped, 5 PRs max.

CI green does **not** mean `create` works. CI never runs `create`, because a real scaffold
needs a network npm install that takes minutes. Do not read a green badge as a working
product — runtime verification is §6.

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
| `cli-create` | works for the exercised path — 8 verified, 0 broken, 8 untested (B-01..B-04 fixed 2026-08-08; untested = pnpm/yarn/bun/php paths + non-minimal stacks) |
| `framework-catalog` | data now consumed by both list and create — 5 verified, 1 broken (D-06) |
| `project-validation` | strongest area — 7 verified (42 tests), 1 broken (D-02) |
| `command-execution` | 5 verified, 2 broken (D-03, D-04/D-05) |

`openspec/config.yaml` carries the project context and the artifact rules that enforce the
status tags. Read it before writing any artifact.

Slash commands are per-tool and gitignored. Generate them for your own tool with
`openspec init --tools <your-tool>` — for OpenCode that writes `.opencode/commands/` with
`/opsx-explore`, `/opsx-propose`, `/opsx-apply`, `/opsx-sync`, `/opsx-archive`,
`/opsx-update`. Only `openspec/` itself is committed.

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
  As of 2026-08-08 four framework paths (npm package manager) are verified end to end —
  Next.js, Nuxt, Astro, SvelteKit — and `create` with `-t nuxt|astro|sveltekit` exits 0.
  Astro, Vue, Remix and Laravel plus the pnpm/yarn/bun managers and the non-minimal stacks
  remain unexecuted on the reference machine. Publishing to npm / GitHub Packages /
  Releases was explicitly requested and approved by the user (2026-08-08).
- `node_modules/`, `dist/`, `.codegraph/`, `.omo/`, `coverage/` are generated. Never commit,
  never treat as source.
- Do not add a dependency for something the existing tree already covers. Production deps:
  `@clack/prompts`, `chalk`, `commander`, `figlet`, `gradient-string`, `ora`, `zod`
  (unused, P-03).
- Do not cite the old repository's planning documents as status. See the provenance note at
  the top.
