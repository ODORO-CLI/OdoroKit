/**
 * Aquarelle : des taches qui s'etalent, sechent et s'effacent.
 *
 * ## Le principe
 *
 * Chaque tache vit un cycle a phase propre : elle s'etale vite puis freine,
 * son pigment migre vers le bord en sechant — le lisere sombre de
 * l'aquarelle — puis elle s'efface et renait ailleurs. Le bord suit un bruit
 * fixe dans le plan, comme l'eau suit les fibres du papier.
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

import { WATERCOLOR_FRAGMENT } from './watercolor.shader.js'

/** Ce que l'echappatoire recoit. */
export interface WatercolorControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface WatercolorOwnProps {
  /** Vitesse du cycle. @defaultValue 0.25 */
  speed?: number
  /** Nombre de taches vivantes. @defaultValue 6 */
  blots?: number
  /** Frange du bord. @defaultValue 0.5 */
  bleed?: number
  /** Grain du papier. @defaultValue 0.3 */
  grain?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<WatercolorControls>
}

/** Toutes les proprietes. */
export type WatercolorProps = Customisable<WatercolorOwnProps>

/** Tokens employes par defaut : le papier, les deux pigments. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-sky-400',
] as const

/** Repli par defaut : un lavis fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-brand-200 dark:o-via-brand-900 o-to-sky-200 dark:o-to-sky-900'

/**
 * Nombre de taches en qualite basse.
 *
 * Chaque tache lit une somme d'octaves pour sa frange : c'est le seul levier
 * de cout du shader.
 */
const LOW_BLOTS = 3

/**
 * Aquarelle.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Watercolor className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Watercolor({
  speed = 0.25,
  blots = 6,
  bleed = 0.5,
  grain = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: WatercolorProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: WATERCOLOR_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uBlots: blots, uBleed: bleed, uGrain: grain },
    name: 'watercolor',
    // Le nombre de taches est le seul reglage qui pese : c'est le seul borne.
    degrade: (quality) => ({
      uBlots: quality === 'low' ? Math.min(blots, LOW_BLOTS) : blots,
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
