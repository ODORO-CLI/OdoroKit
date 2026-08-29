/**
 * Arbitrage des contextes graphiques.
 *
 * ## Pourquoi un arbitre
 *
 * Un navigateur plafonne le nombre de contextes WebGL simultanes — souvent
 * seize sur ordinateur, bien moins sur mobile. Au-dela, il ne leve aucune
 * erreur : il **perd silencieusement le plus ancien**. Une page qui ouvre une
 * surface par composant finit donc par voir son premier effet devenir un
 * rectangle noir, sans le moindre message, et generalement chez l'utilisateur
 * plutot qu'en developpement.
 *
 * L'allocation passe donc par un point unique, qui refuse plutot que de
 * laisser la page se degrader d'elle-meme. Un refus est une reponse
 * exploitable : l'appelant affiche son repli statique.
 *
 * ## Jamais de contexte partage entre backends
 *
 * Techniquement, deux bibliotheques peuvent piloter le meme contexte. En
 * pratique, chacune suppose qu'elle est seule maitresse de la machine a etats
 * — melange de fonctions, test de profondeur, tampon lie, programme actif. Les
 * defauts qui en resultent sont non deterministes et impossibles a isoler.
 * Chaque surface possede donc son propre canevas, et deux surfaces de backends
 * differents ne se rencontrent jamais.
 *
 * ## Perte de contexte
 *
 * Une mise en veille, un changement de carte graphique ou une pression memoire
 * suffisent a faire perdre un contexte. Sans traitement, le hero devient un
 * rectangle noir au reveil — un defaut qu'on ne decouvre qu'en production.
 * L'evenement est donc intercepte, l'animation suspendue, et la restauration
 * signalee a l'appelant pour qu'il reconstruise ses ressources.
 *
 * @module
 */

import { registry } from '../core/registry.js'

/** Bibliotheque pilotant une surface. */
export type SurfaceBackend = 'ogl' | 'three'

/** Motif d'un refus d'allocation. */
export type RefusalReason =
  'plafond-global' | 'plafond-backend' | 'webgl-indisponible' | 'hors-navigateur'

/** Demande d'allocation. */
export interface SurfaceRequest {
  /** Bibliotheque qui pilotera la surface. */
  backend: SurfaceBackend
  /** Nom affiche dans le panneau de diagnostic. */
  name: string
  /** Element hote, dans lequel le canevas est insere. */
  host: HTMLElement
  /**
   * Appele quand le contexte est perdu. L'appelant doit cesser tout rendu et
   * afficher son repli.
   */
  onLost?: () => void
  /**
   * Appele quand le contexte est restaure. L'appelant doit reconstruire ses
   * ressources : rien de ce qui vivait sur l'ancien contexte n'a survecu.
   */
  onRestored?: () => void
}

/** Surface allouee. */
export interface Surface {
  /** Canevas, deja insere dans l'hote. */
  readonly canvas: HTMLCanvasElement
  /** Bibliotheque qui la pilote. */
  readonly backend: SurfaceBackend
  /** Nom donne a l'allocation. */
  readonly name: string
  /** `true` tant que le contexte est utilisable. */
  readonly alive: boolean
  /** Libere la surface et retire le canevas. */
  release(): void
}

/** Ce que rend une tentative d'allocation. */
export type SurfaceResult =
  | { readonly ok: true; readonly surface: Surface }
  | { readonly ok: false; readonly reason: RefusalReason; readonly message: string }

/** Reglages de l'arbitre. */
export interface SurfaceManagerOptions {
  /** Nombre total de surfaces simultanees. @defaultValue 2 */
  max?: number
  /**
   * Nombre de surfaces simultanees par bibliotheque.
   *
   * Un seul rendu 3D par page est la regle : les effets plein ecran d'une meme
   * bibliotheque se composent dans une surface unique, en passes ou en
   * fenetres distinctes.
   *
   * @defaultValue 1
   */
  maxPerBackend?: number
}

/** Une surface vivante, cote arbitre. */
interface Entry {
  surface: Surface
  backend: SurfaceBackend
  detach: () => void
}

/** Explications lisibles des refus. */
const MESSAGES: Readonly<Record<RefusalReason, string>> = {
  'plafond-global': 'Le nombre maximum de surfaces graphiques de la page est atteint.',
  'plafond-backend':
    'Une surface de cette bibliotheque est deja ouverte. Une seule est permise par page.',
  'webgl-indisponible': "Ce navigateur n'expose aucun contexte WebGL utilisable.",
  'hors-navigateur':
    "Aucune surface graphique ne peut etre allouee hors d'un navigateur.",
}

class SurfaceManager {
  private max = 2
  private maxPerBackend = 1
  private readonly entries = new Set<Entry>()

