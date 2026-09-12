/**
 * Pollen : des grains lents sur deux plans, flou de profondeur et parallaxe
 * sous le pointeur.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : les deux plans se decalent
 * en sens inverse de son mouvement, le proche davantage que le lointain.
 * C'est la parallaxe qui fait lire deux distances plutot que deux tailles. A
 * la sortie du cadre, le hook ramene la cible au centre.
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

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped'

import { POLLEN_FRAGMENT } from './pollen.shader.js'

/** Ce que l'echappatoire recoit. */
export interface PollenControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface PollenOwnProps {
  /** Vitesse de la derive. @defaultValue 0.35 */
  speed?: number
  /** Densite du plan lointain. @defaultValue 11 */
  density?: number
  /** Flou du plan proche. @defaultValue 0.6 */
  blur?: number
  /** Amplitude de la parallaxe sous le pointeur. @defaultValue 1 */
  parallax?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<PollenControls>
}

/** Toutes les proprietes. */
export type PollenProps = Customisable<PollenOwnProps>

/** Tokens employes par defaut : le fond, les grains lointains, les proches. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-lime-400',
  '--o-palette-amber-300',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-lime-200 dark:o-to-lime-950'

/**
 * Rayon de cellules parcouru hors qualite basse.
 *
 * Un rayon de un lit neuf cellules par plan ; un rayon de zero n'en lit
 * qu'une, et un grain ne deborde plus de sa cellule. C'est le seul levier de
 * cout du shader, et il ne se voit qu'aux bords des grains proches.
 */
const SPREAD = 1

/** Rayon de cellules en qualite basse. */
const LOW_SPREAD = 0

/**
 * Pollen.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Pollen className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Pollen({
  speed = 0.35,
  density = 11,
  blur = 0.6,
  parallax = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PollenProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place : la surface relit les uniforms a chaque
  // image, l'identite ne change pas, la mutation suffit — aucun setState.
  const uPointer = useRef<number[]>([0, 0]).current

  const pointer = usePointerDamped({ host, speed: 2.5, name: 'pollen : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Le repere du hook est centre, y vers le bas ; le shader travaille
        // centre aussi, mais y vers le haut.
        uPointer[0] = pointer.current.x
        uPointer[1] = -pointer.current.y
      },
      { priority: CLOCK_PRIORITY.input, name: 'pollen : pont' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  const { ref, setHost: setShaderHost, ready, refused, colours } =
    useTokenShader<HTMLDivElement>({
      fragment: POLLEN_FRAGMENT,
      colors,
      uniforms: {
        uPointer,
        uSpeed: speed,
        uDensity: density,
        uBlur: blur,
        uParallax: parallax,
        uSpread: SPREAD,
      },
      name: 'pollen',
      degrade: (quality) => ({ uSpread: quality === 'low' ? LOW_SPREAD : SPREAD }),
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
