/**
 * Tuiles qui se retournent : des ondes de retournement autour du pointeur.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : les tuiles proches se
 * retournent en ondes concentriques et decouvrent leur face arriere ; celles
 * qu'il quitte retombent a plat. A la sortie du cadre, le hook ramene la
 * cible au centre, et les ondes y continuent doucement.
 *
 * ## Le pont pointeur -> shader
 *
 * Aucun rendu React par image : un tableau stable de deux flottants est mute
 * en place dans la boucle du moteur, en priorite d'entree, et la surface le
 * relit a chaque image.
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

import { TILES_FLIP_FRAGMENT } from './tiles-flip.shader.js'

/** Ce que l'echappatoire recoit. */
export interface TilesFlipControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface TilesFlipOwnProps {
  /** Vitesse de propagation des ondes. @defaultValue 1 */
  speed?: number
  /** Nombre de tuiles sur la hauteur. @defaultValue 12 */
  density?: number
  /** Portee des ondes autour du pointeur, en hauteurs de cadre. @defaultValue 0.4 */
  radius?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<TilesFlipControls>
}

/** Toutes les proprietes. */
export type TilesFlipProps = Customisable<TilesFlipOwnProps>

/** Tokens employes par defaut : le fond, la face avant, la face arriere. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-teal-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Tuiles qui se retournent.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <TilesFlip className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function TilesFlip({
  speed = 1,
  density = 12,
  radius = 0.4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: TilesFlipProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place : la surface relit les uniforms a chaque
  // image, l'identite ne change pas, la mutation suffit — aucun setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 3, name: 'tuiles : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture
        // (coin bas-gauche, y vers le haut).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'tuiles : pont' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: TILES_FLIP_FRAGMENT,
    colors,
    uniforms: { uPointer, uSpeed: speed, uDensity: density, uRadius: radius },
    name: 'tiles-flip',
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
