/**
 * Tracking VHS : une bande de tracking qui roule, des lignes decalees, des
 * stries, et des sauts de couleur par rafales.
 *
 * ## Le principe
 *
 * L'image est un signal doux ; tout le reste est ce que la bande lui fait.
 * La bande de tracking roule lentement, decale chaque ligne d'ecran et y
 * seme des stries, tirees par ligne et hachees par paliers. Les deux
 * teintes sont lues a deux positions ecartees, beaucoup plus pendant les
 * rafales ; le bas de l'image porte la commutation des tetes.
 *
 * Ce qui distingue cette entree de `tv-static` : il y a une image, et une
 * bande qui la traverse ; et de `glitch-blocks` : des lignes et des bandes
 * qui roulent, pas des rectangles qui sautent.
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

import { VHS_TRACKING_FRAGMENT } from './vhs-tracking.shader.js'

/** Ce que l'echappatoire recoit. */
export interface VhsTrackingControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface VhsTrackingOwnProps {
  /** Vitesse de la bande de tracking. @defaultValue 1 */
  speed?: number
  /** Hauteur de la bande, en fraction de l'image. @defaultValue 0.14 */
  band?: number
  /** Ecart des teintes. Zero le coupe. @defaultValue 0.6 */
  split?: number
  /** Quantite de stries dans la bande. @defaultValue 0.5 */
  noise?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<VhsTrackingControls>
}

/** Toutes les proprietes. */
export type VhsTrackingProps = Customisable<VhsTrackingOwnProps>

/** Tokens employes par defaut : le fond, les deux teintes du signal. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-cyan-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-fuchsia-100 dark:o-from-fuchsia-950 o-via-zinc-50 dark:o-via-zinc-950 o-to-cyan-100 dark:o-to-cyan-950'

/**
 * Tracking VHS.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <VhsTracking className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function VhsTracking({
  speed = 1,
  band = 0.14,
  split = 0.6,
  noise = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: VhsTrackingProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: VHS_TRACKING_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uBand: band, uSplit: split, uNoise: noise },
    name: 'vhs-tracking',
    // L'ecart des teintes coute une seconde lecture du signal, et devient un
    // simple flou a densite de pixels reduite : en qualite basse, il se coupe.
    degrade: (quality) => ({
      uSplit: quality === 'low' ? 0 : split,
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
