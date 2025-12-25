/**
 * Box Drawing Utilities
 */

import chalk from 'chalk';
import { symbols } from './symbols.js';

/**
 * Print empty line
 */
export function spacer(): void {
  console.log();
}

/**
 * Print horizontal divider
 */
export function divider(width = 50): void {
  console.log(chalk.dim(symbols.horizontal.repeat(width)));
}

/**
 * Draw a box around content
 */
export function box(lines: string[], options: { title?: string } = {}): void {
  const maxLen = Math.max(...lines.map((l) => l.length), options.title?.length ?? 0);
  const width = maxLen + 4;

  const top = options.title
    ? `${symbols.topLeft}─ ${options.title} ${'─'.repeat(
        width - (options.title?.length ?? 0) - 5,
      )}${symbols.topRight}`
    : `${symbols.topLeft}${'─'.repeat(width - 2)}${symbols.topRight}`;

  console.log(chalk.dim(top));
  for (const line of lines) {
    console.log(
      chalk.dim(symbols.vertical) + ' ' + line.padEnd(maxLen + 1) + chalk.dim(symbols.vertical),
    );
  }
  console.log(chalk.dim(`${symbols.bottomLeft}${'─'.repeat(width - 2)}${symbols.bottomRight}`));
}

/**
 * Return box as string instead of printing
 */
export function boxString(content: string, title?: string): string {
  const lines = content.split('\n');
  const maxLength = Math.max(...lines.map((l) => l.length), title?.length ?? 0);
  const width = maxLength + 4;

  const topBorder = title
    ? `${symbols.topLeft}─ ${chalk.bold(title)} ${'─'.repeat(width - (title?.length ?? 0) - 5)}${symbols.topRight}`
    : `${symbols.topLeft}${'─'.repeat(width - 2)}${symbols.topRight}`;
  const bottomBorder = `${symbols.bottomLeft}${'─'.repeat(width - 2)}${symbols.bottomRight}`;

  const paddedLines = lines.map((line) => {
    const padding = ' '.repeat(maxLength - line.length);
    return `${symbols.vertical} ${line}${padding} ${symbols.vertical}`;
  });

  return [topBorder, ...paddedLines, bottomBorder].join('\n');
}
