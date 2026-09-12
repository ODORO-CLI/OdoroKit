/**
 * Metal en fusion : un bain de metal chaud : une croute qui se fend en veines, une coulee lente en bruit a deplacement de domaine, un coeur qui rayonne.
 *
 * ## Le principe
 *
 * Un champ de chaleur en bruit fractal a deplacement de domaine, deux
 * passes pour que les coulees s'enroulent. La couleur est une rampe a
 * trois arrets — la croute est le fond lui-meme, puis le metal, puis le
 * coeur — et les veines sont les lignes de niveau du champ. Deux
 * lectures decalees donnent un relief eclaire en rasant.
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

import { MOLTEN_METAL_FRAGMENT } from './molten-metal.shader.js'

/** Ce que l'echappatoire recoit. */
export interface MoltenMetalControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface MoltenMetalOwnProps {
  /** Vitesse de la coulee. @defaultValue 0.08 */
  speed?: number
  /** Echelle du champ. Plus haut, plus fin. @defaultValue 1.8 */
  scale?: number
  /** Part du bain qui est en fusion. @defaultValue 0.6 */
  heat?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<MoltenMetalControls>
}

/** Toutes les proprietes. */
export type MoltenMetalProps = Customisable<MoltenMetalOwnProps>

/** Tokens employes par defaut : la croute, le metal, le coeur. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-red-600',
  '--o-palette-amber-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-amber-300 dark:o-from-amber-700 o-via-red-300 dark:o-via-red-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Detail hors qualite basse.
 *
 * Le champ est lu trois fois, et chaque lecture est sept sommes
 * d'octaves : c'est le seul levier de cout, et il tombe a deux octaves.
 */
const DETAIL = 4

/** Detail en qualite basse. */
const LOW_DETAIL = 2

/**
 * Metal en fusion.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <MoltenMetal className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function MoltenMetal({
  speed = 0.08,
  scale = 1.8,
  heat = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MoltenMetalProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: MOLTEN_METAL_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uScale: scale,
      uHeat: heat,
      uOctaves: DETAIL,
    },
    name: 'molten-metal',
    degrade: (quality) => ({
      uOctaves: quality === 'low' ? LOW_DETAIL : DETAIL,
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
