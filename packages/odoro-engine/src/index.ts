/**
 * Odoro's animation engine.
 *
 * ## Where the boundary with `@odoro-cli/libs/motion` lies
 *
 * The question to ask fits in one sentence: **must this component work on
 * every frame?**
 *
 * - No — a reveal fired once, a presence transition, a micro-interaction: that
 *   belongs to `@odoro-cli/libs/motion`, which hands everything to the
 *   browser's compositor and runs no JavaScript per frame.
 * - Yes — scroll-linked, pointer-linked with damping, WebGL rendering,
 *   orchestrating several elements in step: that belongs here.
 *
 * The criterion is not "light versus heavy", which leaves you hesitating at
 * every component, but **who owns the frame**. A horizontal scroll driven by
 * the scroll position *cannot* be done in the library; a reveal on scroll
 * *must not* be done here.
 *
 * The engine takes up the duration and easing tokens of `@odoro-cli/libs`: it
 * does not redefine them.
 *
 * @example
 * import { OdoroEngine, clock, motionPolicy } from '@odoro-cli/engine'
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
