/**
 * L affichage d une vitrine, en pleine page.
 *
 * ## Pourquoi un chargeur maison plutot que la route paresseuse du routeur
 *
 * `<Route lazy>` associe un module a un chemin fixe. Ici le chemin porte un
 * parametre : cent modules derriere une seule route. Le composant `React.lazy`
 * est donc construit ici, une fois par vitrine, et conserve dans une table — en
 * reconstruire un a chaque rendu remonterait la page entiere a chaque image de
 * transition.
 *
 * ## Le bandeau
 *
 * Une vitrine se lit comme un site, pas comme une fiche : rien ne l entoure,
 * sauf un bandeau fin qui rappelle ou l on est, comment revenir, et qui laisse
 * reteinter le modele. Il se cale **sous** la barre de la documentation, qui
 * est fixe : colle a zero, il passerait dessous et disparaitrait.
 *
 * ## Les trois vues, et pourquoi elles vivent dans l adresse
 *
 * Le bandeau porte un interrupteur : **apercu**, **code**, **integrer**. La vue
 * est ecrite dans la barre d adresse plutot que dans un etat local, parce que
 * « regarde le code de celle-la » est un lien qu on envoie — et parce que le
 * retour arriere du navigateur doit ramener la vitrine, pas quitter la page.
 *
 * ## Pourquoi la palette vit ici
 *
 * Une vitrine n ecrit jamais sa couleur en dur : elle lit `--o-vitrine-*`. Ces
 * variables sont posees sur le conteneur, ici, ce qui fait de la reteinture une
 * affaire d un seul element — et permet de la changer sans rien remonter. Les
 * trois couleurs servent aussi au panneau d integration : la balise qu il
 * fabrique reprend ce qu on voit, pas ce qui etait la au depart.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowLeft, Palette as IconePalette } from '@odoro-cli/icons/outline'
import { Link, useParams, useSearchParams } from '@odoro-cli/libs/router'
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
import {
  CopierAdresse,
  PanneauCode,
  PanneauIntegration,
} from '../components/VitrineExport.jsx'
import { VITRINES, vitrineBySlug, type Vitrine } from '../vitrines/index.js'
import {
  couleursDeJetons,
  variablesDePalette,
  type Couleurs,
} from '../vitrines/palettes.js'

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

/** Les trois vues d une vitrine. */
const VUES = [
  { cle: '', etiquette: 'Aperçu' },
  { cle: 'code', etiquette: 'Code' },
  { cle: 'integrer', etiquette: 'Intégrer' },
] as const

/** La vue demandee par l adresse. */
type Vue = (typeof VUES)[number]['cle']

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

/** L interrupteur des trois vues. */
function ChoixVue({
  vue,
  onChange,
}: {
  readonly vue: Vue
  readonly onChange: (vue: Vue) => void
}): ReactElement {
  return (
    <div
      role="group"
      aria-label="Ce qu’on regarde du modèle"
      className="o-inline-flex o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-0.5"
    >
      {VUES.map((option) => {
        const actif = option.cle === vue
        return (
          <button
            key={option.cle}
            type="button"
            aria-pressed={actif}
            onClick={() => onChange(option.cle)}
            className={[
              'o-rounded-md o-px-2.5 o-py-1 o-text-sm o-cursor-pointer o-transition-colors',
              actif
                ? 'o-bg-zinc-900 dark:o-bg-zinc-100 o-text-white dark:o-text-zinc-900'
                : 'o-text-zinc-600 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-100',
            ].join(' ')}
          >
            {option.etiquette}
          </button>
        )
      })}
    </div>
  )
}

/** Le bandeau de retour, pose sous la barre de la documentation. */
function Bandeau({
  vitrine,
  couleurs,
  onCouleurs,
  vue,
  onVue,
}: {
  readonly vitrine: Vitrine
  readonly couleurs: Couleurs
  readonly onCouleurs: (couleurs: Couleurs) => void
  readonly vue: Vue
  readonly onVue: (vue: Vue) => void
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
      <span className="max-lg:o-hidden o-text-xs o-uppercase o-tracking-wider o-text-zinc-500 dark:o-text-zinc-400">
        {vitrine.metier}
      </span>

      <span className="o-ml-auto o-flex o-items-center o-gap-3">
        <ChoixVue vue={vue} onChange={onVue} />
        {/* La palette n a de sens que sur ce qui se regarde : devant une liste
            de fichiers, elle ne repeint rien. Elle reste devant l integration,
            ou elle decide de ce que la balise emporte. */}
        {vue !== 'code' && <ChoixCouleurs couleurs={couleurs} onChange={onCouleurs} />}
        {vue === 'integrer' && <CopierAdresse slug={vitrine.slug} />}
      </span>
    </div>
  )
}

/** La route d une vitrine. */
export function VitrineRoute(): ReactElement {
  const params = useParams()
  const [recherche, setRecherche] = useSearchParams()
  const vitrine = vitrineBySlug(String(params['slug'] ?? ''))
  const [couleurs, setCouleurs] = useState<Couleurs>(['#888888', '#888888', '#888888'])

  const demandee = recherche.get('vue')
  const vue: Vue = demandee === 'code' || demandee === 'integrer' ? demandee : ''

  // Les trois couleurs de depart sont celles de la fiche. Elles y sont ecrites
  // en jetons du systeme : il faut le document pour les resoudre, donc un effet
  // plutot qu une valeur initiale. Changer de vitrine remet les siennes — la
  // palette appartient au modele qu on regarde, pas a la session.
  useEffect(() => {
    if (vitrine === undefined) return
    setCouleurs(couleursDeJetons(vitrine.palette))
  }, [vitrine])

  if (vitrine === undefined) {
    return (
      <div className="o-mx-auto o-max-w-2xl o-px-6 o-py-24 o-text-center">
        <h1 className="o-text-2xl o-font-bold o-tracking-tight">Vitrine introuvable</h1>
        <p className="o-mt-3 o-text-zinc-600 dark:o-text-zinc-400">
          Ce modèle n’existe pas — la bibliothèque en compte {VITRINES.length}.
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
      <Bandeau
        vitrine={vitrine}
        couleurs={couleurs}
        onCouleurs={setCouleurs}
        vue={vue}
        onVue={(suivante) => {
          setRecherche((courant) => {
            if (suivante === '') courant.delete('vue')
            else courant.set('vue', suivante)
            return courant
          })
        }}
      />

      {vue === 'code' && <PanneauCode vitrine={vitrine} />}
      {vue === 'integrer' && <PanneauIntegration vitrine={vitrine} couleurs={couleurs} />}

      {vue === '' && (
        <Suspense
          fallback={
            <div className="o-flex o-min-h-96 o-items-center o-justify-center o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
              Chargement de la vitrine...
            </div>
          }
        >
          {/* Repere de cadrage : ce qui suit est le site, et rien de la
              documentation. Les apercus de la galerie sont pris sur cet
              element, qui porte aussi la palette du modele. */}
          <div data-o-vitrine="" style={variablesDePalette(couleurs)}>
            <Page />
          </div>
        </Suspense>
      )}
    </div>
  )
}
