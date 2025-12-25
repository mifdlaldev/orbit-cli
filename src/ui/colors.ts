/**
 * Color Definitions
 */

import chalk from 'chalk';

export const colors = {
  // Status colors
  success: chalk.hex('#10B981'),
  error: chalk.hex('#EF4444'),
  warning: chalk.hex('#F59E0B'),
  info: chalk.hex('#6366F1'),

  // Brand colors
  primary: chalk.hex('#8B5CF6'),
  secondary: chalk.hex('#6366F1'),
  accent: chalk.hex('#22D3EE'),

  // Text colors
  text: chalk.hex('#FAFAFA'),
  dim: chalk.hex('#A1A1AA'),
  muted: chalk.hex('#71717A'),

  // Modifiers
  bold: chalk.bold,
  underline: chalk.underline,
};

// Semantic shortcuts
export const c = {
  ok: (text: string): string => `${chalk.hex('#10B981')('✓')} ${text}`,
  fail: (text: string): string => `${chalk.hex('#EF4444')('✗')} ${text}`,
  warn: (text: string): string => `${chalk.hex('#F59E0B')('⚠')} ${text}`,
  info: (text: string): string => `${chalk.hex('#6366F1')('ℹ')} ${text}`,
  step: (n: number, total: number, text: string): string =>
    `${chalk.dim(`[${n}/${total}]`)} ${text}`,
};
