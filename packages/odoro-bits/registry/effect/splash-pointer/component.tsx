/**
 * Eclaboussure : au clic, des gouttes partent et retombent.
 *
 * ## Une balistique, pas une rosace
 *
 * Les etincelles partent en ligne droite et s'eteignent : c'est un eclat. Une
 * eclaboussure, elle, a un poids — les gouttes montent, ralentissent, puis
 * tombent, et celles qui partent a plat retombent plus loin que celles qui
 * partent haut. Sans cette courbe, on retrouve une rosace reguliere, qui se
 * lit comme un mecanisme.
 *
 * La courbe n'est pas simulee image par image. Chaque goutte recoit une
 * vitesse initiale, et sa trajectoire est **echantillonnee** en cinq points
 * remis a l'API Web Animations sous forme d'images-cles. Le navigateur
 * interpole entre elles sur son propre fil : rien ne tourne dans le fil
 * principal, et la boucle du moteur n'est pas sollicitee du tout.
 *
 * ## Les gouttes vivent dans le DOM, pas dans l'etat
 *
 * Chaque impact cree ses elements, les lance, et les retire a la fin de leur
 * animation. Les porter dans l'etat de React imposerait deux rendus par clic
 * pour des objets que personne ne lit : ils sont decoratifs, ephemeres, et
 * leur cycle de vie est exactement celui de leur animation.
 *
 * ## L'onde d'impact
 *
 * Une couronne part avec les gouttes et s'efface plus vite qu'elles. Elle
 * fait le lien entre le point clique et la gerbe : sans elle, les gouttes ont
 * l'air de venir de nulle part.
 *
 * ## Ou elle ne se montre pas
 *
 * Sans pointeur fin, aucun element n'est cree. Sous mouvement reduit non
 * plus : une eclaboussure est un geste entier, et le geste est ce qu'on nous
 * demande d'omettre.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface SplashPointerOwnProps {
  /** Zone qui recoit les clics. */
  children: ReactNode
  /** Nombre de gouttes par impact. @defaultValue 14 */
  drops?: number
  /** Portee horizontale des gouttes, en pixels. @defaultValue 90 */
  spread?: number
  /** Duree du vol, en millisecondes. @defaultValue 700 */
  duration?: number
  /** Poids des gouttes : plus haut, plus elles retombent vite. @defaultValue 1.4 */
  gravity?: number
  /** Couleur des gouttes. Une valeur, pas un role. @defaultValue la couleur du texte */
  color?: string
}

/** Toutes les proprietes. */
export type SplashPointerProps = Customisable<SplashPointerOwnProps>

/** Au-dela, la gerbe devient une tache et chaque clic coute pour rien. */
const MAX_DROPS = 28

/** Points ou la trajectoire est echantillonnee. Voir l'en-tete du module. */
const SAMPLES = 5

/**
 * Fait eclabousser chaque clic sur sa zone.
 *
 * L'enveloppe est transparente : elle se pose autour d'un bouton, d'une
 * carte ou d'une zone entiere, sans rien changer a leur mise en page.
 *
 * @example
 * <SplashPointer>
 *   <button type="button" className="o-px-6 o-py-3">Envoyer</button>
 * </SplashPointer>
 *
 * @example
 * // Gerbe ample et lourde, teintee.
 * <SplashPointer drops={22} spread={140} gravity={2.2} color="var(--o-palette-brand-500)">
 *   <div className="o-p-10">Toute la carte repond</div>
 * </SplashPointer>
 */
