/**
 * Utilitaires : degrades, verre depoli, transforms, filtres, ombres,
 * espacement des enfants, scroll-snap et animations CSS.
 *
 * @module
 */

import { type ReactElement } from 'react'

import { DemoBlock, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Le bestiaire visuel des utilitaires, famille par famille. */
export function Utilitaires(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/styles"
        title="Utilitaires"
        lead="Le tour des familles visuelles : chaque demo est rendue avec les classes exactes de son extrait. Les utilitaires de couleur sur la palette brute demandent la feuille complete."
      />

      <Section
        title="Degrades"
        lead="Une direction (o-bg-gradient-to-*), une forme radiale ou conique, et des jalons from / via / to. Les memes classes decoupees a la forme des lettres avec o-text-gradient."
      >
        <DemoBlock
          center={false}
          code={`<div className="o-bg-gradient-to-r o-from-sky-500 o-via-fuchsia-500 o-to-amber-400" />
<div className="o-bg-gradient-radial o-from-sky-500 o-to-fuchsia-500" />
<div className="o-bg-gradient-conic o-from-indigo-500 o-via-purple-500 o-to-pink-500" />
<h3 className="o-text-gradient o-bg-gradient-to-r o-from-sky-500 o-to-fuchsia-500">Texte en degrade</h3>`}
        >
          <div className="o-grid o-grid-cols-1 sm:o-grid-cols-3 o-gap-4 o-w-full">
            <div className="o-h-24 o-rounded-lg o-bg-gradient-to-r o-from-sky-500 o-via-fuchsia-500 o-to-amber-400" />
            <div className="o-h-24 o-rounded-lg o-bg-gradient-radial o-from-sky-500 o-to-fuchsia-500" />
            <div className="o-h-24 o-rounded-lg o-bg-gradient-conic o-from-indigo-500 o-via-purple-500 o-to-pink-500" />
            <h3 className="sm:o-col-span-3 o-text-3xl o-font-extrabold o-text-gradient o-bg-gradient-to-r o-from-sky-500 o-to-fuchsia-500">
              Texte en degrade
            </h3>
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Verre depoli"
        lead="o-glass combine fond translucide, flou d'arriere-plan et bordure discrete — a poser sur un fond charge pour que l'effet se voie."
      >
        <DemoBlock
          code={`<div className="o-bg-gradient-to-r o-from-indigo-500 o-via-purple-500 o-to-pink-500 o-p-8">
  <div className="o-glass dark:o-glass-dark o-rounded-lg o-p-6">
    <p className="o-font-semibold">Verre depoli</p>
    <p className="o-text-sm">Le degrade se devine a travers.</p>
  </div>
</div>`}
        >
          <div className="o-bg-gradient-to-r o-from-indigo-500 o-via-purple-500 o-to-pink-500 o-p-8 o-rounded-lg o-w-full o-max-w-md">
            <div className="o-glass dark:o-glass-dark o-rounded-lg o-p-6">
              <p className="o-font-semibold">Verre depoli</p>
              <p className="o-text-sm">Le degrade se devine a travers.</p>
            </div>
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Transforms"
        lead="Echelle, rotation, translation — et o-lift-*, un raccourci translation + ombre pour faire decoller une carte au survol. Toujours accompagner d'une transition."
      >
        <DemoBlock
          code={`<div className="hover:o-scale-105 o-transition-transform">Survolez-moi</div>
<div className="hover:o-lift-md o-transition-all">Je decolle</div>
<div className="o-rotate-6">Penche de 6 degres</div>`}
        >
          <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-8">
            <div className="o-rounded-lg o-bg-white dark:o-bg-zinc-900 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-4 o-text-sm hover:o-scale-105 o-transition-transform o-cursor-pointer">
              Survolez-moi
            </div>
            <div className="o-rounded-lg o-bg-white dark:o-bg-zinc-900 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-4 o-text-sm hover:o-lift-md o-transition-all o-cursor-pointer">
              Je decolle
            </div>
            <div className="o-rounded-lg o-bg-brand-600 dark:o-bg-brand-400 o-text-white dark:o-text-zinc-950 o-p-4 o-text-sm o-rotate-6">
              Penche de 6 degres
            </div>
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Filtres"
        lead="Niveaux de gris, flou, luminosite... Les filtres se pretent bien aux etats : ici, les pastilles retrouvent leurs couleurs au survol."
      >
        <DemoBlock
          code={`<div className="o-grayscale hover:o-grayscale-0 o-transition-all">
  <span className="o-bg-sky-500" /> <span className="o-bg-emerald-500" /> ...
</div>
<img className="o-blur-sm" ... />
<img className="o-brightness-125" ... />`}
        >
          <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-8">
            <div
              className="o-flex o-gap-2 o-grayscale hover:o-grayscale-0 o-transition-all o-cursor-pointer"
              title="Survolez pour retrouver les couleurs"
            >
              {['sky-500', 'emerald-500', 'amber-500', 'rose-500', 'violet-500'].map(
                (name) => (
                  <span
                    key={name}
                    className="o-size-8 o-rounded-full"
                    style={{ backgroundColor: `var(--o-palette-${name})` }}
                  />
                ),
              )}
            </div>
            <div className="o-size-16 o-rounded-lg o-bg-gradient-to-br o-from-sky-500 o-to-fuchsia-500 o-blur-sm" />
            <div className="o-size-16 o-rounded-lg o-bg-gradient-to-br o-from-sky-500 o-to-fuchsia-500 o-brightness-125" />
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Ombres"
        lead="Sept intensites d'ombre portee, de la plus discrete a la plus profonde."
      >
        <DemoBlock
          code={`<div className="o-shadow-2xs" /> ... <div className="o-shadow-2xl" />`}
        >
          <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-6">
            {['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'].map((size) => (
              <div
                key={size}
                className={`o-size-16 o-rounded-lg o-bg-white dark:o-bg-zinc-900 o-shadow-${size} o-flex o-items-center o-justify-center`}
              >
                <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                  {size}
                </span>
              </div>
            ))}
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Espacement des enfants"
        lead="o-space-y-* espace les enfants directs sans toucher au premier ni au dernier ; o-divide-y trace un filet entre eux."
      >
        <DemoBlock
          center={false}
          code={`<ul className="o-space-y-2">...</ul>
<ul className="o-divide-y">...</ul>`}
        >
          <div className="o-grid o-grid-cols-1 sm:o-grid-cols-2 o-gap-8 o-w-full">
            <ul className="o-space-y-2">
              {['Premier', 'Deuxieme', 'Troisieme'].map((label) => (
                <li
                  key={label}
                  className="o-rounded-md o-bg-white dark:o-bg-zinc-900 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-px-3 o-py-2 o-text-sm"
                >
                  {label} — o-space-y-2
                </li>
              ))}
            </ul>
            <ul className="o-divide-y o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900">
              {['Premier', 'Deuxieme', 'Troisieme'].map((label) => (
                <li key={label} className="o-px-3 o-py-2 o-text-sm">
                  {label} — o-divide-y
                </li>
              ))}
            </ul>
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Scroll-snap"
        lead="Une bande qui defile horizontalement et s'aimante carte par carte : faites glisser."
      >
        <DemoBlock
          center={false}
          code={`<div className="o-overflow-x-auto o-snap-x o-snap-mandatory o-flex o-gap-4">
  <div className="o-snap-center o-shrink-0 o-w-56">Carte 1</div>
  ...
</div>`}
        >
          <div className="o-overflow-x-auto o-snap-x o-snap-mandatory o-flex o-gap-4 o-w-full o-max-w-md o-p-2">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div
                key={index}
                className="o-snap-center o-shrink-0 o-w-56 o-h-32 o-rounded-lg o-bg-white dark:o-bg-zinc-900 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-flex o-items-center o-justify-center o-text-zinc-500 dark:o-text-zinc-400"
              >
                Carte {index}
              </div>
            ))}
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Animations CSS"
        lead="Les mouvements du moteur existent aussi en classes o-animate-*, pour les cas sans JavaScript : indicateurs, squelettes de chargement, accents decoratifs. Duree, retard et repetition se reglent avec o-animate-duration-*, o-animate-delay-* et o-animate-infinite."
      >
        <DemoBlock
          center={false}
          code={`<div className="o-animate-spin" />     // rotation continue
<div className="o-animate-pulse" />    // pulsation d'opacite
<div className="o-animate-bounce" />   // rebond
<div className="o-animate-ping" />     // onde d'attention
<div className="o-animate-float" />    // flottement lent
<div className="o-animate-shimmer" />  // reflet de squelette
<h3 className="o-animate-gradient o-text-gradient o-bg-gradient-to-r ..." /> // degrade anime`}
        >
          <div className="o-grid o-grid-cols-2 sm:o-grid-cols-3 o-gap-4 o-w-full">
            {(
              [
                [
                  'spin',
                  <div
                    key="d"
                    className="o-size-8 o-rounded-md o-border-w-4 o-border-brand-200 dark:o-border-brand-800 o-animate-spin"
                  />,
                ],
                [
                  'pulse',
                  <div
                    key="d"
                    className="o-size-8 o-rounded-full o-bg-brand-600 dark:o-bg-brand-400 o-animate-pulse"
                  />,
                ],
                [
                  'bounce',
                  <div
                    key="d"
                    className="o-size-8 o-rounded-full o-bg-fuchsia-600 dark:o-bg-fuchsia-400 o-animate-bounce"
                  />,
                ],
                [
                  'ping',
                  <span key="d" className="o-relative o-inline-flex o-size-8">
                    <span className="o-absolute o-inset-0 o-rounded-full o-bg-sky-600 dark:o-bg-sky-400 o-animate-ping" />
                    <span className="o-relative o-size-8 o-rounded-full o-bg-sky-600 dark:o-bg-sky-400" />
                  </span>,
                ],
                [
                  'float',
                  <div
                    key="d"
                    className="o-size-8 o-rounded-lg o-bg-emerald-600 dark:o-bg-emerald-400 o-animate-float"
                  />,
                ],
                [
                  'shimmer',
                  <div key="d" className="o-flex o-flex-col o-gap-2 o-w-full">
                    <div className="o-h-3 o-w-3/4 o-rounded-sm o-bg-zinc-100 dark:o-bg-zinc-950 o-animate-shimmer" />
                    <div className="o-h-3 o-w-1/2 o-rounded-sm o-bg-zinc-100 dark:o-bg-zinc-950 o-animate-shimmer" />
                  </div>,
                ],
              ] as ReadonlyArray<readonly [string, ReactElement]>
            ).map(([name, demo]) => (
              <div
                key={name}
                className="o-flex o-flex-col o-items-center o-justify-center o-gap-3 o-h-24 o-rounded-lg o-bg-white dark:o-bg-zinc-900 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-4"
              >
                {demo}
                <span className="o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-500">
                  o-animate-{name}
                </span>
              </div>
            ))}
            <h3 className="o-col-span-2 sm:o-col-span-3 o-text-center o-text-2xl o-font-extrabold o-text-gradient o-bg-gradient-to-r o-from-sky-500 o-via-fuchsia-500 o-to-amber-400 o-animate-gradient">
              Un titre au degrade anime
            </h3>
          </div>
        </DemoBlock>
      </Section>
    </article>
  )
}
