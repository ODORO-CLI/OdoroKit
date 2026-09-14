/**
 * La cloture : une commande, et la porte de sortie vers la documentation.
 *
 * Une page d'accueil qui s'arrete sur sa derniere carte laisse le visiteur
 * sans geste suivant. Celle-ci se termine par ce qu'il y a a taper.
 *
 * @module
 */

import { Reveal } from '@odoro-cli/libs/motion'
import { buttonClasses } from '@odoro-cli/libs/ui'
import { useState, type ReactElement } from 'react'

/** La commande que l'on copie le plus souvent. */
const COMMANDE = 'odoro add text/count-up'

/** La section de cloture. */
export function Cloture(): ReactElement {
  const [copie, setCopie] = useState(false)

  return (
    <section className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-24">
      <div className="o-mx-auto o-w-full o-max-w-3xl o-text-center">
        <Reveal>
          <h2 className="o-text-3xl o-font-bold o-tracking-tight md:o-text-4xl">
            Ajoutez un composant, sans quitter le terminal.
          </h2>
          <p className="o-mx-auto o-mt-4 o-max-w-prose o-text-zinc-500 dark:o-text-zinc-400">
            Le registre copie le code dans votre projet. Il vous appartient : on le
            lit, on le modifie, il ne se met pas a jour dans votre dos.
          </p>

          <div className="o-mx-auto o-mt-8 o-flex o-max-w-md o-items-center o-gap-2 o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-2 o-pl-4">
            <code className="o-flex-1 o-text-left o-font-mono o-text-sm">{COMMANDE}</code>
            <button
              type="button"
              className={buttonClasses({ tone: 'ghost', size: 'sm' })}
              onClick={() => {
                // Le presse-papiers peut etre refuse — hors contexte sur, ou
                // permission retiree. L'echec ne doit pas casser la page : le
                // libelle ne change simplement pas.
                void navigator.clipboard
                  ?.writeText(COMMANDE)
                  .then(() => {
                    setCopie(true)
                    setTimeout(() => {
                      setCopie(false)
                    }, 1600)
                  })
                  .catch(() => undefined)
              }}
            >
              {copie ? 'Copie' : 'Copier'}
            </button>
          </div>

          <a
            href="https://odoro.dev/docs/registry"
            target="_blank"
            rel="noreferrer"
            className="o-mt-6 o-inline-block o-text-sm o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-brand-500"
          >
            Parcourir le catalogue
          </a>
        </Reveal>
      </div>
    </section>
  )
}
