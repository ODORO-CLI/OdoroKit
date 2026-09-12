/**
 * Radar : un balayage circulaire, des graduations, des echos qui decroissent.
 *
 * ## Le principe
 *
 * La difference entre l'angle du pixel et l'angle du temps, repliee modulo
 * 2pi, donne l'age du dernier passage : une exponentielle de cet age fait la
 * trainee. Les anneaux sont la partie fractionnaire du rayon, seuillee, et les
 * echos s'allument au passage du faisceau puis decroissent.
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

import { RADAR_FRAGMENT } from './radar.shader.js'

/** Ce que l'echappatoire recoit. */
export interface RadarControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface RadarOwnProps {
  /** Vitesse de rotation du balayage. @defaultValue 0.5 */
  speed?: number
  /** Nombre d'anneaux de graduation. @defaultValue 4 */
  rings?: number
  /** Persistance de la trainee et des echos. @defaultValue 0.7 */
  fade?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<RadarControls>
}

/** Toutes les proprietes. */
export type RadarProps = Customisable<RadarOwnProps>

/** Tokens employes par defaut : l'ecran, les graduations, le faisceau. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-green-500',
  '--o-palette-green-200',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Radar.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Radar className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Radar({
  speed = 0.5,
  rings = 4,
  fade = 0.7,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: RadarProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: RADAR_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uRings: rings, uFade: fade, uEchos: 3 },
    name: 'radar',
    // Le balayage et les anneaux sont des soustractions ; ce sont les echos —
    // une exponentielle et une tache chacun — qui pesent, donc ils sont bornes.
    degrade: (quality) => ({
      uEchos: quality === 'low' ? 1 : 3,
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
