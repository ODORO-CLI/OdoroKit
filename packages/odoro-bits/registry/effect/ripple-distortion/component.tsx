/**
 * Distorsion d'ondes sous le pointeur, derriere un contenu.
 *
 * ## Ce que ce composant deforme, et ce qu'il ne deforme pas
 *
 * Il ne deforme **pas** le contenu qu'il enveloppe. Un shader ne sait pas lire
 * le document : tordre du texte ou une carte demanderait de les capturer en
 * image, ce qui echoue sur les polices distantes et les origines croisees — la
 * deformation par filtre existe pour ce cas-la, et c'est un autre composant.
 *
 * Ce qui est deforme ici est une surface peinte par le shader, posee **sous**
 * le contenu. Le texte reste net, selectionnable et lisible ; c'est le sol qui
 * ondule sous lui.
 *
 * ## Pourquoi le pointeur passe par un uniform mute en place
 *
 * La position change a chaque image. La porter dans l'etat React ferait
 * soixante rendus par seconde pour deplacer un centre d'ondes que le shader
 * relit seul. Le crochet de pointeur amorti ecrit donc sa valeur dans la
 * boucle, et un tableau stable — jamais reconstruit — la transmet a la surface,
 * qui relit ses uniforms a chaque image.
 *
 * L'amortissement n'est pas un ornement : sans lui, un deplacement rapide fait
 * sauter le centre d'un bout a l'autre de la zone, et les anneaux se cassent
 * au lieu de suivre.
 *
 * ## Le repli n'est pas une precaution
 *
 * Il est affiche pendant le chargement du backend, quand WebGL manque, quand
 * l'arbitre refuse la surface, et sous mouvement reduit. Il reprend les memes
 * tokens, en anneaux figes : ce qui disparait est l'ondulation, pas le decor.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  readTokenColour,
  useMotionState,
  useOnReady,
  useShaderSurface,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

import { RIPPLE_DISTORTION_FRAGMENT } from './ripple-distortion.shader.js'

/** Ce que l'echappatoire recoit. */
export interface RippleDistortionControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface RippleDistortionOwnProps {
  /** Contenu pose sur la surface. Il reste net. */
  children: ReactNode
  /** Vitesse de propagation des ondes. @defaultValue 1 */
  speed?: number
  /** Serrage des ondes et des bandes. @defaultValue 26 */
  scale?: number
  /** Amplitude du decalage de lecture. @defaultValue 0.5 */
  amount?: number
  /** Vitesse de rattrapage du pointeur. Plus haut, plus sec. @defaultValue 3 */
  damping?: number
  /** Tokens du creux des bandes, de leur crete, puis de l'eclat. */
  colors?: readonly [string, string, string]
  /** Classes du repli, a la place des anneaux figes derives des tokens. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<RippleDistortionControls>
}

/** Toutes les proprietes. */
export type RippleDistortionProps = Customisable<RippleDistortionOwnProps>

/** Tokens employes par defaut : creux, crete, puis eclat. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-surface',
  '--o-palette-brand-500',
] as const

/**
 * Repli par defaut : les memes anneaux, immobiles et sans source.
 *
 * Ce qui doit disparaitre est l'ondulation, pas le decor : un aplat effacerait
 * le motif pour tous ceux qui recoivent le repli, alors que seule sa mise en
 * mouvement est en cause.
 *
 * @param colors Tokens du creux, de la crete, puis de l'eclat.
 * @param scale Serrage des ondes, dont se deduit le pas des anneaux.
 */
function staticRings(
  colors: readonly [string, string, string],
  scale: number,
): CSSProperties {
  const pitch = Math.max(8, Math.round(700 / Math.max(scale, 1)))

  return {
    backgroundColor: `var(${colors[0]})`,
    backgroundImage:
      `repeating-radial-gradient(circle at 50% 50%,` +
      ` var(${colors[1]}) 0 ${String(pitch)}px,` +
      ` transparent ${String(pitch)}px ${String(pitch * 2)}px)`,
  }
}

/**
 * Serrage en qualite basse.
 *
 * Le cout ne tient pas au serrage — chaque fragment fait le meme travail — mais
 * des ondes trop fines scintillent des que la densite de pixels est plafonnee.
 */
const LOW_SCALE = 18

/**
 * Fait onduler une surface sous son contenu, autour du pointeur.
 *
 * @example
 * <RippleDistortion className="o-rounded-xl o-p-10">
 *   <h2>Passez la souris</h2>
 * </RippleDistortion>
 *
 * @example
 * // Des ondes larges et lentes, sans eclat de marque.
 * <RippleDistortion
 *   scale={12}
 *   speed={0.4}
 *   colors={['--o-theme-bg', '--o-theme-line', '--o-theme-muted']}
 * >
 *   <section className="o-p-8">…</section>
 * </RippleDistortion>
 */
export function RippleDistortion({
  children,
  speed = 1,
  scale = 26,
  amount = 0.5,
  damping = 3,
  colors = DEFAULT_TOKENS,
  fallback,
  onReady,
  ...rest
}: RippleDistortionProps): ReactElement {
  const { quality, reduced } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const [colours, setColours] = useState<readonly ShaderColour[]>([])

  const pointer = usePointerDamped({ host, speed: damping, name: 'ondes : pointeur' })

  // Tableau stable, mute en place : reconstruire l'uniform a chaque image
  // reconstruirait aussi la table d'uniforms de la surface.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Le crochet rend une position centree sur zero, l'axe vertical vers
        // le bas ; vUv a son origine en bas a gauche.
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      // Apres la lecture des entrees, avant le rendu de la meme image.
      { priority: CLOCK_PRIORITY.layout, name: 'ondes : centre' },
    )

    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  // Les tokens entrent par leur texte, jamais par l'identite du tableau : un
  // litteral passe en prop en construirait un neuf a chaque rendu, et l'effet
  // qui en dependrait ne s'arreterait jamais.
  const tokenList = colors.join(' ')

