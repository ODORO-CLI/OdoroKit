/**
 * Mur de LED : une matrice de pastilles arrondies qui affiche un degrade
 * lent, une couleur par pastille.
 *
 * ## Le principe
 *
 * L'image affichee est echantillonnee au centre de chaque pastille : une
 * diode est d'une seule couleur. Autour, le boitier reste visible ; un halo
 * court deborde sans atteindre les voisines, et chaque pastille a une
 * luminance un peu inegale, comme sur un mur reel.
 *
 * Ce qui distingue cette entree de `dot-matrix` et de `halftone` : ici la
 * taille des points ne varie pas, c'est leur couleur qui porte l'image ; et
 * de `dots` : les pastilles sont des carres arrondis serres, pas un semis.
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

import { LED_WALL_FRAGMENT } from './led-wall.shader.js'

/** Ce que l'echappatoire recoit. */
export interface LedWallControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface LedWallOwnProps {
  /** Nombre de pastilles sur la hauteur. Borne a cent vingt par le shader. @defaultValue 32 */
  pixels?: number
  /** Vitesse du degrade. @defaultValue 0.4 */
  speed?: number
  /** Espace entre les pastilles, en fraction de pastille. @defaultValue 0.25 */
  gap?: number
  /** Poids du halo autour de chaque pastille. Zero l'eteint. @defaultValue 0.5 */
  bloom?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<LedWallControls>
}

/** Toutes les proprietes. */
export type LedWallProps = Customisable<LedWallOwnProps>

/** Tokens employes par defaut : le boitier, les deux couleurs du degrade. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-rose-500',
  '--o-palette-amber-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-rose-100 dark:o-to-rose-950'

/**
 * Mur de LED.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <LedWall className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function LedWall({
  pixels = 32,
  speed = 0.4,
  gap = 0.25,
  bloom = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LedWallProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LED_WALL_FRAGMENT,
    colors,
    uniforms: { uPixels: pixels, uSpeed: speed, uGap: gap, uBloom: bloom },
    name: 'led-wall',
    // Des pastilles petites scintillent sur leurs coins a densite de pixels
    // reduite, et leur halo n'y ajoute rien : en qualite basse, elles
    // s'elargissent et le halo s'eteint.
    degrade: (quality) => ({
      uPixels: quality === 'low' ? Math.min(pixels, 20) : pixels,
      uBloom: quality === 'low' ? 0 : bloom,
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
