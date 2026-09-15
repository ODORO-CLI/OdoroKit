/**
 * Marge — librairie independante, Nantes.
 *
 * ## Le mecanisme : la table des libraires
 *
 * Une librairie independante ne vend pas un stock, elle vend **un choix**. Le
 * visiteur ne cherche donc pas un titre : il dit dans quelle humeur il est, et
 * la table se recompose.
 *
 * Six humeurs, douze volumes ecrits a la main, chacun marque des humeurs
 * auxquelles il repond. Choisir une humeur fait trois choses a la fois :
 *
 * 1. la table se refait — seuls les volumes qui repondent y restent ;
 * 2. le **rayon en volume** (`BookShelf` du registre) tire du meuble le
 *    premier des volumes retenus, et on peut en tirer un autre au clic ;
 * 3. le **mot du libraire** change, signe a la main.
 *
 * Le rayon est la seule surface graphique de la page, et il n est jamais le
 * seul porteur du sens : la table est une liste de texte, lisible sans lui.
 * Sous mouvement reduit, le rayon se replie sur son affiche et la table reste
 * entiere — c est la regle, et c est aussi ce qui rend la page utilisable.
 *
 * ## La typographie
 *
 * Filiation Miles : une grotesque noire, tres grande, et rien d autre. Le
 * papier est un aplat teinte ; il n y a pas une seule photographie, parce
 * qu une librairie se regarde de pres et que des vignettes de couvertures
 * seraient des images d editeurs qui ne sont pas nous.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight, BookOpen } from '@odoro-cli/icons/outline'
import { useMemo, useState, type ReactElement } from 'react'

import { BookShelf, type ShelfVolume } from '@/odoro/section/BookShelf.jsx'
import { StickyStack } from '@/odoro/section/StickyStack.jsx'
import { HandWritten } from '@/odoro/text/HandWritten.jsx'
import { UnderlineDraw } from '@/odoro/text/UnderlineDraw.jsx'

import { Filigrane, nuit } from './communs.jsx'
import {
  Actions,
  affiche,
  BarreCoins,
  CHROME,
  Coin,
  Etiquette,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accentDoux, aplat, encre } from './palettes.js'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques, aux quatre coins. */
const NAVIGATION: readonly Lien[] = [
  ['#table', 'La table'],
  ['#maison', 'La maison'],
  ['#question', 'Nous ecrire'],
]

/* ============================ Les humeurs ============================== */

/** Une humeur de lecteur, telle qu on la dit au comptoir. */
interface Humeur {
  readonly cle: string
  readonly dit: string
  /** Le mot du libraire, ecrit pour cette humeur. */
  readonly mot: string
  readonly signe: string
}

const HUMEURS: readonly [Humeur, ...Humeur[]] = [
  {
    cle: 'secoue',
    dit: 'Je veux etre secoue',
    mot: 'Quatre livres qui ne menagent personne. Le premier vous fachera page trente, et c est exactement pour cela qu il est sur la table. Ne commencez pas par le dernier.',
    signe: 'Salome',
  },
  {
    cle: 'comprendre',
    dit: 'Je veux comprendre quelque chose',
    mot: 'Ceux-la expliquent sans vous prendre de haut. Aucun n est un manuel, tous ont un point de vue, et c est ce qui les rend lisibles jusqu au bout.',
    signe: 'Bastien',
  },
  {
    cle: 'partir',
    dit: 'Je veux partir',
    mot: 'Des livres ou l on marche. Deux sont des recits de voyage, deux n en sont pas du tout et vous emmenent plus loin. Prenez celui dont le titre vous derange.',
    signe: 'Salome',
  },
  {
    cle: 'rire',
    dit: 'Je veux rire',
    mot: 'Le rire est le rayon le plus difficile a tenir : ce qui fait rire une personne en agace deux. Ces quatre-la ont ete testes a voix haute le jeudi soir.',
    signe: 'Come',
  },
  {
    cle: 'tenir',
    dit: 'Je veux qu on me tienne la main',
    mot: 'Des livres doux, jamais betes. On les conseille surtout en janvier et en novembre, et on ne s en excuse pas.',
    signe: 'Bastien',
  },
  {
    cle: 'sais-pas',
    dit: 'Je ne sais pas',
    mot: 'C est la meilleure reponse, et c est celle qui marche le mieux. Voila ce que nous avons lu ce mois-ci et que nous avons envie de mettre dans les mains de quelqu un.',
    signe: 'Come',
  },
]

