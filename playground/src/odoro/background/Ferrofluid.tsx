/**
 * Ferrofluide : une flaque magnetique dont les pics se dressent sous le
 * pointeur.
 *
 * ## Le principe
 *
 * Un reseau hexagonal de cones, tire de trois cosinus a cent vingt degres,
 * dont l'exposant croit avec la proximite de l'aimant : bosses molles au
 * loin, aiguilles dessous. Le relief est evalue trois fois et son gradient
 * sert de normale — un fluide noir ne se voit que par ses reflets.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : l'aimant le suit, la
 * flaque s'y deplace et les pics s'y dressent. A la sortie du cadre, le hook
 * ramene la cible au centre — le fluide y revient d'elle-meme.
 *
 * ## Le pont pointeur → shader
 *
 * Aucun rendu React par image : le composant mute en place un tableau stable
 * passe en uniform, et la surface relit ses uniforms a chaque image. La
 * recopie se fait dans la boucle du moteur, en priorite d'entree.
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

import { FERROFLUID_FRAGMENT } from './ferrofluid.shader.js'

/** Ce que l'echappatoire recoit. */
export interface FerrofluidControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface FerrofluidOwnProps {
  /** Nombre de pics par hauteur de cadre. @defaultValue 14 */
  spikes?: number
  /** Portee de l'aimant, en hauteurs de cadre. @defaultValue 0.35 */
  reach?: number
  /** Hauteur des pics sous l'aimant. @defaultValue 0.8 */
  height?: number
  /** Force du reflet. @defaultValue 0.7 */
  gloss?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<FerrofluidControls>
}

/** Toutes les proprietes. */
export type FerrofluidProps = Customisable<FerrofluidOwnProps>

/**
 * Tokens employes par defaut : le plateau, le fluide, le reflet.
 *
 * Le fluide prend l'encre du theme : sombre sur fond clair, clair sur fond
 * sombre. C'est le contraste qui compte, pas le noir.
 */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const

/** Repli par defaut : une flaque figee au centre, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-zinc-800 dark:o-via-zinc-200 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Bruit du bord de la flaque, retire en qualite basse.
 *
 * Le bord est le seul bruit du shader, et il est lu trois fois — une par
 * evaluation du relief. Le retirer rend le bord circulaire, ce qui se voit
 * peu ; le garder coute trois bruits par fragment.
 */
const DETAIL = 1

/** Bruit du bord en qualite basse. */
const LOW_DETAIL = 0

/**
 * Ferrofluide.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Ferrofluid className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Ferrofluid({
  spikes = 14,
  reach = 0.35,
  height = 0.8,
  gloss = 0.7,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FerrofluidProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place : la surface relit les uniforms a chaque
  // image, l'identite ne change pas, la mutation suffit — aucun setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  // Un rattrapage lent : le fluide a de l'inertie, il ne saute pas.
  const pointer = usePointerDamped({ host, speed: 2.5, name: 'ferrofluid : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture
        // (coin bas-gauche, y vers le haut).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'ferrofluid : pont' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  const { ref, setHost: setShaderHost, ready, refused, colours } =
    useTokenShader<HTMLDivElement>({
      fragment: FERROFLUID_FRAGMENT,
      colors,
      uniforms: {
        uPointer,
        uSpikes: spikes,
        uReach: reach,
        uHeight: height,
        uGloss: gloss,
        uDetail: DETAIL,
      },
      name: 'ferrofluid',
      degrade: (quality) => ({
        uDetail: quality === 'low' ? LOW_DETAIL : DETAIL,
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
