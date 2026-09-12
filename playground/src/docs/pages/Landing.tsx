/**
 * La vitrine, a la racine.
 *
 * ## Elle est faite de ce qu'elle vend
 *
 * Chaque piece visible ici sort du registre ou de la librairie : le heros est
 * une entree du registre (`hero/tide`), les fonds des cartes sont des fonds du
 * registre, la pile collante, les etapes au defilement, la FAQ et le pied de
 * page sont des sections installees par `odoro add`. Rien n'est ecrit sur
 * mesure pour la page qui ne puisse etre installe ailleurs.
 *
 * C'est le seul argument qu'une vitrine de librairie puisse vraiment tenir.
 *
 * ## Deux surfaces, pas une de plus
 *
 * La maree du hero (three) et le ciel de la section moteur (ogl) : exactement
 * ce que l'arbitre accorde. Tout le reste est en CSS pur.
 *
 * ## Les chiffres viennent du catalogue
 *
 * Ni saisis, ni arrondis : la vitrine compte ce que le registre sert.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { CATALOGUE } from '../catalogue.generated.js'
import { Closing } from '../landing/Closing.jsx'
import { Compose } from '../landing/Compose.jsx'
import { Engine } from '../landing/Engine.jsx'
import { Gallery } from '../landing/Gallery.jsx'
import { Hero } from '../landing/Hero.jsx'
import { Numbers } from '../landing/Numbers.jsx'
import { Pillars } from '../landing/Pillars.jsx'
import { Showcase } from '../landing/Showcase.jsx'
import { Story } from '../landing/Story.jsx'

/** Combien d'entrees par categorie, comptees dans le catalogue. */
function parCategorie(): Readonly<Record<string, number>> {
  const compte: Record<string, number> = {}
  for (const entree of CATALOGUE) compte[entree.category] = (compte[entree.category] ?? 0) + 1
  return compte
}

/** La vitrine. */
export function Landing(): ReactElement {
  const counts = parCategorie()

  return (
    <div className="o-view-transition-page">
      <Hero total={CATALOGUE.length} families={Object.keys(counts).length} />
      <Numbers entries={CATALOGUE} />
      <Pillars />
      <Story />
      <Compose />
      <Showcase counts={counts} />
      <Gallery entries={CATALOGUE} />
      <Engine />
      <Closing total={CATALOGUE.length} />
    </div>
  )
}
