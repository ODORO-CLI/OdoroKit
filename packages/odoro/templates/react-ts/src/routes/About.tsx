/**
 * Une seconde page, pour montrer le routeur a l'oeuvre.
 *
 * @module
 */

import { Reveal } from '@odoro-cli/libs/motion'
import type { ReactElement } from 'react'

/** Ce que le projet embarque, tel qu'il a ete cree. */
const REPERES: readonly { readonly cle: string; readonly valeur: string }[] = [
  { cle: 'Moteur', valeur: 'odoro — serveur de developpement et compilation' },
  { cle: 'Styles', valeur: '@odoro-cli/libs — jetons, utilitaires, composants' },
  { cle: 'Registre', valeur: 'register.odoro.dev — copie dans votre projet' },
]

/** Page « A propos ». */
export function About(): ReactElement {
  return (
    <section className="o-px-6 o-py-24">
      <div className="o-mx-auto o-w-full o-max-w-3xl">
        <Reveal>
          <h1 className="o-text-4xl o-font-bold o-tracking-tight">A propos</h1>
          <p className="o-mt-4 o-text-zinc-500 dark:o-text-zinc-400">
            Cette page existe pour montrer le routeur : la navigation ne recharge
            rien, et la transition est celle du navigateur.
          </p>

          <dl className="o-mt-10 o-divide-y o-divide-zinc-200 dark:o-divide-zinc-800 o-border-t o-border-zinc-200 dark:o-border-zinc-800">
            {REPERES.map((repere) => (
              <div key={repere.cle} className="o-flex o-flex-col md:o-flex-row o-gap-1 md:o-gap-6 o-py-4">
                <dt className="o-w-32 o-shrink-0 o-text-sm o-font-medium">{repere.cle}</dt>
                <dd className="o-m-0 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                  {repere.valeur}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
