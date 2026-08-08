# Tasks — landing page

## 1. Scaffold `web/`

- [x] 1.1 Create `web/package.json` with pinned Astro + Tailwind CSS v4 + TypeScript dev deps, scripts `dev`, `build`, `preview`, `typecheck`
- [x] 1.2 Create `web/astro.config.mjs` (static output, `site` pointing at the GitHub Pages URL, integrations: tailwind)
- [x] 1.3 Create `web/tsconfig.json` extending the Astro strict TS preset
- [x] 1.4 Create `web/src/styles/global.css` with `@import "tailwindcss"`, OKLCH `@theme` tokens (background, surface, text, muted, border, accent, success), body width cap, type scale, 4px rhythm
- [x] 1.5 Run `npm install` in `web/`; verify `npm run build` emits static HTML (first smoke pass)

## 2. Content data source

- [x] 2.1 Create `web/src/data/site.ts` exporting `frameworks` (id, name, category, website, tagline), `commands` (create/list/doctor + flags), and `status` (dated verified statements per spec: list/doctor verified, create Next.js+npm verified, others declared)
- [x] 2.2 Create `web/scripts/assert-catalog.ts` build script: imports `getAvailableIds()` from `../../src/frameworks/index.ts` and fails the build if `site.ts` framework ids differ
- [x] 2.3 Wire the assertion into `web/package.json` `build` script (runs before `astro build`)
- [x] 2.4 Verify the assertion passes with current catalog (7 ids) and fails on a deliberate mismatch (temporary edit, then revert)

## 3. Layout and components

- [x] 3.1 Create `web/src/layouts/Base.astro` — html head with meta description/OG tags, global.css import, semantic `<header>/<main>/<footer>`, skip-link, visible focus styles
- [x] 3.2 Create `Header.astro` — product name, anchor nav (Features, Frameworks, Status, Quickstart), repo link
- [x] 3.3 Create `Footer.astro` — repository links, license note, "simulated output" disclosure if needed
- [x] 3.4 Create `FrameworkCard.astro` / framework grid section rendering `frameworks` from site.ts, grouped Node.js vs PHP
- [x] 3.5 Create `StatusSection.astro` rendering the dated `status` data with a visual "verified / declared" badge per item

## 4. Hero and terminal demo

- [x] 4.1 Create `Hero.astro` — tagline, primary CTA (quickstart anchor), secondary CTA (GitHub), respects reduced motion
- [x] 4.2 Create `TerminalDemo.astro` — fake terminal window with title bar, prompt, and a `steps` array of lines faithfully shortened from the verified Next.js create run, labeled simulated
- [x] 4.3 Add minimal vanilla script for the type/step animation; static final state when `prefers-reduced-motion: reduce`; verify no JS needed to read final output
- [x] 4.4 Create `index.astro` composing Base + Header + Hero (+TerminalDemo) + Features + Frameworks + Status + Quickstart + Footer in spec order

## 5. Features and quickstart sections

- [x] 5.1 Create `FeaturesSection.astro` — cards for `list`, `doctor`, `create` from `commands` data (what each does, key flags), no fabricated claims
- [x] 5.2 Create `QuickstartSection.astro` — honest install/build steps from README: clone, `npm ci`, `npm run build`, `node dist/index.js doctor`; note that nothing is published to npm yet

## 6. Quality gates

- [x] 6.1 Add `web` job to `.github/workflows/ci.yml` — npm ci + typecheck + build in `web/` (fails on PR)
- [x] 6.2 Create `.github/workflows/pages.yml` — build `web/` on push to `main` + PR, deploy via configure-pages/upload-pages-artifact/deploy-pages on `main`
- [x] 6.3 Verify `npm run build` output is a static directory; open the built `index.html` and confirm zero JS required to read (browser devtools, JS disabled)
- [x] 6.4 Keyboard-audit: tab through page, confirm visible focus on every interactive element (spec a11y scenario)
- [x] 6.5 Contrast + reduced-motion audit: run Lighthouse (or equivalent) on the built page; fix contrast failures; confirm animation honors reduced motion
- [x] 6.6 Run `openspec validate --all --strict` — expect 6 main specs + this change all pass

## 7. Docs and repo wiring

- [x] 7.1 Update root `README.md` — mention the website, add `web/` to the architecture layout, note `web/` dev commands
- [x] 7.2 Set repo About/homepage to the GitHub Pages URL (after first deploy) via `gh repo edit`
- [x] 7.3 Commit and push; confirm the Pages workflow deploys and the site is reachable at the Pages URL
