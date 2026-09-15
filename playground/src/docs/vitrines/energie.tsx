/**
 * Courant — producteur d energie renouvelable.
 *
 * ## L architecture : un compteur, puis un rapport d activite
 *
 * Landing page complete dont le **milieu est un rapport annuel**, et c est ce
 * qui n appartient qu a elle. Un producteur d electricite se juge sur le
 * document qu il est presque oblige de produire : la page en prend la forme
 * entiere apres l ouverture — sommaire pagine, chapitres numerotes, figures
 * legendees, tableau du parc, notes de bas de page appelees par un exposant,
 * colophon date.
 *
 * L enchainement :
 *
 * - **l affiche** : un parc en plein cadre, le titre vu a travers la
 *   photographie, les metadonnees aux coins ;
 * - **la production en direct** : ce que les onze parcs envoient sur le
 *   reseau a la minute, en compteurs qui roulent — le seul endroit de la page
 *   ou un chiffre est mis en scene ;
 * - **le rapport** : sommaire, exercice avec sa figure mensuelle, parc en
 *   tableau precede de trois planches qui derivent, reseau ouvert par le
 *   maillage elastique, contrats de vente, engagements, notes ;
 * - **un ecran vide avec un seul bouton aimante** ;
 * - **le colophon**, fixe derriere la page, decouvert quand on arrive en bas.
 *
 * ## Le mouvement
 *
 * Une barre de lecture suit le rapport de bout en bout, les planches du parc
 * derivent contre le defilement, et le pied ne bouge pas : c est la page qui
 * glisse dessus. Un document long se lit ainsi — on sait ou l on en est, et la
 * derniere page attend deja dessous.
 *
 * ## Le fond
 *
 * La nappe elastique ouvre le chapitre trois, celui du reseau — un maillage
 * qui se tend, comme une ligne a haute tension sous contrainte. Elle porte un
 * numero de figure et une legende : dans un rapport, rien n est pose sans
 * reference.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight, Sun, Waves, Wind } from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import { useEffect, useMemo, useState, type ReactElement } from 'react'

import { ElasticMesh } from '@/odoro/background/ElasticMesh.jsx'
import { ScrollProgress } from '@/odoro/effect/ScrollProgress.jsx'
import { CountUp } from '@/odoro/text/CountUp.jsx'
import { MaskedHeading } from '@/odoro/text/MaskedHeading.jsx'
import { SegmentedControl } from '@/odoro/ui/SegmentedControl.jsx'

import { nuit, Voile } from './communs.jsx'
import { photo } from './media.js'
import { accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreFilet,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Porte,
  Surgit,
  usePolices,
} from './marche.jsx'
import { Aimant, Devoile, Parallaxe, PiedColle } from './scene.jsx'

/** Les filieres exploitees. */
const FILIERES = ['Eolien', 'Solaire', 'Hydraulique'] as const
type Filiere = (typeof FILIERES)[number]

/** Un parc en exploitation. */
interface Parc {
  readonly nom: string
  readonly departement: string
  readonly filiere: Filiere
  readonly puissance: number
  readonly charge: number
  readonly production: number
  readonly service: number
  readonly note?: number
}

/**
 * Le parc d exploitation au 31 decembre 2025.
 *
 * Les facteurs de charge sont ceux du metier : autour de 27 % en eolien
 * terrestre, 16 % en solaire, plus de 40 % en hydraulique de fil de l eau. Un
 * portefeuille homogene a 40 % ne serait pas credible.
 */
const PARCS: readonly Parc[] = [
  {
    nom: 'Plateau de Vensac',
    departement: 'Gironde',
    filiere: 'Eolien',
    puissance: 68,
    charge: 27.4,
    production: 163,
    service: 2019,
    note: 1,
  },
  {
    nom: 'Coteaux de Meze',
    departement: 'Herault',
    filiere: 'Solaire',
    puissance: 54,
    charge: 16.8,
    production: 79,
    service: 2022,
    note: 2,
  },
  {
    nom: 'Barrage de Tresque',
    departement: 'Ardeche',
    filiere: 'Hydraulique',
    puissance: 18,
    charge: 44.2,
    production: 70,
    service: 2016,
  },
  {
    nom: 'Bois de Cerisy',
    departement: 'Manche',
    filiere: 'Eolien',
    puissance: 42,
    charge: 29.1,
    production: 107,
    service: 2021,
    note: 3,
  },
  {
    nom: 'Plaine de Lauris',
    departement: 'Vaucluse',
    filiere: 'Solaire',
    puissance: 61,
    charge: 17.9,
    production: 96,
    service: 2024,
  },
  {
    nom: 'Mont Chauve',
    departement: 'Aveyron',
    filiere: 'Eolien',
    puissance: 51,
    charge: 26.2,
    production: 117,
    service: 2018,
    note: 4,
  },
  {
    nom: 'Ecluse de Rive',
    departement: 'Saone-et-Loire',
    filiere: 'Hydraulique',
    puissance: 9,
    charge: 41.8,
    production: 33,
    service: 2015,
  },
  {
    nom: 'Landes de Kervin',
    departement: 'Morbihan',
    filiere: 'Eolien',
    puissance: 36,
    charge: 28.7,
    production: 91,
    service: 2023,
    note: 5,
  },
  {
    nom: 'Toitures de Saint-Priest',
    departement: 'Rhone',
    filiere: 'Solaire',
    puissance: 22,
    charge: 15.1,
    production: 29,
    service: 2023,
  },
  {
    nom: 'Val de Vire',
    departement: 'Calvados',
    filiere: 'Eolien',
    puissance: 33,
    charge: 27.9,
    production: 81,
    service: 2020,
  },
  {
    nom: 'Canal de Mielan',
    departement: 'Gers',
    filiere: 'Hydraulique',
    puissance: 6,
    charge: 39.4,
    production: 21,
    service: 2017,
  },
]

