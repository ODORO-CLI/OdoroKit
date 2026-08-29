/**
 * Route du jeu « classique ».
 *
 * Le module du jeu pese plusieurs centaines de kilo-octets : il n'est charge
 * que lorsqu'on ouvre cette page, par l'import paresseux de la route.
 *
 * @module
 */

import * as jeu from '@odoro/icons/classique'
import { type ReactElement } from 'react'

import { IconesJeu, type JeuModule } from '../IconesJeu.jsx'

/** Page du jeu. */
export default function Page(): ReactElement {
  return <IconesJeu jeu={jeu as unknown as JeuModule} />
}
