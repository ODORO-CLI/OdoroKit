/**
 * Barres d'egaliseur : des barres verticales qui pulsent comme un analyseur de spectre.
 *
 * ## Le principe
 *
 * Aucun son n'est ecoute : chaque barre lit un bruit de valeur lisse en
 * temps et independant de ses voisines, sous une enveloppe qui favorise les
 * graves et un battement commun qui tient lieu de mesure. Un indicateur de
 * crete, lu plus lentement, retombe apres la barre.
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

import { AUDIO_BARS_FRAGMENT } from './audio-bars.shader.js'

/** Ce que l'echappatoire recoit. */
export interface AudioBarsControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface AudioBarsOwnProps {
  /** Nombre de barres. Borne a quatre-vingt-seize par le shader. @defaultValue 48 */
  bars?: number
  /** Vitesse du spectre. @defaultValue 1 */
  speed?: number
  /** Espace entre barres, en fraction de leur pas. @defaultValue 0.35 */
  gap?: number
  /** Segments par barre. Zero donne des barres pleines. @defaultValue 24 */
  segments?: number
  /** Spectre symetrique autour du milieu. @defaultValue false */
  mirror?: boolean
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<AudioBarsControls>
}

/** Toutes les proprietes. */
export type AudioBarsProps = Customisable<AudioBarsOwnProps>

/** Tokens employes par defaut : le fond, le pied des barres, leur sommet. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-amber-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-brand-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Nombre de barres en qualite basse.
 *
 * Le cout par fragment ne bouge pas avec le nombre de barres. Ce qui bouge,
 * c'est la largeur des segments et des espaces : sous deux pixels, ils
 * scintillent. Moins de barres, plus larges, et le trame tient.
 */
const LOW_BARS = 24

/**
 * Barres d'egaliseur.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <AudioBars className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function AudioBars({
  bars = 48,
  speed = 1,
  gap = 0.35,
  segments = 24,
  mirror = false,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: AudioBarsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: AUDIO_BARS_FRAGMENT,
    colors,
    uniforms: {
      uBars: bars,
      uSpeed: speed,
      uGap: gap,
      uSegments: segments,
      uMirror: mirror ? 1 : 0,
    },
    name: 'audio-bars',
    degrade: (quality) => ({
      uBars: quality === 'low' ? Math.min(bars, LOW_BARS) : bars,
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
