/**
 * Le bandeau de chiffres, juste sous le hero.
 *
 * Tous viennent du catalogue : une vitrine qui arrondit ment au premier ajout,
 * et personne ne s'en apercoit parce que personne ne recompte.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { StatBand } from '@/odoro/section/StatBand.js'

import type { CatalogueEntry } from '../catalogue.generated.js'

/** Proprietes du bandeau. */
export interface NumbersProps {
  /** Le catalogue entier. */
  entries: readonly CatalogueEntry[]
}

/** Le bandeau de chiffres. */
export function Numbers({ entries }: NumbersProps): ReactElement {
  const families = new Set(entries.map((entry) => entry.category)).size
  const light = entries.filter((entry) => entry.perf.tier === 'light').length
  const pure = entries.filter((entry) => entry.dependencies.length === 0).length

  return (
    <section className="o-border-b o-border-zinc-200 dark:o-border-zinc-800">
      <div className="o-mx-auto o-max-w-6xl o-px-6 o-py-12">
        <StatBand
          locale="fr-FR"
          stats={[
            { value: entries.length, label: 'entrees au registre' },
            { value: families, label: 'familles' },
            { value: light, label: 'sans contexte graphique' },
            { value: pure, label: 'sans aucune dependance' },
          ]}
        />
      </div>
    </section>
  )
}
