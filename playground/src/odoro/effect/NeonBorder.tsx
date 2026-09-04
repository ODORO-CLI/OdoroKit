/**
 * Liseré de néon : un arc lumineux qui fait le tour d'un cadre.
 *
 * ## Pourquoi un dégradé conique ne suffit pas
 *
 * C'est la difficulté du composant, et elle n'est pas évidente. Faire tourner
 * un `conic-gradient` autour d'un rectangle donne un arc dont la **vitesse
 * apparente** n'est pas constante : l'angle avance régulièrement, mais un degré
 * parcourt beaucoup plus de bord près des coins d'un rectangle allongé qu'au
 * milieu d'un grand côté. Le résultat file sur les petits côtés et traîne sur
 * les longs.
 *
 * L'arc est donc construit à l'envers. On avance à pas constant **le long du
 * périmètre**, on convertit chaque échantillon en angle vu du centre, et on en
 * fait les arrêts du dégradé. La correction est faite là où la déformation
 * naît, et l'arc garde la même longueur de bord partout.
 *
 * ## Deux mouvements, et un seul chemin
 *
 * `continuous` fait glisser l'arc sans arrêt. `step` le fait sauter d'un coin
 * au suivant, avec une courbe qui le lance et le rattrape. Ce sont deux façons
 * de calculer une position sur le périmètre, pas deux composants : tout le
 * reste — la construction de l'arc, les couches de halo — est commun.
 *
 * ## Le halo est en trois couches
 *
 * Une seule, floue, donne une tache. Trois — courte et dense, moyenne, longue
 * et diffuse — donnent la lumière qui déborde du tube. C'est le même principe
 * qu'une enseigne : le verre, la lueur proche, et le mur derrière.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

/** Façon dont l'arc parcourt le cadre. */
export type NeonMovement = 'continuous' | 'step'

/** Proprietes propres au composant. */
export interface NeonBorderOwnProps {
  /** Rayon des coins, en pixels. @defaultValue 24 */
  radius?: number
  /** Epaisseur du trait, en pixels. @defaultValue 2 */
  thickness?: number
  /** Longueur de l'arc, en pour cent du demi-perimetre. @defaultValue 50 */
  length?: number
  /** Intensite du halo, de 0 a 100. @defaultValue 100 */
  glow?: number
  /** Mouvement de l'arc. @defaultValue 'continuous' */
  movement?: NeonMovement
  /** Duree d'un tour, en millisecondes. @defaultValue 4000 */
  duration?: number
  /** Token de la couleur du neon. */
  color?: string
}

/** Toutes les proprietes. */
export type NeonBorderProps = Customisable<NeonBorderOwnProps>

/** Token employe par defaut. */
const DEFAULT_TOKEN = '--o-palette-amber-400'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-neon-border'

/** Nombre d'echantillons de l'arc. Au-dela, la courbe ne gagne rien de visible. */
const SAMPLES = 24

/** Les trois couches du halo : flou, opacite, portee. */
const LAYERS = [
  { blur: 8, alpha: 0.5 },
  { blur: 15, alpha: 0.3 },
  { blur: 57, alpha: 0.18 },
] as const

/** Pose les regles du lisere, une fois par document. */
function ensureNeonRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-neon]{position:absolute;inset:0;pointer-events:none;',
    'border-radius:var(--o-neon-radius);padding:var(--o-neon-thickness);',
    // Le masque ne garde que la couronne : le dégradé remplit tout le cadre,
    // et c'est ce masque qui en fait un trait plutôt qu'un aplat.
    '-webkit-mask:linear-gradient(black,black) content-box exclude,linear-gradient(black,black);',
    'mask:linear-gradient(black,black) content-box exclude,linear-gradient(black,black);',
    '-webkit-mask-composite:xor;mask-composite:exclude}',

    '[data-o-neon-layer]{position:absolute;inset:0;border-radius:inherit;',
    'background-image:var(--o-neon-arc);',
    'filter:blur(var(--o-neon-blur));opacity:var(--o-neon-alpha)}',
    '[data-o-neon-layer="core"]{filter:none;opacity:1}',
  ].join('')
  document.head.append(style)
}

