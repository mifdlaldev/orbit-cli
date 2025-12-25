/**
 * Text Styling Utilities
 */

import chalk from 'chalk';

export const text = {
  bold: (t: string): string => chalk.bold(t),
  dim: (t: string): string => chalk.dim(t),
  italic: (t: string): string => chalk.italic(t),
  underline: (t: string): string => chalk.underline(t),
  strikethrough: (t: string): string => chalk.strikethrough(t),
};
