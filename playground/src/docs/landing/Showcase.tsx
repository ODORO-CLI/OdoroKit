/**
 * Les familles du registre, en pile collante.
 *
 * Chaque carte se fige sous la barre, puis se reduit quand la suivante la
 * recouvre : quatre familles, quatre fonds, quatre facons d'animer un titre.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight } from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import { Link } from '@odoro-cli/libs/router'
import { type ReactElement, type ReactNode } from 'react'

import { Blueprint } from '@/odoro/background/Blueprint.js'
import { MeshStatic } from '@/odoro/background/MeshStatic.js'
import { SpotGrid } from '@/odoro/background/SpotGrid.js'
import { Stripes } from '@/odoro/background/Stripes.js'
import { StickyStack } from '@/odoro/section/StickyStack.js'
import { GradientFlow } from '@/odoro/text/GradientFlow.js'
import { HighlightSweep } from '@/odoro/text/HighlightSweep.js'
import { TiltCard } from '@/odoro/ui/TiltCard.js'

/** Proprietes de la vitrine. */
export interface ShowcaseProps {
  /** Compte par categorie, lu dans le catalogue. */
  counts: Readonly<Record<string, number>>
}

/** Une carte de la pile. */
function Card({
  eyebrow,
  title,
  text,
  to,
  background,
  aside,
}: {
  eyebrow: string
  title: ReactNode
  text: string
  to: string
  background: ReactNode
  aside?: ReactNode
}): ReactElement {
  return (
    <div className="o-relative o-overflow-hidden o-rounded-2xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50 o-shadow-xl">
      {background}
      <div className="o-relative o-grid o-gap-8 o-p-8 md:o-p-12 lg:o-grid-cols-2 lg:o-items-center">
        <div className="o-flex o-flex-col o-gap-4">
          <span className="o-font-mono o-text-xs o-text-brand-600 dark:o-text-brand-300">
            {eyebrow}
          </span>
          <h3 className="o-text-3xl md:o-text-4xl o-font-bold o-tracking-tight o-text-balance">
            {title}
          </h3>
          <p className="o-max-w-md o-text-zinc-600 dark:o-text-zinc-300 o-text-pretty">
            {text}
          </p>
          <Link
            to={to}
            className="o-inline-flex o-items-center o-gap-1 o-text-sm o-font-medium o-text-brand-600 dark:o-text-brand-300 o-no-underline hover:o-underline o-underline-offset-4"
          >
            Parcourir
            <Icon icon={ArrowRight} size={14} />
          </Link>
        </div>
        {aside === undefined ? null : (
          <div className="o-flex o-items-center o-justify-center">{aside}</div>
        )}
      </div>
    </div>
  )
}

/** Un lien-pastille vers une entree. */
function Chip({ to, label }: { to: string; label: string }): ReactElement {
  return (
    <Link
      to={to}
      className="o-rounded-lg o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-bg-zinc-50 dark:o-bg-zinc-900 o-px-3 o-py-2 o-text-center o-font-mono o-text-xs o-text-zinc-600 dark:o-text-zinc-300 o-no-underline hover:o-border-brand-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50 o-transition-colors"
    >
      {label}
    </Link>
  )
}

