/**
 * Le fond decoratif de la page.
 *
 * ## Ce qu'il est, et ce qu'il remplace
 *
 * Deux nappes de couleur de marque, tres diluees, posees en haut de page. Rien
 * ne bouge : c'est un degrade, pas une animation — il ne coute aucune image par
 * seconde et se dessine avant le premier octet de JavaScript.
 *
 * Si le moteur a ete retenu a la creation, ce fichier est remplace par une
 * version qui ouvre une surface WebGL animee. Le reste de la page ne sait pas
 * d'ou vient son fond : elle place `<Fond />` et n'en demande pas plus.
 *
 * @module
 */

import type { ReactElement } from 'react'

/** Deux nappes de marque, diluees, derriere le contenu. */
export function Fond(): ReactElement {
  return (
    <div
      aria-hidden="true"
      className="o-pointer-events-none o-absolute o-inset-x-0 o-top-0 o-h-[42rem] o-overflow-hidden"
    >
      <div
        className="o-absolute o-left-1/2 o-top-[-18rem] o-size-[46rem] o--translate-x-1/2 o-rounded-full o-blur-3xl o-opacity-30 dark:o-opacity-25"
        style={{
          background:
            'radial-gradient(closest-side, var(--o-palette-brand-500), transparent)',
        }}
      />
      <div
        className="o-absolute o-right-[-10rem] o-top-[6rem] o-size-[30rem] o-rounded-full o-blur-3xl o-opacity-20 dark:o-opacity-20"
        style={{
          background:
            'radial-gradient(closest-side, var(--o-palette-brand-400), transparent)',
        }}
      />
    </div>
  )
}
