/**
 * Boucle de rendu unique.
 *
 * ## Le point d'architecture le plus important du moteur
 *
 * Il n'existe **qu'une seule** boucle de rendu dans une page Odoro. Aucune
 * scene, aucune surface, aucun effet n'ouvre son propre
 * `requestAnimationFrame` : tous s'abonnent ici.
 *
 * Ce n'est pas une preference de style. Deux boucles concurrentes rendent dans
 * un ordre non deterministe : le DOM peut etre mis a jour apres le rendu WebGL
 * d'une meme image, produisant un decalage d'une frame entre un element anime
 * et le fond qui devrait le suivre. Le symptome est un tremblement irregulier,
 * qui ne se reproduit pas a la demande et resiste au profilage. Avec une
 * boucle unique et un ordre explicite, le probleme ne peut pas exister.
 *
 * ## Deux deltas, et pourquoi
 *
 * La boucle sous-jacente ecrete les deltas anormaux : apres un blocage de 800
 * millisecondes, elle annonce 33 millisecondes. C'est le bon comportement pour
 * une animation — sans quoi elle sauterait brutalement a la reprise — mais
 * c'est un mensonge pour une simulation qui integre le temps ecoule : un
 * champ de particules dériverait silencieusement.
 *
 * `delta` est donc la valeur lissee, `deltaRaw` la valeur reelle, mesuree ici
 * meme. Les animations utilisent la premiere, les simulations la seconde.
 *
 * ## Pause
 *
 * `pause()` suspend la distribution aux abonnes de cette horloge, **sans**
 * toucher a la boucle sous-jacente : la mettre en sommeil figerait aussi les
 * animations d'interface sans rapport. La suspension d'un effet particulier —
 * hors ecran, onglet masque — passe par `setActive` sur son abonnement.
 *
 * @module
 */

import gsap from 'gsap'

/**
 * Priorites d'execution dans la frame.
 *
 * Plus la valeur est **haute**, plus tot l'abonne s'execute. Le rendu graphique
 * porte donc une priorite basse : il doit voir l'etat final de la frame, apres
 * que toutes les mises a jour l'ont produit.
 */
export const CLOCK_PRIORITY = {
  /** Lecture des entrees — pointeur, defilement. */
  input: 200,
  /** Mesures et mises a jour de mise en page. */
  layout: 100,
  /** Valeur par defaut. */
  default: 0,
  /** Rendu graphique, en fin de frame. */
  render: -100,
} as const

/** Etat d'une image, transmis a chaque abonne. */
export interface FrameInfo {
  /** Temps ecoule depuis le demarrage de la boucle, en secondes. */
  readonly time: number
  /**
   * Duree de l'image precedente, en secondes, **lissee**. A utiliser pour
   * animer : elle ne saute pas apres un blocage.
   */
  readonly delta: number
  /**
   * Duree reelle de l'image precedente, en secondes. A utiliser pour toute
   * simulation qui integre le temps.
   */
  readonly deltaRaw: number
  /** Numero d'image depuis le demarrage. */
  readonly frame: number
}

/** Fonction appelee a chaque image. */
export type ClockCallback = (frame: FrameInfo) => void

/** Options d'un abonnement. */
export interface SubscribeOptions {
  /**
   * Position dans la frame. Voir {@link CLOCK_PRIORITY}.
   *
   * @defaultValue 0
   */
  priority?: number
  /** Nom affiche dans le panneau de diagnostic. */
  name?: string
}

/** Abonnement a la boucle. */
export interface ClockSubscription {
  /** Retire l'abonnement. */
  unsubscribe(): void
  /**
   * Suspend ou reprend cet abonne, sans le retirer. C'est le mecanisme a
   * employer pour un effet hors ecran : il conserve son ordre et son etat.
   */
  setActive(active: boolean): void
  /** `true` si l'abonne recoit les images. */
  readonly active: boolean
  /** Nom donne a l'abonnement. */
  readonly name: string
}

/** Un abonne enregistre. */
interface Entry {
  callback: ClockCallback
  priority: number
  name: string
  active: boolean
}

/** Nombre d'images retenues pour la moyenne glissante. */
const FPS_WINDOW = 30

/** Horloge de la page : une instance, et une seule. */
class Clock {
  private readonly entries: Entry[] = []
  private attached = false
  private paused = false
  private started = 0
  private lastRaw = 0
  private readonly durations: number[] = []

  /** Numero de la derniere image distribuee. */
  public frame = 0

  /** Temps ecoule depuis le demarrage, en secondes. */
  public time = 0

  /** Horodatage courant, isole pour les tests. */
  private now(): number {
    return typeof performance === 'undefined' ? Date.now() : performance.now()
  }

  /**
   * Images par seconde, moyennees sur les trente dernieres images.
   *
   * Retourne 0 tant qu'aucune image n'a ete distribuee.
   */
  public get fps(): number {
    if (this.durations.length === 0) return 0
    const total = this.durations.reduce((sum, value) => sum + value, 0)
    return total === 0 ? 0 : Math.round((this.durations.length * 1000) / total)
  }

