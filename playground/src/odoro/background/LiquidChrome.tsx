/**
 * Chrome liquide : un liquide chrome qui reflechit un studio : ciel clair, sol sombre, horizon dur, en encre sur le fond clair et en lueur sur le sombre.
 *
 * ## Le principe
 *
 * Le chrome ne se peint pas, il reflechit : la direction reflechie d'une
 * surface de vagues molles regarde soit le ciel, soit le sol, et cette
 * marche brutale fait le chrome. Le ciel et le sol sont le fond et
 * l'encre du theme, ranges par luminance : en clair le chrome se dessine
 * en encre, en sombre il luit, sans jamais multiplier le fond vers le noir.
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

import { LIQUID_CHROME_FRAGMENT } from './liquid-chrome.shader.js'

/** Ce que l'echappatoire recoit. */
export interface LiquidChromeControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface LiquidChromeOwnProps {
  /** Vitesse du liquide. @defaultValue 0.35 */
  speed?: number
  /** Echelle des vagues. @defaultValue 1.6 */
  scale?: number
  /** Profondeur du sol dans le reflet. @defaultValue 0.8 */
  contrast?: number
  /** Force de la teinte a l horizon. @defaultValue 0.5 */
  sheen?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<LiquidChromeControls>
}

/** Toutes les proprietes. */
export type LiquidChromeProps = Customisable<LiquidChromeOwnProps>

/** Tokens employes par defaut : le fond, l'encre, la teinte de l'horizon. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-sky-400'] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-sky-200 dark:o-via-sky-900 o-to-zinc-400 dark:o-to-zinc-700'

/**
 * Detail hors qualite basse.
 *
 * Les vagues fines ne changent pas la nature du reflet, seulement son
 * grain : ce sont elles qui tombent en qualite basse.
 */
const DETAIL = 5

/** Detail en qualite basse. */
const LOW_DETAIL = 3

/**
 * Chrome liquide.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <LiquidChrome className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function LiquidChrome({
  speed = 0.35,
  scale = 1.6,
  contrast = 0.8,
  sheen = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LiquidChromeProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LIQUID_CHROME_FRAGMENT,
    colors,
    uniforms: {
      uSpeed: speed,
      uScale: scale,
      uContrast: contrast,
      uSheen: sheen,
      uDetail: DETAIL,
    },
    name: 'liquid-chrome',
    degrade: (quality) => ({
      uDetail: quality === 'low' ? LOW_DETAIL : DETAIL,
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
