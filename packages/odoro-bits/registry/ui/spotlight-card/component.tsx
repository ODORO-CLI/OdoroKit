/**
 * Carte projecteur : un halo amorti suit le pointeur sur la surface, et la
 * bordure s'eclaire la ou il passe.
 *
 * ## Ce qui la distingue de la carte a lueur
 *
 * La carte a lueur ne peint que l'anneau, et colle au pointeur. Ici la
 * lumiere se repand **sur la surface** — un projecteur pose au-dessus de la
 * carte — et l'anneau n'est que le bord de ce faisceau, la ou il touche le
 * filet. Et le halo est amorti : il arrive un peu apres le geste, comme une
 * lampe qu'on oriente. C'est ce retard qui lui donne une masse ; un halo
 * colle au pointeur se lit comme un curseur, pas comme une lumiere.
 *
 * ## Deux calques, deux variables
 *
 * Le halo est un `::before` sous le contenu, l'anneau un `::after` obtenu par
 * le meme masque que la carte a lueur. Tous deux lisent la meme position,
 * ecrite en deux variables depuis la boucle du moteur : React ne rend qu'au
 * montage, quel que soit le nombre de pixels parcourus.
 *
 * ## Pourquoi la position vient de la boucle et non de l'evenement
 *
 * L'amortissement est calcule par le crochet de pointeur, a chaque image, dans
 * une ref. Ecrire la position depuis l'evenement de pointeur la ferait sauter
 * au rythme irregulier ou le systeme le livre ; la lire dans la boucle donne
 * un trajet continu, et permet de cesser d'ecrire des que le halo est arrive.
 *
 * ## Inerte la ou il n'y a pas de pointeur fin, et sous mouvement reduit
 *
 * Au doigt il n'y a pas de survol : le halo n'apparaitrait qu'au toucher,
 * comme un rate. Sous mouvement reduit, un halo qui suit le geste est
 * precisement ce qui est demande de retirer. Dans les deux cas la carte est
 * une carte, avec sa surface et son filet.
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
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

/** Proprietes propres au composant. */
export interface SpotlightCardOwnProps {
  /** Contenu de la carte. */
  children: ReactNode
  /** Rayon du halo, en pixels. @defaultValue 260 */
  radius?: number
  /** Intensite du halo sur la surface, de zero a un. @defaultValue 0.35 */
  strength?: number
  /** Vitesse a laquelle le halo rejoint le pointeur. Plus haut, plus sec. @defaultValue 8 */
  speed?: number
  /** Couleur du projecteur. @defaultValue teinte de marque */
  color?: string
}

/** Toutes les proprietes. */
export type SpotlightCardProps = Customisable<SpotlightCardOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-spotlight-card'

/** Pose la surface, le halo et l'anneau, une fois par document. */
function ensureSpotlightRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Pas d'overflow cache : il rognerait l'anneau, qui vit sur la bordure.
    // Les deux calques prennent l'arrondi par eux-memes.
    '[data-o-spot]{',
    'position:relative;isolation:isolate;',
    'background:var(--o-theme-surface);',
    'border:1px solid var(--o-theme-line);',
    '}',
    // Le halo : sous le contenu grace au contexte d'empilement isole, mais
    // au-dessus du fond de la carte.
    '[data-o-spot]::before{',
    'content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
    'border-radius:inherit;',
    'background:radial-gradient(var(--o-spot-radius) circle at var(--o-spot-x) var(--o-spot-y),',
    'color-mix(in oklab,var(--o-spot-color) var(--o-spot-strength),transparent),',
    'transparent 70%);',
    'opacity:0;transition:opacity 320ms ease;',
    '}',
    // L'anneau : le meme degrade, retenu sur le filet par un masque.
    '[data-o-spot]::after{',
    'content:"";position:absolute;inset:-1px;pointer-events:none;',
    'border-radius:inherit;padding:1px;',
    'background:radial-gradient(var(--o-spot-radius) circle at var(--o-spot-x) var(--o-spot-y),',
    'var(--o-spot-color),transparent 65%);',
    '-webkit-mask:linear-gradient(currentColor 0 0) content-box,linear-gradient(currentColor 0 0);',
    'mask:linear-gradient(currentColor 0 0) content-box,linear-gradient(currentColor 0 0);',
    '-webkit-mask-composite:xor;mask-composite:exclude;',
    'opacity:0;transition:opacity 320ms ease;',
    '}',
    '[data-o-spot][data-o-spot-on]::before,[data-o-spot][data-o-spot-on]::after{opacity:1}',
  ].join('')
  document.head.append(style)
}

/**
 * Pose un projecteur amorti sur une carte.
 *
 * @example
 * <SpotlightCard className="o-rounded-xl o-p-6">
 *   <h3>Une carte</h3>
 * </SpotlightCard>
 *
 * @example
 * // Un faisceau etroit et vif, d'une autre teinte.
 * <SpotlightCard radius={160} strength={0.6} color="var(--o-palette-sky-500)">
 *   Contenu
 * </SpotlightCard>
 */
export function SpotlightCard({
  children,
  radius = 260,
  strength = 0.35,
  speed = 8,
  color = 'var(--o-palette-brand-500)',
  ...rest
}: SpotlightCardProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const pointer = usePointerDamped({ host, speed, name: 'projecteur : pointeur' })
  ensureSpotlightRules()

  useEffect(() => {
    if (host === null || reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let lastX = -1
    let lastY = -1

    const onEnter = (): void => host.setAttribute('data-o-spot-on', '')
    const onLeave = (): void => host.removeAttribute('data-o-spot-on')

    const subscription = clock.subscribe(
      () => {
        const x = ((pointer.current.x + 1) / 2) * 100
        const y = ((pointer.current.y + 1) / 2) * 100

        // Une fois le halo arrive, ou eteint et revenu au centre, il n'y a
        // plus rien a ecrire : le style reste tel quel.
        if (Math.abs(x - lastX) < 0.02 && Math.abs(y - lastY) < 0.02) return

        lastX = x
        lastY = y
        host.style.setProperty('--o-spot-x', `${x.toFixed(2)}%`)
        host.style.setProperty('--o-spot-y', `${y.toFixed(2)}%`)
      },
      { priority: CLOCK_PRIORITY.render, name: 'projecteur' },
    )

    host.addEventListener('pointerenter', onEnter, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      subscription.unsubscribe()
      onLeave()
    }
  }, [host, reduced, pointer])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={
        {
          ...style,
          '--o-spot-radius': `${String(radius)}px`,
          '--o-spot-strength': `${String(strength * 100)}%`,
          '--o-spot-color': color,
          '--o-spot-x': '50%',
          '--o-spot-y': '50%',
        } as CSSProperties
      }
      data-o-spot=""
    >
      {children}
    </div>
  )
}
