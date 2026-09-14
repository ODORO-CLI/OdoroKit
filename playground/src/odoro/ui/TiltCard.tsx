/**
 * Carte inclinee : elle pivote vers le pointeur, avec un reflet qui le suit.
 *
 * ## La perspective est sur le parent, la rotation sur l'enfant
 *
 * Les deux sur le meme element donnerait une inclinaison plate — la
 * transformation s'appliquerait sans point de fuite, et la carte aurait l'air
 * cisaillee plutot que tournee. Le parent pose la profondeur, l'enfant tourne
 * dedans.
 *
 * ## L'amortissement, pas le suivi direct
 *
 * Une carte collee au pointeur donne un objet sans masse : elle arrive avant
 * qu'on ait fini le geste. Le retard — un dixieme de seconde — est ce qui la
 * rend lourde.
 *
 *     k = 1 - exp(-vitesse * dt)
 *
 * Independant de la frequence d'images : un coefficient fixe rendrait la carte
 * deux fois plus vive sur un ecran a 120 Hz, et le meme composant n'aurait pas
 * le meme poids selon la machine.
 *
 * ## Le reflet est un fond, pas un element
 *
 * Un calque superpose demanderait un empilement et intercepterait le pointeur.
 * Un degrade radial dont on deplace le centre ne coute qu'une variable, se
 * peint sous le contenu, et ne recoit jamais un clic.
 *
 * ## Elle ne re-rend jamais
 *
 * Les angles et la position du reflet sont ecrits dans le style depuis la
 * boucle. Passer par l'etat de React relancerait un rendu de la carte et de
 * tout ce qu'elle contient a chaque pixel parcouru.
 *
 * ## Ce qui reste sans mouvement, et au doigt
 *
 * Une carte. L'inclinaison ne portait aucune information — elle n'etait qu'une
 * reponse au geste — donc la retirer ne retire rien. Sur un ecran tactile il
 * n'y a pas de survol : le composant ne s'abonne meme pas.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface TiltCardOwnProps {
  /** Le contenu de la carte. */
  children: ReactNode
  /**
   * Inclinaison maximale, en degres.
   *
   * Au-dela d'une dizaine, la carte cesse d'avoir l'air posee et se met a
   * tanguer.
   *
   * @defaultValue 8
   */
  tilt?: number
  /**
   * Profondeur de la perspective, en pixels.
   *
   * Plus c'est petit, plus la deformation est marquee.
   *
   * @defaultValue 900
   */
  perspective?: number
  /**
   * Vitesse a laquelle la carte rejoint l'angle vise.
   *
   * @defaultValue 10
   */
  speed?: number
  /**
   * Intensite du reflet, de 0 a 1. Zero le supprime.
   *
   * @defaultValue 0.18
   */
  glare?: number
  /**
   * Couleur du reflet.
   *
   * Une valeur, pas une couleur en dur : ecrite en clair elle echapperait au
   * theme, et une carte sombre garderait un reflet blanc de carte claire.
   *
   * @defaultValue le plus clair de l'echelle neutre
   */
  glareColour?: string
}

/** Toutes les proprietes. */
export type TiltCardProps = Customisable<TiltCardOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-tilt-card'

/** Pose les regles de la carte, une fois par document. */
function ensureTiltRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-tilt]{perspective:var(--o-tilt-depth)}',
    '[data-o-tilt-inner]{',
    'position:relative;height:100%;',
    'transform-style:preserve-3d;will-change:transform;',
    // La transition ne sert qu'au retour au repos : pendant le survol, c'est
    // la boucle qui ecrit a chaque image.
    'transition:transform 420ms cubic-bezier(0.22,1,0.36,1);',
    '}',
    '[data-o-tilt-actif] [data-o-tilt-inner]{transition:none}',
    // Le reflet : un fond, donc sous le contenu et hors d'atteinte du pointeur.
    '[data-o-tilt-inner]::before{',
    'content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;',
    'background:radial-gradient(circle at var(--o-tilt-gx) var(--o-tilt-gy),',
    'color-mix(in oklch,var(--o-tilt-glare-colour) var(--o-tilt-glare),transparent),',
    'transparent 60%);',
    'opacity:0;transition:opacity 260ms ease;',
    '}',
    '[data-o-tilt-actif] [data-o-tilt-inner]::before{opacity:1}',
  ].join('')
  document.head.append(style)
}

