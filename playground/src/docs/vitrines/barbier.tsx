/**
 * Atelier Rasoir — barbier, Paris 9e.
 *
 * ## L architecture : tout la page mene au fauteuil
 *
 * Landing page complete, dont le **coeur est un agenda a deux entrees** —
 * trois fauteuils en lignes, quatre jours en colonnes. Ce qui n appartient qu a
 * elle, c est que **le panier commande la grille** : un creneau dont la fenetre
 * est plus courte que les prestations cochees reste affiche, grise, plutot que
 * de disparaitre. Un salon complet ne vend pas des heures, il vend des trous
 * d une certaine longueur ; la page le montre au lieu de le cacher.
 *
 * ## L univers (Salonix)
 *
 * - **ouverture** : la vapeur en scene, le nom en capitales lourdes, la salle en
 *   fondu enchaine, le soin le plus demande en carte flottante ;
 * - **le rail des soins** : six panneaux qu on parcourt de cote en defilant, et
 *   qu on coche au passage — le rail est le panier ;
 * - **un seul nombre** : onze ans rue Bergere, en deux cents pixels, sur une
 *   bande de nuit — le second et dernier ton de la page — d ou la photo du
 *   fauteuil sort par le bas pour mordre sur la section suivante ;
 * - **les trois fauteuils**, en chapitre a etiquette collante, numerotes ;
 * - **l agenda**, qui sert d appel ;
 * - **le generique de fin**, qui defile.
 *
 * ## Le fond
 *
 * La vapeur tient l ouverture, et elle seule : c est la serviette chaude, le
 * premier geste du rasage. Le reste de la page est une grille horaire, et une
 * grille se lit sur du calme.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, Check, Clock, Plus, X } from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import { useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { Smoke } from '@/odoro/background/Smoke.jsx'
import { KenBurns } from '@/odoro/image/KenBurns.jsx'
import { ScrollRevealImage } from '@/odoro/image/ScrollRevealImage.jsx'
import { CinematicFooter } from '@/odoro/section/CinematicFooter.jsx'
import { LetterSwap } from '@/odoro/text/LetterSwap.jsx'

import { nuit, Voile } from './communs.jsx'
import { photo, portrait } from './media.js'
import { accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreFilet,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  verre,
} from './marche.jsx'
import { Bandeau, Chapitre, Parallaxe, Rail } from './scene.jsx'

interface Prestation {
  readonly cle: string
  readonly nom: string
  /** Le nom en un mot, pour le rail : les lettres y permutent une a une. */
  readonly court: string
  /** Duree au fauteuil, en minutes : c est elle qui s additionne. */
  readonly duree: number
  readonly prix: number
  readonly detail: string
  /** Les fauteuils qui la pratiquent. */
  readonly parQui: readonly string[]
}

/** Les trois fauteuils, par leur cle. */
const FAUTEUILS = [
  { cle: 'sofiane', nom: 'Sofiane', complet: 'Sofiane Merad' },
  { cle: 'ivan', nom: 'Ivan', complet: 'Ivan Petrescu' },
  { cle: 'camille', nom: 'Camille', complet: 'Camille Vasseur' },
] as const

/** La carte des prestations. */
const PRESTATIONS: readonly Prestation[] = [
  {
    cle: 'coupe',
    nom: 'Coupe',
    court: 'Coupe',
    duree: 30,
    prix: 32,
    detail: 'Tondeuse et ciseaux, shampoing, coiffage a la cire ou a l argile.',
    parQui: ['sofiane', 'ivan', 'camille'],
  },
  {
    cle: 'barbe',
    nom: 'Taille de barbe',
    court: 'Barbe',
    duree: 25,
    prix: 26,
    detail: 'Contours au rasoir, huile, peigne. Sans coupe de cheveux.',
    parQui: ['sofiane', 'ivan'],
  },
  {
    cle: 'rasage',
    nom: 'Rasage a l ancienne',
    court: 'Rasage',
    duree: 40,
    prix: 38,
    detail: 'Serviette chaude, blaireau, rasoir droit, alun et baume apaisant.',
    parQui: ['sofiane', 'ivan'],
  },
  {
    cle: 'enfant',
    nom: 'Coupe enfant',
    court: 'Enfant',
    duree: 25,
    prix: 22,
    detail: 'Jusqu a douze ans, sur le fauteuil sureleve. Sans rendez-vous le mercredi.',
    parQui: ['camille'],
  },
  {
    cle: 'soin',
    nom: 'Soin du visage',
    court: 'Soin',
    duree: 20,
    prix: 24,
    detail:
      'Gommage, vapeur, masque a l argile verte. Se prend a la suite d autre chose.',
    parQui: ['sofiane', 'camille'],
  },
  {
    cle: 'couleur',
    nom: 'Couverture des cheveux blancs',
    court: 'Couleur',
    duree: 35,
    prix: 34,
    detail: 'Coloration ton sur ton, sans ammoniaque. Tient six semaines.',
    parQui: ['camille'],
  },
]

/** Les jours proposes a la reservation. */
const JOURS = [
  { value: 'mardi', label: 'Mar 10' },
  { value: 'mercredi', label: 'Mer 11' },
  { value: 'vendredi', label: 'Ven 13' },
  { value: 'samedi', label: 'Sam 14' },
]

