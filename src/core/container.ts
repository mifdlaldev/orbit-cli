/**
 * Dependency Injection Container
 * Factory-based DI for wiring all services and use cases
 */

// Services
import { ToolDetector } from './services/tool-detector.js';
import { FrameworkInstaller } from './services/framework-installer.js';
import { ConfigApplier } from './services/config-applier.js';
import { GitInitializer } from './services/git-initializer.js';

// Use Cases
import { CheckEnvironmentUseCase } from './usecases/check-environment.js';
import { CreateProjectUseCase } from './usecases/create-project.js';

/**
 * Container structure
 */
export interface Container {
  readonly usecases: {
    readonly createProject: CreateProjectUseCase;
    readonly checkEnvironment: CheckEnvironmentUseCase;
  };
  readonly services: {
    readonly toolDetector: ToolDetector;
    readonly frameworkInstaller: FrameworkInstaller;
    readonly configApplier: ConfigApplier;
    readonly gitInitializer: GitInitializer;
  };
}

/**
 * Create and wire all dependencies
 * Simple factory-based DI (no heavy DI framework needed for CLI)
 */
export function createContainer(): Container {
  // 1. Create infrastructure services (low-level)
  const toolDetector = new ToolDetector();
  const frameworkInstaller = new FrameworkInstaller();
  const configApplier = new ConfigApplier();
  const gitInitializer = new GitInitializer();

  // 2. Create use cases (high-level, depends on services)
  const checkEnvironment = new CheckEnvironmentUseCase(toolDetector);
  const createProject = new CreateProjectUseCase(
    checkEnvironment,
    frameworkInstaller,
    configApplier,
    gitInitializer,
  );

  // 3. Return organized container
  return {
    usecases: {
      createProject,
      checkEnvironment,
    },
    services: {
      toolDetector,
      frameworkInstaller,
      configApplier,
      gitInitializer,
    },
  };
}
