/**
 * Nappes parallaxes : trois voiles de bruit qui glissent avec le curseur.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : chaque nappe glisse d'un
 * facteur different — la plus fine bouge le plus — et c'est cet ecart qui fait
 * lire la profondeur. Sans pointeur, une derive automatique lente garde les
 * nappes vivantes : le fond n'est jamais mort.
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

import { VEIL_PARALLAX_FRAGMENT } from './veil-parallax.shader.js'

/** Ce que l'echappatoire recoit. */
export interface VeilParallaxControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface VeilParallaxOwnProps {
  /** Amplitude de la parallaxe. @defaultValue 0.25 */
  depth?: number
  /** Vitesse de la derive automatique. @defaultValue 0.08 */
  speed?: number
  /** Echelle du bruit. Plus haut, plus fin. @defaultValue 2.5 */
  scale?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<VeilParallaxControls>
}

/** Toutes les proprietes. */
export type VeilParallaxProps = Customisable<VeilParallaxOwnProps>

/** Tokens employes par defaut : le fond, les nappes, la surface. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-purple-400',
  '--o-palette-pink-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-stone-950 o-to-purple-950'

/**
 * Nappes parallaxes.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <VeilParallax className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function VeilParallax({
  depth = 0.25,
  speed = 0.08,
  scale = 2.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: VeilParallaxProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place dans la boucle : aucun setState par image.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  // Amortissement doux : une parallaxe seche donnerait le mal de mer.
  const pointer = usePointerDamped({ host, speed: 2, name: 'veil-parallax : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture.
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'veil-parallax : pont' },
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
    fragment: VEIL_PARALLAX_FRAGMENT,
    colors,
    uniforms: { uPointer, uDepth: depth, uSpeed: speed, uScale: scale },
    name: 'veil-parallax',
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