/** Un creneau libre, avec la fenetre qui le suit. */
interface Creneau {
  readonly heure: string
  /** Minutes libres avant le rendez-vous suivant. */
  readonly fenetre: number
}

/**
 * L agenda, fauteuil par fauteuil et jour par jour.
 *
 * La fenetre n est pas decorative : c est elle qui decide si le panier de
 * prestations rentre. Un salon complet ne vend pas des heures, il vend des
 * trous d une certaine longueur.
 */
const AGENDA: Readonly<Record<string, Readonly<Record<string, readonly Creneau[]>>>> = {
  sofiane: {
    mardi: [
      { heure: '09:00', fenetre: 90 },
      { heure: '11:00', fenetre: 30 },
      { heure: '14:30', fenetre: 60 },
      { heure: '17:00', fenetre: 120 },
    ],
    mercredi: [
      { heure: '10:00', fenetre: 25 },
      { heure: '15:00', fenetre: 90 },
      { heure: '18:30', fenetre: 60 },
    ],
    vendredi: [
      { heure: '09:30', fenetre: 55 },
      { heure: '16:00', fenetre: 30 },
      { heure: '17:30', fenetre: 120 },
    ],
    samedi: [
      { heure: '08:00', fenetre: 45 },
      { heure: '13:15', fenetre: 25 },
      { heure: '19:00', fenetre: 60 },
    ],
  },
  ivan: {
    mardi: [
      { heure: '09:30', fenetre: 60 },
      { heure: '12:00', fenetre: 40 },
      { heure: '16:00', fenetre: 30 },
      { heure: '18:00', fenetre: 120 },
    ],
    mercredi: [
      { heure: '09:00', fenetre: 120 },
      { heure: '14:00', fenetre: 25 },
      { heure: '17:00', fenetre: 65 },
    ],
    vendredi: [
      { heure: '11:00', fenetre: 45 },
      { heure: '15:30', fenetre: 90 },
      { heure: '19:00', fenetre: 60 },
    ],
    samedi: [
      { heure: '08:45', fenetre: 30 },
      { heure: '10:30', fenetre: 80 },
      { heure: '16:45', fenetre: 40 },
    ],
  },
  camille: {
    mardi: [
      { heure: '07:00', fenetre: 60 },
      { heure: '10:00', fenetre: 35 },
      { heure: '13:30', fenetre: 90 },
      { heure: '17:30', fenetre: 25 },
    ],
    mercredi: [
      { heure: '07:30', fenetre: 120 },
      { heure: '11:30', fenetre: 25 },
      { heure: '14:30', fenetre: 55 },
      { heure: '16:30', fenetre: 90 },
    ],
    vendredi: [
      { heure: '07:00', fenetre: 40 },
      { heure: '12:30', fenetre: 60 },
      { heure: '18:00', fenetre: 30 },
    ],
    samedi: [
      { heure: '08:00', fenetre: 90 },
      { heure: '12:00', fenetre: 30 },
      { heure: '15:00', fenetre: 55 },
      { heure: '18:15', fenetre: 45 },
    ],
  },
}

/* ============================ Ce qu on doit dire ======================== */

/** Les regles d annulation, telles qu elles sont affichees en salle. */
const ANNULATION = [
  [
    'Jusqu a quatre heures avant',
    'annulation ou report sans rien payer, depuis le lien du message.',
  ],
  ['Moins de quatre heures avant', '15 EUR retenus sur le rendez-vous suivant.'],
  [
    'Retard de plus de dix minutes',
    'la prestation est raccourcie, le prix ne change pas.',
  ],
] as const

/** Les horaires, tels qu ils sont peints sur la vitre. */
const HORAIRES: readonly (readonly [string, string])[] = [
  ['Lundi', 'Ferme'],
  ['Mardi', '9 h — 19 h 30'],
  ['Mercredi', '9 h — 19 h 30'],
  ['Jeudi', '9 h — 21 h'],
  ['Vendredi', '9 h — 19 h 30'],
  ['Samedi', '8 h — 19 h'],
]

/** Ce que chaque fauteuil pratique, en une ligne, puis en trois. */
const METIERS: Readonly<Record<string, readonly [string, string]>> = {
  sofiane: [
    'Rasage et coupe — onze ans au fauteuil',
    'Forme chez un coiffeur de theatre, passe au rasoir droit en 2016. Prend les barbes longues et les rasages complets.',
  ],
  ivan: [
    'Coupe et barbe — degrades a la tondeuse',
    'Vient de Timisoara, huit ans de salon. Le degrade court et les contours nets, sur cheveux epais comme sur cheveux fins.',
  ],
  camille: [
    'Coupe, couleur, enfants',
    'Coiffeuse de formation, au salon depuis l ouverture. Seule a faire la couleur, et la seule que les enfants reclament.',
  ],
}

/** Une duree en minutes, ecrite comme on la dit. */
function dureeLisible(total: number): string {
  if (total < 60) return `${String(total)} min`
  const heures = Math.floor(total / 60)
  const reste = total % 60
  return reste === 0
    ? `${String(heures)} h`
    : `${String(heures)} h ${String(reste).padStart(2, '0')}`
}

