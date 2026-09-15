/**
 * Motion tokens expressed in the units expected by the engine.
 *
 * Design tokens are CSS strings (`'200ms'`); the browser animation API
 * expects numeric milliseconds. This module does the conversion
 * once and for all, from the same source of truth — there are never
 * two values to keep in sync.
 *
 * @module
 */

import { duration, easing } from '../styles/tokens.js'

/**
 * Converts a CSS duration into milliseconds.
 *
 * @throws {Error} If the unit is neither `ms` nor `s`.
 */
function toMilliseconds(value: string): number {
  const match = /^([\d.]+)(ms|s)$/.exec(value.trim())
  if (match === null) throw new Error(`[odoro/motion] Unreadable duration: "${value}".`)
  const amount = Number(match[1])
  return match[2] === 's' ? amount * 1000 : amount
}

/**
 * Duration scale in milliseconds, derived from the design tokens.
 *
 * @example
 * motionDuration.base // 200
 */
export const motionDuration: Readonly<Record<keyof typeof duration, number>> =
  Object.freeze(
    Object.fromEntries(
      Object.entries(duration).map(([key, value]) => [key, toMilliseconds(value)]),
    ) as Record<keyof typeof duration, number>,
  )

/**
 * Bezier curves, directly usable as `easing`.
 *
 * @example
 * motionEasing.entrance // 'cubic-bezier(0, 0, 0, 1)'
 */
export const motionEasing = easing

/** Name of a duration on the scale. */
export type MotionDuration = keyof typeof motionDuration

/** Name of a curve on the scale. */
export type MotionEasing = keyof typeof motionEasing

/** Duration accepted by the components: a token name or milliseconds. */
export type DurationInput = MotionDuration | number

/** Curve accepted by the components: a token name or a CSS value. */
export type EasingInput = MotionEasing | (string & Record<never, never>)

/**
 * Resolves a duration provided by the caller into milliseconds.
 *
 * @example
 * resolveDuration('slow') // 320
 * resolveDuration(450)    // 450
 */
export function resolveDuration(input: DurationInput): number {
  return typeof input === 'number' ? input : motionDuration[input]
}

/**
 * Resolves a curve provided by the caller into a CSS value.
 *
 * @example
 * resolveEasing('exit')          // 'cubic-bezier(0.3, 0, 1, 1)'
 * resolveEasing('steps(4, end)') // 'steps(4, end)'
 */
export function resolveEasing(input: EasingInput): string {
  return input in motionEasing ? motionEasing[input as MotionEasing] : input
}
