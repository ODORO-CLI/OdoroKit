/**
 * Couleurs : la palette brute, et rien d'autre.
 *
 * @module
 */

import { Icon } from 'odoro-icons'
import { Check } from 'odoro-icons/filaire'
import { type ReactElement, useState } from 'react'
import { palette } from 'odoro-libs/styles'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { Callout, PageHeader, Section } from '../components/DocBlocks.jsx'

/** Nuances d'une teinte, du plus clair au plus fonce. */
const SHADES = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
]

/** Cles de la palette sans teinte declinee : ecartees du nuancier. */
const STANDALONE = new Set(['black', 'white', 'transparent', 'current'])

/** Regroupe les cles de la palette par teinte (prefixe avant le tiret). */
function groupByHue(): ReadonlyArray<
  readonly [string, ReadonlyArray<readonly [string, string]>]
> {
  const groups = new Map<string, Array<readonly [string, string]>>()
  for (const [key, value] of Object.entries(palette)) {
    if (STANDALONE.has(key)) continue
    const hue = key.slice(0, key.indexOf('-'))
    const entries = groups.get(hue) ?? []
    entries.push([key, value] as const)
    groups.set(hue, entries)
  }
  return [...groups.entries()]
}

/** Pastille d'une nuance : title au survol, copie de la classe au clic. */
function PaletteSwatch({ name, value }: { name: string; value: string }): ReactElement {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      title={`${name} — ${value}`}
      aria-label={`Copier o-bg-${name}`}
      onClick={() => {
        void navigator.clipboard?.writeText(`o-bg-${name}`).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        })
      }}
      className="o-relative o-flex-1 o-h-8 o-rounded-sm o-cursor-pointer o-transition-transform hover:o-scale-110"
      style={{ backgroundColor: value }}
    >
      {copied ? (
        <span className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-text-white o-text-xs">
          {/* Trait de trois : la coche est posee sur la couleur elle-meme,
              qui peut etre claire, et c'est le seul retour du clic. */}
          <Icon icon={Check} size={12} strokeWidth={3} />
        </span>
      ) : null}
    </button>
  )
}

/** Couleurs : palette brute et modes d'emploi. */
export function Couleurs(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/styles"
        title="Couleurs"
        lead="Une seule couche : 290 nuances OKLCH, designees par leur place dans l'echelle. Aucun nom de role."
      />

      <Section
        title="Il n y a pas de couche semantique"
        lead="Ni primary, ni surface, ni danger. Une couleur se designe par sa place dans l'echelle — zinc-900, brand-600 — et le theme se dit explicitement sur chaque classe."
      >
        <CodeBlock
          lang="tsx"
          code={`// Le theme est ecrit, pas devine.
<div className="o-bg-white dark:o-bg-zinc-900 o-text-zinc-900 dark:o-text-zinc-50" />

// Les etats se croisent avec le theme.
<button className="o-bg-zinc-100 hover:o-bg-zinc-200 dark:o-bg-zinc-800 dark:hover:o-bg-zinc-700" />`}
        />

        <Callout>
          C est plus verbeux, et c est la contrepartie assumee : on voit la couleur qu on
          ecrit. Un nom de role cache la teinte derriere une intention, et il faut ouvrir
          la table des tokens pour savoir ce qui s affichera.
        </Callout>

        <Callout tone="warning">
          La consequence est reelle et se mesure : la feuille de base est passee de{' '}
          <strong>41,8 a 52,5 Ko</strong> compresses, parce que chaque couleur a desormais
          besoin de ses variantes croisees avec le theme. Le prix du choix est la.
        </Callout>

        <p className="o-text-zinc-500 dark:o-text-zinc-400 o-max-w-prose">
          Le fond de page, la couleur du texte courant et celle des liens n ont pas d
          element a habiller : elles restent posees une fois pour toutes dans le
          preflight, en clair et en sombre. C est le seul endroit du systeme ou une
          couleur est ecrite sans qu une classe la demande.
        </p>
      </Section>

      <Section
        title="Palette brute"
        lead="Chaque teinte se decline en 11 nuances, de 50 (la plus claire) a 950 (la plus foncee). Survolez une pastille pour lire sa valeur, cliquez pour copier sa classe o-bg-*."
      >
        <div className="o-flex o-flex-col o-gap-2">
          <div className="o-flex o-items-center o-gap-2">
            <span className="o-w-20 o-shrink-0" />
            <div className="o-flex o-flex-1 o-gap-1">
              {SHADES.map((shade) => (
                <span
                  key={shade}
                  className="o-flex-1 o-text-center o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-500"
                >
                  {shade}
                </span>
              ))}
            </div>
          </div>
          {groupByHue().map(([hue, entries]) => (
            <div key={hue} className="o-flex o-items-center o-gap-2">
              <span className="o-w-20 o-shrink-0 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                {hue}
              </span>
              <div className="o-flex o-flex-1 o-gap-1">
                {entries.map(([name, value]) => (
                  <PaletteSwatch key={name} name={name} value={value} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Utiliser la palette"
        lead="La feuille de base porte sept teintes : une echelle neutre, la marque, et les quatre intentions qu'une interface exprime sans y penser. Les 290 nuances vivent dans la feuille complete ; les variables CSS, elles, sont toujours la."
      >
        <CodeBlock
          lang="tsx"
          code={`// Feuille de base : zinc, brand, red, amber, emerald, sky, fuchsia
<div className="o-bg-zinc-100 dark:o-bg-zinc-900 o-rounded-lg o-p-4" />

// Feuille complete (styles.full.css) : les 290 nuances
<div className="o-bg-teal-500 o-text-white o-rounded-lg o-p-4" />

// Toujours disponible, meme avec la feuille de base : la variable CSS
<div style={{ backgroundColor: 'var(--o-palette-sky-500)' }} />

// Et en JavaScript, la valeur brute
import { palette } from 'odoro-libs/styles'
palette['sky-500'] // 'oklch(68.5% 0.169 237.323)'`}
        />
      </Section>
    </article>
  )
}
