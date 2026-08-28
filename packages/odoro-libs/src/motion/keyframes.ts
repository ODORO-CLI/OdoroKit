/**
 * Manipulation des etats visuels utilises par le moteur d'animation.
 *
 * @module
 */

/** Un jeu de proprietes CSS, en notation JavaScript (`transform`, `opacity`). */
export type MotionKeyframe = Readonly<Record<string, string | number>>

/** Etat de depart par defaut d'une revelation. */
export const REVEAL_FROM: MotionKeyframe = { opacity: 0, transform: 'translateY(1rem)' }

/** Etat visible de reference : l'etat naturel d'un element. */
export const VISIBLE: MotionKeyframe = { opacity: 1, transform: 'none' }

/**
 * Applique un jeu de proprietes en style inline.
 *
 * @example
 * applyStyles(element, { opacity: 0 })
 */
export function applyStyles(element: HTMLElement, styles: MotionKeyframe): void {
  Object.assign(element.style, styles)
}

/**
 * Retire les proprietes inline posees par {@link applyStyles}, en convertissant
 * la notation JavaScript en notation CSS (`backgroundColor` -> `background-color`).
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
