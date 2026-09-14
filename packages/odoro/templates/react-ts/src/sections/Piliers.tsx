/**
 * Trois piliers : ce que le projet a deja sous la main.
 *
 * Les cartes s'ecrivent avec la meme grammaire que sur odoro.dev — bordure
 * fine, coin arrondi, titre serre, phrase en gris — pour qu'ajouter une section
 * plus tard ne demande pas d'inventer un style.
 *
 * @module
 */

import { Stagger } from '@odoro-cli/libs/motion'
import type { ReactElement } from 'react'

/** Un pilier : un numero, un titre, une phrase. */
interface Pilier {
  readonly titre: string
  readonly texte: string
}

const PILIERS: readonly Pilier[] = [
  {
    titre: 'Routeur',
    texte:
      'Segments dynamiques, routes imbriquees, chargement paresseux et transitions de page.',
  },
  {
    titre: 'Animations',
    texte:
      "Une couche mince sur le moteur du navigateur. Le mouvement reduit est respecte d'office.",
  },
  {
    titre: 'Styles',
    texte:
      'Des jetons en source de verite, une feuille statique, aucun scan a l execution.',
  },
]

/** La section des piliers. */
export function Piliers(): ReactElement {
  return (
    <section id="piliers" className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-20">
      <div className="o-mx-auto o-w-full o-max-w-5xl">
        <h2 className="o-text-sm o-font-semibold o-uppercase o-tracking-widest o-text-zinc-400">
          Ce qui est deja la
        </h2>

        <Stagger step={90} className="o-mt-8 o-grid o-gap-4 md:o-grid-cols-3">
          {PILIERS.map((pilier, index) => (
            <article
              key={pilier.titre}
              className="o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-6"
            >
              <span className="o-font-mono o-text-xs o-text-brand-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="o-mt-3 o-text-lg o-font-semibold o-tracking-tight">
                {pilier.titre}
              </h3>
              <p className="o-mt-2 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                {pilier.texte}
              </p>
            </article>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
