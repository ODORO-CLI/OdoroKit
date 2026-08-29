/**
 * Soie : un ecoulement obtenu en deplacant le domaine deux fois de suite.
 *
 * ## Le principe
 *
 * Un bruit fractal seul donne des taches ; le meme bruit lu en un point deja deplace donne des volutes. Ici le deplacement est applique deux fois.
 *
 * C est le plus couteux des fonds : chaque passe evalue le bruit trois fois. Les octaves sont le reglage a baisser.
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
  SILK_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from 'odoro-engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface SilkControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface SilkOwnProps {
  /** Vitesse de l ecoulement. @defaultValue 0.08 */
  speed?: number
  /** Echelle du motif. @defaultValue 1.6 */
  scale?: number
  /** Nombre d octaves du bruit. @defaultValue 4 */
  octaves?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<SilkControls>
}

/** Toutes les proprietes. */
export type SilkProps = Customisable<SilkOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-950',
  '--o-palette-brand-500',
  '--o-palette-sky-300',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-b o-from-zinc-950 o-to-brand-900'

/**
 * Soie.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Silk className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Silk({
  speed = 0.08,
  scale = 1.6,
  octaves = 4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SilkProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SILK_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uOctaves: octaves },
    name: 'silk',
    // En qualite basse, le reglage qui pese est borne : le motif reste
    // reconnaissable une fois reduit.
    degrade: (quality) => ({
      uOctaves:
        quality === 'low' ? Math.min(octaves, 2) : octaves,
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
