/**
 * Motion policy.
 *
 * A single module decides whether an animation plays, at what intensity and at
 * what quality level. It aggregates the system preference, the explicit
 * setting of the application, the visibility of the tab, the measured load,
 * and — when the browser exposes them — the battery level and the connection
 * type. It also follows the theme of the document, because a background that
 * reads its colours from the tokens must read them again when the page
 * switches.
 *
 * ## Why here and not in every component
 *
 * Because this is the kind of rule you apply conscientiously to the first ten
 * components and forget at the fortieth. Centralised, it cannot be forgotten:
 * a component that queries the policy respects it by construction.
 *
 * ## The rule that matters
 *
 * When motion is disabled, **the final state is applied**, never the initial
 * state. A text that was to appear appears, without a transition. No content
 * disappears because the user asked for fewer animations — this is the most
 * common accessibility flaw of animation libraries, and here it is
 * structurally impossible.
 *
 * @module
 */

import { clock } from './clock.js'

/** Quality setting requested by the application. */
export type QualitySetting = 'low' | 'auto' | 'high'

/** Quality actually selected. */
export type QualityLevel = 'low' | 'medium' | 'high'

/** Behaviour to adopt towards the system preference. */
export type ReducedMotionSetting = 'respect' | 'force' | 'ignore'

/** Effective theme of the document. */
export type ThemeLevel = 'light' | 'dark'

/** Current state of the policy. */
export interface MotionState {
  /** `true` if animations must be neutralised. */
  readonly reduced: boolean
  /** Quality selected for expensive renders. */
  readonly quality: QualityLevel
  /** `true` if the tab is visible. */
  readonly visible: boolean
  /**
   * Effective theme of the document: `data-theme` on the root when it is set,
   * the system preference otherwise. A component that reads its colours from
   * the tokens uses it to read them again on the toggle.
   */
  readonly theme: ThemeLevel
  /**
   * Frames per second recorded at the last state change. For an instantaneous
   * reading, query `clock.fps`: this value does not move on every frame,
   * precisely so as not to cause one render per second.
   */
  readonly fps: number
  /** Reason for the current quality, for diagnostics. */
  readonly reason: string
}

/** Settings accepted by the policy. */
export interface MotionPolicyOptions {
  /** Requested quality. @defaultValue 'auto' */
  quality?: QualitySetting
  /** Behaviour towards `prefers-reduced-motion`. @defaultValue 'respect' */
  reducedMotion?: ReducedMotionSetting
}

/** Downgrade and upgrade thresholds, in frames per second. */
const DEGRADE_BELOW = 45
const UPGRADE_ABOVE = 55

/**
 * Duration for which the measurement must stay on the same side of the
 * threshold.
 *
 * The upgrade is far slower than the downgrade: better to stay one second too
 * long at low quality than to oscillate between two levels, which is
 * immediately visible on screen.
 */
const DEGRADE_AFTER_MS = 1000
const UPGRADE_AFTER_MS = 4000

/** Subset of the network API, missing from the typed platform. */
interface NetworkInformation {
  saveData?: boolean
  effectiveType?: string
}

/** Subset of the battery API. */
interface BatteryStatus {
  charging: boolean
  level: number
  addEventListener?: (type: string, listener: () => void) => void
}

class MotionPolicy {
  private quality: QualitySetting = 'auto'
  private reducedMotion: ReducedMotionSetting = 'respect'

  private systemReduced = false
  private systemDark = false
  private forcedTheme: ThemeLevel | undefined
  private visible = true
  private resolved: QualityLevel = 'high'
  private reason = 'initial setting'
  private lowPower = false

  private since = 0
  private pending: QualityLevel | undefined
  /**
   * Retained snapshot. `useSyncExternalStore` compares snapshots by identity:
   * rebuilding one on every read would cause an endless render loop.
   */
  private snapshot: MotionState = {
    reduced: false,
    quality: 'high',
    visible: true,
    theme: 'light',
    fps: 0,
    reason: 'initial setting',
  }
  private readonly listeners = new Set<(state: MotionState) => void>()
  private installed = false
  private teardown: (() => void)[] = []

  /**
   * Current state.
   *
   * The reference only changes on a real change: that is what makes this state
   * consumable by `useSyncExternalStore`.
   */
  public get state(): MotionState {
    return this.snapshot
  }

