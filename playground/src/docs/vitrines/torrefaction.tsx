/**
 * Brulerie Nord — torrefacteur.
 *
 * ## L architecture : une gazette dont les origines s empilent
 *
 * Landing page complete dont le **coeur est un bulletin imprime**, et c est ce
 * qui n appartient qu a elle : manchette entre deux filets, edito coule sur
 * trois colonnes avec sa lettrine, cours des cafes en tableau de cotation, et
 * un ours en pied. Un torrefacteur qui trace ses grains jusqu a la parcelle
 * publie, en realite, un periodique.
 *
 * La signature de mouvement est l **empilement** : les six origines sont des
 * cartes qui se collent, retrecissent et passent l une sous l autre — la pile
 * de sacs de jute a l atelier, transposee au defilement.
 *
 * L enchainement :
 *
 * - **ouverture** : le sechage en plein cadre, le mot-marque chrome au bas du
 *   cadre ;
 * - **la manchette**, entre deux filets, avec sa vignette de dunes ;
 * - **01 / 02 / 03** en grands chiffres, avec les photographies de l atelier ;
 * - **l edito**, coule sur trois colonnes ;
 * - **le cours des cafes**, en tableau de cotation ;
 * - **les six origines empilees**, chacune avec sa parcelle et son profil ;
 * - **la boucle courbe** sur le sac de jute, en bichromie de journal ;
 * - **quatre nombres sur filets**, puis l abonnement ;
 * - **l appel** en un mot geant, et le pied au mot-marque pleine largeur.
 *
 * ## Le fond
 *
 * Les dunes tiennent la **vignette de manchette**, en bandeau etroit sous le
 * titre — l equivalent de la gravure qu un journal place sous son nom. Elles ne
 * reviennent plus ensuite : le reste est du papier.
 *
 * @module
 */

import { Dunes } from '@/odoro/background/Dunes.jsx'
import { Duotone } from '@/odoro/image/Duotone.jsx'
import { StickyStack } from '@/odoro/section/StickyStack.jsx'
import { CurvedLoop } from '@/odoro/text/CurvedLoop.jsx'
import { Icon } from '@odoro-cli/icons'
import {
  ArrowRight,
  Coffee,
  Flame,
  MapPin,
  Package,
  Repeat,
  Thermometer,
} from '@odoro-cli/icons/filaire'
import { useMemo, useState, type ReactElement } from 'react'

import { nuit } from './communs.jsx'
import { accent, accentDoux, aplat, encre } from './palettes.js'
import {
  Actions,
  affiche,
  Appel,
  BarreCoins,
  Chiffres,
  Croix,
  Grain,
  Horloge,
  Numerotee,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { photo } from './media.js'

const JOURS = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
] as const

/** Les mois, sans accent. */
const MOIS = [
  'janvier',
  'fevrier',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'aout',
  'septembre',
  'octobre',
  'novembre',
  'decembre',
] as const

/** Une date, ecrite comme sur le sachet : « mardi 2 septembre ». */
function dateLisible(date: Date): string {
  return `${JOURS[date.getDay()] ?? ''} ${String(date.getDate())} ${MOIS[date.getMonth()] ?? ''}`
}

/**
 * La date d une cuisson passee, et son age en jours.
 *
 * Le tambour ne tourne que le mardi et le vendredi a onze heures. Compter en
 * jours calendaires depuis aujourd hui donnerait des lots torrefies un
 * dimanche : on remonte donc de cuisson en cuisson, ce qui fait toujours
 * tomber la date sur un jour ou l atelier chauffe.
 *
 * @param rang Zero pour la derniere cuisson, un pour celle d avant.
 */
function cuisson(
  rang: number,
  aujourdhui: Date,
): { readonly date: Date; readonly jours: number } {
  const date = new Date(aujourdhui)
  date.setHours(11, 0, 0, 0)
  let trouvees = 0
  for (let pas = 0; pas < 200; pas += 1) {
    const jour = date.getDay()
    if ((jour === 2 || jour === 5) && date.getTime() <= aujourdhui.getTime()) {
      if (trouvees === rang) break
      trouvees += 1
    }
    date.setDate(date.getDate() - 1)
  }
  const jours = Math.max(
    0,
    Math.floor((aujourdhui.getTime() - date.getTime()) / 86_400_000),
  )
  return { date, jours }
}

/* ============================== Le rayon =============================== */

/** Le profil de tasse, en axes chiffres sur dix. */
interface Profil {
  readonly acidite: number
  readonly corps: number
  readonly sucre: number
}

/** Un sachet en vente. */
interface Sachet {
  readonly nom: string
  readonly pays: string
  readonly notes: readonly string[]
  /** Prix du 250 g, puis du kilo : le kilo n est pas quatre fois le 250 g. */
  readonly prix250: number
  readonly prix1000: number
  /** Sachets restants, format par format. Zero veut dire zero. */
  readonly stock250: number
  readonly stock1000: number
  readonly intensite: number
  readonly profil: Profil
  readonly graine: string
  readonly alt: string
  readonly altitude: string
  readonly traitement: string
  readonly variete: string
  readonly producteur: string
  readonly recolte: string
  /** Rang de la cuisson : zero pour la derniere sortie du tambour. */
  readonly cuisson: number
}

