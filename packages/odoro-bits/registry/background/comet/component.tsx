/**
 * Comete : une tete vive qui suit le curseur avec retard, queue au vent.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec un amortissement volontairement lent : la
 * comete rattrape le curseur, et sa queue s'oriente a l'oppose de la vitesse
 * de rattrapage — le composant derive cette vitesse du point amorti et la
 * transmet en uniform. Comete arrivee, vitesse nulle, queue eteinte : il ne
 * reste que la tete qui scintille.
 *
 * ## Le pont pointeur → shader
 *
 * Aucun rendu React par image : position et vitesse sont recopiees dans deux
 * tableaux stables par une souscription a l'horloge du moteur, et la surface
 * relit ses uniforms a chaque image — la mutation suffit. La vitesse est
 * elle-meme lissee d'un cran, sans quoi la queue tremblerait au moindre bruit
 * d'echantillonnage.
 *
 * ## Sous mouvement reduit
 *
 * La surface est refusee par le moteur et le repli statique s'affiche.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

import { COMET_FRAGMENT } from './comet.shader.js'

/** Ce que l'echappatoire recoit. */
export interface CometControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface CometOwnProps {
  /** Rayon de la tete. @defaultValue 0.07 */
  size?: number
  /** Longueur de la queue. @defaultValue 0.45 */
  tail?: number
  /** Retard de la comete : plus haut, plus elle traine. @defaultValue 1 */
  lag?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<CometControls>
}

/** Toutes les proprietes. */
export type CometProps = Customisable<CometOwnProps>

/** Tokens employes par defaut : le ciel, la queue, la tete. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-400',
  '--o-palette-amber-200',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-indigo-950 o-to-violet-950'

/**
 * Comete.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Comet className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Comet({
  size = 0.07,
  tail = 0.45,
  lag = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CometProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableaux stables, mutes en place dans la boucle : aucun setState par image.
  const uPointer = useRef<number[]>([0.5, 0.5]).current
  const uVelocity = useRef<number[]>([0, 0]).current

  // Le retard est une vitesse d'amortissement inversee : lag 1 donne le
  // rattrapage lent (vitesse 2) qui fait exister la queue.
  const pointer = usePointerDamped({
    host,
    speed: 2 / Math.max(lag, 0.1),
    name: 'comet : pointeur',
  })

  useEffect(() => {
    let previousX = 0.5
    let previousY = 0.5

    const subscription = clock.subscribe(
      ({ delta }) => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture.
        const x = (pointer.current.x + 1) / 2
        const y = 1 - (pointer.current.y + 1) / 2

        // Vitesse du point amorti, lissee d'un cran : brute, elle porterait le
        // bruit d'echantillonnage et la queue tremblerait.
        const dt = Math.max(delta, 1 / 240)
        const vx = uVelocity[0] ?? 0
        const vy = uVelocity[1] ?? 0
        uVelocity[0] = vx + ((x - previousX) / dt - vx) * 0.25
        uVelocity[1] = vy + ((y - previousY) / dt - vy) * 0.25

        uPointer[0] = x
        uPointer[1] = y
        previousX = x
        previousY = y
      },
      { priority: CLOCK_PRIORITY.input, name: 'comet : pont' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer, uVelocity])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: COMET_FRAGMENT,
    colors,
    uniforms: { uPointer, uVelocity, uSize: size, uTail: tail },
    name: 'comet',
  })

  useOnReady(onReady, ready ? { colours, refused } : null, ref.current)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={(element) => {
        setHost(element)
        setShaderHost(element)
        ref.current = element
      }}
      className={className}
      style={style}
      aria-hidden
    >
      {ready && refused === undefined ? null : (
        <div className={`o-absolute o-inset-0 ${fallback}`} />
      )}
    </div>
  )
}
