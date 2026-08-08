/**
 * Build-time assertion: the landing page's framework list must match the
 * CLI's framework registry exactly. Runs before `astro build` (see
 * web/package.json). Fails with a non-zero exit when they diverge, so the
 * page can never disagree with `orbit list`.
 *
 * Imported from the CLI source tree (../../src/frameworks/index.ts).
 */

import { registry } from '../../src/frameworks/index.js';
import { frameworks } from '../src/data/site.js';

const pageIds = frameworks.map((f) => f.id).sort();
const registryIds: string[] = registry.getAvailableIds().slice().sort();

const missing = registryIds.filter((id) => !pageIds.includes(id));
const extra = pageIds.filter((id) => !registryIds.includes(id));
const wrongCategory = frameworks.filter(
  (f) =>
    f.category !==
    // categories are fixed: nodejs for all but laravel (php)
    (f.id === 'laravel' ? 'php' : 'nodejs'),
);

if (missing.length > 0 || extra.length > 0) {
  console.error(
    `Catalog mismatch between web/src/data/site.ts and src/frameworks:\n` +
      `  missing from page: ${missing.join(', ') || '(none)'}\n` +
      `  on page but not in registry: ${extra.join(', ') || '(none)'}`,
  );
  process.exit(1);
}

if (wrongCategory.length > 0) {
  console.error(
    `Category mismatch in web/src/data/site.ts: ${wrongCategory.map((f) => f.id).join(', ')}`,
  );
  process.exit(1);
}

console.log(`assert-catalog: ${pageIds.length} frameworks match the CLI registry.`);
