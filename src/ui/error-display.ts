/**
 * Error Display Functions
 * User-friendly error display for ORBIT CLI
 */

import * as p from '@clack/prompts';
import { colors, c } from './colors.js';
import type { OrbitError } from '../core/errors/types.js';

/**
 * Display user-friendly error message
 */
export function displayError(error: OrbitError): void {
  console.log();
  console.log(c.fail(error.title || 'Error'));

  if (error.message) {
    console.log();
    console.log(`  ${colors.dim(error.message)}`);
  }

  if (error.hint) {
    console.log();
    console.log(`  ${colors.info('💡 Hint:')} ${error.hint}`);
  }

  if (process.env.DEBUG) {
    console.log();
    console.log(colors.dim(`  Code: ${error.code}`));
    if (error.stack) {
      console.log(colors.dim(error.stack));
    }
  }

  console.log();
}

/**
 * Display validation error inline (for prompt validation)
 */
export function displayValidationError(message: string): string {
  return colors.error(message);
}

/**
 * Cancel operation display
 */
export function displayCancel(message = 'Operation cancelled.'): void {
  p.cancel(message);
}

/**
 * Display warning (non-fatal)
 */
export function displayWarning(message: string, hint?: string | undefined): void {
  console.log(c.warn(message));
  if (hint) {
    console.log(colors.dim(`  ${hint}`));
  }
}

/**
 * Display info message
 */
export function displayInfo(message: string): void {
  console.log(c.info(message));
}

/**
 * Display success message
 */
export function displaySuccess(message: string): void {
  console.log(c.ok(message));
}
