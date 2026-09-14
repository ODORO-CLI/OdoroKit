/**
 * Brume basse : deux nappes qui glissent en sens contraires au bas du cadre.
 *
 * ## Le principe
 *
 * Chaque nappe est un bruit fractal etire en largeur, dense au bas et
 * dissoute au-dessus d'une crete que le bruit dessine. Le plan lointain
 * monte plus haut, froid et fin ; le proche reste bas, dense, dans le neutre
 * du theme. Leur parallaxe fait la profondeur. Distinct de la fumee, qui
 * monte en volutes : ici la brume s'etale et reste au sol.
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

import { FOG_DRIFT_FRAGMENT } from './fog-drift.shader.js'

/** Ce que l'echappatoire recoit. */
export interface FogDriftControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface FogDriftOwnProps {
  /** Vitesse de glissement. @defaultValue 0.5 */
  speed?: number
  /** Hauteur de la brume, en fraction du cadre. @defaultValue 0.45 */
  height?: number
  /** Opacite maximale des nappes. @defaultValue 0.8 */
  density?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<FogDriftControls>
}

/** Toutes les proprietes. */
export type FogDriftProps = Customisable<FogDriftOwnProps>

/**
 * Tokens employes par defaut : le fond, la nappe proche, la nappe lointaine.
 *
 * Le neutre du theme fait la nappe proche : il grise un fond clair et
 * eclaircit un fond sombre, ce qui est exactement ce qu'une brume fait.
 */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-palette-sky-300'] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-zinc-200 dark:o-from-zinc-800 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Detail du bruit hors qualite basse.
 *
 * Deux nappes, une somme d'octaves chacune : chaque octave se paie deux
 * fois. C'est le seul levier de cout du shader.
 */
const OCTAVES = 4

/** Detail du bruit en qualite basse. */
const LOW_OCTAVES = 2

/**
 * Brume basse.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <FogDrift className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function FogDrift({
  speed = 0.5,
  height = 0.45,
  density = 0.8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FogDriftProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: FOG_DRIFT_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uHeight: height, uDensity: density, uOctaves: OCTAVES },
    name: 'fog-drift',
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
