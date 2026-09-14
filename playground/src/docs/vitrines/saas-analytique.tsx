/**
 * Coteau — analytique produit.
 *
 * ## Le parti pris : le produit se redresse devant vous
 *
 * Une page de logiciel qui commence par une phrase demande qu on la croie.
 * Celle-ci ouvre sur une phrase — mais courte, en tres gros, sur une nappe
 * pastel qui derive — puis fait **monter le produit** : le tableau de bord
 * arrive incline, comme pose sur une table, et se redresse a mesure qu on
 * defile, jusqu a faire face. C est la signature de la page.
 *
 * Ensuite, une mosaique de tuiles inegales — la ou une grille de cartes
 * egales dirait douze fois rien — puis trois anneaux pour les seuls chiffres
 * qui comptent, les tarifs avec leur calculateur, et un ecran vide avec un
 * seul bouton aimante. Le pied est fixe derriere la page, et se decouvre a
 * la fin.
 *
 * ## Ce que la page fait, et non ce qu elle montre
 *
 * Trois mecanismes fonctionnent reellement : le tableau de bord reagit a un
 * choix de periode ; le calculateur convertit un volume mensuel d evenements
 * en cout pour les trois paliers a la fois ; le comparatif se filtre par
 * famille et sait masquer les lignes ou les trois colonnes disent la meme
 * chose.
 *
 * ## La palette
 *
 * Rien n est ecrit en indigo. La vitrine lit `--o-vitrine-*`, l accent que la
 * barre pose sur son conteneur, et n emploie que des neutres de theme pour le
 * reste. `ENCRE` tire l accent vers l encre du theme : elle fonce sur fond
 * clair, s eclaircit sur fond sombre.
 *
 * ## Le fond
 *
 * Aucune scene exclusive : une nappe de degrade en CSS derriere l ouverture et
 * le pied, et le globe filaire dans une tuile de la mosaique — la ou il dit ce
 * que la tuile dit, une donnee posee dans des regions nommees.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import {
  ArrowRight,
  Check,
  Clock,
  Database,
  Globe,
  LineChart,
  Lock,
  TrendingDown,
  TrendingUp,
  Users,
} from '@odoro-cli/icons/filaire'
import { useMotionState } from '@odoro-cli/engine'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react'

import { GlobeMesh } from '@/odoro/background/GlobeMesh.jsx'
import { ComparisonTable } from '@/odoro/section/ComparisonTable.jsx'
import { ContainerScroll } from '@/odoro/section/ContainerScroll.jsx'
import { PricingTiers } from '@/odoro/section/PricingTiers.jsx'
import { SpotlightText } from '@/odoro/text/SpotlightText.jsx'
import { ProgressRing } from '@/odoro/ui/ProgressRing.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, aplat, encre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreGelule,
  CHROME,
  Coin,
  Encadre,
  Etiquette,
  Indice,
  Logos,
  Manifeste,
  Porte,
  Surgit,
  usePolices,
} from './marche.jsx'
import { Aimant, Nappe, PiedColle } from './scene.jsx'

/** Le filet de la page : c est lui qui dessine toute la grille. */
const GRILLE = 'color-mix(in oklab, currentColor 18%, transparent)'

/**
 * L encre d accent, sur un fond de theme.
 *
 * Une nuance fixe ne peut pas convenir a toute couleur choisie : l indigo 700 se
 * lit sur du blanc, le lime 700 aussi, mais le lime 400 non — et en theme
 * sombre c est l inverse. Melanger l accent a l encre du theme resout les deux
 * cas d un coup.
 */
const ENCRE = encre()

/** L aplat d accent des jauges et des pastilles. */
const VOILE = accentDoux(500, 14)

/** L aplat d accent d une cellule mise en avant. */
const VOILE_FORT = accentDoux(500, 22)

/** La classe des valeurs : chasse fixe, chiffres alignes. */
const VALEUR = 'o-font-mono o-tabular-nums'

/** L etiquette d un champ du tableau de bord. */
const ETIQUETTE =
  'o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-600 dark:o-text-zinc-400'

/** Les clients cites dans la bande de logos. */
const CLIENTS: readonly string[] = [
  'Vallonis',
  'Bureau Nord',
  'Trame',
  'Aubier',
  'Cheval Blanc',
  'Ligne Claire',
  'Sillon',
  'Meunier & Fils',
]

/** Les liens de la gelule. */
const LIENS = [
  ['#produit', 'Produit'],
  ['#mosaique', 'Lectures'],
  ['#tarifs', 'Tarifs'],
] as const

/* ------------------------------------------------------------------------ */
/*                          Le tableau de bord                              */
/* ------------------------------------------------------------------------ */

/** Une marche d entonnoir. */
interface Marche {
  readonly etape: string
  readonly part: number
}

/** Un indicateur du panneau. */
interface Bloc {
  readonly titre: string
  readonly valeur: string
  readonly ecart: string
  readonly hausse: boolean
  readonly courbe: readonly number[]
}

/** Les trois fenetres que le panneau sait lire. */
const PERIODES = [
  { id: '7j', libelle: '7 jours', fenetre: '7 jours glissants' },
  { id: '30j', libelle: '30 jours', fenetre: '30 jours glissants' },
  { id: '12s', libelle: '12 semaines', fenetre: '12 semaines glissantes' },
] as const

/** L identifiant d une fenetre. */
type Periode = (typeof PERIODES)[number]['id']

/** Ce que le panneau affiche, pour chacune des trois fenetres. */
const DONNEES: Readonly<
  Record<
    Periode,
    {
      readonly blocs: readonly Bloc[]
      readonly entonnoir: readonly Marche[]
      /** Nombre de semaines de retention lisibles a cette echelle. */
      readonly semaines: number
      readonly note: string
    }
  >
> = {
  '7j': {
    blocs: [
      {
        titre: 'Inscriptions',
        valeur: '284',
        ecart: '+ 9 %',
        hausse: true,
        courbe: [10, 12, 11, 15, 14, 19, 22],
      },
      {
        titre: 'Activation',
        valeur: '39 %',
        ecart: '+ 1 pt',
        hausse: true,
        courbe: [15, 14, 16, 15, 18, 17, 20],
      },
      {
        titre: 'Retention S4',
        valeur: '43 %',
        ecart: '− 2 pts',
        hausse: false,
        courbe: [21, 22, 20, 21, 19, 19, 17],
      },
      {
        titre: 'Revenu recurrent',
        valeur: '82 400 EUR',
        ecart: '+ 1 %',
        hausse: true,
        courbe: [18, 19, 19, 20, 21, 21, 23],
      },
    ],
    entonnoir: [
      { etape: 'Page d accueil', part: 100 },
      { etape: 'Formulaire ouvert', part: 71 },
      { etape: 'Compte cree', part: 44 },
      { etape: 'Source branchee', part: 29 },
      { etape: 'Premier paiement', part: 17 },
    ],
    semaines: 3,
    note: 'Sept jours glissants, arretes hier a minuit. Le revenu recurrent bouge peu a cette echelle : il se lit mieux sur trente jours.',
  },
  '30j': {
    blocs: [
      {
        titre: 'Inscriptions',
        valeur: '1 102',
        ecart: '+ 14 %',
        hausse: true,
        courbe: [9, 11, 12, 15, 16, 20, 24],
      },
      {
        titre: 'Activation',
        valeur: '40 %',
        ecart: '+ 2 pts',
        hausse: true,
        courbe: [14, 14, 16, 16, 18, 19, 21],
      },
      {
        titre: 'Retention S4',
        valeur: '44 %',
        ecart: '± 0 pt',
        hausse: false,
        courbe: [20, 20, 20, 20, 19, 20, 20],
      },
      {
        titre: 'Revenu recurrent',
        valeur: '82 400 EUR',
        ecart: '+ 4 %',
        hausse: true,
        courbe: [12, 13, 14, 16, 18, 20, 22],
      },
    ],
    entonnoir: [
      { etape: 'Page d accueil', part: 100 },
      { etape: 'Formulaire ouvert', part: 69 },
      { etape: 'Compte cree', part: 42 },
      { etape: 'Source branchee', part: 28 },
      { etape: 'Premier paiement', part: 18 },
    ],
    semaines: 5,
    note: 'Trente jours glissants. La retention a quatre semaines ne bouge pas : c est la fenetre ou elle se stabilise.',
  },
  '12s': {
    blocs: [
      {
        titre: 'Inscriptions',
        valeur: '1 284',
        ecart: '+ 12 %',
        hausse: true,
        courbe: [8, 12, 10, 16, 14, 22, 26],
      },
      {
        titre: 'Activation',
        valeur: '41 %',
        ecart: '+ 3 pts',
        hausse: true,
        courbe: [14, 13, 16, 15, 19, 18, 22],
      },
      {
        titre: 'Retention S4',
        valeur: '44 %',
        ecart: '− 1 pt',
        hausse: false,
        courbe: [20, 21, 19, 20, 18, 19, 17],
      },
      {
        titre: 'Revenu recurrent',
        valeur: '82 400 EUR',
        ecart: '+ 6 %',
        hausse: true,
        courbe: [10, 12, 13, 15, 18, 20, 24],
      },
    ],
    entonnoir: [
      { etape: 'Page d accueil', part: 100 },
      { etape: 'Formulaire ouvert', part: 68 },
      { etape: 'Compte cree', part: 41 },
      { etape: 'Source branchee', part: 27 },
      { etape: 'Premier paiement', part: 19 },
    ],
    semaines: 7,
    note: 'Douze semaines glissantes : la seule fenetre ou une cohorte a eu le temps de decrocher, et donc la seule ou la retention se juge.',
  },
}

