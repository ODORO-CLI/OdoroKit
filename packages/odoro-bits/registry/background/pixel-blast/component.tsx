/**
 * Explosion de pixels : chaque clic projette une gerbe de pixels carres qui
 * retombent.
 *
 * ## A quoi ce fond reagit
 *
 * Au clic — ou au toucher — sur le cadre : chaque appui date une gerbe dans
 * un tampon circulaire de cinq emplacements, et les pixels partent de la
 * case de trame de l'appui. Le deplacement du pointeur ne change rien.
 *
 * Une gerbe automatique part aussi toute seule, a intervalle regle : un
 * fond qui n'existe qu'au clic resterait vide dans la plupart des pages.
 * Zero la coupe.
 *
 * ## Ce qui le distingue des feux d'artifice
 *
 * Tout est aligne sur une trame : les pixels sont des carres qui sautent de
 * case en case, sans halo ni trainee, et l'explosion est un carre qui
 * s'elargit. Les feux d'artifice dessinent des etincelles rondes et floues
 * dans un espace continu.
 *
 * ## Le pont clic -> shader
 *
 * Aucun rendu React par image : le tampon est un tableau stable de quinze
 * flottants (cinq fois x, y, temps de depart), mute en place a chaque clic.
 * La surface relit ses uniforms a chaque image, l'identite du tableau ne
 * change pas — la mutation suffit.
 *
 * Le temps ecrit dans le tampon est celui de l'horloge du moteur, memorise
 * par une souscription en priorite d'entree : c'est le meme temps que
 * `uTime` du shader, sans quoi l'age des gerbes serait faux.
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

import { PIXEL_BLAST_FRAGMENT } from './pixel-blast.shader.js'

/** Ce que l'echappatoire recoit. */
export interface PixelBlastControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface PixelBlastOwnProps {
  /** Pixels de la trame sur la hauteur du cadre. @defaultValue 40 */
  pixels?: number
  /** Pixels projetes par gerbe. @defaultValue 24 */
  count?: number
  /** Force de la retombee. @defaultValue 0.5 */
  gravity?: number
  /** Periode des gerbes automatiques, en secondes. Zero les coupe. @defaultValue 2.2 */
  auto?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<PixelBlastControls>
}

/** Toutes les proprietes. */
export type PixelBlastProps = Customisable<PixelBlastOwnProps>

/** Tokens employes par defaut : le fond, les deux teintes de pixels. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-yellow-300',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/** Nombre de gerbes vivantes a la fois. */
const SLOTS = 5

/**
 * Pixels par gerbe en qualite basse.
 *
 * Chaque pixel est une position et une comparaison de case par fragment,
 * pour chacune des six gerbes possibles : c'est le seul levier de cout.
 */
const LOW_COUNT = 12

/**
 * Explosion de pixels.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <PixelBlast className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function PixelBlast({
  pixels = 40,
  count = 24,
  gravity = 0.5,
  auto = 2.2,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: PixelBlastProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tampon stable, mute en place : cinq fois (x, y, temps de depart). Un
  // depart a -1000 donne un age enorme, donc une gerbe inerte d'office.
  const uClicks = useRef<number[]>(Array.from({ length: SLOTS * 3 }, () => -1000)).current

  // Le temps de l'horloge du moteur — le meme que uTime du shader. C'est lui
  // qui date les gerbes ; performance.now() donnerait une autre origine.
  const lastTime = useRef(0)

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ time }) => {
        lastTime.current = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'pixel-blast : horloge' },
    )
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (host === null) return

    const onDown = (event: PointerEvent): void => {
      const bounds = host.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1)
      // vUv a son origine en bas : l'axe vertical de l'ecran est inverse.
      const y = 1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1)

      // Tampon circulaire : tout se decale d'un cran, la nouvelle gerbe en tete.
      for (let i = SLOTS - 1; i > 0; i -= 1) {
        uClicks[i * 3] = uClicks[(i - 1) * 3] ?? -1000
        uClicks[i * 3 + 1] = uClicks[(i - 1) * 3 + 1] ?? -1000
        uClicks[i * 3 + 2] = uClicks[(i - 1) * 3 + 2] ?? -1000
      }
      uClicks[0] = x
      uClicks[1] = y
      uClicks[2] = lastTime.current
    }

    host.addEventListener('pointerdown', onDown)
    return () => host.removeEventListener('pointerdown', onDown)
  }, [host, uClicks])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: PIXEL_BLAST_FRAGMENT,
    colors,
    uniforms: {
      uClicks,
      uPixels: pixels,
      uCount: count,
      uGravity: gravity,
      uAuto: auto,
    },
    name: 'pixel-blast',
    degrade: (quality) => ({
      uCount: quality === 'low' ? Math.min(count, LOW_COUNT) : count,
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
