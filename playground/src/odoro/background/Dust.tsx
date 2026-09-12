/**
 * Poussiere : des grains en suspension, visibles dans un rai de lumiere
 * oblique.
 *
 * ## Le principe
 *
 * Un rai est une bande douce autour d'une droite oblique, qui s'evase et
 * s'affaiblit en s'eloignant de sa source. Les grains derivent sur une marche
 * brownienne approchee — des sinus, aucun etat — et ne se voient que dans le
 * rai : leur lumiere est celle du faisceau a leur position.
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

import { DUST_FRAGMENT } from './dust.shader.js'

/** Ce que l'echappatoire recoit. */
export interface DustControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface DustOwnProps {
  /** Vitesse de la derive des grains. @defaultValue 0.3 */
  speed?: number
  /** Densite du semis. @defaultValue 12 */
  density?: number
  /** Inclinaison du rai, en degres. @defaultValue -55 */
  angle?: number
  /** Demi-largeur du rai, en hauteurs de cadre. @defaultValue 0.22 */
  width?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<DustControls>
}

/** Toutes les proprietes. */
export type DustProps = Customisable<DustOwnProps>

/** Tokens employes par defaut : l'ombre, le rai, les grains. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-300',
  '--o-palette-amber-100',
] as const

/** Repli par defaut : le rai fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-amber-100 dark:o-via-amber-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Couches hors qualite basse.
 *
 * Chaque couche parcourt neuf cellules par fragment, avec une lecture du rai
 * par cellule : c'est le seul levier de cout du shader.
 */
const LAYERS = 3

/** Couches en qualite basse. */
const LOW_LAYERS = 2

/**
 * Poussiere.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Dust className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Dust({
  speed = 0.3,
  density = 12,
  angle = -55,
  width = 0.22,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: DustProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: DUST_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uDensity: density,
      uAngle: angle,
      uWidth: width,
      uLayers: LAYERS,
    },
    name: 'dust',
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
