/**
 * Lignes de balayage : un ecran cathodique, sa barre qui roule et son grain.
 *
 * ## Le principe
 *
 * Tout tient dans des fonctions periodiques du seul axe vertical : un sinus pour les lignes, une partie fractionnaire decalee par le temps pour la barre.
 *
 * Le grain est rejoue par paliers de temps, jamais par image — un tirage par image scintille au lieu de granuler.
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

import { SCANLINES_FRAGMENT } from './scanlines.shader.js'

/** Ce que l'echappatoire recoit. */
export interface ScanlinesControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface ScanlinesOwnProps {
  /** Vitesse de la barre qui roule. @defaultValue 0.5 */
  speed?: number
  /** Nombre de lignes sur la hauteur. @defaultValue 90 */
  lines?: number
  /** Part du grain anime. @defaultValue 0.4 */
  flicker?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<ScanlinesControls>
}

/** Toutes les proprietes. */
export type ScanlinesProps = Customisable<ScanlinesOwnProps>

/** Tokens employes par defaut : le tube, le phosphore, la barre. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-green-400',
  '--o-palette-emerald-200',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Lignes de balayage.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Scanlines className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Scanlines({
  speed = 0.5,
  lines = 90,
  flicker = 0.4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ScanlinesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SCANLINES_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uLines: lines, uFlicker: flicker },
    name: 'scanlines',
    // Le grain est la seule valeur recalculee a chaque palier de temps : sur
    // un ecran dont la densite a ete plafonnee, c'est aussi ce qui fourmille
    // le plus. Il est donc le reglage borne.
    degrade: (quality) => ({
      uFlicker: quality === 'low' ? Math.min(flicker, 0.15) : flicker,
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
