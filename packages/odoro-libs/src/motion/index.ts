/**
 * Odoro animation engine.
 *
 * ## Principle
 *
 * Interpolation is handed over to the browser animation engine
 * (`Element.animate`), which runs on the compositor thread. No
 * `requestAnimationFrame` loop is opened in JavaScript: a running animation
 * does not slow down if the main thread is busy, and consumes nothing when
 * the tab is hidden.
 *
 * ## Physical springs
 *
 * This version implements **only Bezier curves**, taken from the design
 * tokens. A physical spring cannot be expressed as a Bezier curve: one
 * would have to sample the solution of the damped oscillator into a hundred
 * or so steps, or go back to a JavaScript loop — which would cancel the benefit
 * of the approach. Both paths stay open for a later version;
 * the sampling would plug in behind an `easing: 'spring(...)'` without
 * changing the public API.
 *
 * ## Reduced motion
 *
 * `prefers-reduced-motion` is consulted by every component and hook of the
 * module. The animation is neutralized, never the final state: revealed content
 * stays visible, an exiting element is indeed unmounted.
 *
 * @example
 * import { Reveal, Stagger, useAnimate, usePresence } from '@odoro-cli/libs/motion'
 *
 * @module
 */

export { Animate, type AnimateProps } from './Animate.jsx'
export { Reveal, type RevealProps, type RevealTiming } from './Reveal.jsx'
export { Stagger, type StaggerProps } from './Stagger.jsx'
export { TextReveal, type TextRevealProps } from './TextReveal.jsx'

export {
  getMotionPreset,
  motionPresets,
  revealPresets,
  type MotionPreset,
  type MotionPresetName,
  type RevealPresetName,
} from './presets.js'

export { useAnimate, type AnimateControls, type MotionOptions } from './useAnimate.js'
export { useInView, type InViewOptions } from './useInView.js'
export {
  useElementScrollProgress,
  useScrollProgress,
  type ScrollProgressOptions,
} from './useScrollProgress.js'
export {
  usePresence,
  type Presence,
  type PresenceOptions,
  type PresenceStatus,
} from './usePresence.js'

export {
  REVEAL_FROM,
  VISIBLE,
  applyStyles,
  clearStyles,
  type MotionKeyframe,
} from './keyframes.js'

export {
  motionDuration,
  motionEasing,
  resolveDuration,
  resolveEasing,
  type DurationInput,
  type EasingInput,
  type MotionDuration,
  type MotionEasing,
} from './tokens.js'

export {
  prefersReducedMotion,
  usePrefersReducedMotion,
} from '../shared/motionPreference.js'