/**
 * Une carte qui s'incline vers le pointeur.
 *
 * @example
 * <TiltCard className="o-rounded-xl o-border-w-1 o-p-6">
 *   <h3>Un titre</h3>
 *   <p>Et son texte.</p>
 * </TiltCard>
 *
 * @example
 * // Plus marquee, sans reflet.
 * <TiltCard tilt={14} perspective={600} glare={0}>…</TiltCard>
 */
export function TiltCard({
  children,
  tilt = 8,
  perspective = 900,
  speed = 10,
  glare = 0.18,
  glareColour = 'var(--o-palette-zinc-50)',
  ...rest
}: TiltCardProps): ReactElement {
  const { reduced } = useMotionState()
  const hote = useRef<HTMLDivElement | null>(null)
  const carte = useRef<HTMLDivElement | null>(null)

  ensureTiltRule()

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const cadre = hote.current
    const interieur = carte.current
    if (cadre === null || interieur === null) return

    // Vise et courant : l'ecart entre les deux est tout l'effet.
    let viseX = 0
    let viseY = 0
    let x = 0
    let y = 0
    let dedans = false
    let image = 0
    let dernier = performance.now()

    const surMouvement = (evenement: PointerEvent) => {
      const boite = cadre.getBoundingClientRect()

      // Ramene a [-1, 1] depuis le centre : c'est ce qui rend l'inclinaison
      // independante de la taille de la carte.
      const nx = ((evenement.clientX - boite.left) / Math.max(boite.width, 1)) * 2 - 1
      const ny = ((evenement.clientY - boite.top) / Math.max(boite.height, 1)) * 2 - 1

      viseX = nx
      viseY = ny

      interieur.style.setProperty('--o-tilt-gx', `${String(((nx + 1) / 2) * 100)}%`)
      interieur.style.setProperty('--o-tilt-gy', `${String(((ny + 1) / 2) * 100)}%`)

      if (!dedans) {
        dedans = true
        cadre.setAttribute('data-o-tilt-actif', '')
      }
    }

    const surSortie = () => {
      dedans = false
      viseX = 0
      viseY = 0
      cadre.removeAttribute('data-o-tilt-actif')
      interieur.style.transform = ''
    }

    const pas = (maintenant: number) => {
      const dt = Math.min((maintenant - dernier) / 1000, 0.1)
      dernier = maintenant

      if (dedans) {
        // Amortissement independant de la frequence d'images : voir l'en-tete.
        const k = 1 - Math.exp(-speed * dt)
        x += (viseX - x) * k
        y += (viseY - y) * k

        // Le signe de X est inverse : pointer vers la droite doit faire pivoter
        // le bord droit vers l'arriere, pas vers l'avant.
        interieur.style.transform = `rotateX(${String(-y * tilt)}deg) rotateY(${String(x * tilt)}deg)`
      }

      image = requestAnimationFrame(pas)
    }

    cadre.addEventListener('pointermove', surMouvement, { passive: true })
    cadre.addEventListener('pointerleave', surSortie, { passive: true })
    image = requestAnimationFrame(pas)

    return () => {
      cadre.removeEventListener('pointermove', surMouvement)
      cadre.removeEventListener('pointerleave', surSortie)
      cancelAnimationFrame(image)
      surSortie()
    }
  }, [reduced, tilt, speed])

  const { className, style } = mergePresentation({}, rest)

  const styleCadre = {
    ...style,
    '--o-tilt-depth': `${String(perspective)}px`,
    '--o-tilt-glare': `${String(glare * 100)}%`,
    '--o-tilt-glare-colour': glareColour,
    '--o-tilt-gx': '50%',
    '--o-tilt-gy': '50%',
  } as CSSProperties

  return (
    <div {...rest} ref={hote} className={className} style={styleCadre} data-o-tilt="">
      <div ref={carte} data-o-tilt-inner="">
        {children}
      </div>
    </div>
  )
}
