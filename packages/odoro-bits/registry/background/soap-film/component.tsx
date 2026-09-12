/**
 * Film de savon : un film mince irise qui s'ecoule vers le bas.
 *
 * ## Le principe
 *
 * L'epaisseur du film est un bruit fractal ; la teinte en depend comme dans
 * une interference reelle — un tour complet par bande — mais ce sont deux
 * tokens qui tournent l'un vers l'autre, pas un spectre ecrit en dur. Le
 * domaine glisse, les franges descendent ; la ou le film s'amincit, le fond
 * apparait au travers.
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

import { SOAP_FILM_FRAGMENT } from './soap-film.shader.js'

/** Ce que l'echappatoire recoit. */
export interface SoapFilmControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface SoapFilmOwnProps {
  /** Vitesse de la derive des epaisseurs. @defaultValue 0.15 */
  speed?: number
  /** Ecoulement vers le bas. @defaultValue 0.4 */
  drain?: number
  /** Echelle du champ d'epaisseur. @defaultValue 1.5 */
  scale?: number
  /** Tours de teinte sur toute l'epaisseur. @defaultValue 4 */
  bands?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<SoapFilmControls>
}

/** Toutes les proprietes. */
export type SoapFilmProps = Customisable<SoapFilmOwnProps>

/** Tokens employes par defaut : le fond, les deux teintes du film. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-cyan-400',
  '--o-palette-fuchsia-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-cyan-300 dark:o-via-cyan-900 o-to-fuchsia-300 dark:o-to-fuchsia-900'

/**
 * Detail du bruit hors qualite basse.
 *
 * L'epaisseur est le seul bruit somme du shader : c'est le seul levier de
 * cout, et il n'a pas besoin d'etre une prop pour etre retrograde.
 */
const OCTAVES = 4

/** Detail du bruit en qualite basse. */
const LOW_OCTAVES = 2

/**
 * Film de savon.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <SoapFilm className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function SoapFilm({
  speed = 0.15,
  drain = 0.4,
  scale = 1.5,
  bands = 4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SoapFilmProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SOAP_FILM_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uDrain: drain,
      uScale: scale,
      uBands: bands,
      uOctaves: OCTAVES,
    },
    name: 'soap-film',
    degrade: (quality) => ({
      uOctaves: quality === 'low' ? LOW_OCTAVES : OCTAVES,
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
