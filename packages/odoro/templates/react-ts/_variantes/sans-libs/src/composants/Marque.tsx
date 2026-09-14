/**
 * La marque : le signe et le mot.
 *
 * Meme signe que dans la version complete, dessine en SVG avec `currentColor`
 * pour prendre la couleur de son parent. Les bibliotheques n'ayant pas ete
 * retenues, la teinte vient d'une variable declaree dans `styles.css`.
 *
 * @module
 */

import type { ReactElement } from 'react'

/** Le signe seul, a la taille de la police qui l'entoure. */
export function Signe({ className = '' }: { readonly className?: string }): ReactElement {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className={`signe ${className}`}>
      <path
        d="M20.25 20.25H50a29.75 29.75 0 1 1-29.75 29.75Z"
        stroke="currentColor"
        strokeWidth="10.5"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

/** Le signe et le mot. */
export function Marque(): ReactElement {
  return (
    <span className="marque">
      <span className="marque-signe">
        <Signe />
      </span>
      Odoro
    </span>
  )
}
