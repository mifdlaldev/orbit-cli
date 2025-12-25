/**
 * Text Styling Utilities
 */

import chalk from 'chalk';

export const text = {
  // Hierarchy levels
  title: (s: string): string => chalk.bold(s),
  body: (s: string): string => s,
  secondary: (s: string): string => chalk.hex('#A1A1AA')(s),
  dim: (s: string): string => chalk.dim(s),
  hint: (s: string): string => chalk.hex('#71717A')(s),

  // Inline styles
  bold: (s: string): string => chalk.bold(s),
  italic: (s: string): string => chalk.italic(s),
  underline: (s: string): string => chalk.underline(s),
  strikethrough: (s: string): string => chalk.strikethrough(s),

  // Special formatting
  code: (s: string): string => chalk.hex('#22D3EE')(`\`${s}\``),
  path: (s: string): string => chalk.underline.hex('#A1A1AA')(s),
  command: (s: string): string => chalk.bold.hex('#22D3EE')(s),
  link: (s: string): string => chalk.underline.hex('#6366F1')(s),
};
