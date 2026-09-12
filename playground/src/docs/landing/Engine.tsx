/**
 * Le moteur : une boucle, des surfaces arbitrees, un mouvement respecte.
 *
 * C'est la seconde — et derniere — surface WebGL de la page : un ciel
 * d'etoiles en shader, sous le seul argument que la vitrine fait au sujet du
 * moteur. Deux surfaces pour toute la page, c'est exactement ce que l'arbitre
 * accorde.
 *
 * @module
 */

import { Icon, type IconData } from '@odoro-cli/icons'
import { Cpu, Layers, Shield } from '@odoro-cli/icons/filaire'
import { Reveal, Stagger } from '@odoro-cli/libs/motion'
import { Link } from '@odoro-cli/libs/router'
import { type ReactElement } from 'react'

import { Stars } from '@/odoro/background/Stars.js'
import { BeamConnect } from '@/odoro/effect/BeamConnect.js'

/** Un argument. */
interface Point {
  readonly icon: IconData
  readonly title: string
  readonly text: string
}

const POINTS: readonly Point[] = [
  {
    icon: Cpu,
    title: 'Une boucle pour toute la page',
    text: 'Chaque animation s abonne a la meme horloge, avec une priorite : les entrees, puis les mises a jour, puis le rendu. Aucun requestAnimationFrame concurrent.',
  },
  {
    icon: Layers,
    title: 'Des surfaces comptees',
    text: 'Un contexte WebGL par backend, pas plus. La troisieme demande recoit un refus et affiche son repli — jamais un ecran noir.',
  },
  {
    icon: Shield,
    title: 'Un mouvement qui se respecte',
    text: 'Preference systeme, qualite auto-degradee, rendu suspendu hors ecran : le moteur decide, les composants suivent.',
  },
]

/** La section moteur. */
export function Engine(): ReactElement {
  return (
    <section className="o-relative o-overflow-hidden o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50">
      <Stars className="o-absolute o-inset-0" speed={0.4} density={1.1} twinkle={0.8} />
      <div
        aria-hidden="true"
        className="o-absolute o-inset-0 o-bg-gradient-to-b o-from-white dark:o-from-zinc-950 o-via-transparent o-to-white dark:o-to-zinc-950 o-pointer-events-none"
      />

      <div className="o-relative o-mx-auto o-grid o-max-w-6xl o-gap-12 o-px-6 o-py-24 lg:o-grid-cols-2 lg:o-items-center">
        <div>
          <Reveal preset="fade-up">
            <p className="o-text-xs o-font-semibold o-uppercase o-tracking-wider o-text-brand-600 dark:o-text-brand-300">
              @odoro-cli/engine
            </p>
            <h2 className="o-mt-3 o-text-3xl md:o-text-5xl o-font-bold o-tracking-tight o-text-balance">
              Un moteur qui arbitre, pas une librairie qui espere.
            </h2>
          </Reveal>
          <Stagger preset="fade-up" step={100} className="o-mt-8 o-flex o-flex-col o-gap-6">
            {POINTS.map((point) => (
              <div key={point.title} className="o-flex o-gap-4">
                <span className="o-inline-flex o-size-10 o-shrink-0 o-items-center o-justify-center o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-text-brand-600 dark:o-text-brand-300">
                  <Icon icon={point.icon} size={18} />
                </span>
                <div>
                  <h3 className="o-font-semibold">{point.title}</h3>
                  <p className="o-mt-1 o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-text-pretty">{point.text}</p>
                </div>
              </div>
            ))}
          </Stagger>
          <Reveal preset="fade-up" delay={400} className="o-mt-8">
            <Link
              to="/docs/moteur"
              className="o-inline-flex o-h-11 o-items-center o-rounded-md o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-bg-zinc-50 dark:o-bg-zinc-900 o-px-5 o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50 hover:o-border-zinc-400 dark:hover:o-border-zinc-500 o-transition-colors o-no-underline"
            >
              Comprendre le moteur
            </Link>
          </Reveal>
        </div>

        <Reveal preset="scale" delay={200}>
          <BeamConnect
            curvature={48}
            speed={2600}
            thickness={2}
            className="o-flex o-min-h-72 o-flex-col o-justify-between o-gap-16 o-rounded-2xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-8"
          >
            <div
              data-beam="from"
              className="o-self-start o-rounded-xl o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-bg-white dark:o-bg-zinc-950 o-p-5"
            >
              <p className="o-font-mono o-text-xs o-text-brand-600 dark:o-text-brand-300">clock.subscribe</p>
              <p className="o-mt-1 o-text-sm o-font-semibold">Horloge du moteur</p>
              <p className="o-mt-1 o-text-xs o-text-zinc-500 dark:o-text-zinc-400">entrees, mises a jour, rendu</p>
            </div>
            <div
              data-beam="to"
              className="o-self-end o-rounded-xl o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-bg-white dark:o-bg-zinc-950 o-p-5"
            >
              <p className="o-font-mono o-text-xs o-text-brand-600 dark:o-text-brand-300">surfaceManager.acquire</p>
              <p className="o-mt-1 o-text-sm o-font-semibold">Surface WebGL arbitree</p>
              <p className="o-mt-1 o-text-xs o-text-zinc-500 dark:o-text-zinc-400">ogl, three, refus = repli</p>
            </div>
          </BeamConnect>
        </Reveal>
      </div>
    </section>
  )
}
