/**
 * Le fond decoratif de la page.
 *
 * Deux nappes de couleur de marque, tres diluees. Rien ne bouge : c'est un
 * degrade, pas une animation.
 *
 * Si le moteur a ete retenu, ce fichier est remplace par une version qui ouvre
 * une surface WebGL animee. `App.tsx` place `<Fond />` et n'en demande pas plus.
 *
 * @module
 */

import type { ReactElement } from 'react'

/** Deux nappes de marque derriere le haut de la page. */
export function Fond(): ReactElement {
  return (
    <div className="fond" aria-hidden="true">
      <div className="fond-nappe fond-nappe-haute" />
      <div className="fond-nappe fond-nappe-droite" />
    </div>
  )
}
