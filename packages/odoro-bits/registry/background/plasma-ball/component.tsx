/**
 * Boule plasma : des filaments qui serpentent de l'electrode au verre, et
 * qu'un doigt sur le globe attire.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : quand il approche du
 * globe, le filament principal se tend vers lui comme vers un doigt pose sur
 * le verre, et les autres palissent. A la sortie du cadre, le hook ramene la
 * cible au centre — le centre est l'electrode, ou toucher ne se voit pas — et
 * les filaments reprennent leur derive.
 *
 * Ce qui distingue cette entree de `plasma` : celle-ci est une nappe de
 * sinus qui couvre tout le cadre ; ici il y a un objet, un globe avec son
 * verre, son electrode et ses filaments.
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

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

import { PLASMA_BALL_FRAGMENT } from './plasma-ball.shader.js'

/** Ce que l'echappatoire recoit. */
export interface PlasmaBallControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface PlasmaBallOwnProps {
  /** Nombre de filaments. Borne a dix par le shader. @defaultValue 7 */
  filaments?: number
  /** Rayon du globe, en hauteurs de cadre. @defaultValue 0.38 */
  radius?: number
  /** Vitesse de derive et d'ondulation. @defaultValue 1 */
  speed?: number
  /** Force avec laquelle le pointeur attire le filament principal. @defaultValue 0.8 */
  pull?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<PlasmaBallControls>
}

/** Toutes les proprietes. */
export type PlasmaBallProps = Customisable<PlasmaBallOwnProps>

/** Tokens employes par defaut : le fond, la lueur, le coeur. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-purple-500',
  '--o-palette-pink-300',
] as const

/** Repli par defaut : un halo fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-zinc-50 dark:o-from-zinc-950 o-via-purple-200 dark:o-via-purple-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Boule plasma.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <PlasmaBall className="o-absolute o-inset-0" filaments={9} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function PlasmaBall({
  filaments = 7,
  radius = 0.38,
  speed = 1,
  pull = 0.8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PlasmaBallProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place dans la boucle : aucun setState par image.
  const uPointer = useRef<number[]>([0, 0]).current

  const pointer = usePointerDamped({ host, speed: 5, name: 'plasma-ball : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Le shader recoit le repere du hook tel quel : centre, y vers le bas.
        uPointer[0] = pointer.current.x
        uPointer[1] = pointer.current.y
      },
      { priority: CLOCK_PRIORITY.input, name: 'plasma-ball : pont' },
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
    fragment: PLASMA_BALL_FRAGMENT,
    colors,
    uniforms: {
      uPointer,
      uFilaments: filaments,
      uRadius: radius,
      uSpeed: speed,
      uPull: pull,
    },
    name: 'plasma-ball',
    // Chaque filament coute deux lectures de bruit et trois exponentielles
    // par pixel : en qualite basse, ils sont moins nombreux.
    degrade: (quality) => ({
      uFilaments: quality === 'low' ? Math.min(filaments, 4) : filaments,
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
