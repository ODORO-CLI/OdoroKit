/**
 * Grille sous lentille : un quadrillage qu'une loupe grossit la ou le
 * pointeur passe.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : la lentille rattrape le
 * curseur en douceur, et la grille se dilate sous elle. A la sortie du
 * cadre, le hook ramene la cible au centre et la lentille y revient.
 *
 * Ce qui distingue cette entree de `magnet-grid` : celle-ci deplace des
 * points ; ici ce sont des lignes continues, et elles se courbent comme
 * sous un verre. Et de `ripple-grid` : l'onde y est radiale et temporelle,
 * sans pointeur.
 *
 * ## Le pont pointeur → shader
 *
 * Aucun rendu React par image : le composant mute en place un tableau stable
 * passe en uniform, et la surface relit ses uniforms a chaque image. La
 * recopie se fait dans la boucle du moteur, en priorite d'entree.
 *
 * ## Sous mouvement reduit
 *
 * La surface est refusee par le moteur et le repli statique s'affiche : le
 * suivi du pointeur est un agrement, pas un contenu.
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

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped'

import { GRID_DISTORTION_FRAGMENT } from './grid-distortion.shader.js'

/** Ce que l'echappatoire recoit. */
export interface GridDistortionControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface GridDistortionOwnProps {
  /** Nombre de cellules sur la hauteur. Borne a soixante par le shader. @defaultValue 16 */
  cells?: number
  /** Force du grossissement, entre zero et un. @defaultValue 0.55 */
  strength?: number
  /** Rayon de la lentille, en hauteurs de cadre. @defaultValue 0.3 */
  radius?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<GridDistortionControls>
}

/** Toutes les proprietes. */
export type GridDistortionProps = Customisable<GridDistortionOwnProps>

/** Tokens employes par defaut : le fond, les lignes, le bord de la lentille. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-brand-500',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Grille sous lentille.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GridDistortion className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GridDistortion({
  cells = 16,
  strength = 0.55,
  radius = 0.3,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GridDistortionProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place : la surface relit les uniforms a chaque
  // image, l'identite ne change pas, la mutation suffit — aucun setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({
    host,
    speed: 4,
    name: 'grille sous lentille : pointeur',
  })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture
        // (coin bas-gauche, y vers le haut).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'grille sous lentille : pont' },
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
    fragment: GRID_DISTORTION_FRAGMENT,
    colors,
    uniforms: { uPointer, uCells: cells, uStrength: strength, uRadius: radius },
    name: 'grid-distortion',
    // Une grille serree scintille sur ses lignes a densite de pixels
    // reduite : en qualite basse, les cellules s'elargissent.
    degrade: (quality) => ({
      uCells: quality === 'low' ? Math.min(cells, 10) : cells,
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
