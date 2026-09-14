/**
 * Reflet d'objectif : une source, sa strie et ses fantomes qui suivent le
 * pointeur.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : la source le rattrape en
 * douceur, et la chaine de fantomes se reordonne le long de l'axe qui joint
 * la source au centre du cadre. A la sortie du cadre, le hook ramene la
 * cible au centre — le reflet s'y recentre de lui-meme.
 *
 * ## Le pont pointeur -> shader
 *
 * Aucun rendu React par image : un tableau stable de deux flottants est mute
 * en place dans la boucle du moteur, en priorite d'entree, et la surface le
 * relit a chaque image.
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

import { LENS_FLARE_FRAGMENT } from './lens-flare.shader.js'

/** Ce que l'echappatoire recoit. */
export interface LensFlareControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface LensFlareOwnProps {
  /** Intensite globale du reflet. @defaultValue 1 */
  intensity?: number
  /** Nombre de fantomes le long de l'axe. @defaultValue 4 */
  ghosts?: number
  /** Longueur de la strie anamorphique, en hauteurs de cadre. @defaultValue 0.5 */
  streak?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<LensFlareControls>
}

/** Toutes les proprietes. */
export type LensFlareProps = Customisable<LensFlareOwnProps>

/** Tokens employes par defaut : le fond, la teinte chaude, la teinte froide. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-400',
  '--o-palette-sky-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-amber-100 dark:o-from-amber-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Reflet d'objectif.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <LensFlare className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function LensFlare({
  intensity = 1,
  ghosts = 4,
  streak = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LensFlareProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place : la surface relit les uniforms a chaque
  // image, l'identite ne change pas, la mutation suffit — aucun setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  // Un rattrapage plus lent que la torche : un reflet d'objectif est lourd,
  // il glisse derriere le curseur au lieu de le coller.
  const pointer = usePointerDamped({ host, speed: 2.5, name: 'reflet : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture
        // (coin bas-gauche, y vers le haut).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'reflet : pont' },
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
    fragment: LENS_FLARE_FRAGMENT,
    colors,
    uniforms: { uPointer, uIntensity: intensity, uGhosts: ghosts, uStreak: streak },
    name: 'lens-flare',
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
