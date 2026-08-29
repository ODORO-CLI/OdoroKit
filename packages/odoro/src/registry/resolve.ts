/**
 * Resolution du graphe de dependances du registre.
 *
 * Une entree peut en reclamer d'autres — un hook partage, un utilitaire. Il
 * faut donc, avant d'ecrire quoi que ce soit chez l'utilisateur, savoir
 * exactement quelles entrees installer et dans quel ordre.
 *
 * ## Les cycles
 *
 * Rien n'interdit structurellement a deux entrees de se reclamer l'une
 * l'autre, et un parcours naif s'y perdrait indefiniment. Le cycle est donc
 * detecte, et **signale avec le chemin qui le compose** : une erreur qui dit
 * seulement « cycle detecte » oblige a le chercher a la main.
 *
 * ## L'ordre
 *
 * Les dependances sont installees avant ce qui les reclame. Cela n'a pas
 * d'importance pour l'ecriture de fichiers, qui est independante, mais cela en
 * a pour ce que l'utilisateur voit defiler : une liste ou les dependances
 * apparaissent apres leur consommateur se lit comme une erreur.
 *
 * @module
 */

import type { RegistryMeta } from './schema.js'

/** Ce qu'il faut savoir d'une entree pour resoudre le graphe. */
export interface ResolvableEntry {
  /** Identifiant complet, sous la forme `categorie/nom`. */
  readonly id: string
  /** Entrees reclamees par celle-ci. */
  readonly registryDependencies: readonly string[]
}

/** Resultat d'une resolution reussie. */
export interface ResolvedGraph {
  /** Entrees a installer, dependances d'abord. */
  readonly order: readonly string[]
  /** Entrees ajoutees qui n'avaient pas ete demandees. */
  readonly implied: readonly string[]
}

/** Ce qui a empeche la resolution. */
export type ResolutionProblem =
  | {
      readonly kind: 'introuvable'
      readonly id: string
      readonly requiredBy: string | null
    }
  | { readonly kind: 'cycle'; readonly path: readonly string[] }

/** Resultat d'une resolution. */
export type ResolutionResult =
  | { readonly ok: true; readonly graph: ResolvedGraph }
  | { readonly ok: false; readonly problems: readonly ResolutionProblem[] }

/**
 * Met un probleme de resolution en phrase lisible.
 *
 * @example
 * describeProblem({ kind: 'cycle', path: ['a', 'b', 'a'] })
 * // 'Cycle de dependances : a → b → a'
 */
export function describeProblem(problem: ResolutionProblem): string {
  if (problem.kind === 'cycle') {
    return `Cycle de dependances : ${problem.path.join(' → ')}`
  }
  return problem.requiredBy === null
    ? `Entree introuvable : ${problem.id}`
    : `Entree introuvable : ${problem.id}, reclamee par ${problem.requiredBy}`
}

/**
 * Resout les dependances d'un ensemble d'entrees demandees.
 *
 * @param requested Identifiants demandes par l'utilisateur.
 * @param available Toutes les entrees connues, indexees par identifiant.
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

  /** Entrees entierement traitees. */
  const done = new Set<string>()
  /** Entrees en cours de traitement, dans l'ordre du parcours. */
  const path: string[] = []
  const onPath = new Set<string>()

  const visit = (id: string, requiredBy: string | null): void => {
    if (done.has(id)) return

    if (onPath.has(id)) {
      // Le chemin est conserve depuis la premiere occurrence : c'est lui qui
      // rend l'erreur exploitable.
      const start = path.indexOf(id)
      problems.push({ kind: 'cycle', path: [...path.slice(start), id] })
      return
    }

    const entry = available.get(id)
    if (entry === undefined) {
      problems.push({ kind: 'introuvable', id, requiredBy })
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
    // Ajoute apres ses dependances : l'ordre est celui de l'installation.
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
 * Verifie l'integrite d'un catalogue entier.
 *
 * Emploi typique : la validation du registre avant publication, ou toutes les
 * entrees sont resolues d'un coup plutot qu'une par une.
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
 * Construit un catalogue a partir d'entrees completes.
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
