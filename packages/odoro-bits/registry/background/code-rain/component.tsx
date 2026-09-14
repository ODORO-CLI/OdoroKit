/**
 * Pluie de code : des colonnes de glyphes qui tombent, une tete lumineuse
 * et une trainee qui s'eteint.
 *
 * ## Le principe
 *
 * Chaque colonne porte une goutte a sa propre vitesse ; l'age d'une ligne
 * derriere la tete donne son intensite. Les glyphes sont des masques de bits
 * sur trois par cinq, dessines par le shader : aucune police, aucune
 * texture, et une cellule change de caractere a son propre rythme.
 *
 * Ce qui distingue cette entree de `rain` : des caracteres, pas des gouttes
 * d'eau ; et de `faulty-terminal` : ici tout tombe, rien ne se tape.
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

import { CODE_RAIN_FRAGMENT } from './code-rain.shader.js'

/** Ce que l'echappatoire recoit. */
export interface CodeRainControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface CodeRainOwnProps {
  /** Nombre de colonnes sur la largeur. Borne a cent vingt par le shader. @defaultValue 40 */
  columns?: number
  /** Vitesse de chute. @defaultValue 1 */
  speed?: number
  /** Longueur de la trainee, en lignes. @defaultValue 8 */
  trail?: number
  /** Cadence des changements de glyphe, par seconde. @defaultValue 3 */
  mutate?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<CodeRainControls>
}

/** Toutes les proprietes. */
export type CodeRainProps = Customisable<CodeRainOwnProps>

/** Tokens employes par defaut : le fond, la trainee, la tete. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-green-500', '--o-theme-fg'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Pluie de code.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <CodeRain className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function CodeRain({
  columns = 40,
  speed = 1,
  trail = 8,
  mutate = 3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CodeRainProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CODE_RAIN_FRAGMENT,
    colors,
    uniforms: { uColumns: columns, uSpeed: speed, uTrail: trail, uMutate: mutate },
    name: 'code-rain',
    // Des glyphes de trois pixels de large scintillent a densite de pixels
    // reduite : en qualite basse, les colonnes s'elargissent.
    degrade: (quality) => ({
      uColumns: quality === 'low' ? Math.min(columns, 24) : columns,
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
