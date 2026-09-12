/**
 * Ether liquide : un fluide vaporeux que le pointeur pousse.
 *
 * ## Pourquoi un champ analytique, et pas un ping-pong de textures
 *
 * Un vrai fluide s'ecrit avec deux cibles de rendu qu'on echange a chaque
 * image : la vitesse de l'image precedente est relue pour advecter celle de
 * la suivante. La surface arbitree du moteur ne prete qu'un programme et un
 * quadrilatere, sans cible de rendu ni retour d'image — c'est ce qui la rend
 * legere, et ce que tous les fonds de cette famille partagent.
 *
 * Plutot que de contourner le moteur avec un programme brut et deux cibles a
 * gerer, le fond garde une memoire courte a sa place : douze depots dates,
 * chacun une position et une vitesse, sommes a chaque fragment en un champ
 * de deplacement qui advecte le bruit. Rien ne se conserve d'une image a
 * l'autre, mais un geste de la main dure moins que douze depots, et l'oeil
 * ne voit que la vapeur qui suit.
 *
 * ## Le pont pointeur → shader
 *
 * Aucun rendu React par image : deux tableaux stables — quarante-huit
 * flottants pour les depots, douze pour leurs dates — sont mutes en place a
 * chaque deplacement, et la surface relit ses uniforms a chaque image.
 *
 * La vitesse est celle du geste, mesuree entre deux echantillons dans le
 * temps de l'horloge du moteur — le meme que `uTime` du shader, sans quoi
 * l'age des depots serait faux. Un deplacement trop court n'est pas depose :
 * il ne ferait qu'user le tampon.
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

import { LIQUID_ETHER_FRAGMENT } from './liquid-ether.shader.js'

/** Ce que l'echappatoire recoit. */
export interface LiquidEtherControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface LiquidEtherOwnProps {
  /** Vitesse de la derive sans pointeur. @defaultValue 0.1 */
  speed?: number
  /** Rayon d'un depot, en hauteurs de cadre. @defaultValue 0.22 */
  radius?: number
  /** Force de la poussee sur le bruit. @defaultValue 0.8 */
  strength?: number
  /** Duree de vie d'un depot, en secondes. @defaultValue 2.5 */
  life?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<LiquidEtherControls>
}

/** Toutes les proprietes. */
export type LiquidEtherProps = Customisable<LiquidEtherOwnProps>

/** Tokens employes par defaut : le fond, la vapeur, la trace. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-cyan-300',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-tr o-from-zinc-50 dark:o-from-zinc-950 o-via-violet-300 dark:o-via-violet-900 o-to-zinc-50 dark:o-to-zinc-950'

/** Nombre de depots vivants a la fois. */
const SLOTS = 12

/** Deplacement minimal, en fraction du cadre, pour deposer. */
const MIN_STEP = 0.012

/** Vitesse maximale retenue, en cadres par seconde : un geste sec sature. */
const MAX_VELOCITY = 3

/**
 * Detail du bruit hors qualite basse.
 *
 * Deux sommes d'octaves par fragment, apres les douze depots : les octaves
 * sont le seul levier de cout qui reste, et il n'a pas besoin d'etre une
 * prop pour etre retrograde.
 */
const OCTAVES = 4

/** Detail du bruit en qualite basse. */
const LOW_OCTAVES = 2

/**
 * Ether liquide.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <LiquidEther className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function LiquidEther({
  speed = 0.1,
  radius = 0.22,
  strength = 0.8,
  life = 2.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: LiquidEtherProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tampons stables, mutes en place : douze fois (x, y, vx, vy), et douze
  // dates. Une date a -1000 donne un age enorme, donc un depot inerte.
  const uTrail = useRef<number[]>(Array.from({ length: SLOTS * 4 }, () => 0)).current
  const uStamps = useRef<number[]>(Array.from({ length: SLOTS }, () => -1000)).current

  // Le temps de l'horloge du moteur — le meme que uTime du shader.
  const lastTime = useRef(0)
  // Le dernier echantillon, pour mesurer la vitesse du geste.
  const last = useRef<{ x: number; y: number; time: number } | null>(null)

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ time }) => {
        lastTime.current = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'liquid-ether : horloge' },
    )
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (host === null) return

    const onMove = (event: PointerEvent): void => {
      const bounds = host.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1)
      // vUv a son origine en bas : l'axe vertical de l'ecran est inverse.
      const y = 1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1)
      const time = lastTime.current

      const previous = last.current
      // Premier echantillon, ou reprise apres une pause : rien a deposer, la
      // vitesse n'aurait pas de sens.
      if (previous === null || time - previous.time > 0.5) {
        last.current = { x, y, time }
        return
      }

      const dx = x - previous.x
      const dy = y - previous.y
      if (Math.hypot(dx, dy) < MIN_STEP) return

      const dt = Math.max(time - previous.time, 1 / 120)
      let vx = dx / dt
      let vy = dy / dt
      const magnitude = Math.hypot(vx, vy)
      if (magnitude > MAX_VELOCITY) {
        vx = (vx / magnitude) * MAX_VELOCITY
        vy = (vy / magnitude) * MAX_VELOCITY
      }

      // Tampon circulaire : tout se decale d'un cran, le nouveau depot en tete.
      for (let i = SLOTS - 1; i > 0; i -= 1) {
        uTrail[i * 4] = uTrail[(i - 1) * 4] ?? 0
        uTrail[i * 4 + 1] = uTrail[(i - 1) * 4 + 1] ?? 0
        uTrail[i * 4 + 2] = uTrail[(i - 1) * 4 + 2] ?? 0
        uTrail[i * 4 + 3] = uTrail[(i - 1) * 4 + 3] ?? 0
        uStamps[i] = uStamps[i - 1] ?? -1000
      }
      uTrail[0] = x
      uTrail[1] = y
      uTrail[2] = vx
      uTrail[3] = vy
      uStamps[0] = time

      last.current = { x, y, time }
    }

    const onLeave = (): void => {
      last.current = null
    }

    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [host, uTrail, uStamps])

  const { ref, setHost: setShaderHost, ready, refused, colours } =
    useTokenShader<HTMLDivElement>({
      fragment: LIQUID_ETHER_FRAGMENT,
      colors,
      uniforms: {
        uTrail,
        uStamps,
        uSpeed: speed,
        uRadius: radius,
        uStrength: strength,
        uLife: life,
        uOctaves: OCTAVES,
      },
      name: 'liquid-ether',
      degrade: (quality) => ({
        uOctaves: quality === 'low' ? LOW_OCTAVES : OCTAVES,
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
