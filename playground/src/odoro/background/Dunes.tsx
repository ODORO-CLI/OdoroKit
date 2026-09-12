/**
 * Dunes : des cretes superposees qui derivent en parallaxe.
 *
 * ## Le principe
 *
 * Des courbes horizon — sinus charpente plus bruit — empilees du haut vers le
 * bas, chacune remplie sous elle par seuillage vertical. Chaque couche est
 * plus claire et plus lente que la precedente : c'est le desaccord des
 * vitesses qui fait la profondeur, pas un degrade.
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

import { DUNES_FRAGMENT } from './dunes.shader.js'

/** Ce que l'echappatoire recoit. */
export interface DunesControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface DunesOwnProps {
  /** Vitesse de derive des couches. @defaultValue 0.1 */
  speed?: number
  /** Nombre de cretes empilees. @defaultValue 4 */
  layers?: number
  /** Hauteur des ondulations. @defaultValue 0.12 */
  amplitude?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<DunesControls>
}

/** Toutes les proprietes. */
export type DunesProps = Customisable<DunesOwnProps>

/** Tokens employes par defaut : le ciel, la crete lointaine, la crete rasante. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-orange-600',
  '--o-palette-amber-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-amber-100 dark:o-from-amber-950 o-to-orange-200 dark:o-to-orange-950'

/**
 * Dunes.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Dunes className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Dunes({
  speed = 0.1,
  layers = 4,
  amplitude = 0.12,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: DunesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: DUNES_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uLayers: layers, uAmplitude: amplitude },
    name: 'dunes',
    // Chaque crete est un sinus et un bruit de plus par pixel : c'est le
    // reglage qui pese, donc celui qui est borne.
    degrade: (quality) => ({
      uLayers: quality === 'low' ? Math.min(layers, 3) : layers,
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
