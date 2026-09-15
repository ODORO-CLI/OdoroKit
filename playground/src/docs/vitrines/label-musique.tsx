/**
 * Cale Seche — label et salle de concert.
 *
 * ## L architecture : une affiche de saison, deroulee
 *
 * Landing page complete dont le **milieu garde la forme d une affiche
 * imprimee**, et c est ce qui n appartient qu a elle. Une salle annonce sa
 * saison par un depliant : le jour en chiffre dans la marge, l artiste en corps
 * large, le tarif a droite, et les dates completes frappees d un tampon
 * « complet » pose de travers, comme sur une affiche collee en vitrine. Le
 * catalogue suit en references `CS-001` a `CS-011`, comme le dos d une pochette.
 *
 * L enchainement :
 *
 * - **l affiche** en ouverture, typographie seule sur le noeud torique ;
 * - **le bandeau des artistes**, deux lignes geantes qui defilent en sens
 *   inverse et penchent avec la vitesse du defilement ;
 * - **le programme**, filtre par genre en menu coulant — le mecanisme de la
 *   page ; chaque nom d artiste se courbe en traversant l ecran ;
 * - **les sorties** du label, en references, penchees elles aussi par la
 *   vitesse, avec le vinyle qui chevauche la section ;
 * - **le ticker** des ecoutes et de la repartition des recettes ;
 * - **deux panneaux decales** : la scene d un cote, l abonnement de l autre ;
 * - **le plan du site**, six colonnes de petits liens.
 *
 * ## Le fond
 *
 * Le noeud torique est la **marque de la saison** : il occupe le premier ecran
 * derriere le titre, comme une vignette serigraphiee, et ne revient plus.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight, Ticket } from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import { useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { TorusKnot } from '@/odoro/background/TorusKnot.jsx'
import { Marquee } from '@/odoro/effect/Marquee.jsx'
import { ScrollVelocity } from '@/odoro/effect/ScrollVelocity.jsx'
import { Duotone } from '@/odoro/image/Duotone.jsx'
import { WarpText } from '@/odoro/text/WarpText.jsx'
import { FlowingMenu } from '@/odoro/ui/FlowingMenu.jsx'

import { nuit, Voile } from './communs.jsx'
import { photo } from './media.js'
import { accent, aplat, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreCoins,
  Etiquette,
  Grain,
  Horloge,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Bandeau } from './scene.jsx'

/** Les genres programmes. */
const GENRES = ['Electronique', 'Jazz', 'Rock', 'Musiques du monde'] as const
type Genre = (typeof GENRES)[number]

/** Les entrees du filtre : « Tous » d abord. */
const FILTRES = ['Tous', ...GENRES] as const

/** Une date a l affiche. */
interface Date {
  readonly artiste: string
  readonly jour: string
  readonly mois: string
  readonly genre: Genre
  readonly plein: number
  readonly reduit: number
  readonly jauge: number
  readonly restant: number
  readonly mention: string
}

