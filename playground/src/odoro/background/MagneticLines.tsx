/**
 * Lignes de champ : les cercles d'un dipole, dont le pointeur deplace un pole.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : le second pole s'ecarte de
 * sa place au rythme du curseur, et toutes les lignes se redessinent autour
 * de lui — elles sont calculees, pas stockees. A la sortie du cadre, le hook
 * ramene la cible au centre et le pole revient.
 *
 * Ce qui distingue cette entree de `magnet-grid` : celle-ci ecarte des points
 * d'une grille ; ici il n'y a pas de grille, seulement les lignes continues
 * du champ, qui glissent d'un pole a l'autre.
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

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped'

import { MAGNETIC_LINES_FRAGMENT } from './magnetic-lines.shader.js'

/** Ce que l'echappatoire recoit. */
export interface MagneticLinesControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface MagneticLinesOwnProps {
  /** Nombre de lignes de champ par tour. @defaultValue 16 */
  lines?: number
  /** Demi-distance des poles, en hauteurs de cadre. @defaultValue 0.35 */
  spread?: number
  /** Vitesse de glissement des lignes le long du champ. @defaultValue 0.15 */
  speed?: number
  /** Dessine aussi les equipotentielles. @defaultValue true */
  potential?: boolean
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<MagneticLinesControls>
}

/** Toutes les proprietes. */
export type MagneticLinesProps = Customisable<MagneticLinesOwnProps>

/** Tokens employes par defaut : le fond, les lignes, les poles. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-rose-400',
  '--o-palette-amber-300',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Lignes de champ.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <MagneticLines className="o-absolute o-inset-0" potential={false} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function MagneticLines({
  lines = 16,
  spread = 0.35,
  speed = 0.15,
  potential = true,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MagneticLinesProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place dans la boucle : aucun setState par image.
  const uPointer = useRef<number[]>([0, 0]).current

  const pointer = usePointerDamped({ host, speed: 3, name: 'magnetic-lines : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Le shader recoit le repere du hook tel quel : centre, y vers le bas.
        uPointer[0] = pointer.current.x
        uPointer[1] = pointer.current.y
      },
      { priority: CLOCK_PRIORITY.input, name: 'magnetic-lines : pont' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  const { ref, setHost: setShaderHost, ready, refused, colours } =
    useTokenShader<HTMLDivElement>({
      fragment: MAGNETIC_LINES_FRAGMENT,
      colors,
      uniforms: {
        uPointer,
        uLines: lines,
        uSpread: spread,
        uSpeed: speed,
        uPotential: potential ? 1 : 0,
      },
      name: 'magnetic-lines',
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
