/**
 * Terminal defaillant : un ecran de caracteres qui se tape ligne par ligne,
 * et qui scintille, se dechire et se corrompt par a-coups.
 *
 * ## Le principe
 *
 * Un front de frappe avance sur les lignes, un curseur clignote a sa suite,
 * l'ecran s'efface quand il est plein. Les pannes sont hachees par paliers :
 * elles surviennent, tiennent quelques images, cessent. Les glyphes sont des
 * masques de bits sur trois par cinq dessines par le shader : aucune police,
 * aucune texture.
 *
 * Ce qui distingue cette entree de `code-rain` : rien ne tombe, tout se
 * tape ; et de `scanlines` : ni lignes cathodiques, ni barre qui roule — des
 * caracteres, et leurs pannes.
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

import { FAULTY_TERMINAL_FRAGMENT } from './faulty-terminal.shader.js'

/** Ce que l'echappatoire recoit. */
export interface FaultyTerminalControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface FaultyTerminalOwnProps {
  /** Nombre de colonnes sur la largeur. Borne a cent vingt par le shader. @defaultValue 48 */
  columns?: number
  /** Vitesse de frappe, en lignes par seconde. @defaultValue 1.5 */
  speed?: number
  /** Force du scintillement. Zero le coupe. @defaultValue 0.5 */
  flicker?: number
  /** Frequence et amplitude des dechirements. Zero les coupe. @defaultValue 0.5 */
  tearing?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<FaultyTerminalControls>
}

/** Toutes les proprietes. */
export type FaultyTerminalProps = Customisable<FaultyTerminalOwnProps>

/** Tokens employes par defaut : le fond, le phosphore, le curseur. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-500',
  '--o-theme-fg',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Terminal defaillant.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <FaultyTerminal className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function FaultyTerminal({
  columns = 48,
  speed = 1.5,
  flicker = 0.5,
  tearing = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FaultyTerminalProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: FAULTY_TERMINAL_FRAGMENT,
    colors,
    uniforms: {
      uColumns: columns,
      uSpeed: speed,
      uFlicker: flicker,
      uTearing: tearing,
    },
    name: 'faulty-terminal',
    // Des glyphes de trois pixels de large scintillent a densite de pixels
    // reduite : en qualite basse, les colonnes s'elargissent.
    degrade: (quality) => ({
      uColumns: quality === 'low' ? Math.min(columns, 32) : columns,
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
