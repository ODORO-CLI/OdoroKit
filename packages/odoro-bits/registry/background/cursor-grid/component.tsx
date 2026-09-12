/**
 * Grille au curseur : une nappe de paves qui s'allument autour du pointeur
 * et gardent la trace de son passage.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, par deux positions plutot qu'une : la vive,
 * amortie court, allume les paves proches ; la retardee, un second
 * amortissement pose sur la premiere, laisse une trainee plus large et plus
 * sourde derriere le geste. Deux positions suffisent la ou un tampon
 * d'historique serait autrement necessaire.
 *
 * Ce qui distingue cette entree de `magnet-grid` : celle-ci deplace des
 * points, ici rien ne bouge — ce sont des paves qui s'allument. De
 * `grid-distortion` : la grille y est grossie par une lentille, pas
 * eclairee. Et de `tiles-flip`, ou les tuiles se retournent.
 *
 * ## Le pont pointeur → shader
 *
 * Aucun rendu React par image : deux tableaux stables passes en uniforms
 * sont mutes en place dans la boucle du moteur, en priorite d'entree. La
 * surface relit ses uniforms a chaque image.
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

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

import { CURSOR_GRID_FRAGMENT } from './cursor-grid.shader.js'

/** Ce que l'echappatoire recoit. */
export interface CursorGridControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface CursorGridOwnProps {
  /** Nombre de cellules sur la hauteur. Borne a quarante-huit par le shader. @defaultValue 14 */
  cells?: number
  /** Portee de l'allumage, en hauteurs de cadre. @defaultValue 0.28 */
  radius?: number
  /** Force de la trainee laissee par le geste. @defaultValue 0.7 */
  trail?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<CursorGridControls>
}

/** Toutes les proprietes. */
export type CursorGridProps = Customisable<CursorGridOwnProps>

/** Tokens employes par defaut : le fond, le filet et la trainee, les paves vifs. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-sky-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Vitesse de rattrapage de la position retardee, en unites par seconde.
 *
 * Bien plus lente que celle du pointeur vif : c'est l'ecart entre les deux
 * qui dessine la trainee.
 */
const ECHO_SPEED = 1.6

/**
 * Grille au curseur.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <CursorGrid className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function CursorGrid({
  cells = 14,
  radius = 0.28,
  trail = 0.7,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CursorGridProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableaux stables, mutes en place : la surface relit les uniforms a
  // chaque image, l'identite ne change pas, la mutation suffit.
  const uPointer = useRef<number[]>([0.5, 0.5]).current
  const uEcho = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 6, name: 'cursor-grid : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ delta }) => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture
        // (coin bas-gauche, y vers le haut).
        const x = (pointer.current.x + 1) / 2
        const y = 1 - (pointer.current.y + 1) / 2
        uPointer[0] = x
        uPointer[1] = y

        // Second amortissement, pose sur le premier. La fraction depend du
        // temps ecoule : le retard est le meme a toute cadence d'affichage.
        const factor = 1 - Math.exp(-ECHO_SPEED * delta)
        const ex = uEcho[0] ?? x
        const ey = uEcho[1] ?? y
        uEcho[0] = ex + (x - ex) * factor
        uEcho[1] = ey + (y - ey) * factor
      },
      { priority: CLOCK_PRIORITY.input, name: 'cursor-grid : pont' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer, uEcho])

  const { ref, setHost: setShaderHost, ready, refused, colours } =
    useTokenShader<HTMLDivElement>({
      fragment: CURSOR_GRID_FRAGMENT,
      colors,
      uniforms: { uPointer, uEcho, uCells: cells, uRadius: radius, uTrail: trail },
      name: 'cursor-grid',
      // Une grille serree scintille sur ses filets a densite de pixels
      // reduite : en qualite basse, les paves s'elargissent.
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
