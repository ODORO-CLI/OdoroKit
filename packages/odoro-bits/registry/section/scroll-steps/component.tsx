/**
 * Etapes au defilement : un media colle, des etapes qui defilent.
 *
 * ## L'index ne change qu'au passage d'une etape
 *
 * La progression du defilement est continue, l'etape active ne l'est pas. Si
 * l'etat React suivait la progression, il changerait a chaque image et
 * provoquerait un rendu par image — pour afficher le meme media la plupart du
 * temps.
 *
 * La progression est donc lue dans la boucle, mais l'etat n'est ecrit que
 * lorsque l'index calcule differe de celui en cours. Sur une section de quatre
 * etapes, cela fait trois rendus au lieu de plusieurs centaines.
 *
 * ## Ce qui reste lisible sans defilement
 *
 * Toutes les etapes sont dans le document, dans l'ordre, et le media porte le
 * nom de l'etape active. Sur un petit ecran, la colonne collee passe au-dessus
 * et le contenu se lit comme une suite ordinaire. Une section qui n'existerait
 * qu'au defilement serait vide pour qui ne defile pas.
 *
 * @module
 */

import {
  mergePresentation,
  useMotionState,
  useScrollProgress,
  type Customisable,
} from 'odoro-engine'
import { useCallback, useRef, useState, type ReactElement, type ReactNode } from 'react'

/** Une etape. */
export interface Step {
  /** Intitule. */
  readonly title: string
  /** Contenu. */
  readonly body: ReactNode
}

/** Proprietes propres au composant. */
export interface ScrollStepsOwnProps {
  /** Les etapes, dans l'ordre de lecture. */
  steps: readonly Step[]
  /** Rend le media pour l'etape active. */
  render: (index: number) => ReactNode
  /** Nom de la section, annonce aux technologies d'assistance. */
  label: string
}

/** Toutes les proprietes. */
export type ScrollStepsProps = Customisable<ScrollStepsOwnProps>

/**
 * Fait suivre un media aux etapes d'un texte.
 *
 * @example
 * <ScrollSteps
 *   label="Comment ca marche"
 *   steps={[
 *     { title: 'Ecrire', body: <p>Une entree de registre…</p> },
 *     { title: 'Valider', body: <p>Le schema refuse…</p> },
 *   ]}
 *   render={(index) => <Illustration etape={index} />}
 * />
 */
export function ScrollSteps({
  steps,
  render,
  label,
  ...rest
}: ScrollStepsProps): ReactElement {
  const { reduced } = useMotionState()
  const [active, setActive] = useState(0)
  const current = useRef(0)

  const onProgress = useCallback(
    (progress: number) => {
      const index = Math.min(
        steps.length - 1,
        Math.max(0, Math.floor(progress * steps.length)),
      )
      // L'etat n'est ecrit qu'au passage d'une etape : la progression est
      // continue, l'index ne l'est pas.
      if (index !== current.current) {
        current.current = index
        setActive(index)
      }
    },
    [steps.length],
  )

  const { ref } = useScrollProgress<HTMLDivElement>(onProgress, {
    name: 'etapes au defilement',
  })

  const { className, style } = mergePresentation(
    { className: 'o-grid o-gap-8 lg:o-grid-cols-2' },
    rest,
  )

  return (
    <section {...rest} ref={ref} aria-label={label} className={className} style={style}>
      {/*
        Sur petit ecran, la colonne collee passe au-dessus et cesse de coller :
        deux colonnes empilees dont l'une reste figee donneraient un media qui
        recouvre le texte.
      */}
      <div className="lg:o-sticky lg:o-top-24 lg:o-self-start">
        <div className="o-overflow-hidden o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800">
          {render(active)}
        </div>
      </div>

      <ol className="o-flex o-flex-col o-gap-10">
        {steps.map((step, index) => (
          <li
            key={step.title}
            aria-current={index === active ? 'step' : undefined}
            className="o-flex o-flex-col o-gap-2 o-transition-opacity"
            style={{ opacity: reduced || index === active ? 1 : 0.45 }}
          >
            <span className="o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-500">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="o-text-xl o-font-semibold o-tracking-tight">{step.title}</h3>
            <div className="o-text-zinc-500 dark:o-text-zinc-400">{step.body}</div>
          </li>
        ))}
      </ol>
    </section>
  )
}
