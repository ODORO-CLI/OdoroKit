/**
 * Sonar : des impulsions concentriques qui s'elargissent depuis le pointeur.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : le centre d'emission
 * rattrape le curseur en douceur, et les anneaux suivent — ils ne se
 * souviennent pas de leur origine. A la sortie du cadre, le hook ramene la
 * cible au centre et le sonar y revient de lui-meme.
 *
 * Ce qui distingue cette entree de `click-waves` : l'emission est continue
 * et suit le pointeur, la ou l'autre date chaque clic et laisse ses anneaux
 * au point exact de l'appui.
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

import { SONAR_FRAGMENT } from './sonar.shader.js'

/** Ce que l'echappatoire recoit. */
export interface SonarControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface SonarOwnProps {
  /** Vitesse de propagation des impulsions. @defaultValue 0.8 */
  speed?: number
  /** Anneaux par hauteur de cadre. @defaultValue 6 */
  spacing?: number
  /** Vitesse d'extinction avec la distance. @defaultValue 1.6 */
  fade?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<SonarControls>
}

/** Toutes les proprietes. */
export type SonarProps = Customisable<SonarOwnProps>

/** Tokens employes par defaut : le fond, les anneaux, le front des impulsions. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-emerald-500',
  '--o-palette-emerald-200',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-emerald-950'

/**
 * Sonar.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Sonar className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Sonar({
  speed = 0.8,
  spacing = 6,
  fade = 1.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SonarProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place : la surface relit les uniforms a chaque
  // image, l'identite ne change pas, la mutation suffit — aucun setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 3, name: 'sonar : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture
        // (coin bas-gauche, y vers le haut).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'sonar : pont' },
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
    fragment: SONAR_FRAGMENT,
    colors,
    uniforms: { uPointer, uSpeed: speed, uSpacing: spacing, uFade: fade },
    name: 'sonar',
    // Des anneaux serres a densite de pixels reduite scintillent sur leur
    // front : en qualite basse, ils s'espacent.
    degrade: (quality) => ({
      uSpacing: quality === 'low' ? Math.min(spacing, 4) : spacing,
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
