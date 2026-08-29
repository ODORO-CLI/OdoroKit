/**
 * Hooks du moteur d'animation : useAnimate, usePresence, useInView,
 * useScrollProgress.
 *
 * @module
 */

import { type ReactElement, useState } from 'react'
import {
  getMotionPreset,
  useAnimate,
  useInView,
  usePresence,
  useScrollProgress,
} from '@odoro-cli/libs/motion'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { PageHeader, Section } from '../components/DocBlocks.jsx'

/** Classes partagees des boutons des demos. */
const CONTROL_BUTTON =
  'o-h-8 o-px-3 o-text-sm o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-text-zinc-900 dark:o-text-zinc-50 hover:o-border-zinc-300 dark:hover:o-border-zinc-700 o-transition-colors o-cursor-pointer'

/** Cadre d'apercu commun aux demos de la page. */
function Preview({ children }: { children: ReactElement }): ReactElement {
  return (
    <div className="o-flex o-items-center o-justify-center o-gap-4 o-p-8 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-overflow-hidden">
      {children}
    </div>
  )
}

/** Demo de useAnimate : un bouton secoue le badge avec le preset shake. */
function UseAnimateDemo(): ReactElement {
  const [ref, controls] = useAnimate<HTMLSpanElement>()

  return (
    <Preview>
      <>
        <button
          type="button"
          className={CONTROL_BUTTON}
          onClick={() => {
            const { keyframes, duration, easing } = getMotionPreset('shake')
            void controls.play([...keyframes], { duration, easing })
          }}
        >
          Secouer
        </button>
        <span
          ref={ref}
          className="o-inline-flex o-items-center o-rounded-full o-bg-red-50 dark:o-bg-red-950 o-border-w-1 o-border-red-200 dark:o-border-red-800 o-text-red-600 dark:o-text-red-400 o-px-3 o-py-1 o-text-sm o-font-medium"
        >
          3 erreurs
        </span>
      </>
    </Preview>
  )
}

/** Demo de usePresence : sortie animee avant demontage. */
function UsePresenceDemo(): ReactElement {
  const [open, setOpen] = useState(true)
  const { ref, isMounted, status } = usePresence<HTMLDivElement>(open)

  return (
    <div className="o-flex o-flex-col o-gap-3">
      <div className="o-flex o-items-center o-gap-3">
        <button
          type="button"
          className={CONTROL_BUTTON}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Cacher' : 'Montrer'}
        </button>
        <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
          isMounted: {String(isMounted)} — status: {status}
        </span>
      </div>
      <Preview>
        <div className="o-h-24 o-flex o-items-center o-justify-center">
          {isMounted ? (
            <div
              ref={ref}
              className="o-rounded-lg o-bg-white dark:o-bg-zinc-900 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-4 o-shadow-sm"
            >
              <p className="o-text-sm">
                Je reste dans l'arbre le temps de mon animation de sortie.
              </p>
            </div>
          ) : null}
        </div>
      </Preview>
    </div>
  )
}

/** Demo de useInView : l'encadre change d'etat en entrant a l'ecran. */
function UseInViewDemo(): ReactElement {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.6 })

  return (
    <Preview>
      <div
        ref={ref}
        className={`o-rounded-lg o-border-w-1 o-p-6 o-max-w-sm o-transition-colors o-duration-slow ${
          inView
            ? 'o-bg-emerald-50 dark:o-bg-emerald-950 o-border-emerald-200 dark:o-border-emerald-800'
            : 'o-bg-white dark:o-bg-zinc-900 o-border-zinc-200 dark:o-border-zinc-800'
        }`}
      >
        <p className="o-font-semibold">{inView ? 'Dans le viewport' : 'Hors champ'}</p>
        <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-font-mono">
          inView: {String(inView)}
        </p>
        <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Faites defiler pour me sortir de l'ecran, puis revenez : l'etat suit.
        </p>
      </div>
    </Preview>
  )
}

/** Demo de useScrollProgress : progression de la page en direct. */
function UseScrollProgressDemo(): ReactElement {
  const progress = useScrollProgress()

  return (
    <Preview>
      <div className="o-flex o-flex-col o-gap-2 o-w-full o-max-w-sm">
        <p className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Defilement de la page :{' '}
          <span className="o-font-mono o-tabular-nums o-text-zinc-900 dark:o-text-zinc-50">
            {Math.round(progress * 100)} %
          </span>
        </p>
        <div className="o-h-2 o-w-full o-rounded-full o-bg-zinc-100 dark:o-bg-zinc-950 o-overflow-hidden">
          <div
            className="o-h-2 o-rounded-full o-bg-brand-600 dark:o-bg-brand-400"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </Preview>
  )
}

/** Les hooks du module motion, chacun avec sa demo et son extrait. */
export function MotionHooks(): ReactElement {
  return (
    <article>
      <PageHeader
        module="@odoro-cli/libs/motion"
        title="Hooks"
        lead="Quatre hooks pour piloter le mouvement a la main : jouer une animation, retarder un demontage, observer le viewport, suivre le defilement."
      />

      <Section
        title="useAnimate"
        lead="Une ref a poser sur l'element, des controles pour l'animer : play retourne une promesse resolue a la fin, cancel, finish, pause et resume completent le pilotage."
      >
        <UseAnimateDemo />
        <CodeBlock
          lang="tsx"
          code={`import { getMotionPreset, useAnimate } from '@odoro-cli/libs/motion'

const [ref, controls] = useAnimate<HTMLSpanElement>()

const secouer = () => {
  const { keyframes, duration, easing } = getMotionPreset('shake')
  void controls.play([...keyframes], { duration, easing })
}

return <span ref={ref} className="o-badge">3 erreurs</span>`}
        />
      </Section>

      <Section
        title="usePresence"
        lead="React demonte un element des que sa condition devient fausse ; ce hook garde isMounted a true le temps de l'animation de sortie. Sous prefers-reduced-motion, le demontage redevient immediat."
      >
        <UsePresenceDemo />
        <CodeBlock
          lang="tsx"
          code={`import { usePresence } from '@odoro-cli/libs/motion'

const { ref, isMounted, status } = usePresence<HTMLDivElement>(open, {
  exit: { opacity: 0, transform: 'scale(0.96)' },
  duration: 'base',
})

if (!isMounted) return null
return <div ref={ref}>...</div>`}
        />
      </Section>

      <Section
        title="useInView"
        lead="Un booleen qui suit la presence de l'element dans le viewport. once fige la valeur a true apres la premiere entree — le cas courant des revelations."
      >
        <UseInViewDemo />
        <CodeBlock
          lang="tsx"
          code={`import { useInView } from '@odoro-cli/libs/motion'

const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.6 })

return <div ref={ref} className={inView ? 'o-animate-fade-in-up' : 'o-invisible'} />`}
        />
      </Section>

      <Section
        title="useScrollProgress"
        lead="La progression du defilement de la page, entre 0 et 1, mesuree dans un requestAnimationFrame coalescant. useElementScrollProgress fait de meme pour la traversee d'un element."
      >
        <UseScrollProgressDemo />
        <CodeBlock
          lang="tsx"
          code={`import { useScrollProgress } from '@odoro-cli/libs/motion'

const progress = useScrollProgress()

return (
  <div
    className="o-fixed o-top-0 o-left-0 o-h-1 o-bg-brand-600 dark:o-bg-brand-400"
    style={{ width: \`\${progress * 100}%\` }}
  />
)`}
        />
      </Section>
    </article>
  )
}
