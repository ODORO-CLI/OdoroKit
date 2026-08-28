/**
 * Indicateur d'activite circulaire.
 *
 * @module
 */

import { type HTMLAttributes, type ReactElement } from 'react'

import { cx } from '../styles/cx.js'

/** Diametre en pixels par taille. */
const SIZE_PX: Readonly<Record<'sm' | 'md' | 'lg', number>> = {
  sm: 16,
  md: 24,
  lg: 32,
}

/** Proprietes de {@link Spinner}. */
export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {
  /** Taille. @defaultValue 'md' */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Libelle annonce aux lecteurs d'ecran, masque visuellement.
   *
   * @defaultValue 'Chargement'
   */
  label?: string
  /** Classes additionnelles. */
  className?: string
}

/**
 * Indicateur d'activite.
 *
 * Le dessin herite de `currentColor` : il suffit de poser une classe de
 * couleur de texte sur le composant pour le teinter. L'etat est porte par
 * `role="status"` et un libelle masque, le SVG restant decoratif.
 *
 * @example
 * <Spinner size="lg" label="Chargement des projets" className="o-text-primary" />
 */
export function Spinner({
  size = 'md',
  label = 'Chargement',
  className,
  ...rest
}: SpinnerProps): ReactElement {
  const px = SIZE_PX[size]

  return (
    <span {...rest} role="status" className={cx('o-inline-flex', className)}>
      <svg
        className="o-animate-spin o-shrink-0"
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.5"
          opacity="0.25"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="o-sr-only">{label}</span>
    </span>
  )
}
