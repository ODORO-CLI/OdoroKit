/**
 * Fond anime : une trame de points qui se revele depuis le centre.
 *
 * ## Une seule surface, meme pour l'aller et le retour
 *
 * L'implementation dont ce composant s'inspire montait **deux** canevas — un
 * pour la revelation, un pour son inverse — et les faisait se croiser pendant
 * deux secondes. Cela ne peut pas fonctionner ici, et le mode de defaillance
 * merite d'etre connu : l'arbitre de surfaces n'accorde qu'un contexte par
 * bibliotheque, si bien que le second canevas serait refuse et afficherait son
 * repli. La transition ne se verrait pas, et rien ne le signalerait.
 *
 * Le sens est donc un **uniforme**, pas un second montage. `uPhase` retient le
 * temps auquel le sens a change : sans lui, l'inversion reprendrait le temps
 * absolu, ou l'animation est terminee depuis longtemps, et le retour serait
 * instantane.
 *
 * C'est aussi moins cher — un contexte au lieu de deux — et le croisement est
 * exact, puisqu'il n'y a rien a croiser.
 *
 * ## Les couleurs viennent de la palette
 *
 * Trois tokens : deux teintes de points et le fond. La surface est allouee sans
 * canal alpha, donc le fond appartient au rendu et ne peut pas etre laisse a
 * une classe posee derriere.
 *
 * ## Le repli n'est pas une precaution
 *
 * Il est affiche pendant le chargement du backend, quand WebGL manque, quand
 * l'arbitre refuse la surface, et sous mouvement reduit — ou un fond anime
 * n'apporte rien d'autre que son mouvement.
 *
 * @module
 */

import {
  clock,
  mergePresentation,
  readTokenColour,
  useMotionState,
  useOnReady,
  useShaderSurface,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useEffect, useMemo, useState, type ReactElement } from 'react'

import { DOT_MATRIX_FRAGMENT } from './dot-matrix.shader.js'

/** Ce que l'echappatoire recoit. */
export interface DotMatrixControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Temps auquel la phase courante a commence, en secondes. */
  readonly phase: number
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface DotMatrixOwnProps {
  /**
   * Sens de la revelation. `false` allume les points depuis le centre ; `true`
   * les eteint depuis les bords.
   *
   * Le changement relance l'animation : c'est une transition, pas un etat.
   *
   * @defaultValue false
   */
  reverse?: boolean
  /** Vitesse de propagation du front. @defaultValue 0.6 */
  speed?: number
  /** Nombre de cellules sur le plus petit cote. @defaultValue 42 */
  cells?: number
  /** Cote du point, en fraction de la cellule. @defaultValue 0.3 */
  dot?: number
  /** Part de scintillement, de 0 a 1. @defaultValue 0.7 */
  flicker?: number
  /** Tokens des deux teintes de points et du fond. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<DotMatrixControls>
}

/** Toutes les proprietes. */
export type DotMatrixProps = Customisable<DotMatrixOwnProps>

/** Tokens employes par defaut : deux teintes de points, puis le fond. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-50',
  '--o-palette-zinc-400',
  '--o-palette-zinc-950',
] as const

/** Repli par defaut : le fond seul, sans la trame. */
const DEFAULT_FALLBACK = 'o-bg-zinc-950'

/**
 * Nombre de cellules en qualite basse.
 *
 * Le cout de ce shader ne tient pas au nombre de cellules — chaque fragment
 * fait le meme travail quelle que soit la maille — mais une trame plus large
 * reduit le nombre de bords, et donc le scintillement d'echantillonnage sur les
 * ecrans dont la densite a ete plafonnee.
 */
const LOW_CELLS = 28

/**
 * Trame de points revelee depuis le centre.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <DotMatrix className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 *
 * @example
 * // Le sens s'inverse par une prop : la surface, elle, ne bouge pas.
 * const [parti, setParti] = useState(false)
 * <DotMatrix reverse={parti} onReady={() => console.log('trame prete')} />
 */
export function DotMatrix({
  reverse = false,
  speed = 0.6,
  cells = 42,
  dot = 0.3,
  flicker = 0.7,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: DotMatrixProps): ReactElement {
  const { quality, reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [colours, setColours] = useState<readonly ShaderColour[]>([])

  // Les couleurs sont relues quand l'hote change, quand les tokens demandes
  // changent, et quand le theme bascule — ce dernier cas passe par la politique
  // de mouvement, qui se renouvelle a chaque changement d'etat.
  useEffect(() => {
    if (host === null) return
    setColours(colors.map((token) => readTokenColour(token, host)))
  }, [host, colors, reduced, quality])

  // Le sens change : l'animation repart de son debut, et non du temps absolu
  // ou elle est achevee depuis longtemps.
  const [phase, setPhase] = useState(() => clock.time)
  useEffect(() => {
    setPhase(clock.time)
  }, [reverse])

  const uniforms = useMemo(() => {
    const [a, b, background] = colours
    if (a === undefined || b === undefined || background === undefined) return undefined

    return {
      uColorA: a,
      uColorB: b,
      uColorBackground: background,
      uCells: quality === 'low' ? LOW_CELLS : cells,
      uDot: dot,
      uSpeed: speed,
      uReverse: reverse ? 1 : 0,
      uPhase: phase,
      uFlicker: flicker,
    }
  }, [colours, quality, cells, dot, speed, reverse, phase, flicker])

  const { ref, ready, refused } = useShaderSurface<HTMLDivElement>({
    fragment: DOT_MATRIX_FRAGMENT,
    // La surface n'est montee qu'une fois les couleurs lues : la construire
    // avec des uniformes vides peindrait une image noire avant la premiere
    // correction, ce que le repli couvre deja mieux.
    uniforms: uniforms ?? {},
    name: 'trame',
  })

  useOnReady(onReady, ready ? { colours, phase, refused } : null, host)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const showFallback = !ready || refused !== undefined || uniforms === undefined

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
      {showFallback ? <div className={`o-absolute o-inset-0 ${fallback}`} /> : null}
    </div>
  )
}
