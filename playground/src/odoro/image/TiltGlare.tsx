/**
 * Inclinaison et reflet : une carte-image qui pivote vers le pointeur, avec
 * un reflet qui se deplace a l'oppose.
 *
 * ## La perspective est sur le parent, la rotation sur l'enfant
 *
 * Les deux sur le meme element donnerait une inclinaison plate — la
 * transformation s'appliquerait sans point de fuite, et l'image aurait l'air
 * cisaillee plutot que tournee. Le parent pose la profondeur, l'enfant tourne
 * dedans.
 *
 * ## Le reflet va a l'oppose du pointeur
 *
 * C'est ce qui le fait lire comme une lumiere et non comme un curseur : quand
 * le bord droit s'enfonce, la lumiere glisse vers la gauche, comme sur une
 * surface vernie qu'on incline. Il est peint en fond de pseudo-element —
 * jamais un calque qui intercepterait le pointeur — et sa couleur vient d'un
 * token, pas d'un blanc en dur qui ignorerait le theme.
 *
 * ## L'amortissement, pas le suivi direct
 *
 * Une image collee au pointeur n'a pas de masse. Le retard vient d'un
 * amortissement exponentiel independant de la cadence d'affichage :
 * `k = 1 - exp(-vitesse x dt)`. Angles et position du reflet sont ecrits dans
 * le style depuis la boucle, sans aucun rendu React.
 *
 * ## Ce qui reste sans mouvement, et au doigt
 *
 * Une image plate. L'inclinaison ne portait aucune information. Sur un ecran
 * tactile il n'y a pas de survol : le composant ne s'abonne meme pas.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-tilt-glare'

/** Pose les regles de la carte, une fois par document. */
function ensureTiltGlareRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-tilt-glare]{perspective:900px}',
    '[data-o-tg-inner]{',
    'position:relative;height:100%;overflow:hidden;border-radius:inherit;',
    'transform-style:preserve-3d;will-change:transform;',
    // La transition ne sert qu'au retour au repos : pendant le survol, c'est
    // la boucle qui ecrit a chaque image.
    'transition:transform 420ms cubic-bezier(0.22,1,0.36,1);',
    '}',
    '[data-o-tilt-glare-actif] [data-o-tg-inner]{transition:none}',
    // Le reflet : un fond, donc au-dessus de l'image mais hors d'atteinte du
    // pointeur et des technologies d'assistance.
    '[data-o-tg-inner]::after{',
    'content:"";position:absolute;inset:0;pointer-events:none;',
    'background:radial-gradient(circle at var(--o-tg-gx) var(--o-tg-gy),',
    'color-mix(in oklch,var(--o-palette-zinc-50) var(--o-tg-glare),transparent),',
    'transparent 60%);',
    'opacity:0;transition:opacity 260ms ease;',
    '}',
    '[data-o-tilt-glare-actif] [data-o-tg-inner]::after{opacity:1}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface TiltGlareOwnProps {
  /** Source de l'image. */
  src: string
  /** Texte de remplacement. Chaine vide si l'image est purement decorative. */
  alt: string
  /** Rapport largeur sur hauteur. @defaultValue 1.777 */
  ratio?: number
  /**
   * Inclinaison maximale, en degres.
   *
   * Au-dela d'une quinzaine, l'image cesse d'avoir l'air posee et se met a
   * tanguer.
   *
   * @defaultValue 10
   */
  tilt?: number
  /** Intensite du reflet, de 0 a 1. Zero le supprime. @defaultValue 0.25 */
  glare?: number
}

/** Toutes les proprietes : les siennes, plus celles d'une image. */
export type TiltGlareProps = Customisable<TiltGlareOwnProps, 'img'>

/**
 * Incline une image vers le pointeur, reflet a l'oppose.
 *
 * @example
 * <TiltGlare src="/photo.jpg" alt="Vue de l atelier" className="o-rounded-xl" />
 *
 * @example
 * // Plus marquee, sans reflet.
 * <TiltGlare src="/photo.jpg" alt="" tilt={14} glare={0} />
 */
export function TiltGlare({
  src,
  alt,
  ratio = 1.777,
  tilt = 10,
  glare = 0.25,
  ...rest
}: TiltGlareProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLDivElement | null>(null)
  const inner = useRef<HTMLDivElement | null>(null)

  ensureTiltGlareRule()

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const frame = host.current
    const card = inner.current
    if (frame === null || card === null) return

    // Vise et courant : l'ecart entre les deux est tout l'effet.
    let aimX = 0
    let aimY = 0
    let x = 0
    let y = 0
    let inside = false
    let handle = 0
    let last = performance.now()

    const onMove = (event: PointerEvent): void => {
      const box = frame.getBoundingClientRect()

      // Ramene a [-1, 1] depuis le centre : l'inclinaison ne depend pas de la
      // taille de la carte.
      const nx = ((event.clientX - box.left) / Math.max(box.width, 1)) * 2 - 1
      const ny = ((event.clientY - box.top) / Math.max(box.height, 1)) * 2 - 1

      aimX = nx
      aimY = ny

      if (!inside) {
        inside = true
        frame.setAttribute('data-o-tilt-glare-actif', '')
      }
    }

    const onLeave = (): void => {
      inside = false
      aimX = 0
      aimY = 0
      frame.removeAttribute('data-o-tilt-glare-actif')
      card.style.transform = ''
    }

    const step = (now: number): void => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now

      if (inside) {
        // Amortissement independant de la cadence : voir l'en-tete du module.
        const k = 1 - Math.exp(-10 * dt)
        x += (aimX - x) * k
        y += (aimY - y) * k

        // Le signe de X est inverse : pointer vers la droite doit faire
        // pivoter le bord droit vers l'arriere, pas vers l'avant.
        card.style.transform = `rotateX(${String(-y * tilt)}deg) rotateY(${String(x * tilt)}deg)`

        // Le reflet est place a l'oppose de la position amortie : la lumiere
        // glisse vers le bord qui se leve.
        card.style.setProperty('--o-tg-gx', `${String((0.5 - x / 2) * 100)}%`)
        card.style.setProperty('--o-tg-gy', `${String((0.5 - y / 2) * 100)}%`)
      }

      handle = requestAnimationFrame(step)
    }

    frame.addEventListener('pointermove', onMove, { passive: true })
    frame.addEventListener('pointerleave', onLeave, { passive: true })
    handle = requestAnimationFrame(step)

    return () => {
      frame.removeEventListener('pointermove', onMove)
      frame.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(handle)
      onLeave()
    }
  }, [reduced, tilt])

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    '--o-tg-glare': `${String(Math.min(1, Math.max(0, glare)) * 100)}%`,
    '--o-tg-gx': '50%',
    '--o-tg-gy': '50%',
  } as CSSProperties

  return (
    <div ref={host} className={className} style={hostStyle} data-o-tilt-glare="">
      <div ref={inner} data-o-tg-inner="">
        <img {...rest} src={src} alt={alt} className="o-size-full o-object-cover" />
      </div>
    </div>
  )
}
