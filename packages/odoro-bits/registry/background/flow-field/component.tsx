/**
 * Champ de flux : des particules qui suivent un champ de bruit, avec leur
 * trainee.
 *
 * ## Le principe
 *
 * Un champ sans divergence, tire du gradient d'un bruit tourne d'un quart de
 * tour, et des particules qui le suivent. Rien n'est simule ni stocke : chaque
 * fragment remonte le champ a contre-courant sur un nombre borne de pas, et
 * s'allume s'il croise en amont la trace d'une particule vivante. La tete est
 * d'une couleur, la queue d'une autre, et le champ lui-meme derive lentement.
 *
 * Ce qui distingue cette entree de `currents` : celle-ci deforme une nappe
 * continue ; ici ce sont des particules discretes, qui naissent, courent et
 * s'eteignent.
 *
 * ## Ce que ce composant delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur.
 *
 * Le repli est affiche pendant le chargement du backend, quand WebGL manque,
 * quand l'arbitre refuse la surface et sous mouvement reduit.
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

import { FLOW_FIELD_FRAGMENT } from './flow-field.shader.js'

/** Ce que l'echappatoire recoit. */
export interface FlowFieldControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface FlowFieldOwnProps {
  /** Frequence du bruit, donc la taille des tourbillons. @defaultValue 2.5 */
  scale?: number
  /** Vitesse des particules. @defaultValue 1 */
  speed?: number
  /** Part des cellules qui portent une particule. @defaultValue 0.25 */
  density?: number
  /** Longueur de la queue, en pas. @defaultValue 8 */
  trail?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<FlowFieldControls>
}

/** Toutes les proprietes. */
export type FlowFieldProps = Customisable<FlowFieldOwnProps>

/** Tokens employes par defaut : le fond, la trainee, la tete. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-400',
  '--o-palette-amber-300',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/** Pas remontes par fragment : la portee d'une particule. */
const STEPS = 24

/** Pas remontes en qualite basse. */
const LOW_STEPS = 10

/**
 * Champ de flux.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <FlowField className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function FlowField({
  scale = 2.5,
  speed = 1,
  density = 0.25,
  trail = 8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FlowFieldProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: FLOW_FIELD_FRAGMENT,
    colors,
    uniforms: {
      uScale: scale,
      uSpeed: speed,
      uDensity: density,
      uTrail: trail,
      uSteps: STEPS,
    },
    name: 'flow-field',
    // Chaque pas remonte coute trois lectures de bruit par pixel : c'est le
    // reglage qui pese, donc celui qui est borne. Les particules deviennent
    // plus courtes, pas moins nombreuses.
    degrade: (quality) => ({
      uSteps: quality === 'low' ? LOW_STEPS : STEPS,
      uTrail: quality === 'low' ? Math.min(trail, 5) : trail,
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
