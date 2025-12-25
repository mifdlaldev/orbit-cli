/**
 * List Command
 * Display available frameworks and versions
 */

import { c } from '../ui/colors.js';

export async function runList(framework?: string): Promise<void> {
  const { registry } = await import('../frameworks/index.js');

  if (framework) {
    // Show specific framework details
    const fw = await registry.get(framework);
    if (fw) {
      console.log(c.ok(`${fw.name} - ${fw.description}`));
      console.log(`  Website: ${fw.website}`);
    } else {
      console.log(c.fail(`Framework "${framework}" not found`));
    }
  } else {
    // List all frameworks
    const frameworks = registry.getAvailableIds();
    console.log(c.info('Available frameworks:'));
    frameworks.forEach((id) => {
      console.log(`  - ${id}`);
    });
  }
}
