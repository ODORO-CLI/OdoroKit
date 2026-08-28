/**
 * Politique de mouvement.
 *
 * Un module unique decide si une animation joue, a quelle intensite et a quel
 * niveau de qualite. Il agrege la preference systeme, le reglage explicite de
 * l'application, la visibilite de l'onglet, la charge mesuree, et — quand le
 * navigateur les expose — le niveau de batterie et le type de connexion.
 *
 * ## Pourquoi ici et pas dans chaque composant
 *
 * Parce que c'est le genre de regle qu'on applique consciencieusement aux dix
 * premiers composants et qu'on oublie au quarantieme. Centralisee, elle ne
 * peut pas etre oubliee : un composant qui interroge la politique la respecte
 * par construction.
 *
 * ## La regle qui compte
 *
 * Quand le mouvement est desactive, **l'etat final est applique**, jamais
 * l'etat initial. Un texte qui devait apparaitre apparait, sans transition.
 * Aucun contenu ne disparait parce que l'utilisateur a demande moins
 * d'animations — c'est le defaut d'accessibilite le plus courant des
 * bibliotheques d'animation, et il est ici structurellement impossible.
 *
 * @module
 */

import { clock } from './clock.js'

/** Reglage de qualite demande par l'application. */
export type QualitySetting = 'low' | 'auto' | 'high'

/** Qualite effectivement retenue. */
export type QualityLevel = 'low' | 'medium' | 'high'

/** Conduite a tenir face a la preference systeme. */
export type ReducedMotionSetting = 'respect' | 'force' | 'ignore'

/** Etat courant de la politique. */
export interface MotionState {
  /** `true` si les animations doivent etre neutralisees. */
  readonly reduced: boolean
  /** Qualite retenue pour les rendus couteux. */
  readonly quality: QualityLevel
  /** `true` si l'onglet est visible. */
  readonly visible: boolean
  /**
   * Images par seconde relevees au dernier changement d'etat. Pour une lecture
   * instantanee, interroger `clock.fps` : cette valeur-ci ne bouge pas a
   * chaque image, precisement pour ne pas provoquer un rendu par seconde.
   */
  readonly fps: number
  /** Motif de la qualite courante, pour le diagnostic. */
  readonly reason: string
}

/** Reglages acceptes par la politique. */
export interface MotionPolicyOptions {
  /** Qualite demandee. @defaultValue 'auto' */
  quality?: QualitySetting
  /** Conduite face a `prefers-reduced-motion`. @defaultValue 'respect' */
  reducedMotion?: ReducedMotionSetting
}

/** Seuils de rétrogradation et de remontee, en images par seconde. */
const DEGRADE_BELOW = 45
const UPGRADE_ABOVE = 55

/**
 * Duree pendant laquelle la mesure doit rester du meme cote du seuil.
 *
 * La remontee est bien plus lente que la retrogradation : mieux vaut rester
 * une seconde de trop en qualite basse que d'osciller entre deux niveaux, ce
 * qui se voit immediatement a l'ecran.
 */
const DEGRADE_AFTER_MS = 1000
const UPGRADE_AFTER_MS = 4000

/** Sous-ensemble de l'API reseau, absente de la plateforme type. */
interface NetworkInformation {
  saveData?: boolean
  effectiveType?: string
}

/** Sous-ensemble de l'API batterie. */
interface BatteryStatus {
  charging: boolean
  level: number
  addEventListener?: (type: string, listener: () => void) => void
}

class MotionPolicy {
  private quality: QualitySetting = 'auto'
  private reducedMotion: ReducedMotionSetting = 'respect'

  private systemReduced = false
  private visible = true
  private resolved: QualityLevel = 'high'
  private reason = 'reglage initial'
  private lowPower = false

  private since = 0
  private pending: QualityLevel | undefined
  /**
   * Instantane conserve. `useSyncExternalStore` compare les instantanes par
   * identite : en reconstruire un a chaque lecture provoquerait une boucle de
   * rendu sans fin.
   */
  private snapshot: MotionState = {
    reduced: false,
    quality: 'high',
    visible: true,
    fps: 0,
    reason: 'reglage initial',
  }
  private readonly listeners = new Set<(state: MotionState) => void>()
  private installed = false
  private teardown: (() => void)[] = []

  /**
   * Etat courant.
   *
   * La reference ne change qu'a un changement reel : c'est ce qui rend cet
   * etat consommable par `useSyncExternalStore`.
   */
  public get state(): MotionState {
    return this.snapshot
  }

  /** Recalcule l'instantane, et signale s'il a change. */
  private refresh(): boolean {
    const next: MotionState = {
      reduced: this.isReduced(),
      quality: this.isReduced() ? 'low' : this.resolved,
      visible: this.visible,
      fps: clock.fps,
      reason: this.reason,
    }

    const previous = this.snapshot
    if (
      previous.reduced === next.reduced &&
      previous.quality === next.quality &&
      previous.visible === next.visible &&
      previous.reason === next.reason
    ) {
      return false
    }

    this.snapshot = next
    return true
  }

  /** Determine si les animations doivent etre neutralisees. */
  private isReduced(): boolean {
    if (this.reducedMotion === 'force') return true
    if (this.reducedMotion === 'ignore') return false
    return this.systemReduced
  }

