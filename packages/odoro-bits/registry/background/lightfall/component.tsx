/**
 * Cascade de lumiere : des gouttes lumineuses qui tombent en colonnes.
 *
 * ## Le principe
 *
 * Une goutte par colonne, a sa propre cadence : une tete nette et une
 * trainee exponentielle au-dessus d'elle. Trois profondeurs se superposent,
 * plus fines et plus pales en s'eloignant, sur un rideau qui descend du haut.
 * Distinct de la pluie : des gouttes larges et lumineuses qui trainent, pas
 * des stries fines.
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

import { LIGHTFALL_FRAGMENT } from './lightfall.shader.js'

/** Ce que l'echappatoire recoit. */
export interface LightfallControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface LightfallOwnProps {
  /** Vitesse de chute. @defaultValue 1 */
  speed?: number
  /** Nombre de colonnes sur la hauteur du cadre. @defaultValue 9 */
  density?: number
  /** Longueur des trainees, en hauteurs de cadre. @defaultValue 0.25 */
  length?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<LightfallControls>
}

/** Toutes les proprietes. */
export type LightfallProps = Customisable<LightfallOwnProps>

/** Tokens employes par defaut : le fond, le rideau, les gouttes. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-500',
  '--o-palette-cyan-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-sky-100 dark:o-from-sky-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Profondeurs superposees hors qualite basse.
 *
 * Chaque profondeur est une couche entiere de gouttes : c'est le seul levier
 * de cout du shader, et la plus lointaine est aussi la plus pale — celle qui
 * manque le moins.
 */
const LAYERS = 3

/** Profondeurs en qualite basse. */
const LOW_LAYERS = 1

/**
 * Cascade de lumiere.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Lightfall className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Lightfall({
  speed = 1,
  density = 9,
  length = 0.25,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LightfallProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: LIGHTFALL_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uLength: length, uLayers: LAYERS },
    name: 'lightfall',
    degrade: (quality) => ({
      uLayers: quality === 'low' ? LOW_LAYERS : LAYERS,
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