/** Le programme de l automne. */
const PROGRAMME: readonly Date[] = [
  {
    artiste: 'Merzhin Trio',
    jour: '18',
    mois: 'Sept.',
    genre: 'Jazz',
    plein: 18,
    reduit: 13,
    jauge: 340,
    restant: 96,
    mention: 'Premiere partie : conservatoire de Lorient',
  },
  {
    artiste: 'Halte Fixe',
    jour: '26',
    mois: 'Sept.',
    genre: 'Electronique',
    plein: 22,
    reduit: 16,
    jauge: 340,
    restant: 0,
    mention: 'Complet depuis le 4 aout — file d attente a 19 h',
  },
  {
    artiste: 'Les Charpentiers',
    jour: '09',
    mois: 'Oct.',
    genre: 'Rock',
    plein: 20,
    reduit: 15,
    jauge: 340,
    restant: 213,
    mention: 'Sortie du deuxieme disque, vendu 14 EUR au comptoir',
  },
  {
    artiste: 'Amina Sow Quintet',
    jour: '17',
    mois: 'Oct.',
    genre: 'Musiques du monde',
    plein: 19,
    reduit: 14,
    jauge: 240,
    restant: 41,
    mention: 'Concert assis — jauge ramenee a 240 places',
  },
  {
    artiste: 'Bloc Nord',
    jour: '24',
    mois: 'Oct.',
    genre: 'Electronique',
    plein: 24,
    reduit: 18,
    jauge: 340,
    restant: 8,
    mention: 'Debout jusqu a 2 h — zone calme au premier etage',
  },
  {
    artiste: 'Quatuor Estran',
    jour: '07',
    mois: 'Nov.',
    genre: 'Jazz',
    plein: 16,
    reduit: 12,
    jauge: 240,
    restant: 158,
    mention: 'Sans amplification — salle en configuration d origine',
  },
  {
    artiste: 'Tanguy Hemon',
    jour: '15',
    mois: 'Nov.',
    genre: 'Rock',
    plein: 20,
    reduit: 15,
    jauge: 340,
    restant: 0,
    mention: 'Complet — seconde date le 16, en vente le 20 septembre',
  },
  {
    artiste: 'Orchestre de Poche',
    jour: '29',
    mois: 'Nov.',
    genre: 'Musiques du monde',
    plein: 15,
    reduit: 11,
    jauge: 340,
    restant: 271,
    mention: 'Quatorze musiciens, dont neuf du departement',
  },
]

/** Le catalogue du label, en references, avec les ecoutes du ticker. */
const CATALOGUE: readonly (readonly [string, string, string, string, boolean, number])[] =
  [
    [
      'CS-011',
      'Basses eaux',
      'Halte Fixe',
      '2026 — vinyle 33 t et numerique',
      true,
      412300,
    ],
    [
      'CS-010',
      'Ce qui reste du quai',
      'Les Charpentiers',
      '2025 — vinyle 33 t et numerique',
      true,
      188410,
    ],
    [
      'CS-009',
      'Estran',
      'Quatuor Estran',
      '2025 — disque compact et numerique',
      true,
      96200,
    ],
    [
      'CS-008',
      'Sept marees',
      'Merzhin Trio',
      '2024 — vinyle 45 t et numerique',
      true,
      241900,
    ],
    ['CS-007', 'Nuit basse', 'Bloc Nord', '2023 — numerique seul', false, 73100],
    ['CS-006', 'Le fil', 'Amina Sow Quintet', '2022 — epuise en physique', false, 58640],
  ]

/** La repartition des recettes d un disque vendu 20 EUR, en ticker. */
const REPARTITION: readonly (readonly [string, number])[] = [
  ['A l artiste', 50],
  ['Fabrication', 22],
  ['Au label', 18],
  ['Distribution', 10],
]

/** Les formules d abonnement de la saison. */
const ABONNEMENTS: readonly {
  readonly nom: string
  readonly prix: number
  readonly detail: string
  readonly phare?: boolean
}[] = [
  {
    nom: 'Trois soirs',
    prix: 48,
    detail: 'Trois dates au choix, tarif reduit applique.',
  },
  {
    nom: 'La saison',
    prix: 112,
    detail: 'Les huit soirs, place gardee jusqu a 20 h 30.',
    phare: true,
  },
  {
    nom: 'Soutien',
    prix: 180,
    detail: 'La saison, le catalogue en numerique et le vinyle de l annee.',
  },
]

