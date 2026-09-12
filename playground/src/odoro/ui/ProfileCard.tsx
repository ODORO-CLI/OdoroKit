/**
 * Carte de profil : portrait, nom et role sur une carte qui s'incline vers
 * le pointeur, avec une bande de brillance qui la traverse.
 *
 * ## Ce qui la distingue de la carte inclinee
 *
 * La carte inclinee est un cadre vide qui pivote. Celle-ci a une
 * composition : un portrait, un nom, un role, et ce qu'on veut en dessous. Le
 * portrait est pose un cran **devant** la carte dans la scene en trois
 * dimensions, si bien qu'en pivotant il se decale un peu par rapport au
 * texte — c'est ce decalage, la parallaxe, qui fait lire la carte comme un
 * objet epais et non comme une image qui tourne.
 *
 * La brillance n'est pas un reflet radial : c'est une bande oblique qui
 * balaie la carte d'un bord a l'autre quand le pointeur va de gauche a
 * droite, comme une carte plastifiee qu'on incline sous une lampe.
 *
 * ## Tout est ecrit depuis la boucle
 *
 * Les angles, la position de la bande : le crochet de pointeur amortit dans
 * une ref, et la boucle du moteur ecrit le style. React rend une fois.
 * L'amortissement est independant de la cadence — `1 - exp(-vitesse x dt)`,
 * calcule par le crochet — pour que la carte ait le meme poids partout.
 *
 * ## Ce qui reste sans mouvement, et au doigt
 *
 * Une carte de profil, plate et lisible : l'inclinaison ne portait aucune
 * information. Sans pointeur fin, il n'y a pas de survol : rien ne s'abonne.
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
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped'

/** Proprietes propres au composant. */
export interface ProfileCardOwnProps {
  /** Nom affiche. */
  name: string
  /** Sous-titre : un role, un metier, un lieu. */
  subtitle?: string
  /** Portrait : une source d'image, ou un element (initiales, icone). */
  avatar?: string | ReactNode
  /** Ce qui suit l'en-tete : une phrase, des actions. */
  children?: ReactNode
  /** Inclinaison maximale, en degres. @defaultValue 10 */
  tilt?: number
  /** Vitesse a laquelle la carte rejoint l'angle vise. @defaultValue 8 */
  speed?: number
  /** Intensite de la bande de brillance, de zero a un. Zero la supprime. @defaultValue 0.35 */
  sheen?: number
  /** Teinte de la brillance. @defaultValue teinte de marque */
  tint?: string
}

/** Toutes les proprietes. */
export type ProfileCardProps = Customisable<ProfileCardOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-profile-card'

