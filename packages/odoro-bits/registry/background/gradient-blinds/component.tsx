/**
 * Stores de degrade : des lamelles devant un degrade, dont l ouverture suit une vague qui traverse le store d un bord a l autre.
 *
 * ## Le principe
 *
 * Chaque lamelle est une cellule d'une grille en x ; son ouverture est
 * une fraction de la cellule qui suit une onde traversant les lamelles,
 * inclinee par une seconde onde en y. Derriere, un degrade entre deux
 * tokens le long d'une diagonale qui derive ; devant, la lamelle fermee
 * est le fond lui-meme, a peine teinte.
 *
 * ## Ce que ce composant delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur — les recopier ici en ferait autant
 * de versions a maintenir qu'il y a de fonds.
 *
 * Le repli n'est pas une precaution : il est affiche pendant le chargement du
 * backend, quand WebGL manque, quand l'arbitre refuse la surface — il n'en
 * accorde qu'une par backend — et sous mouvement reduit.
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

import { GRADIENT_BLINDS_FRAGMENT } from './gradient-blinds.shader.js'

/** Ce que l'echappatoire recoit. */
export interface GradientBlindsControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface GradientBlindsOwnProps {
  /** Nombre de lamelles sur la largeur. @defaultValue 14 */
  count?: number
  /** Vitesse de la vague d ouverture. @defaultValue 0.5 */
  speed?: number
  /** Ouverture moyenne, entre ferme et ouvert. @defaultValue 0.55 */
  open?: number
  /** Inclinaison des lamelles. @defaultValue 0.3 */
  tilt?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<GradientBlindsControls>
}

/** Toutes les proprietes. */
export type GradientBlindsProps = Customisable<GradientBlindsOwnProps>

/** Tokens employes par defaut : les lamelles, les deux teintes du degrade. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-orange-400',
  '--o-palette-rose-500',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-r o-from-orange-200 dark:o-from-orange-900 o-to-rose-200 dark:o-to-rose-900'

/**
 * Detail hors qualite basse.
 *
 * Le store lui-meme est une partie fractionnaire ; ce sont le liseret
 * et l'ombre, deux exponentielles, qui tombent en qualite basse.
 */
const DETAIL = 1

/** Detail en qualite basse. */
const LOW_DETAIL = 0

/**
 * Stores de degrade.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GradientBlinds className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GradientBlinds({
  count = 14,
  speed = 0.5,
  open = 0.55,
  tilt = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GradientBlindsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: GRADIENT_BLINDS_FRAGMENT,
    colors,
    uniforms: {
      uCount: count,
      uSpeed: speed,
      uOpen: open,
      uTilt: tilt,
      uDetail: DETAIL,
    },
    name: 'gradient-blinds',
    degrade: (quality) => ({
      uDetail: quality === 'low' ? LOW_DETAIL : DETAIL,
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
