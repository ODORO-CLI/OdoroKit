/**
 * Nappe d'essence : des franges irisees serrees sur une eau sombre.
 *
 * ## Le principe
 *
 * Une couleur par interference, comme le film de savon, mais mince, tordue
 * et posee sur l'eau : les franges sont serrees et separees de bandes
 * sombres, enroulees en volutes par un bruit qui deforme le domaine, et
 * decoupees en lobes par un troisieme bruit — entre les lobes, l'eau ondule.
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

import { OIL_SLICK_FRAGMENT } from './oil-slick.shader.js'

/** Ce que l'echappatoire recoit. */
export interface OilSlickControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface OilSlickOwnProps {
  /** Vitesse de derive de la nappe. @defaultValue 0.12 */
  speed?: number
  /** Echelle du bruit. Plus haut, plus fin. @defaultValue 2.2 */
  scale?: number
  /** Densite des franges. @defaultValue 6 */
  fringes?: number
  /** Force des reflets de l'eau. @defaultValue 0.3 */
  ripple?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<OilSlickControls>
}

/** Toutes les proprietes. */
export type OilSlickProps = Customisable<OilSlickOwnProps>

/** Tokens employes par defaut : l'eau, les deux teintes des franges. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-cyan-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-bl o-from-zinc-50 dark:o-from-zinc-950 o-via-fuchsia-300 dark:o-via-fuchsia-900 o-to-cyan-300 dark:o-to-cyan-900'

/**
 * Detail du bruit hors qualite basse.
 *
 * Quatre sommes d'octaves par fragment — deux pour la torsion, une pour
 * l'epaisseur, une pour l'etendue — donc chaque octave se paie quatre fois.
 * C'est le seul levier de cout, et il n'a pas besoin d'etre une prop.
 */
const OCTAVES = 4

/** Detail du bruit en qualite basse. */
const LOW_OCTAVES = 2

/**
 * Nappe d'essence.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <OilSlick className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function OilSlick({
  speed = 0.12,
  scale = 2.2,
  fringes = 6,
  ripple = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: OilSlickProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: OIL_SLICK_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uScale: scale,
      uFringes: fringes,
      uRipple: ripple,
      uOctaves: OCTAVES,
    },
    name: 'oil-slick',
    degrade: (quality) => ({
      uOctaves: quality === 'low' ? LOW_OCTAVES : OCTAVES,
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
