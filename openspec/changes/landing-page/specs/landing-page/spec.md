## Purpose

The landing page is the public face of ORBIT CLI: a fast, dark-mode website that shows a
reviewer what the tool is, how it works, and exactly what state it is in — without
exaggerating a single claim.

## ADDED Requirements

### Requirement: Page structure

The landing page SHALL contain, in order: a header with product name and navigation, a
hero section that presents the product and its one-line promise, a terminal demo of the
`orbit create` command, a features section covering the CLI's commands, a supported
frameworks section, an honest status section, a quickstart/install section, and a footer
with repository links.

#### Scenario: A first-time visitor lands on the page

- **WHEN** a reviewer opens the landing page
- **THEN** within the first viewport they see the product name, the tagline, and a
  terminal that demos `orbit create`
- **AND** scrolling reveals features, frameworks, status, quickstart, and footer sections
  in that order

### Requirement: Terminal demo

The hero SHALL include a terminal-style demo showing the `orbit create` command being
run, with a typed or stepped output resembling a real scaffold. The demo SHALL be
visual-only: it does not execute the CLI.

#### Scenario: The demo plays

- **WHEN** the page loads
- **THEN** the terminal shows `orbit create my-app --template nextjs` followed by output
  lines resembling `✓ Project created at ./my-app` and `Next steps`
- **AND** the animation respects `prefers-reduced-motion` (static final state if reduced
  motion is requested)

### Requirement: Honest status disclosure

The page SHALL state the real product status with no unverified claims. Claims about the
CLI SHALL come from verified sources: the commands `list` and `doctor` work; `create`
works for the exercised Next.js + npm path; other frameworks, package managers, and stack
presets are declared but not yet executed. The page SHALL NOT display fabricated
testimonials, fake download counts, or star counts.

#### Scenario: Status section reflects verified facts

- **WHEN** a reviewer reads the status section
- **THEN** it says `list` and `doctor` are verified, `create` is fixed but only the
  Next.js + npm path has been executed end to end, and other paths are declared but
  unexecuted
- **AND** no number or quote that has not been observed appears anywhere on the page

#### Scenario: Status can be kept in sync

- **WHEN** a CLI defect is fixed or a new framework path is verified
- **THEN** the page's status content is stored as structured data (not prose scattered
  through templates) so it can be updated in one place

### Requirement: Supported frameworks catalog

The page SHALL list the supported frameworks with their category. The catalog data SHALL
be derived from the framework definitions in `src/frameworks/*.ts` at build time so the
page cannot disagree with `orbit list`.

#### Scenario: Catalog matches the CLI

- **WHEN** the page is built
- **THEN** the frameworks shown are exactly the ids exported by the framework registry:
  nextjs, nuxt, astro, sveltekit, vue, remix, laravel
- **AND** laravel is grouped as PHP, the rest as Node.js

### Requirement: Performance budget

The page SHALL be a static site with zero required client-side JavaScript for reading.
Initial page load SHALL not require executing the CLI or a Node server. The page SHALL
target a good Lighthouse performance score for a content site.

#### Scenario: No JS required to read

- **WHEN** a browser requests the page with JavaScript disabled
- **THEN** the full content is still readable and navigable

#### Scenario: Static deploy

- **WHEN** the site is built
- **THEN** the output is a directory of static HTML/CSS/JS assets that can be served from
  GitHub Pages without a server

### Requirement: Accessibility

The page SHALL meet WCAG 2.1 AA: semantic landmarks, keyboard-navigable interactive
elements, visible focus states, sufficient color contrast, and `prefers-reduced-motion`
support.

#### Scenario: Keyboard navigation

- **WHEN** a keyboard user tabs through the page
- **THEN** every interactive element receives a visible focus indicator
- **AND** no interactive element is unreachable

### Requirement: Deployment

The page SHALL be published to GitHub Pages from the `web/` directory via a workflow that
builds on every push to `main` and on pull requests, and deploys on pushes to `main`.
A broken page build SHALL fail CI.

#### Scenario: Push to main publishes

- **WHEN** a commit lands on `main`
- **THEN** the GitHub Pages workflow builds `web/` and deploys the static output

#### Scenario: Pull request gates

- **WHEN** a pull request modifies `web/`
- **THEN** CI builds the page and reports failure if the build breaks
