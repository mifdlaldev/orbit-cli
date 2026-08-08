## Why

ORBIT CLI is intended as a portfolio showcase project, but today it has no public face: no
website, no docs site, no way for a reviewer to see what the tool does without cloning and
building it. The repo README is honest but plain. A polished, fast, dark-mode landing page
in the style of commandcode.ai / opencode.ai gives the project a professional presentation
that matches the quality of the codebase — and it becomes the first thing a reviewer or
recruiter sees.

## What Changes

- Add a static landing page in `web/` inside this repository, built with Astro + Tailwind
  CSS (static-first, zero client JS by default, ultra-fast on GitHub Pages).
- The landing page SHALL show the ORBIT terminal experience: hero with an animated terminal
  demo of `orbit create`, feature cards for the three commands, the supported-framework
  catalog, honest status section, install/quickstart instructions, and footer.
- **Honesty constraint (non-negotiable, per AGENTS.md §1):** the page SHALL state the real
  product status — `list` and `doctor` verified; `create` fixed but only the Next.js + npm
  path executed end-to-end; other frameworks declared but unexecuted. No claim of behaviour
  that has not been run. No fake testimonials, no fabricated stats.
- Content data (frameworks, commands, status) SHALL be derived from the real sources of
  truth where feasible: `src/frameworks/*.ts` for the catalog and `AGENTS.md` §3/§5 for
  status claims, so the page cannot drift from reality.
- Add a GitHub Pages deployment workflow (`web/` builds and publishes to `gh-pages`), plus
  a `web/` CI gate (typecheck + build) so the page cannot break silently.
- Add the landing page to the repo root README and the repo `homepage`/About so GitHub
  links to it.

## Capabilities

### New Capabilities
- `landing-page`: The public website for ORBIT CLI — structure, content, honesty rules,
  performance budget, accessibility, and deployment. Live at GitHub Pages.

### Modified Capabilities
<!-- None: this change adds a website; it does not alter CLI behaviour. -->
- (none)

## Impact

- New `web/` directory with its own `package.json`, `astro.config.mjs`, `tailwind.config`,
  and `src/` layout — independent of the existing `src/` CLI source (no collision).
- New `.github/workflows/pages.yml` for GitHub Pages deploy + a `web` job in the CI
  workflow.
- New dependency tree under `web/` (Astro, Tailwind). CLI production deps untouched.
- `README.md` and repo About/homepage updated to link the site.
- No change to any CLI source file or behaviour; fixes no defect IDs (B/D/P) — it is a
  presentation layer. The honesty rules prevent the page from ever claiming a defect is
  fixed when it is not.
