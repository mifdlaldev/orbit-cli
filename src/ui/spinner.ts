/**
 * Spinner Wrapper
 */

import ora, { type Ora } from 'ora';

/**
 * Custom orbit spinner: a planet (●) travelling along a dotted ring (◌).
 * 8 frames — full sweep right, then back left — 90ms per frame.
 */
const ORBIT_FRAMES: readonly string[] = [
  '●◌◌◌◌',
  '◌●◌◌◌',
  '◌◌●◌◌',
  '◌◌◌●◌',
  '◌◌◌◌●',
  '◌◌◌●◌',
  '◌◌●◌◌',
  '◌●◌◌◌',
];

export interface SpinnerOptions {
  text?: string;
}

export function createSpinner(options: SpinnerOptions = {}): Ora {
  return ora({
    text: options.text ?? 'Loading...',
    color: 'yellow',
    spinner: {
      interval: 90,
      frames: [...ORBIT_FRAMES],
    },
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
