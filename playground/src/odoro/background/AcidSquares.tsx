/**
 * Carres acides : des carres imbriques qui tournent en decalage, en
 * couleurs acides.
 *
 * ## Pourquoi les couleurs sont crues
 *
 * L'effet vit du contraste entre deux teintes qui alternent : des nuances
 * proches donneraient un moire gris. Les tokens par defaut sont donc pris
 * loin l'un de l'autre sur le cercle des teintes, et loin du fond.
 *
 * ## Ce que ce composant delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur.
 *
 * Le repli n'est pas une precaution : il est affiche pendant le chargement du
 * backend, quand WebGL manque, quand l'arbitre refuse la surface et sous
 * mouvement reduit.
 *
 * @module
 */

import {
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

import { ACID_SQUARES_FRAGMENT } from './acid-squares.shader.js'

/** Ce que l'echappatoire recoit. */
export interface AcidSquaresControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface AcidSquaresOwnProps {
  /** Vitesse de rotation du carre exterieur. @defaultValue 0.25 */
  speed?: number
  /** Nombre de carres imbriques par cellule. @defaultValue 7 */
  rings?: number
  /** Nombre de cellules sur la hauteur. @defaultValue 2 */
  density?: number
  /** Decalage angulaire entre deux carres voisins, en radians. @defaultValue 0.12 */
  twist?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<AcidSquaresControls>
}

/** Toutes les proprietes. */
export type AcidSquaresProps = Customisable<AcidSquaresOwnProps>

/** Tokens employes par defaut : le fond, puis les deux teintes alternees. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-lime-400',
  '--o-palette-fuchsia-500',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-lime-200 dark:o-via-lime-900 o-to-fuchsia-100 dark:o-to-fuchsia-950'

/**
 * Carres imbriques en qualite basse.
 *
 * Chaque carre est une rotation et une distance par fragment : c'est le
 * seul levier de cout, et il n'a pas besoin d'etre une prop pour etre
 * retrograde.
 */
const LOW_RINGS = 4

/**
 * Carres acides.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <AcidSquares className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function AcidSquares({
  speed = 0.25,
  rings = 7,
  density = 2,
  twist = 0.12,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: AcidSquaresProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: ACID_SQUARES_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uRings: rings, uDensity: density, uTwist: twist },
    name: 'acid-squares',
    degrade: (quality) => ({
      uRings: quality === 'low' ? Math.min(rings, LOW_RINGS) : rings,
    }),
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
