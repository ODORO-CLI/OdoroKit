import { useState } from 'react'

import { Reveal, Stagger, useAnimate } from 'odoro-libs/motion'
import { Link } from 'odoro-libs/router'
import { Button } from 'odoro-libs/ui'

/** Trois arguments mis en avant sur la page d'accueil. */
const FEATURES = [
  {
    title: 'Routeur',
    body: 'Segments dynamiques, routes imbriquees, chargement paresseux et transitions de page.',
  },
  {
    title: 'Animations',
    body: "Une couche mince sur le moteur du navigateur. Les animations reduites sont respectees d'office.",
  },
  {
    title: 'Styles',
    body: 'Des tokens en source de verite, une feuille statique, aucun scan a l execution.',
  },
]

/** Page d'accueil. */
export function Home() {
  const [ref, controls] = useAnimate<HTMLSpanElement>()
  const [count, setCount] = useState(0)

  return (
    <div className="o-flex o-flex-col o-gap-12">
      <Reveal>
        <h1 className="o-text-4xl o-font-bold o-tracking-tight">
          Un point de depart maitrise.
        </h1>
        <p className="o-mt-4 o-text-lg o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Ce projet a ete genere par <code className="o-font-mono">odoro create</code>. Le
          routeur, le moteur d animation et le systeme de style viennent tous de la meme
          librairie.
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
        <Link to="/a-propos" className="o-text-sm">
          En savoir plus
        </Link>
      </div>
    </div>
  )
}
