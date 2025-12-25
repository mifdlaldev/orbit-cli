/**
 * Prompt Wrappers
 * Wrapper around @clack/prompts for consistent styling
 */

import * as p from '@clack/prompts';

export { p };

export async function confirm(message: string): Promise<boolean> {
  const result = await p.confirm({ message });
  if (p.isCancel(result)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }
  return result;
}

// Define option type for our wrapper
interface SelectOption<T> {
  value: T;
  label: string;
  hint?: string;
}

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
