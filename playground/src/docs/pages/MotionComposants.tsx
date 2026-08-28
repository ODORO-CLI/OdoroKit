/**
 * Composants du moteur d'animation : Reveal, Stagger, TextReveal, Animate.
 *
 * @module
 */

import { type ReactElement, useState } from 'react'
import {
  Animate,
  Reveal,
  type RevealPresetName,
  Stagger,
  TextReveal,
  revealPresets,
} from 'odoro-libs/motion'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { PageHeader, Section } from '../components/DocBlocks.jsx'

/** Noms d'etat de depart proposes par Reveal. */
const REVEAL_NAMES = Object.keys(revealPresets) as readonly RevealPresetName[]

/** Classes partagees des boutons de reglage des demos. */
const CONTROL_BUTTON =
  'o-h-8 o-px-3 o-text-sm o-rounded-md o-border-w-1 o-border-border o-bg-surface o-text-fg hover:o-border-border-strong o-transition-colors o-cursor-pointer'

/** Cadre d'apercu commun aux demos de la page. */
function Preview({ children }: { children: ReactElement }): ReactElement {
  return (
    <div className="o-flex o-items-center o-justify-center o-p-8 o-rounded-lg o-border-w-1 o-border-border o-bg-bg-subtle o-overflow-hidden">
      {children}
    </div>
  )
}

/** Demo de Reveal : choix du preset et rejeu. */
function RevealDemo(): ReactElement {
  const [preset, setPreset] = useState<RevealPresetName>('fade-up')
  const [round, setRound] = useState(0)

  return (
    <div className="o-flex o-flex-col o-gap-3">
      <div className="o-flex o-items-center o-gap-3">
        <select
          value={preset}
          onChange={(event) => setPreset(event.target.value as RevealPresetName)}
          className={`${CONTROL_BUTTON} o-font-mono o-text-xs`}
          aria-label="Preset de Reveal"
        >
          {REVEAL_NAMES.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setRound((n) => n + 1)}
          className={CONTROL_BUTTON}
        >
          Rejouer
        </button>
      </div>
      <Preview>
        <Reveal
          key={`${preset}-${round}`}
          preset={preset}
          className="o-rounded-lg o-bg-surface o-border-w-1 o-border-border o-p-6 o-max-w-sm"
        >
          <p className="o-font-semibold">Bloc revele</p>
          <p className="o-text-sm o-text-fg-muted">
            L'animation part quand le bloc entre a l'ecran, depuis l'etat{' '}
            <span className="o-font-mono o-text-xs">{preset}</span>.
          </p>
        </Reveal>
      </Preview>
    </div>
  )
}

/** Demo de Stagger : six tuiles en cascade. */
function StaggerDemo(): ReactElement {
  const [round, setRound] = useState(0)

  return (
    <div className="o-flex o-flex-col o-gap-3">
      <button
        type="button"
        onClick={() => setRound((n) => n + 1)}
        className={`${CONTROL_BUTTON} o-self-start`}
      >
        Rejouer
      </button>
      <Preview>
        <Stagger key={round} step={80} className="o-grid o-grid-cols-3 o-gap-3">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div
              key={index}
              className="o-size-16 o-rounded-lg o-bg-primary-soft o-border-w-1 o-border-primary-border o-flex o-items-center o-justify-center o-text-primary o-font-semibold"
            >
              {index}
            </div>
          ))}
        </Stagger>
      </Preview>
    </div>
  )
}

