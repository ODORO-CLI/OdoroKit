/**
 * Feu : des flammes verticales continues, en bruit qui monte.
 *
 * ## Le principe
 *
 * Un bruit fractal dont le domaine descend avec le temps, etire en hauteur
 * et balance lateralement ; la chaleur est ce bruit moins une rampe de la
 * hauteur, pleine au sol et dissoute en montant. Deux seuils doux donnent le
 * corps et le coeur. Le temps n'entre que dans le deplacement : les flammes
 * montent, elles ne clignotent pas. Distinct de la lave et des braises.
 *
 * ## Ce que ce composant delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur.
 *
 * Le repli n'est pas une precaution : il est affiche pendant le chargement du
 * backend, quand WebGL manque, quand l'arbitre refuse la surface et sous
 * mouvement reduit.
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

import { FIRE_FRAGMENT } from './fire.shader.js'

/** Ce que l'echappatoire recoit. */
export interface FireControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface FireOwnProps {
  /** Vitesse de montee. @defaultValue 1 */
  speed?: number
  /** Hauteur des flammes, en fraction du cadre. @defaultValue 0.5 */
  height?: number
  /** Finesse des langues. Plus haut, plus fin. @defaultValue 3 */
  scale?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<FireControls>
}

/** Toutes les proprietes. */
export type FireProps = Customisable<FireOwnProps>

/** Tokens employes par defaut : le fond, le corps des flammes, leur coeur. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-orange-500',
  '--o-palette-yellow-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-orange-100 dark:o-from-orange-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Detail du bruit hors qualite basse.
 *
 * Deux sommes d'octaves par fragment, la grande et la fine : chaque octave
 * se paie deux fois. C'est le seul levier de cout du shader.
 */
const OCTAVES = 4

/** Detail du bruit en qualite basse. */
const LOW_OCTAVES = 2

/**
 * Feu.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Fire className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Fire({
  speed = 1,
  height = 0.5,
  scale = 3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FireProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: FIRE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uHeight: height, uScale: scale, uOctaves: OCTAVES },
    name: 'fire',
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