  /** Applique des reglages, et reevalue immediatement. */
  public configure(options: MotionPolicyOptions): void {
    if (options.quality !== undefined) this.quality = options.quality
    if (options.reducedMotion !== undefined) this.reducedMotion = options.reducedMotion

    if (this.quality === 'low') {
      this.resolved = 'low'
      this.reason = 'qualite imposee'
    } else if (this.quality === 'high') {
      this.resolved = 'high'
      this.reason = 'qualite imposee'
    }

    this.install()
    this.emit()
  }

  /** Abonne un ecouteur aux changements d'etat. */
  public subscribe(listener: (state: MotionState) => void): () => void {
    this.listeners.add(listener)
    this.install()
    return () => this.listeners.delete(listener)
  }

  private emit(): void {
    if (!this.refresh()) return
    for (const listener of this.listeners) listener(this.snapshot)
  }

  /** Installe les observateurs de plateforme, une seule fois. */
  private install(): void {
    if (this.installed || typeof window === 'undefined') return
    this.installed = true

    if (typeof window.matchMedia === 'function') {
      const query = window.matchMedia('(prefers-reduced-motion: reduce)')
      this.systemReduced = query.matches
      const onChange = (): void => {
        this.systemReduced = query.matches
        this.emit()
      }
      query.addEventListener('change', onChange)
      this.teardown.push(() => query.removeEventListener('change', onChange))
    }

    if (typeof document !== 'undefined') {
      this.visible = document.visibilityState !== 'hidden'
      const onVisibility = (): void => {
        this.visible = document.visibilityState !== 'hidden'
        this.emit()
      }
      document.addEventListener('visibilitychange', onVisibility)
      this.teardown.push(() =>
        document.removeEventListener('visibilitychange', onVisibility),
      )
    }

    this.readLowPower()
    this.watchLoad()
  }

  /**
   * Lit les indices d'appareil contraint.
   *
   * Ces API ne sont pas universelles : leur absence n'est pas une erreur, elle
   * signifie simplement qu'aucune contrainte n'est connue.
   */
  private readLowPower(): void {
    const connection = (navigator as Navigator & { connection?: NetworkInformation })
      .connection
    if (connection?.saveData === true) {
      this.lowPower = true
      this.reason = 'economie de donnees demandee'
    }

    const getBattery = (
      navigator as Navigator & { getBattery?: () => Promise<BatteryStatus> }
    ).getBattery
    if (typeof getBattery !== 'function') return

    void getBattery
      .call(navigator)
      .then((battery) => {
        const apply = (): void => {
          const constrained = !battery.charging && battery.level < 0.2
          if (constrained !== this.lowPower) {
            this.lowPower = constrained
            if (constrained) this.reason = 'batterie faible'
            this.emit()
          }
        }
        apply()
        battery.addEventListener?.('levelchange', apply)
        battery.addEventListener?.('chargingchange', apply)
      })
      .catch(() => undefined)
  }

  /**
   * Surveille la charge et ajuste la qualite quand le reglage est automatique.
   *
   * La mesure est relevee une fois par seconde, pas a chaque image : reagir a
   * une seule image lente produirait un clignotement de qualite.
   */
  private watchLoad(): void {
    const timer = setInterval(() => {
      if (this.quality !== 'auto' || !this.visible) return

      const fps = clock.fps
      if (fps === 0) return

      const target: QualityLevel | undefined = this.lowPower
        ? 'low'
        : fps < DEGRADE_BELOW
          ? this.step(this.resolved, -1)
          : fps > UPGRADE_ABOVE
            ? this.step(this.resolved, 1)
            : undefined

      if (target === undefined || target === this.resolved) {
        this.pending = undefined
        return
      }

      const now = Date.now()
      if (this.pending !== target) {
        this.pending = target
        this.since = now
        return
      }

      const downgrade = this.rank(target) < this.rank(this.resolved)
      const required = downgrade ? DEGRADE_AFTER_MS : UPGRADE_AFTER_MS
      if (now - this.since < required) return

      this.resolved = target
      this.reason = this.lowPower
        ? 'appareil contraint'
        : `${fps} images par seconde mesurees`
      this.pending = undefined
      this.emit()
    }, 1000)

    this.teardown.push(() => clearInterval(timer))
  }

  private rank(level: QualityLevel): number {
    return level === 'low' ? 0 : level === 'medium' ? 1 : 2
  }

  private step(from: QualityLevel, direction: 1 | -1): QualityLevel {
    const levels: QualityLevel[] = ['low', 'medium', 'high']
    const index = Math.min(2, Math.max(0, this.rank(from) + direction))
    return levels[index] ?? from
  }

  /**
   * Retire les observateurs. Reserve aux tests et a la fermeture d'une page.
   */
  public dispose(): void {
    for (const stop of this.teardown) stop()
    this.teardown = []
    this.listeners.clear()
    this.installed = false
    this.quality = 'auto'
    this.reducedMotion = 'respect'
    this.resolved = 'high'
    this.reason = 'reglage initial'
    this.lowPower = false
    this.pending = undefined
    this.systemReduced = false
    this.visible = true
    this.snapshot = {
      reduced: false,
      quality: 'high',
      visible: true,
      fps: 0,
      reason: 'reglage initial',
    }
  }
}

/**
 * Politique de la page.
 *
 * @example
 * import { motionPolicy } from 'odoro-engine'
 *
 * if (motionPolicy.state.reduced) {
 *   element.style.opacity = '1' // etat final, immediatement
 * }
 */
export const motionPolicy = new MotionPolicy()

/** Type de la politique, pour les signatures qui la recoivent. */
export type MotionPolicyInstance = MotionPolicy
