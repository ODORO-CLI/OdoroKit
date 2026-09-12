/**
 * Circuit imprime : des pistes tirees par tuiles, des pastilles a leurs
 * extremites, et des impulsions qui les parcourent.
 *
 * ## Le principe
 *
 * Chaque tuile tire un trait droit ou un coude ; deux voisines qui
 * s'ouvrent l'une vers l'autre se raccordent d'elles-memes, et un bord
 * ouvert d'un seul cote porte une pastille. Aucun chemin n'est construit.
 * Les impulsions courent le long de l'axe de chaque piste, avec une graine
 * par rangee ou par colonne pour qu'elles ne pulsent pas en choeur.
 *
 * Ce qui distingue cette entree de `maze` : des pastilles aux extremites,
 * des coudes droits, et des impulsions plutot qu'une tete qui dessine ; et
 * de `truchet` : rien ne pivote, les pistes sont fixes et parcourues.
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

import { CIRCUIT_FRAGMENT } from './circuit.shader.js'

/** Ce que l'echappatoire recoit. */
export interface CircuitControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface CircuitOwnProps {
  /** Nombre de tuiles sur la hauteur. Borne a quarante par le shader. @defaultValue 10 */
  cells?: number
  /** Epaisseur des pistes, en fraction de tuile. @defaultValue 0.08 */
  width?: number
  /** Vitesse des impulsions. @defaultValue 1 */
  speed?: number
  /** Part des pistes parcourues a un instant donne. Zero les eteint. @defaultValue 0.5 */
  pulses?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<CircuitControls>
}

/** Toutes les proprietes. */
export type CircuitProps = Customisable<CircuitOwnProps>

/** Tokens employes par defaut : le substrat, les pistes, les impulsions. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-emerald-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Circuit imprime.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Circuit className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Circuit({
  cells = 10,
  width = 0.08,
  speed = 1,
  pulses = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CircuitProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CIRCUIT_FRAGMENT,
    colors,
    uniforms: { uCells: cells, uWidth: width, uSpeed: speed, uPulses: pulses },
    name: 'circuit',
    // Des pistes fines sur des tuiles petites scintillent a densite de
    // pixels reduite : en qualite basse, les tuiles s'elargissent.
    degrade: (quality) => ({
      uCells: quality === 'low' ? Math.min(cells, 6) : cells,
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