  /** Applique des reglages. */
  public configure(options: SurfaceManagerOptions): void {
    if (options.max !== undefined) this.max = Math.max(1, options.max)
    if (options.maxPerBackend !== undefined) {
      this.maxPerBackend = Math.max(1, options.maxPerBackend)
    }
  }

  /** Nombre de surfaces vivantes, au total ou pour une bibliotheque. */
  public count(backend?: SurfaceBackend): number {
    if (backend === undefined) return this.entries.size
    let total = 0
    for (const entry of this.entries) {
      if (entry.backend === backend) total += 1
    }
    return total
  }

  /** Surfaces vivantes. */
  public list(): readonly Surface[] {
    return [...this.entries].map((entry) => entry.surface)
  }

  /** Plafond courant, expose au panneau de diagnostic. */
  public get capacity(): { max: number; maxPerBackend: number } {
    return { max: this.max, maxPerBackend: this.maxPerBackend }
  }

  /**
   * Verifie qu'un contexte WebGL peut etre obtenu.
   *
   * Le canevas d'essai est libere immediatement : le seul but est de savoir si
   * la plateforme repond, avant d'engager la construction d'une scene.
   */
  private supportsWebGl(): boolean {
    try {
      const probe = document.createElement('canvas')
      const context = probe.getContext('webgl2') ?? probe.getContext('webgl')
      // Le contexte d'essai est relache explicitement : le laisser vivre
      // consommerait un des rares emplacements que l'on cherche a preserver.
      const lose = context?.getExtension('WEBGL_lose_context') as {
        loseContext?: () => void
      } | null
      lose?.loseContext?.()
      return context !== null
    } catch {
      return false
    }
  }

  /**
   * Alloue une surface, ou explique pourquoi elle est refusee.
   *
   * @example
   * const result = surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })
   * if (!result.ok) return <Poster />
   */
  public acquire(request: SurfaceRequest): SurfaceResult {
    if (typeof document === 'undefined') {
      return {
        ok: false,
        reason: 'hors-navigateur',
        message: MESSAGES['hors-navigateur'],
      }
    }

    if (this.count(request.backend) >= this.maxPerBackend) {
      return {
        ok: false,
        reason: 'plafond-backend',
        message: MESSAGES['plafond-backend'],
      }
    }

    if (this.entries.size >= this.max) {
      return { ok: false, reason: 'plafond-global', message: MESSAGES['plafond-global'] }
    }

    if (!this.supportsWebGl()) {
      return {
        ok: false,
        reason: 'webgl-indisponible',
        message: MESSAGES['webgl-indisponible'],
      }
    }

    const canvas = document.createElement('canvas')
    canvas.dataset['odoroSurface'] = request.backend
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    request.host.appendChild(canvas)

    let alive = true

    const onLost = (event: Event): void => {
      // Sans cela, le navigateur n'emettra jamais l'evenement de restauration.
      event.preventDefault()
      alive = false
      handle.update({ etat: 'perdu' })
      request.onLost?.()
    }

    const onRestored = (): void => {
      alive = true
      handle.update({ etat: 'vivant' })
      request.onRestored?.()
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)

    const detach = (): void => {
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      canvas.remove()
    }

    const surface: Surface = {
      canvas,
      backend: request.backend,
      name: request.name,
      get alive() {
        return alive
      },
      release: () => this.release(entry),
    }

    const entry: Entry = { surface, backend: request.backend, detach }

    const handle = registry.register({
      kind: 'surface',
      name: request.name,
      dispose: () => this.release(entry),
      detail: { backend: request.backend, etat: 'vivant' },
    })

    entry.detach = () => {
      handle.release()
      detach()
    }

    this.entries.add(entry)
    return { ok: true, surface }
  }

  /** Libere une surface. */
  private release(entry: Entry): void {
    if (!this.entries.has(entry)) return
    this.entries.delete(entry)
    entry.detach()
  }

  /**
   * Libere toutes les surfaces.
   *
   * @returns Le nombre de surfaces liberees.
   */
  public releaseAll(): number {
    const total = this.entries.size
    for (const entry of [...this.entries]) this.release(entry)
    return total
  }

  /**
   * Remet l'arbitre a son etat initial. Reserve aux tests.
   *
   * @internal
   */
  public reset(): void {
    this.releaseAll()
    this.max = 2
    this.maxPerBackend = 1
  }
}

/**
 * Arbitre de la page.
 *
 * @example
 * import { surfaceManager } from '@odoro-cli/engine'
 *
 * const result = surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })
 * if (result.ok) renderer.canvas = result.surface.canvas
 */
export const surfaceManager = new SurfaceManager()

/** Type de l'arbitre, pour les signatures qui le recoivent. */
export type SurfaceManagerInstance = SurfaceManager
