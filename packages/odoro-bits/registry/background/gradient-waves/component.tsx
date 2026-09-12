/**
 * Vagues de degrade : des bandes de degrade repete, sans trait ni marche, deplacees par une houle qui ne se referme jamais.
 *
 * ## Le principe
 *
 * Un degrade repete en bandes horizontales — fond, premiere teinte,
 * seconde teinte, fond — dont la hauteur est deplacee par une somme de
 * sinus a frequences non multiples et a vitesses opposees. Ni trait ni
 * marche : des nappes qui glissent l'une sur l'autre, et une douceur qui
 * va de bandes franches a un seul degrade ondulant.
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

import { GRADIENT_WAVES_FRAGMENT } from './gradient-waves.shader.js'

/** Ce que l'echappatoire recoit. */
export interface GradientWavesControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface GradientWavesOwnProps {
  /** Nombre de bandes sur la hauteur. @defaultValue 4 */
  bands?: number
  /** Hauteur de la houle, en fraction du cadre. @defaultValue 0.12 */
  amplitude?: number
  /** Vitesse de la houle. @defaultValue 0.4 */
  speed?: number
  /** Largeur des transitions. Bas, les bandes sont franches. @defaultValue 0.6 */
  softness?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<GradientWavesControls>
}

/** Toutes les proprietes. */
export type GradientWavesProps = Customisable<GradientWavesOwnProps>

/** Tokens employes par defaut : le fond, les deux teintes des bandes. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-indigo-400',
  '--o-palette-cyan-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-indigo-200 dark:o-via-indigo-900 o-to-cyan-200 dark:o-to-cyan-900'

/**
 * Detail hors qualite basse.
 *
 * Le nombre de bandes est une frequence, pas une boucle. Ce sont les
 * harmoniques de la houle qui sont bornees.
 */
const DETAIL = 3

/** Detail en qualite basse. */
const LOW_DETAIL = 1

/**
 * Vagues de degrade.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GradientWaves className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GradientWaves({
  bands = 4,
  amplitude = 0.12,
  speed = 0.4,
  softness = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GradientWavesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: GRADIENT_WAVES_FRAGMENT,
    colors,
    uniforms: {
      uBands: bands,
      uAmplitude: amplitude,
      uSpeed: speed,
      uSoftness: softness,
      uDetail: DETAIL,
    },
    name: 'gradient-waves',
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
