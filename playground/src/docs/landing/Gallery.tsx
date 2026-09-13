/**
 * La bande de fonds, a faire defiler a l'horizontale, et le bandeau des noms.
 *
 * La bande accroche au defilement (scroll-snap) : chaque carte s'aligne au
 * centre. Le bandeau, lui, s'incline avec la vitesse du defilement vertical.
 *
 * @module
 */

import { Reveal } from '@odoro-cli/libs/motion'
import { Link } from '@odoro-cli/libs/router'
import { type ReactElement, type ReactNode } from 'react'

import { Blueprint } from '@/odoro/background/Blueprint.js'
import { Checker } from '@/odoro/background/Checker.js'
import { Crosshatch } from '@/odoro/background/Crosshatch.js'
import { GraphPaper } from '@/odoro/background/GraphPaper.js'
import { MeshStatic } from '@/odoro/background/MeshStatic.js'
import { Noise } from '@/odoro/background/Noise.js'
import { RadialGlow } from '@/odoro/background/RadialGlow.js'
import { Rings } from '@/odoro/background/Rings.js'
import { SpotGrid } from '@/odoro/background/SpotGrid.js'
import { Stripes } from '@/odoro/background/Stripes.js'
import { Marquee } from '@/odoro/effect/Marquee.js'
import { ScrollVelocity } from '@/odoro/effect/ScrollVelocity.js'

import type { CatalogueEntry } from '../catalogue.generated.js'

/** Les fonds statiques, tous en CSS : la bande ne coute rien. */
const STATICS: readonly { slug: string; title: string; node: ReactNode }[] = [
  { slug: 'radial-glow', title: 'Halo', node: <RadialGlow className="o-absolute o-inset-0" /> },
  { slug: 'mesh-static', title: 'Nappe figee', node: <MeshStatic className="o-absolute o-inset-0" /> },
  { slug: 'graph-paper', title: 'Papier millimetre', node: <GraphPaper className="o-absolute o-inset-0" /> },
  { slug: 'blueprint', title: 'Plan technique', node: <Blueprint className="o-absolute o-inset-0" /> },
  { slug: 'rings', title: 'Anneaux', node: <Rings className="o-absolute o-inset-0" /> },
  { slug: 'spot-grid', title: 'Points masques', node: <SpotGrid className="o-absolute o-inset-0" /> },
  { slug: 'stripes', title: 'Rayures', node: <Stripes className="o-absolute o-inset-0" /> },
  { slug: 'crosshatch', title: 'Croisillons', node: <Crosshatch className="o-absolute o-inset-0" /> },
  { slug: 'checker', title: 'Damier', node: <Checker className="o-absolute o-inset-0" /> },
  { slug: 'noise', title: 'Grain', node: <Noise className="o-absolute o-inset-0" /> },
]

/** Proprietes de la galerie. */
export interface GalleryProps {
  /** Le catalogue entier, pour le bandeau des noms. */
  entries: readonly CatalogueEntry[]
}

/** La bande et le bandeau. */
export function Gallery({ entries }: GalleryProps): ReactElement {
  return (
    <section className="o-overflow-hidden o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-py-24">
      <div className="o-mx-auto o-max-w-6xl o-px-6">
        <Reveal
          preset="fade-up"
          className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-4"
        >
          <div className="o-max-w-2xl">
            <p className="o-text-xs o-font-semibold o-uppercase o-tracking-wider o-text-brand-600 dark:o-text-brand-400">
              Aucun contexte graphique
            </p>
            <h2 className="o-mt-3 o-text-3xl md:o-text-5xl o-font-bold o-tracking-tight o-text-balance">
              Dix fonds qui ne coûtent qu’un dégradé.
            </h2>
          </div>
          <Link
            to="/docs/backgrounds"
            className="o-text-sm o-font-medium o-text-brand-600 dark:o-text-brand-400 o-no-underline hover:o-underline o-underline-offset-4"
          >
            Tous les fonds
          </Link>
        </Reveal>
      </div>

      <div className="o-mt-10 o-flex o-gap-4 o-overflow-x-auto o-snap-x o-snap-mandatory o-scrollbar dark:o-scrollbar-dark o-px-6 o-pb-6">
        {STATICS.map((item) => (
          <Link
            key={item.slug}
            to={`/docs/backgrounds/${item.slug}`}
            className="o-relative o-h-48 o-w-72 o-shrink-0 o-snap-center o-overflow-hidden o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-950 o-no-underline hover:o-lift-sm o-transition-transform"
          >
            {item.node}
            <span className="o-absolute o-bottom-3 o-left-3 o-rounded-md o-bg-white dark:o-bg-zinc-950 o-px-2 o-py-1 o-font-mono o-text-xs o-text-zinc-700 dark:o-text-zinc-200">
              {item.title}
            </span>
          </Link>
        ))}
      </div>

      <ScrollVelocity strength={1.2} damping={6} className="o-mt-10">
        <Marquee speed={36} fade={12} pauseOnHover className="o-w-full">
          {entries.slice(0, 60).map((entry) => (
            <span
              key={entry.id}
              className="o-px-6 o-text-2xl md:o-text-4xl o-font-bold o-tracking-tight o-text-zinc-500 dark:o-text-zinc-500"
            >
              {entry.title}
            </span>
          ))}
        </Marquee>
      </ScrollVelocity>
    </section>
  )
}
