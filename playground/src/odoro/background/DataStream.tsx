/**
 * Flux de donnees : des segments qui defilent en couloirs, chacun a son
 * sens et sa vitesse, la tete relevee.
 *
 * ## Le principe
 *
 * L'ecran est decoupe en couloirs independants ; chacun tire son sens, sa
 * vitesse et son depart, et numerote des cases dont chacune porte un
 * segment ou rien. Le bout qui avance est releve : c'est ce qui donne le
 * sens de la marche, sans fleche.
 *
 * Ce qui distingue cette entree de `rain` et de `code-rain` : le flux est
 * horizontal, en deux sens, et fait de segments pleins ; et de
 * `hyperspace` : aucune perspective, des couloirs plats.
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

import { DATA_STREAM_FRAGMENT } from './data-stream.shader.js'

/** Ce que l'echappatoire recoit. */
export interface DataStreamControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface DataStreamOwnProps {
  /** Nombre de couloirs sur la hauteur. Borne a quatre-vingts par le shader. @defaultValue 24 */
  lanes?: number
  /** Vitesse moyenne du defilement. @defaultValue 1 */
  speed?: number
  /** Nombre de cases par unite de largeur. @defaultValue 6 */
  density?: number
  /** Epaisseur des segments, en fraction de couloir. @defaultValue 0.35 */
  thickness?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<DataStreamControls>
}

/** Toutes les proprietes. */
export type DataStreamProps = Customisable<DataStreamOwnProps>

/** Tokens employes par defaut : le fond, les segments, leur tete. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-blue-500',
  '--o-theme-fg',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Flux de donnees.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <DataStream className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function DataStream({
  lanes = 24,
  speed = 1,
  density = 6,
  thickness = 0.35,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: DataStreamProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: DATA_STREAM_FRAGMENT,
    colors,
    uniforms: {
      uLanes: lanes,
      uSpeed: speed,
      uDensity: density,
      uThickness: thickness,
    },
    name: 'data-stream',
    // Des couloirs serres scintillent sur leurs bords a densite de pixels
    // reduite : en qualite basse, ils s'elargissent.
    degrade: (quality) => ({
      uLanes: quality === 'low' ? Math.min(lanes, 14) : lanes,
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
