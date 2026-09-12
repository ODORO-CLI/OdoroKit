/**
 * Voile sombre : une etoffe de bruit qui ondule au-dessus d'une lueur.
 *
 * ## Le principe
 *
 * Deux foyers lents font une lueur dans le bas du cadre ; un bruit fractal
 * deforme par lui-meme dessine un voile dont les plis derivent, et la lueur
 * ne passe que par ses trouees. Le voile se pose par melange borne vers sa
 * teinte profonde, pas par assombrissement : il reste lisible sur fond clair.
 *
 * ## Ce que ce composant delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur.
 *
 * Le repli n'est pas une precaution : il est affiche pendant le chargement du
 * backend, quand WebGL manque, quand l'arbitre refuse la surface et sous
 * mouvement reduit.
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

import { DARK_VEIL_FRAGMENT } from './dark-veil.shader.js'

/** Ce que l'echappatoire recoit. */
export interface DarkVeilControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface DarkVeilOwnProps {
  /** Vitesse de derive du voile. @defaultValue 0.5 */
  speed?: number
  /** Echelle des plis. Plus haut, plus fin. @defaultValue 1.8 */
  scale?: number
  /** Epaisseur du voile. A zero, seule la lueur reste. @defaultValue 0.8 */
  opacity?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<DarkVeilControls>
}

/** Toutes les proprietes. */
export type DarkVeilProps = Customisable<DarkVeilOwnProps>

/** Tokens employes par defaut : le fond, la lueur, la teinte du voile. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-indigo-950',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-violet-100 dark:o-from-violet-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Detail du bruit hors qualite basse.
 *
 * Le voile demande trois sommes d'octaves — deux pour la deformation, une
 * pour la matiere — donc chaque octave se paie trois fois. C'est le seul
 * levier de cout du shader.
 */
const OCTAVES = 4

/** Detail du bruit en qualite basse. */
const LOW_OCTAVES = 2

/**
 * Voile sombre.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <DarkVeil className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function DarkVeil({
  speed = 0.5,
  scale = 1.8,
  opacity = 0.8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: DarkVeilProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: DARK_VEIL_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uOpacity: opacity, uOctaves: OCTAVES },
    name: 'dark-veil',
    degrade: (quality) => ({
      uOctaves: quality === 'low' ? LOW_OCTAVES : OCTAVES,
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