/** Le plan du site, six colonnes. */
const PLAN: readonly (readonly [string, readonly string[]])[] = [
  ['Programme', PROGRAMME.map((d) => d.artiste)],
  ['Catalogue', CATALOGUE.map(([, titre]) => titre)],
  [
    'La salle',
    [
      '12 quai de Rohan',
      'Venir en train',
      'Plan d acces',
      'Accessibilite',
      'Bouchons fournis',
      'Zone calme',
      'Niveau 102 dB',
    ],
  ],
  [
    'Le label',
    [
      'Envoyer une maquette',
      'La licence en six pages',
      'Ou va chaque euro',
      'Pressage a Bordeaux',
      'Distribution',
      'Presse',
    ],
  ],
  [
    'S abonner',
    [
      'Trois soirs — 48 EUR',
      'La saison — 112 EUR',
      'Soutien — 180 EUR',
      'Carte cadeau',
      'Billetterie',
      'Tarif reduit',
    ],
  ],
  [
    'Mentions',
    [
      'Association loi 1901',
      'Licences PLATESV',
      'Donnees personnelles',
      'Credits photo',
      'Contact',
      'Lettre d information',
    ],
  ],
]

/** Un nombre d ecoutes, ecrit a la francaise. */
function ecoutes(n: number): string {
  return n.toLocaleString('fr-FR')
}

/** Le tampon « complet », pose de travers sur une date. */
function Tampon({ angle = -8 }: { readonly angle?: number }): ReactElement {
  return (
    <span
      className="o-inline-block o-rounded-md o-border-w-2 o-px-2 o-py-0.5 o-font-mono o-text-xs o-font-bold o-uppercase o-tracking-widest"
      style={{
        borderColor: encre(),
        color: encre(),
        transform: `rotate(${String(angle)}deg)`,
      }}
    >
      Complet
    </span>
  )
}