/**
 * La production mensuelle de l exercice, en gigawattheures.
 *
 * La somme vaut huit cent quatre-vingt-sept : un rapport dont la figure ne
 * tombe pas sur le total annonce n est pas un rapport. L hiver porte l eolien,
 * l ete le solaire, et l ecart entre les deux saisons est le sujet du
 * chapitre.
 */
const MENSUEL: readonly (readonly [string, number])[] = [
  ['J', 96],
  ['F', 88],
  ['M', 82],
  ['A', 71],
  ['M', 63],
  ['J', 56],
  ['J', 58],
  ['A', 60],
  ['S', 64],
  ['O', 75],
  ['N', 86],
  ['D', 88],
]

/** Les notes de bas de page, appelees dans le tableau. */
const NOTES: readonly string[] = [
  'Bridage nocturne de mai a octobre pour les chiropteres, prescrit par l arrete d exploitation. Perte de production evaluee a 3,1 %, deduite du chiffre porte au tableau.',
  'Pacage ovin maintenu sous les tables : deux cent quarante brebis, convention avec deux eleveurs, renouvelee en 2025 pour six ans.',
  'La commune percoit 41 % de la fiscalite du parc, contre 20 % au regime de droit commun, par deliberation de la communaute de communes.',
  'Givre constate huit jours par an en moyenne. Chauffage de pales installe en 2022, apres deux hivers de mesure ; la perte residuelle est de 0,8 %.',
  'Hauteur bridee a 150 metres en bout de pale par contrainte radar. Perte evaluee a 4 %, connue des l etude et integree au plan d affaires.',
]

/** Les chapitres du rapport, tels que le sommaire les annonce. */
const SOMMAIRE: readonly (readonly [string, string, string, string])[] = [
  ['1', 'exercice', 'L exercice 2025', 'Production mois par mois'],
  ['2', 'parc', 'Le parc d exploitation', 'Onze sites, filiere par filiere'],
  ['3', 'reseau', 'Reseau et effacement', 'Ce que le gestionnaire nous demande'],
  ['4', 'offres', 'Vendre le courant', 'Trois contrats, trois prix'],
  ['5', 'engagements', 'Engagements', 'Demantelement, approvisionnement, capital'],
  ['6', 'notes', 'Notes', 'Cinq renvois du chapitre 2'],
]

/** Les trois facons dont le courant se vend, et ce que chacune rapporte. */
const CONTRATS: readonly (readonly [string, string, string, string])[] = [
  [
    '4.1',
    'Contrat de gre a gre',
    '68 EUR / MWh',
    'Douze a vingt ans, a partir de cinq gigawattheures par an, indexe sur l inflation et non sur le marche de gros. Trente-quatre pour cent du chiffre de l exercice.',
  ],
  [
    '4.2',
    'Complement de remuneration',
    '82 EUR / MWh',
    'Le dispositif public, pour les parcs laureats d appel d offres. Quand le marche passe au-dessus du tarif de reference, nous reversons la difference — cela a represente onze millions en 2025.',
  ],
  [
    '4.3',
    'Vente au jour le jour',
    'Prix spot',
    'Le solde, place sur le marche de gros. C est la part qui varie, celle qui a fait l exercice 2022, et celle que nous cherchons a reduire annee apres annee.',
  ],
]

/** Les engagements, en articles de rapport. */
const ENGAGEMENTS: readonly (readonly [string, string, string])[] = [
  [
    '5.1',
    'Provision de demantelement',
    'Cinquante mille euros par machine, places sur un compte sequestre des la mise en service. La reglementation en exige trente mille ; l ecart est volontaire et porte au bilan.',
  ],
  [
    '5.2',
    'Origine des composants',
    'Aciers de Sarrebruck, pales de Lunderskov, betons de la carriere la plus proche du site. Aucun composant principal n a traverse un ocean sur l exercice.',
  ],
  [
    '5.3',
    'Structure du capital',
    'Detenu par les deux fondateurs, les salaries a 14 %, et deux fonds regionaux. Aucun actionnaire hors de France. Six parcs comptent en plus des habitants au capital.',
  ],
  [
    '5.4',
    'Financement participatif',
    'Onze cent quarante souscripteurs, dont sept cents dans le departement du parc concerne. Taux fixe de 5 % sur sept ans, servi sans incident depuis 2019.',
  ],
]

