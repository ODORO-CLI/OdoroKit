/**
 * Format et resolution du registre de composants.
 *
 * Ce module est le **contrat** entre le registre qui publie et le client qui
 * telecharge. Une seule definition, employee aux deux bouts : le registre
 * valide ce qu'il produit, le client valide ce qu'il recoit d'un serveur qu'il
 * ne controle pas.
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