/**
 * Un point du perimetre d'un rectangle, parcouru a pas constant.
 *
 * @param u Position sur le tour, de 0 a 1.
 */
function perimeterPoint(u: number, w: number, h: number): readonly [number, number] {
  const d = (((u % 1) + 1) % 1) * 2 * (w + h)
  if (d < w) return [d, 0]
  if (d < w + h) return [w, d - w]
  if (d < w * 2 + h) return [w - (d - w - h), h]
  return [0, h - (d - w * 2 - h)]
}

/** L'angle sous lequel ce point est vu du centre, en degres. */
function perimeterAngle(u: number, w: number, h: number): number {
  const [x, y] = perimeterPoint(u, w, h)
  return (Math.atan2(x - w / 2, h / 2 - y) * 180) / Math.PI
}

/** Le tour auquel se trouve le coin numero `k`. */
function cornerLap(k: number, w: number, h: number): number {
  const p = 2 * (w + h)
  const at = [0, w / p, (w + h) / p, (w * 2 + h) / p]
  return Math.floor(k / 4) + (at[((k % 4) + 4) % 4] ?? 0)
}

/**
 * Le degrade conique de l'arc, a une position donnee du perimetre.
 *
 * Les arrets sont echantillonnes **le long du bord** et convertis en angles :
 * c'est ce qui donne a l'arc la meme longueur de bord partout, au lieu de le
 * voir filer sur les petits cotes.
 *
 * L'accumulation des ecarts, plutot que les angles bruts, evite la coupure a
 * plus ou moins cent quatre-vingts degres, qui produirait un arc retourne une
 * fois par tour.
 */
function buildArc(
  lap: number,
  length: number,
  w: number,
  h: number,
  token: string,
): string {
  const width = w > 0 ? w : 100
  const height = h > 0 ? h : 100
  const span = Math.max(0.015, (Math.max(0, Math.min(100, length)) / 100) * 0.5)
  const solid = length / 100

  const stops: string[] = []
  let base = 0
  let previous = 0
  let total = 0

  for (let index = 0; index <= SAMPLES; index += 1) {
    const f = index / SAMPLES
    const angle = perimeterAngle(lap + (f - 0.5) * span, width, height)

    if (index === 0) base = angle
    else {
      let step = angle - previous
      while (step > 180) step -= 360
      while (step < -180) step += 360
      total += step
    }
    previous = angle

    // La tete est pleine, la queue s'eteint : sans quoi l'arc est un segment
    // qui apparait et disparait, au lieu d'une lumiere qui passe.
    const t = Math.abs(f - 0.5) * 2
    const k = solid >= 1 ? 1 : t <= solid ? 1 : 1 - (t - solid) / (1 - solid)
    const eased = k * k * (3 - 2 * k)
    stops.push(
      `color-mix(in oklch, var(${token}) ${(eased * 100).toFixed(1)}%, transparent)` +
        ` ${total.toFixed(2)}deg`,
    )
  }

  stops.push(`transparent ${total.toFixed(2)}deg`)
  stops.push('transparent 360deg')

  return `conic-gradient(from ${base.toFixed(2)}deg at 50% 50%, ${stops.join(', ')})`
}

/**
 * Une courbe de Bezier a un parametre, resolue par Newton.
 *
 * Employee pour le mouvement par pas : l'arc doit partir vite et se poser
 * doucement sur le coin suivant, ce qu'une interpolation lineaire ne fait pas.
 */
