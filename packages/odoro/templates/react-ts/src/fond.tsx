/**
 * Le fond decoratif de la page.
 *
 * ## Pourquoi ce n'est pas dans `App.tsx`
 *
 * C'est le seul morceau de la page qui depend de ce qui a ete coche a la
 * creation : avec le moteur, ce fichier est remplace par une version qui ouvre
 * une surface WebGL animee ; sans lui, c'est le degrade ci-dessous.
 *
 * Le garder a part evite d'avoir deux `App.tsx` a tenir — un par cas — qui
 * divergeraient au premier changement de texte. `App.tsx` place `<Fond />` et
 * n'en demande pas plus.
 *
 * @module
 */

import type { ReactElement } from 'react'

/** Deux nappes de marque, diluees, derriere le haut de la page. */
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
        className="o-absolute o-right-[-10rem] o-top-[6rem] o-size-[30rem] o-rounded-full o-blur-3xl o-opacity-20"
        style={{
          background:
            'radial-gradient(closest-side, var(--o-palette-brand-400), transparent)',
        }}
      />
    </div>
  )
}
