/**
 * Le recit au defilement : de la commande au site livre, en quatre etapes.
 *
 * Le media reste colle et change au rythme du defilement. C'est la section
 * qui prouve, sans le dire, ce que le registre sait faire d'une page.
 *
 * @module
 */

import { Reveal } from '@odoro-cli/libs/motion'
import { type ReactElement } from 'react'

import { ScrollSteps } from '@/odoro/section/ScrollSteps.js'

import { CodeBlock } from '../components/CodeBlock.jsx'

/** Chaque etape : un titre, une phrase, l'extrait qu'elle montre. */
const STEPS = [
  {
    title: 'Creez le projet',
    body: (
      <p>
        Une commande, un projet React complet servi par l engine odoro : rechargement a
        chaud, build, zero configuration.
      </p>
    ),
    lang: 'sh',
    code: `npm create odoro@latest mon-site
cd mon-site
npm run dev`,
  },
  {
    title: 'Ajoutez ce qui vous plait',
    body: (
      <p>
        Chaque entree du registre est copiee dans votre projet avec ses dependances — des
        fichiers, pas un paquet.
      </p>
    ),
    lang: 'sh',
    code: `odoro add aurora split-reveal sticky-stack

+ src/odoro/background/Aurora.tsx
+ src/odoro/text/SplitReveal.tsx
+ src/odoro/section/StickyStack.tsx
+ src/odoro/hooks/useInView.ts`,
  },
  {
    title: 'Composez',
    body: (
      <p>
        Les pieces s emboitent : un fond, une revelation de titre, une section qui defile
        — et vous lisez chaque ligne.
      </p>
    ),
    lang: 'tsx',
    code: `<section className="o-relative o-min-h-screen">
  <Aurora className="o-absolute o-inset-0" />
  <SplitReveal as="h1" by="words" className="o-relative">
    Un site qui respire
  </SplitReveal>
</section>`,
  },
  {
    title: 'Livrez',
    body: (
      <p>
        Le build elague la feuille de style aux seules classes employees, et chaque fond
        garde son repli statique pour les navigateurs sans WebGL.
      </p>
    ),
    lang: 'sh',
    code: `npm run build

  generation styles.css  2,9 Mo -> 41 Ko
  dist/ pret en 1,8 s`,
  },
] as const

/** Le recit au defilement. */
export function Story(): ReactElement {
  return (
    <section className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900">
      <div className="o-mx-auto o-max-w-6xl o-px-6 o-py-24">
        <Reveal preset="fade-up" className="o-max-w-2xl">
          <p className="o-text-xs o-font-semibold o-uppercase o-tracking-wider o-text-brand-600 dark:o-text-brand-400">
            De la commande au site
          </p>
          <h2 className="o-mt-3 o-text-3xl md:o-text-5xl o-font-bold o-tracking-tight o-text-balance">
            Quatre etapes, et le defilement les raconte.
          </h2>
        </Reveal>

        <div className="o-mt-12">
          <ScrollSteps
            label="De la commande au site livre"
            steps={STEPS.map((step) => ({ title: step.title, body: step.body }))}
            render={(index) => {
              const step = STEPS[Math.min(index, STEPS.length - 1)] ?? STEPS[0]
              return (
                <div className="o-flex o-flex-col o-gap-3">
                  <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                    Etape {index + 1} / {STEPS.length}
                  </span>
                  <CodeBlock key={index} lang={step.lang} code={step.code} />
                </div>
              )
            }}
          />
        </div>
      </div>
    </section>
  )
}
