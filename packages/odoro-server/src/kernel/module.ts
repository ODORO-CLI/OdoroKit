/**
 * Le contrat de module.
 *
 * ## Ce qu'un module est, et ce qu'il n'est pas
 *
 * Un module est une **déclaration** : un nom, ce dont il a besoin, ce qu'il
 * enregistre, ce qu'il expose. Il ne s'installe pas lui-même, il ne connaît
 * pas l'application, et il ne touche jamais à Express. C'est le noyau qui le
 * monte.
 *
 * La conséquence pratique : activer ou désactiver un module tient en une ligne
 * dans `main.ts`, et rien d'autre ne bouge. Un module qui s'installerait
 * lui-même laisserait des traces derrière lui — une route posée, un écouteur
 * abonné — et « désactiver » deviendrait un travail d'archéologie.
 *
 * ## L'ordre de chargement
 *
 * `requires` déclare les modules dont celui-ci a besoin. Le noyau en tire un
 * ordre topologique, détecte les cycles, et refuse de démarrer si une
 * dépendance manque.
 *
 * Ce refus est au démarrage, pas à la première requête. Un module `account`
 * qui suppose `auth` monté, sur un serveur où `auth` a été retiré, doit
 * échouer à l'instant où quelqu'un le déploie — et non le lendemain, sur la
 * route que personne n'appelle en recette.
 *
 * @module
 */

import type { Container } from './container.js'
import type { RouteDefinition } from './http/route.js'

/** Ce qu'un module déclare. */
export interface ModuleDefinition<Services = Record<never, never>> {
  /** Nom, unique, employé par `requires` et par la CLI. */
  readonly name: string

  /**
   * Modules requis, par nom.
   *
   * Une dépendance manquante ou un cycle font échouer le démarrage.
   */
  readonly requires?: readonly string[]

  /**
   * Enregistre les services du module dans le conteneur.
   *
   * Appelé dans l'ordre topologique : les services des modules requis sont
   * déjà enregistrés quand celui-ci s'exécute.
   */
  readonly register?: (container: Container<Services>) => void

  /** Routes exposées. */
  readonly routes?: readonly RouteDefinition[]

  /**
   * Capacités de base exigées.
   *
   * Un module qui s'appuie sur `jsonb` ou sur la recherche plein texte le
   * déclare ici. Le noyau compare aux capacités du dialecte courant et refuse
   * de démarrer si l'une manque — plutôt que de laisser le module échouer à
   * l'usage, sur une requête rare, avec une erreur de pilote.
   */
  readonly requiresCapabilities?: readonly string[]
}

/**
 * Déclare un module.
 *
 * La fonction ne fait que typer : elle n'existe que pour l'inférence, et pour
 * que la déclaration se lise comme une déclaration.
 *
 * @example
 * export const accountModule = defineModule({
 *   name: 'account',
 *   requires: ['auth'],
 *   register: (c) => c.register('accountService', createAccountService),
 *   routes: accountRoutes,
 * })
 */
export function defineModule<Services = Record<never, never>>(
  definition: ModuleDefinition<Services>,
): ModuleDefinition<Services> {
  return definition
}

/** Levée quand l'ensemble des modules ne peut pas être monté. */
export class ModuleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ModuleError'
  }
}

/**
 * Ordonne les modules selon leurs dépendances.
 *
 * ## Le parcours
 *
 * Un tri topologique par parcours en profondeur, avec trois états par nœud :
 * jamais vu, en cours de visite, terminé. Le second est ce qui distingue un
 * cycle d'un simple losange — un module atteint deux fois par des chemins
 * différents est normal, un module atteint pendant sa propre visite est un
 * cycle.
 *
 * L'ordre alphabétique est appliqué aux frères, pour que deux démarrages du
 * même ensemble produisent la même séquence. Un ordre qui varie rend
 * irreproductible tout défaut qui en dépend.
 *
 * @throws {ModuleError} Sur un nom manquant, un doublon ou un cycle.
 */
export function orderModules(
  modules: readonly ModuleDefinition<never>[],
): readonly ModuleDefinition<never>[] {
  const byName = new Map<string, ModuleDefinition<never>>()

  for (const module of modules) {
    if (byName.has(module.name)) {
      throw new ModuleError(`Deux modules portent le nom "${module.name}".`)
    }
    byName.set(module.name, module)
  }

  const ordered: ModuleDefinition<never>[] = []
  const done = new Set<string>()
  const visiting: string[] = []

  const visit = (name: string, requiredBy: string | undefined): void => {
    if (done.has(name)) return

    const cycleAt = visiting.indexOf(name)
    if (cycleAt !== -1) {
      throw new ModuleError(
        `Cycle entre modules : ${[...visiting.slice(cycleAt), name].join(' -> ')}.`,
      )
    }

    const module = byName.get(name)
    if (module === undefined) {
      throw new ModuleError(
        requiredBy === undefined
          ? `Module inconnu : "${name}".`
          : `Le module "${requiredBy}" requiert "${name}", qui n'est pas active. ` +
              `Modules actives : ${[...byName.keys()].sort().join(', ')}.`,
      )
    }

    visiting.push(name)
    // Les freres sont visites dans l'ordre alphabetique : deux demarrages du
    // meme ensemble doivent produire la meme sequence.
    for (const dependency of [...(module.requires ?? [])].sort()) {
      visit(dependency, name)
    }
    visiting.pop()

    done.add(name)
    ordered.push(module)
  }

  for (const module of modules) visit(module.name, undefined)

  return ordered
}

/**
 * Vérifie que les capacités exigées sont disponibles.
 *
 * @throws {ModuleError} En nommant le module, la capacité et le dialecte —
 *   les trois sont nécessaires pour savoir quoi faire du message.
 */
export function assertCapabilities(
  modules: readonly ModuleDefinition<never>[],
  available: Readonly<Record<string, boolean>>,
  dialect: string,
): void {
  const problems: string[] = []

  for (const module of modules) {
    for (const capability of module.requiresCapabilities ?? []) {
      if (available[capability] !== true) {
        problems.push(
          `  "${module.name}" exige la capacite "${capability}", absente de ${dialect}`,
        )
      }
    }
  }

  if (problems.length > 0) {
    throw new ModuleError(
      [
        `Modules incompatibles avec le moteur de base de donnees :`,
        '',
        ...problems,
        '',
        `Desactivez ces modules, ou employez un moteur qui offre ces capacites.`,
      ].join('\n'),
    )
  }
}