/** Les six references du moment. */
const SACHETS: readonly Sachet[] = [
  {
    nom: 'Guji Shakiso',
    pays: 'Ethiopie',
    notes: ['bergamote', 'the noir', 'abricot sec'],
    prix250: 14.5,
    prix1000: 52.0,
    stock250: 38,
    stock1000: 9,
    intensite: 2,
    profil: { acidite: 8, corps: 4, sucre: 6 },
    graine: 'cafe-guji',
    alt: 'Grains torrefies du Guji Shakiso, en gros plan',
    altitude: '1950 m',
    traitement: 'Nature',
    variete: 'Heirloom locales, 74110 et 74112',
    producteur: 'Station de Shakiso, 340 apporteurs',
    recolte: 'Novembre a janvier',
    cuisson: 0,
  },
  {
    nom: 'Huila La Esperanza',
    pays: 'Colombie',
    notes: ['praline', 'orange sanguine', 'cacao'],
    prix250: 12.9,
    prix1000: 46.0,
    stock250: 52,
    stock1000: 14,
    intensite: 3,
    profil: { acidite: 6, corps: 6, sucre: 7 },
    graine: 'cafe-huila',
    alt: 'Grains torrefies du Huila La Esperanza, sur bois clair',
    altitude: '1700 m',
    traitement: 'Lave',
    variete: 'Caturra et Castillo',
    producteur: 'Famille Ordonez, finca La Esperanza',
    recolte: 'Avril a juin',
    cuisson: 0,
  },
  {
    nom: 'Kayanza Gaharo',
    pays: 'Burundi',
    notes: ['cassis', 'sucre roux', 'jasmin'],
    prix250: 15.8,
    prix1000: 57.0,
    stock250: 11,
    stock1000: 0,
    intensite: 2,
    profil: { acidite: 9, corps: 5, sucre: 5 },
    graine: 'cafe-kayanza',
    alt: 'Grains verts du Kayanza Gaharo, avant torrefaction',
    altitude: '1800 m',
    traitement: 'Lave',
    variete: 'Bourbon rouge',
    producteur: 'Station de lavage Gaharo, 1 200 apporteurs',
    recolte: 'Mai a juillet',
    cuisson: 2,
  },
  {
    nom: 'Antigua El Panal',
    pays: 'Guatemala',
    notes: ['noisette grillee', 'caramel', 'pomme cuite'],
    prix250: 13.5,
    prix1000: 48.0,
    stock250: 24,
    stock1000: 6,
    intensite: 4,
    profil: { acidite: 5, corps: 7, sucre: 8 },
    graine: 'cafe-antigua',
    alt: 'Grains torrefies de l Antigua El Panal, sur fond sombre',
    altitude: '1550 m',
    traitement: 'Lave',
    variete: 'Bourbon et Caturra',
    producteur: 'Finca El Panal, famille Zelaya',
    recolte: 'Janvier a mars',
    cuisson: 2,
  },
  {
    nom: 'Melange Comptoir',
    pays: 'Bresil et Colombie',
    notes: ['chocolat noir', 'amande', 'melasse'],
    prix250: 11.0,
    prix1000: 38.0,
    stock250: 96,
    stock1000: 41,
    intensite: 5,
    profil: { acidite: 3, corps: 9, sucre: 7 },
    graine: 'cafe-comptoir',
    alt: 'Le melange Comptoir, apres torrefaction',
    altitude: '1200 a 1700 m',
    traitement: 'Assemblage, nature et lave',
    variete: 'Mundo Novo, Catuai, Castillo',
    producteur: 'Cooperatives de Minas Gerais et de Huila',
    recolte: 'Assemblage tenu toute l annee',
    cuisson: 0,
  },
  {
    nom: 'Yirgacheffe Konga',
    pays: 'Ethiopie',
    notes: ['citron vert', 'fleur blanche', 'miel'],
    prix250: 16.2,
    prix1000: 58.0,
    stock250: 0,
    stock1000: 0,
    intensite: 1,
    profil: { acidite: 9, corps: 3, sucre: 6 },
    graine: 'cafe-konga',
    alt: 'Le tambour de torrefaction, a l atelier',
    altitude: '2010 m',
    traitement: 'Lave',
    variete: 'Heirloom locales',
    producteur: 'Cooperative de Konga, 900 apporteurs',
    recolte: 'Decembre a fevrier',
    cuisson: 13,
  },
]

/* ============================ L abonnement ============================= */

/** Une frequence de livraison. */
interface Frequence {
  readonly cle: string
  readonly nom: string
  /** Livraisons par mois : quatre pour l hebdomadaire, la moyenne reelle. */
  readonly parMois: number
}

/** Les trois frequences proposees. */
const FREQUENCES: readonly Frequence[] = [
  { cle: 'mensuelle', nom: 'Une fois par mois', parMois: 1 },
  { cle: 'quinzaine', nom: 'Tous les quinze jours', parMois: 2 },
  { cle: 'hebdomadaire', nom: 'Chaque semaine', parMois: 4 },
]

/** Les quantites proposees a chaque livraison, en grammes. */
const QUANTITES: readonly number[] = [250, 500, 1000, 2000]

/** Le tarif boutique de reference, en euros par kilo. */
const PRIX_BOUTIQUE_KILO = 55

/**
 * La remise d abonnement, selon le volume mensuel.
 *
 * Elle n est pas commerciale mais logistique : un abonne a deux kilos par mois
 * remplit un lot entier de torrefaction, et le torrefacteur n a ni a stocker,
 * ni a prevoir. C est ce qui est rendu.
 */
function remise(grammesParMois: number): number {
  if (grammesParMois >= 4000) return 0.16
  if (grammesParMois >= 2000) return 0.12
  if (grammesParMois >= 1000) return 0.07
  if (grammesParMois >= 500) return 0.04
  return 0
}

