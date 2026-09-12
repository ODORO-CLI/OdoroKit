/**
 * Colonne de lumiere : une colonne verticale qui respire : un coeur gaussien net, un halo exponentiel sans fin, des stries qui montent.
 *
 * ## Le principe
 *
 * Une colonne, c'est une distance a un axe : une gaussienne etroite pour
 * le coeur, une exponentielle large pour le halo, parce qu'une seule
 * courbe ne fait pas a la fois le centre net et la traine sans fin de la
 * lumiere. La largeur respire sur deux periodes non multiples, et un
 * bruit 1D de la hauteur fait couler la lumiere dans la colonne.
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

import { LIGHT_PILLAR_FRAGMENT } from './light-pillar.shader.js'

/** Ce que l'echappatoire recoit. */
export interface LightPillarControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface LightPillarOwnProps {
  /** Position horizontale de l axe, en fraction du cadre. @defaultValue 0.5 */
  x?: number
  /** Largeur du coeur, en fraction de la hauteur. @defaultValue 0.12 */
  width?: number
  /** Vitesse de la respiration. @defaultValue 0.6 */
  breath?: number
  /** Etendue du halo. @defaultValue 0.8 */
  glow?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<LightPillarControls>
}

/** Toutes les proprietes. */
export type LightPillarProps = Customisable<LightPillarOwnProps>

/** Tokens employes par defaut : le fond, le halo, le coeur. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-400',
  '--o-palette-amber-200',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-r o-from-zinc-50 dark:o-from-zinc-950 o-via-sky-200 dark:o-via-sky-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Detail hors qualite basse.
 *
 * La colonne ne coute rien ; ce sont les harmoniques des stries qui
 * pesent, donc c'est elles qui sont bornees.
 */
const DETAIL = 3

/** Detail en qualite basse. */
const LOW_DETAIL = 1

/**
 * Colonne de lumiere.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <LightPillar className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function LightPillar({
  x = 0.5,
  width = 0.12,
  breath = 0.6,
  glow = 0.8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LightPillarProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LIGHT_PILLAR_FRAGMENT,
    colors,
    uniforms: {
      uX: x,
      uWidth: width,
      uBreath: breath,
      uGlow: glow,
      uDetail: DETAIL,
    },
    name: 'light-pillar',
    degrade: (quality) => ({
      uDetail: quality === 'low' ? LOW_DETAIL : DETAIL,
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