/** La vitrine complete : une affiche de saison. */
export default function Page(): ReactElement {
  const polices = usePolices('affiche')
  const [filtre, setFiltre] = useState(0)
  const genre = FILTRES[filtre] ?? 'Tous'

  const dates = useMemo(
    () => PROGRAMME.filter((d) => genre === 'Tous' || d.genre === genre),
    [genre],
  )

  const artistes = PROGRAMME.map((d) => d.artiste)
  const contour: CSSProperties = {
    color: 'transparent',
    WebkitTextStroke: '2px var(--o-theme-fg)',
  }

  return (
    <Porte forme="zoom" marque="Cale Seche">
      <div
        className="o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-100"
        style={polices}
      >
        {/* ================= L affiche : typographie seule, la marque au centre ===== */}
        <header
          className="o-relative o-isolate o-flex o-min-h-screen o-flex-col o-overflow-hidden"
          style={nuit('zinc')}
        >
          <TorusKnot
            className="o-absolute o-inset-0 o-z-0 o-pointer-events-none"
            colors={['--o-theme-bg', '--o-vitrine-400', '--o-vitrine-600']}
            poster="o-bg-zinc-950"
          />
          <Voile sens="haut-bas" />
          <Grain opacite={0.07} />

          <BarreCoins
            marque="Cale Seche"
            liens={[
              ['#programme', 'Le programme'],
              ['#sorties', 'Les sorties'],
              ['#abonnement', 'S abonner'],
            ]}
            droite={<Horloge ville="Lorient" />}
          />

          <div className="o-relative o-z-10 o-mx-auto o-flex o-w-full o-max-w-7xl o-grow o-flex-col o-justify-end o-px-6 o-pb-10 md:o-px-8">
            <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-x-10 o-gap-y-6">
              <div className="o-max-w-md">
                <Surgit>
                  <Etiquette>Saison d automne — huit soirs</Etiquette>
                </Surgit>
                <Surgit
                  delai={160}
                  as="p"
                  className="o-m-0 o-mt-6 o-text-lg o-leading-relaxed o-text-zinc-300"
                >
                  Label et salle sous le meme toit, dans une cale seche couverte en 2014.
                  La moitie de chaque disque va a l artiste.
                </Surgit>
                <Surgit delai={300} className="o-mt-8">
                  <Actions
                    pleine={[
                      '#programme',
                      <>
                        <Icon icon={Ticket} size={16} aria-hidden="true" /> Prendre une
                        place
                      </>,
                    ]}
                    fantome={['#sorties', 'Les sorties du label']}
                  />
                </Surgit>
              </div>
              <Surgit
                delai={200}
                as="p"
                className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-text-right"
              >
                18 septembre — 29 novembre
                <br />
                12 quai de Rohan, Lorient
                <br />
                340 debout, 240 assises
              </Surgit>
            </div>

            <TitreVague
              delai={420}
              cadence={140}
              className="o-m-0 o-mt-12 o-uppercase o-text-zinc-50"
              style={{ ...affiche('xxl', 800), lineHeight: 0.85 }}
            >
              Cale Seche
            </TitreVague>
          </div>
        </header>

        <main>
          {/* ================= Le bandeau des artistes : deux lignes, deux sens, penchees par la vitesse ===== */}
          <section
            aria-label="Les artistes de la saison"
            className="o-overflow-hidden o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-py-10 md:o-py-14"
          >
            <ScrollVelocity strength={1.4} damping={6}>
              <div
                className="o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
                style={affiche('xl', 800)}
              >
                <Bandeau
                  mots={artistes}
                  separateur="✦"
                  vitesse={38}
                  taille="clamp(3rem, 8vw, 8rem)"
                />
              </div>
              <div
                aria-hidden="true"
                className="o-mt-2 o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
                style={{ ...affiche('xl', 800), ...contour }}
              >
                <Bandeau
                  mots={[...artistes].reverse()}
                  separateur="✦"
                  vitesse={46}
                  inverse
                  taille="clamp(3rem, 8vw, 8rem)"
                />
              </div>
            </ScrollVelocity>
          </section>

          {/* ================= (01) Le programme : le depliant, filtre par un menu coulant ===== */}
          <section
            id="programme"
            aria-labelledby="programme-titre"
            className="o-scroll-mt-24 o-mx-auto o-max-w-7xl o-px-6 o-pt-20 md:o-px-8 md:o-pt-28"
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="01" sombre={false}>
                  Le programme — huit soirs
                </Indice>
                <h2
                  id="programme-titre"
                  className="o-m-0 o-mt-6 o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('l', 800),
                    fontSize: 'clamp(2.75rem, 7.5vw, 7rem)',
                  }}
                >
                  L automne, soir par soir.
                </h2>
              </div>
              <p className="o-m-0 o-max-w-xs o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-4 md:o-justify-self-end">
                Le sol garde sa pente, le plafond ses poutres. Ce qu on entend au
                troisieme rang, on l entend au dernier.
              </p>
            </div>

            {/* Le filtre : cinq lignes de menu dont le fond coule au survol. La
                ligne active prend l encre de la vitrine, pas la nuance brute. */}
            <div
              className="o-mt-14"
              style={{ '--o-palette-brand-500': encre() } as CSSProperties}
            >
              <FlowingMenu
                label="Filtrer le programme par genre"
                items={FILTRES.map((f) => ({ label: f }))}
                active={filtre}
                onActiveChange={setFiltre}
                speed={8}
                repeat={5}
              />
            </div>

            <ol className="o-m-0 o-list-none o-p-0" aria-live="polite">
              {dates.map((date, rang) => {
                const complet = date.restant === 0
                return (
                  <li
                    key={`${date.jour}-${date.artiste}`}
                    className="o-grid o-items-center o-gap-x-6 o-gap-y-2 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-py-7 md:o-grid-cols-12 md:o-py-9"
                  >
                    {/* Le jour en chiffre, dans la marge — comme sur un depliant. */}
                    <p className="o-m-0 o-flex o-items-baseline o-gap-3 md:o-col-span-2">
                      <span
                        className="o-tabular-nums"
                        style={{
                          ...affiche('m', 800),
                          fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                          color: complet ? 'var(--o-theme-muted)' : encre(),
                        }}
                      >
                        {date.jour}
                      </span>
                      <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                        {date.mois}
                      </span>
                    </p>

                    <div className="o-min-w-0 md:o-col-span-7">
                      <div className="o-flex o-flex-wrap o-items-center o-gap-x-5 o-gap-y-2">
                        <WarpText
                          as="h3"
                          amplitude={10 + (rang % 3) * 4}
                          inclinaison={4}
                          course={1.3}
                          className={`o-m-0 o-uppercase ${complet ? 'o-text-zinc-500 dark:o-text-zinc-500' : 'o-text-zinc-950 dark:o-text-zinc-50'}`}
                          style={{
                            ...affiche('m', 800),
                            fontSize: 'clamp(1.35rem, 3.6vw, 3.5rem)',
                          }}
                        >
                          {date.artiste}
                        </WarpText>
                        {complet && <Tampon angle={rang % 2 === 0 ? -8 : 6} />}
                      </div>
                      <p className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                        {date.genre} — jauge {date.jauge}
                      </p>
                      <p className="o-m-0 o-mt-1.5 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
                        {date.mention}
                      </p>
                    </div>

                    <div className="o-text-left md:o-col-span-3 md:o-text-right">
                      <p className="o-m-0 o-font-mono o-text-lg o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
                        {date.plein} / {date.reduit} EUR
                      </p>
                      <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-tracking-widest">
                        {complet ? (
                          <span className="o-text-zinc-600 dark:o-text-zinc-400">
                            File d attente a 19 h
                          </span>
                        ) : (
                          <a
                            href="#abonnement"
                            className="o-no-underline focus:o-ring"
                            style={{ color: encre() }}
                          >
                            {date.restant} places ↗
                          </a>
                        )}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
            <p className="o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
              {dates.length} date{dates.length > 1 ? 's' : ''} sur {PROGRAMME.length} —
              tarif reduit sur declaration, sans justificatif
            </p>
          </section>

          {/* ================= (02) Les sorties : les references, penchees par la vitesse ; le vinyle chevauche ===== */}
          <section
            id="sorties"
            aria-labelledby="sorties-titre"
            className="o-scroll-mt-24 o-relative o-mx-auto o-max-w-7xl o-px-6 o-pb-24 o-pt-28 md:o-px-8 md:o-pt-40"
          >
            <div className="o-grid o-gap-10 md:o-grid-cols-12">
              {/* La photo penchee, montee dans la marge, qui mord sur le programme. */}
              <Reveal className="o-order-2 md:o-order-1 md:o-col-span-4">
                <figure className="o-m-0 md:o-sticky" style={{ top: 140 }}>
                  <div style={{ transform: 'rotate(-4deg)', marginTop: '-4rem' }}>
                    <Duotone
                      src={photo('cale-vinyle', 800, 600)}
                      alt="Un disque sur la platine, bras en lecture"
                      ratio={1}
                      shadow="var(--o-palette-zinc-950)"
                      light={accent(200)}
                      className="o-rounded-lg o-shadow-2xl"
                    />
                  </div>
                  <figcaption className="o-mt-6 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                    Presse a Bordeaux. Survolez : la couleur revient.
                  </figcaption>
                </figure>
              </Reveal>

              <div className="o-order-1 o-min-w-0 md:o-order-2 md:o-col-span-8">
                <Indice rang="02" sombre={false}>
                  Les sorties — onze references
                </Indice>
                <h2
                  id="sorties-titre"
                  className="o-m-0 o-mt-6 o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('l', 800),
                    fontSize: 'clamp(2.75rem, 7.5vw, 7rem)',
                  }}
                >
                  Six encore pressees.
                </h2>

                <ScrollVelocity strength={0.9} damping={7} className="o-mt-12">
                  <ol className="o-m-0 o-list-none o-border-t o-border-zinc-900 dark:o-border-zinc-100 o-p-0">
                    {CATALOGUE.map(([reference, titre, artiste, format, presse]) => (
                      <li
                        key={reference}
                        className="o-grid o-items-baseline o-gap-x-5 o-gap-y-1 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-py-5 md:o-grid-cols-12"
                      >
                        <p
                          className="o-m-0 o-font-mono o-text-xs o-tabular-nums o-tracking-widest md:o-col-span-2"
                          style={{ color: encre() }}
                        >
                          {reference}
                        </p>
                        <p
                          className="o-m-0 o-uppercase o-text-zinc-950 dark:o-text-zinc-50 md:o-col-span-6"
                          style={{
                            ...affiche('m', 800),
                            fontSize: 'clamp(1.5rem, 2.6vw, 2.5rem)',
                          }}
                        >
                          {titre}
                        </p>
                        <p className="o-m-0 o-text-sm o-font-medium md:o-col-span-4 md:o-text-right">
                          {artiste}
                          <span className="o-mt-0.5 o-block o-font-mono o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
                            {format}
                            {!presse && <span className="o-ml-2 o-italic">epuise</span>}
                          </span>
                        </p>
                      </li>
                    ))}
                  </ol>
                </ScrollVelocity>

                <div className="o-mt-20">
                  <Manifeste
                    sombre={false}
                    eteint="Aucune avance versee, donc aucune a rembourser :"
                  >
                    la moitie de chaque disque va a l artiste, des le premier euro. La
                    licence court sept ans et tient en six pages.
                  </Manifeste>
                </div>
              </div>
            </div>
          </section>

          {/* ================= Le ticker : ecoutes et repartition, sur l aplat ===== */}
          <section
            aria-label="Ecoutes du catalogue et repartition des recettes"
            className="o-overflow-hidden o-py-4"
            style={aplat()}
          >
            <Marquee
              speed={30}
              fade={0}
              pauseOnHover={false}
              className="o-font-mono o-text-sm o-uppercase o-tracking-widest"
            >
              {CATALOGUE.map(([reference, titre, , , , n]) => (
                <span
                  key={reference}
                  className="o-flex o-shrink-0 o-items-center o-gap-4 o-px-6 o-whitespace-nowrap"
                >
                  <span className="o-opacity-70">{reference}</span>
                  <span className="o-font-bold">{titre}</span>
                  <span className="o-tabular-nums">{ecoutes(n)} ecoutes</span>
                  <span aria-hidden="true">▲</span>
                </span>
              ))}
            </Marquee>
            <Marquee
              speed={44}
              fade={0}
              pauseOnHover={false}
              reverse
              className="o-mt-3 o-font-mono o-text-sm o-uppercase o-tracking-widest o-opacity-80"
            >
              {REPARTITION.map(([quoi, part]) => (
                <span
                  key={quoi}
                  className="o-flex o-shrink-0 o-items-center o-gap-4 o-px-6 o-whitespace-nowrap"
                >
                  <span>Sur un disque a 20 EUR —</span>
                  <span className="o-font-bold">{quoi}</span>
                  <span className="o-tabular-nums">{part} %</span>
                  <span aria-hidden="true">✦</span>
                </span>
              ))}
            </Marquee>
          </section>

          {/* ================= (03) L appel : deux panneaux decales, la scene et l abonnement ===== */}
          <section
            id="abonnement"
            aria-labelledby="abonnement-titre"
            className="o-scroll-mt-24 o-mx-auto o-max-w-7xl o-px-6 o-py-24 md:o-px-8 md:o-py-36"
          >
            <div className="o-grid o-gap-0 md:o-grid-cols-12">
              <Reveal className="md:o-col-span-7 md:o-col-start-1 md:o-row-start-1">
                <figure className="o-m-0">
                  <Duotone
                    src={photo('cale-scene', 900, 700)}
                    alt="La scene vide, une heure avant l ouverture des portes"
                    ratio={1.35}
                    shadow="var(--o-palette-zinc-950)"
                    light={accent(200)}
                  />
                  <figcaption className="o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                    La scene, une heure avant l ouverture des portes
                  </figcaption>
                </figure>
              </Reveal>
              {/* Le panneau de texte part de la septieme colonne : il mord d une
                  colonne sur la photo, et descend d un tiers d ecran. */}
              <Reveal
                delay={120}
                className="o-relative o-z-10 md:o-col-span-6 md:o-col-start-7 md:o-row-start-1 md:o-mt-32"
              >
                <div className="o-p-8 md:o-p-10" style={nuit('zinc')}>
                  <Indice rang="03">S abonner</Indice>
                  <h2
                    id="abonnement-titre"
                    className="o-m-0 o-mt-6 o-uppercase o-text-zinc-50"
                    style={{
                      ...affiche('m', 800),
                      fontSize: 'clamp(2rem, 3.6vw, 3.5rem)',
                    }}
                  >
                    Huit soirs, une place gardee.
                  </h2>
                  <ul className="o-m-0 o-mt-8 o-list-none o-border-t o-border-white-20 o-p-0">
                    {ABONNEMENTS.map((f) => (
                      <li
                        key={f.nom}
                        className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-6 o-gap-y-1 o-border-b o-border-white-10 o-py-4"
                      >
                        <span className="o-text-base o-font-semibold o-text-zinc-50">
                          {f.nom}
                          <span className="o-mt-0.5 o-block o-text-xs o-font-normal o-text-zinc-400">
                            {f.detail}
                          </span>
                        </span>
                        <span
                          className="o-font-mono o-text-xl o-tabular-nums"
                          style={{
                            color:
                              f.phare === true
                                ? encreSurSombre()
                                : 'var(--o-palette-zinc-50)',
                          }}
                        >
                          {f.prix} EUR
                        </span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#programme"
                    className="o-mt-8 o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                    style={{
                      backgroundColor: encreSurSombre(),
                      color: 'var(--o-palette-zinc-950)',
                    }}
                  >
                    S abonner pour l automne{' '}
                    <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                  </a>
                  <p className="o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                    Nominatif, cessible une fois. Vente ouverte trois jours avant tout le
                    monde.
                  </p>
                </div>
              </Reveal>
            </div>
          </section>
        </main>

        {/* ================= Le pied : le plan du site, six colonnes de petits liens ===== */}
        <footer className="o-border-t o-border-zinc-900 dark:o-border-zinc-100 o-px-6 o-pb-8 o-pt-12 md:o-px-8">
          <div className="o-mx-auto o-max-w-7xl">
            <nav
              aria-label="Plan du site"
              className="o-grid o-grid-cols-2 o-gap-x-6 o-gap-y-10 sm:o-grid-cols-3 lg:o-grid-cols-6"
            >
              {PLAN.map(([titre, liens]) => (
                <div key={titre}>
                  <p
                    className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: encre() }}
                  >
                    {titre}
                  </p>
                  <ul className="o-m-0 o-mt-4 o-list-none o-space-y-1.5 o-p-0">
                    {liens.map((l) => (
                      <li key={l}>
                        <a
                          href="#programme"
                          className="o-text-xs o-no-underline o-text-zinc-700 dark:o-text-zinc-300 o-transition-colors hover:o-text-zinc-950 dark:hover:o-text-zinc-50 focus:o-ring"
                        >
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="o-mt-14 o-flex o-flex-wrap o-items-center o-justify-between o-gap-x-8 o-gap-y-3 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
              <span>
                © 2026 Cale Seche — association loi 1901 — PLATESV-D-2021-004112 et 004113
              </span>
              <a
                href="#programme"
                className="o-inline-flex o-items-center o-gap-1 o-no-underline o-text-zinc-700 dark:o-text-zinc-300 hover:o-text-zinc-950 dark:hover:o-text-zinc-50 focus:o-ring"
              >
                maquettes@cale-seche.fr{' '}
                <Icon icon={ArrowUpRight} size={12} aria-hidden="true" />
              </a>
              <span>
                12 quai de Rohan, 56100 Lorient — <Horloge ville="Lorient" />
              </span>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
