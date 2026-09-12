/**
 * L affichage d une vitrine, en pleine page.
 *
 * ## Pourquoi un chargeur maison plutot que la route paresseuse du routeur
 *
 * `<Route lazy>` associe un module a un chemin fixe. Ici le chemin porte un
 * parametre : vingt-quatre modules derriere une seule route. Le composant
 * `React.lazy` est donc construit ici, une fois par vitrine, et conserve dans
 * une table — en reconstruire un a chaque rendu remonterait la page entiere a
 * chaque image de transition.
 *
 * ## Le bandeau
 *
 * Une vitrine se lit comme un site, pas comme une fiche : rien ne l entoure,
 * sauf un bandeau fin qui rappelle ou l on est, comment revenir, et qui laisse
 * reteinter le modele. Il se cale **sous** la barre de la documentation, qui
 * est fixe : colle a zero, il passerait dessous et disparaitrait.
 *
 * ## Pourquoi la palette vit ici
 *
 * Une vitrine n ecrit jamais sa couleur en dur : elle lit `--o-vitrine-*`. Ces
 * variables sont posees sur le conteneur, ici, ce qui fait de la reteinture une
 * affaire d un seul element — et permet de la changer sans rien remonter.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowLeft, Palette as IconePalette } from '@odoro-cli/icons/filaire'
import { Link, useParams } from '@odoro-cli/libs/router'
import {
  lazy,
  Suspense,
  useEffect,
  useState,
  type ComponentType,
  type LazyExoticComponent,
  type ReactElement,
} from 'react'

import { HEADER_OFFSET } from '../components/Shell.jsx'
import { VITRINES, vitrineBySlug, type Vitrine } from '../vitrines/index.js'
import { variablesDePalette, type Couleurs } from '../vitrines/palettes.js'

/** Composants deja construits, indexes par segment. */
const CHARGES = new Map<string, LazyExoticComponent<ComponentType>>()

/** Le composant d une vitrine, construit une seule fois. */
function composant(vitrine: Vitrine): LazyExoticComponent<ComponentType> {
  const deja = CHARGES.get(vitrine.slug)
  if (deja !== undefined) return deja

  const fait = lazy(vitrine.charger)
  CHARGES.set(vitrine.slug, fait)
  return fait
}

/**
 * Resout une couleur du systeme en hexadecimal.
 *
 * Un selecteur de couleur natif n accepte que `#rrggbb` : les jetons de la
 * palette, eux, sont ecrits en `oklch`. Le navigateur fait la conversion, par
 * un canevas d un pixel — une expression reguliere ne saurait pas la faire.
 */