/* ============================ Les volumes ============================== */

/** Un volume de la table. Les titres et les maisons sont inventes. */
interface Volume {
  readonly id: string
  readonly titre: string
  readonly auteur: string
  readonly maison: string
  readonly pages: number
  readonly prix: string
  readonly humeurs: readonly string[]
  readonly cartel: string
  /** Le rayon, puis la place sur ce rayon. */
  readonly rayon: number
  readonly place: number
  /** Dos, toile, tranche — des jetons, jamais des valeurs. */
  readonly reliure: readonly [string, string, string]
}

const VOLUMES: readonly [Volume, ...Volume[]] = [
  {
    id: 'chaux',
    titre: 'La chaux vive',
    auteur: 'Irene Bouchard',
    maison: 'Editions du Talus',
    pages: 248,
    prix: '21 EUR',
    humeurs: ['secoue', 'sais-pas'],
    cartel:
      'Un village, une carriere, et une enquete qui n aboutit pas. Le refus de conclure est le sujet.',
    rayon: 0,
    place: 0,
    reliure: ['--o-vitrine-700', '--o-vitrine-600', '--o-palette-stone-300'],
  },
  {
    id: 'archive',
    titre: 'Une archive de rien',
    auteur: 'Tarek Nadji',
    maison: 'La Fabrique Lente',
    pages: 176,
    prix: '18,50 EUR',
    humeurs: ['comprendre', 'secoue'],
    cartel:
      'Comment un Etat range ce qu il prefere oublier. Quatre-vingts pages de notes, et elles se lisent.',
    rayon: 0,
    place: 1,
    reliure: [
      '--o-palette-emerald-900',
      '--o-palette-emerald-800',
      '--o-palette-stone-200',
    ],
  },
  {
    id: 'nord',
    titre: 'Cap au nord, lentement',
    auteur: 'Lea Vasseur',
    maison: 'Editions du Talus',
    pages: 312,
    prix: '23 EUR',
    humeurs: ['partir', 'tenir'],
    cartel:
      'Mille kilometres a pied entre deux villes qui ne s aiment pas. Le meilleur livre de marche depuis longtemps.',
    rayon: 0,
    place: 2,
    reliure: ['--o-palette-sky-900', '--o-palette-sky-800', '--o-palette-stone-300'],
  },
  {
    id: 'bureau',
    titre: 'Le bureau des courants d air',
    auteur: 'Come Riviere',
    maison: 'Presses de la Marge',
    pages: 204,
    prix: '19 EUR',
    humeurs: ['rire', 'sais-pas'],
    cartel:
      'Une administration qui gere le vent. On a ri a voix haute au jeudi de lecture, ce qui n arrive pas souvent.',
    rayon: 0,
    place: 3,
    reliure: ['--o-palette-amber-700', '--o-palette-amber-600', '--o-palette-stone-200'],
  },
  {
    id: 'mains',
    titre: 'Ce que font les mains',
    auteur: 'Nadia Berthaut',
    maison: 'La Fabrique Lente',
    pages: 160,
    prix: '17 EUR',
    humeurs: ['tenir', 'comprendre'],
    cartel:
      'Douze metiers manuels, racontes par ceux qui les font. Aucun miserabilisme, aucune nostalgie.',
    rayon: 0,
    place: 4,
    reliure: ['--o-vitrine-800', '--o-vitrine-700', '--o-palette-stone-200'],
  },
  {
    id: 'silence',
    titre: 'Le silence des ateliers',
    auteur: 'Hugo Delaunay',
    maison: 'Editions du Talus',
    pages: 288,
    prix: '22 EUR',
    humeurs: ['secoue', 'comprendre'],
    cartel: 'Roman d usine, sans un mot de trop. La derniere page nous a tenus eveilles.',
    rayon: 0,
    place: 5,
    reliure: ['--o-palette-stone-800', '--o-palette-stone-700', '--o-palette-stone-300'],
  },
  {
    id: 'marees',
    titre: 'Marees basses',
    auteur: 'Ines Roque',
    maison: 'Presses de la Marge',
    pages: 132,
    prix: '15 EUR',
    humeurs: ['partir', 'tenir'],
    cartel:
      'Cent trente pages, une plage, deux soeurs. A lire d une traite, en fin d apres-midi.',
    rayon: 1,
    place: 0,
    reliure: ['--o-palette-rose-900', '--o-palette-rose-800', '--o-palette-stone-200'],
  },
  {
    id: 'table',
    titre: 'Trente-deux facons de mettre la table',
    auteur: 'Jonas Arsac',
    maison: 'La Fabrique Lente',
    pages: 224,
    prix: '24 EUR',
    humeurs: ['rire', 'tenir'],
    cartel:
      'Un traite domestique completement serieux, et donc irresistible. Le chapitre sur les couteaux est un morceau.',
    rayon: 1,
    place: 1,
    reliure: ['--o-palette-stone-300', '--o-palette-stone-200', '--o-palette-stone-600'],
  },
  {
    id: 'ligne',
    titre: 'La ligne de partage',
    auteur: 'Salome Vaury',
    maison: 'Editions du Talus',
    pages: 356,
    prix: '25 EUR',
    humeurs: ['comprendre', 'partir'],
    cartel:
      'Une frontiere suivie a pied sur toute sa longueur. Geographie, droit, et beaucoup de pluie.',
    rayon: 1,
    place: 2,
    reliure: [
      '--o-palette-violet-900',
      '--o-palette-violet-800',
      '--o-palette-stone-200',
    ],
  },
  {
    id: 'lampe',
    titre: 'Une lampe pour deux',
    auteur: 'Elsa Toussaint',
    maison: 'Presses de la Marge',
    pages: 148,
    prix: '16,50 EUR',
    humeurs: ['tenir', 'sais-pas'],
    cartel:
      'Deux vieux amis, une panne de courant, une nuit. C est tout, et c est suffisant.',
    rayon: 1,
    place: 3,
    reliure: ['--o-palette-amber-200', '--o-palette-amber-100', '--o-palette-stone-500'],
  },
  {
    id: 'cirque',
    titre: 'Le cirque administratif',
    auteur: 'Come Riviere',
    maison: 'Presses de la Marge',
    pages: 192,
    prix: '18 EUR',
    humeurs: ['rire', 'secoue'],
    cartel:
      'La suite du Bureau, en plus mechant. On peut commencer par celui-la, mais ce serait dommage.',
    rayon: 1,
    place: 4,
    reliure: ['--o-vitrine-500', '--o-vitrine-400', '--o-palette-stone-800'],
  },
  {
    id: 'atlas',
    titre: 'Atlas des endroits ordinaires',
    auteur: 'Maud Ferrand',
    maison: 'La Fabrique Lente',
    pages: 208,
    prix: '29 EUR',
    humeurs: ['partir', 'rire', 'sais-pas'],
    cartel:
      'Des cartes de ronds-points, de parkings et d arrets de bus. Un livre drole, et beau malgre lui.',
    rayon: 1,
    place: 5,
    reliure: ['--o-palette-teal-900', '--o-palette-teal-800', '--o-palette-stone-200'],
  },
]

