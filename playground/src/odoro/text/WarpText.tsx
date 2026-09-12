/**
 * Deformation au defilement : la ligne se creuse puis se bombe en traversant
 * le champ.
 *
 * ## Le defilement commande une courbure, pas une position
 *
 * `scroll-float` fait deriver les mots et `scroll-reveal` les allume. Ici la
 * ligne garde sa place : ce que le defilement commande, c'est sa **forme**.
 * Quand le bloc est bas dans le champ, la ligne pend en chainette ; quand il
 * arrive au milieu de l'ecran, elle est parfaitement droite ; quand il monte
 * vers le haut, elle se bombe dans l'autre sens.
 *
 * Le point d'equilibre est donc le centre de l'ecran, la ou l'oeil se pose :
 * le texte est droit exactement au moment ou on le lit, et courbe le reste du
 * temps.
 *
 * ## Une seule variable ecrite par image
 *
 * La boucle du moteur ecrit `--o-wt-k` sur le conteneur, un nombre signe
 * entre moins un et un. Chaque lettre porte deux constantes calculees au
 * rendu — sa part de fleche et sa pente — et compose sa propre transformation
 * en `calc`. La courbe n'est jamais calculee en JavaScript puis distribuee :
 * c'est la meme valeur, lue avec deux coefficients differents par chacune.
 *
 * Une ligne de quarante caracteres coute donc exactement le meme travail par
 * image qu'une de cinq.
 *
 * ## La forme de la courbe
 *
 * La fleche suit `1 - u * u`, maximale au milieu et nulle aux extremites : c'est
 * l'arc le plus simple qui tienne par ses deux bouts. L'inclinaison suit la
 * pente de cette meme courbe, `-u`, pour que les lettres se couchent dans le
 * sens du trait au lieu de rester debout sur une ligne penchee — c'est ce
 * detail qui fait la difference entre une deformation et un simple
 * empilement de decalages.
 *
 * ## La ligne droite est la valeur par defaut
 *
 * `--o-wt-k` vaut zero dans la feuille : sans JavaScript, sans boucle, le
 * texte est droit et parfaitement lisible.
 *
 * ## Le decoupage est un artifice d'affichage
 *
 * Le texte complet figure une fois, d'un seul tenant ; les lettres sont
 * retirees de l'arbre d'accessibilite.
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
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

/** Proprietes propres au composant. */
export interface WarpTextOwnProps {
  /** Texte a deformer. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Fleche maximale de la courbe, en pixels. @defaultValue 28 */
  amplitude?: number
  /** Inclinaison maximale des lettres de bord, en degres. @defaultValue 6 */
  inclinaison?: number
  /** Course du reglage, en hauteurs de fenetre. @defaultValue 1 */
  course?: number
}

/** Toutes les proprietes. */
export type WarpTextProps = Customisable<WarpTextOwnProps, 'span'>

/** Espace insecable : une espace ordinaire s'ecrase dans un bloc en ligne. */
const NBSP = ' '

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-warp-text'

/** Pose la courbure, une fois par document. */
function ensureWarpRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Zero au repos : sans boucle, la ligne est droite. Voir l'en-tete.
    '[data-o-warp]{display:inline-block;--o-wt-k:0}',
    '[data-o-warp-letter]{',
    'display:inline-block;',
    'transform:translateY(calc(var(--o-wt-k) * var(--o-wt-b) * var(--o-wt-amp)))',
    ' rotate(calc(var(--o-wt-k) * var(--o-wt-t) * var(--o-wt-tilt)));',
    '}',
    // Sans mouvement, la ligne reste droite : c'est son etat de lecture.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-warp-letter]{transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Premier ancetre dont le contenu defile reellement, ou rien : la page sert. */
function ancetreDefilant(element: HTMLElement): HTMLElement | null {
  let noeud = element.parentElement
  while (noeud !== null) {
    const debord = getComputedStyle(noeud).overflowY
    if (
      (debord === 'auto' || debord === 'scroll') &&
      noeud.scrollHeight > noeud.clientHeight
    ) {
      return noeud
    }
    noeud = noeud.parentElement
  }
  return null
}

/**
 * Courbe une ligne de texte au fil du defilement.
 *
 * @example
 * <WarpText as="h2" className="o-text-5xl o-font-bold">
 *   La ligne se plie
 * </WarpText>
 *
 * @example
 * // Fleche marquee, lettres tres couchees, course courte.
 * <WarpText amplitude={64} inclinaison={14} course={0.5}>Elastique</WarpText>
 */
export function WarpText({
  children,
  as: Tag = 'span',
  amplitude = 28,
  inclinaison = 6,
  course = 1,
  ...rest
}: WarpTextProps): ReactElement {
  const { reduced } = useMotionState()
  const hote = useRef<HTMLElement | null>(null)

  ensureWarpRule()

  useEffect(() => {
    const element = hote.current
    if (element === null || reduced) return

    // L'ancetre est cherche une fois : il ne change pas pendant la vie du
    // composant, et le chercher a chaque image couterait pour rien.
    const defilant = ancetreDefilant(element)

    const abonnement = clock.subscribe(
      () => {
        const boite = element.getBoundingClientRect()
        const vueHaut = defilant === null ? 0 : defilant.getBoundingClientRect().top
        const vueHauteur = defilant === null ? window.innerHeight : defilant.clientHeight

        const centreBloc = boite.top + boite.height / 2
        const centreVue = vueHaut + vueHauteur / 2
        // Un demi-champ de course de chaque cote du centre : la ligne est
        // droite au milieu, pliee a fond aux bords.
        const portee = Math.max(1, (vueHauteur * course) / 2)
        const brut = (centreBloc - centreVue) / portee

        element.style.setProperty('--o-wt-k', Math.min(1, Math.max(-1, brut)).toFixed(4))
      },
      { name: 'deformation au defilement', priority: CLOCK_PRIORITY.input },
    )

    return () => {
      abonnement.unsubscribe()
      element.style.removeProperty('--o-wt-k')
    }
  }, [reduced, course, children])

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : le texte est la, droit, sans decoupage.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const lettres = [...children]
  const dernier = Math.max(1, lettres.length - 1)

  const styleRacine = {
    ...style,
    '--o-wt-amp': `${String(amplitude)}px`,
    '--o-wt-tilt': `${String(inclinaison)}deg`,
  } as CSSProperties

  return (
    <Tag {...rest} ref={hote} className={className} style={styleRacine} data-o-warp="">
      {/* Le texte complet, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {lettres.map((lettre, index) => {
          // Place de la lettre sur la ligne, de -1 a 1.
          const u = lettres.length < 2 ? 0 : (index / dernier) * 2 - 1
          return (
            <span
              key={`${lettre}-${String(index)}`}
              data-o-warp-letter=""
              style={
                {
                  // Fleche de l'arc, nulle aux bouts ; pente de ce meme arc,
                  // nulle au milieu. Voir l'en-tete du module.
                  '--o-wt-b': (1 - u * u).toFixed(4),
                  '--o-wt-t': (-u).toFixed(4),
                } as CSSProperties
              }
            >
              {/* Une espace ordinaire s'ecrase dans un bloc en ligne :
                  l'insecable garde sa largeur. */}
              {lettre === ' ' ? NBSP : lettre}
            </span>
          )
        })}
      </span>
    </Tag>
  )
}
