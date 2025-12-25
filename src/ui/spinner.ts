/**
 * Spinner Wrapper
 */

import ora, { type Ora } from 'ora';

export interface SpinnerOptions {
  text?: string;
}

export function createSpinner(options: SpinnerOptions = {}): Ora {
  return ora({
    text: options.text ?? 'Loading...',
    color: 'magenta',
    spinner: 'dots',
  });
}

// Convenience methods
export const spinner = {
  start: (text: string): Ora => createSpinner({ text }).start(),

  async wrap<T>(text: string, fn: () => Promise<T>): Promise<T> {
    const s = createSpinner({ text }).start();
    try {
      const result = await fn();
      s.succeed();
      return result;
    } catch (error) {
      s.fail();
      throw error;
    }
  },
};
