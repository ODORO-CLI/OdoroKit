/**
 * Voronoi : des cellules aux aretes exactes tracees en neon.
 *
 * ## Ce qui le distingue du pavage cellulaire
 *
 * Le pavage cellulaire approche ses aretes par la seconde distance ; ici,
 * l'arete est calculee exactement, par les mediatrices, et c'est ce qui
 * permet d'y accrocher un trait fin et un halo d'une largeur constante.
 * Chaque cellule porte en plus sa nuance et montre son germe.
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

import { VORONOI_FRAGMENT } from './voronoi.shader.js'

/** Ce que l'echappatoire recoit. */
export interface VoronoiControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface VoronoiOwnProps {
  /** Vitesse de derive des germes. @defaultValue 0.4 */
  speed?: number
  /** Nombre de cellules sur la hauteur. @defaultValue 5 */
  density?: number
  /** Portee du halo des aretes, en cellules. @defaultValue 0.08 */
  glow?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<VoronoiControls>
}

/** Toutes les proprietes. */
export type VoronoiProps = Customisable<VoronoiOwnProps>

/** Tokens employes par defaut : le fond, les aretes, la teinte des cellules. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-cyan-400',
  '--o-palette-violet-500',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-violet-100 dark:o-to-violet-950'

/**
 * Rayon de la seconde passe hors qualite basse.
 *
 * Deux donne vingt-cinq cellules, et une arete exacte partout ; un en donne
 * neuf, exacte presque partout. C'est le seul levier de cout du shader.
 */
const RANGE = 2

/** Rayon de la seconde passe en qualite basse. */
const LOW_RANGE = 1

/**
 * Voronoi.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Voronoi className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Voronoi({
  speed = 0.4,
  density = 5,
  glow = 0.08,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: VoronoiProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: VORONOI_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uGlow: glow, uRange: RANGE },
    name: 'voronoi',
    degrade: (quality) => ({ uRange: quality === 'low' ? LOW_RANGE : RANGE }),
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