/** L intensite, en grains pleins sur cinq. */
function Intensite({ valeur }: { readonly valeur: number }): ReactElement {
  return (
    <span className="o-inline-flex o-items-center o-gap-1">
      <span className="o-sr-only">Intensite {valeur} sur 5</span>
      {[1, 2, 3, 4, 5].map((rang) => (
        <span
          key={rang}
          aria-hidden="true"
          className={
            rang <= valeur
              ? 'o-inline-block o-size-2 o-rounded-full'
              : 'o-inline-block o-size-2 o-rounded-full o-bg-stone-300 dark:o-bg-stone-700'
          }
          style={rang <= valeur ? { backgroundColor: accent(600) } : undefined}
        />
      ))}
    </span>
  )
}

/** Un axe du profil de tasse, chiffre sur dix. */
function Axe({
  nom,
  valeur,
}: {
  readonly nom: string
  readonly valeur: number
}): ReactElement {
  return (
    <div className="o-flex o-items-center o-gap-3">
      <span className="o-w-20 o-shrink-0 o-text-sm o-text-stone-600 dark:o-text-stone-400">
        {nom}
      </span>
      <span
        className="o-h-2 o-min-w-0 o-flex-1 o-overflow-hidden o-rounded-full"
        style={{ backgroundColor: accentDoux(500, 14) }}
        aria-hidden="true"
      >
        <span
          className="o-block o-h-full o-rounded-full"
          style={{ width: `${String(valeur * 10)}%`, backgroundColor: accent(600) }}
        />
      </span>
      <span className="o-w-10 o-shrink-0 o-text-right o-text-sm o-font-semibold o-tabular-nums">
        {valeur}/10
      </span>
    </div>
  )
}

/** Un prix, en euros, a la francaise. */
function euros(valeur: number): string {
  return `${valeur.toFixed(2).replace('.', ',')} EUR`
}

/* ============================ Le rendu ============================ */

/** La tendance d un cours, deduite du stock restant. */
function tendance(sachet: Sachet): { readonly signe: string; readonly mot: string } {
  if (sachet.stock250 <= 12) return { signe: '▲', mot: 'tendu' }
  if (sachet.stock250 >= 40) return { signe: '▼', mot: 'abondant' }
  return { signe: '=', mot: 'stable' }
}

/* ============================ Ce que fait la maison ==================== */

/** Les trois temps de la maison, en grands chiffres avec leur photographie. */
const LES_TROIS = [
  {
    titre: 'On achete a la parcelle',
    texte:
      'Six producteurs, en direct, par lots de six cents kilos au plus. Le nom de la ferme ou de la station est ecrit sur le sachet, et le prix paye au kilo vert est publie.',
    graine: 'brulerie-huila',
    alt: 'Cerises mures, triees a la main a la recolte',
  },
  {
    titre: 'On torrefie le mardi',
    texte:
      'Par lots de douze kilos, une fois la commande de la semaine connue. Le vert dort en sacs de jute a l atelier ; il ne passe au tambour que la veille du depart.',
    graine: 'brulerie-kayanza',
    alt: 'Le depulpage, a la station de lavage',
  },
  {
    titre: 'On expedie le mercredi',
    texte:
      'Un sachet commande le jeudi part donc le mercredi suivant. C est plus lent qu ailleurs, et c est le seul moyen de vous envoyer un cafe de six jours plutot que de six semaines.',
    graine: 'brulerie-sacs',
    alt: 'Les sacs de vert, a la reception du lot',
  },
] as const

/**
 * Les quatre nombres du bulletin, sur filets.
 *
 * Ce sont les seuls chiffres mis en scene de la page : tout le reste est du
 * cours, du stock ou du profil, c est-a-dire de la donnee, pas une preuve.
 */
const NOMBRES = [
  { valeur: '6', quoi: 'origines, six producteurs nommes' },
  { valeur: '12', quoi: 'kilos par lot, le tambour n en prend pas plus' },
  { valeur: '24', quoi: 'heures entre la cuisson et le depart du colis' },
  { valeur: '0', quoi: 'intermediaire entre la ferme et l atelier' },
] as const

/** Les colonnes du pied, en chasse fixe. */
const COLONNES = [
  {
    titre: 'Le bulletin',
    liens: [
      ['#cours-titre', 'Le cours du jour'],
      ['#origines-titre', 'Les six origines'],
      ['#edito-titre', 'L edito'],
      ['#breve-titre', 'L abonnement'],
    ],
  },
  {
    titre: 'La maison',
    liens: [
      ['#atelier-titre', 'L atelier'],
      ['#atelier-titre', 'Les producteurs'],
      ['#cours-titre', 'Le prix paye au vert'],
      ['#haut', 'Visiter la torrefaction'],
    ],
  },
  {
    titre: 'Commander',
    liens: [
      ['#breve-titre', 'S abonner'],
      ['#cours-titre', 'Au sachet'],
      ['#breve-titre', 'Suspendre un abonnement'],
      ['#appel', 'Ecrire a l atelier'],
    ],
  },
  {
    titre: 'La boutique',
    liens: [
      ['#appel', '12 rue des Hollandais'],
      ['#appel', '59140 Dunkerque'],
      ['#appel', 'Du mercredi au samedi'],
      ['#appel', '9 h 30 — 19 h'],
    ],
  },
] as const

