/**
 * Moire : deux reseaux d'anneaux dont le produit fait des battements.
 *
 * ## Le principe
 *
 * Le produit de deux sinus de distances — un par centre — est lumineux en phase, sombre en opposition : les franges dessinent des hyperboles qu aucun des deux reseaux ne contient.
 *
 * Les centres orbitent a des periodes non multiples : la figure se recompose sans fin.
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

import { INTERFERENCE_FRAGMENT } from './interference.shader.js'

/** Ce que l'echappatoire recoit. */
export interface InterferenceControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface InterferenceOwnProps {
  /** Vitesse des orbites. @defaultValue 0.15 */
  speed?: number
  /** Nombre d'anneaux par unite de distance. @defaultValue 24 */
  frequency?: number
  /** Rayon des orbites, donc ecart des deux centres. @defaultValue 0.25 */
  separation?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<InterferenceControls>
}

/** Toutes les proprietes. */
export type InterferenceProps = Customisable<InterferenceOwnProps>

/** Tokens employes par defaut : le fond, puis les deux tons des franges. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-400',
  '--o-palette-cyan-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-fuchsia-950'

/**
 * Moire.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Interference className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Interference({
  speed = 0.15,
  frequency = 24,
  separation = 0.25,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: InterferenceProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: INTERFERENCE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uFrequency: frequency, uSeparation: separation },
    name: 'interference',
    // Le calcul est constant, mais des anneaux trop serres scintillent
    // d'echantillonnage sur les ecrans dont la densite a ete plafonnee : la
    // frequence est donc le reglage borne.
    degrade: (quality) => ({
      uFrequency: quality === 'low' ? Math.min(frequency, 14) : frequency,
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
