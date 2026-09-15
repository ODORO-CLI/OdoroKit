/**
 * Manipulation of the visual states used by the animation engine.
 *
 * @module
 */

/** A set of CSS properties, in JavaScript notation (`transform`, `opacity`). */
export type MotionKeyframe = Readonly<Record<string, string | number>>

/** Default starting state of a reveal. */
export const REVEAL_FROM: MotionKeyframe = { opacity: 0, transform: 'translateY(1rem)' }

/** Reference visible state: the natural state of an element. */
export const VISIBLE: MotionKeyframe = { opacity: 1, transform: 'none' }

/**
 * Applies a set of properties as inline styles.
 *
 * @example
 * applyStyles(element, { opacity: 0 })
 */
export function applyStyles(element: HTMLElement, styles: MotionKeyframe): void {
  Object.assign(element.style, styles)
}

/**
 * Removes the inline properties set by {@link applyStyles}, converting
 * the JavaScript notation into CSS notation (`backgroundColor` -> `background-color`).
 *
 * @example
 * clearStyles(element, { opacity: 0 })
 */
export function clearStyles(element: HTMLElement, styles: MotionKeyframe): void {
  for (const property of Object.keys(styles)) {
    element.style.removeProperty(
      property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
    )
  }
}