  /** Recomputes the snapshot, and reports whether it changed. */
  private refresh(): boolean {
    const next: MotionState = {
      reduced: this.isReduced(),
      quality: this.isReduced() ? 'low' : this.resolved,
      visible: this.visible,
      theme: this.forcedTheme ?? (this.systemDark ? 'dark' : 'light'),
      fps: clock.fps,
      reason: this.reason,
    }

    const previous = this.snapshot
    if (
      previous.reduced === next.reduced &&
      previous.quality === next.quality &&
      previous.visible === next.visible &&
      previous.theme === next.theme &&
      previous.reason === next.reason
    ) {
      return false
    }

    this.snapshot = next
    return true
  }

  /** Determines whether animations must be neutralised. */
  private isReduced(): boolean {
    if (this.reducedMotion === 'force') return true
    if (this.reducedMotion === 'ignore') return false
    return this.systemReduced
  }

  /** Applies settings, and re-evaluates immediately. */
  public configure(options: MotionPolicyOptions): void {
    if (options.quality !== undefined) this.quality = options.quality
    if (options.reducedMotion !== undefined) this.reducedMotion = options.reducedMotion

    if (this.quality === 'low') {
      this.resolved = 'low'
      this.reason = 'forced quality'
    } else if (this.quality === 'high') {
      this.resolved = 'high'
      this.reason = 'forced quality'
    }

    this.install()
    this.emit()
  }

  /** Subscribes a listener to state changes. */
  public subscribe(listener: (state: MotionState) => void): () => void {
    this.listeners.add(listener)
    this.install()
    return () => this.listeners.delete(listener)
  }

  private emit(): void {
    if (!this.refresh()) return
    for (const listener of this.listeners) listener(this.snapshot)
  }

  /** Installs the platform observers, only once. */
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

      const scheme = window.matchMedia('(prefers-color-scheme: dark)')
      this.systemDark = scheme.matches
      const onScheme = (): void => {
        this.systemDark = scheme.matches
        this.emit()
      }
      scheme.addEventListener('change', onScheme)
      this.teardown.push(() => scheme.removeEventListener('change', onScheme))
    }

    if (typeof document !== 'undefined') {
      // The theme set by the application wins over the system preference, in
      // both directions — the same rule as the stylesheet.
      const readForced = (): void => {
        const value = document.documentElement.dataset['theme']
        this.forcedTheme = value === 'dark' || value === 'light' ? value : undefined
      }
      readForced()
      if (typeof MutationObserver === 'function') {
        const observer = new MutationObserver(() => {
          readForced()
          this.emit()
        })
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme'],
        })
        this.teardown.push(() => observer.disconnect())
      }
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
   * Reads the hints of a constrained device.
   *
   * These APIs are not universal: their absence is not an error, it simply
   * means that no constraint is known.
   */
  private readLowPower(): void {
    const connection = (navigator as Navigator & { connection?: NetworkInformation })
      .connection
    if (connection?.saveData === true) {
      this.lowPower = true
      this.reason = 'data saving requested'
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
            if (constrained) this.reason = 'low battery'
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
   * Watches the load and adjusts the quality when the setting is automatic.
   *
   * The measurement is taken once per second, not on every frame: reacting to
   * a single slow frame would produce a flicker of quality.
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
        ? 'constrained device'
        : `${fps} frames per second measured`
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
   * Removes the observers. Reserved for the tests and for closing a page.
   */
  public dispose(): void {
    for (const stop of this.teardown) stop()
    this.teardown = []
    this.listeners.clear()
    this.installed = false
    this.quality = 'auto'
    this.reducedMotion = 'respect'
    this.resolved = 'high'
    this.reason = 'initial setting'
    this.lowPower = false
    this.pending = undefined
    this.systemReduced = false
    this.visible = true
    this.snapshot = {
      reduced: false,
      quality: 'high',
      visible: true,
      theme: 'light',
      fps: 0,
      reason: 'initial setting',
    }
  }
}

/**
 * Policy of the page.
 *
 * @example
 * import { motionPolicy } from '@odoro-cli/engine'
 *
 * if (motionPolicy.state.reduced) {
 *   element.style.opacity = '1' // final state, immediately
 * }
 */
export const motionPolicy = new MotionPolicy()

/** Type of the policy, for the signatures that receive it. */
export type MotionPolicyInstance = MotionPolicy