/** L icone d une filiere. */
function iconeFiliere(filiere: Filiere): typeof Wind {
  if (filiere === 'Eolien') return Wind
  if (filiere === 'Solaire') return Sun
  return Waves
}

/** L image qui illustre chaque filiere, et ce qu elle montre. */
const FILIERE_IMAGE: Readonly<Record<Filiere, readonly [string, string]>> = {
  Eolien: ['courant-cerisy', 'Eoliennes terrestres dans un paysage agricole'],
  Solaire: ['courant-lauris', 'Rangees de panneaux photovoltaiques au sol'],
  Hydraulique: ['courant-tresque', 'Amenagement hydroelectrique au fil de l eau'],
}

/**
 * La puissance instantanee de chaque filiere, au pas de releve donne.
 *
 * Une onde lente par filiere, dephasee, plutot qu un tirage au sort : le
 * compteur doit deriver comme un parc derive — le vent tombe et remonte sur
 * des heures, le soleil suit la course du jour, l eau ne bouge presque pas.
 * Une valeur tiree au hasard sauterait, et personne ne croirait le compteur.
 */
function productionDirecte(pas: number): Readonly<Record<Filiere, number>> {
  const onde = (base: number, amplitude: number, phase: number): number =>
    Math.max(0, Math.round(base + amplitude * Math.sin((pas + phase) / 3.2)))
  return {
    Eolien: onde(138, 27, 0),
    Solaire: onde(57, 15, 2.1),
    Hydraulique: onde(25, 3, 5.4),
  }
}

/** Un intitule de chapitre du rapport : le numero en mono, puis le titre. */
function Chapitre({
  rang,
  children,
}: {
  readonly rang: string
  readonly children: string
}): ReactElement {
  return (
    <h2 className="o-m-0 o-flex o-items-baseline o-gap-4 o-text-xl o-font-semibold o-tracking-tight">
      <span className="o-font-mono o-text-sm o-tabular-nums" style={{ color: encre() }}>
        {rang}
      </span>
      {children}
    </h2>
  )
}

/**
 * La production en direct : trois filieres, un total qui roule.
 *
 * C est la forme de chiffres attribuee a cette vitrine — des compteurs qui
 * roulent — et le seul endroit de la page ou un nombre est mis en scene. Le
 * reste des chiffres vit dans le tableau du parc, a sa place.
 */
function Direct(): ReactElement {
  const [pas, setPas] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => {
      setPas((precedent) => precedent + 1)
    }, 8000)
    return () => {
      window.clearInterval(id)
    }
  }, [])

  const courant = productionDirecte(pas)
  const precedent = productionDirecte(pas - 1)
  const total = FILIERES.reduce((somme, nom) => somme + courant[nom], 0)
  const totalPrecedent = FILIERES.reduce((somme, nom) => somme + precedent[nom], 0)

  return (
    <section
      id="direct"
      aria-labelledby="direct-titre"
      className="o-relative o-isolate o-scroll-mt-24 o-overflow-hidden o-px-6 o-py-20 md:o-px-14 md:o-py-28"
      style={nuit('zinc')}
    >
      <div className="o-mx-auto o-max-w-6xl">
        <p className="o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
          <span
            aria-hidden="true"
            className="o-size-1.5 o-rounded-full"
            style={{ backgroundColor: encreSurSombre() }}
          />
          En ce moment sur le reseau
        </p>

        <div className="o-mt-10 o-grid o-items-end o-gap-x-10 o-gap-y-8 md:o-grid-cols-12">
          <h2
            id="direct-titre"
            className="o-m-0 o-text-balance o-text-zinc-50 md:o-col-span-5"
            style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3rem)' }}
          >
            Ce que les onze parcs envoient, a la minute.
          </h2>

          <p className="o-m-0 o-flex o-items-baseline o-justify-start o-gap-4 o-tabular-nums o-text-zinc-50 md:o-col-span-7 md:o-justify-end">
            <span
              aria-hidden="true"
              style={{
                ...affiche('xxl', 300),
                fontSize: 'clamp(4rem, 15vw, 13rem)',
                lineHeight: 0.82,
              }}
            >
              <CountUp
                key={total}
                value={total}
                from={totalPrecedent}
                duration={1100}
                locale="fr-FR"
                declenchement="montage"
              />
            </span>
            <span className="o-sr-only">{total} megawatts</span>
            <span
              aria-hidden="true"
              className="o-font-mono o-text-sm o-uppercase o-tracking-widest o-text-zinc-400"
            >
              MW
            </span>
          </p>
        </div>

        <dl className="o-m-0 o-mt-14 o-border-t o-border-white-10">
          {FILIERES.map((nom) => {
            const valeur = courant[nom]
            const part = Math.round((valeur / total) * 100)
            return (
              <div
                key={nom}
                className="o-grid o-items-center o-gap-x-6 o-gap-y-2 o-border-b o-border-white-10 o-py-5 md:o-grid-cols-12"
              >
                <dt className="o-flex o-items-center o-gap-2.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-300 md:o-col-span-3">
                  <Icon
                    icon={iconeFiliere(nom)}
                    size={14}
                    style={{ color: encreSurSombre() }}
                    aria-hidden="true"
                  />
                  {nom}
                </dt>
                <dd className="o-m-0 o-flex o-items-center o-gap-5 md:o-col-span-9">
                  <span
                    aria-hidden="true"
                    className="o-h-1.5 o-min-w-0 o-grow o-overflow-hidden o-rounded-full o-bg-white-10"
                  >
                    <span
                      className="o-block o-h-full o-rounded-full"
                      style={{
                        width: `${String(part)}%`,
                        backgroundColor: encreSurSombre(),
                        transition: 'width 1100ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </span>
                  <span className="o-w-24 o-shrink-0 o-text-right o-font-mono o-text-lg o-tabular-nums o-text-zinc-50">
                    <CountUp
                      key={`${nom}-${String(valeur)}`}
                      value={valeur}
                      from={precedent[nom]}
                      duration={1100}
                      locale="fr-FR"
                      declenchement="montage"
                    />
                    <span className="o-ml-1 o-text-xs o-text-zinc-400">MW</span>
                  </span>
                </dd>
              </div>
            )
          })}
        </dl>

        <p className="o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
          Quatre cent douze megawatts installes — le compteur se rafraichit toutes les dix
          minutes, et ce qui suit est le rapport de l exercice clos.
        </p>
      </div>
      <Grain opacite={0.05} />
    </section>
  )
}

