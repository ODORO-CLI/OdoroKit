/**
 * Moteur d'animation d'Odoro.
 *
 * ## Ou passe la frontiere avec `odoro-libs/motion`
 *
 * La question a se poser tient en une phrase : **ce composant doit-il
 * travailler a chaque image ?**
 *
 * - Non — une revelation declenchee une fois, une transition de presence, une
 *   micro-interaction : cela appartient a `odoro-libs/motion`, qui confie tout
 *   au compositeur du navigateur et n'execute aucun JavaScript par image.
 * - Oui — lie au defilement, lie au pointeur avec amortissement, rendu WebGL,
 *   orchestration de plusieurs elements en cadence : cela appartient ici.
 *
 * Le critere n'est pas « leger contre lourd », qui laisse hesiter a chaque
 * composant, mais **qui possede la frame**. Un defilement horizontal pilote
 * par le scroll ne *peut pas* etre fait dans la librairie ; une revelation au
 * scroll ne *doit pas* etre faite ici.
 *
 * Le moteur reprend les tokens de duree et de courbe d'`odoro-libs` : il ne
 * les redefinit pas.
 *
 * @example
 * import { OdoroEngine, clock, motionPolicy } from 'odoro-engine'
 *
 * <OdoroEngine quality="auto">
 *   <App />
 * </OdoroEngine>
 *
 * @module
 */

export {
  CLOCK_PRIORITY,
  clock,
  type ClockCallback,
  type ClockInstance,
  type ClockSubscription,
  type FrameInfo,
  type SubscribeOptions,
} from './core/clock.js'

export {
  motionPolicy,
  type MotionPolicyInstance,
  type MotionPolicyOptions,
  type MotionState,
  type QualityLevel,
  type QualitySetting,
  type ReducedMotionSetting,
} from './core/motion-policy.js'

export {
  registry,
  type Resource,
  type ResourceHandle,
  type ResourceInput,
  type ResourceKind,
  type ResourceRegistryInstance,
} from './core/registry.js'

export {
  OdoroEngine,
  useEngine,
  useMotionState,
  type EngineContextValue,
  type OdoroEngineProps,
} from './core/context.jsx'

export {
  DEBUG_PARAM,
  OdoroDebugPanel,
  isDebugRequested,
  readDebugSnapshot,
  type DebugSnapshot,
  type OdoroDebugPanelProps,
} from './core/debug.jsx'
