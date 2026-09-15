/**
 * 3D scene backend.
 *
 * ## A split point, not a mere sub-module
 *
 * This entry is separate from the main entry for a measurable reason: the 3D
 * renderer weighs between 120 and 140 kilobytes compressed, an order of
 * magnitude above the light backend. A site that only shows a text animation
 * must not download a single line of it.
 *
 * The separation is doubled by a dynamic import inside the hook itself:
 * importing this module is not enough to pull the renderer into the initial
 * chunk. A test checks both guarantees on the produced bundle.
 *
 * ## When to use it
 *
 * The question to ask: **are a camera and lighting really necessary?** If the
 * answer is no — an animated gradient, a noise field, a fullscreen distortion
 * — the light backend is enough, for twelve kilobytes.
 *
 * @example
 * import { useScene, useCameraRig } from '@odoro-cli/engine/three'
 *
 * @module
 */

export {
  useScene,
  type SceneContext,
  type SceneFrame,
  type SceneHandle,
  type SceneOptions,
} from './use-scene.js'

export { useCameraRig, type CameraRigOptions } from './use-camera-rig.js'

export {
  useScrollCamera,
  type CameraKeyframe,
  type ScrollCameraOptions,
} from './use-scroll-camera.js'

export {
  disposeMaterial,
  disposeObject,
  disposeScene,
  type DisposalReport,
} from './dispose.js'
