/**
 * Trainee de pixels : le curseur allume les pixels d'une trame grossiere,
 * qui s'eteignent par crans.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur : la boucle du moteur echantillonne sa position
 * — une toutes les 35 ms environ, et seulement s'il a bouge — dans un tampon
 * circulaire de quatorze depots dates. Le shader teste le centre de chaque
 * pixel contre ces depots, ce qui donne une trainee crenelee et non un halo.
 *
 * Ce qui distingue cette entree de `wake` : la trainee y est continue et
 * gaussienne, ici elle est faite de carres pleins qui descendent d'un cran a
 * la fois. Et de `led-wall` ou `mosaic`, qui quantifient une image sans rien
 * devoir au pointeur.
 *
 * ## Le pont pointeur → shader
 *
 * Aucun rendu React par image : le tampon est un tableau stable de
 * quarante-deux flottants (quatorze fois x, y, date de depot), mute en place
 * dans la souscription d'horloge. Les depots sont dates avec le temps de
 * l'horloge du moteur, le meme que `uTime` du shader.
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

import { PIXEL_TRAIL_FRAGMENT } from './pixel-trail.shader.js'

/** Ce que l'echappatoire recoit. */
export interface PixelTrailControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface PixelTrailOwnProps {
  /** Nombre de pixels sur la hauteur. Borne a quatre-vingt-dix par le shader. @defaultValue 26 */
  pixel?: number
  /** Duree de vie d'un pixel allume, en secondes. @defaultValue 1 */
  life?: number
  /** Nombre de paliers d'extinction. @defaultValue 4 */
  levels?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<PixelTrailControls>
}

/** Toutes les proprietes. */
export type PixelTrailProps = Customisable<PixelTrailOwnProps>

/** Tokens employes par defaut : le fond, les pixels froids, les pixels frais. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-indigo-400',
  '--o-palette-pink-300',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-indigo-100 dark:o-to-indigo-950'

/** Nombre de depots vivants a la fois. Le shader en attend exactement autant. */
const SLOTS = 14

/** Intervalle minimal entre deux depots, en secondes. */
const DEPOSIT_EVERY = 0.035

/** Deplacement minimal entre deux depots, en coordonnees de texture. */
const DEPOSIT_THRESHOLD = 0.006

/**
 * Trainee de pixels.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <PixelTrail className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function PixelTrail({
  pixel = 26,
  life = 1,
  levels = 4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PixelTrailProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tampon stable, mute en place : quatorze fois (x, y, date de depot). Un
  // depot a -1000 donne un age enorme, donc un pixel eteint d'office.
  const uTrail = useRef<number[]>(Array.from({ length: SLOTS * 3 }, () => -1000)).current

  // Vitesse 10 : presque le pointeur brut. La trame est deja un filtre ;
  // amortir en plus ferait trainer la trainee derriere elle-meme.
  const pointer = usePointerDamped({ host, speed: 10, name: 'pixel-trail : pointeur' })

  useEffect(() => {
    let lastDeposit = -1000
    let lastX = 0.5
    let lastY = 0.5

    const subscription = clock.subscribe(
      ({ time }) => {
        const x = (pointer.current.x + 1) / 2
        const y = 1 - (pointer.current.y + 1) / 2

        if (time - lastDeposit < DEPOSIT_EVERY) return
        const moved = Math.hypot(x - lastX, y - lastY)
        if (moved < DEPOSIT_THRESHOLD) return

        for (let i = SLOTS - 1; i > 0; i -= 1) {
          uTrail[i * 3] = uTrail[(i - 1) * 3] ?? -1000
          uTrail[i * 3 + 1] = uTrail[(i - 1) * 3 + 1] ?? -1000
          uTrail[i * 3 + 2] = uTrail[(i - 1) * 3 + 2] ?? -1000
        }
        uTrail[0] = x
        uTrail[1] = y
        uTrail[2] = time

        lastDeposit = time
        lastX = x
        lastY = y
      },
      { priority: CLOCK_PRIORITY.input, name: 'pixel-trail : depots' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uTrail])

  const { ref, setHost: setShaderHost, ready, refused, colours } =
    useTokenShader<HTMLDivElement>({
      fragment: PIXEL_TRAIL_FRAGMENT,
      colors,
      uniforms: { uTrail, uPixel: pixel, uLife: life, uLevels: levels },
      name: 'pixel-trail',
      // Une trame fine coute autant qu'une grossiere, mais son filet de
      // separation disparait a densite de pixels reduite.
      degrade: (quality) => ({
        uPixel: quality === 'low' ? Math.min(pixel, 18) : pixel,
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