/* ============================ Ce qu on ne fait pas ===================== */

/** Les trois cartes qui s empilent. */
const REFUS = [
  {
    numero: '01',
    titre: 'Pas de table des meilleures ventes',
    texte:
      'Une pile de vingt exemplaires du meme livre n est pas un conseil, c est une commande d office. Nous prenons trois exemplaires de chaque chose, et nous les defendons.',
  },
  {
    numero: '02',
    titre: 'Pas de commande en trois clics',
    texte:
      'On peut reserver un titre par courriel et le retirer le lendemain. Il n y a pas de panier, pas de compte, pas de courriel de relance : le livre attend a votre nom sur l etagere derriere la caisse.',
  },
  {
    numero: '03',
    titre: 'Pas de conseils calcules',
    texte:
      'Les six humeurs de la table ont ete ecrites par trois personnes qui lisent, un jeudi soir, a voix haute. Aucune machine n a vote. C est plus lent, et c est la seule chose que nous savons faire.',
  },
] as const

/* ============================ L index (P21) ============================ */

/** L index alphabetique du pied, en petites capitales. */
const INDEX: readonly (readonly [string, string])[] = [
  ['#question', 'Adresse'],
  ['#table', 'Atlas des endroits ordinaires'],
  ['#maison', 'Bureau des courants d air'],
  ['#table', 'Chaux vive'],
  ['#question', 'Commande'],
  ['#maison', 'Conseils'],
  ['#table', 'Humeurs'],
  ['#question', 'Horaires'],
  ['#table', 'Lectures du jeudi'],
  ['#table', 'Ligne de partage'],
  ['#maison', 'Meilleures ventes'],
  ['#table', 'Marees basses'],
  ['#question', 'Nantes'],
  ['#table', 'Rayon'],
  ['#maison', 'Refus'],
  ['#table', 'Silence des ateliers'],
  ['#haut', 'Table'],
  ['#question', 'Telephone'],
]

