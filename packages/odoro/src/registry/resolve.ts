/**
 * Resolution of the dependency graph of the registry.
 *
 * An entry may require others — a shared hook, a utility. Before writing
 * anything into the user project, we therefore have to know exactly which
 * entries to install and in what order.
 *
 * ## The cycles
 *
 * Nothing structurally forbids two entries from requiring each other, and a
 * naive walk would get lost in them forever. The cycle is therefore detected,
 * and **reported with the path that makes it up**: an error that says only
 * "cycle detected" forces you to look for it by hand.
 *
 * ## The order
 *
 * The dependencies are installed before what requires them. That does not
 * matter for writing files, which is independent, but it does matter for what
 * the user sees scrolling by: a list where the dependencies appear after their
 * consumer reads like an error.
 *
 * @module
 */

import type { RegistryMeta } from './schema.js'

/** What has to be known about an entry to resolve the graph. */
export interface ResolvableEntry {
  /** Full identifier, in the form `category/name`. */
  readonly id: string
  /** Entries required by this one. */
  readonly registryDependencies: readonly string[]
}

/** Result of a successful resolution. */
export interface ResolvedGraph {
  /** Entries to install, dependencies first. */
  readonly order: readonly string[]
  /** Entries added that had not been asked for. */
  readonly implied: readonly string[]
}

/** What prevented the resolution. */
export type ResolutionProblem =
  | {
      readonly kind: 'missing'
      readonly id: string
      readonly requiredBy: string | null
    }
  | { readonly kind: 'cycle'; readonly path: readonly string[] }

/** Result of a resolution. */
export type ResolutionResult =
  | { readonly ok: true; readonly graph: ResolvedGraph }
  | { readonly ok: false; readonly problems: readonly ResolutionProblem[] }

/**
 * Turns a resolution problem into a readable sentence.
 *
 * @example
 * describeProblem({ kind: 'cycle', path: ['a', 'b', 'a'] })
 * // 'Dependency cycle: a → b → a'
 */
export function describeProblem(problem: ResolutionProblem): string {
  if (problem.kind === 'cycle') {
    return `Dependency cycle: ${problem.path.join(' → ')}`
  }
  return problem.requiredBy === null
    ? `Entry not found: ${problem.id}`
    : `Entry not found: ${problem.id}, required by ${problem.requiredBy}`
}

/**
 * Resolves the dependencies of a set of requested entries.
 *
 * @param requested Identifiers requested by the user.
 * @param available Every known entry, indexed by identifier.
 *
 * @example
 * const result = resolveGraph(['hero/canopy'], catalogue)
 * if (result.ok) install(result.graph.order)
 */
export function resolveGraph(
  requested: readonly string[],
  available: ReadonlyMap<string, ResolvableEntry>,
): ResolutionResult {
  const problems: ResolutionProblem[] = []
  const order: string[] = []

  /** Entries fully processed. */
  const done = new Set<string>()
  /** Entries being processed, in walk order. */
  const path: string[] = []
  const onPath = new Set<string>()

  const visit = (id: string, requiredBy: string | null): void => {
    if (done.has(id)) return

    if (onPath.has(id)) {
      // The path is kept from the first occurrence: it is what makes the error
      // usable.
      const start = path.indexOf(id)
      problems.push({ kind: 'cycle', path: [...path.slice(start), id] })
      return
    }

    const entry = available.get(id)
    if (entry === undefined) {
      problems.push({ kind: 'missing', id, requiredBy })
      return
    }

    path.push(id)
    onPath.add(id)

    for (const dependency of entry.registryDependencies) {
      visit(dependency, id)
    }

    onPath.delete(id)
    path.pop()

    done.add(id)
    // Added after its dependencies: the order is the installation order.
    order.push(id)
  }

  for (const id of requested) visit(id, null)

  if (problems.length > 0) return { ok: false, problems }

  const asked = new Set(requested)
  return {
    ok: true,
    graph: {
      order,
      implied: order.filter((id) => !asked.has(id)),
    },
  }
}

/**
 * Checks the integrity of a whole catalogue.
 *
 * Typical use: the validation of the registry before publication, where every
 * entry is resolved at once rather than one by one.
 *
 * @example
 * const problems = validateCatalogue(catalogue)
 * if (problems.length > 0) process.exit(1)
 */
export function validateCatalogue(
  available: ReadonlyMap<string, ResolvableEntry>,
): readonly ResolutionProblem[] {
  const result = resolveGraph([...available.keys()], available)
  return result.ok ? [] : result.problems
}

/**
 * Builds a catalogue from complete entries.
 *
 * @example
 * const catalogue = toCatalogue(metas)
 */
export function toCatalogue(
  entries: readonly (RegistryMeta & { id: string })[],
): Map<string, ResolvableEntry> {
  const catalogue = new Map<string, ResolvableEntry>()
  for (const entry of entries) {
    catalogue.set(entry.id, {
      id: entry.id,
      registryDependencies: entry.registryDependencies,
    })
  }
  return catalogue
}
