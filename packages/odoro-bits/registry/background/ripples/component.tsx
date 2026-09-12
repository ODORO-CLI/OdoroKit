/**
 * Gouttes : des trains d'anneaux amortis qui interferent.
 *
 * ## Le principe
 *
 * Chaque goutte est un sinus de la distance a son centre, eteint par une exponentielle de cette meme distance ; les ondes se somment et interferent.
 *
 * Les centres sont tires du rang de la goutte, jamais du temps : le motif est stable, seule l onde avance.
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

import { RIPPLES_FRAGMENT } from './ripples.shader.js'

/** Ce que l'echappatoire recoit. */
export interface RipplesControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface RipplesOwnProps {
  /** Vitesse de propagation des anneaux. @defaultValue 1 */
  speed?: number
  /** Nombre de gouttes. @defaultValue 6 */
  drops?: number
  /** Amortissement : plus haut, plus les anneaux restent pres du centre. @defaultValue 2.5 */
  decay?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<RipplesControls>
}

/** Toutes les proprietes. */
export type RipplesProps = Customisable<RipplesOwnProps>

/** Tokens employes par defaut : l'eau au repos, les cretes, les creux. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-cyan-400',
  '--o-palette-teal-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-sky-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Gouttes.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Ripples className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Ripples({
  speed = 1,
  drops = 6,
  decay = 2.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: RipplesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: RIPPLES_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDrops: drops, uDecay: decay },
    name: 'ripples',
    // Chaque goutte ajoute un sinus et une exponentielle par fragment : c'est
    // le reglage qui pese, donc celui qui est borne.
    degrade: (quality) => ({
      uDrops: quality === 'low' ? Math.min(drops, 3) : drops,
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
