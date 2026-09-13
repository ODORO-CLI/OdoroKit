/**
 * Le hero : la maree, la promesse, l'installation en une ligne, et la fenetre
 * du produit qui flotte au-dessus de l'eau.
 *
 * Il suit le theme du visiteur, comme le reste de la page. La nappe lit le
 * fond du theme pour sa couleur profonde : elle se leve sur du clair aussi
 * bien que sur du sombre, et seules ses cretes gardent la teinte de marque.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ChevronDown, Sparkles } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { Link } from '@odoro-cli/libs/router'
import { buttonClasses } from '@odoro-cli/libs/ui'
import { type ReactElement } from 'react'

import { MeshStatic } from '@/odoro/background/MeshStatic.js'
import { Noise } from '@/odoro/background/Noise.js'
import { FloatGroup } from '@/odoro/effect/FloatGroup.js'
import { Magnetic } from '@/odoro/effect/Magnetic.js'
import { Parallax } from '@/odoro/effect/Parallax.js'
import { Tide } from '@/odoro/hero/Tide.js'
import { RotatingWords } from '@/odoro/text/RotatingWords.js'
import { SplitLines } from '@/odoro/text/SplitLines.js'

import { CodeBlock } from '../components/CodeBlock.jsx'

/** Proprietes du hero. */
export interface HeroProps {
  /** Nombre d'entrees au registre, compte dans le catalogue. */
  total: number
  /** Nombre de familles. */
  families: number
}

/** Les puces flottantes : quatre faits, pas quatre slogans. */
const CHIPS = [
  '0 dependance',
  'WebGL arbitre',
  'Mouvement reduit respecte',
  'Theme clair et sombre',
]

/** Ce que la fenetre du produit montre : une page faite en trois lignes. */
const WINDOW_CODE = `<section className="o-relative o-min-h-screen">
  <Aurora className="o-absolute o-inset-0" />
  <SplitReveal as="h1" by="words">
    Un site qui respire
  </SplitReveal>
  <StickyStack>...</StickyStack>
</section>`

/**
 * Une fenetre de navigateur miniature, avec une page composee dedans.
 *
 * Elle flotte au-dessus de la nappe en parallaxe : elle monte un peu moins
 * vite que la page, comme posee sur l'eau.
 */
function ProductWindow(): ReactElement {
  return (
    <Parallax distance={48} scale={0.03}>
      <div className="o-overflow-hidden o-rounded-2xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-shadow-2xl">
        <div className="o-flex o-items-center o-gap-2 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-px-4 o-py-2.5">
          <span className="o-flex o-gap-1.5" aria-hidden="true">
            <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
            <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
            <span className="o-size-2.5 o-rounded-full o-bg-zinc-300 dark:o-bg-zinc-700" />
          </span>
          <span className="o-mx-auto o-rounded-md o-bg-white dark:o-bg-zinc-950 o-px-3 o-py-1 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-500">
            odoro.dev/mon-site
          </span>
        </div>
        <div className="o-grid md:o-grid-cols-2">
          <div className="o-relative o-min-h-64 o-overflow-hidden o-bg-white dark:o-bg-zinc-950">
            <MeshStatic className="o-absolute o-inset-0 o-opacity-80" strength={0.6} blur={26} />
            <div className="o-relative o-flex o-h-full o-flex-col o-justify-center o-gap-3 o-p-8 o-text-left">
              <span className="o-font-mono o-text-xs o-text-brand-600 dark:o-text-brand-300">mon-site/src/App.tsx</span>
              <p className="o-text-2xl o-font-bold o-tracking-tight o-text-zinc-900 dark:o-text-zinc-50 o-text-balance">
                Un site qui respire
              </p>
              <p className="o-text-sm o-text-zinc-600 dark:o-text-zinc-300">
                Fond, titre anime, sections : trois entrées copiees, zéro dependance.
              </p>
              <span className="o-flex o-gap-2 o-pt-1">
                <span className="o-rounded-md o-bg-zinc-50 o-px-3 o-py-1.5 o-text-xs o-font-medium o-text-zinc-950">
                  Découvrir
                </span>
                <span className="o-rounded-md o-border-w-1 o-border-zinc-400 dark:o-border-zinc-600 o-px-3 o-py-1.5 o-text-xs o-font-medium o-text-zinc-800 dark:o-text-zinc-100">
                  Tarifs
                </span>
              </span>
            </div>
          </div>
          <div className="o-border-t md:o-border-t md:o-border-l o-border-zinc-200 dark:o-border-zinc-800 o-text-left">
            <CodeBlock lang="tsx" code={WINDOW_CODE} className="o-rounded-none o-border-none" />
          </div>
        </div>
      </div>
    </Parallax>
  )
}

