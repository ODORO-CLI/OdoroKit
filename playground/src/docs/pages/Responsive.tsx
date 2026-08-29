/**
 * Responsive : points de rupture et variants d'ecran.
 *
 * @module
 */

import { type ReactElement } from 'react'
import { breakpoint } from '@odoro-cli/libs/styles'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, DemoBlock, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Cible indicative de chaque point de rupture. */
const TARGETS: Readonly<Record<string, string>> = {
  sm: 'grand mobile, petite tablette',
  md: 'tablette',
  lg: 'portable',
  xl: 'bureau',
  '2xl': 'grand ecran',
}

/** Responsive : points de rupture, mobile-first et variants max-*. */
export function Responsive(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro-cli/libs/styles"
        title="Responsive"
        lead="Cinq points de rupture, exprimes en rem pour suivre la taille de police de l'utilisateur. Chaque utilitaire existe en variant d'ecran : sm: a 2xl: vers le haut, max-sm: a max-lg: vers le bas."
      />

      <Section
        title="Points de rupture"
        lead="Un variant sm: s'applique a partir de 40rem de large, et ainsi de suite : les seuils sont des bornes basses."
      >
        <div className="o-overflow-x-auto o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800">
          <table className="o-w-full o-text-sm">
            <thead>
              <tr className="o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-text-left">
                <th
                  scope="col"
                  className="o-px-4 o-py-2 o-font-medium o-text-zinc-500 dark:o-text-zinc-400"
                >
                  Variant
                </th>
                <th
                  scope="col"
                  className="o-px-4 o-py-2 o-font-medium o-text-zinc-500 dark:o-text-zinc-400"
                >
                  Seuil
                </th>
                <th
                  scope="col"
                  className="o-px-4 o-py-2 o-font-medium o-text-zinc-500 dark:o-text-zinc-400"
                >
                  Equivalent
                </th>
                <th
                  scope="col"
                  className="o-px-4 o-py-2 o-font-medium o-text-zinc-500 dark:o-text-zinc-400"
                >
                  Cible indicative
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(breakpoint).map(([name, value]) => (
                <tr
                  key={name}
                  className="o-border-b o-border-zinc-100 dark:o-border-zinc-900"
                >
                  <td className="o-px-4 o-py-2 o-font-mono o-text-xs o-text-brand-600 dark:o-text-brand-400 o-whitespace-nowrap">
                    {name}:
                  </td>
                  <td className="o-px-4 o-py-2 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                    {value}
                  </td>
                  <td className="o-px-4 o-py-2 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400 o-tabular-nums">
                    {parseFloat(value) * 16}px
                  </td>
                  <td className="o-px-4 o-py-2 o-text-zinc-500 dark:o-text-zinc-400">
                    {TARGETS[name] ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Mobile-first"
        lead="Une classe sans prefixe s'applique partout ; un variant d'ecran ne fait qu'ajuster a partir de son seuil. On decrit d'abord le mobile, puis on elargit."
      >
        <CodeBlock
          lang="tsx"
          code={`// Une colonne partout, deux a partir de sm, quatre a partir de lg
<div className="o-grid o-grid-cols-1 sm:o-grid-cols-2 lg:o-grid-cols-4 o-gap-4">...</div>`}
        />
        <Callout>
          Les variants <code className="o-font-mono o-text-sm">max-sm:</code>,{' '}
          <code className="o-font-mono o-text-sm">max-md:</code> et{' '}
          <code className="o-font-mono o-text-sm">max-lg:</code> visent la direction
          inverse : cibler les petits ecrans sans avoir a annuler la regle ensuite.{' '}
          <code className="o-font-mono o-text-sm">max-md:o-hidden</code> cache sous 48rem
          — plus direct que poser <code className="o-font-mono o-text-sm">o-hidden</code>{' '}
          puis le contredire avec{' '}
          <code className="o-font-mono o-text-sm">md:o-block</code>.
        </Callout>
      </Section>

      <Section
        title="En pratique"
        lead="Redimensionnez la fenetre : la grille passe de une a deux puis quatre colonnes."
      >
        <DemoBlock
          center={false}
          code={`<div className="o-grid o-grid-cols-1 sm:o-grid-cols-2 lg:o-grid-cols-4 o-gap-4">
  <div className="o-rounded-lg o-bg-white dark:o-bg-zinc-900 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-4">Carte 1</div>
  ...
</div>`}
        >
          <div className="o-grid o-grid-cols-1 sm:o-grid-cols-2 lg:o-grid-cols-4 o-gap-4">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="o-rounded-lg o-bg-white dark:o-bg-zinc-900 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-4 o-text-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400"
              >
                Carte {index}
              </div>
            ))}
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Montrer, cacher"
        lead="Les deux messages ci-dessous sont complementaires : un seul est visible a la fois, selon la largeur."
      >
        <DemoBlock
          center={false}
          code={`<p className="max-md:o-hidden">Visible a partir de md (48rem)</p>
<p className="md:o-hidden">Visible sous md seulement</p>`}
        >
          <div className="o-flex o-flex-col o-gap-2 o-text-sm">
            <p className="max-md:o-hidden o-rounded-md o-bg-emerald-50 dark:o-bg-emerald-950 o-border-w-1 o-border-emerald-200 dark:o-border-emerald-800 o-px-3 o-py-2">
              Visible a partir de md (48rem) — vous etes sur un ecran large.
            </p>
            <p className="md:o-hidden o-rounded-md o-bg-sky-50 dark:o-bg-sky-950 o-border-w-1 o-border-sky-200 dark:o-border-sky-800 o-px-3 o-py-2">
              Visible sous md seulement — vous etes sur un ecran etroit.
            </p>
          </div>
        </DemoBlock>
      </Section>

      <Section
        title="Combiner les variants"
        lead="Les variants d'etat, de theme et d'ecran s'empilent sur la meme classe."
      >
        <CodeBlock
          lang="tsx"
          code={`// Fond au survol, bordure renforcee en theme sombre, marge elargie a partir de lg
<a className="o-rounded-md o-p-2 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 hover:o-bg-zinc-50 dark:hover:o-bg-zinc-800 dark:o-border-zinc-700 lg:o-p-4">
  Un lien de navigation
</a>`}
        />
      </Section>
    </article>
  )
}
