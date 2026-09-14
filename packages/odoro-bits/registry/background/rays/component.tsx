/**
 * Rayons : des rais crepusculaires radiaux depuis un point reglable.
 *
 * ## Le principe
 *
 * L'intensite est un bruit 1D de l'angle autour du foyer — trois sinus de
 * frequences entieres non multiples, periodiques sur le tour — sculpte par une
 * puissance et eteint par une exponentielle de la distance. Des phases lentes
 * font le scintillement. Distinct des faisceaux : radial depuis un point, pas
 * des rais obliques paralleles.
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

import { RAYS_FRAGMENT } from './rays.shader.js'

/** Ce que l'echappatoire recoit. */
export interface RaysControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface RaysOwnProps {
  /** Position horizontale du foyer, en fraction du cadre. @defaultValue 0.5 */
  x?: number
  /** Position verticale du foyer, en fraction du cadre. @defaultValue 0.75 */
  y?: number
  /** Nombre de rayons sur le tour. @defaultValue 12 */
  count?: number
  /** Douceur des rais. Bas, ils sont fins et durs. @defaultValue 0.5 */
  softness?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<RaysControls>
}

/** Toutes les proprietes. */
export type RaysProps = Customisable<RaysOwnProps>

/** Tokens employes par defaut : la penombre, les rais, le foyer. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-orange-500',
  '--o-palette-amber-200',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-orange-950 o-to-zinc-50 dark:o-to-stone-950'

/**
 * Rayons.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Rays className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Rays({
  x = 0.5,
  y = 0.75,
  count = 12,
  softness = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: RaysProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: RAYS_FRAGMENT,
    colors,
    uniforms: { uX: x, uY: y, uCount: count, uSoftness: softness, uDetail: 3 },
    name: 'rays',
    // Le nombre de rayons ne coute rien — c'est une frequence, pas une boucle.
    // Ce sont les harmoniques du bruit angulaire qui pesent, donc c'est elles
    // qui sont bornees.
    degrade: (quality) => ({
      uDetail: quality === 'low' ? 1 : 3,
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
