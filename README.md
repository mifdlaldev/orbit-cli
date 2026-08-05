# ORBIT CLI

> Universal project generator CLI — Next.js, Nuxt, Astro, SvelteKit, Vue, Remix, Laravel

[![CI](https://github.com/mifdlaldev/orbit-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/mifdlaldev/orbit-cli/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18.20.0-brightgreen.svg)](./package.json)

ORBIT wraps the official scaffolder of each framework behind one interactive CLI, so you
pick a framework, a package manager and a stack preset instead of memorising seven
different `create-*` commands.

---

## Status: pre-alpha — read this before installing

This repository is honest about what runs today. Two commands work end to end; the
headline command does not.

| Command | State |
| :--- | :--- |
| `orbit list` | Works. Lists all frameworks, or details for one. |
| `orbit doctor` | Works. Probes 8 tools and reports what is installed. |
| `orbit --help` / `--version` | Works. |
| `orbit create` | **Does not work.** Ignores every CLI flag, crashes without a TTY, and hangs during install. |

`create` is tracked as four blocking defects — `B-01` through `B-04` — in
[AGENTS.md](./AGENTS.md#5--known-defects--verified-unfixed), with reproductions and root
causes for each. There is no npm release and no GitHub Release yet, deliberately: nothing
gets published until `create` completes a real run.

---

## Try it

Not on npm yet. Build from source:

```bash
git clone https://github.com/mifdlaldev/orbit-cli.git
cd orbit-cli
npm ci
npm run build

node dist/index.js doctor
node dist/index.js list
node dist/index.js list nextjs
```

Optionally link it so `orbit` is on your `PATH`:

```bash
npm link
orbit doctor
```

Do not run `create` inside a directory you care about — it scaffolds into
`process.cwd()`.

---

## Commands

### `orbit doctor`

Probes Node.js, npm, git, pnpm, yarn, bun, PHP and Composer. Node, npm and git are
required; the rest are optional. Read-only: installs nothing, writes nothing.

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

### `orbit list [framework]`

With no argument, lists every framework grouped by category. With a framework id, shows
its description, website, stack presets and required tools. An unknown id prints the
valid ids and exits `1`.

```bash
orbit list
orbit list nextjs
```

### `orbit create [name]`

Currently broken. The flags `-t, --template`, `-p, --pm`, `-s, --stack` and `-y, --yes`
are declared and parsed but never read (`B-01`). See the status table above.

---

## Supported frameworks

| Framework | Category | Required tools |
| :--- | :--- | :--- |
| Next.js | Node.js | node, npm |
| Nuxt | Node.js | node, npm |
| Astro | Node.js | node, npm |
| SvelteKit | Node.js | node, npm |
| Vue | Node.js | node, npm |
| Remix | Node.js | node, npm |
| Laravel | PHP | php, composer |

Each declares three stack presets: `minimal`, `standard`, `full`.

Caveat worth knowing: the catalog in `src/frameworks/` is currently read only by
`orbit list`. The create path keeps its own separate command table, so `list` describes
more than `create` implements. Tracked as `D-01`.

---

## Architecture

```
src/index.ts          commander entry, lazy-imports each command
src/commands/         thin CLI wrappers: create, list, doctor
src/flows/            prompt collection + orchestration
src/core/container.ts factory DI
src/core/domain/      pure types
src/core/usecases/    create-project, check-environment
src/core/services/    framework-installer, config-applier, git-initializer, tool-detector
src/core/errors/      code-tagged error system (ORBIT-V/E/F/C/I)
src/frameworks/       7 framework definitions + lazy registry
src/ui/               banner, colors, gradients, prompts, error display
src/utils/            validation, safe-path, executors
```

Runtime path for `create`:

```
index.ts → commands/create.ts → flows/create-flow.ts
        → core/container.ts → usecases/create-project.ts
        → services/{framework-installer, config-applier, git-initializer}
```

Errors carry a stable code and a fixed exit code:

| Category | Code prefix | Exit |
| :--- | :--- | :--- |
| Validation | `ORBIT-V*` | 1 |
| Environment | `ORBIT-E*` | 2 |
| Filesystem | `ORBIT-F*` | 3 |
| Command | `ORBIT-C*` | 4 |
| Internal | `ORBIT-I*` | 99 |

---

## Development

```bash
npm ci
npm run typecheck   # tsc --noEmit, currently 0 errors
npm run build       # tsup, ESM bundle
npm run test:run    # vitest, 42 tests
npm run lint        # eslint, baseline 62 errors / 57 warnings
npm run format      # prettier
```

Non-negotiable constraints, all currently upheld:

- ESM only. Relative imports carry the `.js` extension even in `.ts` sources.
- Never `exec` / `execSync`. Every subprocess uses `spawn` / `spawnSync` with
  `shell: false`.
- Never `as any`, `@ts-ignore`, `@ts-expect-error`. `typecheck` stays at 0 errors.
- Never write outside the target project directory.

Security posture: `npm audit --omit=dev` reports 0 vulnerabilities. The dev tree has
findings in the vitest/vite chain; fixing them means a vitest major upgrade.

---

## Spec-driven workflow

Intent lives in [`openspec/`](./openspec), managed with
[OpenSpec](https://openspec.dev). Six capabilities are specified, and every requirement
carries a status tag so nobody mistakes a plan for a fact:

- `[VERIFIED]` — observed by running the software, with the command cited
- `[BROKEN]` — the intent is right, the code fails it, defect ID cited
- `[UNTESTED]` — the code path exists but has never been executed

| Capability | Verified | Broken | Untested |
| :--- | --: | --: | --: |
| `cli-doctor` | 3 | 0 | 1 |
| `cli-list` | 4 | 0 | 0 |
| `cli-create` | 1 | 4 | 5 |
| `framework-catalog` | 4 | 1 | 1 |
| `project-validation` | 7 | 1 | 1 |
| `command-execution` | 2 | 3 | 2 |

```bash
npx -y @fission-ai/openspec@1.7.0 validate --all --strict
```

[AGENTS.md](./AGENTS.md) is the ground-truth briefing: verified facts, the full defect
list with reproductions, and the verification harness. Read it before changing anything —
whether you are a human or an AI agent.

---

## Contributing

Open an issue first for anything beyond a typo. Every code change needs the gates above
run and their real output reported; "should work" is not a result. Changes to `create`
additionally require running the built binary under a real terminal.

## License

MIT © 2025 mifdlaldev
