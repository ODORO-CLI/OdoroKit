/**
 * Tokens d'animation exprimes dans les unites attendues par le moteur.
 *
 * Les design tokens sont des chaines CSS (`'200ms'`) ; l'API d'animation du
 * navigateur attend des millisecondes numeriques. Ce module fait la conversion
 * une fois pour toutes, a partir de la meme source de verite — il n'y a jamais
 * deux valeurs a tenir synchronisees.
 *
 * @module
 */

import { duration, easing } from '../styles/tokens.js'

/**
 * Convertit une duree CSS en millisecondes.
 *
 * @throws {Error} Si l'unite n'est ni `ms` ni `s`.
 */
function toMilliseconds(value: string): number {
  const match = /^([\d.]+)(ms|s)$/.exec(value.trim())
  if (match === null) throw new Error(`[odoro/motion] Duree illisible : "${value}".`)
  const amount = Number(match[1])
  return match[2] === 's' ? amount * 1000 : amount
}

/**
 * Echelle de durees en millisecondes, derivee des design tokens.
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
 * Courbes de Bezier, directement utilisables comme `easing`.
 *
 * @example
 * motionEasing.entrance // 'cubic-bezier(0, 0, 0, 1)'
 */
export const motionEasing = easing

/** Nom d'une duree de l'echelle. */
export type MotionDuration = keyof typeof motionDuration

/** Nom d'une courbe de l'echelle. */
export type MotionEasing = keyof typeof motionEasing

/** Duree acceptee par les composants : un nom de token ou des millisecondes. */
export type DurationInput = MotionDuration | number

/** Courbe acceptee par les composants : un nom de token ou une valeur CSS. */
export type EasingInput = MotionEasing | (string & Record<never, never>)

/**
 * Resout une duree fournie par l'appelant en millisecondes.
 *
 * @example
 * resolveDuration('slow') // 320
 * resolveDuration(450)    // 450
 */
export function resolveDuration(input: DurationInput): number {
  return typeof input === 'number' ? input : motionDuration[input]
}

/**
 * Resout une courbe fournie par l'appelant en valeur CSS.
 *
 * @example
 * resolveEasing('exit')          // 'cubic-bezier(0.3, 0, 1, 1)'
 * resolveEasing('steps(4, end)') // 'steps(4, end)'
 */
export function resolveEasing(input: EasingInput): string {
  return input in motionEasing ? motionEasing[input as MotionEasing] : input
}