/**
 * Les comptes, en toutes lettres.
 *
 * Cette page ne porte aucun chiffre (forme C8) : un nombre de volumes ecrit en
 * chiffres se lirait comme un indicateur, et ce n en est pas un.
 */
const COMPTE: Readonly<Record<number, string>> = {
  0: 'Aucun',
  1: 'Un',
  2: 'Deux',
  3: 'Trois',
  4: 'Quatre',
  5: 'Cinq',
  6: 'Six',
}

/** Le paraphe du libraire, trace d un seul trait. */
const PARAPHE =
  'M14 78c22-34 38-52 48-52 9 0 6 20-6 40-12 20-20 30-14 32 8 3 26-18 36-38 9-18 14-26 18-24 5 2-2 22-8 38-5 14-3 20 4 20 10 0 26-16 40-38 10-16 16-24 20-22 5 2 0 18-6 30-6 11-6 16 0 16 8 0 22-10 42-30'

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('affiche')
  const [humeur, setHumeur] = useState<string>(HUMEURS[0].cle)

  const table = useMemo(() => VOLUMES.filter((v) => v.humeurs.includes(humeur)), [humeur])
  const courante = useMemo(
    () => HUMEURS.find((h) => h.cle === humeur) ?? HUMEURS[0],
    [humeur],
  )

  // Le rayon tire toujours un volume de la table : par defaut le premier, et
  // celui qu on clique ensuite. Changer d humeur remet la main sur le premier.
  const [tire, setTire] = useState<string | null>(null)
  const ouvert =
    tire !== null && table.some((v) => v.id === tire) ? tire : (table[0]?.id ?? null)
  const volumeOuvert = VOLUMES.find((v) => v.id === ouvert) ?? VOLUMES[0]

  // Le meuble porte le catalogue entier : c est un rayon, pas une vitrine, et
  // il ne se remonte pas a chaque changement d humeur.
  const rayon: readonly ShelfVolume[] = useMemo(
    () =>
      VOLUMES.map((v) => ({
        id: v.id,
        title: v.titre,
        shelf: v.rayon,
        slot: v.place,
        spine: v.reliure[0],
        cloth: v.reliure[1],
        edge: v.reliure[2],
      })),
    [],
  )

  return (
    <Porte forme="lettres" marque="Marge" sombre={false}>
      <div
        className="o-relative o-overflow-hidden"
        style={{ ...polices, backgroundColor: accentDoux(400, 7) }}
      >
        {/*
          ----- L ouverture : le papier, un mot-marque en filigrane ------------
        */}
        <section
          id="haut"
          className="o-relative o-isolate o-flex o-flex-col"
          style={{ minHeight: ECRAN }}
        >
          <Filigrane
            taille={30}
            opacite={7}
            className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-6 o-z-0"
          >
            MARGE
          </Filigrane>

          <BarreCoins
            marque="Marge — libraire"
            liens={NAVIGATION}
            droite="Nantes, Hauts-Paves"
            sombre={false}
          />

          <div className="o-relative o-z-10 o-mx-auto o-flex o-w-full o-max-w-7xl o-grow o-flex-col o-justify-center o-px-6 o-pb-28 o-pt-12 md:o-px-10">
            <Surgit>
              <Etiquette sombre={false}>
                Librairie generale depuis 2011 — 14 000 titres, trois libraires
              </Etiquette>
            </Surgit>
            <TitreVague
              delai={140}
              cadence={80}
              className="o-m-0 o-mt-8 o-max-w-5xl o-uppercase o-text-stone-950 dark:o-text-stone-50"
              style={{
                ...affiche('l', 400),
                fontSize: 'clamp(2.5rem, 8.4vw, 8.5rem)',
                letterSpacing: '-0.045em',
                lineHeight: 0.9,
              }}
            >
              Dites-nous votre humeur. Nous refaisons la table.
            </TitreVague>
            <div className="o-mt-10 o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <Surgit
                delai={560}
                as="p"
                className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-stone-700 dark:o-text-stone-300 md:o-col-span-6"
              >
                Nous ne savons pas ce que vous cherchez, et vous non plus la plupart du
                temps. C est pour cela que la table est faite de six humeurs et non de
                categories.
              </Surgit>
              <Surgit delai={680} className="md:o-col-span-6 md:o-flex md:o-justify-end">
                <Actions
                  pleine={[
                    '#table',
                    <>
                      Voir la table <Icon icon={ArrowDown} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#maison', 'Ce qu on ne fait pas']}
                  sombre={false}
                />
              </Surgit>
            </div>
          </div>

          <div className="o-hidden md:o-block">
            <Coin position="bd" sombre={false}>
              Mardi au samedi 10 h — 19 h 30
              <br />
              Lectures a voix haute, jeudi 19 h
            </Coin>
          </div>
        </section>

        {/*
          ----- Le mecanisme : la table des libraires --------------------------
        */}
        <section
          id="table"
          className="o-relative o-scroll-mt-24 o-border-t o-px-6 o-py-20 md:o-px-10 md:o-py-28"
          style={{ borderColor: 'var(--o-theme-line)' }}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <Indice rang="01" sombre={false}>
              La table
            </Indice>
            <h2
              className="o-m-0 o-mt-5 o-max-w-3xl o-uppercase o-text-stone-950 dark:o-text-stone-50"
              style={{
                ...affiche('m', 400),
                fontSize: 'clamp(1.75rem, 4.2vw, 3.5rem)',
                letterSpacing: '-0.04em',
              }}
            >
              Ce soir, vous etes plutot
            </h2>

            {/* Les six humeurs. */}
            <ul className="o-m-0 o-mt-8 o-flex o-list-none o-flex-wrap o-gap-2.5 o-p-0">
              {HUMEURS.map((h) => {
                const actif = h.cle === humeur
                return (
                  <li key={h.cle}>
                    <button
                      type="button"
                      aria-pressed={actif}
                      onClick={() => {
                        setHumeur(h.cle)
                        setTire(null)
                      }}
                      className="o-cursor-pointer o-rounded-full o-border-w-1 o-px-5 o-py-2.5 o-text-sm o-font-medium o-transition-colors focus:o-ring"
                      style={
                        actif
                          ? { ...aplat(), borderColor: 'transparent' }
                          : {
                              borderColor: 'var(--o-theme-line)',
                              color: 'var(--o-theme-fg)',
                              backgroundColor: 'transparent',
                            }
                      }
                    >
                      {h.dit}
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="o-mt-14 o-grid o-gap-12 lg:o-grid-cols-12">
              {/* Le rayon en volume, et le cartel du volume tire. */}
              <div className="o-min-w-0 lg:o-col-span-5">
                <BookShelf
                  volumes={rayon}
                  selected={ouvert}
                  onSelect={setTire}
                  colors={['--o-palette-stone-600', '--o-palette-stone-800']}
                  poster="o-bg-gradient-to-b o-from-stone-300 o-to-stone-500 dark:o-from-stone-700 dark:o-to-stone-950"
                  className="o-w-full o-overflow-hidden o-rounded-2xl"
                  style={{ height: 420 }}
                />
                <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  Le rayon se tourne au glissement, et un clic tire un volume. Sous
                  mouvement reduit il se replie : la table ci-contre reste entiere.
                </p>

                <div
                  className="o-mt-8 o-border-t o-pt-6"
                  style={{ borderColor: 'var(--o-theme-line)' }}
                >
                  <p
                    className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: encre() }}
                  >
                    Le volume tire
                  </p>
                  <h3 className="o-m-0 o-mt-3 o-text-2xl o-font-bold o-tracking-tight o-text-stone-950 dark:o-text-stone-50">
                    {volumeOuvert.titre}
                  </h3>
                  <p className="o-m-0 o-mt-2 o-text-sm o-text-stone-700 dark:o-text-stone-300">
                    {volumeOuvert.auteur} · {volumeOuvert.maison} ·{' '}
                    {String(volumeOuvert.pages)} pages · {volumeOuvert.prix}
                  </p>
                  <p className="o-m-0 o-mt-4 o-max-w-md o-text-base o-leading-relaxed o-text-stone-800 dark:o-text-stone-200">
                    {volumeOuvert.cartel}
                  </p>
                </div>
              </div>

              {/* La table, en toutes lettres. */}
              <div className="o-min-w-0 lg:o-col-span-7">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  {COMPTE[table.length] ?? String(table.length)} volumes sur la table
                </p>
                <ol
                  aria-live="polite"
                  className="o-m-0 o-mt-5 o-list-none o-border-t o-p-0"
                  style={{ borderColor: 'var(--o-theme-line)' }}
                >
                  {table.map((v) => (
                    <li
                      key={v.id}
                      className="o-border-b"
                      style={{ borderColor: 'var(--o-theme-line)' }}
                    >
                      <button
                        type="button"
                        aria-pressed={v.id === ouvert}
                        onClick={() => {
                          setTire(v.id)
                        }}
                        className="o-grid o-w-full o-cursor-pointer o-gap-2 o-bg-transparent o-px-0 o-py-6 o-text-left o-transition-opacity hover:o-opacity-75 focus:o-ring md:o-grid-cols-12 md:o-gap-6"
                      >
                        <span className="md:o-col-span-8">
                          <span
                            className="o-block o-uppercase o-text-stone-950 dark:o-text-stone-50"
                            style={{
                              ...affiche('m', 400),
                              fontSize: 'clamp(1.25rem, 2.4vw, 2rem)',
                              letterSpacing: '-0.035em',
                              lineHeight: 1.02,
                            }}
                          >
                            {v.titre}
                          </span>
                          <span className="o-mt-2 o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                            {v.auteur} — {v.maison}
                          </span>
                        </span>
                        <span className="o-flex o-items-baseline o-gap-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300 md:o-col-span-4 md:o-justify-end">
                          <span>{v.pages} p.</span>
                          <span style={{ color: encre() }}>{v.prix}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>

                {/* Le mot du libraire, sur un bristol penche. */}
                <div
                  className="o-relative o-mt-12 o-max-w-lg o-rounded-sm o-p-7 o-shadow-xl"
                  style={{
                    backgroundColor: accentDoux(200, 26),
                    transform: 'rotate(-1.4deg)',
                    boxShadow: '0 18px 40px -28px rgba(0,0,0,0.55)',
                  }}
                >
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                    Le mot du libraire
                  </p>
                  <p className="o-m-0 o-mt-4 o-text-lg o-italic o-leading-relaxed o-text-stone-900 dark:o-text-stone-100">
                    {courante.mot}
                  </p>
                  <div className="o-mt-6 o-flex o-items-center o-gap-4">
                    <HandWritten
                      path={PARAPHE}
                      viewBox="0 0 320 110"
                      width={150}
                      thickness={4}
                      duration={1700}
                      declenchement="vue"
                      color={encre()}
                      className="o-max-w-full"
                    >
                      {courante.signe}
                    </HandWritten>
                    <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                      {courante.signe}, libraire
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*
          ----- Un ecran de texte seul ------------------------------------------
        */}
        <section
          className="o-flex o-items-center o-px-6 o-py-24 md:o-px-10 md:o-py-36"
          style={nuit('stone')}
        >
          <div className="o-mx-auto o-w-full o-max-w-7xl">
            <Manifeste eteint="Une librairie n est pas un entrepot avec des fenetres.">
              C est une piece ou quelqu un a deja lu a votre place, et qui accepte de se
              tromper devant vous.
            </Manifeste>
          </div>
        </section>

        {/*
          ----- La maison : trois refus qui s empilent (M-empile) ---------------
        */}
        <section
          id="maison"
          className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28"
        >
          <div className="o-mx-auto o-max-w-5xl">
            <Indice rang="02" sombre={false}>
              La maison
            </Indice>
            <h2
              className="o-m-0 o-mb-14 o-mt-5 o-max-w-3xl o-uppercase o-text-stone-950 dark:o-text-stone-50"
              style={{
                ...affiche('m', 400),
                fontSize: 'clamp(1.75rem, 4vw, 3.25rem)',
                letterSpacing: '-0.04em',
              }}
            >
              Trois choses que nous ne ferons pas
            </h2>
            <StickyStack offset={CHROME + 40} gap={20} shrink={0.06}>
              {REFUS.map((refus) => (
                <div
                  key={refus.numero}
                  className="o-rounded-2xl o-border-w-1 o-p-8 md:o-p-14"
                  style={{
                    borderColor: 'var(--o-theme-line)',
                    backgroundColor: accentDoux(300, 14),
                  }}
                >
                  <p
                    className="o-m-0 o-tabular-nums o-text-stone-500 dark:o-text-stone-400"
                    style={{
                      ...affiche('l', 400),
                      fontSize: 'clamp(3rem, 8vw, 7rem)',
                      lineHeight: 0.9,
                    }}
                  >
                    {refus.numero}
                  </p>
                  <h3
                    className="o-m-0 o-mt-6 o-max-w-2xl o-uppercase o-text-stone-950 dark:o-text-stone-50"
                    style={{
                      ...affiche('m', 400),
                      fontSize: 'clamp(1.4rem, 3vw, 2.5rem)',
                      letterSpacing: '-0.035em',
                      lineHeight: 1.02,
                    }}
                  >
                    {refus.titre}
                  </h3>
                  <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                    {refus.texte}
                  </p>
                </div>
              ))}
            </StickyStack>
          </div>
        </section>

        {/*
          ----- L appel : une question, trois reponses (A22) --------------------
        */}
        <section
          id="question"
          className="o-scroll-mt-24 o-border-t o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          style={{ borderColor: 'var(--o-theme-line)' }}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <h2
              className="o-m-0 o-max-w-4xl o-uppercase o-text-stone-950 dark:o-text-stone-50"
              style={{
                ...affiche('l', 400),
                fontSize: 'clamp(2.25rem, 6.4vw, 6rem)',
                letterSpacing: '-0.045em',
                lineHeight: 0.94,
              }}
            >
              Vous cherchez quoi, au juste ?
            </h2>
            <ul
              className="o-m-0 o-mt-14 o-grid o-list-none o-gap-px o-p-0 md:o-grid-cols-3"
              style={{ backgroundColor: 'var(--o-theme-line)' }}
            >
              {(
                [
                  [
                    'Un titre precis',
                    'mailto:commande@librairie-marge.fr',
                    'Ecrivez-nous le titre. Nous repondons dans la journee et le livre attend a votre nom, sans acompte.',
                    'commande@librairie-marge.fr',
                  ],
                  [
                    'Une idee, pas un titre',
                    'tel:+33240730912',
                    'Appelez, dites deux livres que vous avez aimes. C est le meilleur conseil que nous savons donner.',
                    '02 40 73 09 12',
                  ],
                  [
                    'Un endroit ou rester',
                    '#haut',
                    'Il y a quatre chaises, du cafe, et personne ne vous demandera rien. Le jeudi soir, on lit a voix haute.',
                    '28 rue des Hauts-Paves, Nantes',
                  ],
                ] as const
              ).map(([titre, cible, texte, adresse]) => (
                <li
                  key={titre}
                  className="o-p-8"
                  style={{ backgroundColor: 'var(--o-theme-bg)' }}
                >
                  <a
                    href={cible}
                    className="o-flex o-h-full o-flex-col o-no-underline focus:o-ring"
                    style={{ color: 'inherit' }}
                  >
                    <span className="o-flex o-items-start o-justify-between o-gap-4">
                      <span
                        className="o-uppercase o-text-stone-950 dark:o-text-stone-50"
                        style={{
                          ...affiche('m', 400),
                          fontSize: 'clamp(1.25rem, 2.2vw, 1.9rem)',
                          letterSpacing: '-0.035em',
                          lineHeight: 1.04,
                        }}
                      >
                        {titre}
                      </span>
                      <Icon
                        icon={ArrowUpRight}
                        size={22}
                        aria-hidden="true"
                        style={{ color: encre() }}
                      />
                    </span>
                    <span className="o-mt-5 o-grow o-text-base o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                      {texte}
                    </span>
                    <span
                      className="o-mt-7 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                      style={{ color: encre() }}
                    >
                      {adresse}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/*
          ----- Le pied : l index alphabetique (P21) ----------------------------
        */}
        <footer
          className="o-border-t o-px-6 o-py-16 md:o-px-10"
          style={{ borderColor: 'var(--o-theme-line)' }}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <p className="o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
              <Icon icon={BookOpen} size={14} aria-hidden="true" />
              Index
            </p>
            <ul
              className="o-m-0 o-mt-8 o-list-none o-p-0"
              style={{ columnWidth: '15rem', columnGap: '2.5rem' }}
            >
              {INDEX.map(([cible, mot], rang) => (
                <li
                  key={`${mot}-${String(rang)}`}
                  className="o-mb-2.5"
                  style={{ breakInside: 'avoid' }}
                >
                  <a
                    href={cible}
                    className="o-text-sm o-uppercase o-tracking-widest o-text-stone-700 o-no-underline hover:o-text-stone-950 focus:o-ring dark:o-text-stone-300 dark:hover:o-text-stone-50"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <UnderlineDraw
                      as="span"
                      trigger="hover"
                      thickness={2}
                      duration={520}
                      color={encre()}
                    >
                      {mot}
                    </UnderlineDraw>
                  </a>
                </li>
              ))}
            </ul>
            <p
              className="o-m-0 o-mt-12 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400"
              style={{ borderColor: 'var(--o-theme-line)' }}
            >
              <span>© 2026 Librairie Marge — 28 rue des Hauts-Paves, 44000 Nantes</span>
              <a
                href="#haut"
                className="o-text-stone-500 o-no-underline hover:o-text-stone-950 focus:o-ring dark:o-text-stone-400 dark:hover:o-text-stone-50"
              >
                Remonter ↑
              </a>
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
