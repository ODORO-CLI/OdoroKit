/**
 * Lignes en houle : des lignes horizontales fines qui ondulent en phase decalee.
 *
 * ## Le principe
 *
 * Une ligne par bande horizontale, chacune deplacee par la meme houle avec un
 * dephasage propre a son rang. Aucune ligne n'est tracee : le fragment mesure
 * sa distance a la courbe de sa bande et de ses deux voisines.
 *
 * Ce qui distingue cette entree de ses cousines : le trait est fin, le rythme
 * est lent, et le mouvement est horizontal — la houle court de gauche a
 * droite, et le dephasage entre lignes dessine une nappe diagonale.
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

import { LINE_WAVES_FRAGMENT } from './line-waves.shader.js'

/** Ce que l'echappatoire recoit. */
export interface LineWavesControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface LineWavesOwnProps {
  /** Nombre de lignes. Borne a quarante-huit par le shader. @defaultValue 24 */
  count?: number
  /** Hauteur de la houle, en hauteurs de bande. @defaultValue 0.6 */
  amplitude?: number
  /** Vitesse de la houle. @defaultValue 0.4 */
  speed?: number
  /** Epaisseur du trait, en fraction de la hauteur. @defaultValue 0.0025 */
  thickness?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<LineWavesControls>
}

/** Toutes les proprietes. */
export type LineWavesProps = Customisable<LineWavesOwnProps>

/** Tokens employes par defaut : le fond, l'encre, l'eclat des cretes. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Nombre de lignes en qualite basse.
 *
 * Le cout par fragment ne depend pas du nombre de lignes — trois bandes sont
 * evaluees quoi qu'il arrive. Ce qui coute, c'est le crenelage : des lignes
 * serrees a densite de pixels reduite scintillent. Moins de lignes, plus
 * d'espace entre elles, et le trait reste net.
 */
const LOW_COUNT = 12

/**
 * Lignes en houle.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <LineWaves className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function LineWaves({
  count = 24,
  amplitude = 0.6,
  speed = 0.4,
  thickness = 0.0025,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LineWavesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LINE_WAVES_FRAGMENT,
    colors,
    uniforms: {
      uCount: count,
      uAmplitude: amplitude,
      uSpeed: speed,
      uThickness: thickness,
    },
    name: 'line-waves',
    degrade: (quality) => ({
      uCount: quality === 'low' ? Math.min(count, LOW_COUNT) : count,
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
