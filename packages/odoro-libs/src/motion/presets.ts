/**
 * Library of animation presets.
 *
 * A preset is a set of keyframes ready to play, together with a default
 * duration and curve suited to its register: entrances decelerate,
 * exits accelerate, attention animations punctuate. Presets
 * are used by name in {@link Animate} and {@link Reveal}, or directly
 * with {@link useAnimate} through {@link getMotionPreset}.
 *
 * The same movements exist as CSS classes (`o-animate-*`) for the cases
 * without JavaScript; here, they are drivable — triggering, interruption,
 * chaining.
 *
 * @module
 */

import type { MotionKeyframe } from './keyframes.js'
import type { DurationInput, EasingInput } from './tokens.js'

/** A preset: keyframes and the timing that suits them. */
export interface MotionPreset {
  /** Steps of the animation. */
  readonly keyframes: readonly Keyframe[]
  /** Default duration. */
  readonly duration: DurationInput
  /** Default curve. */
  readonly easing: EasingInput
}

/** Builds an entrance preset: given start, natural end. */
function entrance(
  from: Keyframe,
  duration: DurationInput = 'slow',
  easing: EasingInput = 'entrance',
): MotionPreset {
  return {
    keyframes: [from, { opacity: 1, transform: 'none', filter: 'none' }],
    duration,
    easing,
  }
}

/** Builds an exit preset: natural start, given end. */
function exit(
  to: Keyframe,
  duration: DurationInput = 'fast',
  easing: EasingInput = 'exit',
): MotionPreset {
  return {
    keyframes: [{ opacity: 1, transform: 'none', filter: 'none' }, to],
    duration,
    easing,
  }
}

/** Builds an attention preset: several steps, back to the natural state. */
function attention(
  keyframes: readonly Keyframe[],
  duration: DurationInput = 700,
  easing: EasingInput = 'standard',
): MotionPreset {
  return { keyframes, duration, easing }
}

/**
 * All the presets, by name.
 *
 * Three registers:
 * - **entrances** (`*-in`): make an element appear;
 * - **exits** (`*-out`): make it disappear — to play before unmounting,
 *   typically through `usePresence`;
 * - **attention**: punctuate an event on an already visible element.
 */
