# Design — landing page

## Context

See proposal.md — Why. The CLI lives in `src/` at the repo root; `web/` is a new sibling
directory with its own package. Requirements are in specs/landing-page/spec.md. Current
verified state (2026-08-08): `list`/`doctor` verified; `create` fixed (B-01..B-04) with
only the Next.js + npm path executed end to end. The page must not out-claim that.

## Goals / Non-Goals

Goals:
- Static-first site in `web/`, deployable to GitHub Pages, zero client JS required to read.
- One structured data source for status + frameworks that the templates consume.
- Honest content that cannot drift from `src/frameworks/*.ts` or AGENTS.md status.

Non-Goals:
- No docs site (separate effort; README stays the doc surface for now).
- No client-side interactivity beyond the terminal demo animation and minimal
  scroll/nav polish. No framework comparison tables, no blog, no analytics.
- No changes to the CLI source under `src/` (fixes no B/D/P defect).

## Decisions

### D1 — Astro + Tailwind CSS v4, static output

- **Choice:** Astro (static, `output: 'static'`) + Tailwind CSS v4 (utility classes via
  `@import "tailwindcss"`), all content authored in `.astro` components; the terminal demo
  is a small island component (no framework, vanilla TypeScript or a tiny script tag).
- **Why:** Astro ships zero JS by default (performance budget requirement), and its
  component model keeps templates readable. Tailwind v4 removes config-heavy setup and
  gives design tokens (OKLCH-first) directly in CSS. Vanilla TS for the demo keeps the
  interactive surface trivial — no React/Vue dependency for one animation.
- **Alternatives considered:** Next.js (heavier, server needed for SSR, overkill for a
  static page); plain HTML + CDN Tailwind (no build, but no component reuse, harder to
  keep honest-status data single-sourced); React-only SPA (fails the zero-JS requirement).

### D2 — Single content source: `web/src/data/site.ts` + build-time framework import

- **Choice:** One `site.ts` module holds `frameworks` (id, name, category, website,
  tagline) and `status` (verified statements as of a dated snapshot), plus
  `commands` (create/list/doctor with their flags). Templates import it directly.
- **Why:** The "status can be kept in sync" requirement — one file to edit when a defect
  is fixed. Framework names/categories can be imported from `../../src/frameworks/types.ts`
  via a relative import at build time, but the registry uses lazy dynamic `import()` which
  is awkward from Astro; simplest honest approach: a small generated-or-maintained list
  whose ids are asserted against the registry at build time.
- **Build-time assertion:** a tiny build script reads the framework registry
  (`src/frameworks/index.ts` `getAvailableIds()`) and fails the build if `site.ts`
  frameworks differ — the page cannot disagree with `orbit list`.
- **Alternatives:** fetch from registry dynamically at build (dynamic imports in Astro
  are possible but brittle with tsup/esbuild interop); CMS/data file (overkill).

### D3 — Dark theme via OKLCH design tokens, no default indigo

- **Choice:** `@theme` tokens in Tailwind v4 using OKLCH: a near-black background
  (`oklch(0.13 0.02 260)` family), one accent hue chosen deliberately (recommend a
  cyan/teal or amber — decided at implementation after the frontend-design skill review),
  neutral surface ramp, and semantic color roles (text, muted, border, accent, success).
  Body text width capped (~65–75ch per commandcode /design guidance), type scale with
  ratio ≥ 1.25, spacing on a 4px base rhythm.
- **Why:** OKLCH-first per the researched Command Code design rules; a custom hue instead
  of indigo avoids the "AI-slop default" look; tokens keep contrast ratios auditable.
- **Alternatives:** Tailwind default palette (generic look); light-first (CLI tools are
  conventionally dark).

### D4 — GitHub Pages workflow + CI gate

- **Choice:** `.github/workflows/pages.yml` using `actions/configure-pages` +
  `actions/upload-pages-artifact` + `actions/deploy-pages` (the standard Pages
  deployment trio), building `web/` with `npm ci && npm run build` and publishing the
  static output. The existing `ci.yml` gains a `web` job (typecheck + build) so PRs are
  gated. Pages source = GitHub Actions, branch `gh-pages` auto-created by the deploy
  action.
- **Why:** Deploying from Actions (not a `gh-pages` branch) is the current GitHub
  recommendation, and `deploy-pages` handles the artifact upload. A separate `web` CI job
  keeps page failures from blocking CLI CI and vice versa.
- **Alternatives:** push-to-`gh-pages` branch via `peaceiris/actions-gh-pages` (works, but
  third-party action + branch management); Vercel (external account, rejected by choice).

### D5 — Terminal demo: visual-only stepper

- **Choice:** A `TerminalDemo.astro` component that renders a fake terminal window
  (title bar, prompt, output lines) and types/steps through lines with a small vanilla
  script. Content is a local `steps` array — a faithful, shortened rendering of a real
  `create` run (from the verified Next.js run output), labeled "simulated output".
- **Why:** requirement says visual-only; honest labeling ("simulated") keeps the honesty
  rule. No dependency on the actual CLI executing in the browser.
- **Reduced motion:** if `prefers-reduced-motion: reduce`, render the final state
  statically.

## Risks / Trade-offs

- [Page claims drift from CLI reality] → single `site.ts` + build-time id assertion
  against the framework registry; status snapshots carry the date they were verified;
  AGENTS.md honesty rules apply to page content too.
- [Astro version churn / Tailwind v4 beta churn] → pin exact versions in `web/package.json`;
  the `web` CI job fails loudly if the build breaks.
- [Terminal demo misleads about speed] → demo is explicitly a simulation; real runs take
  minutes (npm install), the page does not claim otherwise.
- [GitHub Pages 404 on client routing] → static site, no client router, so no SPA 404
  problem; `astro build` outputs plain HTML.
- [Two package trees in one repo] → `web/` has its own `package.json`/lockfile; root
  scripts and CI target the right directory; README documents the layout.

## Migration Plan

- Deploy: merge the change → `pages.yml` runs on `main` push → GitHub Pages serves the
  site. Enable Pages in repo settings once (source: GitHub Actions).
- Rollback: revert the commit; Pages rebuilds from the previous `main` state. No data
  migration, no database, no breaking CLI change.

## Open Questions

- Exact accent hue and typeface pairing — deferred to implementation, decided with the
  frontend-design skill review; changes visuals only, not the spec/approach.
- Whether to add a lightweight analytics beacon — out of scope for now; can be added
  later without touching specs.
