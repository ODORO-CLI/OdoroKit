/**
 * Eclat prismatique : des rais qui tournent autour d un foyer et changent de teinte sur le tour, traverses par des anneaux qui s eloignent.
 *
 * ## Le principe
 *
 * Des rais radiaux comme les rayons crepusculaires, mais ils tournent,
 * leur teinte tourne entre deux tokens selon l'angle, et des anneaux
 * partent du foyer en relevant les rais qu'ils traversent. Le bruit
 * angulaire reste une somme de sinus a frequences entieres, pour que le
 * tour se referme sans couture.
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

import { PRISMATIC_BURST_FRAGMENT } from './prismatic-burst.shader.js'

/** Ce que l'echappatoire recoit. */
export interface PrismaticBurstControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface PrismaticBurstOwnProps {
  /** Position horizontale du foyer, en fraction du cadre. @defaultValue 0.5 */
  x?: number
  /** Position verticale du foyer, en fraction du cadre. @defaultValue 0.5 */
  y?: number
  /** Nombre de rais sur le tour. @defaultValue 10 */
  spokes?: number
  /** Vitesse de rotation et des pulsations. @defaultValue 0.5 */
  speed?: number
  /** Force des anneaux qui partent du foyer. @defaultValue 0.6 */
  burst?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<PrismaticBurstControls>
}

/** Toutes les proprietes. */
export type PrismaticBurstProps = Customisable<PrismaticBurstOwnProps>

/** Tokens employes par defaut : le fond, les deux teintes des rais. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-cyan-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-fuchsia-200 dark:o-from-fuchsia-900 o-via-zinc-50 dark:o-via-zinc-950 o-to-cyan-200 dark:o-to-cyan-900'

/**
 * Detail hors qualite basse.
 *
 * Le nombre de rais est une frequence, pas une boucle : il ne coute
 * rien. Ce sont les harmoniques du bruit angulaire qui sont bornees.
 */
const DETAIL = 3

/** Detail en qualite basse. */
const LOW_DETAIL = 1

/**
 * Eclat prismatique.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <PrismaticBurst className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function PrismaticBurst({
  x = 0.5,
  y = 0.5,
  spokes = 10,
  speed = 0.5,
  burst = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PrismaticBurstProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: PRISMATIC_BURST_FRAGMENT,
    colors,
    uniforms: {
      uX: x,
      uY: y,
      uSpokes: spokes,
      uSpeed: speed,
      uBurst: burst,
      uDetail: DETAIL,
    },
    name: 'prismatic-burst',
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
