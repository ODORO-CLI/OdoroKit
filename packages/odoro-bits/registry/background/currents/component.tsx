/**
 * Courants : des filaments de bruit etires le long d'un champ d'ecoulement.
 *
 * ## Le principe
 *
 * Un premier bruit a grande echelle donne en chaque point un angle
 * d'ecoulement ; le point de lecture est advecte le long de cet angle, tourne
 * dans le repere local et etire — le bruit fin, lu dans ce repere anisotrope,
 * s'allonge en filaments qui suivent le champ sans qu'aucune ligne ne soit
 * tracee.
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

import { CURRENTS_FRAGMENT } from './currents.shader.js'

/** Ce que l'echappatoire recoit. */
export interface CurrentsControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface CurrentsOwnProps {
  /** Vitesse d'advection. @defaultValue 0.2 */
  speed?: number
  /** Echelle du bruit. Plus haut, plus fin. @defaultValue 3 */
  scale?: number
  /** Anisotropie. Plus haut, filaments plus longs. @defaultValue 6 */
  stretch?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<CurrentsControls>
}

/** Toutes les proprietes. */
export type CurrentsProps = Customisable<CurrentsOwnProps>

/** Tokens employes par defaut : l'eau profonde, les courants, les filaments. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-400',
  '--o-palette-cyan-200',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-blue-950 o-to-teal-950'

/**
 * Courants.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Currents className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Currents({
  speed = 0.2,
  scale = 3,
  stretch = 6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CurrentsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CURRENTS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uStretch: stretch, uDetail: 4 },
    name: 'currents',
    // Le champ d'ecoulement garde ses trois octaves — sans lui, plus de
    // courant du tout. Ce sont les octaves du bruit fin qui pesent, donc
    // c'est elles qui sont bornees.
    degrade: (quality) => ({
      uDetail: quality === 'low' ? 2 : 4,
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
