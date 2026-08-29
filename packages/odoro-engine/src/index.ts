/**
 * Moteur d'animation d'Odoro.
 *
 * ## Ou passe la frontiere avec `@odoro/libs/motion`
 *
 * La question a se poser tient en une phrase : **ce composant doit-il
 * travailler a chaque image ?**
 *
 * - Non — une revelation declenchee une fois, une transition de presence, une
 *   micro-interaction : cela appartient a `@odoro/libs/motion`, qui confie tout
 *   au compositeur du navigateur et n'execute aucun JavaScript par image.
 * - Oui — lie au defilement, lie au pointeur avec amortissement, rendu WebGL,
 *   orchestration de plusieurs elements en cadence : cela appartient ici.
 *
 * Le critere n'est pas « leger contre lourd », qui laisse hesiter a chaque
 * composant, mais **qui possede la frame**. Un defilement horizontal pilote
 * par le scroll ne *peut pas* etre fait dans la librairie ; une revelation au
 * scroll ne *doit pas* etre faite ici.
 *
 * Le moteur reprend les tokens de duree et de courbe d'`@odoro/libs` : il ne
 * les redefinit pas.
 *
 * @example
 * import { OdoroEngine, clock, motionPolicy } from '@odoro/engine'
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

export {
  mergePresentation,
  type Customisable,
  type Presentation,
} from './contract/customisation.js'

export { fromSlot, type Slot } from './contract/slot.js'

export { useOnReady, type ReadyCallback, type ReadyContext } from './contract/ready.js'

export {
  ensurePlugin,
  ensurePlugins,
  isPluginRegistered,
  loadScrollTrigger,
  loadSplitText,
  registeredPlugins,
  type PluginName,
} from './gsap/setup.js'

export {
  useTimeline,
  useTween,
  type TimelineHandle,
  type TimelineOptions,
  type TimelineSetup,
  type TweenOptions,
} from './gsap/use-timeline.js'

export {
  killScrollTriggers,
  onRouteChange,
  useScrollScrub,
  useScrollTrigger,
  type ScrollScrubHandle,
  type ScrollScrubOptions,
  type ScrollTriggerConfig,
  type ScrollTriggerOptions,
} from './gsap/use-scroll-trigger.js'

export {
  useSplitText,
  type SplitBy,
  type SplitTextHandle,
  type SplitTextOptions,
} from './gsap/use-split-text.js'

export {
  surfaceManager,
  type RefusalReason,
  type Surface,
  type SurfaceBackend,
  type SurfaceManagerInstance,
  type SurfaceManagerOptions,
  type SurfaceRequest,
  type SurfaceResult,
} from './gl/surface-manager.js'

export {
  useTokenShader,
  type TokenShaderHandle,
  type TokenShaderOptions,
} from './gl/ogl/use-token-shader.js'

export {
  useShaderSurface,
  type ShaderSurfaceHandle,
  type ShaderSurfaceOptions,
  type UniformValue,
} from './gl/ogl/use-shader-surface.js'

export { NOISE_FUNCTIONS_3D } from './gl/noise-3d.js'

export {
  oklchToRgb,
  parseColour,
  readTokenColour,
  type ShaderColour,
} from './gl/colour.js'

export {
  BEAMS_FRAGMENT,
  DOTS_FRAGMENT,
  MESH_FRAGMENT,
  WAVES_FRAGMENT,
} from './gl/ogl/backgrounds.js'

export {
  CAUSTICS_FRAGMENT,
  PLASMA_FRAGMENT,
  SILK_FRAGMENT,
  VORTEX_FRAGMENT,
} from './gl/ogl/backgrounds-flow.js'

export {
  CELLS_FRAGMENT,
  HALFTONE_FRAGMENT,
  HEX_FRAGMENT,
  MOSAIC_FRAGMENT,
} from './gl/ogl/backgrounds-cells.js'

export {
  BUBBLES_FRAGMENT,
  RAIN_FRAGMENT,
  STARS_FRAGMENT,
  THREADS_FRAGMENT,
} from './gl/ogl/backgrounds-particles.js'

export {
  CONTOUR_FRAGMENT,
  RIPPLE_GRID_FRAGMENT,
  SPECTRUM_FRAGMENT,
  TUNNEL_FRAGMENT,
} from './gl/ogl/backgrounds-geometry.js'

export {
  AURORA_FRAGMENT,
  FULLSCREEN_VERTEX,
  GRID_FRAGMENT,
  NOISE_FUNCTIONS,
} from './gl/ogl/shaders.js'
