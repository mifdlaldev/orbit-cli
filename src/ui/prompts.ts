/**
 * Prompt Utilities
 * Wrapper for @clack/prompts with ORBIT theming
 */

import * as p from '@clack/prompts';
import { setTimeout } from 'node:timers/promises';

// Re-export for direct access
export { p, setTimeout };

// Define option type for our wrapper
interface SelectOption<T> {
  value: T;
  label: string;
  hint?: string;
}

/**
 * Themed confirm prompt
 */
export async function confirm(message: string, initialValue = true): Promise<boolean> {
  const result = await p.confirm({ message, initialValue });
  if (p.isCancel(result)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }
  return result;
}

/**
 * Themed select prompt
 */
export async function selectOption<T extends string>(
  message: string,
  options: SelectOption<T>[],
): Promise<T> {
  // Use type assertion to bypass exactOptionalPropertyTypes issue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await p.select({ message, options: options as any });
  if (p.isCancel(result)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }
  return result as T;
}

/**
 * Themed text input prompt
 */
export async function textInput(
  message: string,
  options: {
    placeholder?: string | undefined;
    initialValue?: string | undefined;
    validate?: ((value: string) => string | undefined) | undefined;
  } = {},
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const textOptions: any = { message };
  if (options.placeholder !== undefined) textOptions.placeholder = options.placeholder;
  if (options.initialValue !== undefined) textOptions.initialValue = options.initialValue;
  if (options.validate !== undefined) textOptions.validate = options.validate;

  const result = await p.text(textOptions);
  if (p.isCancel(result)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }
  return result;
}

/**
 * Handle cancel
 */
export function handleCancel(value: unknown): void {
  if (p.isCancel(value)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }
}
