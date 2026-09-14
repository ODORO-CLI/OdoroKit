/**
 * Torche : un voile sombre perce d'une lueur qui suit le curseur.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : la lueur rattrape le
 * curseur en douceur et revele le motif sous le voile. A la sortie du cadre,
 * le hook ramene la cible au centre — la lueur y revient d'elle-meme.
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

import { TORCH_FRAGMENT } from './torch.shader.js'

/** Ce que l'echappatoire recoit. */
export interface TorchControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface TorchOwnProps {
  /** Rayon de la lueur, en hauteurs de cadre. @defaultValue 0.3 */
  radius?: number
  /** Douceur du bord de la lueur. @defaultValue 0.6 */
  softness?: number
  /** Opacite du voile hors du faisceau. @defaultValue 0.85 */
  dim?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<TorchControls>
}

/** Toutes les proprietes. */
export type TorchProps = Customisable<TorchOwnProps>

/** Tokens employes par defaut : le fond, le motif, la chaleur du faisceau. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-400',
  '--o-palette-orange-200',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-amber-950'

/**
 * Torche.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Torch className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Torch({
  radius = 0.3,
  softness = 0.6,
  dim = 0.85,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: TorchProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place : la surface relit les uniforms a chaque
  // image, l'identite ne change pas, la mutation suffit — aucun setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 4, name: 'torch : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture
        // (coin bas-gauche, y vers le haut).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'torch : pont' },
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
    fragment: TORCH_FRAGMENT,
    colors,
    uniforms: { uPointer, uRadius: radius, uSoftness: softness, uDim: dim },
    name: 'torch',
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
