/**
 * Vague hexagonale : un nid d'abeille dont les alveoles s'allument en vague
 * depuis le pointeur.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : la source de la vague
 * rattrape le curseur en douceur, et les alveoles s'allument en cercles qui
 * s'en eloignent. A la sortie du cadre, le hook ramene la cible au centre
 * et la vague y revient.
 *
 * Ce qui distingue cette entree de `hex` : la, chaque alveole pulse a son
 * rythme, sans direction ni pointeur ; ici toutes obeissent a une seule
 * vague, et chacune s'allume d'un bloc parce que la vague est evaluee en
 * son centre.
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

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

import { HEX_WAVE_FRAGMENT } from './hex-wave.shader.js'

/** Ce que l'echappatoire recoit. */
export interface HexWaveControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface HexWaveOwnProps {
  /** Alveoles par hauteur de cadre. Borne a quarante par le shader. @defaultValue 9 */
  size?: number
  /** Vitesse de la vague. @defaultValue 0.6 */
  speed?: number
  /** Vagues par hauteur de cadre. @defaultValue 3 */
  spacing?: number
  /** Vitesse d'extinction avec la distance. @defaultValue 2.5 */
  fade?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<HexWaveControls>
}

/** Toutes les proprietes. */
export type HexWaveProps = Customisable<HexWaveOwnProps>

/** Tokens employes par defaut : le fond, les aretes, les alveoles allumees. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-amber-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Vague hexagonale.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <HexWave className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function HexWave({
  size = 9,
  speed = 0.6,
  spacing = 3,
  fade = 2.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: HexWaveProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place : la surface relit les uniforms a chaque
  // image, l'identite ne change pas, la mutation suffit — aucun setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({
    host,
    speed: 3,
    name: 'vague hexagonale : pointeur',
  })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture
        // (coin bas-gauche, y vers le haut).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'vague hexagonale : pont' },
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
    fragment: HEX_WAVE_FRAGMENT,
    colors,
    uniforms: { uPointer, uSize: size, uSpeed: speed, uSpacing: spacing, uFade: fade },
    name: 'hex-wave',
    // Des alveoles petites scintillent sur leurs aretes a densite de
    // pixels reduite : en qualite basse, elles s'elargissent.
    degrade: (quality) => ({
      uSize: quality === 'low' ? Math.min(size, 6) : size,
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
