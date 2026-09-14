/**
 * Grille magnetique : des points repousses — ou attires — par le curseur.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : chaque point de la grille
 * s'ecarte du curseur d'une force en exponentielle de la distance, ou s'en
 * rapproche quand `attract` est vrai. Le deplacement se calcule entierement
 * dans le shader : aucune geometrie, aucun element du document.
 *
 * ## Le pont pointeur → shader
 *
 * Aucun rendu React par image : la position amortie est recopiee dans un
 * tableau stable par une souscription a l'horloge du moteur, et la surface
 * relit ses uniforms a chaque image — la mutation suffit.
 *
 * ## Sous mouvement reduit
 *
 * La surface est refusee par le moteur et le repli statique s'affiche.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

import { MAGNET_GRID_FRAGMENT } from './magnet-grid.shader.js'

/** Ce que l'echappatoire recoit. */
export interface MagnetGridControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface MagnetGridOwnProps {
  /** Nombre de points par hauteur de cadre. @defaultValue 18 */
  density?: number
  /** Portee de l'aimant, en hauteurs de cadre. @defaultValue 0.25 */
  radius?: number
  /** Amplitude du decalage des points. @defaultValue 0.6 */
  force?: number
  /** Attire les points au lieu de les repousser. @defaultValue false */
  attract?: boolean
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<MagnetGridControls>
}

/** Toutes les proprietes. */
export type MagnetGridProps = Customisable<MagnetGridOwnProps>

/** Tokens employes par defaut : le fond, les points, les points excites. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-indigo-400',
  '--o-palette-sky-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-slate-950 o-to-zinc-50 dark:o-to-indigo-950'

/**
 * Grille magnetique.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <MagnetGrid className="o-absolute o-inset-0" attract />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function MagnetGrid({
  density = 18,
  radius = 0.25,
  force = 0.6,
  attract = false,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MagnetGridProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place dans la boucle : aucun setState par image.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 4, name: 'magnet-grid : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture.
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'magnet-grid : pont' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: MAGNET_GRID_FRAGMENT,
    colors,
    uniforms: {
      uPointer,
      uDensity: density,
      uRadius: radius,
      uForce: force,
      uAttract: attract ? 1 : 0,
    },
    name: 'magnet-grid',
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
        setShaderHost(element)
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
