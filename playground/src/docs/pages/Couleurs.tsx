/**
 * Couleurs : la couche semantique et la palette brute.
 *
 * @module
 */

import { type ReactElement, useState } from 'react'
import { colorLight, palette } from 'odoro-libs/styles'

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
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      ) : null}
    </button>
  )
}

/** Couleurs : couche semantique, palette brute et modes d'emploi. */
export function Couleurs(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/styles"
        title="Couleurs"
        lead="Deux etages : une palette brute de 290 nuances OKLCH, et une couche semantique clair/sombre par-dessus. Les composants ne connaissent que la seconde — c'est elle qui fait le theme."
      />

      <Section
        title="Couche semantique"
        lead="Chaque nom decrit un role, pas une teinte : bg, surface, fg, primary, danger... Les pastilles ci-dessous lisent la variable CSS courante — basculez le theme pour les voir changer."
      >
        <div className="o-grid o-grid-cols-2 sm:o-grid-cols-3 lg:o-grid-cols-4 o-gap-3">
          {Object.keys(colorLight).map((name) => (
            <div key={name} className="o-flex o-flex-col o-gap-1">
              <div
                className="o-h-12 o-w-full o-rounded-md o-border-w-1 o-border-border-subtle"
                style={{ backgroundColor: `var(--o-color-${name})` }}
              />
              <span className="o-font-mono o-text-xs o-text-fg-muted">{name}</span>
            </div>
          ))}
        </div>
        <Callout>
          Les composants d'<code className="o-font-mono o-text-sm">odoro-libs/ui</code>{' '}
          n'utilisent que ces noms : retheme la librairie entiere revient a surcharger
          quelques variables <code className="o-font-mono o-text-sm">--o-color-*</code>,
          sans toucher a un seul composant.
        </Callout>
        <CodeBlock
          lang="css"
          code={`/* Rethemer la couleur d'action, dans les deux themes */
:root {
  --o-color-primary: oklch(64% 0.15 160);
  --o-color-primary-hover: oklch(57% 0.15 160);
  --o-color-ring: oklch(64% 0.15 160);
}
[data-theme='dark'] {
  --o-color-primary: oklch(78% 0.13 160);
  --o-color-primary-hover: oklch(84% 0.12 160);
}`}
        />
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
                  className="o-flex-1 o-text-center o-font-mono o-text-xs o-text-fg-subtle"
                >
                  {shade}
                </span>
              ))}
            </div>
          </div>
          {groupByHue().map(([hue, entries]) => (
            <div key={hue} className="o-flex o-items-center o-gap-2">
              <span className="o-w-20 o-shrink-0 o-font-mono o-text-xs o-text-fg-muted">
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
        lead="Les classes utilitaires sur la palette brute exigent la feuille complete ; les variables CSS, elles, sont toujours presentes, quelle que soit la feuille importee."
      >
        <CodeBlock
          lang="tsx"
          code={`// Avec la feuille complete (styles.full.css) : classes sur toute la palette
<div className="o-bg-sky-500 o-text-white o-rounded-lg o-p-4" />

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
