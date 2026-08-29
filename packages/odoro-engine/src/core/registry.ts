/**
 * Inventaire des ressources vivantes.
 *
 * Chaque timeline, chaque declencheur de defilement et chaque surface WebGL
 * s'y enregistre a sa creation et s'en retire a sa liberation. L'interet n'est
 * pas comptable : c'est ce qui rend une fuite **visible**.
 *
 * Une scene 3D ne libere rien automatiquement — ni ses geometries, ni ses
 * materiaux, ni ses textures, ni ses cibles de rendu. Le symptome d'un oubli
 * n'est pas une erreur mais une lente degradation, invisible en developpement
 * et fatale apres dix navigations. Un inventaire qui ne revient pas a zero
 * apres demontage transforme cette degradation en assertion de test.
 *
 * @module
 */

/** Nature d'une ressource suivie. */
export type ResourceKind = 'timeline' | 'scroll-trigger' | 'surface' | 'subscription'

/** Une ressource enregistree. */
export interface Resource {
  /** Identifiant attribue a l'enregistrement. */
  readonly id: string
  /** Nature de la ressource. */
  readonly kind: ResourceKind
  /** Nom lisible, affiche dans le panneau de diagnostic. */
  readonly name: string
  /** Horodatage de l'enregistrement. */
  readonly since: number
  /** Informations libres, affichees telles quelles au diagnostic. */
  readonly detail?: Readonly<Record<string, string | number | boolean>>
}

/** Ce qu'il faut pour enregistrer une ressource. */
export interface ResourceInput {
  /** Nature de la ressource. */
  kind: ResourceKind
  /** Nom lisible. */
  name: string
  /** Liberation de la ressource. Appelee par `disposeAll`. */
  dispose: () => void
  /** Informations libres. */
  detail?: Record<string, string | number | boolean>
}

/** Poignee rendue a l'enregistrement. */
export interface ResourceHandle {
  /** Identifiant attribue. */
  readonly id: string
  /** Retire la ressource de l'inventaire, **sans** la liberer. */
  release(): void
  /** Met a jour les informations affichees au diagnostic. */
  update(detail: Record<string, string | number | boolean>): void
}

interface Entry extends Resource {
  dispose: () => void
  detail: Record<string, string | number | boolean>
}

let counter = 0

class ResourceRegistry {
  private readonly entries = new Map<string, Entry>()

  /** Nombre de ressources vivantes, toutes natures confondues ou par nature. */
  public count(kind?: ResourceKind): number {
    if (kind === undefined) return this.entries.size
    let total = 0
    for (const entry of this.entries.values()) {
      if (entry.kind === kind) total += 1
    }
    return total
  }

  /** Ressources vivantes, de la plus ancienne a la plus recente. */
  public list(kind?: ResourceKind): readonly Resource[] {
    const all = [...this.entries.values()]
    const filtered = kind === undefined ? all : all.filter((entry) => entry.kind === kind)
    return filtered
      .sort((a, b) => a.since - b.since)
      .map(({ id, kind: entryKind, name, since, detail }) => ({
        id,
        kind: entryKind,
        name,
        since,
        detail,
      }))
  }

  /**
   * Enregistre une ressource.
   *
   * @example
   * const handle = registry.register({
   *   kind: 'surface',
   *   name: 'aurora',
   *   dispose: () => renderer.dispose(),
   *   detail: { backend: 'ogl' },
   * })
   */
  public register(input: ResourceInput): ResourceHandle {
    counter += 1
    const id = `${input.kind}-${counter}`

    this.entries.set(id, {
      id,
      kind: input.kind,
      name: input.name,
      since: Date.now(),
      dispose: input.dispose,
      detail: input.detail ?? {},
    })

    return {
      id,
      release: () => {
        this.entries.delete(id)
      },
      update: (detail) => {
        const entry = this.entries.get(id)
        if (entry === undefined) return
        Object.assign(entry.detail, detail)
      },
    }
  }

  /**
   * Libere toutes les ressources d'une nature, ou toutes.
   *
   * Utilise au changement de page et a la fermeture. Une liberation qui echoue
   * n'interrompt pas les suivantes : le but est de tout relacher, pas de
   * s'arreter au premier probleme.
   */
  public disposeAll(kind?: ResourceKind): number {
    let released = 0

    for (const entry of [...this.entries.values()]) {
      if (kind !== undefined && entry.kind !== kind) continue
      try {
        entry.dispose()
      } catch (cause) {
        console.error(`[odoro] echec de liberation de "${entry.name}"`, cause)
      }
      this.entries.delete(entry.id)
      released += 1
    }

    return released
  }
}

/**
 * Inventaire de la page.
 *
 * @example
 * import { registry } from '@odoro-cli/engine'
 *
 * // Dans un test de fuite :
 * expect(registry.count('surface')).toBe(0)
 */
export const registry = new ResourceRegistry()

/** Type de l'inventaire, pour les signatures qui le recoivent. */
export type ResourceRegistryInstance = ResourceRegistry