/** Demo de TextReveal : mot a mot ou lettre a lettre. */
function TextRevealDemo(): ReactElement {
  const [by, setBy] = useState<'word' | 'char'>('word')
  const [round, setRound] = useState(0)

  return (
    <div className="o-flex o-flex-col o-gap-3">
      <div className="o-flex o-items-center o-gap-3">
        {(['word', 'char'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => {
              setBy(mode)
              setRound((n) => n + 1)
            }}
            className={`${CONTROL_BUTTON} ${by === mode ? 'o-border-primary-border o-bg-primary-soft o-text-primary' : ''}`}
          >
            by=&quot;{mode}&quot;
          </button>
        ))}
        <button
          type="button"
          onClick={() => setRound((n) => n + 1)}
          className={CONTROL_BUTTON}
        >
          Rejouer
        </button>
      </div>
      <Preview>
        <h3 className="o-text-2xl o-font-bold o-text-center o-text-balance">
          <TextReveal key={`${by}-${round}`} by={by} step={by === 'word' ? 60 : 20}>
            Construisez des interfaces vivantes
          </TextReveal>
        </h3>
      </Preview>
    </div>
  )
}

/** Demo d'Animate : la carte rejoue pop a chaque clic. */
function AnimateDemo(): ReactElement {
  const [count, setCount] = useState(0)

  return (
    <Preview>
      <Animate
        preset="pop"
        trigger={count}
        onClick={() => setCount((n) => n + 1)}
        className="o-rounded-lg o-bg-surface o-border-w-1 o-border-border o-p-6 o-shadow-sm o-cursor-pointer o-select-none"
      >
        <p className="o-font-semibold">Cliquez-moi</p>
        <p className="o-text-sm o-text-fg-muted o-tabular-nums">pop x {count + 1}</p>
      </Animate>
    </Preview>
  )
}

/** Les quatre composants du module motion, chacun avec sa demo et son code. */
export function MotionComposants(): ReactElement {
  return (
    <article>
      <PageHeader
        module="odoro-libs/motion"
        title="Composants"
        lead="Quatre composants declaratifs : Reveal et Stagger pour les entrees a l'ecran, TextReveal pour le texte, Animate pour tout le reste."
      />

      <Section
        title="Reveal"
        lead="Revele son contenu quand il entre dans le viewport, depuis un etat de depart nomme. Par defaut, une seule fois."
      >
        <RevealDemo />
        <CodeBlock
          lang="tsx"
          code={`import { Reveal } from 'odoro-libs/motion'

<Reveal preset="fade-up" duration="slow" threshold={0.3} once>
  <Carte />
</Reveal>`}
        />
      </Section>

      <Section
        title="Stagger"
        lead="Revele ses enfants les uns apres les autres, avec un ecart constant et un plafond de retard cumule : une longue liste ne traine jamais."
      >
        <StaggerDemo />
        <CodeBlock
          lang="tsx"
          code={`import { Stagger } from 'odoro-libs/motion'

<Stagger step={80} className="o-grid o-grid-cols-3 o-gap-3">
  {items.map((item) => (
    <Tuile key={item.id} {...item} />
  ))}
</Stagger>`}
        />
      </Section>

      <Section
        title="TextReveal"
        lead="Revele une chaine mot a mot ou lettre a lettre. Les lecteurs d'ecran recoivent le texte entier d'un bloc ; sous prefers-reduced-motion, le texte est rendu tel quel."
      >
        <TextRevealDemo />
        <CodeBlock
          lang="tsx"
          code={`import { TextReveal } from 'odoro-libs/motion'

<h1 className="o-text-5xl o-font-bold">
  <TextReveal by="word" step={60}>
    Construisez des interfaces vivantes
  </TextReveal>
</h1>`}
        />
      </Section>

      <Section
        title="Animate"
        lead="Joue un preset — ou des images-cles libres — au montage, puis a chaque changement de trigger. C'est l'equivalent declaratif de useAnimate."
      >
        <AnimateDemo />
        <CodeBlock
          lang="tsx"
          code={`import { Animate } from 'odoro-libs/motion'

const [count, setCount] = useState(0)

<Animate preset="pop" trigger={count} onClick={() => setCount((n) => n + 1)}>
  <Carte />
</Animate>`}
        />
      </Section>
    </article>
  )
}