/** Le hero de la vitrine. */
export function Hero({ total, families }: HeroProps): ReactElement {
  return (
    <section className="o-relative o-overflow-hidden o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50">
      <Tide
        className="o-absolute o-inset-0"
        amplitude={0.5}
        shine={1.1}
        colors={['--o-theme-bg', '--o-palette-brand-500', '--o-palette-fuchsia-400']}
      />
      {/* Un grain leger par-dessus la scene : il casse le lisse des degrades,
          qui trahit un rendu synthetique. Statique, il ne coute rien. */}
      <Noise className="o-absolute o-inset-0 o-pointer-events-none" opacity={0.07} scale={0.9} />
      <div
        aria-hidden="true"
        className="o-absolute o-inset-x-0 o-top-0 o-h-40 o-bg-gradient-to-b o-from-white dark:o-from-zinc-950 o-to-transparent o-pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="o-absolute o-inset-x-0 o-bottom-0 o-h-64 o-bg-gradient-to-t o-from-white dark:o-from-zinc-950 o-to-transparent o-pointer-events-none"
      />

      <div className="o-relative o-mx-auto o-flex o-max-w-6xl o-flex-col o-items-center o-px-6 o-pt-24 o-pb-16 o-text-center md:o-pt-32">
        <Reveal preset="fade-up" duration="slow">
          <span className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-brand-500 dark:o-border-brand-400 o-bg-brand-50 dark:o-bg-brand-950 o-px-3 o-py-1 o-text-xs o-font-medium o-text-brand-700 dark:o-text-brand-200">
            <Icon icon={Sparkles} size={14} />
            {total} entrées au registre, {families} familles
          </span>
        </Reveal>

        <SplitLines
          as="h1"
          declenchement="montage"
          stagger={110}
          delay={200}
          className="o-mt-6 o-max-w-4xl o-text-5xl o-font-extrabold o-tracking-tight o-text-balance o-leading-tight md:o-text-7xl"
        >
          Le kit front qui vous appartient.
        </SplitLines>

        <Reveal preset="fade-up" delay={700} className="o-mt-6 o-max-w-2xl">
          <p className="o-text-lg o-text-zinc-600 dark:o-text-zinc-300 o-text-pretty md:o-text-xl">
            Des{' '}
            <RotatingWords
              as="span"
              interval={2400}
              words={[
                'fonds WebGL',
                'animations de texte',
                'effets au pointeur',
                'sections entieres',
                'composants d interface',
              ]}
              className="o-font-semibold o-text-zinc-900 dark:o-text-zinc-50"
            />{' '}
            copies dans votre projet, jamais installes en dependance. Vous les lisez, vous
            les modifiez, ils sont a vous.
          </p>
        </Reveal>

        <Reveal
          preset="fade-up"
          delay={900}
          className="o-mt-8 o-flex o-flex-wrap o-items-center o-justify-center o-gap-3"
        >
          <Magnetic strength={0.3} radius={120}>
            <Link to="/docs/installation" className={`${buttonClasses({ size: 'lg' })} o-gap-2`}>
              Commencer
              <Icon icon={ArrowRight} size={16} />
            </Link>
          </Magnetic>
          <Link
            to="/docs/registry/gallery"
            className="o-inline-flex o-h-12 o-items-center o-rounded-md o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-bg-zinc-50 dark:o-bg-zinc-900 o-px-5 o-text-lg o-font-medium o-text-zinc-900 dark:o-text-zinc-50 hover:o-border-zinc-400 dark:hover:o-border-zinc-500 hover:o-bg-zinc-100 dark:hover:o-bg-zinc-800 o-transition-colors o-no-underline"
          >
            Voir la galerie
          </Link>
        </Reveal>

        <Reveal preset="fade-up" delay={1100} className="o-mt-6 o-w-full o-max-w-md o-text-left">
          <CodeBlock lang="sh" code="npm create odoro@latest mon-site" />
        </Reveal>

        <FloatGroup
          amplitude={5}
          duration={4200}
          className="o-mt-8 o-flex o-flex-wrap o-justify-center o-gap-3"
        >
          {CHIPS.map((chip) => (
            <span
              key={chip}
              className="o-rounded-full o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-px-3 o-py-1 o-text-xs o-text-zinc-500 dark:o-text-zinc-400"
            >
              {chip}
            </span>
          ))}
        </FloatGroup>

        <Reveal preset="fade-up" delay={1300} className="o-mt-16 o-w-full o-max-w-5xl">
          <ProductWindow />
        </Reveal>

        <a
          href="#modules"
          className="o-mt-10 o-flex o-flex-col o-items-center o-gap-1 o-text-xs o-text-zinc-500 dark:o-text-zinc-500 o-no-underline hover:o-text-zinc-700 dark:hover:o-text-zinc-300 o-transition-colors"
        >
          Defiler
          <Icon icon={ChevronDown} size={16} className="o-animate-bounce" />
        </a>
      </div>
    </section>
  )
}