/** La vitrine complete : un compteur, puis un rapport annuel. */
export default function Page(): ReactElement {
  const polices = usePolices('inter')
  const [filiere, setFiliere] = useState<Filiere | 'Toutes'>('Toutes')

  const lignes = useMemo(
    () => PARCS.filter((p) => filiere === 'Toutes' || p.filiere === filiere),
    [filiere],
  )

  const totaux = useMemo(() => {
    const puissance = lignes.reduce((s, p) => s + p.puissance, 0)
    const production = lignes.reduce((s, p) => s + p.production, 0)
    // Le facteur d un ensemble est la production sur la puissance, pas la
    // moyenne des facteurs : un grand parc pese davantage.
    const charge = puissance === 0 ? 0 : (production * 1000) / (puissance * 8.76) / 10
    return { puissance, production, charge }
  }, [lignes])

  const maximumMensuel = Math.max(...MENSUEL.map(([, valeur]) => valeur))

  return (
    <Porte forme="compteur" marque="Courant">
      <div
        className="o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-100"
        style={polices}
      >
        {/* La lecture d un rapport se mesure : la barre dit ou l on en est. */}
        <ScrollProgress className="o-z-40" thickness={2} style={{ top: CHROME }} />

        {/* ================= L affiche : le parc, le titre vu au travers ===== */}
        <header
          className="o-relative o-isolate o-overflow-hidden"
          style={{ ...nuit('zinc'), minHeight: '100vh' }}
        >
          <img
            src={photo('courant-vensac', 1800, 1100)}
            alt=""
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0 o-size-full o-object-cover"
          />
          {/* Un ciel de midi est plus clair que le titre qui s y decoupe : le
            voile en degrade ne suffit pas, il faut d abord baisser la
            photographie d un cran, partout. */}
          <div
            aria-hidden="true"
            className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
            style={{
              backgroundColor:
                'color-mix(in oklab, var(--o-palette-zinc-950) 46%, transparent)',
            }}
          />
          <Voile sens="haut-bas" />
          <Grain />

          <BarreFilet
            marque="Courant"
            liens={[
              ['#direct', 'En direct'],
              ['#parc', 'Le parc'],
              ['#offres', 'Vendre'],
              ['#engagements', 'Engagements'],
            ]}
            action={['#terrain', 'J ai du terrain']}
          />

          <div
            id="haut"
            className="o-relative o-z-10 o-mx-auto o-flex o-max-w-6xl o-flex-col o-justify-end o-px-6 o-pb-24 o-pt-16 md:o-px-14"
            style={{ minHeight: 'calc(100vh - 81px)' }}
          >
            <Surgit>
              <Etiquette>Exercice 2025 — onze parcs en exploitation</Etiquette>
            </Surgit>
            <Surgit delai={120} className="o-mt-7">
              <MaskedHeading
                as="h1"
                src={photo('courant-chauve', 1400, 800)}
                zoom={240}
                speed={16000}
                className="o-m-0 o-block o-max-w-4xl"
                style={{
                  ...affiche('xl', 700),
                  fontSize: 'clamp(2.5rem, 7.5vw, 7.5rem)',
                }}
              >
                887 gigawattheures, releves au compteur.
              </MaskedHeading>
            </Surgit>
            <Surgit
              delai={420}
              as="p"
              className="o-m-0 o-mt-7 o-max-w-md o-text-lg o-leading-relaxed o-text-zinc-300"
            >
              Pas au dimensionnement, pas en puissance installee : au compteur, et
              transmis au gestionnaire de reseau.
            </Surgit>
            <Surgit delai={540} className="o-mt-9">
              <Actions
                pleine={[
                  '#direct',
                  <>
                    Voir le compteur{' '}
                    <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                  </>,
                ]}
                fantome={['#parc', 'Les onze parcs']}
              />
            </Surgit>
          </div>

          <Coin position="bg">
            Rapport d activite
            <br />
            Arrete le 12 mars 2026
          </Coin>
          <Coin position="bd">
            Bordeaux — quai de Paludate
            <br />
            Producteur declare, CRE
          </Coin>
        </header>

        <main>
          {/* ================= Le compteur, en direct (C4) ================== */}
          <Direct />

          {/* ----- Le sommaire pagine ------------------------------------------- */}
          <nav
            aria-label="Sommaire"
            className="o-mx-auto o-max-w-4xl o-px-6 o-pb-6 o-pt-20 md:o-px-14 md:o-pt-28"
          >
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              Rapport d activite 2025 — sommaire
            </p>
            <ol className="o-m-0 o-mt-6 o-flex o-list-none o-flex-col o-p-0">
              {SOMMAIRE.map(([rang, ancre, titre, quoi]) => (
                <li
                  key={ancre}
                  className="o-border-b o-border-zinc-200 dark:o-border-zinc-800"
                >
                  <a
                    href={`#${ancre}`}
                    className="o-flex o-flex-wrap o-items-baseline o-gap-x-5 o-gap-y-1 o-py-3.5 o-text-current dark:o-text-current o-no-underline focus:o-ring"
                  >
                    <span
                      className="o-w-6 o-font-mono o-text-sm o-tabular-nums"
                      style={{ color: encre() }}
                    >
                      {rang}
                    </span>
                    <span className="o-text-base o-font-medium o-tracking-tight">
                      {titre}
                    </span>
                    <span className="o-ml-auto o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                      {quoi}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* ----- 1. L exercice, et sa figure mensuelle ------------------------ */}
          <section
            id="exercice"
            aria-labelledby="exercice-titre"
            className="o-mx-auto o-max-w-4xl o-scroll-mt-24 o-px-6 o-py-12 md:o-px-14"
          >
            <div id="exercice-titre">
              <Chapitre rang="1">L exercice 2025</Chapitre>
            </div>
            <p className="o-mt-4 o-max-w-2xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
              Huit cent quatre-vingt-sept gigawattheures produits sur quatre cent douze
              megawatts installes, soit un facteur de charge d ensemble de 31,0 %. L
              effacement demande par le gestionnaire de reseau a represente 1,8 % de la
              production, indemnise au tarif du contrat.
            </p>

            <Reveal>
              <figure className="o-m-0 o-mt-10">
                <div
                  className="o-flex o-items-end o-gap-1.5 o-border-b o-border-zinc-300 dark:o-border-zinc-700"
                  role="img"
                  aria-label="Production mensuelle de l exercice 2025, de 56 gigawattheures en juin a 96 en janvier"
                  style={{ height: '180px' }}
                >
                  {MENSUEL.map(([mois, valeur], rang) => (
                    <span
                      key={`${mois}-${String(rang)}`}
                      className="o-flex o-h-full o-flex-1 o-flex-col o-justify-end o-gap-2"
                    >
                      <span className="o-font-mono o-text-xs o-tabular-nums o-text-zinc-500 dark:o-text-zinc-400">
                        {valeur}
                      </span>
                      <span
                        className="o-block o-w-full"
                        style={{
                          height: `${String(Math.round((valeur / maximumMensuel) * 78))}%`,
                          backgroundColor: valeur >= 86 ? encre() : accentDoux(500, 42),
                        }}
                      />
                    </span>
                  ))}
                </div>
                <div aria-hidden="true" className="o-mt-2 o-flex o-gap-1.5">
                  {MENSUEL.map(([mois], rang) => (
                    <span
                      key={`${mois}-${String(rang)}`}
                      className="o-flex-1 o-text-center o-font-mono o-text-xs o-uppercase o-text-zinc-500 dark:o-text-zinc-400"
                    >
                      {mois}
                    </span>
                  ))}
                </div>
                <figcaption className="o-mt-5 o-flex o-flex-wrap o-items-baseline o-gap-x-4 o-gap-y-1 o-font-mono o-text-xs">
                  <span className="o-font-bold" style={{ color: encre() }}>
                    Figure 1.1
                  </span>
                  <span className="o-text-zinc-600 dark:o-text-zinc-400">
                    Production mensuelle, en gigawattheures. L hiver porte l eolien, l ete
                    le solaire ; l ecart entre janvier et juin vaut quarante
                    gigawattheures.
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          </section>

          {/* ----- 2. Le parc : trois planches qui derivent, puis le tableau ---- */}
          <section
            id="parc"
            aria-labelledby="parc-titre"
            className="o-mx-auto o-max-w-4xl o-scroll-mt-24 o-px-6 o-py-12 md:o-px-14"
          >
            <div id="parc-titre">
              <Chapitre rang="2">Le parc d exploitation</Chapitre>
            </div>
            <p className="o-mt-4 o-max-w-2xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
              Onze sites, trois filieres, aucun projet en portefeuille qui ne soit pas
              deja autorise. Le facteur de charge de chaque ligne est celui de l exercice,
              pertes et bridages deduits.
            </p>

            {/* Trois planches de format different, decalees : un rapport a des
              planches hors texte, pas trois cartes de la meme taille. */}
            <div className="o-mt-12 o-grid o-grid-cols-12 o-gap-4 md:o-gap-6">
              <Parallaxe vitesse={0.14} className="o-col-span-7">
                <Devoile
                  src={photo(FILIERE_IMAGE.Eolien[0], 900, 1100)}
                  alt={FILIERE_IMAGE.Eolien[1]}
                  ratio="4 / 5"
                  depuis="bas"
                  derive={30}
                  legende="Planche A — Bois de Cerisy, Manche, 42 MW"
                />
              </Parallaxe>
              <Parallaxe vitesse={-0.1} className="o-col-span-5 o-self-end o-pb-12">
                <Devoile
                  src={photo(FILIERE_IMAGE.Solaire[0], 700, 900)}
                  alt={FILIERE_IMAGE.Solaire[1]}
                  ratio="3 / 4"
                  depuis="droite"
                  derive={24}
                  legende="Planche B — Plaine de Lauris, Vaucluse, 61 MW"
                />
              </Parallaxe>
              <Parallaxe
                vitesse={0.2}
                className="o-col-span-10 o-col-start-3"
                style={{ marginBottom: '-3rem' }}
              >
                <Devoile
                  src={photo(FILIERE_IMAGE.Hydraulique[0], 1200, 700)}
                  alt={FILIERE_IMAGE.Hydraulique[1]}
                  ratio="16 / 9"
                  depuis="gauche"
                  derive={36}
                  legende="Planche C — Barrage de Tresque, Ardeche, 18 MW, au fil de l eau"
                  className="o-shadow-2xl"
                />
              </Parallaxe>
            </div>

            {/* Quatre libelles ne tiennent pas dans trois cent trente pixels :
              le rail glisse au doigt plutot que de pousser la page. */}
            <div className="o-mt-24 o-max-w-full o-overflow-x-auto o-pb-1">
              <SegmentedControl
                label="Filtrer le tableau par filiere"
                value={filiere}
                options={[
                  { value: 'Toutes', label: 'Toutes' },
                  ...FILIERES.map((nom) => ({ value: nom, label: nom })),
                ]}
                onChange={(valeur) => {
                  setFiliere(valeur === 'Toutes' ? 'Toutes' : (valeur as Filiere))
                }}
              />
            </div>

            <div className="o-mt-6 o-overflow-x-auto o-scrollbar dark:o-scrollbar-dark">
              <table
                className="o-w-full o-text-sm"
                style={{ minWidth: '40rem', borderCollapse: 'collapse' }}
              >
                <caption className="o-sr-only">
                  Parc d exploitation au 31 decembre 2025
                </caption>
                <thead>
                  <tr className="o-border-b o-border-zinc-400 dark:o-border-zinc-600">
                    {[
                      'Site',
                      'Departement',
                      'Filiere',
                      'MW',
                      'Charge',
                      'GWh',
                      'Service',
                    ].map((entete) => (
                      <th
                        key={entete}
                        scope="col"
                        className="o-py-2 o-pr-5 o-text-left o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-wider o-text-zinc-500 dark:o-text-zinc-400"
                      >
                        {entete}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((p) => (
                    <tr
                      key={p.nom}
                      className="o-border-b o-border-zinc-200 dark:o-border-zinc-800"
                    >
                      <th
                        scope="row"
                        className="o-py-2.5 o-pr-5 o-text-left o-font-medium"
                      >
                        {p.nom}
                        {p.note !== undefined && (
                          <a
                            href="#notes"
                            className="o-ml-1 o-align-super o-font-mono o-text-xs o-no-underline focus:o-ring"
                            style={{ color: encre() }}
                            aria-label={`Note ${String(p.note)}`}
                          >
                            {p.note}
                          </a>
                        )}
                      </th>
                      <td className="o-py-2.5 o-pr-5 o-text-zinc-600 dark:o-text-zinc-400">
                        {p.departement}
                      </td>
                      <td className="o-py-2.5 o-pr-5">
                        <span className="o-inline-flex o-items-center o-gap-1.5 o-text-zinc-600 dark:o-text-zinc-400">
                          <Icon
                            icon={iconeFiliere(p.filiere)}
                            size={13}
                            aria-hidden="true"
                          />
                          {p.filiere}
                        </span>
                      </td>
                      <td className="o-py-2.5 o-pr-5 o-font-mono o-tabular-nums">
                        {p.puissance}
                      </td>
                      <td className="o-py-2.5 o-pr-5 o-font-mono o-tabular-nums">
                        {p.charge.toLocaleString('fr-FR')} %
                      </td>
                      <td className="o-py-2.5 o-pr-5 o-font-mono o-tabular-nums">
                        {p.production}
                      </td>
                      <td className="o-py-2.5 o-font-mono o-tabular-nums o-text-zinc-600 dark:o-text-zinc-400">
                        {p.service}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: accentDoux(500, 10) }}>
                    <th
                      scope="row"
                      className="o-py-3 o-pr-5 o-text-left o-font-mono o-text-xs o-uppercase o-tracking-wider"
                    >
                      Total
                    </th>
                    <td className="o-py-3 o-pr-5" />
                    <td className="o-py-3 o-pr-5 o-font-mono o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
                      {lignes.length} site{lignes.length > 1 ? 's' : ''}
                    </td>
                    <td
                      className="o-py-3 o-pr-5 o-font-mono o-font-bold o-tabular-nums"
                      style={{ color: encre() }}
                    >
                      {totaux.puissance}
                    </td>
                    <td
                      className="o-py-3 o-pr-5 o-font-mono o-font-bold o-tabular-nums"
                      style={{ color: encre() }}
                    >
                      {totaux.charge.toFixed(1)} %
                    </td>
                    <td
                      className="o-py-3 o-pr-5 o-font-mono o-font-bold o-tabular-nums"
                      style={{ color: encre() }}
                    >
                      {totaux.production}
                    </td>
                    <td className="o-py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
            <p
              aria-live="polite"
              className="o-mt-3 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400"
            >
              {lignes.length} site{lignes.length > 1 ? 's' : ''} sur {PARCS.length}. Les
              exposants renvoient aux notes du chapitre 6.
            </p>
          </section>

          {/* ----- 3. Le reseau, ouvert par le maillage ------------------------- */}
          <section
            id="reseau"
            aria-labelledby="reseau-titre"
            className="o-scroll-mt-24 o-pt-12"
          >
            <figure
              className="o-relative o-isolate o-m-0 o-overflow-hidden"
              style={nuit('zinc')}
            >
              <ElasticMesh
                className="o-h-64 o-w-full md:o-h-96"
                colors={['--o-theme-bg', '--o-vitrine-500', '--o-vitrine-300']}
                poster="o-bg-zinc-950"
              />
              <figcaption className="o-flex o-flex-wrap o-items-baseline o-gap-x-4 o-gap-y-1 o-border-t o-border-zinc-800 o-px-6 o-py-3 o-font-mono o-text-xs md:o-px-14">
                <span className="o-font-bold" style={{ color: encreSurSombre() }}>
                  Figure 3.1
                </span>
                <span className="o-text-zinc-400 dark:o-text-zinc-400">
                  Souplesse du reseau — representation schematique de la contrainte d
                  equilibre. Sans valeur de mesure.
                </span>
              </figcaption>
            </figure>

            <div className="o-mx-auto o-max-w-4xl o-px-6 o-py-12 md:o-px-14">
              <div id="reseau-titre">
                <Chapitre rang="3">Reseau et effacement</Chapitre>
              </div>
              <p className="o-mt-4 o-max-w-2xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                Lorsque le reseau ne peut pas absorber, le gestionnaire nous demande de
                reduire, et nous reduisons. Cela a represente 1,8 % de la production de l
                exercice, indemnise au tarif du contrat. Le detail par parc est tenu a
                disposition des souscripteurs.
              </p>
            </div>
          </section>

          {/* ----- 4. Vendre le courant ----------------------------------------- */}
          <section
            id="offres"
            aria-labelledby="offres-titre"
            className="o-mx-auto o-max-w-4xl o-scroll-mt-24 o-px-6 o-py-12 md:o-px-14"
          >
            <div id="offres-titre">
              <Chapitre rang="4">Vendre le courant</Chapitre>
            </div>
            <p className="o-mt-4 o-max-w-2xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
              Un producteur ne choisit pas son prix, il choisit sa duree. Voici les trois
              contrats sous lesquels les huit cent quatre-vingt-sept gigawattheures ont
              ete vendus, et ce que chacun rapporte au megawattheure.
            </p>
            <ol className="o-m-0 o-mt-10 o-list-none o-border-t o-border-zinc-300 dark:o-border-zinc-700 o-p-0">
              {CONTRATS.map(([rang, titre, prix, texte]) => (
                <li
                  key={rang}
                  className="o-grid o-gap-x-6 o-gap-y-3 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-py-7 md:o-grid-cols-12"
                >
                  <p
                    className="o-m-0 o-font-mono o-text-xs o-tabular-nums md:o-col-span-1"
                    style={{ color: encre() }}
                  >
                    {rang}
                  </p>
                  <div className="md:o-col-span-7">
                    <h3 className="o-m-0 o-text-lg o-font-semibold o-tracking-tight">
                      {titre}
                    </h3>
                    <p className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                      {texte}
                    </p>
                  </div>
                  <p
                    className="o-m-0 o-font-mono o-tabular-nums md:o-col-span-4 md:o-text-right"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)',
                      color: encre(),
                    }}
                  >
                    {prix}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* ----- 5. Les engagements ------------------------------------------- */}
          <section
            id="engagements"
            aria-labelledby="engagements-titre"
            className="o-mx-auto o-max-w-4xl o-scroll-mt-24 o-px-6 o-py-12 md:o-px-14"
          >
            <div id="engagements-titre">
              <Chapitre rang="5">Engagements</Chapitre>
            </div>
            <dl className="o-m-0 o-mt-6 o-flex o-flex-col o-gap-6">
              {ENGAGEMENTS.map(([rang, titre, texte]) => (
                <div key={rang} className="o-grid o-gap-x-5 o-gap-y-1 sm:o-grid-cols-12">
                  <dt
                    className="o-font-mono o-text-xs o-tabular-nums sm:o-col-span-1"
                    style={{ color: encre() }}
                  >
                    {rang}
                  </dt>
                  <div className="sm:o-col-span-11">
                    <p className="o-m-0 o-text-base o-font-semibold o-tracking-tight">
                      {titre}
                    </p>
                    <dd className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                      {texte}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </section>

          {/* ----- 6. Les notes -------------------------------------------------- */}
          <section
            id="notes"
            aria-labelledby="notes-titre"
            className="o-mx-auto o-max-w-4xl o-scroll-mt-24 o-px-6 o-py-12 md:o-px-14"
          >
            <div id="notes-titre">
              <Chapitre rang="6">Notes</Chapitre>
            </div>
            <ol className="o-m-0 o-mt-6 o-flex o-list-none o-flex-col o-gap-3.5 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-p-0 o-pt-6">
              {NOTES.map((texte, rang) => (
                <li
                  key={texte.slice(0, 24)}
                  className="o-grid o-gap-x-4 sm:o-grid-cols-12"
                >
                  <p
                    className="o-m-0 o-font-mono o-text-xs o-tabular-nums sm:o-col-span-1"
                    style={{ color: encre() }}
                  >
                    {rang + 1}
                  </p>
                  <p className="o-m-0 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 sm:o-col-span-11">
                    {texte}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* ================= L appel : un ecran vide, un seul bouton ======== */}
          <section
            id="terrain"
            aria-labelledby="terrain-titre"
            className="o-flex o-scroll-mt-24 o-flex-col o-items-center o-justify-center o-px-6 o-text-center"
            style={{ minHeight: '72vh' }}
          >
            <h2
              id="terrain-titre"
              className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
            >
              Trois hectares, mille metres carres de toiture, une commune
            </h2>
            <Aimant force={0.4} className="o-mt-12 o-max-w-full">
              <a
                href="#terrain"
                className="o-inline-flex o-max-w-full o-items-center o-gap-4 o-rounded-full o-px-10 o-py-6 o-text-xl o-font-semibold o-no-underline o-shadow-2xl focus:o-ring md:o-px-16 md:o-py-8 md:o-text-3xl"
                style={aplat()}
              >
                J ai du terrain
                <Icon icon={ArrowUpRight} size={28} aria-hidden="true" />
              </a>
            </Aimant>
            <p className="o-m-0 o-mt-12 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
              Reponse sous trois semaines, avec le rendement estime, le loyer propose et
              la part de fiscalite qui revient a la commune.
            </p>
          </section>
        </main>

        {/* ----- Le colophon, fixe derriere la page ---------------------------- */}
        <PiedColle hauteur={520}>
          <footer
            className="o-flex o-h-full o-flex-col o-justify-end o-px-6 o-pb-10 o-pt-14 md:o-px-14"
            style={nuit('zinc')}
          >
            <div className="o-mx-auto o-w-full o-max-w-4xl">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                Colophon
              </p>
              <p
                className="o-m-0 o-mt-6 o-max-w-2xl o-text-zinc-50"
                style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3rem)' }}
              >
                Courant Energie
              </p>
              <dl className="o-m-0 o-mt-10 o-grid o-gap-x-10 o-gap-y-5 o-border-t o-border-white-10 o-pt-8 o-font-mono o-text-xs sm:o-grid-cols-3">
                {(
                  [
                    ['Editeur', '5 quai de Paludate, 33800 Bordeaux'],
                    [
                      'Immatriculation',
                      'RCS Bordeaux 792 441 018 — capital de 9 200 000 EUR',
                    ],
                    ['Ecrire', 'territoires@courant-energie.fr'],
                  ] as const
                ).map(([quoi, valeur]) => (
                  <div key={quoi}>
                    <dt className="o-uppercase o-tracking-wider o-text-zinc-400">
                      {quoi}
                    </dt>
                    <dd className="o-m-0 o-mt-1.5 o-leading-relaxed o-text-zinc-100">
                      {valeur}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="o-m-0 o-mt-10 o-border-t o-border-white-10 o-pt-5 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                © 2026 — document arrete le 12 mars 2026 par la direction de l
                exploitation ; il ne constitue ni un document d information reglemente ni
                une invitation a souscrire.
              </p>
            </div>
          </footer>
        </PiedColle>
      </div>
    </Porte>
  )
}