/** L heure de sortie, une fois la duree cumulee ajoutee au creneau. */
function heureDeFin(depart: string, duree: number): string {
  const [h, m] = depart.split(':').map(Number)
  const total = (h ?? 0) * 60 + (m ?? 0) + duree
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** Les prenoms des fauteuils qui pratiquent une prestation, en une ligne. */
function parQui(prestation: Prestation): string {
  return FAUTEUILS.filter((f) => prestation.parQui.includes(f.cle))
    .map((f) => f.nom)
    .join(', ')
}

/* ============================ Le rendu ============================ */

/** La vitrine complete : l agenda de la semaine. */
export default function Page(): ReactElement {
  const polices = usePolices('jakarta')
  const [panier, setPanier] = useState<readonly string[]>(['coupe'])
  const [retenu, setRetenu] = useState<{
    readonly qui: string
    readonly jour: string
    readonly heure: string
  } | null>(null)

  const choisies = useMemo(
    () => PRESTATIONS.filter((p) => panier.includes(p.cle)),
    [panier],
  )
  const restantes = useMemo(
    () => PRESTATIONS.filter((p) => !panier.includes(p.cle)),
    [panier],
  )
  const duree = useMemo(() => choisies.reduce((s, p) => s + p.duree, 0), [choisies])
  const prix = useMemo(() => choisies.reduce((s, p) => s + p.prix, 0), [choisies])

  // Un fauteuil ne peut prendre le panier que s il pratique toutes les
  // prestations demandees. C est ce qui rend certaines colonnes vides.
  const fauteuilsPossibles = useMemo(
    () =>
      FAUTEUILS.filter((f) => choisies.every((p) => p.parQui.includes(f.cle))).map(
        (f) => f.cle,
      ),
    [choisies],
  )

  const basculer = (cle: string): void => {
    setRetenu(null)
    setPanier((avant) =>
      avant.includes(cle) ? avant.filter((c) => c !== cle) : [...avant, cle],
    )
  }

  return (
    <Porte forme="iris" marque="Atelier Rasoir">
      <div
        className="o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-100"
        style={polices}
      >
        {/* ================= 1. L ouverture : la vapeur ==================== */}
        <header className="o-relative o-isolate o-overflow-hidden" style={nuit('zinc')}>
          <Smoke
            className="o-absolute o-inset-0 o-z-0 o-pointer-events-none"
            colors={['--o-theme-bg', '--o-vitrine-700', '--o-vitrine-400']}
            speed={0.1}
            scale={1.6}
            lift={0.3}
            fallback="o-bg-zinc-950"
          />
          <Voile sens="bas" />
          <Grain />

          <BarreFilet
            marque="Atelier Rasoir"
            liens={[
              ['#soins', 'Les soins'],
              ['#fauteuils', 'Les fauteuils'],
              ['#agenda', 'L agenda'],
            ]}
            action={['#agenda', 'Prendre rendez-vous']}
          />

          <div
            className="o-relative o-z-10 o-mx-auto o-grid o-max-w-6xl o-items-end o-gap-10 o-px-6 o-pb-28 o-pt-16 lg:o-grid-cols-12 lg:o-gap-14 lg:o-pb-32"
            style={{ minHeight: 'calc(100vh - 101px)' }}
          >
            <div className="o-min-w-0 lg:o-col-span-7">
              <Surgit>
                <Etiquette>#01 — Barbier, Paris 9e</Etiquette>
              </Surgit>
              <TitreVague
                delai={100}
                className="o-m-0 o-mt-6 o-uppercase o-text-zinc-50"
                style={affiche('l', 800)}
              >
                Atelier Rasoir
              </TitreVague>
              <Surgit
                delai={360}
                as="p"
                className="o-m-0 o-mt-7 o-max-w-md o-text-lg o-leading-relaxed o-text-zinc-300"
              >
                Trois fauteuils, un agenda qui se prend en trois clics, et quarante
                minutes pour un rasage au rasoir droit.
              </Surgit>
              <Surgit delai={480} className="o-mt-9">
                <Actions
                  pleine={[
                    '#agenda',
                    <>
                      Voir les creneaux libres{' '}
                      <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#soins', 'Les six soins']}
                />
              </Surgit>
            </div>

            <Surgit delai={240} className="o-relative o-min-w-0 lg:o-col-span-5">
              <KenBurns
                className="o-w-full o-overflow-hidden o-rounded-3xl"
                ratio={1.1}
                interval={5200}
                images={[
                  {
                    src: photo('rasoir-salle', 1000, 900),
                    alt: 'La salle, fauteuils et miroirs',
                  },
                  {
                    src: photo('rasoir-fauteuil', 1000, 900),
                    alt: 'Un fauteuil et son poste de travail',
                  },
                  {
                    src: photo('rasoir-outils', 1000, 900),
                    alt: 'Bol, blaireau et rasoir droit sur leur support',
                  },
                ]}
              />
              {/* Le soin le plus demande, en carte flottante — Salonix. */}
              <div
                className={`${verre(true)} o-absolute o-bottom-4 o-left-4 o-right-4 o-flex o-items-center o-gap-4 o-p-4`}
              >
                <div className="o-min-w-0">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    Le plus demande
                  </p>
                  <p className="o-m-0 o-mt-1 o-text-base o-font-medium o-text-zinc-50">
                    Rasage a l ancienne
                  </p>
                  <p className="o-m-0 o-mt-0.5 o-text-sm o-text-zinc-300">
                    40 min — 38 EUR
                  </p>
                </div>
                <a
                  href="#agenda"
                  aria-label="Reserver un rasage a l ancienne"
                  className="o-ml-auto o-inline-flex o-size-10 o-shrink-0 o-items-center o-justify-center o-rounded-full o-no-underline focus:o-ring"
                  style={aplat()}
                >
                  <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                </a>
              </div>
            </Surgit>
          </div>

          <Coin position="bg">
            27 rue Bergere
            <br />
            Paris 9e — Grands Boulevards
          </Coin>
          <Coin position="bd">
            Du mardi au samedi
            <br />
            Jeudi jusqu a 21 h
          </Coin>
        </header>

        <main>
          {/* ================= 2. Le rail des soins : on coche au passage ===== */}
          <section id="soins" aria-labelledby="soins-titre" className="o-scroll-mt-24">
            <Rail
              ecrans={2.6}
              entete={
                <div className="o-mx-auto o-flex o-w-full o-max-w-6xl o-flex-wrap o-items-end o-justify-between o-gap-x-10 o-gap-y-4 o-px-6 o-pb-6 o-pt-10">
                  <div className="o-min-w-0">
                    <Indice rang="01" sombre={false}>
                      Les soins
                    </Indice>
                    <h2
                      id="soins-titre"
                      className="o-m-0 o-mt-4 o-max-w-2xl"
                      style={{
                        ...affiche('m', 800),
                        fontSize: 'clamp(1.75rem, 4vw, 3.5rem)',
                      }}
                    >
                      Six soins. Cochez au passage.
                    </h2>
                  </div>
                  <p
                    aria-live="polite"
                    className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-text-right"
                  >
                    {choisies.length === 0
                      ? 'Rien de coche'
                      : `${String(choisies.length)} coche${choisies.length > 1 ? 's' : ''} — ${dureeLisible(duree)} — ${String(prix)} EUR`}
                    <br />
                    Le rail est le panier
                  </p>
                </div>
              }
            >
              {/* Le premier panneau tient la marge de gauche : le rail part du bord du texte. */}
              <div
                aria-hidden="true"
                className="o-w-6 o-shrink-0 md:o-w-12"
                style={{ width: 'max(1.5rem, calc((100vw - 72rem) / 2 + 1.5rem))' }}
              />
              {PRESTATIONS.map((prestation, rang) => {
                const coche = panier.includes(prestation.cle)
                return (
                  <button
                    key={prestation.cle}
                    type="button"
                    aria-pressed={coche}
                    onClick={() => {
                      basculer(prestation.cle)
                    }}
                    className="o-relative o-flex o-shrink-0 o-flex-col o-justify-between o-border-l o-border-zinc-300 dark:o-border-zinc-700 o-px-6 o-py-6 o-text-left o-transition-colors focus:o-ring md:o-px-8"
                    style={{
                      width: 'min(78vw, 26rem)',
                      height: 'min(60vh, 34rem)',
                      backgroundColor: coche ? accentDoux(500, 14) : undefined,
                    }}
                  >
                    <span className="o-flex o-items-baseline o-justify-between o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                      <span>{String(rang + 1).padStart(2, '0')} / 06</span>
                      <span className="o-tabular-nums">
                        {dureeLisible(prestation.duree)}
                      </span>
                    </span>

                    <span className="o-block">
                      <LetterSwap
                        as="span"
                        step={40}
                        duration={420}
                        className="o-block o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
                        style={{
                          ...affiche('m', 800),
                          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        }}
                      >
                        {prestation.court}
                      </LetterSwap>
                      <span className="o-mt-2 o-block o-text-base o-font-medium">
                        {prestation.nom}
                      </span>
                      <span className="o-mt-3 o-block o-max-w-xs o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                        {prestation.detail}
                      </span>
                    </span>

                    <span className="o-flex o-items-end o-justify-between o-gap-4">
                      <span className="o-block">
                        <span
                          className="o-block o-text-3xl o-font-bold o-tabular-nums o-tracking-tighter"
                          style={{ color: encre() }}
                        >
                          {prestation.prix} EUR
                        </span>
                        <span className="o-mt-1 o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                          {parQui(prestation)}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="o-inline-flex o-size-10 o-shrink-0 o-items-center o-justify-center o-rounded-full o-border-w-1"
                        style={
                          coche
                            ? { ...aplat(), borderColor: 'transparent' }
                            : { borderColor: 'var(--o-theme-line)' }
                        }
                      >
                        <Icon icon={coche ? Check : Plus} size={16} />
                      </span>
                    </span>
                  </button>
                )
              })}
              <a
                href="#agenda"
                className="o-flex o-shrink-0 o-flex-col o-justify-end o-border-l o-border-zinc-300 dark:o-border-zinc-700 o-px-6 o-py-6 o-no-underline o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring md:o-px-8"
                style={{ width: 'min(70vw, 20rem)', height: 'min(60vh, 34rem)' }}
              >
                <span
                  className="o-block"
                  style={{ ...affiche('m', 800), fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}
                >
                  Puis l heure <span aria-hidden="true">→</span>
                </span>
                <span className="o-mt-3 o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  L agenda de la semaine
                </span>
              </a>
              <div aria-hidden="true" className="o-w-6 o-shrink-0" />
            </Rail>
          </section>

          {/* ================= 3. Un seul nombre : onze ans, sur une bande de nuit ===== */}
          {/* La bande est le second ton de la page, et le seul : le nombre a besoin
            d un fond a lui pour cesser d etre une statistique de plus. La photo
            en sort par le bas et mord sur la section suivante — c est le risque
            de mise en page de cette vitrine. */}
          <section
            aria-labelledby="onze-titre"
            className="o-relative o-isolate o-overflow-visible o-px-6 o-pb-16 o-pt-12 md:o-pb-20 md:o-pt-16"
            style={nuit('zinc')}
          >
            <div
              aria-hidden="true"
              className="o-border-b o-border-white-10 o-pb-6 o-text-zinc-500 dark:o-text-zinc-500"
            >
              <Bandeau
                mots={PRESTATIONS.map((p) => p.court.toUpperCase())}
                separateur="·"
                vitesse={38}
                taille="clamp(1.75rem, 4.5vw, 4rem)"
              />
            </div>

            <div className="o-mx-auto o-mt-12 o-grid o-max-w-6xl o-gap-x-10 o-gap-y-8 md:o-grid-cols-12 md:o-mt-16">
              <div className="o-relative o-z-10 o-min-w-0 md:o-col-span-8">
                <p
                  aria-hidden="true"
                  className="o-m-0 o-flex o-items-baseline o-gap-4 o-tabular-nums o-text-zinc-50"
                  style={{
                    ...affiche('xxl', 800),
                    fontSize: 'clamp(6.5rem, 26vw, 19rem)',
                    lineHeight: 0.78,
                  }}
                >
                  11
                  <span
                    className="o-uppercase o-text-zinc-500"
                    style={{
                      ...affiche('m', 800),
                      fontSize: 'clamp(1.25rem, 4vw, 3rem)',
                    }}
                  >
                    ans
                  </span>
                </p>
                <h2
                  id="onze-titre"
                  className="o-m-0 o-mt-10 o-max-w-xl o-text-2xl o-font-medium o-leading-snug o-tracking-tight o-text-zinc-100 md:o-text-3xl"
                >
                  <span className="o-sr-only">Onze ans. </span>
                  Onze ans rue Bergere, trois fauteuils, jamais un quatrieme : personne n
                  est double, et vous non plus.
                </h2>
              </div>

              {/* Les heures, en note de marge : elles ne meritent pas une section. */}
              <dl className="o-m-0 o-self-end o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 md:o-col-span-4">
                <div className="o-mb-3 o-border-b o-border-white-10 o-pb-2 o-text-zinc-500">
                  Les heures, peintes sur la vitre
                </div>
                {HORAIRES.map(([jour, heures]) => (
                  <div key={jour} className="o-flex o-justify-between o-gap-4 o-py-1">
                    <dt>{jour}</dt>
                    <dd
                      className="o-m-0 o-tabular-nums"
                      style={
                        heures === 'Ferme'
                          ? { color: 'var(--o-palette-zinc-500)' }
                          : { color: encreSurSombre() }
                      }
                    >
                      {heures}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* La photo depasse la bande : elle tombe dans la section d apres. */}
            <Parallaxe
              vitesse={0.14}
              className="o-relative o-z-20 o-mx-auto o-mt-10 o-w-full o-max-w-6xl"
              style={{ marginBottom: 'clamp(-8rem, -12vw, -4rem)' }}
            >
              <div className="o-ml-auto o-w-full sm:o-w-3/4 md:o-w-1/2">
                <ScrollRevealImage
                  src={photo('rasoir-fauteuil', 1100, 780)}
                  alt="Un fauteuil et son poste de travail, en fin de journee"
                  ratio={1.45}
                  direction="up"
                  span={0.5}
                  className="o-w-full o-rounded-3xl o-shadow-2xl"
                />
                <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Le deuxieme fauteuil, apres la fermeture
                </p>
              </div>
            </Parallaxe>
          </section>

          {/* ================= 4. Les trois fauteuils, en chapitre =========== */}
          <div
            id="fauteuils"
            className="o-scroll-mt-24"
            style={{ backgroundColor: 'var(--o-theme-surface)' }}
          >
            <div
              className="o-mx-auto o-max-w-6xl o-px-6 o-pb-20 md:o-pb-28"
              style={{ paddingTop: 'clamp(9rem, 15vw, 13rem)' }}
            >
              <Chapitre
                indice="(02) — Les fauteuils"
                largeur={4}
                titre={
                  <h2
                    className="o-m-0"
                    style={{
                      ...affiche('m', 800),
                      fontSize: 'clamp(1.75rem, 4vw, 3.5rem)',
                    }}
                  >
                    Trois fauteuils, et ce que chacun fait.
                  </h2>
                }
                texte="Si votre panier contient une prestation qu un fauteuil ne pratique pas, sa ligne se vide dans l agenda. Ce n est pas une panne, c est la reponse."
              >
                <ol className="o-m-0 o-list-none o-border-t o-border-zinc-300 dark:o-border-zinc-700 o-p-0">
                  {FAUTEUILS.map((fauteuil, rang) => {
                    const image = portrait(`rasoir-${fauteuil.cle}`, fauteuil.complet)
                    const possible = fauteuilsPossibles.includes(fauteuil.cle)
                    return (
                      <li
                        key={fauteuil.cle}
                        className="o-border-b o-border-zinc-300 dark:o-border-zinc-700 o-py-8"
                      >
                        <Reveal delay={rang * 80}>
                          <div className="o-grid o-gap-x-6 o-gap-y-4 sm:o-grid-cols-12">
                            <div className="o-flex o-items-center o-gap-4 sm:o-col-span-3 sm:o-flex-col sm:o-items-start">
                              <span
                                aria-hidden="true"
                                className="o-tabular-nums o-text-zinc-500 dark:o-text-zinc-500"
                                style={{
                                  ...affiche('l', 300),
                                  fontSize: 'clamp(2.75rem, 7vw, 5.5rem)',
                                }}
                              >
                                {String(rang + 1).padStart(2, '0')}
                              </span>
                              <img
                                src={image.src}
                                alt={image.alt}
                                width={96}
                                height={96}
                                loading="lazy"
                                className="o-size-16 o-rounded-full o-object-cover md:o-size-20"
                              />
                            </div>
                            <div className="o-min-w-0 sm:o-col-span-9">
                              <p className="o-m-0 o-flex o-flex-wrap o-items-baseline o-gap-x-4 o-gap-y-1">
                                <span className="o-text-3xl o-font-bold o-tracking-tight md:o-text-4xl">
                                  {fauteuil.complet}
                                </span>
                                <span
                                  className="o-font-mono o-text-xs o-uppercase o-tracking-widest"
                                  style={{ color: encre() }}
                                >
                                  {METIERS[fauteuil.cle]?.[0]}
                                </span>
                              </p>
                              <p className="o-m-0 o-mt-3 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                                {METIERS[fauteuil.cle]?.[1]}
                              </p>
                              <p className="o-m-0 o-mt-4 o-flex o-flex-wrap o-gap-2">
                                {PRESTATIONS.filter((p) =>
                                  p.parQui.includes(fauteuil.cle),
                                ).map((p) => (
                                  <span
                                    key={p.cle}
                                    className="o-rounded-full o-border-w-1 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                                    style={
                                      panier.includes(p.cle)
                                        ? { ...aplat(), borderColor: 'transparent' }
                                        : { borderColor: 'var(--o-theme-line)' }
                                    }
                                  >
                                    {p.court}
                                  </span>
                                ))}
                                {!possible && (
                                  <span className="o-self-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                                    — ne fait pas tout le panier
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </Reveal>
                      </li>
                    )
                  })}
                </ol>
              </Chapitre>
            </div>
          </div>

          {/* ================= 5. L agenda : le mecanisme sert d appel ======= */}
          <section
            id="agenda"
            aria-labelledby="agenda-titre"
            className="o-scroll-mt-24 o-mx-auto o-max-w-6xl o-px-6 o-py-20 md:o-py-28"
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="03" sombre={false}>
                  L agenda
                </Indice>
                <h2
                  id="agenda-titre"
                  className="o-m-0 o-mt-4 o-max-w-2xl"
                  style={{
                    ...affiche('m', 800),
                    fontSize: 'clamp(1.75rem, 4vw, 3.5rem)',
                  }}
                >
                  Puis choisissez l heure.
                </h2>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-4 md:o-text-right">
                Semaine du 10 au 14 septembre
                <br />
                La fenetre libre est ecrite sous chaque heure
              </p>
            </div>

            <div className="o-mt-10 o-grid o-gap-8 lg:o-grid-cols-12 lg:o-gap-10">
              {/* ----- L agenda : fauteuils en lignes, jours en colonnes -------- */}
              <div className="o-min-w-0 lg:o-col-span-8">
                <div className="o-overflow-x-auto o-scrollbar dark:o-scrollbar-dark">
                  <table
                    className="o-w-full o-text-sm"
                    style={{ minWidth: '38rem', borderCollapse: 'collapse' }}
                  >
                    <caption className="o-sr-only">
                      Creneaux libres par fauteuil et par jour, pour la semaine du 10 au
                      14 septembre
                    </caption>
                    <thead>
                      <tr className="o-border-b o-border-zinc-900 dark:o-border-zinc-100">
                        <th
                          scope="col"
                          className="o-py-2 o-pr-4 o-text-left o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
                        >
                          Fauteuil
                        </th>
                        {JOURS.map((jour) => (
                          <th
                            key={jour.value}
                            scope="col"
                            className="o-py-2 o-pr-4 o-text-left o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
                          >
                            {jour.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {FAUTEUILS.map((fauteuil) => {
                        const possible = fauteuilsPossibles.includes(fauteuil.cle)
                        return (
                          <tr
                            key={fauteuil.cle}
                            className="o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-align-top"
                          >
                            <th scope="row" className="o-py-3 o-pr-4 o-text-left">
                              <span className="o-block o-font-medium">
                                {fauteuil.nom}
                              </span>
                              <span className="o-block o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                                {fauteuil.complet}
                              </span>
                              {!possible && (
                                <span
                                  className="o-mt-1 o-block o-text-xs"
                                  style={{ color: 'var(--o-theme-muted)' }}
                                >
                                  ne fait pas tout le panier
                                </span>
                              )}
                            </th>
                            {JOURS.map((jour) => {
                              const creneaux = AGENDA[fauteuil.cle]?.[jour.value] ?? []
                              return (
                                <td key={jour.value} className="o-py-3 o-pr-4">
                                  {creneaux.length === 0 ? (
                                    <span className="o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                                      —
                                    </span>
                                  ) : (
                                    <ul className="o-list-none o-m-0 o-flex o-flex-col o-gap-1.5 o-p-0">
                                      {creneaux.map((creneau) => {
                                        // Un creneau ne tient que si sa fenetre couvre
                                        // le panier — et que le fauteuil sait tout faire.
                                        const tient =
                                          possible &&
                                          creneau.fenetre >= duree &&
                                          duree > 0
                                        const choisi =
                                          retenu?.qui === fauteuil.cle &&
                                          retenu.jour === jour.value &&
                                          retenu.heure === creneau.heure
                                        return (
                                          <li key={creneau.heure}>
                                            <button
                                              type="button"
                                              disabled={!tient}
                                              aria-pressed={choisi}
                                              onClick={() => {
                                                setRetenu({
                                                  qui: fauteuil.cle,
                                                  jour: jour.value,
                                                  heure: creneau.heure,
                                                })
                                              }}
                                              title={
                                                tient
                                                  ? `${creneau.heure} — fenetre de ${String(creneau.fenetre)} min`
                                                  : `Fenetre de ${String(creneau.fenetre)} min, trop courte pour ${dureeLisible(duree)}`
                                              }
                                              className={
                                                tient
                                                  ? 'o-w-full o-rounded-md o-border-w-1 o-px-2 o-py-1 o-text-left o-text-xs o-tabular-nums o-transition-colors focus:o-ring'
                                                  : 'o-w-full o-cursor-not-allowed o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-px-2 o-py-1 o-text-left o-text-xs o-tabular-nums o-text-zinc-500 dark:o-text-zinc-400'
                                              }
                                              style={
                                                !tient
                                                  ? undefined
                                                  : choisi
                                                    ? {
                                                        ...aplat(),
                                                        borderColor: 'transparent',
                                                      }
                                                    : {
                                                        borderColor:
                                                          'var(--o-theme-line)',
                                                      }
                                              }
                                            >
                                              {creneau.heure}
                                              <span className="o-ml-1 o-opacity-70">
                                                {creneau.fenetre} min
                                              </span>
                                            </button>
                                          </li>
                                        )
                                      })}
                                    </ul>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <p className="o-mt-4 o-max-w-xl o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                  Un creneau trop court reste affiche, grise : c est plus honnete que de
                  le faire disparaitre.
                </p>
              </div>

              {/* ----- Le panier, colle -------------------------------------------- */}
              <aside aria-label="Votre rendez-vous" className="lg:o-col-span-4">
                <div
                  className="o-rounded-2xl o-border-w-1 o-border-zinc-900 dark:o-border-zinc-100 o-p-5 lg:o-sticky"
                  style={{ top: 133 }}
                >
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Votre rendez-vous
                  </p>

                  {choisies.length === 0 ? (
                    <p className="o-mt-3 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
                      Cochez au moins un soin : l agenda s ouvrira sur les creneaux assez
                      longs pour le prendre.
                    </p>
                  ) : (
                    <ul className="o-list-none o-m-0 o-mt-3 o-flex o-flex-col o-gap-1.5 o-p-0 o-text-sm">
                      {choisies.map((prestation) => (
                        <li
                          key={prestation.cle}
                          className="o-flex o-items-baseline o-justify-between o-gap-3"
                        >
                          <span>{prestation.nom}</span>
                          <span className="o-flex o-shrink-0 o-items-baseline o-gap-3">
                            <span className="o-font-mono o-text-xs o-tabular-nums o-text-zinc-500 dark:o-text-zinc-400">
                              {dureeLisible(prestation.duree)}
                            </span>
                            <span className="o-tabular-nums">{prestation.prix} EUR</span>
                            <button
                              type="button"
                              onClick={() => {
                                basculer(prestation.cle)
                              }}
                              className="o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-100 o-transition-colors focus:o-ring"
                              aria-label={`Retirer ${prestation.nom}`}
                            >
                              <Icon icon={X} size={13} />
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {restantes.length > 0 && (
                    <p className="o-m-0 o-mt-4 o-flex o-flex-wrap o-items-center o-gap-1.5">
                      <span className="o-mr-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                        Ajouter
                      </span>
                      {restantes.map((p) => (
                        <button
                          key={p.cle}
                          type="button"
                          onClick={() => {
                            basculer(p.cle)
                          }}
                          className="o-inline-flex o-items-center o-gap-1 o-rounded-full o-border-w-1 o-px-2.5 o-py-0.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors hover:o-bg-zinc-100 dark:hover:o-bg-zinc-800 focus:o-ring"
                          style={{ borderColor: 'var(--o-theme-line)' }}
                        >
                          <Icon icon={Plus} size={10} aria-hidden="true" />
                          {p.court}
                        </button>
                      ))}
                    </p>
                  )}

                  {choisies.length > 0 && (
                    <>
                      <dl className="o-m-0 o-mt-4 o-flex o-flex-col o-gap-1.5 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-pt-3 o-text-sm">
                        <div className="o-flex o-items-baseline o-justify-between o-gap-3">
                          <dt className="o-flex o-items-center o-gap-1.5 o-text-zinc-600 dark:o-text-zinc-400">
                            <Icon icon={Clock} size={12} aria-hidden="true" />
                            Au fauteuil
                          </dt>
                          <dd className="o-m-0 o-tabular-nums">{dureeLisible(duree)}</dd>
                        </div>
                        <div className="o-flex o-items-baseline o-justify-between o-gap-3">
                          <dt className="o-text-zinc-600 dark:o-text-zinc-400">Total</dt>
                          <dd
                            className="o-m-0 o-text-2xl o-font-bold o-tabular-nums o-tracking-tight"
                            style={{ color: encre() }}
                          >
                            {prix} EUR
                          </dd>
                        </div>
                      </dl>

                      <p
                        aria-live="polite"
                        className="o-mt-4 o-rounded-lg o-px-4 o-py-3 o-text-sm o-leading-relaxed"
                        style={{ backgroundColor: accentDoux(500, 14) }}
                      >
                        {retenu === null ? (
                          <span className="o-text-zinc-700 dark:o-text-zinc-300">
                            Choisissez un creneau dans l agenda. Les creneaux grises sont
                            trop courts pour {dureeLisible(duree)}.
                          </span>
                        ) : (
                          <span style={{ color: encre() }}>
                            <span className="o-font-semibold">
                              {FAUTEUILS.find((f) => f.cle === retenu.qui)?.complet}
                            </span>
                            , {retenu.jour} a {retenu.heure} — fin vers{' '}
                            {heureDeFin(retenu.heure, duree)}. Confirmation par message.
                          </span>
                        )}
                      </p>
                      {retenu !== null && (
                        <button
                          type="button"
                          className="o-mt-3 o-inline-flex o-w-full o-items-center o-justify-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-transition-transform hover:o-scale-105 focus:o-ring"
                          style={aplat()}
                        >
                          Confirmer ce rendez-vous{' '}
                          <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                        </button>
                      )}
                    </>
                  )}

                  <dl className="o-m-0 o-mt-5 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-pt-3">
                    {ANNULATION.map(([quand, regle]) => (
                      <div key={quand} className="o-mt-1.5 o-text-xs o-leading-relaxed">
                        <dt className="o-inline o-font-medium">{quand} : </dt>
                        <dd className="o-m-0 o-inline o-text-zinc-600 dark:o-text-zinc-400">
                          {regle}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </aside>
            </div>
          </section>
        </main>

        {/* ================= 6. Le generique de fin ======================== */}
        <CinematicFooter
          style={{ '--o-footer-glow-b': 'var(--o-vitrine-700)' } as CSSProperties}
          heading="Fin de service."
          word="RASOIR"
          topLabel="Revenir en haut"
          banner={
            <span className="o-px-8">
              27 rue Bergere, Paris 9e — Metro Grands Boulevards — Mardi au samedi — Jeudi
              jusqu a 21 h — Carte, especes, cartes cadeaux — Entree de plain-pied
            </span>
          }
          actions={
            <div className="o-flex o-flex-wrap o-justify-center o-gap-3">
              <a
                href="#agenda"
                className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
                style={aplat()}
              >
                L agenda
                <Icon icon={ArrowRight} size={16} aria-hidden="true" />
              </a>
              <a
                href="tel:+33147703218"
                className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-colors focus:o-ring"
                style={{ borderColor: 'var(--o-theme-line)' }}
              >
                01 47 70 32 18
              </a>
            </div>
          }
          links={
            <nav
              aria-label="Pied de page"
              className="o-flex o-flex-wrap o-justify-center o-gap-6 o-text-sm"
            >
              {(
                [
                  ['#soins', 'Les soins'],
                  ['#fauteuils', 'Les fauteuils'],
                  ['#agenda', 'L agenda'],
                ] as const
              ).map(([cible, mot]) => (
                <a
                  key={cible}
                  href={cible}
                  className="o-no-underline o-opacity-70 hover:o-opacity-100 o-transition-opacity focus:o-ring"
                >
                  {mot}
                </a>
              ))}
            </nav>
          }
          copyright="Atelier Rasoir — 27 rue Bergere, 75009 Paris — RCS Paris 803 662 419"
          signature="Generique : Sofiane Merad, Ivan Petrescu, Camille Vasseur. Les creneaux sont ceux du registre."
        />
      </div>
    </Porte>
  )
}
