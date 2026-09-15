/**
 * Odoro back-end base.
 *
 * The kernel only: container, configuration, modules, errors, logger,
 * route definition. The feature modules — authentication, account,
 * files — live elsewhere and mount onto this kernel.
 *
 * @module
 */

export { createApp, type AppOptions, type OdoroApp } from './kernel/app.js'

export {
  mergeSources,
  toFieldErrors,
  validateInput,
  validateOutput,
} from './kernel/http/validate.js'

export {
  createContainer,
  type Container,
  type Factory,
  type Resolver,
  type Scope,
  type ServicesOf,
} from './kernel/container.js'

export {
  ConfigError,
  ENVIRONMENTS,
  defaultPoolSize,
  loadConfig,
  type ConfigProblem,
  type Environment,
  type KernelConfig,
} from './kernel/config.js'

export {
  ModuleError,
  assertCapabilities,
  defineModule,
  orderModules,
  type ModuleDefinition,
} from './kernel/module.js'

export {
  ApiError,
  CORRELATION_HEADER,
  ConflictError,
  ERROR_KINDS,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ServiceUnavailableError,
  UnauthorizedError,
  ValidationError,
  createErrorHandler,
  notFoundHandler,
  type ErrorHandlerOptions,
  type ErrorKind,
  type FieldError,
  type ProblemDocument,
} from './kernel/http/errors.js'

export {
  METHODS,
  MUTATING_METHODS,
  findOpenMutations,
  route,
  type AuthRequirement,
  type HandlerContext,
  type Identity,
  type Method,
  type OpenHandlerContext,
  type OpenMutationWarning,
  type RouteDefinition,
  type RouteOptions,
} from './kernel/http/route.js'

export {
  REDACTED_PATHS,
  createLogger,
  createRequestContext,
  currentContext,
  log,
  type Logger,
  type LoggerOptions,
  type RequestContext,
} from './kernel/logger.js'
