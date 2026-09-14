/**
 * Champ electrique : une echelle de Jacob, l'arc qui monte entre deux
 * electrodes et se rompt.
 *
 * ## Le principe
 *
 * Deux electrodes qui divergent, un arc qui s'amorce en bas et monte, porte
 * par l'air qu'il chauffe, jusqu'a ce que l'ecart le rompe. Son chemin est
 * rehache une trentaine de fois par seconde : c'est ce rehachage qui
 * crepite. Deux fantomes le suivent un peu plus bas, la trace de l'air
 * ionise qu'il vient de quitter.
 *
 * Ce qui distingue cette entree de `lightning` : l'eclair est un coup, une
 * fois de temps en temps, qui tombe du ciel ; l'arc, lui, est continu, tenu
 * entre deux electrodes visibles, et il monte.
 *
 * ## Ce que ce composant delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur.
 *
 * Le repli est affiche pendant le chargement du backend, quand WebGL manque,
 * quand l'arbitre refuse la surface et sous mouvement reduit.
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

import { ELECTRIC_FIELD_FRAGMENT } from './electric-field.shader.js'

/** Ce que l'echappatoire recoit. */
export interface ElectricFieldControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface ElectricFieldOwnProps {
  /** Montees de l'arc par seconde. @defaultValue 0.35 */
  speed?: number
  /** Amplitude du deplacement du chemin. @defaultValue 0.5 */
  jitter?: number
  /** Portee de la lueur autour du trait. @defaultValue 0.5 */
  glow?: number
  /** Octaves du deplacement, donc la brisure du chemin. @defaultValue 3 */
  branches?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<ElectricFieldControls>
}

/** Toutes les proprietes. */
export type ElectricFieldProps = Customisable<ElectricFieldOwnProps>

/** Tokens employes par defaut : le fond, la lueur, le trait. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-cyan-400', '--o-theme-fg'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Champ electrique.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <ElectricField className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function ElectricField({
  speed = 0.35,
  jitter = 0.5,
  glow = 0.5,
  branches = 3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ElectricFieldProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: ELECTRIC_FIELD_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uJitter: jitter, uGlow: glow, uBranches: branches },
    name: 'electric-field',
    // Chaque octave est une lecture de bruit de plus, pour l'arc et pour
    // chacun de ses fantomes : c'est le reglage qui pese, donc le borne.
    degrade: (quality) => ({
      uBranches: quality === 'low' ? Math.min(branches, 2) : branches,
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
