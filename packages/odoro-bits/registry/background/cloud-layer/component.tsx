/**
 * Couches de nuages : des masses de bruit fractal empilees, qui derivent en
 * parallaxe.
 *
 * ## Le principe
 *
 * Trois couches seuillees par la couverture, chacune a sa vitesse et son
 * echelle ; une seconde lecture du bruit, decalee vers la lumiere, eclaire
 * les sommets et laisse les dessous dans l'ombre. Distinct de la fumee et
 * de la nebuleuse : des masses opaques, eclairees, en profondeur.
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

import { CLOUD_LAYER_FRAGMENT } from './cloud-layer.shader.js'

/** Ce que l'echappatoire recoit. */
export interface CloudLayerControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface CloudLayerOwnProps {
  /** Vitesse de derive de la couche proche. @defaultValue 0.08 */
  speed?: number
  /** Echelle des masses. Plus haut, plus fin. @defaultValue 2 */
  scale?: number
  /** Couverture du ciel, de zero a un. @defaultValue 0.55 */
  coverage?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<CloudLayerControls>
}

/** Toutes les proprietes. */
export type CloudLayerProps = Customisable<CloudLayerOwnProps>

/** Tokens employes par defaut : le fond, l'ombre des nuages, leurs sommets. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-slate-400',
  '--o-palette-sky-100',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-slate-100 dark:o-from-slate-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Detail du bruit hors qualite basse.
 *
 * Chaque couche lit le bruit deux fois — la masse et sa lumiere — et il y a
 * trois couches : chaque octave se paie six fois. C'est le seul levier de
 * cout du shader.
 */
const OCTAVES = 5

/** Detail du bruit en qualite basse. */
const LOW_OCTAVES = 3

/**
 * Couches de nuages.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <CloudLayer className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function CloudLayer({
  speed = 0.08,
  scale = 2,
  coverage = 0.55,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CloudLayerProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CLOUD_LAYER_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uCoverage: coverage, uOctaves: OCTAVES },
    name: 'cloud-layer',
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
