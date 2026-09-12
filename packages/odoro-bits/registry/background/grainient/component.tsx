/**
 * Degrade granuleux : des taches de couleur qui derivent lentement, dont les transitions se dissolvent en grain au lieu de s etaler.
 *
 * ## Le principe
 *
 * Des gaussiennes autour de centres en courbes de Lissajous, les paires
 * d'une teinte et les impaires de l'autre. Le grain n'est pas pose sur
 * l'image : un tirage par pixel, renouvele a douze images par seconde,
 * decale les poids avant le melange. Le fond nu reste intact — le grain
 * ne vit que la ou il y a de la couleur.
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

import { GRAINIENT_FRAGMENT } from './grainient.shader.js'

/** Ce que l'echappatoire recoit. */
export interface GrainientControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface GrainientOwnProps {
  /** Vitesse de derive des taches. @defaultValue 0.15 */
  speed?: number
  /** Force du grain. @defaultValue 0.6 */
  grain?: number
  /** Taille des taches. @defaultValue 1.2 */
  scale?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<GrainientControls>
}

/** Toutes les proprietes. */
export type GrainientProps = Customisable<GrainientOwnProps>

/** Tokens employes par defaut : le fond, les deux teintes des taches. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-400',
  '--o-palette-orange-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-violet-200 dark:o-from-violet-900 o-via-zinc-50 dark:o-via-zinc-950 o-to-orange-200 dark:o-to-orange-900'

/**
 * Detail hors qualite basse.
 *
 * Le grain est un tirage, il ne coute rien ; ce sont les taches, une
 * exponentielle chacune, qui tombent a deux en qualite basse.
 */
const DETAIL = 4

/** Detail en qualite basse. */
const LOW_DETAIL = 2

/**
 * Degrade granuleux.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Grainient className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Grainient({
  speed = 0.15,
  grain = 0.6,
  scale = 1.2,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GrainientProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: GRAINIENT_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uGrain: grain,
      uScale: scale,
      uBlobs: DETAIL,
    },
    name: 'grainient',
    degrade: (quality) => ({
      uBlobs: quality === 'low' ? LOW_DETAIL : DETAIL,
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
