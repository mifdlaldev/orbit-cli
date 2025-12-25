/**
 * Box Drawing Utilities
 */

import chalk from 'chalk';

export function box(content: string, title?: string): string {
  const lines = content.split('\n');
  const maxLength = Math.max(...lines.map((l) => l.length), title?.length ?? 0);
  const width = maxLength + 4;

  const topBorder = title
    ? `╭─ ${chalk.bold(title)} ${'─'.repeat(width - title.length - 5)}╮`
    : `╭${'─'.repeat(width - 2)}╮`;
  const bottomBorder = `╰${'─'.repeat(width - 2)}╯`;

  const paddedLines = lines.map((line) => {
    const padding = ' '.repeat(maxLength - line.length);
    return `│ ${line}${padding} │`;
  });

  return [topBorder, ...paddedLines, bottomBorder].join('\n');
}
