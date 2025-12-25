/**
 * Logger Utilities
 * Simple logging for CLI
 */

export const logger = {
  debug: (message: string, ...args: unknown[]): void => {
    if (process.env['DEBUG']) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: unknown[]): void => {
    console.log(message, ...args);
  },

  warn: (message: string, ...args: unknown[]): void => {
    console.warn(`⚠ ${message}`, ...args);
  },

  error: (message: string, ...args: unknown[]): void => {
    console.error(`✗ ${message}`, ...args);
  },
};
