/**
 * Nappes pliees : des nappes de couleur epaisses, chacune dans son repere tourne, qui se plient et se croisent en s eclairant la ou elles se recouvrent.
 *
 * ## Le principe
 *
 * Chaque nappe est une bande epaisse autour d'une courbe de deux sinus,
 * dans un repere tourne qui lui est propre : c'est pourquoi les nappes se
 * croisent au lieu de rester paralleles. La ou elles se recouvrent, la
 * somme des couvertures depasse un, et cet exces devient un eclat ajoute
 * et borne — les nappes sont translucides, pas decoupees.
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

import { COLOR_BENDS_FRAGMENT } from './color-bends.shader.js'

/** Ce que l'echappatoire recoit. */
export interface ColorBendsControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface ColorBendsOwnProps {
  /** Nombre de nappes. @defaultValue 3 */
  sheets?: number
  /** Epaisseur des nappes, en fraction du cadre. @defaultValue 0.16 */
  thickness?: number
  /** Amplitude des pliures. @defaultValue 0.7 */
  bend?: number
  /** Vitesse du mouvement. @defaultValue 0.3 */
  speed?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<ColorBendsControls>
}

/** Toutes les proprietes. */
export type ColorBendsProps = Customisable<ColorBendsOwnProps>

/** Tokens employes par defaut : le fond, la premiere et la derniere nappe. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-violet-500',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-tr o-from-brand-200 dark:o-from-brand-900 o-via-zinc-50 dark:o-via-zinc-950 o-to-violet-200 dark:o-to-violet-900'

/**
 * Plafond en qualite basse.
 *
 * Chaque nappe est une rotation et deux sinus : c'est le seul levier de
 * cout. En qualite basse, deux nappes au plus, quel que soit le reglage.
 */
const LOW_CAP = 2

/**
 * Nappes pliees.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <ColorBends className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function ColorBends({
  sheets = 3,
  thickness = 0.16,
  bend = 0.7,
  speed = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ColorBendsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: COLOR_BENDS_FRAGMENT,
    colors,
    uniforms: {
      uSheets: sheets,
      uThickness: thickness,
      uBend: bend,
      uSpeed: speed,
    },
    name: 'color-bends',
    degrade: (quality) => ({
      uSheets: quality === 'low' ? Math.min(sheets, LOW_CAP) : sheets,
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
