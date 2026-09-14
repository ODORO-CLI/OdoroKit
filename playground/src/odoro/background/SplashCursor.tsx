/**
 * Eclaboussures : le pointeur seme des taches de peinture qui s'ouvrent
 * puis se fanent.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur : la boucle du moteur echantillonne sa position
 * — une toutes les 90 ms environ, et seulement s'il s'est deplace d'un seuil
 * franc — dans un tampon circulaire de dix taches datees. Une tache s'ouvre
 * vite, se stabilise, puis s'eteint avec l'age.
 *
 * Ce qui distingue cette entree de `wake` : la trainee y est une suite de
 * halos gaussiens qui se fondent en un trait continu ; ici chaque depot est
 * une tache a contour bosselle, plus grande, plus espacee, et sa teinte est
 * tiree entre deux couleurs — le geste laisse des marques, pas un fil. Et de
 * `ink`, qui ne repond qu'au clic et recouvre le cadre entier.
 *
 * ## Le pont pointeur → shader
 *
 * Aucun rendu React par image : le tampon est un tableau stable de trente
 * flottants (dix fois x, y, date de depot), mute en place dans la
 * souscription d'horloge. La surface relit ses uniforms a chaque image — la
 * mutation suffit. Les depots sont dates avec le temps de l'horloge du
 * moteur, le meme que `uTime` du shader.
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

import { SPLASH_CURSOR_FRAGMENT } from './splash-cursor.shader.js'

/** Ce que l'echappatoire recoit. */
export interface SplashCursorControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface SplashCursorOwnProps {
  /** Duree de vie d'une tache, en secondes. @defaultValue 1.8 */
  life?: number
  /** Rayon d'une tache, en hauteurs de cadre. @defaultValue 0.16 */
  size?: number
  /** Irregularite du contour, entre zero et un. @defaultValue 0.6 */
  lobes?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<SplashCursorControls>
}

/** Toutes les proprietes. */
export type SplashCursorProps = Customisable<SplashCursorOwnProps>

/** Tokens employes par defaut : le fond, et les deux teintes de peinture. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-rose-500',
  '--o-palette-amber-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-rose-100 dark:o-to-rose-950'

/** Nombre de taches vivantes a la fois. Le shader en attend exactement autant. */
const SLOTS = 10

/** Intervalle minimal entre deux depots, en secondes. */
const DEPOSIT_EVERY = 0.09

/**
 * Deplacement minimal entre deux depots, en coordonnees de texture.
 *
 * Plus franc que celui d'une trainee continue : deux taches collees se
 * liraient comme une seule flaque.
 */
const DEPOSIT_THRESHOLD = 0.05

/**
 * Eclaboussures.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <SplashCursor className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function SplashCursor({
  life = 1.8,
  size = 0.16,
  lobes = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SplashCursorProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tampon stable, mute en place : dix fois (x, y, date de depot). Un depot
  // a -1000 donne un age enorme, donc une tache eteinte d'office.
  const uSplash = useRef<number[]>(Array.from({ length: SLOTS * 3 }, () => -1000)).current

  // Vitesse 8 : presque le pointeur brut. Une tache doit tomber ou le geste
  // passe, pas ou sa version lissee passera.
  const pointer = usePointerDamped({ host, speed: 8, name: 'splash-cursor : pointeur' })

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
          uSplash[i * 3] = uSplash[(i - 1) * 3] ?? -1000
          uSplash[i * 3 + 1] = uSplash[(i - 1) * 3 + 1] ?? -1000
          uSplash[i * 3 + 2] = uSplash[(i - 1) * 3 + 2] ?? -1000
        }
        uSplash[0] = x
        uSplash[1] = y
        uSplash[2] = time

        lastDeposit = time
        lastX = x
        lastY = y
      },
      { priority: CLOCK_PRIORITY.input, name: 'splash-cursor : depots' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uSplash])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: SPLASH_CURSOR_FRAGMENT,
    colors,
    uniforms: { uSplash, uLife: life, uSize: size, uLobes: lobes },
    name: 'splash-cursor',
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
