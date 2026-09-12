/**
 * Marbre : des veines fines en bruit deforme trois fois, presque immobiles.
 *
 * ## Le principe
 *
 * Trois bruits enchaines, chacun deplacant le domaine du suivant : les plis
 * serres d'une pierre qui a coule avant de se figer. Les veines sont les
 * zeros d'un sinus du resultat, affines par une puissance — fines et
 * continues, pas des taches. Le temps n'entre que dans le premier etage,
 * tres lentement.
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

import { MARBLE_FRAGMENT } from './marble.shader.js'

/** Ce que l'echappatoire recoit. */
export interface MarbleControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface MarbleOwnProps {
  /** Vitesse de la deformation. @defaultValue 0.03 */
  speed?: number
  /** Echelle du motif. Plus haut, plus fin. @defaultValue 1.2 */
  scale?: number
  /** Finesse des veines. @defaultValue 0.6 */
  veins?: number
  /** Octaves de chaque bruit. @defaultValue 4 */
  octaves?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<MarbleControls>
}

/** Toutes les proprietes. */
export type MarbleProps = Customisable<MarbleOwnProps>

/** Tokens employes par defaut : la pierre, les veines, l'accent. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-palette-amber-400'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-zinc-200 dark:o-via-zinc-800 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Octaves en qualite basse.
 *
 * Cinq sommes d'octaves par fragment — deux par etage de deformation, une
 * pour la matiere — donc chaque octave se paie cinq fois. C'est le seul
 * levier de cout du shader.
 */
const LOW_OCTAVES = 2

/**
 * Marbre.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Marble className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Marble({
  speed = 0.03,
  scale = 1.2,
  veins = 0.6,
  octaves = 4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MarbleProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: MARBLE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uVeins: veins, uOctaves: octaves },
    name: 'marble',
    degrade: (quality) => ({
      uOctaves: quality === 'low' ? Math.min(octaves, LOW_OCTAVES) : octaves,
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
