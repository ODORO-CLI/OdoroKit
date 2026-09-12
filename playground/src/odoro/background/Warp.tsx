/**
 * Hyperespace : des etoiles etirees radialement, sur trois profondeurs.
 *
 * ## Le principe
 *
 * En polaires, une etoile qui fonce ne bouge que sur le rayon : la grille est posee sur (angle, 1/r), et le temps ne fait que glisser la coordonnee radiale.
 *
 * Trois grilles decalees, aux vitesses distinctes, font les trois profondeurs — c est toute la parallaxe.
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

import { WARP_FRAGMENT } from './warp.shader.js'

/** Ce que l'echappatoire recoit. */
export interface WarpControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface WarpOwnProps {
  /** Vitesse du defilement radial. @defaultValue 0.8 */
  speed?: number
  /** Nombre de couloirs angulaires de la premiere couche. @defaultValue 24 */
  density?: number
  /** Longueur des trainees, de 0 a 1. @defaultValue 0.35 */
  stretch?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<WarpControls>
}

/** Toutes les proprietes. */
export type WarpProps = Customisable<WarpOwnProps>

/** Tokens employes par defaut : le fond, les etoiles proches, les lointaines. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-blue-300',
  '--o-palette-violet-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/** Nombre de couches de profondeur hors qualite basse. */
const LAYERS = 3

/** Nombre de couches en qualite basse. */
const LOW_LAYERS = 2

/**
 * Hyperespace.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Warp className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Warp({
  speed = 0.8,
  density = 24,
  stretch = 0.35,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: WarpProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: WARP_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uStretch: stretch, uLayers: LAYERS },
    name: 'warp',
    // Chaque couche refait tout le travail — hachage, trait, trainee — par
    // fragment : c'est le reglage qui pese, donc celui qui est retire. La
    // couche lointaine part la premiere, elle est la moins lisible.
    degrade: (quality) => ({
      uLayers: quality === 'low' ? LOW_LAYERS : LAYERS,
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