export function SplashPointer({
  children,
  drops = 14,
  spread = 90,
  duration = 700,
  gravity = 1.4,
  color = 'currentColor',
  ...rest
}: SplashPointerProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Pointeur grossier : rien ne s'abonne, aucun element n'est cree.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const total = Math.max(3, Math.min(MAX_DROPS, Math.round(drops)))

    const onPointerDown = (event: PointerEvent): void => {
      if (event.pointerType === 'touch') return
      const box = host.getBoundingClientRect()
      const x = event.clientX - box.left
      const y = event.clientY - box.top

      // La couronne d'impact, plus breve que les gouttes.
      const ring = document.createElement('span')
      ring.setAttribute('aria-hidden', 'true')
      ring.setAttribute('data-o-splash', '')
      ring.style.position = 'absolute'
      ring.style.left = `${x.toFixed(1)}px`
      ring.style.top = `${y.toFixed(1)}px`
      ring.style.width = '18px'
      ring.style.height = '18px'
      ring.style.margin = '-9px'
      ring.style.borderRadius = '50%'
      ring.style.border = `1.5px solid ${color}`
      ring.style.pointerEvents = 'none'
      host.append(ring)
      const wave = ring.animate(
        [
          { transform: 'scale(0.2)', opacity: 0.9 },
          { transform: `scale(${(spread / 24).toFixed(2)})`, opacity: 0 },
        ],
        {
          duration: Math.round(duration * 0.6),
          easing: 'cubic-bezier(0, 0, 0.2, 1)',
          fill: 'forwards',
        },
      )
      wave.onfinish = () => ring.remove()

      for (let index = 0; index < total; index += 1) {
        // Reparti sur le tour, puis brouille : une roue parfaite se lirait
        // comme un mecanisme. Le tirage a lieu au clic, cote client seulement,
        // il ne peut donc pas creer d'ecart d'hydratation.
        const angle = ((index + Math.random() * 0.7) / total) * Math.PI * 2
        const power = spread * (0.55 + Math.random() * 0.7)
        const speedX = Math.cos(angle) * power
        // Toutes les gouttes partent vers le haut : c'est la gravite qui les
        // ramene, et c'est de la que vient la courbe.
        const speedY = -Math.abs(Math.sin(angle)) * power * 0.9 - power * 0.35
        const side = 3 + Math.random() * 4

        const drop = document.createElement('span')
        drop.setAttribute('aria-hidden', 'true')
        drop.setAttribute('data-o-splash', '')
        drop.style.position = 'absolute'
        drop.style.left = `${x.toFixed(1)}px`
        drop.style.top = `${y.toFixed(1)}px`
        drop.style.width = `${side.toFixed(1)}px`
        drop.style.height = `${side.toFixed(1)}px`
        drop.style.margin = `${(-side / 2).toFixed(1)}px`
        drop.style.borderRadius = '50%'
        drop.style.background = color
        drop.style.pointerEvents = 'none'
        host.append(drop)

        const frames: Keyframe[] = []
        for (let step = 0; step < SAMPLES; step += 1) {
          const time = step / (SAMPLES - 1)
          const flightX = speedX * time
          const flightY = speedY * time + gravity * power * time * time
          frames.push({
            offset: time,
            transform: `translate3d(${flightX.toFixed(1)}px,${flightY.toFixed(1)}px,0) scale(${(1 - time * 0.5).toFixed(2)})`,
            opacity: time < 0.6 ? 1 : (1 - time) / 0.4,
          })
        }

        const flight = drop.animate(frames, {
          duration,
          easing: 'linear',
          fill: 'forwards',
        })
        flight.onfinish = () => drop.remove()
      }
    }

    host.addEventListener('pointerdown', onPointerDown)
    return () => {
      host.removeEventListener('pointerdown', onPointerDown)
      // Les gouttes en vol appartiennent a cette instance : elles partent avec
      // elle.
      for (const orphan of host.querySelectorAll('[data-o-splash]')) orphan.remove()
    }
  }, [host, reduced, drops, spread, duration, gravity, color])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      // Les gouttes sont absolues dans la zone et coupees a ses bords : sans le
      // debordement cache, une gerbe pres du bord s'etalerait sur la page.
      style={{ position: 'relative', overflow: 'hidden', ...style } as CSSProperties}
    >
      {children}
    </div>
  )
}
