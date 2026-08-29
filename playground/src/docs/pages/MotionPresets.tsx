/**
 * La galerie des presets d'animation : entrees, sorties, attention.
 *
 * @module
 */

import { type ReactElement, useState } from 'react'
import { Animate, type MotionPresetName, motionPresets } from '@odoro/libs/motion'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { PageHeader, Section } from '../components/DocBlocks.jsx'

/** Noms de presets, repartis en trois registres. */
const NAMES = Object.keys(motionPresets) as readonly MotionPresetName[]
const ENTRANCES = NAMES.filter((name) => name.includes('-in') || name === 'pop')
const EXITS = NAMES.filter((name) => name.includes('-out'))
const ATTENTION = NAMES.filter(
  (name) => !ENTRANCES.includes(name) && !EXITS.includes(name),
)

/** Carte d'un preset : cliquer rejoue l'animation. */
function PresetCard({ name }: { name: MotionPresetName }): ReactElement {
  const [count, setCount] = useState(0)

  return (
    <button
      type="button"
      onClick={() => setCount((current) => current + 1)}
      className="o-flex o-flex-col o-items-center o-justify-center o-gap-3 o-h-32 o-rounded-lg o-bg-white dark:o-bg-zinc-900 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-4 hover:o-border-zinc-300 dark:hover:o-border-zinc-700 o-transition-colors o-cursor-pointer o-overflow-hidden"
      aria-label={`Rejouer ${name}`}
    >
      <Animate
        as="span"
        preset={name}
        trigger={count}
        className="o-block o-size-16 o-rounded-lg o-bg-brand-600 dark:o-bg-brand-400"
      />
      <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
        {name}
      </span>
    </button>
  )
}

/** Grille de cartes pour une liste de presets. */
function PresetGrid({ names }: { names: readonly MotionPresetName[] }): ReactElement {
  return (
    <div className="o-grid o-grid-cols-2 sm:o-grid-cols-3 lg:o-grid-cols-4 o-gap-4">
      {names.map((name) => (
        <PresetCard key={name} name={name} />
      ))}
    </div>
  )
}

/** La galerie des presets, groupee par registre. Cliquer sur une carte rejoue. */
export function MotionPresets(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro/libs/motion"
        title="Presets"
        lead="Chaque preset embarque ses images-cles, sa duree et sa courbe par defaut. Cliquez sur une carte pour rejouer son animation."
      />

      <Section
        title="Entrees"
        lead="Faire apparaitre un element. Les entrees decelerent : rapides au depart, posees a l'arrivee."
      >
        <PresetGrid names={ENTRANCES} />
      </Section>

      <Section
        title="Sorties"
        lead="Faire disparaitre un element — a jouer avant le demontage, typiquement via usePresence. Les sorties accelerent."
      >
        <PresetGrid names={EXITS} />
      </Section>

      <Section
        title="Attention"
        lead="Ponctuer un evenement sur un element deja visible : erreur de saisie, notification, confirmation."
      >
        <PresetGrid names={ATTENTION} />
      </Section>

      <Section
        title="Utiliser un preset"
        lead="Par nom dans Animate — trigger rejoue a chaque changement de valeur — ou en imperatif avec useAnimate et getMotionPreset."
      >
        <CodeBlock
          lang="tsx"
          code={`import { Animate, getMotionPreset, useAnimate } from '@odoro/libs/motion'

// Declaratif : rejoue a chaque changement de trigger
<Animate preset="tada" trigger={errorCount}>
  <Champ />
</Animate>

// Imperatif : le meme preset, pilote a la main
const [ref, controls] = useAnimate<HTMLDivElement>()
const { keyframes, duration, easing } = getMotionPreset('tada')
void controls.play([...keyframes], { duration, easing })`}
        />
      </Section>
    </article>
  )
}
