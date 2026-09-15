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
 * ## Pourquoi les tailles sont en style
 *
 * Le systeme de style **n'emet pas de classe a valeur arbitraire** : `o-h-[42rem]`
 * ne produit aucune regle, et une classe absente ne peint rien. Le conteneur se
 * retrouvait haut de zero pixel, les deux nappes aussi, et le fond ne se voyait
 * pas — sans que rien ne le signale.
 *
 * Les utilitaires couvrent les valeurs de l'echelle ; tout ce qui sort de
 * l'echelle s'ecrit en style, ou il est sur.
 *
 * @module
 */

import type { ReactElement } from 'react'

/** Deux nappes de marque, diluees, derriere le haut de la page. */
export function Fond(): ReactElement {
  return (
    <div
      aria-hidden="true"
      className="o-pointer-events-none o-absolute o-inset-x-0 o-top-0 o-overflow-hidden"
      style={{ height: '42rem' }}
    >
      <div
        className="o-absolute o-rounded-full"
        style={{
          left: '50%',
          top: '-18rem',
          width: '46rem',
          height: '46rem',
          transform: 'translateX(-50%)',
          filter: 'blur(64px)',
          opacity: 0.3,
          background:
            'radial-gradient(closest-side, var(--o-palette-brand-500), transparent)',
        }}
      />
      <div
        className="o-absolute o-rounded-full"
        style={{
          right: '-10rem',
          top: '6rem',
          width: '30rem',
          height: '30rem',
          filter: 'blur(64px)',
          opacity: 0.18,
          background:
            'radial-gradient(closest-side, var(--o-palette-brand-400), transparent)',
        }}
      />
    </div>
  )
}
