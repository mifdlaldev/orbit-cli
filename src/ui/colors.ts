/**
 * Color Definitions
 */

import chalk from 'chalk';

export const colors = {
  // Status
  success: chalk.hex('#10B981'),
  error: chalk.hex('#EF4444'),
  warning: chalk.hex('#F59E0B'),
  info: chalk.hex('#6366F1'),

  // Brand
  primary: chalk.hex('#8B5CF6'),
  secondary: chalk.hex('#6366F1'),
  accent: chalk.hex('#22D3EE'),

  // Text
  text: chalk.hex('#FAFAFA'),
  dim: chalk.hex('#A1A1AA'),
  muted: chalk.hex('#71717A'),
};

// Semantic shortcuts
export const c = {
  ok: (t: string): string => `${chalk.hex('#10B981')('✓')} ${t}`,
  fail: (t: string): string => `${chalk.hex('#EF4444')('✗')} ${t}`,
  warn: (t: string): string => `${chalk.hex('#F59E0B')('⚠')} ${t}`,
  info: (t: string): string => `${chalk.hex('#6366F1')('ℹ')} ${t}`,
};
