/**
 * React provider of the engine.
 *
 * ## It is optional, and that is a choice
 *
 * A component used outside the provider works with the default settings.
 * Nothing breaks, nothing goes silent: a warning is emitted **only once, in
 * development**, stating what is missing and why it may matter.
 *
 * The reason is practical: a component copied from the registry lands in a
 * project that may not have mounted the provider yet. Making it fail would be
 * the best way to suggest that the component is broken.
 *
 * ## What the provider actually does
 *
 * It configures module singletons — the clock, the policy, the inventory —
 * rather than creating instances. The uniqueness of the render loop is the
 * central guarantee of the engine; two nested providers must not produce two
 * loops.
 *
 * @module
 */

import {
  type ReactElement,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react'

import { type ClockInstance, clock } from './clock.js'
import { type BridgeTeardown, bridgeToLibs } from './libs-bridge.js'
import {
  type MotionPolicyInstance,
  type MotionState,
  type QualitySetting,
  type ReducedMotionSetting,
  motionPolicy,
} from './motion-policy.js'
import { type ResourceRegistryInstance, registry } from './registry.js'

/** Value exposed by the context. */
export interface EngineContextValue {
  /** Single render loop. */
  readonly clock: ClockInstance
  /** Motion policy. */
  readonly policy: MotionPolicyInstance
  /** Inventory of live resources. */
  readonly registry: ResourceRegistryInstance
  /** Maximum number of simultaneous WebGL surfaces. */
  readonly maxSurfaces: number
  /** `true` if a provider is actually mounted above. */
  readonly provided: boolean
}

/** Values used outside a provider. */
const FALLBACK: EngineContextValue = {
  clock,
  policy: motionPolicy,
  registry,
  maxSurfaces: 2,
  provided: false,
}

const EngineContext = createContext<EngineContextValue>(FALLBACK)
EngineContext.displayName = 'OdoroEngine'

/** Properties of {@link OdoroEngine}. */
export interface OdoroEngineProps {
  /** Application. */
  children?: ReactNode
  /**
   * Quality of expensive renders. `auto` downgrades on its own when the
   * measured load requires it.
   *
   * @defaultValue 'auto'
   */
  quality?: QualitySetting
  /**
   * Behaviour towards `prefers-reduced-motion`. `force` neutralises the
   * animations in every circumstance; `ignore` must only be used for
   * demonstration purposes.
   *
   * @defaultValue 'respect'
   */
  reducedMotion?: ReducedMotionSetting
  /**
   * Maximum number of simultaneous WebGL surfaces. Browsers cap the available
   * contexts and silently lose the oldest one beyond that.
   *
   * @defaultValue 2
   */
  maxSurfaces?: number
}

/**
 * Configures the engine for the application.
 *
 * @example
 * <OdoroEngine quality="auto" reducedMotion="respect" maxSurfaces={2}>
 *   <App />
 * </OdoroEngine>
 */
export function OdoroEngine({
  children,
  quality = 'auto',
  reducedMotion = 'respect',
  maxSurfaces = 2,
}: OdoroEngineProps): ReactElement {
  // The configuration goes through the layout layer: a child component that
  // queries the policy on mount must already see the right settings.
  useEffect(() => {
    motionPolicy.configure({ quality, reducedMotion })
  }, [quality, reducedMotion])

  // When `@odoro-cli/libs` is installed, its measurement loop moves onto the
  // GSAP ticker and its policy follows the engine's. Its absence is an ordinary
  // case: the engine is also used without it.
  useEffect(() => {
    let undo: BridgeTeardown = () => undefined
    let cancelled = false

    void bridgeToLibs(reducedMotion).then((teardown) => {
      if (cancelled) teardown()
      else undo = teardown
    })

    return () => {
      cancelled = true
      undo()
    }
  }, [reducedMotion])

  const value = useMemo<EngineContextValue>(
    () => ({ clock, policy: motionPolicy, registry, maxSurfaces, provided: true }),
    [maxSurfaces],
  )

  return <EngineContext.Provider value={value}>{children}</EngineContext.Provider>
}

/** Warnings already emitted, so as not to repeat them on every render. */
const warned = new Set<string>()

/**
 * Accesses the engine.
 *
 * Works outside a provider, with the default settings.
 *
 * @param requester Name of the calling component, quoted in the warning.
 *
 * @example
 * const { clock, policy } = useEngine('Aurora')
 */
export function useEngine(requester = 'a component'): EngineContextValue {
  const value = useContext(EngineContext)

  if (
    !value.provided &&
    process.env['NODE_ENV'] !== 'production' &&
    !warned.has(requester)
  ) {
    warned.add(requester)
    console.warn(
      [
        `[odoro] ${requester} is used outside of <OdoroEngine>.`,
        'The default settings apply: automatic quality, reduced motion',
        'respected, two surfaces at most. Mounting the provider at the root',
        'lets you adjust them and gives access to the diagnostics panel.',
      ].join('\n'),
    )
  }

  return value
}

/**
 * Follows the state of the motion policy.
 *
 * The component re-renders when the system preference changes, when the tab
 * goes to the background, or when the quality is adjusted under load.
 *
 * @example
 * const { reduced, quality } = useMotionState()
 * if (reduced) return <StaticPoster />
 */
export function useMotionState(): MotionState {
  return useSyncExternalStore(
    (listener) => motionPolicy.subscribe(listener),
    () => motionPolicy.state,
    () => motionPolicy.state,
  )
}
