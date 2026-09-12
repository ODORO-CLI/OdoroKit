/**
 * Sable qui coule : des filets de grains qui tombent sur un tas.
 *
 * ## Le principe
 *
 * Pas de nappe : une grille fine dont chaque cellule tire au sort un grain.
 * Un filet est cette grille qui defile vers le bas, a sa vitesse propre, avec
 * une densite qui s'effiloche loin de l'axe ; le tas, en bas, est la meme
 * grille immobile, sous un profil de bosses elevees par chaque filet. Les
 * grains disparaissent a la surface du tas, et un peu de poussiere s'y
 * souleve.
 *
 * Ce qui distingue cette entree de `dunes` : celle-ci est un relief eclaire,
 * une surface continue ; ici tout est grain, et tout tombe.
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

import { SAND_FLOW_FRAGMENT } from './sand-flow.shader.js'

/** Ce que l'echappatoire recoit. */
export interface SandFlowControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface SandFlowOwnProps {
  /** Nombre de filets. Borne a six par le shader. @defaultValue 3 */
  streams?: number
  /** Nombre de grains par hauteur de cadre. @defaultValue 110 */
  grain?: number
  /** Vitesse de chute. @defaultValue 1 */
  speed?: number
  /** Hauteur du tas, en hauteurs de cadre. @defaultValue 0.22 */
  heap?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<SandFlowControls>
}

/** Toutes les proprietes. */
export type SandFlowProps = Customisable<SandFlowOwnProps>

/** Tokens employes par defaut : le fond, le sable, les grains clairs. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-500',
  '--o-palette-yellow-200',
] as const

/** Repli par defaut : le tas fige en degrade, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-amber-300 dark:o-from-amber-900 o-via-zinc-50 dark:o-via-zinc-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Sable qui coule.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <SandFlow className="o-absolute o-inset-0" streams={4} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function SandFlow({
  streams = 3,
  grain = 110,
  speed = 1,
  heap = 0.22,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SandFlowProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SAND_FLOW_FRAGMENT,
    colors,
    uniforms: { uStreams: streams, uGrain: grain, uSpeed: speed, uHeap: heap },
    name: 'sand-flow',
    // Un grain plus fin que le pixel scintille a densite reduite : en qualite
    // basse, les grains grossissent plutot que de disparaitre.
    degrade: (quality) => ({
      uGrain: quality === 'low' ? Math.min(grain, 70) : grain,
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