  useEffect(() => {
    if (host === null) return
    setColours(tokenList.split(' ').map((token) => readTokenColour(token, host)))
    // La politique de mouvement suit le theme : sa bascule relit les tokens.
  }, [host, tokenList, reduced, quality])

  const uniforms = useMemo(() => {
    const [a, b, c] = colours
    if (a === undefined || b === undefined || c === undefined) return undefined

    return {
      uColorA: a,
      uColorB: b,
      uColorC: c,
      uPointer,
      uSpeed: speed,
      uScale: quality === 'low' ? LOW_SCALE : scale,
      uAmount: amount,
    }
  }, [colours, uPointer, speed, scale, amount, quality])

  const { ref, ready, refused } = useShaderSurface<HTMLDivElement>({
    fragment: RIPPLE_DISTORTION_FRAGMENT,
    // Sans couleurs lues, le shader peindrait du noir : le repli couvre mieux
    // cet instant.
    uniforms: uniforms ?? {},
    name: 'ondes',
  })

  useOnReady(onReady, ready ? { colours, refused } : null, host)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const showFallback = !ready || refused !== undefined || uniforms === undefined

  return (
    <div {...rest} ref={setHost} className={className} style={style}>
      {/* La surface est posee sous le contenu, et n'intercepte rien. */}
      <div
        aria-hidden
        ref={ref}
        className="o-absolute o-inset-0 o-pointer-events-none"
        style={{ borderRadius: 'inherit', overflow: 'hidden' }}
      >
        {showFallback ? (
          <div
            className={`o-absolute o-inset-0 ${fallback ?? ''}`}
            style={fallback === undefined ? staticRings(colors, scale) : undefined}
          />
        ) : null}
      </div>

      <div className="o-relative">{children}</div>
    </div>
  )
}
