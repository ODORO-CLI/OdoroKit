/**
 * Galaxie spirale : des bras de points en rotation lente autour d'un coeur
 * lumineux.
 *
 * ## Le principe
 *
 * Le plan est lu en polaire et tordu par le logarithme du rayon : dans ce
 * domaine, une droite devient une spirale logarithmique, et un cosinus de
 * l'angle tordu donne les bras. Les points y sont haches par cellule, mais
 * leur halo est mesure en distance reelle : un disque reste un disque.
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

import { GALAXY_SPIRAL_FRAGMENT } from './galaxy-spiral.shader.js'

/** Ce que l'echappatoire recoit. */
export interface GalaxySpiralControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface GalaxySpiralOwnProps {
  /** Vitesse de la rotation. @defaultValue 0.5 */
  speed?: number
  /** Nombre de bras. @defaultValue 2 */
  arms?: number
  /** Torsion des bras. Plus haut, plus enroules. @defaultValue 3 */
  twist?: number
  /** Nombre de cellules radiales. @defaultValue 18 */
  density?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<GalaxySpiralControls>
}

/** Toutes les proprietes. */
export type GalaxySpiralProps = Customisable<GalaxySpiralOwnProps>

/** Tokens employes par defaut : le fond, les bras, le coeur. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-400',
  '--o-palette-amber-200',
] as const

/** Repli par defaut : un halo fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-violet-200 dark:o-via-violet-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Couches hors qualite basse.
 *
 * Chaque couche parcourt neuf cellules par fragment, avec un logarithme et
 * un cosinus par cellule : c'est le seul levier de cout du shader.
 */
const LAYERS = 2

/** Couches en qualite basse. */
const LOW_LAYERS = 1

/**
 * Galaxie spirale.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GalaxySpiral className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GalaxySpiral({
  speed = 0.5,
  arms = 2,
  twist = 3,
  density = 18,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GalaxySpiralProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: GALAXY_SPIRAL_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uArms: arms,
      uTwist: twist,
      uDensity: density,
      uLayers: LAYERS,
    },
    name: 'galaxy-spiral',
    degrade: (quality) => ({ uLayers: quality === 'low' ? LOW_LAYERS : LAYERS }),
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
