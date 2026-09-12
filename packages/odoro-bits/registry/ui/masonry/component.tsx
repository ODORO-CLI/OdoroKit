/**
 * Maconnerie : une galerie en colonnes de hauteurs libres, dont les vignettes
 * montent a leur place au fur et a mesure qu'on descend.
 *
 * ## Les colonnes sont celles du navigateur
 *
 * Une maconnerie ecrite a la main mesure chaque vignette, choisit la colonne
 * la plus courte, et pose tout en absolu — puis recommence a chaque
 * redimensionnement, a chaque image chargee, et se trompe tant qu'une image
 * n'a pas sa taille. `columns` fait le meme partage sans une seule mesure,
 * et le refait tout seul quand la largeur change.
 *
 * Le prix a payer est l'ordre de lecture : la coulee descend colonne par
 * colonne, comme un journal, et non ligne par ligne. C'est acceptable pour
 * une galerie d'images — l'oeil balaie — et cela ne l'est pas pour un texte
 * suivi. La documentation le dit plutot que de le cacher.
 *
 * ## La montee est liberee par un attribut, pas par un rendu
 *
 * Un observateur unique surveille toutes les vignettes et pose un attribut
 * sur celle qui entre. Passer par l'etat ferait rerendre la galerie entiere
 * a chaque vignette croisee — sur cinquante images, cinquante rendus pour un
 * effet purement visuel.
 *
 * Le retard vient du rang de la vignette **dans sa rangee**, pas de son rang
 * global : sur une galerie longue, un retard global finirait a plusieurs
 * secondes, et les dernieres vignettes arriveraient apres qu'on les a
 * depassees.
 *
 * ## Une vignette n'est une cible que si elle mene quelque part
 *
 * Sans `onSelect`, chaque vignette est une `figure` : rien a activer, rien
 * dans l'ordre de tabulation, et le lecteur d'ecran annonce une image avec
 * son texte de remplacement. Avec `onSelect`, la meme figure vit dans un
 * bouton. Un bouton sans action est pire qu'une image : il promet une suite
 * qui n'existe pas.
 *
 * ## Mouvement reduit
 *
 * Les vignettes sont a leur place finale des le premier rendu, et aucun
 * observateur n'est cree.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** Une image de la galerie. */
export interface MasonryItem {
  /** Source de l'image. */
  readonly src: string
  /** Texte de remplacement, obligatoire : c'est le contenu, pas une decoration. */
  readonly alt: string
  /** Legende affichee sous l'image. */
  readonly caption?: string
}

/** Proprietes propres au composant. */
export interface MasonryOwnProps {
  /** Les images, dans l'ordre de lecture. */
  items: readonly MasonryItem[]
  /** Nom de la galerie pour les lecteurs d'ecran. */
  label: string
  /** Appele au clic ou a Entree sur une vignette. */
  onSelect?: (src: string) => void
  /** Nombre maximal de colonnes. @defaultValue 3 */
  columns?: number
  /** Largeur minimale d'une colonne, en pixels. @defaultValue 200 */
  minWidth?: number
  /** Ecart entre deux vignettes, en pixels. @defaultValue 16 */
  gap?: number
  /** Retard ajoute d'une colonne a la suivante, en millisecondes. @defaultValue 90 */
  stagger?: number
}

/** Toutes les proprietes. */
export type MasonryProps = Customisable<MasonryOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-masonry'

