/**
 * Bokeh : des disques flous multi-profondeur qui derivent lateralement.
 *
 * ## Le principe
 *
 * Trois couches de disques, un par cellule hachee : plus la couche est
 * proche, plus ses disques sont grands, flous et lents — le rendu d'un
 * objectif, qui rend flou ce qui est hors du plan de nettete. Le bord de
 * chaque disque est un smoothstep dont la largeur est le reglage de flou.
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

import { BOKEH_FRAGMENT } from './bokeh.shader.js'

/** Ce que l'echappatoire recoit. */
export interface BokehControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface BokehOwnProps {
  /** Vitesse de derive laterale. @defaultValue 0.3 */
  speed?: number
  /** Nombre de cellules sur le plus petit cote. @defaultValue 6 */
  density?: number
  /** Largeur du bord flou des disques. @defaultValue 0.5 */
  blur?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<BokehControls>
}

/** Toutes les proprietes. */
export type BokehProps = Customisable<BokehOwnProps>

/** Tokens employes par defaut : l'obscurite, puis les deux teintes chaudes. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-400',
  '--o-palette-rose-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-stone-950 o-to-zinc-100 dark:o-to-stone-900'

/**
 * Bokeh.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Bokeh className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Bokeh({
  speed = 0.3,
  density = 6,
  blur = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: BokehProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: BOKEH_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uBlur: blur },
    name: 'bokeh',
    // Trois couches de neuf cellules chacune : une maille plus large fait
    // moins de disques qui se recouvrent, c'est le reglage qui pese, donc
    // celui qui est borne.
    degrade: (quality) => ({
      uDensity: quality === 'low' ? Math.min(density, 4) : density,
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
