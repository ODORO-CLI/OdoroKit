/**
 * Lampe a lave : des gouttes de cire etirees qui montent et redescendent.
 *
 * ## Le principe
 *
 * Des surfaces implicites contraintes par la lampe : distance etiree
 * verticalement, mouvement vertical lent, reserve de cire en bas dans laquelle
 * les gouttes naissent et se fondent. Chaque goutte porte sa couleur, tiree de
 * sa hauteur, et deux gouttes qui se rejoignent melangent les leurs dans la
 * matiere.
 *
 * ## Ce qui la distingue de la lave
 *
 * La lave est un champ libre, chaud, seuille en deux paliers. Ici, tout est
 * vertical et lent, les gouttes sont des ovales, et la couleur est une
 * propriete de chaque goutte — pas un palier du champ. Le rendu n'a rien de
 * commun.
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

import { LAVA_LAMP_FRAGMENT } from './lava-lamp.shader.js'

/** Ce que l'echappatoire recoit. */
export interface LavaLampControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface LavaLampOwnProps {
  /** Vitesse de la montee. @defaultValue 0.08 */
  speed?: number
  /** Nombre de gouttes. @defaultValue 5 */
  drops?: number
  /** Etirement vertical des gouttes. @defaultValue 1.6 */
  stretch?: number
  /** Lueur de la chauffe, en bas. @defaultValue 0.5 */
  glow?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<LavaLampControls>
}

/** Toutes les proprietes. */
export type LavaLampProps = Customisable<LavaLampOwnProps>

/** Tokens employes par defaut : le verre, la cire chaude, la cire refroidie. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-400',
] as const

/** Repli par defaut : la chauffe figee, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-brand-300 dark:o-from-brand-900 o-via-zinc-50 dark:o-via-zinc-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Nombre de gouttes en qualite basse.
 *
 * Chaque goutte est un champ de plus a sommer et a ponderer : c'est le seul
 * levier de cout du shader.
 */
const LOW_DROPS = 3

/**
 * Lampe a lave.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <LavaLamp className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function LavaLamp({
  speed = 0.08,
  drops = 5,
  stretch = 1.6,
  glow = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LavaLampProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LAVA_LAMP_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDrops: drops, uStretch: stretch, uGlow: glow },
    name: 'lava-lamp',
    // Le nombre de gouttes est le seul reglage qui pese : c'est le seul borne.
    degrade: (quality) => ({
      uDrops: quality === 'low' ? Math.min(drops, LOW_DROPS) : drops,
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
