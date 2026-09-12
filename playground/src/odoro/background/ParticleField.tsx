/**
 * Champ de particules : un semis qui derive lentement, allume au passage du
 * pointeur.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : les particules qu'il
 * couvre s'allument et prennent la teinte d'eclat, puis s'eteignent quand il
 * s'eloigne. A la sortie du cadre, le hook ramene la cible au centre. Le
 * champ, lui, derive en permanence, pointeur ou non.
 *
 * ## Le pont pointeur -> shader
 *
 * Aucun rendu React par image : un tableau stable de deux flottants est mute
 * en place dans la boucle du moteur, en priorite d'entree, et la surface le
 * relit a chaque image.
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

import { PARTICLE_FIELD_FRAGMENT } from './particle-field.shader.js'

/** Ce que l'echappatoire recoit. */
export interface ParticleFieldControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface ParticleFieldOwnProps {
  /** Vitesse de la derive. @defaultValue 0.4 */
  speed?: number
  /** Densite du semis. @defaultValue 10 */
  density?: number
  /** Rayon de l'eclat autour du pointeur, en hauteurs de cadre. @defaultValue 0.22 */
  radius?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<ParticleFieldControls>
}

/** Toutes les proprietes. */
export type ParticleFieldProps = Customisable<ParticleFieldOwnProps>

/** Tokens employes par defaut : le fond, les particules au repos, l'eclat. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-brand-500',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Couches hors qualite basse.
 *
 * Chaque couche parcourt neuf cellules par fragment : c'est le seul levier de
 * cout du shader, et la couche lointaine est celle qui se voit le moins.
 */
const LAYERS = 2

/** Couches en qualite basse. */
const LOW_LAYERS = 1

/**
 * Champ de particules.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <ParticleField className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function ParticleField({
  speed = 0.4,
  density = 10,
  radius = 0.22,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ParticleFieldProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place : la surface relit les uniforms a chaque
  // image, l'identite ne change pas, la mutation suffit — aucun setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 4, name: 'champ : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture
        // (coin bas-gauche, y vers le haut).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'champ : pont' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  const { ref, setHost: setShaderHost, ready, refused, colours } =
    useTokenShader<HTMLDivElement>({
      fragment: PARTICLE_FIELD_FRAGMENT,
      colors,
      uniforms: {
        uPointer,
        uSpeed: speed,
        uDensity: density,
        uRadius: radius,
        uLayers: LAYERS,
      },
      name: 'particle-field',
      degrade: (quality) => ({ uLayers: quality === 'low' ? LOW_LAYERS : LAYERS }),
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
