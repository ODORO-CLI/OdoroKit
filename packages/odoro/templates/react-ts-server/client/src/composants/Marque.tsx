/**
 * La marque : le signe et le mot.
 *
 * ## Pourquoi le signe est dessine ici, et non charge
 *
 * Un fichier dans `public/` serait une image de plus a telecharger, et surtout
 * une image d'une seule couleur. Le signe est dessine en SVG dans le flux, avec
 * `currentColor` : il prend la couleur de son parent, donc la teinte de marque
 * en clair comme en sombre, sans qu'on ait deux fichiers a tenir.
 *
 * @module
 */

import type { ReactElement } from 'react'

/** Le signe seul, a la taille de la police qui l'entoure. */
export function Signe({ className = '' }: { readonly className?: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={className}
      // La taille est en style, et non en classe : elle suit la police qui
      // entoure le signe, et une classe utilitaire a valeur arbitraire n'est
      // emise que si le compilateur l'a vue passer. Absente, elle laisserait
      // un SVG sans dimensions — donc invisible, sans rien pour le signaler.
      style={{ width: '1.15em', height: '1.15em', flexShrink: 0 }}
    >
      <path
        d="M20.25 20.25H50a29.75 29.75 0 1 1-29.75 29.75Z"
        stroke="currentColor"
        strokeWidth="10.5"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

/** Le signe et le mot, tels qu'ils vont dans une barre de navigation. */
export function Marque(): ReactElement {
  return (
    <span className="o-inline-flex o-items-center o-gap-2 o-font-semibold o-tracking-tight">
      <span className="o-text-brand-500">
        <Signe />
      </span>
      Odoro
    </span>
  )
}
