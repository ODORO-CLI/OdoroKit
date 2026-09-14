import { useState } from 'react'

import { Reveal, Stagger, useAnimate } from '@odoro-cli/libs/motion'
import { Button } from '@odoro-cli/libs/ui'

/** Trois arguments mis en avant. */
const FEATURES = [
  {
    title: 'Animations',
    body: "Une couche mince sur le moteur du navigateur. Les animations reduites sont respectees d'office.",
  },
  {
    title: 'Styles',
    body: 'Des tokens en source de verite, une feuille statique, aucun scan a l execution.',
  },
  {
    title: 'Interface',
    body: 'Des composants qui lisent les memes tokens que votre code : les rethemer suffit.',
  },
]

/**
 * Racine de l'application.
 *
 * Une seule page : le routeur n'a pas ete retenu a la creation. Pour en
 * ajouter un plus tard, `@odoro-cli/libs/router` est deja installe — il vient
 * avec les bibliotheques.
 */
export function App() {
  const [ref, controls] = useAnimate<HTMLSpanElement>()
  const [count, setCount] = useState(0)

  return (
    <div className="app-shell">
      <nav className="o-flex o-items-center o-gap-4 o-px-6 o-py-4 o-border-b o-border-zinc-200 dark:o-border-zinc-800">
        <span className="o-font-semibold o-text-brand-600 dark:o-text-brand-400">
          Odoro
        </span>
      </nav>

      <main className="o-mx-auto o-w-full o-max-w-3xl o-px-6 o-py-12 o-flex o-flex-col o-gap-12">
        <Reveal>
          <h1 className="o-text-4xl o-font-bold o-tracking-tight">
            Un point de depart maitrise.
          </h1>
          <p className="o-mt-4 o-text-lg o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
            Ce projet a ete genere par <code className="o-font-mono">odoro create</code>.
            Le moteur d animation et le systeme de style viennent de la meme librairie.
          </p>
        </Reveal>

        <Stagger step={80} className="o-grid o-grid-cols-1 md:o-grid-cols-3 o-gap-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-5"
            >
              <h2 className="o-font-semibold">{feature.title}</h2>
              <p className="o-mt-2 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                {feature.body}
              </p>
            </article>
          ))}
        </Stagger>

        <div className="o-flex o-items-center o-gap-4">
          <Button
            onClick={() => {
              setCount((value) => value + 1)
              void controls.play(
                [
                  { transform: 'translateY(0)' },
                  { transform: 'translateY(-0.4rem)' },
                  { transform: 'translateY(0)' },
                ],
                { duration: 'fast', easing: 'emphasized' },
              )
            }}
          >
            Compter
          </Button>
          <span ref={ref} className="o-inline-block o-text-lg o-tabular-nums">
            {count}
          </span>
        </div>
      </main>

      <footer className="o-px-6 o-py-6 o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-border-t o-border-zinc-200 dark:o-border-zinc-800">
        Construit avec Odoro.
      </footer>
    </div>
  )
}