function ease(t: number): number {
  const x = Math.max(0, Math.min(1, t))
  const bez = (a: number, b: number, u: number): number => {
    const v = 1 - u
    return 3 * v * v * u * a + 3 * v * u * u * b + u * u * u
  }

  let s = x
  for (let index = 0; index < 8; index += 1) {
    const cx = bez(0.72, 0.18, s) - x
    const v = 1 - s
    const dx = 3 * v * v * 0.72 + 6 * v * s * (0.18 - 0.72) + 3 * s * s * (1 - 0.18)
    if (Math.abs(dx) < 1e-6) break
    s = Math.max(0, Math.min(1, s - cx / dx))
  }
  return bez(0.16, 1.05, s)
}

/**
 * Lisere de neon autour d'un cadre.
 *
 * Il se pose dans un parent positionne, qu'il remplit.
 *
 * @example
 * <div className="o-relative o-rounded-2xl o-p-8">
 *   <NeonBorder radius={16} />
 *   <p>Le contenu, par-dessus.</p>
 * </div>
 *
 * @example
 * // Par pas : l'arc saute d'un coin au suivant.
 * <NeonBorder movement="step" duration={2400} color="--o-palette-sky-400" />
 */
export function NeonBorder({
  radius = 24,
  thickness = 2,
  length = 50,
  glow = 100,
  movement = 'continuous',
  duration = 4000,
  color = DEFAULT_TOKEN,
  ...rest
}: NeonBorderProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  ensureNeonRules()

  // La couleur n'est jamais lue : le token entre tel quel dans le degrade, et
  // suit donc le theme sans qu'aucun effet n'ait a le relire.
  useEffect(() => {
    if (host === null) return

    let width = host.clientWidth
    let height = host.clientHeight

    const paint = (lap: number): void => {
      host.style.setProperty('--o-neon-arc', buildArc(lap, length, width, height, color))
    }

    // Mesure d'abord : l'arc depend des proportions du cadre, et un cadre qui
    // change de forme sans nouvelle mesure verrait sa correction devenir fausse.
    const measure = (): void => {
      width = host.clientWidth
      height = host.clientHeight
    }
    measure()

    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure)
    observer?.observe(host)

    // Sous mouvement reduit, l'arc est pose une fois et ne bouge plus : le
    // cadre garde son lisere, il ne tourne pas.
    if (reduced) {
      paint(0)
      return () => observer?.disconnect()
    }

    const seconds = Math.max(0.2, duration / 1000)
    const subscription = clock.subscribe(
      ({ time }) => {
        const turns = time / seconds
        if (movement === 'continuous') {
          paint(turns)
          return
        }
        // Par pas : la partie entiere designe le coin atteint, la fraction le
        // trajet vers le suivant, lisse par la courbe.
        const index = Math.floor(turns * 4)
        const from = cornerLap(index, width, height)
        const to = cornerLap(index + 1, width, height)
        paint(from + (to - from) * ease((turns * 4) % 1))
      },
      { name: 'neon', priority: CLOCK_PRIORITY.render },
    )

    return () => {
      subscription.unsubscribe()
      observer?.disconnect()
    }
  }, [host, color, length, movement, duration, reduced])

  const { className, style } = mergePresentation({ className: '' }, rest)

  const intensity = Math.max(0, Math.min(100, glow)) / 100

  return (
    <div
      {...rest}
      ref={setHost}
      data-o-neon
      aria-hidden
      className={className}
      style={
        {
          '--o-neon-radius': `${String(radius)}px`,
          '--o-neon-thickness': `${String(thickness)}px`,
          ...style,
        } as CSSProperties
      }
    >
      {LAYERS.map((layer) => (
        <span
          key={layer.blur}
          data-o-neon-layer
          style={
            {
              '--o-neon-blur': `${String(layer.blur)}px`,
              '--o-neon-alpha': String(layer.alpha * intensity),
            } as CSSProperties
          }
        />
      ))}
      {/* Le tube lui-meme, net, par-dessus ses trois halos. */}
      <span data-o-neon-layer="core" />
    </div>
  )
}
