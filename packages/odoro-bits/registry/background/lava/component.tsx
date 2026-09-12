/**
 * Lave : des gouttes chaudes qui derivent et fusionnent.
 *
 * ## Le principe
 *
 * Des metaballs : chaque centre emet un champ en 1/d2, la somme des champs est
 * seuillee en deux paliers doux — bord sombre, coeur clair — et deux gouttes
 * qui s'approchent fusionnent d'elles-memes, sans qu'aucun code ne les
 * recolle.
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

import { LAVA_FRAGMENT } from './lava.shader.js'

/** Ce que l'echappatoire recoit. */
export interface LavaControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface LavaOwnProps {
  /** Vitesse de derive des centres. @defaultValue 0.3 */
  speed?: number
  /** Nombre de gouttes. @defaultValue 5 */
  blobs?: number
  /** Seuil du champ. Plus bas, plus de matiere. @defaultValue 1.2 */
  threshold?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<LavaControls>
}

/** Toutes les proprietes. */
export type LavaProps = Customisable<LavaOwnProps>

/** Tokens employes par defaut : la roche froide, le bord, le coeur en fusion. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-red-600',
  '--o-palette-amber-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-t o-from-red-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Lave.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Lava className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Lava({
  speed = 0.3,
  blobs = 5,
  threshold = 1.2,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LavaProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LAVA_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uBlobs: blobs, uThreshold: threshold },
    name: 'lava',
    // Chaque goutte est un champ de plus a sommer par pixel : c'est le
    // reglage qui pese, donc celui qui est borne.
    degrade: (quality) => ({
      uBlobs: quality === 'low' ? Math.min(blobs, 3) : blobs,
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