/** Pose les colonnes, la vignette et sa montee, une fois par document. */
function ensureMasonryRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // `columns` prend une largeur minimale et un nombre maximal : le navigateur
    // en pose autant qu'il en tient, sans requete de media a ecrire.
    '[data-o-masonry]{',
    'columns:var(--o-masonry-min) var(--o-masonry-count);',
    'column-gap:var(--o-masonry-gap);',
    '}',
    '[data-o-masonry]>[data-o-masonry-case]{',
    'break-inside:avoid;display:block;margin:0 0 var(--o-masonry-gap)',
    '}',
    '[data-o-masonry-tuile]{',
    'display:block;width:100%;margin:0;padding:0;border:0;',
    'font:inherit;color:inherit;text-align:start;',
    'background:var(--o-theme-surface);border-radius:0.8rem;overflow:hidden;',
    'box-shadow:0 0 0 1px var(--o-theme-line);',
    '}',
    'button[data-o-masonry-tuile]{cursor:pointer}',
    'button[data-o-masonry-tuile]:is(:hover,:focus-visible){',
    'box-shadow:0 0 0 2px var(--o-masonry-accent);',
    '}',
    'button[data-o-masonry-tuile]:focus-visible{outline:2px solid var(--o-masonry-accent);outline-offset:3px}',
    '[data-o-masonry-tuile] img{display:block;width:100%;height:auto}',
    '[data-o-masonry-tuile] figcaption{',
    'padding:0.5rem 0.7rem 0.6rem;font-size:0.8125em;line-height:1.35;color:var(--o-theme-muted);',
    '}',
    // Retenue avant le passage, liberee par l'attribut que pose l'observateur.
    '[data-o-masonry][data-o-masonry-anime] [data-o-masonry-case]{',
    'opacity:0;translate:0 20px;',
    'transition:opacity var(--o-duration-slower) var(--o-ease-entrance),',
    'translate var(--o-duration-slower) var(--o-ease-entrance);',
    'transition-delay:calc(var(--o-masonry-rang) * var(--o-masonry-stagger));',
    '}',
    '[data-o-masonry][data-o-masonry-anime] [data-o-masonry-case][data-o-masonry-vu]{',
    'opacity:1;translate:none;',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-masonry] [data-o-masonry-case]{opacity:1;translate:none;transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Galerie en maconnerie, dont les vignettes montent a l'arrivee.
 *
 * @example
 * <Masonry
 *   label="Reportage a Lisbonne"
 *   items={[
 *     { src: '/photos/toits.jpg', alt: 'Toits de tuiles au-dessus du fleuve' },
 *     { src: '/photos/tram.jpg', alt: 'Tramway jaune dans une rue en pente' },
 *   ]}
 * />
 *
 * @example
 * // Quatre colonnes etroites, et un clic qui ouvre la visionneuse de la page.
 * <Masonry label="Archives" items={photos} columns={4} minWidth={160} onSelect={ouvrir} />
 */
export function Masonry({
  items,
  label,
  onSelect,
  columns = 3,
  minWidth = 200,
  gap = 16,
  stagger = 90,
  ...rest
}: MasonryProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLDivElement | null>(null)
  ensureMasonryRules()

  useEffect(() => {
    // En mouvement reduit, les vignettes sont deja a leur place : observer
    // reviendrait a payer un observateur pour ne rien declencher.
    if (reduced) return
    const racine = host.current
    if (racine === null) return

    const cases = Array.from(
      racine.querySelectorAll<HTMLElement>('[data-o-masonry-case]'),
    )

    // Sans observateur — navigateur ancien, environnement de test — on montre.
    // Une galerie qui reste invisible est un defaut visible ; une galerie qui
    // arrive sans monter ne se remarque pas.
    if (typeof IntersectionObserver === 'undefined') {
      for (const element of cases) element.setAttribute('data-o-masonry-vu', '')
      return
    }

    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (!entree.isIntersecting) continue
          entree.target.setAttribute('data-o-masonry-vu', '')
          observateur.unobserve(entree.target)
        }
      },
      { threshold: 0.15 },
    )
    for (const element of cases) observateur.observe(element)

    return () => {
      observateur.disconnect()
    }
  }, [reduced, items])

  const { className, style } = mergePresentation({}, rest)
  const parRangee = Math.max(1, Math.round(columns))

  return (
    <div
      {...rest}
      ref={host}
      role="list"
      aria-label={label}
      data-o-masonry=""
      data-o-masonry-anime={reduced ? undefined : ''}
      className={className}
      style={
        {
          '--o-masonry-accent': 'var(--o-palette-brand-500)',
          '--o-masonry-count': parRangee,
          '--o-masonry-min': `${String(minWidth)}px`,
          '--o-masonry-gap': `${String(gap)}px`,
          '--o-masonry-stagger': `${String(stagger)}ms`,
          ...style,
        } as CSSProperties
      }
    >
      {items.map((item, index) => {
        const figure = (
          <>
            <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
            {item.caption === undefined ? null : <figcaption>{item.caption}</figcaption>}
          </>
        )

        return (
          <div
            key={item.src}
            role="listitem"
            data-o-masonry-case=""
            // Le rang dans la rangee, pas le rang global : voir l'en-tete.
            style={{ '--o-masonry-rang': index % parRangee } as CSSProperties}
          >
            {onSelect === undefined ? (
              <figure data-o-masonry-tuile="">{figure}</figure>
            ) : (
              <button
                type="button"
                data-o-masonry-tuile=""
                onClick={() => {
                  onSelect(item.src)
                }}
              >
                <figure style={{ margin: 0 }}>{figure}</figure>
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
