/**
 * Conteneur qui se redresse et s'agrandit en entrant dans le champ.
 *
 * ## Ce que la bascule raconte
 *
 * Le cadre arrive incline, vu de dessus, comme un objet pose sur une table ;
 * il se redresse a mesure qu'il monte, jusqu'a faire face. C'est une facon de
 * dire « voici la chose » sans l'ecrire, et elle ne tient qu'a une condition :
 * l'inclinaison doit **finir**. Un cadre qui reste de biais est une decoration ;
 * un cadre qui se redresse est une presentation.
 *
 * ## Une perspective sur le parent, jamais sur l'element
 *
 * `perspective` posee sur l'element transforme lui-meme ne produit pas la meme
 * chose que sur son parent : le point de fuite suit alors l'element au lieu de
 * rester celui de la scene, et l'inclinaison se deforme quand l'element bouge.
 * C'est la cause la plus frequente d'une bascule qui « glisse » sans qu'on
 * sache pourquoi.
 *
 * ## Rien n'est rendu pendant la course
 *
 * La progression est lue dans la boucle unique, a la priorite des mesures, et
 * ecrite dans une variable CSS. La rotation et l'echelle sont des
 * transformations : le compositeur les applique seul, sans recalcul de mise en
 * page ni rendu React.
 *
 * ## Ce que le mouvement reduit donne
 *
 * Le cadre a plat, a sa taille pleine — l'etat d'arrivee. Fige incline, il
 * cacherait une partie de son contenu par la perspective, ce qui serait un
 * defaut et non une preference respectee.
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

/** Proprietes propres au composant. */
export interface ContainerScrollOwnProps {
  /** Ce que le cadre contient. */
  children: ReactNode
  /** Titre affiche au-dessus du cadre. */
  title?: ReactNode
  /** Phrase sous le titre. */
  subtitle?: ReactNode
  /** Inclinaison de depart, en degres. @defaultValue 22 */
  rotation?: number
  /** Echelle de depart, de 0 a 1. @defaultValue 0.86 */
  scale?: number
  /** Nom de la section, annonce aux technologies d'assistance. */
  label?: string
}

/** Toutes les proprietes. */
export type ContainerScrollProps = Customisable<ContainerScrollOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-container-scroll'

/** Pose les regles du cadre, une fois par document. */
function ensureContainerRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cscroll]{--o-cscroll-reste:1}',
    // La perspective appartient a la scene, pas a l'objet : posee sur
    // l'element transforme, le point de fuite le suivrait.
    '[data-o-cscroll-scene]{perspective:1000px}',
    '[data-o-cscroll-cadre]{',
    'transform:rotateX(calc(var(--o-cscroll-angle) * var(--o-cscroll-reste)))',
    ' scale(calc(1 - (1 - var(--o-cscroll-echelle)) * var(--o-cscroll-reste)));',
    'transform-origin:center top;will-change:transform}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cscroll]{--o-cscroll-reste:0}',
    '[data-o-cscroll-cadre]{will-change:auto}}',
  ].join('')
  document.head.append(style)
}

/**
 * Trouve le conteneur qui defile autour d'un element.
 *
 * Cherche une seule fois, au montage : `getComputedStyle` force un calcul de
 * style, et le repeter par image couterait plus que la bascule elle-meme.
 */
function conteneurDefilant(element: Element): HTMLElement | null {
  let parent = element.parentElement
  while (parent !== null) {
    const debordement = getComputedStyle(parent).overflowY
    if (debordement === 'auto' || debordement === 'scroll') return parent
    parent = parent.parentElement
  }
  return null
}

/**
 * Un cadre qui se redresse au defilement.
 *
 * @example
 * <ContainerScroll title="L atelier" subtitle="Chaque reglage est une prop.">
 *   <img src="/atelier.png" alt="" className="o-size-full o-object-cover" />
 * </ContainerScroll>
 */
export function ContainerScroll({
  children,
  title,
  subtitle,
  rotation = 22,
  scale = 0.86,
  label,
  ...rest
}: ContainerScrollProps): ReactElement {
  const { reduced } = useMotionState()
  const [hote, setHote] = useState<HTMLElement | null>(null)
  const dernier = useRef(-1)

  ensureContainerRules()

  useEffect(() => {
    if (hote === null || reduced) return

    const conteneur = conteneurDefilant(hote)

    const subscription = clock.subscribe(
      () => {
        const boite = hote.getBoundingClientRect()
        if (boite.height === 0) return

        const champ =
          conteneur === null
            ? { haut: 0, hauteur: window.innerHeight }
            : {
                haut: conteneur.getBoundingClientRect().top,
                hauteur: conteneur.clientHeight,
              }

        // Zero quand le haut de la section atteint le bas du champ, un quand la
        // section y est entree tout entiere : la bascule finit donc au moment
        // ou l'on regarde le cadre, et non apres.
        const p = Math.min(
          1,
          Math.max(0, (champ.haut + champ.hauteur - boite.top) / boite.height),
        )

        const centieme = Math.round(p * 100)
        if (centieme === dernier.current) return
        dernier.current = centieme
        hote.style.setProperty('--o-cscroll-reste', (1 - centieme / 100).toFixed(2))
      },
      { name: 'cadre au defilement', priority: CLOCK_PRIORITY.layout },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [hote, reduced])

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-8 o-py-12' },
    rest,
  )

  return (
    <section
      {...rest}
      ref={setHote}
      aria-label={label}
      data-o-cscroll=""
      className={className}
      style={
        {
          ...style,
          '--o-cscroll-angle': `${String(rotation)}deg`,
          '--o-cscroll-echelle': String(scale),
        } as CSSProperties
      }
    >
      {(title !== undefined || subtitle !== undefined) && (
        <div className="o-mx-auto o-flex o-max-w-2xl o-flex-col o-gap-3 o-px-6 o-text-center">
          {title !== undefined && (
            <h2
              className="o-text-3xl o-font-bold o-tracking-tight o-text-balance"
              style={{ color: 'var(--o-theme-fg)' }}
            >
              {title}
            </h2>
          )}
          {subtitle !== undefined && (
            <p className="o-text-sm" style={{ color: 'var(--o-theme-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div data-o-cscroll-scene="">
        <div
          data-o-cscroll-cadre=""
          className="o-overflow-hidden o-rounded-2xl o-p-2 o-shadow-xl"
          style={{
            backgroundColor: 'var(--o-theme-surface)',
            border: '1px solid var(--o-theme-line)',
          }}
        >
          {children}
        </div>
      </div>
    </section>
  )
}