/** La vitrine complete : la gazette de la brulerie. */
export default function Page(): ReactElement {
  const polices = usePolices('affiche')
  const aujourdhui = useMemo(() => new Date(), [])
  const [grammes, setGrammes] = useState<number>(500)
  const [frequence, setFrequence] = useState<number>(FREQUENCES[0]?.parMois ?? 1)

  // L abonnement : la remise depend de ce qu on consomme par mois, et le
  // calcul est pose sous le chiffre plutot que cache.
  const abonnement = useMemo(() => {
    const parMois = Math.round(grammes * frequence)
    const part = remise(parMois)
    const brut = (parMois / 1000) * PRIX_BOUTIQUE_KILO
    return { parMois, part, brut, net: brut * (1 - part) }
  }, [grammes, frequence])

  return (
    <Porte forme="lettres" marque="Brulerie Nord">
      <div
        id="haut"
        className="o-bg-stone-50 dark:o-bg-stone-950 o-text-stone-900 dark:o-text-stone-100"
        style={polices}
      >
        {/* ================= 1. L ouverture : le mot-marque au bas du cadre ===== */}
        <header
          className="o-relative o-isolate o-min-h-screen o-overflow-hidden"
          style={nuit('stone')}
        >
          <img
            src={photo('brulerie-sechage', 1800, 1000)}
            alt=""
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0 o-size-full o-object-cover"
            style={{ filter: 'saturate(1.3) contrast(1.05)' }}
          />
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            style={{
              background: `linear-gradient(105deg, ${accentDoux(600, 55)} 0%, transparent 55%), linear-gradient(to bottom, color-mix(in oklab, var(--o-palette-stone-950) 50%, transparent) 0%, transparent 35%, var(--o-palette-stone-950) 92%)`,
            }}
          />
          <Grain opacite={0.08} />
          <Croix />

          <BarreCoins
            marque="Brulerie Nord"
            liens={[
              ['#cours-titre', 'Le cours'],
              ['#origines-titre', 'Les origines'],
              ['#breve-titre', 'L abonnement'],
            ]}
            droite={<Horloge ville="Dunkerque" />}
          />

          <div className="o-relative o-z-10 o-mx-auto o-flex o-min-h-screen o-max-w-7xl o-flex-col o-justify-between o-px-6 o-pb-8 o-pt-20 md:o-px-8">
            <div className="o-max-w-md">
              <Surgit
                as="p"
                className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-300"
              >
                01 / Six origines
                <br />
                02 / Torrefie le mardi, expedie le mercredi
                <br />
                03 / Le cours au kilo, publie
              </Surgit>
              <Surgit
                delai={140}
                as="p"
                className="o-m-0 o-mt-8 o-max-w-sm o-text-lg o-leading-relaxed o-text-stone-100"
              >
                Nous publions ce que nous payons le kilo vert, ce que nous vendons le kilo
                torrefie, et l ecart entre les deux. Le producteur est nomme, la parcelle
                aussi.
              </Surgit>
              <Surgit delai={280} className="o-mt-8">
                <Actions
                  pleine={[
                    '#cours-titre',
                    <>
                      Lire le cours du jour{' '}
                      <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#breve-titre', 'Le sac du mois']}
                />
              </Surgit>
            </div>

            {/* Le mot-marque chrome, en bas du cadre — Fuel. */}
            <div className="o-mt-16 o-flex o-items-end o-justify-between o-gap-6">
              <TitreVague
                delai={360}
                cadence={120}
                className="o-m-0 o-uppercase"
                style={{
                  ...affiche('xxl', 800),
                  fontSize: 'clamp(2.75rem, 12.5vw, 13rem)',
                  background:
                    'linear-gradient(180deg, #ffffff 0%, #d6d3d1 45%, #78716c 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Brulerie Nord
              </TitreVague>
              <Surgit
                delai={700}
                as="p"
                className="o-m-0 o-hidden o-shrink-0 o-pb-3 o-text-right o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-400 md:o-block"
              >
                Numero 214
                <br />1 900 exemplaires
              </Surgit>
            </div>
          </div>
        </header>

        {/* ================= 2. La manchette, entre deux filets ============= */}
        <header className="o-mx-auto o-max-w-5xl o-px-5 o-pt-10 md:o-px-8">
          <p className="o-flex o-flex-wrap o-items-center o-justify-between o-gap-x-6 o-gap-y-1 o-border-b o-border-stone-900 dark:o-border-stone-100 o-pb-2 o-text-xs o-uppercase o-tracking-widest">
            <span>Numero 214</span>
            <span className="o-text-stone-600 dark:o-text-stone-400">
              {dateLisible(aujourdhui)}
            </span>
            <span className="o-text-stone-600 dark:o-text-stone-400">
              Tirage 1 900 exemplaires
            </span>
            <span style={{ color: encre() }}>Torrefie le mardi</span>
          </p>

          <p className="o-mt-5 o-text-center o-font-serif o-text-5xl o-font-normal o-tracking-tight md:o-text-7xl">
            La Brulerie Nord
          </p>

          <p className="o-mt-4 o-border-t o-border-b o-border-stone-900 dark:o-border-stone-100 o-py-1.5 o-text-center o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
            Bulletin du cafe de specialite — six origines — 12 rue des Hollandais,
            Dunkerque
          </p>
        </header>

        {/* ----- La vignette de manchette : la seule scene de la page -------- */}
        <figure className="o-m-0 o-mx-auto o-mt-5 o-max-w-5xl o-px-5 md:o-px-8">
          <div className="o-relative o-isolate o-overflow-hidden" style={nuit('stone')}>
            <Dunes
              className="o-h-32 o-w-full md:o-h-40"
              colors={['--o-theme-bg', '--o-vitrine-600', '--o-vitrine-300']}
              fallback="o-bg-stone-950"
            />
          </div>
          <figcaption className="o-mt-1.5 o-text-center o-text-xs o-text-stone-500 dark:o-text-stone-400">
            Le grain etale sur le bac de refroidissement, apres la torrefaction du mardi.
          </figcaption>
        </figure>

        <main>
          {/* ================= 3. 01 / 02 / 03, en grands chiffres =========== */}
          <section
            aria-labelledby="atelier-titre"
            className="o-mx-auto o-max-w-5xl o-scroll-mt-24 o-px-5 o-pb-14 o-pt-16 md:o-px-8 md:o-pb-20 md:o-pt-24"
          >
            <h2
              id="atelier-titre"
              className="o-m-0 o-max-w-3xl o-font-serif o-text-3xl o-font-normal o-leading-tight o-tracking-tight md:o-text-5xl"
            >
              De la parcelle au bac de refroidissement, en trois temps.
            </h2>
            <div className="o-mt-10">
              <Numerotee
                sombre={false}
                lignes={LES_TROIS.map((temps) => ({
                  titre: temps.titre,
                  texte: temps.texte,
                  media: (
                    <img
                      src={photo(temps.graine, 700, 900)}
                      alt={temps.alt}
                      loading="lazy"
                      className="o-aspect-video o-h-auto o-w-full o-object-cover"
                    />
                  ),
                }))}
              />
            </div>
          </section>

          {/* ================= 4. L edito, coule sur trois colonnes ========== */}
          <section
            aria-labelledby="edito-titre"
            className="o-mx-auto o-max-w-5xl o-scroll-mt-24 o-px-5 o-pb-16 md:o-px-8"
          >
            <h2
              id="edito-titre"
              className="o-border-b o-border-stone-300 dark:o-border-stone-700 o-pb-2 o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400"
            >
              L edito — pourquoi nous datons la torrefaction
            </h2>
            {/* Trois colonnes coulees, comme un journal. Le systeme n a pas de
              classe pour le multi-colonnage : elle est posee en style. */}
            <div
              className="o-mt-5 o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300"
              style={{ columnCount: 3, columnGap: '2.5rem', columnWidth: '18rem' }}
            >
              <p className="o-m-0">
                <span
                  className="o-mr-2 o-font-serif o-leading-tight"
                  style={{
                    // La lettrine descend dans le texte : aucun utilitaire ne pose
                    // de flottement, la propriete est donc ecrite ici.
                    float: 'left',
                    fontSize: '2.9rem',
                    lineHeight: 0.82,
                    marginTop: '0.3rem',
                    color: encre(),
                  }}
                  aria-hidden="true"
                >
                  U
                </span>
                n cafe se boit entre le septieme et le trentieme jour apres sa
                torrefaction. Avant, il degaze et le gout se ferme ; apres, il s eteint. C
                est pour cela que chaque sachet de ce bulletin porte sa date de cuisson et
                non une date de peremption : la seconde ne dit rien, la premiere dit tout.
              </p>
              <p className="o-m-0 o-mt-3">
                Nous torrefions le mardi, par lots de douze kilos, et nous expedions le
                mercredi. Un sachet commande le jeudi part donc le mercredi suivant : c
                est plus lent qu ailleurs, et c est le seul moyen de vous envoyer un cafe
                de six jours plutot que de six semaines.
              </p>
              <p className="o-m-0 o-mt-3">
                Les cours ci-dessous bougent avec la recolte et avec le change. Nous les
                republions a chaque numero, a la hausse comme a la baisse, et nous
                indiquons ce qui va manquer avant que cela manque.
              </p>
              <p className="o-m-0 o-mt-3">
                Chaque origine porte l altitude, le traitement, la variete et le nom de la
                station ou de la ferme. Quand nous ne savons pas, nous l ecrivons — cela
                arrive, et le cacher serait pire.
              </p>
            </div>
          </section>

          {/* ================= 5. Le cours des cafes, en cotation ============ */}
          <section
            aria-labelledby="cours-titre"
            className="o-scroll-mt-24 o-border-t o-border-b o-border-stone-900 dark:o-border-stone-100"
            style={{ backgroundColor: 'var(--o-theme-surface)' }}
          >
            <div className="o-mx-auto o-max-w-5xl o-px-5 o-py-10 md:o-px-8">
              <h2
                id="cours-titre"
                className="o-flex o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-widest"
              >
                <Icon
                  icon={Coffee}
                  size={13}
                  style={{ color: encre() }}
                  aria-hidden="true"
                />
                Le cours des cafes — au kilo, depart Dunkerque
              </h2>

              <div className="o-mt-5 o-overflow-x-auto o-scrollbar dark:o-scrollbar-dark">
                <table
                  className="o-w-full o-text-sm"
                  style={{ minWidth: '44rem', borderCollapse: 'collapse' }}
                >
                  <caption className="o-sr-only">
                    Cours des six origines au bulletin du jour
                  </caption>
                  <thead>
                    <tr className="o-border-b o-border-stone-400 dark:o-border-stone-600">
                      {[
                        'Origine',
                        'Pays',
                        'Altitude',
                        'Traitement',
                        'Le kilo',
                        'Stock',
                        'Tendance',
                      ].map((entete) => (
                        <th
                          key={entete}
                          scope="col"
                          className="o-py-2 o-pr-5 o-text-left o-text-xs o-font-semibold o-uppercase o-tracking-wider o-text-stone-600 dark:o-text-stone-400"
                        >
                          {entete}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SACHETS.map((item) => {
                      const t = tendance(item)
                      return (
                        <tr
                          key={item.nom}
                          className="o-border-b o-border-stone-200 dark:o-border-stone-800"
                        >
                          <th
                            scope="row"
                            className="o-py-2.5 o-pr-5 o-text-left o-font-medium"
                          >
                            {item.nom}
                          </th>
                          <td className="o-py-2.5 o-pr-5 o-text-stone-600 dark:o-text-stone-400">
                            {item.pays}
                          </td>
                          <td className="o-py-2.5 o-pr-5 o-tabular-nums o-text-stone-600 dark:o-text-stone-400">
                            {item.altitude}
                          </td>
                          <td className="o-py-2.5 o-pr-5 o-text-stone-600 dark:o-text-stone-400">
                            {item.traitement}
                          </td>
                          <td className="o-py-2.5 o-pr-5 o-tabular-nums o-font-medium">
                            {euros(item.prix1000)}
                          </td>
                          <td className="o-py-2.5 o-pr-5 o-tabular-nums o-text-stone-600 dark:o-text-stone-400">
                            {item.stock250} sachets
                          </td>
                          <td className="o-py-2.5 o-whitespace-nowrap">
                            <span
                              className="o-tabular-nums"
                              style={{ color: encre() }}
                              aria-hidden="true"
                            >
                              {t.signe}
                            </span>{' '}
                            <span className="o-text-xs o-text-stone-600 dark:o-text-stone-400">
                              {t.mot}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="o-mt-4 o-max-w-2xl o-text-xs o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                Cours du jour de parution. Le stock est celui de l atelier a la lecture :
                quand il tombe sous douze sachets, la ligne passe en tendu, et le lot
                suivant n arrivera pas avant la prochaine recolte.
              </p>
            </div>
          </section>

          {/* ================= 6. Les six origines, empilees ================= */}
          {/* La signature de mouvement : les sacs de jute s empilent a l atelier,
            et les fiches d origine font de meme au defilement. */}
          <section
            id="origines"
            aria-labelledby="origines-titre"
            className="o-mx-auto o-max-w-5xl o-scroll-mt-24 o-px-5 o-pb-24 o-pt-16 md:o-px-8 md:o-pt-24"
          >
            <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-x-10 o-gap-y-3 o-border-b o-border-stone-900 dark:o-border-stone-100 o-pb-3">
              <h2
                id="origines-titre"
                className="o-m-0 o-font-serif o-text-3xl o-font-normal o-leading-tight o-tracking-tight md:o-text-5xl"
              >
                Six origines, six parcelles.
              </h2>
              <p className="o-m-0 o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                Une fiche par lot
                <br />
                Elles s empilent en defilant
              </p>
            </div>

            <StickyStack
              className="o-mt-10 o-flex o-flex-col o-gap-6"
              offset={125}
              gap={18}
              shrink={0.04}
            >
              {SACHETS.map((item, rang) => (
                <article
                  key={item.nom}
                  className="o-overflow-hidden o-border-w-1 o-border-stone-900 dark:o-border-stone-100"
                  style={{ backgroundColor: 'var(--o-theme-bg)' }}
                >
                  <div className="o-grid md:o-grid-cols-12">
                    <div className="o-relative o-min-w-0 md:o-col-span-4">
                      <img
                        src={photo(item.graine, 700, 900)}
                        alt={item.alt}
                        loading="lazy"
                        className="o-h-full o-w-full o-object-cover"
                        style={{ minHeight: '12rem' }}
                      />
                      <span
                        aria-hidden="true"
                        className="o-absolute o-left-0 o-top-0 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tabular-nums o-tracking-widest"
                        style={aplat()}
                      >
                        {String(rang + 1).padStart(2, '0')} / 06
                      </span>
                    </div>

                    <div className="o-min-w-0 o-p-5 md:o-col-span-8 md:o-p-7">
                      <p className="o-m-0 o-flex o-flex-wrap o-items-baseline o-gap-x-3 o-gap-y-1">
                        <span className="o-font-serif o-text-2xl o-tracking-tight md:o-text-3xl">
                          {item.nom}
                        </span>
                        <span className="o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                          {item.pays} — {item.altitude}
                        </span>
                      </p>
                      <p className="o-m-0 o-mt-1.5 o-text-sm o-italic o-text-stone-600 dark:o-text-stone-400">
                        {item.notes.join(' · ')}
                      </p>

                      <div className="o-mt-5 o-grid o-gap-x-8 o-gap-y-5 lg:o-grid-cols-2">
                        <dl className="o-m-0 o-grid o-grid-cols-2 o-gap-x-5 o-gap-y-3 o-text-sm">
                          {(
                            [
                              [MapPin, 'Producteur', item.producteur],
                              [Thermometer, 'Variete', item.variete],
                              [Package, 'Recolte', item.recolte],
                              [
                                Flame,
                                'Derniere cuisson',
                                dateLisible(cuisson(item.cuisson, aujourdhui).date),
                              ],
                            ] as const
                          ).map(([icone, quoi, valeur]) => (
                            <div key={quoi}>
                              <dt className="o-flex o-items-center o-gap-1.5 o-text-xs o-uppercase o-tracking-wider o-text-stone-500 dark:o-text-stone-400">
                                <Icon icon={icone} size={11} aria-hidden="true" />
                                {quoi}
                              </dt>
                              <dd className="o-m-0 o-mt-0.5 o-leading-snug">{valeur}</dd>
                            </div>
                          ))}
                        </dl>

                        <div>
                          <div className="o-flex o-flex-col o-gap-2">
                            <Axe nom="Acidite" valeur={item.profil.acidite} />
                            <Axe nom="Corps" valeur={item.profil.corps} />
                            <Axe nom="Sucre" valeur={item.profil.sucre} />
                          </div>
                          <p className="o-mt-3 o-flex o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-wider o-text-stone-500 dark:o-text-stone-400">
                            Intensite
                            <Intensite valeur={item.intensite} />
                          </p>
                        </div>
                      </div>

                      <p className="o-m-0 o-mt-5 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-6 o-gap-y-1 o-border-t o-border-stone-300 dark:o-border-stone-700 o-pt-3 o-text-sm o-tabular-nums">
                        <span>
                          <span className="o-font-semibold" style={{ color: encre() }}>
                            {euros(item.prix250)}
                          </span>
                          <span className="o-text-stone-600 dark:o-text-stone-400">
                            {' '}
                            le 250 g — {euros(item.prix1000)} le kilo
                          </span>
                        </span>
                        <span className="o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                          {item.stock250 === 0
                            ? 'Epuise, lot suivant a la recolte'
                            : `${String(item.stock250)} sachets — torrefie il y a ${String(cuisson(item.cuisson, aujourdhui).jours)} jours`}
                        </span>
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </StickyStack>
          </section>

          {/* ================= 7. La boucle courbe, sur le sac de jute ======= */}
          {/* La bichromie est celle d une photogravure de journal : le sac passe
            en deux encres, et la phrase de la maison lui tourne autour. */}
          <section
            aria-label="Torrefie a Dunkerque, le mardi"
            className="o-relative o-isolate o-overflow-hidden o-border-t o-border-b o-border-stone-900 dark:o-border-stone-100"
          >
            <Duotone
              src={photo('brulerie-sacs', 1800, 900)}
              alt=""
              ratio={2.6}
              strength={0.92}
              hover={false}
              shadow="var(--o-palette-stone-950)"
              light={accent(200)}
              className="o-w-full"
            />
            <div
              aria-hidden="true"
              className="o-absolute o-inset-0 o-z-10 o-flex o-items-center o-text-stone-50"
              style={{
                background:
                  'linear-gradient(to bottom, color-mix(in oklab, var(--o-palette-stone-950) 58%, transparent), color-mix(in oklab, var(--o-palette-stone-950) 28%, transparent))',
              }}
            >
              <CurvedLoop
                courbure={0.42}
                taille={52}
                speed={30}
                separateur="  ·  "
                className="o-w-full o-uppercase"
                style={{
                  fontFamily: 'var(--o-vitrine-affichage, var(--o-font-sans))',
                  letterSpacing: '-0.02em',
                }}
              >
                Torrefie a Dunkerque, le mardi
              </CurvedLoop>
            </div>
            {/* La legende porte son propre fond : posee sur une photographie, elle
              n aurait aucun contraste mesurable. */}
            <p
              className="o-absolute o-bottom-3 o-right-4 o-z-20 o-m-0 o-px-2.5 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-300"
              style={{ backgroundColor: 'var(--o-palette-stone-950)' }}
            >
              Les sacs de jute, a la reception du lot
            </p>
          </section>

          {/* ================= 8. Quatre nombres, sur filets ================= */}
          <section
            aria-label="Le bulletin en quatre nombres"
            className="o-mx-auto o-max-w-5xl o-px-5 o-py-16 md:o-px-8 md:o-py-20"
          >
            <Chiffres sombre={false} nombres={NOMBRES} />
          </section>

          {/* ================= 9. La breve : l abonnement ==================== */}
          <section
            aria-labelledby="breve-titre"
            className="o-mx-auto o-max-w-5xl o-scroll-mt-24 o-px-5 o-pb-16 md:o-px-8"
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12">
              <div className="md:o-col-span-7">
                <h2
                  id="breve-titre"
                  className="o-border-b o-border-stone-300 dark:o-border-stone-700 o-pb-2 o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400"
                >
                  La breve — l abonnement evite d y penser
                </h2>
                <p className="o-mt-4 o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                  On choisit une quantite et un rythme ; le cafe part le mercredi qui suit
                  la torrefaction, sans qu on ait rien a faire. La remise depend de ce qui
                  est consomme par mois, et elle est calculee ci-contre — pas negociee.
                </p>
                <p className="o-mt-3 o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                  Suspendable a tout moment depuis le courriel d expedition, sans
                  justification et sans delai de preavis. Une pause n annule pas l
                  anciennete, donc pas la remise.
                </p>
                <p className="o-mt-3 o-text-xs o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                  Un abonne a deux kilos par mois remplit un lot entier : l atelier n a ni
                  a stocker ni a prevoir, et c est cela qui est rendu. La remise n est pas
                  un geste commercial, c est un cout qui disparait.
                </p>
              </div>

              <div className="o-border-w-1 o-border-stone-900 dark:o-border-stone-100 o-p-5 md:o-col-span-5">
                <p className="o-flex o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-widest">
                  <Icon
                    icon={Repeat}
                    size={12}
                    style={{ color: encre() }}
                    aria-hidden="true"
                  />
                  Calcul de l abonnement
                </p>

                <fieldset className="o-m-0 o-mt-4 o-p-0">
                  <legend className="o-mb-1.5 o-text-xs o-uppercase o-tracking-wider o-text-stone-500 dark:o-text-stone-400">
                    Quantite par envoi
                  </legend>
                  <div className="o-flex o-flex-wrap o-gap-x-4 o-gap-y-1">
                    {QUANTITES.map((valeur) => {
                      const actif = valeur === grammes
                      return (
                        <button
                          key={valeur}
                          type="button"
                          aria-pressed={actif}
                          onClick={() => {
                            setGrammes(valeur)
                          }}
                          className="o-text-sm o-tabular-nums o-transition-colors focus:o-ring"
                          style={
                            actif
                              ? {
                                  color: encre(),
                                  fontWeight: 700,
                                  textDecoration: 'underline',
                                  textUnderlineOffset: '4px',
                                }
                              : { color: 'var(--o-theme-muted)' }
                          }
                        >
                          {valeur} g
                        </button>
                      )
                    })}
                  </div>
                </fieldset>

                <fieldset className="o-m-0 o-mt-4 o-p-0">
                  <legend className="o-mb-1.5 o-text-xs o-uppercase o-tracking-wider o-text-stone-500 dark:o-text-stone-400">
                    Rythme
                  </legend>
                  <div className="o-flex o-flex-wrap o-gap-x-4 o-gap-y-1">
                    {FREQUENCES.map((item) => {
                      const actif = item.parMois === frequence
                      return (
                        <button
                          key={item.cle}
                          type="button"
                          aria-pressed={actif}
                          onClick={() => {
                            setFrequence(item.parMois)
                          }}
                          className="o-text-sm o-transition-colors focus:o-ring"
                          style={
                            actif
                              ? {
                                  color: encre(),
                                  fontWeight: 700,
                                  textDecoration: 'underline',
                                  textUnderlineOffset: '4px',
                                }
                              : { color: 'var(--o-theme-muted)' }
                          }
                        >
                          {item.nom}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>

                <dl
                  aria-live="polite"
                  className="o-m-0 o-mt-5 o-flex o-flex-col o-gap-1.5 o-border-t o-border-stone-300 dark:o-border-stone-700 o-pt-4 o-text-sm"
                >
                  {(
                    [
                      ['Par mois', `${String(abonnement.parMois)} g`],
                      ['Sans abonnement', euros(abonnement.brut)],
                      ['Remise', `${String(Math.round(abonnement.part * 100))} %`],
                    ] as const
                  ).map(([quoi, valeur]) => (
                    <div
                      key={quoi}
                      className="o-flex o-items-baseline o-justify-between o-gap-4"
                    >
                      <dt className="o-text-stone-600 dark:o-text-stone-400">{quoi}</dt>
                      <dd className="o-m-0 o-tabular-nums">{valeur}</dd>
                    </div>
                  ))}
                  <div className="o-mt-2 o-flex o-items-baseline o-justify-between o-gap-4 o-border-t o-border-stone-300 dark:o-border-stone-700 o-pt-3">
                    <dt className="o-text-xs o-uppercase o-tracking-wider">
                      Par mois, abonne
                    </dt>
                    <dd
                      className="o-m-0 o-font-serif o-text-xl o-tabular-nums"
                      style={{ color: encre() }}
                    >
                      {euros(abonnement.net)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          {/* ================= 10. L appel : un mot geant, une gelule ======== */}
          <div
            id="appel"
            className="o-scroll-mt-24 o-border-t o-border-stone-900 dark:o-border-stone-100"
          >
            <Appel
              sombre={false}
              titre="Encore chaud."
              texte="Le tambour tourne mardi a onze heures. Ce qui en sort part mercredi, et il reste de la place dans le lot."
              action={[
                '#breve-titre',
                <>
                  S abonner au sac du mois{' '}
                  <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                </>,
              ]}
            />
          </div>
        </main>

        {/* ================= 11. Le pied : le mot-marque pleine largeur ===== */}
        {/* P1 : le nom remplit la largeur, les colonnes sont en chasse fixe, et
          l ours du bulletin tient la ligne du bas. */}
        <footer className="o-relative o-overflow-hidden o-border-t o-border-stone-900 dark:o-border-stone-100">
          <div className="o-mx-auto o-max-w-6xl o-px-5 o-pt-14 md:o-px-8">
            <div className="o-grid o-gap-8 sm:o-grid-cols-2 lg:o-grid-cols-4">
              {COLONNES.map((colonne) => (
                <nav key={colonne.titre} aria-label={colonne.titre}>
                  <p
                    className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: encre() }}
                  >
                    {colonne.titre}
                  </p>
                  <ul className="o-m-0 o-mt-4 o-flex o-list-none o-flex-col o-gap-2 o-p-0">
                    {colonne.liens.map(([cible, mot]) => (
                      <li key={`${colonne.titre}-${mot}`}>
                        <a
                          href={cible}
                          className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-no-underline o-text-stone-600 dark:o-text-stone-400 hover:o-text-stone-900 dark:hover:o-text-stone-100 o-transition-colors focus:o-ring"
                        >
                          {mot}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>

            <p
              aria-hidden="true"
              className="o-m-0 o-mt-14 o-select-none o-text-center o-uppercase o-text-stone-900 dark:o-text-stone-100"
              style={{
                ...affiche('xxl', 800),
                fontSize: 'clamp(2rem, 12.6vw, 13.5rem)',
                lineHeight: 0.84,
              }}
            >
              Brulerie Nord
            </p>

            {/* L ours, en deux colonnes, sous le mot-marque. */}
            <div
              className="o-mt-8 o-border-t o-border-stone-900 dark:o-border-stone-100 o-pt-6 o-text-xs o-leading-relaxed o-text-stone-600 dark:o-text-stone-400"
              style={{ columnCount: 2, columnGap: '2.5rem', columnWidth: '20rem' }}
            >
              <p className="o-m-0">
                <span className="o-font-semibold o-text-stone-900 dark:o-text-stone-100">
                  Brulerie Nord
                </span>{' '}
                — bulletin publie a chaque torrefaction, soit le mardi. Atelier et
                boutique : 12 rue des Hollandais, 59140 Dunkerque, du mercredi au samedi.
                Expedition le mercredi, en France et dans l Union europeenne.
              </p>
              <p className="o-m-0 o-mt-3">
                Les cours sont ceux du jour de parution, revises a chaque numero, a la
                hausse comme a la baisse. Les stocks sont ceux de l atelier au moment de
                la lecture. Brulerie Nord SARL au capital de 35 000 EUR, RCS Dunkerque 811
                226 470.
              </p>
            </div>

            <p className="o-m-0 o-mt-6 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-stone-300 dark:o-border-stone-700 o-py-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
              <span>Numero 214 — acheve d imprimer le mardi</span>
              <span>© 2026 Brulerie Nord</span>
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
