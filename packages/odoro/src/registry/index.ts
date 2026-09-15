/**
 * Format and resolution of the component registry.
 *
 * This module is the **contract** between the registry that publishes and the
 * client that downloads. A single definition, used at both ends: the registry
 * validates what it produces, the client validates what it receives from a
 * server it does not control.
 *
 * @example
 * import { parseMeta, resolveGraph } from 'odoro/registry'
 *
 * @module
 */

export {
  CATEGORIES,
  FALLBACKS,
  GL_BACKENDS,
  PERF_TIERS,
  entryId,
  metaSchema,
  parseMeta,
  type IndexEntry,
  type PublishedEntry,
  type RegistryIndex,
  type RegistryMeta,
  type RegistryMetaInput,
} from './schema.js'

export {
  describeProblem,
  resolveGraph,
  toCatalogue,
  validateCatalogue,
  type ResolutionProblem,
  type ResolutionResult,
  type ResolvableEntry,
  type ResolvedGraph,
} from './resolve.js'