function versHexadecimal(couleur: string): string {
  if (/^#[0-9a-f]{6}$/i.test(couleur)) return couleur
  if (typeof document === 'undefined') return '#888888'
  const toile = document.createElement('canvas')
  toile.width = 1
  toile.height = 1
  const pot = toile.getContext('2d', { willReadFrequently: true })
  if (pot === null) return '#888888'

  // `fillStyle` rend la chaine telle qu on l a donnee quand elle n est pas
  // hexadecimale : lire `fillStyle` ne convertit donc rien. Peindre le pixel,
  // puis le relire, oui — c est le navigateur qui fait la conversion.
  pot.fillStyle = '#000000'
  pot.fillStyle = couleur
  pot.fillRect(0, 0, 1, 1)
  const [r, v, b] = pot.getImageData(0, 0, 1, 1).data
  const deux = (n: number): string => n.toString(16).padStart(2, '0')
  return `#${deux(r ?? 0)}${deux(v ?? 0)}${deux(b ?? 0)}`
}

/**
 * Les trois couleurs de la vitrine, modifiables.
 *
 * Ce sont les memes pastilles qu avant — la palette annoncee par la fiche —
 * mais chacune ouvre un selecteur, et ce qu on y choisit repeint le modele.
 */
function ChoixCouleurs({
  couleurs,
  onChange,
}: {
  readonly couleurs: Couleurs
  readonly onChange: (couleurs: Couleurs) => void
}): ReactElement {
  const ROLES = ['Accent', 'Couleur secondaire', 'Couleur tierce'] as const

  return (
    <div className="o-flex o-items-center o-gap-2">
      <Icon
        icon={IconePalette}
        size={15}
        className="max-sm:o-hidden o-text-zinc-500 dark:o-text-zinc-400"
        aria-hidden="true"
      />
      {couleurs.map((couleur, rang) => (
        <label
          key={rang}
          title={`${ROLES[rang] ?? 'Couleur'} — cliquez pour changer`}
          className="o-relative o-inline-flex o-size-5 o-shrink-0 o-overflow-hidden o-cursor-pointer o-rounded-full o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 hover:o-scale-110 o-transition-transform"
          style={{ backgroundColor: couleur }}
        >
          <span className="o-sr-only">{ROLES[rang] ?? 'Couleur'}</span>
          {/* Le selecteur natif est le seul qui ouvre la palette du systeme ;
              il est rendu invisible et couvre la pastille, qui lui sert de
              surface. Sa taille est imposee : un champ de ce type est un
              element remplace, dont la largeur propre l emporte sur un simple
              calage — sans cela il depasse et fait defiler la page de cote. */}
          <input
            type="color"
            value={couleur}
            onChange={(evenement) => {
              const suite = [...couleurs] as [string, string, string]
              suite[rang] = evenement.target.value
              onChange(suite)
            }}
            className="o-absolute o-inset-0 o-cursor-pointer o-opacity-0"
            style={{ width: '100%', height: '100%' }}
            aria-label={ROLES[rang] ?? 'Couleur'}
          />
        </label>
      ))}
    </div>
  )
}

/** Le bandeau de retour, pose sous la barre de la documentation. */
function Bandeau({
  vitrine,
  couleurs,
  onCouleurs,
}: {
  readonly vitrine: Vitrine
  readonly couleurs: Couleurs
  readonly onCouleurs: (couleurs: Couleurs) => void
}): ReactElement {
  return (
    <div
      data-o-bandeau=""
      // La barre de la documentation est fixe et haute de `HEADER_OFFSET` :
      // sans ce decalage, le bandeau colle passerait dessous.
      style={{ top: HEADER_OFFSET }}
      className="o-sticky o-z-40 o-flex o-flex-wrap o-items-center o-gap-x-3 o-gap-y-2 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-950 o-px-4 o-py-2 o-text-sm md:o-px-6"
    >
      <Link
        to="/templates"
        className="o-inline-flex o-items-center o-gap-1.5 o-font-medium o-no-underline o-text-zinc-600 dark:o-text-zinc-300 hover:o-text-brand-600 dark:hover:o-text-brand-400 o-transition-colors"
      >
        <Icon icon={ArrowLeft} size={16} />
        Templates
      </Link>
      <span className="o-text-zinc-300 dark:o-text-zinc-700" aria-hidden="true">
        /
      </span>
      <span className="o-font-semibold o-tracking-tight">{vitrine.titre}</span>
      <span className="max-md:o-hidden o-text-xs o-uppercase o-tracking-wider o-text-zinc-500 dark:o-text-zinc-400">
        {vitrine.metier}
      </span>

      <span className="o-ml-auto">
        <ChoixCouleurs couleurs={couleurs} onChange={onCouleurs} />
      </span>
    </div>
  )
}

/** La route d une vitrine. */
export function VitrineRoute(): ReactElement {
  const params = useParams()
  const vitrine = vitrineBySlug(String(params['slug'] ?? ''))
  const [couleurs, setCouleurs] = useState<Couleurs>(['#888888', '#888888', '#888888'])

  // Les trois couleurs de depart sont celles de la fiche. Elles y sont ecrites
  // en jetons du systeme : il faut le document pour les resoudre, donc un effet
  // plutot qu une valeur initiale. Changer de vitrine remet les siennes — la
  // palette appartient au modele qu on regarde, pas a la session.
  useEffect(() => {
    if (vitrine === undefined) return
    const racine = getComputedStyle(document.documentElement)
    const lues = vitrine.palette.map((jeton) =>
      versHexadecimal(racine.getPropertyValue(jeton).trim()),
    )
    setCouleurs([lues[0] ?? '#888888', lues[1] ?? '#888888', lues[2] ?? '#888888'])
  }, [vitrine])

  if (vitrine === undefined) {
    return (
      <div className="o-mx-auto o-max-w-2xl o-px-6 o-py-24 o-text-center">
        <h1 className="o-text-2xl o-font-bold o-tracking-tight">Vitrine introuvable</h1>
        <p className="o-mt-3 o-text-zinc-600 dark:o-text-zinc-400">
          Ce modele n existe pas — la bibliotheque en compte {VITRINES.length}.
        </p>
        <Link to="/templates" className="lien o-mt-6 o-inline-block">
          Revenir aux templates
        </Link>
      </div>
    )
  }

  const Page = composant(vitrine)

  return (
    <div className="o-min-h-screen">
      <Bandeau vitrine={vitrine} couleurs={couleurs} onCouleurs={setCouleurs} />
      <Suspense
        fallback={
          <div className="o-flex o-min-h-96 o-items-center o-justify-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            Chargement de la vitrine...
          </div>
        }
      >
        {/* Repere de cadrage : ce qui suit est le site, et rien de la
            documentation. Les apercus de la galerie sont pris sur cet element,
            qui porte aussi la palette du modele. */}
        <div data-o-vitrine="" style={variablesDePalette(couleurs)}>
          <Page />
        </div>
      </Suspense>
    </div>
  )
}
