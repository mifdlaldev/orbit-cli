/**
 * Dependency Injection Container
 * Simple factory-based DI
 */

import { ToolDetector } from './services/tool-detector.js';

export interface Container {
  services: {
    toolDetector: ToolDetector;
  };
}

export function createContainer(): Container {
  // Services
  const toolDetector = new ToolDetector();

  return {
    services: {
      toolDetector,
    },
  };
}
