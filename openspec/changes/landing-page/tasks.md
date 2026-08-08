# Tasks — landing page

## 1. Scaffold `web/`

- [ ] 1.1 Create `web/package.json` with pinned Astro + Tailwind CSS v4 + TypeScript dev deps, scripts `dev`, `build`, `preview`, `typecheck`
- [ ] 1.2 Create `web/astro.config.mjs` (static output, `site` pointing at the GitHub Pages URL, integrations: tailwind)
- [ ] 1.3 Create `web/tsconfig.json` extending the Astro strict TS preset
- [ ] 1.4 Create `web/src/styles/global.css` with `@import "tailwindcss"`, OKLCH `@theme` tokens (background, surface, text, muted, border, accent, success), body width cap, type scale, 4px rhythm
- [ ] 1.5 Run `npm install` in `web/`; verify `npm run build` emits static HTML (first smoke pass)

## 2. Content data source

- [ ] 2.1 Create `web/src/data/site.ts` exporting `frameworks` (id, name, category, website, tagline), `commands` (create/list/doctor + flags), and `status` (dated verified statements per spec: list/doctor verified, create Next.js+npm verified, others declared)
- [ ] 2.2 Create `web/scripts/assert-catalog.ts` build script: imports `getAvailableIds()` from `../../src/frameworks/index.ts` and fails the build if `site.ts` framework ids differ
- [ ] 2.3 Wire the assertion into `web/package.json` `build` script (runs before `astro build`)
- [ ] 2.4 Verify the assertion passes with current catalog (7 ids) and fails on a deliberate mismatch (temporary edit, then revert)

## 3. Layout and components

- [ ] 3.1 Create `web/src/layouts/Base.astro` — html head with meta description/OG tags, global.css import, semantic `<header>/<main>/<footer>`, skip-link, visible focus styles
- [ ] 3.2 Create `Header.astro` — product name, anchor nav (Features, Frameworks, Status, Quickstart), repo link
- [ ] 3.3 Create `Footer.astro` — repository links, license note, "simulated output" disclosure if needed
- [ ] 3.4 Create `FrameworkCard.astro` / framework grid section rendering `frameworks` from site.ts, grouped Node.js vs PHP
- [ ] 3.5 Create `StatusSection.astro` rendering the dated `status` data with a visual "verified / declared" badge per item

## 4. Hero and terminal demo

- [ ] 4.1 Create `Hero.astro` — tagline, primary CTA (quickstart anchor), secondary CTA (GitHub), respects reduced motion
- [ ] 4.2 Create `TerminalDemo.astro` — fake terminal window with title bar, prompt, and a `steps` array of lines faithfully shortened from the verified Next.js create run, labeled simulated
- [ ] 4.3 Add minimal vanilla script for the type/step animation; static final state when `prefers-reduced-motion: reduce`; verify no JS needed to read final output
- [ ] 4.4 Create `index.astro` composing Base + Header + Hero (+TerminalDemo) + Features + Frameworks + Status + Quickstart + Footer in spec order

## 5. Features and quickstart sections

- [ ] 5.1 Create `FeaturesSection.astro` — cards for `list`, `doctor`, `create` from `commands` data (what each does, key flags), no fabricated claims
- [ ] 5.2 Create `QuickstartSection.astro` — honest install/build steps from README: clone, `npm ci`, `npm run build`, `node dist/index.js doctor`; note that nothing is published to npm yet

## 6. Quality gates

- [ ] 6.1 Add `web` job to `.github/workflows/ci.yml` — npm ci + typecheck + build in `web/` (fails on PR)
- [ ] 6.2 Create `.github/workflows/pages.yml` — build `web/` on push to `main` + PR, deploy via configure-pages/upload-pages-artifact/deploy-pages on `main`
- [ ] 6.3 Verify `npm run build` output is a static directory; open the built `index.html` and confirm zero JS required to read (browser devtools, JS disabled)
- [ ] 6.4 Keyboard-audit: tab through page, confirm visible focus on every interactive element (spec a11y scenario)
- [ ] 6.5 Contrast + reduced-motion audit: run Lighthouse (or equivalent) on the built page; fix contrast failures; confirm animation honors reduced motion
- [ ] 6.6 Run `openspec validate --all --strict` — expect 6 main specs + this change all pass

## 7. Docs and repo wiring

- [ ] 7.1 Update root `README.md` — mention the website, add `web/` to the architecture layout, note `web/` dev commands
- [ ] 7.2 Set repo About/homepage to the GitHub Pages URL (after first deploy) via `gh repo edit`
- [ ] 7.3 Commit and push; confirm the Pages workflow deploys and the site is reachable at the Pages URL