export const motionPresets = {
  // Entrances.
  'fade-in': entrance({ opacity: 0 }, 'base'),
  'fade-in-up': entrance({ opacity: 0, transform: 'translateY(1rem)' }),
  'fade-in-down': entrance({ opacity: 0, transform: 'translateY(-1rem)' }),
  'fade-in-left': entrance({ opacity: 0, transform: 'translateX(-1rem)' }),
  'fade-in-right': entrance({ opacity: 0, transform: 'translateX(1rem)' }),
  'scale-in': entrance({ opacity: 0, transform: 'scale(0.95)' }, 'base'),
  'zoom-in': entrance({ opacity: 0, transform: 'scale(0.5)' }),
  'blur-in': entrance({ opacity: 0, filter: 'blur(8px)' }),
  'slide-in-up': entrance({ transform: 'translateY(100%)' }),
  'slide-in-down': entrance({ transform: 'translateY(-100%)' }),
  'slide-in-left': entrance({ transform: 'translateX(-100%)' }),
  'slide-in-right': entrance({ transform: 'translateX(100%)' }),
  'flip-in-x': entrance(
    { opacity: 0, transform: 'perspective(800px) rotateX(-90deg)' },
    'slower',
  ),
  'flip-in-y': entrance(
    { opacity: 0, transform: 'perspective(800px) rotateY(-90deg)' },
    'slower',
  ),
  pop: {
    keyframes: [
      { opacity: 0, transform: 'scale(0.8)' },
      { opacity: 1, transform: 'scale(1.04)', offset: 0.6 },
      { opacity: 1, transform: 'scale(1)' },
    ],
    duration: 'slow',
    easing: 'standard',
  },
  // Exits.
  'fade-out': exit({ opacity: 0 }),
  'fade-out-up': exit({ opacity: 0, transform: 'translateY(-1rem)' }),
  'fade-out-down': exit({ opacity: 0, transform: 'translateY(1rem)' }),
  'scale-out': exit({ opacity: 0, transform: 'scale(0.95)' }),
  'zoom-out': exit({ opacity: 0, transform: 'scale(0.5)' }),
  'blur-out': exit({ opacity: 0, filter: 'blur(8px)' }),
  'slide-out-up': exit({ transform: 'translateY(-100%)' }, 'slow'),
  'slide-out-down': exit({ transform: 'translateY(100%)' }, 'slow'),
  'slide-out-left': exit({ transform: 'translateX(-100%)' }, 'slow'),
  'slide-out-right': exit({ transform: 'translateX(100%)' }, 'slow'),
  // Attention.
  press: attention(
    [{ transform: 'scale(1)' }, { transform: 'scale(0.97)' }, { transform: 'scale(1)' }],
    'faster',
    'emphasized',
  ),
  bump: attention(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
    'fast',
    'emphasized',
  ),
  shake: attention(
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-0.375rem)' },
      { transform: 'translateX(0.375rem)' },
      { transform: 'translateX(-0.375rem)' },
      { transform: 'translateX(0.375rem)' },
      { transform: 'translateX(-0.25rem)' },
      { transform: 'translateX(0)' },
    ],
    600,
  ),
  tada: attention(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(0.92) rotate(-3deg)' },
      { transform: 'scale(1.08) rotate(3deg)' },
      { transform: 'scale(1.08) rotate(-3deg)' },
      { transform: 'scale(1.08) rotate(3deg)' },
      { transform: 'scale(1)' },
    ],
    800,
  ),
  wobble: attention(
    [
      { transform: 'none' },
      { transform: 'translateX(-1.25rem) rotate(-5deg)' },
      { transform: 'translateX(1rem) rotate(3deg)' },
      { transform: 'translateX(-0.75rem) rotate(-3deg)' },
      { transform: 'translateX(0.5rem) rotate(2deg)' },
      { transform: 'none' },
    ],
    800,
  ),
  jello: attention(
    [
      { transform: 'none' },
      { transform: 'skewX(-12deg) skewY(-12deg)' },
      { transform: 'skewX(6deg) skewY(6deg)' },
      { transform: 'skewX(-3deg) skewY(-3deg)' },
      { transform: 'skewX(1.5deg) skewY(1.5deg)' },
      { transform: 'none' },
    ],
    800,
  ),
  'rubber-band': attention(
    [
      { transform: 'scale(1, 1)' },
      { transform: 'scale(1.25, 0.75)' },
      { transform: 'scale(0.75, 1.25)' },
      { transform: 'scale(1.15, 0.85)' },
      { transform: 'scale(0.95, 1.05)' },
      { transform: 'scale(1, 1)' },
    ],
    800,
  ),
  flash: attention(
    [{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }],
    900,
  ),
  bounce: attention(
    [
      { transform: 'translateY(0)' },
      { transform: 'translateY(-25%)', easing: 'cubic-bezier(0.8, 0, 1, 1)' },
      { transform: 'translateY(0)', easing: 'cubic-bezier(0, 0, 0.2, 1)' },
      { transform: 'translateY(-12%)', easing: 'cubic-bezier(0.8, 0, 1, 1)' },
      { transform: 'translateY(0)', easing: 'cubic-bezier(0, 0, 0.2, 1)' },
    ],
    900,
  ),
  heartbeat: attention(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.12)' },
      { transform: 'scale(1)' },
      { transform: 'scale(1.12)' },
      { transform: 'scale(1)' },
    ],
    1000,
  ),
  wiggle: attention(
    [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-3deg)' },
      { transform: 'rotate(3deg)' },
      { transform: 'rotate(-3deg)' },
      { transform: 'rotate(0deg)' },
    ],
    800,
  ),
  swing: attention(
    [
      { transform: 'rotate(0deg)', transformOrigin: 'top center' },
      { transform: 'rotate(15deg)', transformOrigin: 'top center' },
      { transform: 'rotate(-10deg)', transformOrigin: 'top center' },
      { transform: 'rotate(5deg)', transformOrigin: 'top center' },
      { transform: 'rotate(-5deg)', transformOrigin: 'top center' },
      { transform: 'rotate(0deg)', transformOrigin: 'top center' },
    ],
    800,
  ),
} as const satisfies Record<string, MotionPreset>

/** Name of a preset. */
export type MotionPresetName = keyof typeof motionPresets

/**
 * Returns a preset by its name.
 *
 * @throws {Error} If the name is unknown: a typo must not
 *   silently produce an absence of animation.
 *
 * @example
 * const [ref, controls] = useAnimate()
 * const { keyframes, duration, easing } = getMotionPreset('tada')
 * void controls.play([...keyframes], { duration, easing })
 */
export function getMotionPreset(name: MotionPresetName): MotionPreset {
  const preset = motionPresets[name]
  if (preset === undefined) {
    throw new Error(`[odoro/motion] Unknown preset: "${String(name)}".`)
  }
  return preset
}

/**
 * Named starting states for {@link Reveal}: the movement of a reveal
 * is defined by its starting point, the end always being the natural state.
 */
export const revealPresets = {
  'fade-up': { opacity: 0, transform: 'translateY(1rem)' },
  'fade-down': { opacity: 0, transform: 'translateY(-1rem)' },
  'fade-left': { opacity: 0, transform: 'translateX(-1rem)' },
  'fade-right': { opacity: 0, transform: 'translateX(1rem)' },
  fade: { opacity: 0 },
  scale: { opacity: 0, transform: 'scale(0.92)' },
  zoom: { opacity: 0, transform: 'scale(0.5)' },
  blur: { opacity: 0, filter: 'blur(8px)' },
  'flip-x': { opacity: 0, transform: 'perspective(800px) rotateX(-45deg)' },
  'flip-y': { opacity: 0, transform: 'perspective(800px) rotateY(-45deg)' },
} as const satisfies Record<string, MotionKeyframe>

/** Name of a reveal starting state. */
export type RevealPresetName = keyof typeof revealPresets
