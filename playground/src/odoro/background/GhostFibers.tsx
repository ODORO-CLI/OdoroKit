/**
 * Fibres fantomes : des filaments qui derivent en travers du cadre et se
 * pincent vers le pointeur quand il passe sous eux.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : au droit du curseur, les
 * fibres sont tirees vers son ordonnee, d'autant plus qu'elles en sont
 * proches en abscisse. Le pincement est une interpolation, pas une force :
 * les fibres retrouvent leur trace des que le curseur s'eloigne, sans
 * ressort ni memoire. A la sortie du cadre, le hook ramene la cible au
 * centre.
 *
 * Ce qui distingue cette entree de `strands` : les meches y sont ancrees en
 * bas du cadre et balancent, sans pointeur. De `threads` : le faisceau y est
 * fixe et d'epaisseur constante. Et de `web-threads` : c'est une toile de
 * points relies, en scene 3D.
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

import { GHOST_FIBERS_FRAGMENT } from './ghost-fibers.shader.js'

/** Ce que l'echappatoire recoit. */
export interface GhostFibersControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface GhostFibersOwnProps {
  /** Nombre de fibres. Borne a douze par le shader. @defaultValue 9 */
  fibers?: number
  /** Force de l'attraction vers le pointeur, entre zero et un. @defaultValue 0.7 */
  bend?: number
  /** Vitesse de derive des fibres. @defaultValue 0.6 */
  speed?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<GhostFibersControls>
}

/** Toutes les proprietes. */
export type GhostFibersProps = Customisable<GhostFibersOwnProps>

/** Tokens employes par defaut : le fond, les fibres au repos, les fibres tirees. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-cyan-300',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-cyan-100 dark:o-via-cyan-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Fibres fantomes.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GhostFibers className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GhostFibers({
  fibers = 9,
  bend = 0.7,
  speed = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GhostFibersProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place : la surface relit les uniforms a chaque
  // image, l'identite ne change pas, la mutation suffit — aucun setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 3.5, name: 'ghost-fibers : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture
        // (coin bas-gauche, y vers le haut).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'ghost-fibers : pont' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  const { ref, setHost: setShaderHost, ready, refused, colours } =
    useTokenShader<HTMLDivElement>({
      fragment: GHOST_FIBERS_FRAGMENT,
      colors,
      uniforms: { uPointer, uFibers: fibers, uBend: bend, uSpeed: speed },
      name: 'ghost-fibers',
      // Chaque fibre coute deux exponentielles par fragment : c'est le seul
      // levier qui compte, et il se regle par le nombre.
      degrade: (quality) => ({
        uFibers: quality === 'low' ? Math.min(fibers, 5) : fibers,
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
