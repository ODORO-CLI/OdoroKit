/**
 * Parasites : la neige d'un televiseur, hachee par paliers.
 *
 * ## Le principe
 *
 * Un bruit blanc par cellule d'ecran, retire par paliers de temps — un tirage
 * par palier et non par image, qui scintillerait trop. Des bandes sombres
 * defilent lentement a la verticale, et un dosage de teinte tire le gris vers
 * la couleur du tube.
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

import { TV_STATIC_FRAGMENT } from './tv-static.shader.js'

/** Ce que l'echappatoire recoit. */
export interface TvStaticControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface TvStaticOwnProps {
  /** Cadence des paliers de tirage. @defaultValue 12 */
  fps?: number
  /** Profondeur des bandes sombres. @defaultValue 0.3 */
  banding?: number
  /** Dosage de la teinte. Zero, l'image reste grise. @defaultValue 0.4 */
  tint?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<TvStaticControls>
}

/** Toutes les proprietes. */
export type TvStaticProps = Customisable<TvStaticOwnProps>

/** Tokens employes par defaut : le noir du tube, la teinte, le grain clair. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-indigo-300', '--o-theme-fg'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-100 dark:o-bg-zinc-900'

/**
 * Parasites.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <TvStatic className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function TvStatic({
  fps = 12,
  banding = 0.3,
  tint = 0.4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: TvStaticProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: TV_STATIC_FRAGMENT,
    colors,
    uniforms: { uFps: fps, uBanding: banding, uTint: tint },
    name: 'tv-static',
    // Le fragment coute un hachage quelle que soit la cadence ; ce qui pese,
    // c'est le rythme des images reellement differentes, donc il est borne.
    degrade: (quality) => ({
      uFps: quality === 'low' ? Math.min(fps, 8) : fps,
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
