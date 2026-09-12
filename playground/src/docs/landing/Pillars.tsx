/**
 * Les six piliers, en grille bento.
 *
 * Chaque carte porte un vrai fond du registre en vitrine — un fond statique,
 * en CSS pur, parce que six surfaces WebGL au-dessus de la ligne de
 * flottaison seraient exactement ce que le registre interdit.
 *
 * @module
 */

import { Icon, type IconData } from '@odoro-cli/icons'
import { ArrowRight, Cpu, Package, Palette, Route, Shapes, Zap } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { Link } from '@odoro-cli/libs/router'
import { type ReactElement, type ReactNode } from 'react'

import { Blueprint } from '@/odoro/background/Blueprint.js'
import { Crosshatch } from '@/odoro/background/Crosshatch.js'
import { GraphPaper } from '@/odoro/background/GraphPaper.js'
import { MeshStatic } from '@/odoro/background/MeshStatic.js'
import { Rings } from '@/odoro/background/Rings.js'
import { SpotGrid } from '@/odoro/background/SpotGrid.js'
import { Spotlight } from '@/odoro/effect/Spotlight.js'

/** Un pilier. */
interface Pillar {
  readonly title: string
  readonly module: string
  readonly text: string
  readonly to: string
  readonly icon: IconData
  readonly visual: ReactNode
  readonly wide?: boolean
}

const PILLARS: readonly Pillar[] = [
  {
    title: 'Un systeme de style genere',
    module: '@odoro-cli/libs/styles',
    text: 'Des tokens OKLCH, une feuille produite a la construction pour les seules classes que vous employez. Responsive, theme sombre, surlignage, degrades, transforms — tout derive d une source.',
    to: '/docs/styles',
    icon: Palette,
    visual: <GraphPaper className="o-absolute o-inset-0" size={10} strength={0.35} />,
  },
  {
    title: 'Un moteur d animation',
    module: '@odoro-cli/libs/motion',
    text: 'Presets, revelations au defilement, sorties animees — sur le fil de composition du navigateur, jamais dans une boucle JavaScript.',
    to: '/docs/motion',
    icon: Zap,
    visual: <Rings className="o-absolute o-inset-0" spacing={22} thickness={1} x={0.8} y={0.2} />,
  },
  {
    title: 'Des composants accessibles',
    module: '@odoro-cli/libs/ui',
    text: 'Vingt-neuf composants qui suivent les motifs ARIA, retheme par variables CSS, avec un apercu reglable pour chacun.',
    to: '/docs/composants/button',
    icon: Shapes,
    visual: <SpotGrid className="o-absolute o-inset-0" gap={18} dot={2} vignette={0.5} />,
  },
  {
    title: 'Un routeur avec transitions',
    module: '@odoro-cli/libs/router',
    text: 'Routes imbriquees, parametres, chargement paresseux et View Transitions natives. Ce site entier est rendu avec.',
    to: '/docs/router',
    icon: Route,
    visual: <Blueprint className="o-absolute o-inset-0" cell={22} strength={0.35} />,
  },
  {
    title: 'Un moteur qui arbitre',
    module: '@odoro-cli/engine',
    text: 'Une boucle unique pour toute la page, des surfaces WebGL comptees, la qualite qui se degrade toute seule.',
    to: '/docs/moteur',
    icon: Cpu,
    visual: <Crosshatch className="o-absolute o-inset-0" spacing={14} strength={0.14} />,
  },
  {
    title: 'Un registre qui copie',
    module: 'odoro add',
    text: 'Chaque entree declare son cout, ses tokens, ses dependances. La CLI copie les fichiers dans votre projet : ils sont a vous.',
    to: '/docs/registre',
    icon: Package,
    visual: <MeshStatic className="o-absolute o-inset-0" strength={0.6} blur={28} />,
  },
]

/** La grille des piliers. */
export function Pillars(): ReactElement {
  return (
    <section id="modules" className="o-mx-auto o-max-w-6xl o-px-6 o-py-24 o-scroll-mt-16">
      <Reveal preset="fade-up" className="o-max-w-2xl">
        <p className="o-text-xs o-font-semibold o-uppercase o-tracking-wider o-text-brand-600 dark:o-text-brand-400">
          Quatre modules, un moteur, un registre
        </p>
        <h2 className="o-mt-3 o-text-3xl md:o-text-5xl o-font-bold o-tracking-tight o-text-balance">
          Tout ce qu il faut pour un site vivant, sans une seule dependance.
        </h2>
        <p className="o-mt-4 o-text-lg o-text-zinc-600 dark:o-text-zinc-400 o-text-pretty">
          Chaque module tient seul. Ensemble, ils partagent les memes tokens, la meme boucle
          et la meme politique de mouvement.
        </p>
      </Reveal>

      <div className="o-mt-12 o-grid o-gap-4 md:o-grid-cols-2 lg:o-grid-cols-3">
        {PILLARS.map((pillar, index) => (
          <Reveal
            key={pillar.title}
            preset="fade-up"
            delay={index * 80}
            className={pillar.wide === true ? 'lg:o-col-span-2' : ''}
          >
            <Spotlight
              size={360}
              border
              className="o-flex o-h-full o-flex-col o-overflow-hidden o-rounded-2xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900"
            >
              <div className="o-relative o-h-40 o-overflow-hidden o-bg-white dark:o-bg-zinc-950">
                {pillar.visual}
                <span className="o-absolute o-left-4 o-top-4 o-inline-flex o-size-9 o-items-center o-justify-center o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-950 o-text-brand-600 dark:o-text-brand-400">
                  <Icon icon={pillar.icon} size={18} />
                </span>
              </div>
              <div className="o-flex o-flex-1 o-flex-col o-gap-2 o-p-6">
                <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                  {pillar.module}
                </span>
                <h3 className="o-text-lg o-font-semibold o-tracking-tight">{pillar.title}</h3>
                <p className="o-flex-1 o-text-sm o-text-zinc-600 dark:o-text-zinc-400 o-text-pretty">
                  {pillar.text}
                </p>
                <Link
                  to={pillar.to}
                  className="o-mt-2 o-inline-flex o-items-center o-gap-1 o-text-sm o-font-medium o-text-brand-600 dark:o-text-brand-400 o-no-underline hover:o-underline o-underline-offset-4"
                >
                  Explorer
                  <Icon icon={ArrowRight} size={14} />
                </Link>
              </div>
            </Spotlight>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