  /** `true` si la distribution est suspendue. */
  public get isPaused(): boolean {
    return this.paused
  }

  /** Nombre d'abonnes, actifs ou non. */
  public get size(): number {
    return this.entries.length
  }

  /** Abonnes, du plus prioritaire au moins prioritaire. */
  public inspect(): readonly { name: string; priority: number; active: boolean }[] {
    return this.entries.map((entry) => ({
      name: entry.name,
      priority: entry.priority,
      active: entry.active,
    }))
  }

  /** Distribue une image a tous les abonnes actifs. */
  private readonly tick = (time: number, deltaMs: number, frame: number): void => {
    const raw = this.now()
    const deltaRaw = this.lastRaw === 0 ? deltaMs : raw - this.lastRaw
    this.lastRaw = raw

    this.durations.push(deltaRaw)
    if (this.durations.length > FPS_WINDOW) this.durations.shift()

    this.frame = frame
    this.time = time - this.started

    if (this.paused) return

    const info: FrameInfo = {
      time: this.time,
      delta: deltaMs / 1000,
      deltaRaw: deltaRaw / 1000,
      frame,
    }

    // Une copie protege la boucle d'un abonne qui se desabonnerait pendant sa
    // propre execution — cas courant d'une animation qui se termine.
    for (const entry of [...this.entries]) {
      if (!entry.active) continue
      try {
        entry.callback(info)
      } catch (cause) {
        // Un abonne fautif ne doit pas interrompre la frame des autres.
        console.error(`[odoro] echec de l'abonne "${entry.name}"`, cause)
      }
    }
  }

  /** Branche la boucle sous-jacente, une seule fois. */
  private attach(): void {
    if (this.attached || typeof window === 'undefined') return
    this.attached = true
    this.started = gsap.ticker.time
    this.lastRaw = 0
    gsap.ticker.add(this.tick)
  }

  /** Debranche la boucle quand plus personne n'ecoute. */
  private detach(): void {
    if (!this.attached) return
    this.attached = false
    gsap.ticker.remove(this.tick)
    this.durations.length = 0
  }

  /**
   * Abonne une fonction a la boucle.
   *
   * @example
   * const subscription = clock.subscribe(
   *   ({ deltaRaw }) => simulation.step(deltaRaw),
   *   { priority: CLOCK_PRIORITY.render, name: 'aurora' },
   * )
   */
  public subscribe(
    callback: ClockCallback,
    options: SubscribeOptions = {},
  ): ClockSubscription {
    const entry: Entry = {
      callback,
      priority: options.priority ?? CLOCK_PRIORITY.default,
      name: options.name ?? 'anonyme',
      active: true,
    }

    this.entries.push(entry)
    // Tri decroissant : la priorite haute passe en premier, le rendu en dernier.
    this.entries.sort((a, b) => b.priority - a.priority)
    this.attach()

    return {
      get active() {
        return entry.active
      },
      get name() {
        return entry.name
      },
      setActive: (active: boolean) => {
        entry.active = active
      },
      unsubscribe: () => {
        const index = this.entries.indexOf(entry)
        if (index >= 0) this.entries.splice(index, 1)
        if (this.entries.length === 0) this.detach()
      },
    }
  }

  /**
   * Suspend la distribution.
   *
   * La boucle sous-jacente continue de tourner : les animations d'interface
   * qui n'appartiennent pas a cette horloge ne sont pas affectees.
   */
  public pause(): void {
    this.paused = true
  }

  /** Reprend la distribution. */
  public resume(): void {
    this.paused = false
    // Le delta suivant serait sinon egal a toute la duree de la pause.
    this.lastRaw = 0
  }

  /**
   * Retire tous les abonnes et endort la boucle sous-jacente.
   *
   * Reserve aux tests et a la fermeture d'une page : sans cela, la boucle
   * maintient le processus en vie indefiniment.
   */
  public dispose(): void {
    this.entries.length = 0
    this.detach()
    this.paused = false
    this.frame = 0
    this.time = 0
    if (typeof window !== 'undefined') gsap.ticker.sleep()
  }
}

/**
 * Horloge de la page.
 *
 * C'est deliberement un singleton de module : l'unicite de la boucle est la
 * garantie que ce module apporte, et deux instances la reduiraient a neant.
 *
 * @example
 * import { clock, CLOCK_PRIORITY } from 'odoro-engine'
 *
 * const subscription = clock.subscribe(({ time }) => {
 *   mesh.rotation.y = time * 0.2
 * }, { priority: CLOCK_PRIORITY.render, name: 'molten' })
 */
export const clock = new Clock()

/** Type de l'horloge, pour les signatures qui la recoivent en parametre. */
export type ClockInstance = Clock
