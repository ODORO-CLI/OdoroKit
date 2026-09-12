/**
 * Meches : des brins ancres en bas du cadre, qui ondulent comme des algues.
 *
 * ## Le principe
 *
 * Une meche par colonne, un x = f(y) dont le balancement croit avec la
 * hauteur : la racine tient, la pointe suit le courant avec retard. Chaque
 * meche a sa hauteur, son epaisseur qui s'amincit, sa phase propre.
 *
 * Ce qui distingue cette entree de ses cousines : les brins sont verticaux
 * et ancres, le mouvement est un balancement lateral, et l'epaisseur varie
 * le long du brin.
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

import { STRANDS_FRAGMENT } from './strands.shader.js'

/** Ce que l'echappatoire recoit. */
export interface StrandsControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface StrandsOwnProps {
  /** Nombre de meches. Borne a quarante par le shader. @defaultValue 18 */
  count?: number
  /** Amplitude du balancement, en largeurs de colonne. @defaultValue 0.7 */
  sway?: number
  /** Vitesse du courant. @defaultValue 0.6 */
  speed?: number
  /** Epaisseur a la racine, en fraction de la largeur. @defaultValue 0.006 */
  thickness?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<StrandsControls>
}

/** Toutes les proprietes. */
export type StrandsProps = Customisable<StrandsOwnProps>

/** Tokens employes par defaut : le fond, le corps des meches, leur pointe. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-700',
  '--o-palette-teal-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-teal-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Nombre de meches en qualite basse.
 *
 * Trois colonnes sont evaluees par fragment quel que soit leur nombre. Ce qui
 * coute, c'est un trait d'un pixel a densite reduite, qui scintille quand les
 * meches sont serrees : moins de meches, plus d'espace, et le trait tient.
 */
const LOW_COUNT = 10

/**
 * Meches.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Strands className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Strands({
  count = 18,
  sway = 0.7,
  speed = 0.6,
  thickness = 0.006,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: StrandsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: STRANDS_FRAGMENT,
    colors,
    uniforms: { uCount: count, uSway: sway, uSpeed: speed, uThickness: thickness },
    name: 'strands',
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
