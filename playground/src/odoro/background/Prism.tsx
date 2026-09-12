/**
 * Prisme : un faisceau blanc entre par la gauche, traverse un prisme et ressort en eventail, disperse entre deux teintes du projet.
 *
 * ## Le principe
 *
 * Trois pieces dans l'ordre ou la lumiere les traverse : un faisceau,
 * distance a un segment ; un prisme, distance signee a un triangle dont
 * seule l'arete brille ; une dispersion, eventail d'angles a la sortie ou
 * la teinte tourne d'un token a l'autre — un spectre entre deux couleurs
 * du projet, pas un arc-en-ciel ecrit en dur.
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

import { PRISM_FRAGMENT } from './prism.shader.js'

/** Ce que l'echappatoire recoit. */
export interface PrismControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface PrismOwnProps {
  /** Position horizontale du prisme, en fraction du cadre. @defaultValue 0.42 */
  x?: number
  /** Position verticale du prisme, en fraction du cadre. @defaultValue 0.5 */
  y?: number
  /** Ouverture de l eventail, en radians. @defaultValue 0.6 */
  spread?: number
  /** Nombre de raies dans le spectre. @defaultValue 6 */
  bands?: number
  /** Vitesse de la respiration et du scintillement. @defaultValue 0.5 */
  speed?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<PrismControls>
}

/** Toutes les proprietes. */
export type PrismProps = Customisable<PrismOwnProps>

/** Tokens employes par defaut : le fond, le debut et la fin du spectre. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-amber-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-violet-200 dark:o-via-violet-900 o-to-amber-200 dark:o-to-amber-900'

/**
 * Detail hors qualite basse.
 *
 * L'eventail est l'essentiel ; le faisceau et le prisme sont deux
 * distances de plus, et ce sont elles qui tombent en qualite basse.
 */
const DETAIL = 3

/** Detail en qualite basse. */
const LOW_DETAIL = 1

/**
 * Prisme.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Prism className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Prism({
  x = 0.42,
  y = 0.5,
  spread = 0.6,
  bands = 6,
  speed = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PrismProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: PRISM_FRAGMENT,
    colors,
    uniforms: {
      uX: x,
      uY: y,
      uSpread: spread,
      uBands: bands,
      uSpeed: speed,
      uDetail: DETAIL,
    },
    name: 'prism',
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
