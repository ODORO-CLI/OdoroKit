/**
 * Feux d'artifice : un bouquet eclate a chaque clic et retombe sous la
 * gravite.
 *
 * ## A quoi ce fond reagit
 *
 * Au clic — ou au toucher — sur le cadre : chaque appui date un bouquet dans
 * un tampon circulaire de six emplacements, et les etincelles partent du
 * point exact de l'appui. Le deplacement du pointeur ne change rien.
 *
 * Un bouquet automatique part aussi tout seul, a intervalle regle : un ciel
 * qui n'existe qu'au clic resterait vide dans la plupart des pages. Zero le
 * coupe.
 *
 * ## Le pont clic -> shader
 *
 * Aucun rendu React par image : le tampon est un tableau stable de dix-huit
 * flottants (six fois x, y, temps de depart), mute en place a chaque clic.
 * La surface relit ses uniforms a chaque image, l'identite du tableau ne
 * change pas — la mutation suffit.
 *
 * Le temps ecrit dans le tampon est celui de l'horloge du moteur, memorise par
 * une souscription en priorite d'entree : c'est le meme temps que `uTime` du
 * shader, sans quoi l'age des bouquets serait faux.
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

import { FIREWORKS_FRAGMENT } from './fireworks.shader.js'

/** Ce que l'echappatoire recoit. */
export interface FireworksControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface FireworksOwnProps {
  /** Etincelles par bouquet. @defaultValue 32 */
  sparks?: number
  /** Force de la retombee. @defaultValue 0.25 */
  gravity?: number
  /** Vitesse d'extinction des etincelles. @defaultValue 1.1 */
  decay?: number
  /** Periode des bouquets automatiques, en secondes. Zero les coupe. @defaultValue 2.6 */
  auto?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<FireworksControls>
}

/** Toutes les proprietes. */
export type FireworksProps = Customisable<FireworksOwnProps>

/** Tokens employes par defaut : le ciel, les deux teintes d'etincelles. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-amber-200',
] as const

/** Repli par defaut : un ciel fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-zinc-50 dark:o-from-zinc-950 o-to-brand-200 dark:o-to-brand-950'

/** Nombre de bouquets vivants a la fois. */
const SLOTS = 6

/**
 * Etincelles par bouquet en qualite basse.
 *
 * Chaque etincelle est une exponentielle et un sinus par fragment, pour
 * chacun des sept bouquets possibles : c'est le seul levier de cout, et il
 * n'a pas besoin d'etre une prop pour etre retrograde.
 */
const LOW_SPARKS = 14

/**
 * Feux d'artifice.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Fireworks className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Fireworks({
  sparks = 32,
  gravity = 0.25,
  decay = 1.1,
  auto = 2.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: FireworksProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tampon stable, mute en place : six fois (x, y, temps de depart). Un
  // depart a -1000 donne un age enorme, donc un bouquet inerte d'office.
  const uClicks = useRef<number[]>(Array.from({ length: SLOTS * 3 }, () => -1000)).current

  // Le temps de l'horloge du moteur — le meme que uTime du shader. C'est lui
  // qui date les bouquets ; performance.now() donnerait une autre origine.
  const lastTime = useRef(0)

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ time }) => {
        lastTime.current = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'fireworks : horloge' },
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

      // Tampon circulaire : tout se decale d'un cran, le nouveau bouquet en tete.
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

  const { ref, setHost: setShaderHost, ready, refused, colours } =
    useTokenShader<HTMLDivElement>({
      fragment: FIREWORKS_FRAGMENT,
      colors,
      uniforms: {
        uClicks,
        uSparks: sparks,
        uGravity: gravity,
        uDecay: decay,
        uAuto: auto,
      },
      name: 'fireworks',
      degrade: (quality) => ({
        uSparks: quality === 'low' ? Math.min(sparks, LOW_SPARKS) : sparks,
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
