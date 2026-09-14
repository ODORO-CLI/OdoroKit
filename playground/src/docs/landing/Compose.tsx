/**
 * Composez : trois onglets, trois pieces, le code et le rendu cote a cote.
 *
 * Le rendu n'est pas une image : c'est le composant, monte dans la page. Ce
 * qu'on lit a gauche est ce qu'on voit a droite.
 *
 * @module
 */

import { Reveal } from '@odoro-cli/libs/motion'
import { Tabs } from '@odoro-cli/libs/ui'
import { type ReactElement, type ReactNode } from 'react'

import { RadialGlow } from '@/odoro/background/RadialGlow.js'
import { SpotGrid } from '@/odoro/background/SpotGrid.js'
import { Stripes } from '@/odoro/background/Stripes.js'
import { RevealGrid } from '@/odoro/section/RevealGrid.js'
import { HighlightSweep } from '@/odoro/text/HighlightSweep.js'
import { SplitReveal } from '@/odoro/text/SplitReveal.js'
import { TiltCard } from '@/odoro/ui/TiltCard.js'

import { CodeBlock } from '../components/CodeBlock.jsx'

/** Un exemple : son code, son rendu. */
interface Example {
  readonly id: string
  readonly label: string
  readonly code: string
  readonly render: ReactNode
}

const EXAMPLES: readonly Example[] = [
  {
    id: 'fond',
    label: 'Un fond et un titre',
    code: `<section className="o-relative o-rounded-2xl o-overflow-hidden">
  <RadialGlow className="o-absolute o-inset-0" y={0.3} />
  <SplitReveal as="h2" by="words" className="o-relative">
    Un titre révèle mot a mot
  </SplitReveal>
</section>`,
    render: (
      <div className="o-relative o-flex o-min-h-80 o-flex-col o-justify-center o-overflow-hidden o-rounded-2xl o-bg-white dark:o-bg-zinc-950 o-p-8 o-text-zinc-900 dark:o-text-zinc-50">
        <RadialGlow className="o-absolute o-inset-0" y={0.3} strength={0.5} />
        <SplitReveal
          as="h2"
          by="words"
          className="o-relative o-text-3xl o-font-bold o-tracking-tight"
        >
          Un titre révèle mot a mot
        </SplitReveal>
        <p className="o-relative o-mt-3 o-max-w-sm o-text-sm o-text-zinc-600 dark:o-text-zinc-300">
          Deux entrées, aucune configuration : le fond lit la palette, le titre lit le
          texte.
        </p>
      </div>
    ),
  },
  {
    id: 'cartes',
    label: 'Une grille qui se révèle',
    code: `<RevealGrid columns={3} stagger={90}>
  {items.map((item) => (
    <TiltCard key={item} tilt={10}>
      <article className="o-rounded-xl o-p-5">{item}</article>
    </TiltCard>
  ))}
</RevealGrid>`,
    render: (
      <div className="o-relative o-min-h-80 o-overflow-hidden o-rounded-2xl o-bg-white dark:o-bg-zinc-950 o-p-8 o-text-zinc-900 dark:o-text-zinc-50">
        <SpotGrid
          className="o-absolute o-inset-0 o-opacity-60"
          gap={20}
          dot={2}
          vignette={0.6}
        />
        <RevealGrid columns={3} stagger={90} className="o-relative">
          {['Fonds', 'Texte', 'Effets', 'Sections', 'Images', 'Rideaux'].map((item) => (
            <TiltCard key={item} tilt={10} glare={0.25}>
              <article className="o-rounded-xl o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-4 o-text-sm o-font-medium">
                {item}
              </article>
            </TiltCard>
          ))}
        </RevealGrid>
      </div>
    ),
  },
  {
    id: 'accent',
    label: 'Un mot souligne',
    code: `<h2>
  Une seule source :{' '}
  <HighlightSweep as="span" declenchement="vue">
    les tokens
  </HighlightSweep>
</h2>`,
    render: (
      <div className="o-relative o-flex o-min-h-80 o-flex-col o-justify-center o-overflow-hidden o-rounded-2xl o-bg-white dark:o-bg-zinc-950 o-p-8 o-text-zinc-900 dark:o-text-zinc-50">
        <Stripes
          className="o-absolute o-inset-0 o-opacity-30"
          width={6}
          gap={28}
          angle={45}
        />
        <h2 className="o-relative o-text-3xl o-font-bold o-tracking-tight o-text-balance">
          Une seule source :{' '}
          <HighlightSweep as="span" declenchement="vue" thickness={0.5}>
            les tokens
          </HighlightSweep>
        </h2>
        <p className="o-relative o-mt-3 o-max-w-sm o-text-sm o-text-zinc-600 dark:o-text-zinc-300">
          Le surligneur passe quand le titre entre dans le champ, puis reste.
        </p>
      </div>
    ),
  },
]

/** La section Composez. */
export function Compose(): ReactElement {
  return (
    <section className="o-mx-auto o-max-w-6xl o-px-6 o-py-24">
      <Reveal preset="fade-up" className="o-max-w-2xl">
        <p className="o-text-xs o-font-semibold o-uppercase o-tracking-wider o-text-brand-600 dark:o-text-brand-400">
          Composez
        </p>
        <h2 className="o-mt-3 o-text-3xl o-font-bold o-tracking-tight o-text-balance md:o-text-5xl">
          Le code à gauche, la page à droite. Rien entre les deux.
        </h2>
      </Reveal>

      <Reveal preset="fade-up" delay={150} className="o-mt-10">
        <Tabs
          label="Exemples de composition"
          items={EXAMPLES.map((example) => ({
            id: example.id,
            label: example.label,
            content: (
              <div className="o-grid o-gap-6 lg:o-grid-cols-2 lg:o-items-stretch">
                <CodeBlock lang="tsx" code={example.code} />
                {example.render}
              </div>
            ),
          }))}
        />
      </Reveal>
    </section>
  )
}
