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