/** La pile des familles. */
export function Showcase({ counts }: ShowcaseProps): ReactElement {
  const n = (category: string): number => counts[category] ?? 0

  return (
    <section className="o-mx-auto o-max-w-6xl o-px-6 o-py-24">
      <Reveal preset="fade-up" className="o-mb-12 o-max-w-2xl">
        <p className="o-text-xs o-font-semibold o-uppercase o-tracking-wider o-text-brand-600 dark:o-text-brand-400">
          Le registre
        </p>
        <h2 className="o-mt-3 o-text-3xl md:o-text-5xl o-font-bold o-tracking-tight o-text-balance">
          Des familles entières, prêtes a être copiees.
        </h2>
      </Reveal>

      <StickyStack offset={88} gap={24} shrink={0.04}>
        <Card
          eyebrow={`${n('background')} fonds`}
          title={
            <GradientFlow as="span" speed={5000} angle={100}>
              Des fonds qui prennent votre palette
            </GradientFlow>
          }
          text="Statiques en CSS pur ou animes en shader, tous colores par les tokens du projet. Certains reagissent au curseur : torche, ondes de clic, sillage."
          to="/docs/backgrounds"
          background={
            <MeshStatic
              className="o-absolute o-inset-0 o-opacity-70"
              strength={0.55}
              blur={30}
            />
          }
          aside={
            <div className="o-grid o-grid-cols-3 o-gap-3">
              {['aurora', 'warp', 'torch', 'fireflies', 'nebula', 'ink'].map((slug) => (
                <Chip key={slug} to={`/docs/backgrounds/${slug}`} label={slug} />
              ))}
            </div>
          }
        />
        <Card
          eyebrow={`${n('text')} animations de texte`}
          title={
            <>
              Un titre qui{' '}
              <HighlightSweep as="span" declenchement="vue" thickness={0.5}>
                accroche
              </HighlightSweep>
              , et qui reste copiable
            </>
          }
          text="Ce qui bouge est un calque ; le texte d origine reste dans la page, lisible aux lecteurs d ecran et selectionnable a la souris."
          to="/docs/text"
          background={
            <Blueprint
              className="o-absolute o-inset-0 o-opacity-60"
              cell={26}
              strength={0.35}
            />
          }
          aside={
            <ul className="o-flex o-flex-col o-gap-2 o-font-mono o-text-sm o-text-zinc-600 dark:o-text-zinc-300">
              {[
                'split-reveal',
                'decode-text',
                'counter-roll',
                'letter-swap',
                'glitch-text',
              ].map((slug) => (
                <li key={slug} className="o-flex o-items-center o-gap-2">
                  <span className="o-size-1.5 o-rounded-full o-bg-brand-400" />
                  {slug}
                </li>
              ))}
            </ul>
          }
        />
        <Card
          eyebrow={`${n('effect') + n('ui')} effets et pieces d interface`}
          title="Ce qui répond au pointeur, sans re-rendre l’arbre"
          text="Cartes inclinees, lueurs, aimants, etincelles au clic, faisceaux entre elements : des variables CSS ecrites depuis la boucle, jamais un setState par image."
          to="/docs/effects/magnetic"
          background={
            <SpotGrid
              className="o-absolute o-inset-0 o-opacity-70"
              gap={22}
              dot={2}
              vignette={0.5}
            />
          }
          aside={
            <TiltCard tilt={12} glare={0.35} className="o-w-64">
              <div className="o-rounded-xl o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-6">
                <p className="o-text-xs o-uppercase o-tracking-wider o-text-zinc-500">
                  tilt-card
                </p>
                <p className="o-mt-2 o-text-lg o-font-semibold">Inclinez-moi</p>
                <p className="o-mt-1 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                  Le reflet suit le pointeur, la carte s’incline.
                </p>
              </div>
            </TiltCard>
          }
        />
        <Card
          eyebrow={`${n('section')} sections et ${n('hero')} heros`}
          title="Des blocs de page entiers, composables"
          text="Grilles revelees, piles collantes, etapes au defilement, tarifs, FAQ, pied de page cinematique — cette page en est faite."
          to="/docs/sections"
          background={
            <Stripes
              className="o-absolute o-inset-0 o-opacity-40"
              width={8}
              gap={26}
              angle={45}
            />
          }
          aside={
            <div className="o-grid o-grid-cols-2 o-gap-3">
              {[
                'sticky-stack',
                'scroll-steps',
                'reveal-grid',
                'pricing-tiers',
                'faq',
                'cinematic-footer',
              ].map((slug) => (
                <Chip key={slug} to={`/docs/sections/${slug}`} label={slug} />
              ))}
            </div>
          }
        />
      </StickyStack>
    </section>
  )
}
