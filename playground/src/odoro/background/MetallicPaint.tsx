/**
 * Peinture metallique : une plaque brossee et pailletee dont le reflet suit
 * le curseur.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : la lampe qui eclaire la
 * plaque est placee au curseur, un peu au-dessus du plan. Bouger le pointeur
 * revient donc a incliner la plaque, et le reflet balaie les stries de
 * brossage. A la sortie du cadre, le hook ramene la cible au centre.
 *
 * Ce qui distingue cette entree de `liquid-chrome` : le chrome y reflete un
 * studio fixe, sans pointeur, et sa surface ondule ; ici la surface est
 * plate, mate, striee, et c'est la lampe qui bouge. De `molten-metal` : le
 * bain y est chaud et coule. Et de `ferrofluid`, qui deforme sa matiere sous
 * le pointeur au lieu de l'eclairer.
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

import { METALLIC_PAINT_FRAGMENT } from './metallic-paint.shader.js'

/** Ce que l'echappatoire recoit. */
export interface MetallicPaintControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface MetallicPaintOwnProps {
  /** Profondeur des stries de brossage. @defaultValue 8 */
  relief?: number
  /** Durete du reflet, entre zero et un. @defaultValue 0.55 */
  sheen?: number
  /** Densite des paillettes, entre zero et un. @defaultValue 0.5 */
  flakes?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<MetallicPaintControls>
}

/** Toutes les proprietes. */
export type MetallicPaintProps = Customisable<MetallicPaintOwnProps>

/** Tokens employes par defaut : le fond, le metal, le reflet. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-amber-200',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-tr o-from-zinc-50 dark:o-from-zinc-950 o-to-amber-100 dark:o-to-amber-950'

/**
 * Peinture metallique.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <MetallicPaint className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function MetallicPaint({
  relief = 8,
  sheen = 0.55,
  flakes = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MetallicPaintProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place : la surface relit les uniforms a chaque
  // image, l'identite ne change pas, la mutation suffit — aucun setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  // Vitesse 3 : une plaque a de l'inertie, le reflet ne saute pas.
  const pointer = usePointerDamped({ host, speed: 3, name: 'metallic-paint : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture
        // (coin bas-gauche, y vers le haut).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'metallic-paint : pont' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  const { ref, setHost: setShaderHost, ready, refused, colours } =
    useTokenShader<HTMLDivElement>({
      fragment: METALLIC_PAINT_FRAGMENT,
      colors,
      uniforms: { uPointer, uRelief: relief, uSheen: sheen, uFlakes: flakes },
      name: 'metallic-paint',
      // Les stries et les paillettes vivent sous le pixel a densite reduite :
      // elles s'y lisent comme un fourmillement. Le relief est adouci et les
      // paillettes coupees plutot que de laisser le bruit gagner.
      degrade: (quality) =>
        quality === 'low'
          ? { uRelief: relief * 0.5, uFlakes: 0 }
          : { uRelief: relief, uFlakes: flakes },
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
