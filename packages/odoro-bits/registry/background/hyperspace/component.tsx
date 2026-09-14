/**
 * Hyperespace : des etoiles filantes vers la camera, etirees selon la vitesse.
 *
 * ## Le principe
 *
 * Le cadre est lu en polaire depuis son point de fuite, et la distance en
 * logarithme : une cellule de longueur constante y est minuscule au centre et
 * large au bord, ce qui est la perspective d'un objet qui fonce vers l'oeil.
 * La trainee s'allonge avec la vitesse — des points a l'arret, des traits a
 * pleine vitesse.
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

import { HYPERSPACE_FRAGMENT } from './hyperspace.shader.js'

/** Ce que l'echappatoire recoit. */
export interface HyperspaceControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface HyperspaceOwnProps {
  /** Vitesse du defilement vers la camera. @defaultValue 1 */
  speed?: number
  /** Nombre de rayons sur un tour. @defaultValue 64 */
  density?: number
  /** Allongement des trainees, en plus de celui que donne la vitesse. @defaultValue 1 */
  stretch?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<HyperspaceControls>
}

/** Toutes les proprietes. */
export type HyperspaceProps = Customisable<HyperspaceOwnProps>

/** Tokens employes par defaut : le fond, le corps des trainees, leur tete. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-indigo-300', '--o-theme-fg'] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-indigo-200 dark:o-to-indigo-950'

/**
 * Couches hors qualite basse.
 *
 * Chaque couche est une famille de rayons evaluee par fragment : c'est le
 * seul levier de cout, et la troisieme couche est la plus faible.
 */
const LAYERS = 3

/** Couches en qualite basse. */
const LOW_LAYERS = 2

/**
 * Hyperespace.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Hyperspace className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Hyperspace({
  speed = 1,
  density = 64,
  stretch = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: HyperspaceProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: HYPERSPACE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uStretch: stretch, uLayers: LAYERS },
    name: 'hyperspace',
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
