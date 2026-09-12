/**
 * Carte a degradation : l'image se tord et se delave quand le pointeur la
 * traverse, d'autant plus qu'il va vite, puis se repare quand il s'arrete.
 *
 * ## Un filtre SVG pilote par la vitesse, pas par la position
 *
 * Une distorsion qui suit la position du pointeur est une loupe. Ce qui fait
 * lire une **degradation**, c'est qu'elle suive le geste lui-meme : un
 * passage lent effleure l'image, un passage vif la dechire. La grandeur
 * mesuree est donc la vitesse du pointeur, et rien d'autre.
 *
 * Le filtre est un bruit de turbulence qui deplace les pixels de l'image
 * (`feDisplacementMap`). Son amplitude est le seul attribut ecrit par image,
 * directement sur le noeud du filtre : ni React ni le style ne sont
 * traverses. Un second noeud desature l'image a mesure qu'elle se tord — une
 * image qui se degrade perd aussi ses couleurs.
 *
 * ## Deux amortissements
 *
 * La vitesse mesuree retombe d'elle-meme quand les evenements cessent — sans
 * cela l'image resterait tordue au dernier geste, le pointeur immobile
 * dessus. Et l'amplitude affichee rattrape cette cible avec un retard
 * independant de la cadence, pour que la reparation ait une duree et non un
 * saut.
 *
 * ## L'image deborde un peu de sa fenetre
 *
 * Un deplacement de pixels tire du transparent depuis les bords. L'image est
 * donc rendue un peu plus grande que sa fenetre, qui la rogne : les bords
 * tordus restent couverts.
 *
 * ## Ce qui reste au doigt et sous mouvement reduit
 *
 * L'image intacte, avec sa legende. La degradation est transitoire par
 * nature ; son etat final est une image reparee.
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
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface DecayCardOwnProps {
  /** Source de l'image. */
  src: string
  /** Texte de remplacement. Chaine vide si l'image est purement decorative. */
  alt: string
  /** Rapport largeur sur hauteur de l'image. @defaultValue 1.5 */
  ratio?: number
  /** Deplacement maximal des pixels, en pixels. @defaultValue 48 */
  strength?: number
  /** Vitesse de reparation. Plus haut, plus l'image se repare vite. @defaultValue 5 */
  speed?: number
  /** Finesse du bruit. Plus bas, plus les vagues sont larges. @defaultValue 0.012 */
  grain?: number
  /** Legende ou contenu sous l'image. */
  children?: ReactNode
}

/** Toutes les proprietes. */
export type DecayCardProps = Customisable<DecayCardOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-decay-card'

/** Pose la carte et sa fenetre d'image, une fois par document. */
function ensureDecayRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-decay]{',
    'position:relative;overflow:hidden;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    '}',
    '[data-o-decay-window]{',
    'position:relative;overflow:hidden;aspect-ratio:var(--o-decay-ratio);',
    'border-bottom:1px solid var(--o-theme-line);',
    '}',
    // Un peu plus grande que sa fenetre : les bords tordus restent couverts.
    '[data-o-decay-window] img{',
    'display:block;width:100%;height:100%;object-fit:cover;',
    'transform:scale(1.08);',
    '}',
    '[data-o-decay-filter]{position:absolute;width:0;height:0;overflow:hidden}',
  ].join('')
  document.head.append(style)
}

/**
 * Une carte dont l'image se degrade sous un pointeur rapide.
 *
 * @example
 * <DecayCard src="/photo.jpg" alt="Vue de l atelier" className="o-rounded-xl">
 *   <p className="o-p-4">Une legende</p>
 * </DecayCard>
 *
 * @example
 * // Plus violente, vagues plus larges.
 * <DecayCard src="/photo.jpg" alt="" strength={90} grain={0.006} />
 */
export function DecayCard({
  src,
  alt,
  ratio = 1.5,
  strength = 48,
  speed = 5,
  grain = 0.012,
  children,
  ...rest
}: DecayCardProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const displacement = useRef<SVGFEDisplacementMapElement | null>(null)
  const saturation = useRef<SVGFEColorMatrixElement | null>(null)
  const image = useRef<HTMLImageElement | null>(null)
  // Les deux-points de l'identifiant de React ne passent pas dans `url(#...)`.
  const filterId = `o-decay-${useId().replace(/:/g, '')}`
  ensureDecayRules()

  useEffect(() => {
    const map = displacement.current
    const matrix = saturation.current
    const picture = image.current
    if (host === null || map === null || matrix === null || picture === null || reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let lastX = 0
    let lastY = 0
    let lastTime = 0
    let target = 0
    let current = 0
    let applied = false

    const onMove = (event: PointerEvent): void => {
      const now = event.timeStamp
      if (lastTime !== 0) {
        const dt = Math.max(now - lastTime, 1)
        const velocity = Math.hypot(event.clientX - lastX, event.clientY - lastY) / dt
        // Un pixel par milliseconde est un geste vif : il vaut l'amplitude
        // entiere. Le maximum garde la cible le temps que l'ecriture suive.
        target = Math.max(target, Math.min(strength, velocity * strength))
      }
      lastX = event.clientX
      lastY = event.clientY
      lastTime = now
    }

    const onLeave = (): void => {
      lastTime = 0
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        // La cible retombe d'elle-meme : voir l'en-tete.
        target *= Math.exp(-4 * delta)
        current += (target - current) * (1 - Math.exp(-speed * delta))

        if (current < 0.2) {
          if (applied) {
            applied = false
            picture.style.filter = ''
          }
          return
        }

        if (!applied) {
          applied = true
          picture.style.filter = `url(#${filterId})`
        }
        map.setAttribute('scale', current.toFixed(1))
        matrix.setAttribute('values', (1 - Math.min(1, current / strength) * 0.8).toFixed(3))
      },
      { priority: CLOCK_PRIORITY.render, name: 'degradation' },
    )

    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      subscription.unsubscribe()
      picture.style.filter = ''
    }
  }, [host, reduced, strength, speed, filterId])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={{ ...style, '--o-decay-ratio': String(ratio) } as CSSProperties}
      data-o-decay=""
    >
      <svg data-o-decay-filter="" aria-hidden="true" focusable="false">
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={String(grain)}
            numOctaves={2}
            seed={7}
            result="bruit"
          />
          <feDisplacementMap
            ref={displacement}
            in="SourceGraphic"
            in2="bruit"
            scale={0}
            xChannelSelector="R"
            yChannelSelector="G"
            result="tordu"
          />
          <feColorMatrix ref={saturation} in="tordu" type="saturate" values="1" />
        </filter>
      </svg>
      <div data-o-decay-window="">
        <img ref={image} src={src} alt={alt} draggable={false} />
      </div>
      {children}
    </div>
  )
}
