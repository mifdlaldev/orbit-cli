/**
 * ASCII Banner Display
 * LAZY LOAD - Only when needed
 *
 * Hand-authored solar-system composition (29 cols x 8 rows):
 * a sun (◉) at the core, two concentric orbit rings, planets (●)
 * riding the rings, "ORBIT" as the core label.
 */

import chalk from 'chalk';

// Solar-system hues (kept token-aligned with orbitTheme.colors)
const SUN_HEX = '#FBBF24';
const PLANET_HEX = '#22D3EE';

// 29 columns wide, 8 rows tall. Center column is 14.
const BANNER_LINES: readonly string[] = [
  '        . - ~ ~ ~ - .        ',
  '     .  /     ●     \\  .     ',
  '    /     . ~ ~ ~ .     \\    ',
  '   |  ●       ◉       ●  |   ',
  '   |        ORBIT        |   ',
  '    \\     . ~ ~ ~ .     /    ',
  '     .  \\     ●     /  .     ',
  '        . - ~ ~ ~ - .        ',
];

export async function showBanner(): Promise<void> {
  // Skip in CI or non-TTY
  if (!process.stdout.isTTY || process.env.CI || process.env.NO_BANNER) {
    return;
  }

  // Lazy load heavy dependencies
  const { nebula } = await import('./gradients.js');
  const { text } = await import('./text.js');

  const sun = chalk.hex(SUN_HEX);
  const planet = chalk.hex(PLANET_HEX);

  // Colour each line: rings take the nebula gradient, the sun and the
  // planets keep their own hue, everything else passes through.
  const renderLine = (line: string): string =>
    line
      .split(/([◉●])/)
      .map((part) => {
        if (part === '◉') return sun(part);
        if (part === '●') return planet(part);
        return nebula(part);
      })
      .join('');

  console.log();
  for (const line of BANNER_LINES) {
    console.log(renderLine(line));
  }
  console.log();
  console.log(`  🚀 ${text.dim('Universal Project Generator  v0.1.0')}`);
  console.log();
}