/** Pose la scene, la carte et sa bande, une fois par document. */
function ensureProfileRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-profile]{perspective:1000px}',
    // Pas d'overflow cache ici : il aplatirait la scene, et le portrait
    // perdrait son cran d'avance. La bande prend l'arrondi par elle-meme.
    '[data-o-profile-inner]{',
    'position:relative;border-radius:inherit;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    'transform-style:preserve-3d;will-change:transform;',
    // La transition ne sert qu'au retour au repos : pendant le survol, la
    // boucle ecrit a chaque image.
    'transition:transform 480ms cubic-bezier(0.22,1,0.36,1);',
    '}',
    '[data-o-profile-on] [data-o-profile-inner]{transition:none}',
    // La bande : un fond, jamais un calque qui intercepte le pointeur.
    '[data-o-profile-inner]::after{',
    'content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;',
    'background:linear-gradient(115deg,',
    'transparent calc(var(--o-profile-sx) - 22%),',
    'color-mix(in oklab,var(--o-profile-tint) var(--o-profile-sheen),transparent) var(--o-profile-sx),',
    'transparent calc(var(--o-profile-sx) + 22%));',
    'opacity:0;transition:opacity 260ms ease;',
    '}',
    '[data-o-profile-on] [data-o-profile-inner]::after{opacity:1}',
    '[data-o-profile-head]{display:flex;align-items:center;gap:0.875rem;text-align:left}',
    // Le portrait est un cran devant la carte : la parallaxe vient de la.
    '[data-o-profile-avatar]{',
    'flex:none;display:grid;place-items:center;overflow:hidden;',
    'width:3.5rem;height:3.5rem;border-radius:999px;',
    'background:color-mix(in oklab,var(--o-profile-tint) 18%,var(--o-theme-surface));',
    'border:1px solid var(--o-theme-line);',
    'transform:translateZ(var(--o-profile-lift));',
    'font-weight:600;',
    '}',
    '[data-o-profile-avatar] img{width:100%;height:100%;object-fit:cover}',
    '[data-o-profile-name]{margin:0;font-weight:600;line-height:1.2}',
    '[data-o-profile-subtitle]{margin:0.15rem 0 0;font-size:0.85em;color:var(--o-theme-muted)}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-profile-avatar]{transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Une carte de profil qui s'incline vers le pointeur.
 *
 * @example
 * <ProfileCard name="Lea Marchand" subtitle="Designer produit" avatar="/lea.jpg" className="o-rounded-2xl o-p-6">
 *   <p>Dessine les parcours et les tient a jour.</p>
 * </ProfileCard>
 *
 * @example
 * // Des initiales en guise de portrait, sans brillance.
 * <ProfileCard name="Nour Bensaid" subtitle="Ingenieure" avatar="NB" sheen={0} />
 */
export function ProfileCard({
  name,
  subtitle,
  avatar,
  children,
  tilt = 10,
  speed = 8,
  sheen = 0.35,
  tint = 'var(--o-palette-brand-500)',
  ...rest
}: ProfileCardProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const inner = useRef<HTMLDivElement | null>(null)
  const pointer = usePointerDamped({ host, speed, name: 'profil : pointeur' })
  ensureProfileRules()

  useEffect(() => {
    const card = inner.current
    if (host === null || card === null || reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let on = false

    const onEnter = (): void => {
      on = true
      host.setAttribute('data-o-profile-on', '')
    }
    const onLeave = (): void => {
      on = false
      host.removeAttribute('data-o-profile-on')
      // Le retour au repos est confie a la transition, pas a la boucle.
      card.style.transform = ''
    }

    const subscription = clock.subscribe(
      () => {
        if (!on) return
        const { x, y } = pointer.current
        // Le signe de X est inverse : pointer a droite enfonce le bord droit.
        card.style.transform = `rotateX(${(-y * tilt).toFixed(2)}deg) rotateY(${(x * tilt).toFixed(2)}deg)`
        card.style.setProperty('--o-profile-sx', `${(((x + 1) / 2) * 100).toFixed(1)}%`)
      },
      { priority: CLOCK_PRIORITY.render, name: 'profil' },
    )

    host.addEventListener('pointerenter', onEnter, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      subscription.unsubscribe()
      onLeave()
    }
  }, [host, reduced, tilt, pointer])

  const { className, style } = mergePresentation({}, rest)

  const portrait =
    typeof avatar === 'string' ? (
      // Le nom est deja dans la carte : l'image ne le repete pas.
      <img src={avatar} alt="" />
    ) : (
      avatar
    )

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={
        {
          ...style,
          '--o-profile-tint': tint,
          '--o-profile-sheen': `${String(sheen * 100)}%`,
          '--o-profile-sx': '50%',
          '--o-profile-lift': `${String(tilt * 2.4)}px`,
        } as CSSProperties
      }
      data-o-profile=""
    >
      <div ref={inner} data-o-profile-inner="">
        <div data-o-profile-head="">
          {portrait !== undefined && portrait !== null ? (
            <div data-o-profile-avatar="" aria-hidden="true">
              {portrait}
            </div>
          ) : null}
          <div>
            <p data-o-profile-name="">{name}</p>
            {subtitle !== undefined ? <p data-o-profile-subtitle="">{subtitle}</p> : null}
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
