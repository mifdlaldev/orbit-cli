/**
 * ASCII Banner Display
 * LAZY LOAD - Only when needed
 */

export async function showBanner(): Promise<void> {
  // Skip in CI or non-TTY
  if (!process.stdout.isTTY || process.env['CI'] || process.env['NO_BANNER']) {
    return;
  }

  // Lazy load heavy dependencies
  const figlet = await import('figlet');
  const { nebula } = await import('./gradients.js');
  const { text } = await import('./text.js');

  const banner = figlet.default.textSync('ORBIT', {
    font: 'ANSI Shadow',
  });

  console.log();
  console.log(nebula.multiline(banner));
  console.log();
  console.log(`  🚀 ${text.dim('Universal Project Generator  v0.1.0')}`);
  console.log();
}
