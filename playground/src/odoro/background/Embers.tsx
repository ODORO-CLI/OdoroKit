/**
 * Braises : des points chauds qui montent, scintillent et s'eteignent.
 *
 * ## Le principe
 *
 * Une braise par cellule d'une grille hachee, sur trois profondeurs. La
 * grille descend colonne par colonne, donc les braises montent chacune a son
 * rythme. Ce qui les distingue d'une neige inversee : leur lumiere depend de
 * leur hauteur dans le cadre — pleine en bas, eteinte avant le haut.
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

import { EMBERS_FRAGMENT } from './embers.shader.js'

/** Ce que l'echappatoire recoit. */
export interface EmbersControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface EmbersOwnProps {
  /** Vitesse de la montee. @defaultValue 0.5 */
  speed?: number
  /** Densite du semis. @defaultValue 9 */
  density?: number
  /** Portee du halo doux autour de chaque braise. @defaultValue 1 */
  glow?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<EmbersControls>
}

/** Toutes les proprietes. */
export type EmbersProps = Customisable<EmbersOwnProps>

/** Tokens employes par defaut : le fond, le corps des braises, leur pointe. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-orange-500',
  '--o-palette-amber-200',
] as const

/** Repli par defaut : la lueur du foyer figee, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-orange-200 dark:o-from-orange-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Couches hors qualite basse.
 *
 * Chaque couche parcourt neuf cellules par fragment : c'est le seul levier de
 * cout du shader, et la couche la plus lointaine est la plus faible.
 */
const LAYERS = 3

/** Couches en qualite basse. */
const LOW_LAYERS = 2

/**
 * Braises.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Embers className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Embers({
  speed = 0.5,
  density = 9,
  glow = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: EmbersProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: EMBERS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uGlow: glow, uLayers: LAYERS },
    name: 'embers',
    degrade: (quality) => ({ uLayers: quality === 'low' ? LOW_LAYERS : LAYERS }),
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
