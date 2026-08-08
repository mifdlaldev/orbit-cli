# ORBIT CLI

> Universal project generator CLI — Next.js, Nuxt, Astro, SvelteKit, Vue, Remix, Laravel

[![website](https://img.shields.io/badge/website-mifdlaldev.github.io%2Forbit--cli-cyan.svg)](https://mifdlaldev.github.io/orbit-cli/)
[![CI](https://github.com/mifdlaldev/orbit-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/mifdlaldev/orbit-cli/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18.20.0-brightgreen.svg)](./package.json)

ORBIT wraps the official scaffolder of each framework behind one interactive CLI, so you
pick a framework, a package manager and a stack preset instead of memorising seven
different `create-*` commands. The landing page at
[mifdlaldev.github.io/orbit-cli](https://mifdlaldev.github.io/orbit-cli/) shows the CLI in
action — including an honest status board of what is verified and what is not.

---

## Status: pre-alpha — read this before installing

This repository is honest about what runs today. `create` was broken until 2026-08-08;
the four blocking defects are fixed and the Next.js path is verified end to end. Other
framework paths still depend on tools this machine never exercised.

| Command | State |
| :--- | :--- |
| `orbit list` | Works. Lists all frameworks, or details for one. |
| `orbit doctor` | Works. Probes 8 tools and reports what is installed. |
| `orbit --help` / `--version` | Works. |
| `orbit create` | **Works for Next.js, Nuxt, Astro and SvelteKit with npm** (verified non-TTY and under a PTY, exit 0). Flags, non-interactive mode and timeout all fixed. Vue, Remix, Laravel and the pnpm/yarn/bun managers declared but not yet executed on the reference machine. |

The four former blocking defects — `B-01` through `B-04` — are fixed and documented with
the runs that proved it in [AGENTS.md](./AGENTS.md#5--known-defects--verified-unfixed).
The package name is `@mifdlaldev/orbit-cli` (the unscoped name `orbit-cli` belongs to an
unrelated package). Published to GitHub Packages and as a GitHub Release (v0.1.0); the
public npmjs.com publish is pending.

---

## Try it

From the GitHub Release (pre-alpha — only the paths listed in the status table above are
verified). The package name is `@mifdlaldev/orbit-cli`; the public npmjs.com publish is
pending, so install from the release tarball for now:

```bash
curl -LO https://github.com/mifdlaldev/orbit-cli/releases/download/v0.1.0/mifdlaldev-orbit-cli-0.1.0.tgz
npm install -g ./mifdlaldev-orbit-cli-0.1.0.tgz
orbit doctor
orbit list
orbit create my-app -t nextjs -p npm -s minimal --yes
```

Or build from source:

```bash
git clone https://github.com/mifdlaldev/orbit-cli.git
cd orbit-cli
npm ci
npm run build

node dist/index.js doctor
node dist/index.js list
node dist/index.js list nextjs
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

Scaffolds a project by delegating to the framework's official create tool. Accepts the
name positionally plus `-t, --template`, `-p, --pm`, `-s, --stack` and `-y, --yes`:

```bash
orbit create my-app -t nextjs -p npm -s minimal --yes   # fully non-interactive
orbit create my-app                                     # prompts on a TTY
```

With full flags (or `--yes` defaults) it runs headless — CI-safe. Missing values on a
non-TTY exit with a clean error. Verified end to end with Next.js, Nuxt, Astro and
SvelteKit (npm); Laravel needs PHP/Composer, Vue/Remix and the pnpm/yarn/bun paths are
declared but not yet run on this machine.

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

Caveat worth knowing: since 2026-08-08 `create` consumes `installCommand` from the
catalog, so `list` and `create` agree on commands. The stack presets `create` actually
applies still come from a separate table in `usecases/create-project.ts`, not from the
catalog's `stacks` lists (tracked as `D-01` residue).

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
web/                  landing page (Astro + Tailwind, deploys to GitHub Pages)
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
npm run lint        # eslint, baseline 61 errors / 57 warnings
npm run format      # prettier
```

The landing page in `web/` is a separate package:

```bash
cd web
npm ci
npm run dev         # astro dev server
npm run build       # catalog assertion + astro build -> web/dist
npm run typecheck   # astro check
```

`web/dist` is deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to
`main`. The build fails if the page's framework list diverges from the CLI registry.

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
| `cli-create` | 8 | 0 | 8 |
| `framework-catalog` | 5 | 1 | 0 |
| `project-validation` | 7 | 1 | 1 |
| `command-execution` | 5 | 2 | 0 |

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