/** L entonnoir de reference, celui des tuiles. */
const ENTONNOIR: readonly Marche[] = DONNEES['12s'].entonnoir

/** La matrice de retention : une ligne par cohorte, une case par semaine. */
const RETENTION: readonly (readonly number[])[] = [
  [100, 62, 51, 44, 40, 38, 37],
  [100, 64, 54, 47, 43, 41, 0],
  [100, 61, 49, 43, 39, 0, 0],
  [100, 67, 57, 50, 0, 0, 0],
  [100, 70, 59, 0, 0, 0, 0],
  [100, 72, 0, 0, 0, 0, 0],
]

/** Les semaines de depart des six cohortes. */
const COHORTES: readonly string[] = ['S06', 'S07', 'S08', 'S09', 'S10', 'S11']

/** Les entetes de semaine de la matrice. */
const SEMAINES: readonly string[] = ['S0', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6']

/** Les conditions de l editeur de segments. */
const CONDITIONS: readonly { readonly champ: string; readonly test: string }[] = [
  { champ: 'Offre', test: 'est Equipe ou Entreprise' },
  { champ: 'Evenements sur 7 jours', test: 'superieur a 500' },
  { champ: 'Membres actifs', test: 'au moins 3' },
  { champ: 'Derniere connexion', test: 'il y a moins de 4 jours' },
]

/** Les quatre blocs de reference, ceux du rapport du lundi. */
const BLOCS: readonly Bloc[] = DONNEES['12s'].blocs

/** Les regions d hebergement ouvertes. */
const REGIONS: readonly { readonly code: string; readonly ville: string }[] = [
  { code: 'eu-par-1', ville: 'Paris' },
  { code: 'eu-fra-1', ville: 'Francfort' },
  { code: 'eu-sto-1', ville: 'Stockholm' },
  { code: 'ca-mtl-1', ville: 'Montreal' },
]

/**
 * La couleur d une case de retention.
 *
 * En melant l accent au fond du theme, la case devient opaque, et l encre
 * courante — sombre en clair, claire en sombre — tient le contraste a toutes
 * les intensites. Le plafond de quarante pour cent est celui ou les deux
 * themes passent quelle que soit la couleur choisie.
 */
function caseRetention(valeur: number): string {
  if (valeur === 0) return 'transparent'
  return accentDoux(500, valeur * 0.4)
}

/** Une courbe de sept points, tracee a la main. */
function Courbe({ points }: { readonly points: readonly number[] }): ReactElement {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 60 28"
      preserveAspectRatio="none"
      className="o-mt-2 o-block o-h-8 o-w-full"
    >
      <polyline
        points={points.map((v, i) => `${String(i * 10)},${String(28 - v)}`).join(' ')}
        fill="none"
        stroke={ENCRE}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Le tableau de bord.
 *
 * Un selecteur qui ne repeint qu un libelle est un decor. Ici les quatre
 * indicateurs, leurs ecarts, leurs courbes, l entonnoir et le nombre de
 * semaines de retention encore lisibles changent ensemble — parce que c est ce
 * qui se passe quand on change de fenetre : une cohorte de sept jours n a pas
 * eu le temps de decrocher.
 */
function TableauDeBord(): ReactElement {
  const [periode, setPeriode] = useState<Periode>('12s')
  const vue = DONNEES[periode]
  const fenetre = PERIODES.find((p) => p.id === periode)?.fenetre ?? ''
  const colonnes = vue.semaines

  return (
    <div
      aria-label="Tableau de bord de demonstration"
      className="o-overflow-hidden o-rounded-xl o-bg-white dark:o-bg-zinc-950"
      style={{ border: `1px solid ${GRILLE}` }}
    >
      <div
        className="o-flex o-flex-wrap o-items-center o-gap-x-4 o-gap-y-2 o-border-b o-bg-zinc-50 dark:o-bg-zinc-900 o-px-4 o-py-2.5"
        style={{ borderColor: GRILLE }}
      >
        <span
          aria-hidden="true"
          className="o-block o-size-2 o-rounded-full"
          style={{ backgroundColor: accent(500) }}
        />
        <p className={`o-m-0 o-text-xs ${VALEUR}`}>coteau / vallonis / vue-produit</p>

        <div
          role="group"
          aria-label="Fenetre de lecture du tableau de bord"
          className="o-ml-auto o-flex o-items-center o-gap-px o-overflow-hidden o-rounded-sm o-border-w-1"
          style={{ borderColor: GRILLE }}
        >
          {PERIODES.map((choix) => {
            const actif = choix.id === periode
            return (
              <button
                key={choix.id}
                type="button"
                aria-pressed={actif}
                onClick={() => {
                  setPeriode(choix.id)
                }}
                className={`o-cursor-pointer o-px-2.5 o-py-1 o-text-xs ${VALEUR} focus:o-ring`}
                style={
                  actif
                    ? { backgroundColor: VOILE_FORT, color: ENCRE }
                    : { backgroundColor: 'transparent' }
                }
              >
                {choix.libelle}
              </button>
            )
          })}
        </div>
      </div>

      <ul
        className="o-m-0 o-grid o-list-none o-grid-cols-2 o-gap-px o-p-0 sm:o-grid-cols-4"
        style={{ backgroundColor: GRILLE }}
      >
        {vue.blocs.map((bloc) => (
          <li key={bloc.titre} className="o-bg-white dark:o-bg-zinc-950 o-p-4">
            <p className={`o-m-0 ${ETIQUETTE}`}>{bloc.titre}</p>
            <p className={`o-m-0 o-mt-1.5 o-text-xl o-font-bold ${VALEUR}`}>
              {bloc.valeur}
            </p>
            <p
              className={`o-m-0 o-mt-0.5 o-flex o-items-center o-gap-1 o-text-xs ${VALEUR}${bloc.hausse ? '' : ' o-text-zinc-600 dark:o-text-zinc-400'}`}
              style={bloc.hausse ? { color: ENCRE } : undefined}
            >
              <Icon
                icon={bloc.hausse ? TrendingUp : TrendingDown}
                size={13}
                aria-hidden="true"
              />
              {bloc.ecart}
            </p>
            <Courbe points={bloc.courbe} />
          </li>
        ))}
      </ul>

      <div
        className="o-grid o-gap-px md:o-grid-cols-2"
        style={{ backgroundColor: GRILLE }}
      >
        <div className="o-min-w-0 o-bg-white dark:o-bg-zinc-950 o-p-4">
          <p className={`o-m-0 ${ETIQUETTE}`}>Entonnoir d inscription — {fenetre}</p>
          <div className="o-mt-3 o-overflow-x-auto">
            <table className="o-w-full o-text-xs" style={{ minWidth: 300 }}>
              <caption className="o-sr-only">
                Part des visiteurs restants a chaque marche de l inscription, sur{' '}
                {fenetre}.
              </caption>
              <tbody>
                {vue.entonnoir.map((marche) => (
                  <tr key={marche.etape}>
                    <th
                      scope="row"
                      className="o-py-1.5 o-pr-3 o-text-left o-font-normal o-whitespace-nowrap"
                    >
                      {marche.etape}
                    </th>
                    <td className="o-w-full o-py-1.5">
                      <span
                        aria-hidden="true"
                        className="o-block o-h-2.5 o-w-full o-overflow-hidden o-rounded-sm"
                        style={{ backgroundColor: VOILE }}
                      >
                        <span
                          className="o-block o-h-full o-rounded-sm"
                          style={{
                            width: `${String(marche.part)}%`,
                            backgroundColor: accent(500),
                          }}
                        />
                      </span>
                    </td>
                    <td
                      className={`o-py-1.5 o-pl-3 o-text-right ${VALEUR} o-whitespace-nowrap`}
                    >
                      {marche.part} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="o-bg-white dark:o-bg-zinc-950 o-p-4">
          <p className={`o-m-0 ${ETIQUETTE}`}>
            Retention par cohorte — {colonnes} semaines lisibles
          </p>
          <div className="o-mt-3 o-overflow-x-auto">
            <table className="o-w-full o-text-xs">
              <caption className="o-sr-only">
                Part des comptes revenus, en pourcentage de leur semaine d arrivee.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className={`o-pr-2 o-text-left ${ETIQUETTE}`}>
                    Coh.
                  </th>
                  {SEMAINES.slice(0, colonnes).map((semaine) => (
                    <th
                      key={semaine}
                      scope="col"
                      className={`o-px-1 o-text-center ${ETIQUETTE}`}
                    >
                      {semaine}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RETENTION.map((ligne, rang) => (
                  <tr key={COHORTES[rang] ?? String(rang)}>
                    <th
                      scope="row"
                      className={`o-py-0.5 o-pr-2 o-text-left o-font-normal ${VALEUR}`}
                    >
                      {COHORTES[rang]}
                    </th>
                    {ligne.slice(0, colonnes).map((valeur, colonne) => (
                      <td key={colonne} className="o-p-0.5">
                        <span
                          className={`o-flex o-h-6 o-items-center o-justify-center o-rounded-sm ${VALEUR}`}
                          style={{ backgroundColor: caseRetention(valeur) }}
                        >
                          {valeur === 0 ? '' : valeur}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p
        aria-live="polite"
        className="o-m-0 o-border-t o-px-4 o-py-2.5 o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
        style={{ borderColor: GRILLE }}
      >
        {vue.note}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                             Le calculateur                               */
/* ------------------------------------------------------------------------ */

/** Les paliers de volume que la reglette parcourt, en evenements par mois. */
const VOLUMES: readonly number[] = [
  50_000, 100_000, 250_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000,
  20_000_000, 50_000_000, 100_000_000, 200_000_000, 500_000_000,
]

/** Une offre, telle que le calculateur la chiffre. */
interface Offre {
  readonly nom: string
  readonly plafond: number
  readonly base: number
  /** Prix du million d evenements au-dela du plafond ; zero si non depassable. */
  readonly parMillion: number
  readonly conditions: string
}

/** Les trois offres, avec leur regle de depassement. */
const OFFRES: readonly Offre[] = [
  {
    nom: 'Depart',
    plafond: 100_000,
    base: 0,
    parMillion: 0,
    conditions: 'Gratuit jusqu a 100 000 evenements par mois. Au-dela, l offre se ferme.',
  },
  {
    nom: 'Equipe',
    plafond: 100_000_000,
    base: 790,
    parMillion: 55,
    conditions:
      '790 EUR par mois jusqu a 10 millions d evenements, puis 55 EUR par million entame.',
  },
  {
    nom: 'Entreprise',
    plafond: Number.POSITIVE_INFINITY,
    base: 2400,
    parMillion: 18,
    conditions:
      '2 400 EUR par mois jusqu a 100 millions d evenements, puis 18 EUR par million entame.',
  },
]

/** Le volume compris dans la base de chaque offre. */
const COMPRIS: Readonly<Record<string, number>> = {
  Depart: 100_000,
  Equipe: 10_000_000,
  Entreprise: 100_000_000,
}

/** Le cout mensuel d une offre pour un volume, ou `null` si l offre se ferme. */
function cout(offre: Offre, volume: number): number | null {
  if (volume > offre.plafond) return null
  const compris = COMPRIS[offre.nom] ?? 0
  const surplus = Math.max(0, Math.ceil((volume - compris) / 1_000_000))
  return offre.base + surplus * offre.parMillion
}

/** Un nombre, en francais. */
function nombre(valeur: number, decimales = 0): string {
  return valeur.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

/** Un volume mensuel, dit court. */
function volumeCourt(valeur: number): string {
  if (valeur >= 1_000_000) return `${nombre(valeur / 1_000_000)} M`
  return `${nombre(valeur / 1_000)} k`
}

/**
 * Le calculateur de prix.
 *
 * Le palier recommande n est pas celui que nous voudrions vendre : c est le
 * moins cher des paliers encore ouverts a ce volume. Entre trente et quarante
 * millions d evenements, la recommandation bascule d elle-meme d Equipe vers
 * Entreprise — et c est la seule maniere honnete de presenter une grille a
 * depassement.
 */
function Calculateur(): ReactElement {
  const [rang, setRang] = useState(7)
  const volume = VOLUMES[rang] ?? 10_000_000

  const chiffrage = useMemo(() => {
    const lignes = OFFRES.map((offre) => ({ offre, montant: cout(offre, volume) }))
    const ouverts = lignes.filter((ligne) => ligne.montant !== null)
    const moinsCher = ouverts.reduce<(typeof ouverts)[number] | undefined>(
      (bas, ligne) =>
        bas === undefined || (ligne.montant ?? 0) < (bas.montant ?? 0) ? ligne : bas,
      undefined,
    )
    return { lignes, recommande: moinsCher?.offre.nom ?? 'Entreprise' }
  }, [volume])

  const retenu = chiffrage.lignes.find(
    (ligne) => ligne.offre.nom === chiffrage.recommande,
  )
  const mensuel = retenu?.montant ?? 0
  const annuel = Math.round(mensuel * 12 * 0.8)
  const parMillion = volume > 0 ? (mensuel * 1_000_000) / volume : 0

  return (
    <div
      className="o-rounded-xl o-border-w-1 o-bg-white dark:o-bg-zinc-950 o-p-5 md:o-p-8"
      style={{ borderColor: GRILLE }}
    >
      <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
        <div className="md:o-col-span-5">
          <label htmlFor="calc-volume" className={`o-block ${ETIQUETTE}`}>
            Evenements par mois
          </label>
          <p
            className={`o-m-0 o-mt-1 o-text-4xl o-font-extrabold o-tracking-tight ${VALEUR}`}
          >
            {nombre(volume)}
          </p>
        </div>
        <div className="md:o-col-span-7">
          <input
            id="calc-volume"
            type="range"
            min={0}
            max={VOLUMES.length - 1}
            step={1}
            value={rang}
            onChange={(evenement) => {
              setRang(Number(evenement.target.value))
            }}
            aria-valuetext={`${nombre(volume)} evenements par mois`}
            className="o-block o-w-full o-cursor-pointer"
            style={{ accentColor: accent(600) }}
          />
          <p
            aria-hidden="true"
            className={`o-m-0 o-mt-2 o-flex o-justify-between o-text-xs ${VALEUR} o-text-zinc-600 dark:o-text-zinc-400`}
          >
            <span>50 k</span>
            <span>10 M</span>
            <span>500 M</span>
          </p>
        </div>
      </div>

      <ul
        className="o-m-0 o-mt-8 o-grid o-list-none o-gap-px o-p-0 sm:o-grid-cols-3"
        style={{ backgroundColor: GRILLE }}
      >
        {chiffrage.lignes.map((ligne) => {
          const recommande = ligne.offre.nom === chiffrage.recommande
          return (
            <li
              key={ligne.offre.nom}
              className="o-bg-white dark:o-bg-zinc-950 o-p-4"
              style={recommande ? { backgroundColor: VOILE_FORT } : undefined}
            >
              <p className={`o-m-0 ${ETIQUETTE}`}>{ligne.offre.nom}</p>
              {ligne.montant === null ? (
                <>
                  <p
                    className={`o-m-0 o-mt-1.5 o-text-xl o-font-bold ${VALEUR} o-text-zinc-600 dark:o-text-zinc-400`}
                  >
                    Ferme
                  </p>
                  <p className="o-m-0 o-mt-1 o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
                    Au-dela de {volumeCourt(ligne.offre.plafond)} evenements par mois.
                  </p>
                </>
              ) : (
                <>
                  <p
                    className={`o-m-0 o-mt-1.5 o-text-xl o-font-bold ${VALEUR}`}
                    style={recommande ? { color: ENCRE } : undefined}
                  >
                    {nombre(ligne.montant)} EUR
                  </p>
                  <p className="o-m-0 o-mt-1 o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
                    par mois, hors taxes
                  </p>
                </>
              )}
              {recommande && (
                <p
                  className={`o-m-0 o-mt-3 o-inline-flex o-items-center o-gap-1.5 o-rounded-sm o-px-2 o-py-1 o-text-xs ${VALEUR}`}
                  style={{ backgroundColor: VOILE, color: ENCRE }}
                >
                  <Icon icon={Check} size={12} aria-hidden="true" />
                  Palier recommande
                </p>
              )}
            </li>
          )
        })}
      </ul>

      <dl
        aria-live="polite"
        className="o-m-0 o-mt-6 o-grid o-gap-4 o-text-sm sm:o-grid-cols-3"
      >
        <div>
          <dt className={`o-m-0 ${ETIQUETTE}`}>Sur un an, paye d avance</dt>
          <dd className={`o-m-0 o-mt-1 o-text-base o-font-semibold ${VALEUR}`}>
            {nombre(annuel)} EUR
          </dd>
          <p className="o-m-0 o-mt-1 o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
            Deux mois offerts, soit vingt pour cent de remise.
          </p>
        </div>
        <div>
          <dt className={`o-m-0 ${ETIQUETTE}`}>Cout du million d evenements</dt>
          <dd className={`o-m-0 o-mt-1 o-text-base o-font-semibold ${VALEUR}`}>
            {nombre(parMillion, 2)} EUR
          </dd>
          <p className="o-m-0 o-mt-1 o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
            Il baisse a mesure que le volume monte, sans avenant a signer.
          </p>
        </div>
        <div>
          <dt className={`o-m-0 ${ETIQUETTE}`}>Ce que le palier comprend</dt>
          <dd className="o-m-0 o-mt-1 o-text-xs o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
            {retenu?.offre.conditions ?? ''}
          </dd>
        </div>
      </dl>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                              Le comparatif                               */
/* ------------------------------------------------------------------------ */

/** Une ligne du comparatif, avec sa famille. */
interface LigneComparee {
  readonly group: string
  readonly label: string
  readonly values: readonly (boolean | string)[]
}

/** Le comparatif complet, familles comprises. */
const COMPARATIF: readonly LigneComparee[] = [
  {
    group: 'Mise en route',
    label: 'Delai avant la premiere courbe',
    values: ['4 jours', '6 semaines', '4 mois'],
  },
  {
    group: 'Mise en route',
    label: 'Marqueurs a poser dans le code',
    values: ['Aucun', 'Un par evenement', 'Un par evenement'],
  },
  {
    group: 'Mise en route',
    label: 'Import de l historique existant',
    values: [true, false, true],
  },
  {
    group: 'Mise en route',
    label: 'Assistance de reprise comprise',
    values: ['10 jours', 'Payante', 'Sans objet'],
  },
  {
    group: 'Mise en route',
    label: 'Connecteurs prets a l emploi',
    values: ['22', '31', 'A ecrire'],
  },
  {
    group: 'Analyse',
    label: 'Entonnoirs reconstruits apres coup',
    values: [true, false, true],
  },
  { group: 'Analyse', label: 'Cohortes glissantes', values: [true, true, false] },
  {
    group: 'Analyse',
    label: 'Segments partages a l equipe',
    values: [true, true, false],
  },
  {
    group: 'Analyse',
    label: 'Rapport programme par courriel',
    values: [true, false, false],
  },
  {
    group: 'Analyse',
    label: 'Requete libre en SQL sur la donnee brute',
    values: [true, false, true],
  },
  {
    group: 'Analyse',
    label: 'Delai de fraicheur de la donnee',
    values: ['90 s', '4 h', '24 h'],
  },
  {
    group: 'Gouvernance',
    label: 'Hebergement en Europe garanti',
    values: [true, false, true],
  },
  {
    group: 'Gouvernance',
    label: 'Journal d audit exportable',
    values: [true, true, false],
  },
  {
    group: 'Gouvernance',
    label: 'Authentification unique comprise',
    values: [true, false, true],
  },
  {
    group: 'Gouvernance',
    label: 'Duree de conservation reglable',
    values: ['3 a 60 mois', '12 mois fixes', 'Libre'],
  },
  {
    group: 'Gouvernance',
    label: 'Reversibilite : export brut sur demande',
    values: [true, false, true],
  },
  { group: 'Cout', label: 'Facture au siege', values: [false, true, false] },
  {
    group: 'Cout',
    label: 'Cout annuel pour dix millions d evenements',
    values: ['9 480 EUR', '24 000 EUR', '61 000 EUR'],
  },
  {
    group: 'Cout',
    label: 'Cout annuel pour cent millions d evenements',
    values: ['28 800 EUR', '96 000 EUR', '104 000 EUR'],
  },
  { group: 'Cout', label: 'Engagement minimum', values: ['Aucun', '12 mois', 'Interne'] },
]

/** Les familles du comparatif, dans l ordre de lecture. */
const FAMILLES: readonly string[] = ['Mise en route', 'Analyse', 'Gouvernance', 'Cout']

/** Vrai quand les trois colonnes d une ligne disent la meme chose. */
function identique(ligne: LigneComparee): boolean {
  const [premiere, ...suite] = ligne.values
  return suite.every((valeur) => valeur === premiere)
}

/**
 * Le comparatif filtre.
 *
 * Le premier filtre repond a « ou en sommes-nous dans l appel d offres » ; le
 * second a la seule question qui compte a la fin : ou les trois colonnes
 * divergent-elles vraiment.
 */
function Comparatif(): ReactElement {
  const [famille, setFamille] = useState<string>('Tout')
  const [ecartsSeuls, setEcartsSeuls] = useState(false)

  const lignes = useMemo(
    () =>
      COMPARATIF.filter((ligne) => famille === 'Tout' || ligne.group === famille).filter(
        (ligne) => !ecartsSeuls || !identique(ligne),
      ),
    [famille, ecartsSeuls],
  )

  return (
    <>
      <div className="o-flex o-flex-wrap o-items-center o-gap-x-6 o-gap-y-3">
        <div
          role="group"
          aria-label="Famille de criteres"
          className="o-flex o-flex-wrap o-items-center o-gap-2"
        >
          {['Tout', ...FAMILLES].map((choix) => {
            const actif = choix === famille
            return (
              <button
                key={choix}
                type="button"
                aria-pressed={actif}
                onClick={() => {
                  setFamille(choix)
                }}
                className={`o-cursor-pointer o-rounded-full o-border-w-1 o-px-3 o-py-1.5 o-text-xs ${VALEUR} focus:o-ring`}
                style={
                  actif
                    ? { borderColor: accent(500), backgroundColor: VOILE, color: ENCRE }
                    : { borderColor: GRILLE }
                }
              >
                {choix}
              </button>
            )
          })}
        </div>

        <label className="o-flex o-cursor-pointer o-items-center o-gap-2 o-text-xs o-text-zinc-700 dark:o-text-zinc-300">
          <input
            type="checkbox"
            checked={ecartsSeuls}
            onChange={(evenement) => {
              setEcartsSeuls(evenement.target.checked)
            }}
            className="o-cursor-pointer focus:o-ring"
            style={{ accentColor: accent(600) }}
          />
          N afficher que les lignes ou les trois colonnes divergent
        </label>

        <p
          aria-live="polite"
          className={`o-m-0 o-ml-auto o-text-xs ${VALEUR} o-text-zinc-600 dark:o-text-zinc-400`}
        >
          {lignes.length} critere{lignes.length > 1 ? 's' : ''} sur {COMPARATIF.length}
        </p>
      </div>

      {/* Le tableau defile dans sa propre zone ; le confinement de peinture
          empeche ses libelles caches d allonger le document sur un telephone. */}
      <div className="o-mt-6 o-p-1" style={{ contain: 'paint' }}>
        {lignes.length === 0 ? (
          <p
            className="o-m-0 o-rounded-lg o-border-w-1 o-p-6 o-text-sm o-text-zinc-700 dark:o-text-zinc-300"
            style={{ borderColor: GRILLE }}
          >
            Sur cette famille, les trois colonnes disent exactement la meme chose.
            Decochez le filtre pour revoir les lignes communes.
          </p>
        ) : (
          <ComparisonTable
            caption="Coteau face aux suites d analytique generalistes"
            maxHeight={520}
            columns={[
              { name: 'Coteau', note: 'Offre Equipe', featured: true },
              { name: 'Suite generaliste', note: 'Offre Business' },
              { name: 'Entrepot maison', note: 'Cout interne' },
            ]}
            rows={lignes}
          />
        )}
      </div>
    </>
  )
}

/* ------------------------------------------------------------------------ */
/*                     La planche des figures (02)                          */
/* ------------------------------------------------------------------------ */

/**
 * Les cinq figures de la planche, telles que la marge les annonce.
 *
 * Une grille de vignettes de meme taille ne fait pas une page : elle fait un
 * catalogue. Une planche, si — a condition que les figures aient des tailles
 * differentes, qu elles soient numerotees, et que leur legende soit lisible
 * sans entrer dans la figure. C est la marge de gauche qui la porte.
 */
const FIGURES = [
  {
    num: '01',
    titre: 'Le parcours',
    ligne: 'Cinq marches, de la page d accueil au premier paiement',
  },
  {
    num: '02',
    titre: 'Les cohortes',
    ligne: 'Six semaines de depart, sept semaines de suite',
  },
  {
    num: '03',
    titre: 'Les segments',
    ligne: 'Quatre conditions, une population reutilisable',
  },
  {
    num: '04',
    titre: 'Ou vit la donnee',
    ligne: 'Quatre regions ouvertes, aucune replique entre elles',
  },
  {
    num: '05',
    titre: 'Le rapport du lundi',
    ligne: 'Trois chiffres, huit heures, un courriel',
  },
] as const

/**
 * Vrai des que l element est entre dans le cadre — une seule fois.
 *
 * Sert aux barres de l entonnoir : une barre deja pleine a l arrivee ne dit
 * rien, une barre qui se remplit sous l oeil dit la chute.
 */
function useVu<T extends HTMLElement>(): {
  readonly ref: RefObject<T | null>
  readonly vu: boolean
} {
  const ref = useRef<T>(null)
  const [vu, setVu] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (element === null) return
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (entree.isIntersecting) {
            setVu(true)
            observateur.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    observateur.observe(element)
    return () => {
      observateur.disconnect()
    }
  }, [])
  return { ref, vu }
}

/** Les increments du flux, en boucle : une suite fixe plutot qu un tirage. */
const INCREMENTS = [11, 7, 19, 5, 23, 13, 9, 17] as const

/**
 * Le flux d evenements, en direct.
 *
 * C est la seule donnee de la planche qui bouge d elle-meme, et c est la
 * bonne : une plateforme d analytique recoit des evenements pendant qu on lit
 * sa page. Le nombre est cache aux lecteurs d ecran — une valeur qui change
 * toutes les secondes ne s annonce pas — et une phrase fixe le remplace.
 * Sous mouvement reduit, le compteur s arrete.
 */
function FluxEnDirect(): ReactElement {
  const { reduced } = useMotionState()
  const [valeur, setValeur] = useState(1284302)
  const [battement, setBattement] = useState(false)

  useEffect(() => {
    if (reduced) return
    let rang = 0
    const identifiant = window.setInterval(() => {
      setValeur((avant) => avant + (INCREMENTS[rang % INCREMENTS.length] ?? 11))
      setBattement((avant) => !avant)
      rang += 1
    }, 850)
    return () => {
      window.clearInterval(identifiant)
    }
  }, [reduced])

  return (
    <div>
      <p className={`o-m-0 o-flex o-items-center o-gap-2 ${ETIQUETTE}`}>
        <span
          aria-hidden="true"
          className="o-block o-size-1.5 o-rounded-full o-transition-opacity"
          style={{
            backgroundColor: accent(500),
            opacity: reduced || battement ? 1 : 0.25,
            transitionDuration: '400ms',
          }}
        />
        Flux en direct
      </p>
      <p
        className={`o-m-0 o-mt-2 o-text-3xl o-font-bold ${VALEUR}`}
        style={{ color: ENCRE }}
      >
        <span aria-hidden="true">{valeur.toLocaleString('fr-FR')}</span>
        <span className="o-sr-only">
          Environ un million trois cent mille evenements recus depuis minuit.
        </span>
      </p>
      <p className="o-m-0 o-mt-1 o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
        evenements recus depuis minuit, tous projets confondus
      </p>
    </div>
  )
}

/**
 * Le cadre d une figure : son numero, son titre, sa note de coin.
 *
 * Les tailles sont donnees par l appelant — c est la le sujet : aucune figure
 * n a la taille de sa voisine.
 */
function Figure({
  num,
  titre,
  note,
  className,
  hauteur,
  serre = false,
  children,
}: {
  readonly num: string
  readonly titre: string
  readonly note?: string
  readonly className?: string
  readonly hauteur: number
  /** Vrai pour une figure qui touche ses bords : le globe, une image. */
  readonly serre?: boolean
  readonly children: ReactNode
}): ReactElement {
  return (
    <figure
      id={`fig-${num}`}
      className={`o-m-0 o-flex o-min-w-0 o-flex-col o-overflow-hidden o-rounded-xl o-bg-white dark:o-bg-zinc-950 ${className ?? ''}`}
      style={{ border: `1px solid ${GRILLE}` }}
    >
      <figcaption
        className="o-flex o-flex-wrap o-items-baseline o-gap-x-3 o-gap-y-1 o-border-b o-px-4 o-py-2.5"
        style={{ borderColor: GRILLE }}
      >
        <span
          className={`${VALEUR} o-text-xs o-uppercase o-tracking-wider`}
          style={{ color: ENCRE }}
        >
          Fig. {num}
        </span>
        <span className="o-text-sm o-font-semibold o-text-zinc-950 dark:o-text-zinc-50">
          {titre}
        </span>
        {note !== undefined && (
          <span
            className={`o-ml-auto ${VALEUR} o-text-xs o-text-zinc-600 dark:o-text-zinc-400`}
          >
            {note}
          </span>
        )}
      </figcaption>
      <div
        className={`o-flex o-min-w-0 o-grow o-flex-col ${serre ? '' : 'o-p-4'}`}
        style={{ minHeight: hauteur }}
      >
        {children}
      </div>
    </figure>
  )
}

/**
 * Une cle qui change quand la couleur du modele change.
 *
 * Les pieces du registre lisent leurs jetons de couleur au montage. Poser
 * cette cle sur la scene la remonte quand la couleur ou le theme changent.
 */
function useCleDeTeinte(): string {
  const [cle, setCle] = useState('')

  useEffect(() => {
    const racine = document.documentElement
    const conteneur = document.querySelector('[data-o-vitrine]')

    const relire = (): void => {
      const teinte =
        conteneur === null
          ? ''
          : getComputedStyle(conteneur).getPropertyValue('--o-vitrine-500').trim()
      setCle(`${teinte}|${racine.getAttribute('data-theme') ?? ''}`)
    }

    relire()
    const observateur = new MutationObserver(relire)
    if (conteneur !== null) {
      observateur.observe(conteneur, { attributes: true, attributeFilter: ['style'] })
    }
    observateur.observe(racine, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      observateur.disconnect()
    }
  }, [])

  return cle
}

/**
 * L entonnoir, en grand, avec sa legende dans la marge de la figure.
 *
 * Les barres partent a zero et se remplissent quand la figure entre dans le
 * cadre, decalees de cent millisecondes : c est la chute qu on voit, et non
 * cinq barres deja posees. La perte est ecrite marche par marche.
 */
function FigureParcours(): ReactElement {
  const { ref, vu } = useVu<HTMLDivElement>()
  const { reduced } = useMotionState()
  const plein = vu || reduced
  return (
    <div ref={ref} className="o-grid o-grow o-gap-x-10 o-gap-y-8 md:o-grid-cols-12">
      <ol className="o-m-0 o-flex o-list-none o-flex-col o-justify-center o-gap-4 o-p-0 md:o-col-span-8">
        {ENTONNOIR.map((marche, rang) => {
          const avant = ENTONNOIR[rang - 1]
          const perdu = avant === undefined ? 0 : avant.part - marche.part
          return (
            <li key={marche.etape} className="o-flex o-flex-col o-gap-1.5">
              <span className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-3 o-text-sm">
                <span className="o-text-zinc-950 dark:o-text-zinc-50">
                  {marche.etape}
                </span>
                <span className={`${VALEUR} o-text-zinc-600 dark:o-text-zinc-400`}>
                  {perdu > 0 && <span className="o-mr-3">− {perdu} pts</span>}
                  <span className="o-text-base o-font-bold o-text-zinc-950 dark:o-text-zinc-50">
                    {marche.part} %
                  </span>
                </span>
              </span>
              <span
                className="o-block o-h-3 o-w-full o-overflow-hidden o-rounded-md"
                style={{ backgroundColor: VOILE }}
              >
                <span
                  className="o-block o-h-full o-rounded-md"
                  style={{
                    width: plein ? `${String(marche.part)}%` : '0%',
                    backgroundColor: accent(500),
                    transition: reduced
                      ? 'none'
                      : `width 1000ms cubic-bezier(0.16, 1, 0.3, 1) ${String(rang * 110)}ms`,
                  }}
                />
              </span>
            </li>
          )
        })}
      </ol>
      {/* La marge de la figure : le flux vivant et la note de lecture. */}
      <div
        className="o-flex o-flex-col o-justify-center o-gap-6 md:o-col-span-4 md:o-border-l md:o-pl-8"
        style={{ borderColor: GRILLE }}
      >
        {/* Le filet ne change pas de cote : il devient horizontal quand la
            marge passe sous la figure. */}
        <span
          aria-hidden="true"
          className="o-block o-h-px o-w-full md:o-hidden"
          style={{ backgroundColor: GRILLE }}
        />
        <FluxEnDirect />
        <p className="o-m-0 o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          Douze semaines glissantes. Aucune marche n est declaree a la main : elles sont
          deduites des evenements que le produit envoie deja.
        </p>
      </div>
    </div>
  )
}

/** La matrice de retention : une ligne par cohorte, une colonne par semaine. */
function FigureCohortes(): ReactElement {
  return (
    <div className="o-overflow-x-auto">
      <table
        className={`o-w-full o-text-xs ${VALEUR}`}
        style={{
          borderCollapse: 'separate',
          borderSpacing: '3px',
          minWidth: 340,
          tableLayout: 'fixed',
        }}
      >
        <caption className="o-sr-only">
          Part des comptes encore actifs, semaine apres semaine, pour six cohortes d
          inscription.
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="o-text-left o-font-normal o-text-zinc-600 dark:o-text-zinc-400"
              style={{ width: '16%' }}
            >
              Cohorte
            </th>
            {SEMAINES.map((semaine) => (
              <th
                key={semaine}
                scope="col"
                className="o-font-normal o-text-zinc-600 dark:o-text-zinc-400"
              >
                {semaine}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RETENTION.map((ligne, rang) => (
            <tr key={COHORTES[rang] ?? String(rang)}>
              <th
                scope="row"
                className="o-text-left o-font-normal o-text-zinc-600 dark:o-text-zinc-400"
              >
                {COHORTES[rang]}
              </th>
              {ligne.map((valeur, colonne) => (
                <td
                  key={colonne}
                  className="o-h-7 o-rounded-sm o-text-center o-text-zinc-950 dark:o-text-zinc-50"
                  style={{ backgroundColor: caseRetention(valeur) }}
                >
                  {valeur === 0 ? '' : valeur}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** L editeur de segments, et le nombre de comptes qu il retient. */
function FigureSegments(): ReactElement {
  return (
    <div className="o-flex o-grow o-flex-col o-gap-2">
      {CONDITIONS.map((condition, rang) => (
        <div key={condition.champ} className="o-flex o-flex-col o-gap-2">
          {rang > 0 && (
            <span
              className={`o-text-xs o-font-semibold ${VALEUR}`}
              style={{ color: ENCRE }}
            >
              ET
            </span>
          )}
          <p
            className="o-m-0 o-flex o-flex-wrap o-items-center o-gap-x-2 o-rounded-md o-border-w-1 o-px-2.5 o-py-1.5 o-text-xs"
            style={{ borderColor: GRILLE }}
          >
            <span className="o-font-medium o-text-zinc-950 dark:o-text-zinc-50">
              {condition.champ}
            </span>
            <span className="o-text-zinc-600 dark:o-text-zinc-400">{condition.test}</span>
          </p>
        </div>
      ))}
      <p
        className="o-m-0 o-mt-auto o-flex o-items-baseline o-gap-2 o-border-t o-pt-3"
        style={{ borderColor: GRILLE }}
      >
        <span className={`o-text-xl o-font-bold ${VALEUR}`} style={{ color: ENCRE }}>
          1 482
        </span>
        <span className="o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
          comptes retenus, recalcules chaque nuit
        </span>
      </p>
    </div>
  )
}

/** Le rapport du lundi : les trois chiffres qui partent par courriel. */
function FigureRapport(): ReactElement {
  return (
    <div className="o-flex o-grow o-flex-col o-gap-3">
      <div className="o-grid o-gap-3 sm:o-grid-cols-3">
        {BLOCS.slice(0, 3).map((bloc) => (
          <div
            key={bloc.titre}
            className="o-min-w-0 o-rounded-md o-border-w-1 o-p-3"
            style={{ borderColor: GRILLE }}
          >
            <p className="o-m-0 o-truncate o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
              {bloc.titre}
            </p>
            <p
              className={`o-m-0 o-mt-1 o-text-lg o-font-bold ${VALEUR} o-text-zinc-950 dark:o-text-zinc-50`}
            >
              {bloc.valeur}
            </p>
            <Courbe points={bloc.courbe} />
          </div>
        ))}
      </div>
      <p className="o-m-0 o-mt-auto o-flex o-items-center o-gap-2 o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
        <Icon icon={Clock} size={14} aria-hidden="true" />
        Envoye le lundi a 8 h, heure de Paris — a marie@vallonis.fr et deux autres
      </p>
    </div>
  )
}

/** Le globe, dans sa figure noire : quatre regions, aucune replique. */
function FigureGlobe({ cle }: { readonly cle: string }): ReactElement {
  return (
    <div
      className="o-relative o-grow o-min-h-56 o-overflow-hidden"
      style={{ backgroundColor: '#000000' }}
    >
      <GlobeMesh
        key={cle}
        className="o-absolute o-inset-0"
        density={18}
        spin={5}
        detail={2}
        shimmer="edge"
        colors={[
          '--o-vitrine-200',
          '--o-vitrine-500',
          '--o-vitrine-100',
          '--o-vitrine-400',
          '--o-vitrine-seconde',
        ]}
        poster="o-bg-zinc-950"
      />
      <ul
        className="o-absolute o-bottom-3 o-left-3 o-m-0 o-flex o-list-none o-flex-col o-gap-1 o-p-0 o-font-mono o-text-xs"
        style={{ color: accent(200) }}
      >
        {REGIONS.map((region) => (
          <li key={region.code}>
            {region.code} <span className="o-opacity-70">— {region.ville}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Un intitule de section : l indice, le titre en grande graisse. */
function Titre({
  rang,
  surtitre,
  children,
  texte,
}: {
  readonly rang: string
  readonly surtitre: string
  readonly children: ReactNode
  readonly texte?: string
}): ReactElement {
  return (
    <div className="o-max-w-3xl">
      <Indice rang={rang} sombre={false}>
        {surtitre}
      </Indice>
      <h2
        className="o-m-0 o-mt-5 o-text-zinc-950 dark:o-text-zinc-50"
        style={{ ...affiche('m', 800), fontSize: 'clamp(2rem, 4.5vw, 4.25rem)' }}
      >
        {children}
      </h2>
      {texte !== undefined && (
        <p className="o-mt-5 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          {texte}
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                                La page                                   */
/* ------------------------------------------------------------------------ */

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('manrope')
  const cleDeTeinte = useCleDeTeinte()

  return (
    <Porte forme="iris" marque="Coteau" sombre={false}>
      <div
        className="o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50"
        style={polices}
      >
        <BarreGelule
          sombre={false}
          marque="Coteau"
          liens={LIENS}
          action={['#essai', 'Essai gratuit']}
        />

        {/* ================= L ouverture : la nappe, un titre, les logos ===== */}
        <section
          id="sommet"
          aria-label="Ouverture"
          className="o-relative o-isolate o-overflow-hidden"
        >
          <Nappe couleurs={[accent(300), accent(100), accent(200)]} opacite={0.55} />
          <div
            className="o-relative o-mx-auto o-flex o-max-w-7xl o-flex-col o-items-center o-justify-center o-px-6 o-pb-28 o-pt-28 o-text-center"
            style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
          >
            <Surgit>
              <Etiquette sombre={false}>
                Analytique produit — sans marqueur a poser
              </Etiquette>
            </Surgit>
            <h1
              className="o-m-0 o-mt-8 o-max-w-5xl o-text-zinc-950 dark:o-text-zinc-50"
              style={affiche('l', 800)}
            >
              <Surgit as="span" delai={120} className="o-inline-block">
                Sachez enfin
              </Surgit>{' '}
              <Surgit as="span" delai={220} className="o-inline-block">
                <Encadre>pourquoi</Encadre>
              </Surgit>{' '}
              <Surgit as="span" delai={320} className="o-inline-block">
                ils partent.
              </Surgit>
            </h1>
            <Surgit
              delai={520}
              as="p"
              className="o-m-0 o-mt-8 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300 md:o-text-lg"
            >
              Coteau reconstruit les parcours, les cohortes et la retention a partir des
              evenements que vous envoyez deja.
            </Surgit>
            <Surgit delai={640} className="o-mt-10 o-flex o-justify-center">
              <Actions
                sombre={false}
                pleine={[
                  '#essai',
                  <>
                    Commencer l essai de 14 jours{' '}
                    <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                  </>,
                ]}
                fantome={['#produit', 'Voir le produit']}
              />
            </Surgit>
            <Surgit delai={800} className="o-mt-20 o-w-full o-max-w-4xl">
              <Logos
                sombre={false}
                marques={CLIENTS}
                titre="Ils suivent leur produit avec Coteau"
              />
            </Surgit>
          </div>
          <Coin position="bg" sombre={false}>
            Paris · Francfort · Stockholm · Montreal
            <br />
            La donnee ne quitte pas sa region
          </Coin>
          <Coin position="bd" sombre={false}>
            Quatorze jours d essai
            <br />
            Sans carte, sans marqueur
          </Coin>
        </section>

        <main>
          {/* ================= (01) Le produit, en perspective ============== */}
          <section
            id="produit"
            className="o-scroll-mt-24 o-overflow-hidden o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-pt-12"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <ContainerScroll
                label="Le tableau de bord de Coteau"
                rotation={24}
                scale={0.84}
                title={
                  <SpotlightText
                    as="span"
                    radius={260}
                    rest={0.62}
                    className="o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 800),
                      fontSize: 'clamp(2rem, 4.5vw, 4.25rem)',
                    }}
                  >
                    Le tableau de bord du lundi
                  </SpotlightText>
                }
                subtitle="Trois fenetres de lecture. Tout change ensemble : les indicateurs, l entonnoir, les cohortes encore lisibles."
              >
                <TableauDeBord />
              </ContainerScroll>
              <p
                className={`o-mb-0 o-mt-2 o-text-center o-text-xs ${VALEUR} o-text-zinc-600 dark:o-text-zinc-400`}
              >
                Donnees de demonstration, dessinees en HTML — pas une photographie.
              </p>
            </div>
          </section>

          {/* ================= (02) La planche des figures ==================
              Cinq figures de tailles differentes, numerotees, dont la legende
              se tient dans la marge de gauche — et une donnee qui avance
              toute seule pendant qu on lit. */}
          <section id="mosaique" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-py-32">
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-8">
                  <Titre rang="02" surtitre="Les lectures">
                    Quatre lectures, et la question du lundi est reglee.
                  </Titre>
                </div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-4 md:o-text-right">
                  Rien a installer
                  <br />
                  Rien a modeliser
                </p>
              </div>

              <div className="o-mt-16 o-grid o-gap-x-10 o-gap-y-10 md:o-grid-cols-12">
                {/* La marge : la legende de la planche, qui suit le defilement. */}
                <div className="md:o-col-span-3">
                  <div className="md:o-sticky" style={{ top: CHROME + 28 }}>
                    <p className={`o-m-0 ${ETIQUETTE}`}>Planche II — les lectures</p>
                    <ol className="o-m-0 o-mt-5 o-list-none o-p-0">
                      {FIGURES.map((figure) => (
                        <li
                          key={figure.num}
                          className="o-border-t o-py-3"
                          style={{ borderColor: GRILLE }}
                        >
                          <a
                            href={`#fig-${figure.num}`}
                            className="o-flex o-gap-3 o-no-underline o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring"
                          >
                            <span
                              className={`${VALEUR} o-text-xs o-uppercase o-tracking-wider`}
                              style={{ color: ENCRE }}
                            >
                              {figure.num}
                            </span>
                            <span className="o-min-w-0">
                              <span className="o-block o-text-sm o-font-semibold">
                                {figure.titre}
                              </span>
                              <span className="o-mt-0.5 o-block o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                                {figure.ligne}
                              </span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ol>
                    <p
                      className="o-m-0 o-mt-5 o-border-t o-pt-4 o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
                      style={{ borderColor: GRILLE }}
                    >
                      Figures dessinees en HTML sur des donnees de demonstration. Seul le
                      flux de la figure 01 avance en direct.
                    </p>
                  </div>
                </div>

                {/* Les figures, aucune a la taille de sa voisine. */}
                <div className="o-grid o-gap-6 md:o-col-span-9 md:o-grid-cols-12 md:o-items-start">
                  <Figure
                    num="01"
                    titre="Le parcours"
                    note="12 semaines glissantes"
                    hauteur={320}
                    className="md:o-col-span-12"
                  >
                    <FigureParcours />
                  </Figure>
                  <Figure
                    num="02"
                    titre="Les cohortes"
                    note="6 cohortes"
                    hauteur={230}
                    className="md:o-col-span-7"
                  >
                    <FigureCohortes />
                  </Figure>
                  <Figure
                    num="03"
                    titre="Les segments"
                    note="ET logique"
                    hauteur={300}
                    className="md:o-col-span-5"
                  >
                    <FigureSegments />
                  </Figure>
                  <Figure
                    num="04"
                    titre="Ou vit la donnee"
                    note="4 regions"
                    hauteur={330}
                    serre
                    className="md:o-col-span-5"
                  >
                    <FigureGlobe cle={cleDeTeinte} />
                  </Figure>
                  <Figure
                    num="05"
                    titre="Le rapport du lundi"
                    note="lundi, 8 h"
                    hauteur={190}
                    className="md:o-col-span-7"
                  >
                    <FigureRapport />
                  </Figure>
                </div>
              </div>
            </div>
          </section>

          {/* ================= Une phrase, une bande =========================
              Entre la mosaique et les jauges, un ecran qui ne dit qu une
              chose : la page se tait, et la nappe reprend la main. */}
          <section
            aria-labelledby="promesse-titre"
            className="o-relative o-isolate o-overflow-hidden o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-28 md:o-py-40"
          >
            <Nappe couleurs={[accent(200), accent(100), accent(300)]} opacite={0.4} />
            <div className="o-relative o-mx-auto o-grid o-max-w-7xl o-gap-8 md:o-grid-cols-12">
              <h2 id="promesse-titre" className="o-sr-only">
                Ce que Coteau remplace
              </h2>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-3">
                Le parti pris
              </p>
              <div className="md:o-col-span-9">
                <Manifeste
                  sombre={false}
                  eteint="Vous n avez pas besoin d un modele de donnees, ni d un atelier de trois semaines pour le construire."
                >
                  Vous avez besoin de savoir qui est parti, quand, et sur quel ecran.
                </Manifeste>
              </div>
            </div>
          </section>

          {/* ================= (03) Les jauges ===============================
              Des anneaux sur filets, jamais trois cartes bordees : le filet
              d un pixel vient de l ecart de la grille sur un fond teinte. */}
          <section
            aria-labelledby="jauges-titre"
            className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-px-6 o-py-24 md:o-py-32"
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 lg:o-grid-cols-12 lg:o-items-center">
              <div className="lg:o-col-span-5">
                <Indice rang="03" sombre={false}>
                  La premiere semaine
                </Indice>
                <h2
                  id="jauges-titre"
                  className="o-m-0 o-mt-5 o-text-zinc-950 dark:o-text-zinc-50"
                  style={{ ...affiche('m', 800), fontSize: 'clamp(2rem, 4vw, 3.75rem)' }}
                >
                  Ce que Vallonis a vu en quatre jours.
                </h2>
                <p className="o-mt-5 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  Trois jauges, tirees du tableau de bord ci-dessus. La troisieme est la
                  fuite que personne ne voyait sur l ecran de paiement.
                </p>
              </div>
              <ul
                className="o-m-0 o-grid o-list-none o-grid-cols-1 o-gap-px o-p-0 sm:o-grid-cols-3 lg:o-col-span-7"
                style={{ backgroundColor: GRILLE }}
              >
                {[
                  { valeur: 44, quoi: 'de retention a quatre semaines' },
                  { valeur: 41, quoi: 'd activation apres inscription' },
                  { valeur: 39, quoi: 'de sortie sur l ecran de paiement' },
                ].map((jauge) => (
                  <li
                    key={jauge.quoi}
                    className="o-flex o-flex-col o-items-center o-bg-zinc-50 dark:o-bg-zinc-900 o-px-4 o-py-10 o-text-center"
                  >
                    <ProgressRing
                      value={jauge.valeur}
                      size={140}
                      thickness={6}
                      label={jauge.quoi}
                      className={`o-text-2xl o-font-extrabold ${VALEUR}`}
                      style={{ '--o-ring-tint': ENCRE } as CSSProperties}
                    />
                    <p
                      className="o-m-0 o-mt-5 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400"
                      style={{ maxWidth: '11rem' }}
                    >
                      {jauge.quoi}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* ================= (04) Les tarifs ============================== */}
          <section
            id="tarifs"
            className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              {/* L intitule des tarifs ne se compose pas comme celui des
                  lectures : le titre tient sept colonnes, la phrase les cinq
                  autres, et les deux s alignent sur la meme ligne de pied. */}
              <div className="o-grid o-gap-x-10 o-gap-y-6 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Indice rang="04" sombre={false}>
                    Les tarifs
                  </Indice>
                  <h2
                    className="o-m-0 o-mt-5 o-text-balance o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 800),
                      fontSize: 'clamp(2rem, 4.5vw, 4.25rem)',
                    }}
                  >
                    Le prix affiche est le prix paye.
                  </h2>
                </div>
                <p className="o-m-0 o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-5">
                  Facture au nombre d evenements traites, jamais au nombre de sieges.
                  Placez la reglette : les trois paliers sont chiffres en meme temps.
                </p>
              </div>

              <div className="o-mt-12">
                <Calculateur />
              </div>

              {/*
                La piece peint l offre mise en avant a l encre courante : bordure et
                bouton tombent en zinc. Les deux regles la remettent dans la teinte du
                modele — nuance 900 pour le bouton, seule nuance assez foncee pour
                porter du texte clair avec toute couleur choisie.
              */}
              <style>
                {[
                  '#tarifs [data-o-tier].o-shadow-lg{border-color:var(--o-vitrine-500)}',
                  '#tarifs [data-o-tier].o-shadow-lg button{background-color:var(--o-vitrine-900) !important;color:var(--o-vitrine-50) !important}',
                ].join('')}
              </style>

              <PricingTiers
                className="o-mt-10"
                yearlyDiscount={0.2}
                locale="fr-FR"
                tiers={[
                  {
                    name: 'Depart',
                    monthly: 0,
                    note: 'Jusqu a 100 000 evenements par mois',
                    cta: 'Ouvrir un compte',
                    features: [
                      'Un projet, trois membres',
                      'Parcours et cohortes',
                      'Historique de 3 mois',
                      'Support par courriel',
                    ],
                  },
                  {
                    name: 'Equipe',
                    monthly: 790,
                    note: 'Jusqu a 10 millions d evenements, puis 55 EUR le million',
                    cta: 'Demarrer l essai',
                    featured: true,
                    features: [
                      'Projets et membres illimites',
                      'Segments partages et alertes',
                      'Historique de 24 mois',
                      'Rapports programmes',
                      'Hebergement au choix parmi quatre regions',
                      'Reponse sous 4 heures ouvrees',
                    ],
                  },
                  {
                    name: 'Entreprise',
                    monthly: 2400,
                    note: 'Jusqu a 100 millions d evenements, puis 18 EUR le million',
                    cta: 'Parler a un conseiller',
                    features: [
                      'Authentification unique et SCIM',
                      'Journal d audit exportable',
                      'Environnement dedie',
                      'Historique illimite',
                      'Engagement de service a 99,99 %',
                      'Ingenieur d integration nomme',
                    ],
                  },
                ]}
              />

              <ul className="o-m-0 o-mt-8 o-flex o-flex-wrap o-list-none o-gap-x-8 o-gap-y-3 o-p-0 o-text-sm o-text-zinc-700 dark:o-text-zinc-300">
                {[
                  { icone: Lock, texte: 'Certifie ISO 27001 et SOC 2 type II' },
                  { icone: Database, texte: 'Export brut de vos donnees a tout moment' },
                  { icone: Users, texte: 'Sieges illimites sur toutes les offres' },
                  { icone: Clock, texte: 'Resiliation en un clic, sans preavis' },
                ].map((mention) => (
                  <li key={mention.texte} className="o-flex o-items-center o-gap-2">
                    <Icon
                      icon={mention.icone}
                      size={16}
                      style={{ color: ENCRE }}
                      aria-hidden="true"
                    />
                    {mention.texte}
                  </li>
                ))}
              </ul>

              <div className="o-mt-20 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-12">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Face aux deux outils que vous evaluez
                </p>
                <div className="o-mt-6">
                  <Comparatif />
                </div>
              </div>
            </div>
          </section>

          {/* ================= (05) L appel : un ecran vide, un bouton ====== */}
          <section
            id="essai"
            aria-labelledby="essai-titre"
            className="o-scroll-mt-24 o-relative o-flex o-flex-col o-items-center o-justify-center o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6"
            style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
          >
            <h2 id="essai-titre" className="o-sr-only">
              Commencer l essai
            </h2>
            <Aimant force={0.4}>
              <a
                href="#sommet"
                className="o-inline-flex o-items-center o-gap-3 o-rounded-full o-px-10 o-py-5 o-text-lg o-font-semibold o-no-underline o-shadow-xl focus:o-ring md:o-text-xl"
                style={aplat()}
              >
                Commencer l essai <Icon icon={ArrowRight} size={20} aria-hidden="true" />
              </a>
            </Aimant>
            <p className="o-absolute o-bottom-8 o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              Quatorze jours · vos donnees · aucune carte
            </p>
          </section>
        </main>

        {/* ================= Le pied, fixe derriere la page ================= */}
        <PiedColle hauteur={560}>
          <footer
            className="o-relative o-isolate o-flex o-h-full o-flex-col o-justify-between o-overflow-hidden o-px-6 o-pb-8 o-pt-14 o-text-zinc-50"
            style={nuit('zinc')}
          >
            <Nappe couleurs={[accent(500), accent(800), accent(700)]} opacite={0.35} />
            <div className="o-relative o-mx-auto o-grid o-w-full o-max-w-7xl o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-6">
                <p className="o-m-0 o-flex o-items-center o-gap-2 o-text-base o-font-bold o-tracking-tight">
                  <span
                    aria-hidden="true"
                    className="o-flex o-size-6 o-items-center o-justify-center o-rounded-sm"
                    style={{
                      backgroundColor: accent(300),
                      color: 'var(--o-palette-zinc-950)',
                    }}
                  >
                    <Icon icon={LineChart} size={14} />
                  </span>
                  Coteau
                </p>
                <p
                  className="o-m-0 o-mt-6 o-max-w-md o-text-zinc-50"
                  style={{
                    ...affiche('m', 800),
                    fontSize: 'clamp(1.75rem, 3.2vw, 3rem)',
                  }}
                >
                  Vos entonnoirs, reconstruits en une apres-midi.
                </p>
                <p className="o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                  14 rue de la Fonderie, 44000 Nantes
                  <br />
                  contact@coteau.example
                </p>
              </div>
              <div className="o-grid o-gap-8 sm:o-grid-cols-3 lg:o-col-span-6">
                {[
                  {
                    titre: 'Produit',
                    liens: ['Parcours', 'Cohortes', 'Segments', 'Rapports programmes'],
                  },
                  {
                    titre: 'Ressources',
                    liens: [
                      'Documentation',
                      'Journal des versions',
                      'Etat du service',
                      'Guide de migration',
                    ],
                  },
                  {
                    titre: 'Societe',
                    liens: [
                      'A propos',
                      'Nous rejoindre',
                      'Mentions legales',
                      'Confidentialite',
                    ],
                  },
                ].map((colonne) => (
                  <nav key={colonne.titre} aria-label={colonne.titre}>
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                      {colonne.titre}
                    </p>
                    <ul className="o-m-0 o-mt-4 o-list-none o-space-y-2 o-p-0">
                      {colonne.liens.map((lien) => (
                        <li key={lien}>
                          <a
                            href="#sommet"
                            className="o-text-sm o-no-underline o-text-zinc-300 o-transition-colors hover:o-text-zinc-50 focus:o-ring"
                          >
                            {lien}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ))}
              </div>
            </div>
            <div className="o-relative o-mx-auto o-flex o-w-full o-max-w-7xl o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-white-10 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              <p className="o-m-0 o-flex o-items-center o-gap-2">
                <Icon icon={Globe} size={13} aria-hidden="true" />
                Paris · Francfort · Stockholm · Montreal
              </p>
              <p className="o-m-0">© 2026 Coteau SAS — societe fictive</p>
            </div>
          </footer>
        </PiedColle>
      </div>
    </Porte>
  )
}
