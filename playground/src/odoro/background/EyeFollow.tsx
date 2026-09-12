/**
 * Yeux qui suivent : une grille d'yeux dessines au trait, dont l'iris se
 * tourne vers le curseur et qui clignent chacun a son rythme.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : chaque oeil calcule la
 * direction de sa cellule vers le curseur et y pose son iris, d'autant plus
 * loin du centre que le curseur est loin, jusqu'a une amplitude bornee. A la
 * sortie du cadre, le hook ramene la cible au centre — tous les yeux
 * reviennent au milieu.
 *
 * ## Pourquoi ce fond peut servir de contenu
 *
 * C'est le seul du lot qui ne soit pas une texture : une page qui le pose
 * derriere un titre gagne un regard, pas une matiere. Il vaut donc mieux
 * peu d'yeux et gros que beaucoup et petits — le reglage par defaut se
 * range du premier cote.
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

import { EYE_FOLLOW_FRAGMENT } from './eye-follow.shader.js'

/** Ce que l'echappatoire recoit. */
export interface EyeFollowControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface EyeFollowOwnProps {
  /** Nombre d'yeux sur la hauteur. Borne a dix par le shader. @defaultValue 3 */
  eyes?: number
  /** Amplitude du regard, entre zero et un. @defaultValue 0.9 */
  gaze?: number
  /** Frequence des clignements. Zero les coupe. @defaultValue 1 */
  blink?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<EyeFollowControls>
}

/** Toutes les proprietes. */
export type EyeFollowProps = Customisable<EyeFollowOwnProps>

/** Tokens employes par defaut : le fond, le trait et la pupille, l'iris. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-fg',
  '--o-palette-brand-500',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Yeux qui suivent.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <EyeFollow className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function EyeFollow({
  eyes = 3,
  gaze = 0.9,
  blink = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: EyeFollowProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place : la surface relit les uniforms a chaque
  // image, l'identite ne change pas, la mutation suffit — aucun setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  // Vitesse 5 : un oeil rattrape vite, mais pas instantanement.
  const pointer = usePointerDamped({ host, speed: 5, name: 'eye-follow : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture
        // (coin bas-gauche, y vers le haut).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'eye-follow : pont' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  const { ref, setHost: setShaderHost, ready, refused, colours } =
    useTokenShader<HTMLDivElement>({
      fragment: EYE_FOLLOW_FRAGMENT,
      colors,
      uniforms: { uPointer, uEyes: eyes, uGaze: gaze, uBlink: blink },
      name: 'eye-follow',
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
