/**
 * Curseur double : un point net, un anneau qui rattrape.
 *
 * ## Le point suit l'evenement, l'anneau suit la boucle
 *
 * Le point remplace le curseur natif : tout retard se verrait comme un
 * decalage, il est donc ecrit directement au deplacement du pointeur — deux
 * variables CSS, aucun rendu React. L'anneau, lui, est tout entier dans son
 * retard : c'est l'ecart entre le point et lui qui fait l'effet. Il lit la
 * position amortie du crochet `usePointerDamped` dans une souscription a la
 * boucle, et la recopie dans deux autres variables.
 *
 * ## L'anneau annonce l'interactif
 *
 * Au survol d'un lien ou d'un bouton — detecte par `closest()` sur
 * `pointerover`, ce qui couvre aussi les enfants de l'element interactif —
 * l'anneau grossit. La croissance passe par la meme boucle que la position :
 * une transition CSS sur le transform casserait le suivi, qui ecrit ce
 * transform a chaque image.
 *
 * ## Ou l'effet s'efface
 *
 * Au toucher, il n'y a pas de curseur a remplacer : rien ne s'affiche, rien
 * n'est masque. Sous mouvement reduit, un anneau qui traine est exactement le
 * mouvement qu'on nous demande d'omettre : le curseur natif est conserve tel
 * quel.
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
export interface CursorRingOwnProps {
  /** Contenu de la zone ou le curseur est remplace. */
  children: ReactNode
  /** Diametre de l'anneau, en pixels. @defaultValue 36 */
  size?: number
  /** Retard de l'anneau : plus haut, plus il traine. @defaultValue 1 */
  lag?: number
  /** Facteur de grossissement sur les elements interactifs. @defaultValue 1.8 */
  grow?: number
  /** Couleur du point et de l'anneau. @defaultValue la couleur du texte */
  color?: string
}

/** Toutes les proprietes. */
export type CursorRingProps = Customisable<CursorRingOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-cursor-ring'

/** Ce que l'anneau considere comme interactif. */
const INTERACTIVE = 'a,button,[role=button]'

/** Pose le point et l'anneau, une fois par document. */
function ensureCursorRingRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cursor-ring]{position:relative;overflow:hidden}',
    // Le curseur natif ne disparait que lorsque le remplacant est la : avant
    // le premier mouvement de souris, rien n'est masque.
    '[data-o-cursor-ring][data-o-cursor-ring-on]{cursor:none}',
    '[data-o-cursor-ring][data-o-cursor-ring-on] *{cursor:none}',
    '[data-o-ring-dot],[data-o-ring-halo]{',
    'position:absolute;left:0;top:0;pointer-events:none;border-radius:50%;',
    'opacity:0;transition:opacity 150ms linear;',
    '}',
    '[data-o-ring-dot]{',
    'width:6px;height:6px;margin:-3px;background:var(--o-ring-color);',
    // Hors champ par defaut : un point pose en (0,0) avant tout mouvement
    // se verrait dans le coin de la zone.
    'transform:translate3d(var(--o-ring-dot-x,-100px),var(--o-ring-dot-y,-100px),0);',
    '}',
    '[data-o-ring-halo]{',
    'width:var(--o-ring-size);height:var(--o-ring-size);',
    'margin:calc(var(--o-ring-size) / -2);',
    'border:1.5px solid var(--o-ring-color);',
    'transform:translate3d(var(--o-ring-x,-200px),var(--o-ring-y,-200px),0) scale(var(--o-ring-grow,1));',
    '}',
    '[data-o-cursor-ring-on] [data-o-ring-dot],[data-o-cursor-ring-on] [data-o-ring-halo]{opacity:1}',
  ].join('')
  document.head.append(style)
}

/**
 * Remplace le curseur natif de sa zone par un point et un anneau retardataire.
 *
 * @example
 * <CursorRing className="o-rounded-xl o-p-8">
 *   <a href="/tarifs">L anneau grossit sur ce lien</a>
 * </CursorRing>
 *
 * @example
 * // Un anneau large et paresseux.
 * <CursorRing size={56} lag={2} grow={1.5}>
 *   <nav>…</nav>
 * </CursorRing>
 */
export function CursorRing({
  children,
  size = 36,
  lag = 1,
  grow = 1.8,
  color = 'currentColor',
  ...rest
}: CursorRingProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  ensureCursorRingRule()

  // Le retard est une vitesse d'amortissement inversee : lag 1 donne le
  // rattrapage visible qui fait exister l'anneau.
  const pointer = usePointerDamped({
    host,
    speed: 8 / Math.max(lag, 0.1),
    name: 'cursor-ring : pointeur',
  })

  useEffect(() => {
    if (host === null || reduced) return

    // La taille de la zone est relevee au mouvement, pas a chaque image :
    // interroger la geometrie dans la boucle forcerait une mise en page.
    const bounds = { width: 0, height: 0 }
    let targetScale = 1
    let scale = 1

    const onMove = (event: PointerEvent): void => {
      // Au toucher, il n'y a pas de curseur a remplacer : voir l'en-tete.
      if (event.pointerType !== 'mouse') return
      const box = host.getBoundingClientRect()
      bounds.width = box.width
      bounds.height = box.height
      host.style.setProperty('--o-ring-dot-x', `${(event.clientX - box.left).toFixed(1)}px`)
      host.style.setProperty('--o-ring-dot-y', `${(event.clientY - box.top).toFixed(1)}px`)
      host.setAttribute('data-o-cursor-ring-on', '')
    }

    const onLeave = (): void => {
      host.removeAttribute('data-o-cursor-ring-on')
    }

    const onOver = (event: PointerEvent): void => {
      const target = event.target
      if (!(target instanceof Element)) return
      targetScale = target.closest(INTERACTIVE) === null ? 1 : grow
    }

    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointerover', onOver)

    const subscription = clock.subscribe(
      ({ delta }) => {
        if (bounds.width === 0) return
        // Du repere du crochet (centre, [-1, 1]) vers les pixels de la zone.
        const x = ((pointer.current.x + 1) / 2) * bounds.width
        const y = ((pointer.current.y + 1) / 2) * bounds.height
        const factor = 1 - Math.exp(-12 * delta)
        scale += (targetScale - scale) * factor
        host.style.setProperty('--o-ring-x', `${x.toFixed(1)}px`)
        host.style.setProperty('--o-ring-y', `${y.toFixed(1)}px`)
        host.style.setProperty('--o-ring-grow', scale.toFixed(3))
      },
      { name: 'cursor-ring : anneau', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointerover', onOver)
      subscription.unsubscribe()
      host.removeAttribute('data-o-cursor-ring-on')
    }
  }, [host, reduced, grow, pointer])

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-ring-color': color,
    '--o-ring-size': `${String(size)}px`,
  } as CSSProperties

  return (
    <div {...rest} ref={setHost} className={className} style={hostStyle} data-o-cursor-ring="">
      {children}
      {/* Sous mouvement reduit, le remplacant n'existe pas du tout : le
          curseur natif reste, et rien ne traine derriere lui. */}
      {reduced ? null : (
        <>
          <span aria-hidden data-o-ring-dot="" />
          <span aria-hidden data-o-ring-halo="" />
        </>
      )}
    </div>
  )
}
