import { useState } from 'react'

import {
  Animate,
  Reveal,
  Stagger,
  useAnimate,
  usePrefersReducedMotion,
  usePresence,
} from '@odoro/libs/motion'
import { Button } from '@odoro/libs/ui'

/** Demonstration de `usePresence`, qui retarde le demontage. */
function Presence() {
  const [visible, setVisible] = useState(true)
  const { ref, isMounted, status } = usePresence<HTMLDivElement>(visible)

  return (
    <div className="o-flex o-flex-col o-gap-3">
      <div className="o-flex o-items-center o-gap-3">
        <Button size="sm" onClick={() => setVisible((value) => !value)}>
          {visible ? 'Masquer' : 'Afficher'}
        </Button>
        <code className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-font-mono">
          {isMounted ? status : 'demonte'}
        </code>
      </div>
      {isMounted ? (
        <div
          ref={ref}
          className="o-rounded-md o-border-w-1 o-border-brand-200 dark:o-border-brand-800 o-bg-brand-50 dark:o-bg-brand-950 o-p-4"
        >
          Cet element joue son animation de sortie avant d&rsquo;etre retire de
          l&rsquo;arbre.
        </div>
      ) : null}
    </div>
  )
}

/** Page consacree au moteur d'animation. */
export function Mouvement() {
  const [ref, controls] = useAnimate<HTMLDivElement>()
  const [pulse, setPulse] = useState(0)
  const reduced = usePrefersReducedMotion()

  return (
    <div className="o-flex o-flex-col o-gap-10">
      <header className="o-flex o-flex-col o-gap-2">
        <h1 className="o-text-2xl o-font-bold">Mouvement</h1>
        <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Preference systeme detectee :{' '}
          <strong>{reduced ? 'animations reduites' : 'animations completes'}</strong>.
          Toutes les demonstrations ci-dessous en tiennent compte sans code
          supplementaire.
        </p>
      </header>

      <section className="o-flex o-flex-col o-gap-3">
        <h2 className="o-text-xl o-font-semibold">useAnimate</h2>
        <div className="o-flex o-items-center o-gap-4">
          <Button
            size="sm"
            onClick={() =>
              void controls.play(
                [
                  { transform: 'rotate(0deg) scale(1)' },
                  { transform: 'rotate(180deg) scale(1.2)' },
                  { transform: 'rotate(360deg) scale(1)' },
                ],
                { duration: 'slow', easing: 'emphasized' },
              )
            }
          >
            Jouer
          </Button>
          <Button size="sm" tone="secondary" onClick={() => controls.cancel()}>
            Annuler
          </Button>
          <div
            ref={ref}
            className="o-size-12 o-rounded-md o-bg-brand-600 dark:o-bg-brand-400"
            aria-hidden="true"
          />
        </div>
      </section>

      <section className="o-flex o-flex-col o-gap-3">
        <h2 className="o-text-xl o-font-semibold">Animate</h2>
        <div className="o-flex o-items-center o-gap-4">
          <Button size="sm" onClick={() => setPulse((value) => value + 1)}>
            Rejouer
          </Button>
          <Animate
            from={{ opacity: 0, transform: 'translateX(-1rem)' }}
            trigger={pulse}
            duration="slow"
            className="o-rounded-md o-bg-zinc-100 dark:o-bg-zinc-950 o-px-4 o-py-2"
          >
            Rejoue a chaque changement de declencheur.
          </Animate>
        </div>
      </section>

      <section className="o-flex o-flex-col o-gap-3">
        <h2 className="o-text-xl o-font-semibold">usePresence</h2>
        <Presence />
      </section>

      <section className="o-flex o-flex-col o-gap-3">
        <h2 className="o-text-xl o-font-semibold">Reveal et Stagger</h2>
        <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Faites defiler : chaque carte apparait a son entree dans le viewport.
        </p>
        <Stagger step={70} className="o-grid o-grid-cols-1 md:o-grid-cols-3 o-gap-4">
          {Array.from({ length: 9 }, (_, index) => (
            <div
              key={index}
              className="o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-p-6 o-text-center o-tabular-nums"
            >
              {index + 1}
            </div>
          ))}
        </Stagger>
        <Reveal from={{ opacity: 0, transform: 'scale(0.9)' }} duration="slower">
          <p className="o-mt-6 o-text-zinc-500 dark:o-text-zinc-400">
            Dernier bloc, revele avec sa propre courbe.
          </p>
        </Reveal>
      </section>
    </div>
  )
}
