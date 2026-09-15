/**
 * Ines Roque — designer produit.
 *
 * ## La reference : Creatie (Framer)
 *
 * Un paysage plein cadre, une accroche blanche en capitales lourdes, des
 * autocollants inclines poses sur les mots, une carte de verre « disponible »
 * en haut a gauche, un dock en bas au centre et une carte de projet en verre
 * en bas a droite. Rien n est centre : tout est pose, comme sur un bureau.
 *
 * ## Ce qui n appartient qu a elle
 *
 * Le **mecanisme** est le **dock** : les projets ne sont pas une grille mais
 * une barre d icones en verre, et chaque icone ouvre sa fiche a la place de la
 * carte du coin — le portfolio se manipule comme un bureau.
 *
 * ## L univers (UNIVERS.md)
 *
 * - Fond F-css : une nappe pastel (`Nappe`) derive derriere tout le corps de
 *   la page ; le heros garde son paysage.
 * - Signature M-flotte : les autocollants flottent (`Flotte`), les boutons
 *   sont aimantes (`Aimant`).
 * - Le mot tournant (`RotatingWords`) : designer produit / d interfaces / de
 *   systemes.
 * - Structure : ouverture → dock et fiche → travaux en mosaique (`Masonry`) →
 *   processus en orbes (`OrbitalTimeline`) → temoignages en colonnes
 *   (`TestimonialsColumns`) → A3 (carte flottante « disponible », heure de
 *   Lisbonne) → P11 (signature en italique, mentions). Aucun chiffre (C8).
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  Layers,
  PenTool,
  Smartphone,
} from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import { useState, type ReactElement } from 'react'

import { OrbitalTimeline } from '@/odoro/section/OrbitalTimeline.jsx'
import { TestimonialsColumns } from '@/odoro/section/TestimonialsColumns.jsx'
import { RotatingWords } from '@/odoro/text/RotatingWords.jsx'
import { Masonry } from '@/odoro/ui/Masonry.jsx'

import { GELULE, GELULE_SUR_NUIT, nuit, Voile } from './communs.jsx'
import {
  affiche,
  Autocollant,
  BarreFilet,
  Grain,
  Horloge,
  Indice,
  Porte,
  Surgit,
  usePolices,
  verre,
} from './marche.jsx'
import { photo } from './media.js'
import { accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import { Aimant, Flotte, Nappe } from './scene.jsx'

/* ============================ Les donnees ============================== */

interface Projet {
  readonly cle: string
  readonly nom: string
  readonly client: string
  readonly annee: string
  readonly quoi: string
  readonly icone: typeof Layers
  readonly graine: string
  readonly alt: string
}

const PROJETS: readonly Projet[] = [
  {
    cle: 'coteau',
    nom: 'Coteau',
    client: 'Analyse de donnees',
    annee: '2026',
    quoi: 'Refonte du tableau de bord : quatre vues, une seule grille de huit colonnes, et le graphique de cohorte redessine de zero.',
    icone: Layers,
    graine: 'cale-console',
    alt: 'Console de regie, vue rapprochee',
  },
  {
    cle: 'souffle',
    nom: 'Souffle',
    client: 'Studio de yoga',
    annee: '2025',
    quoi: 'Le planning en colonnes, les places restantes par cours, la reservation en trois ecrans sur mobile.',
    icone: Smartphone,
    graine: 'souffle-tapis',
    alt: 'Tapis de yoga deroule',
  },
  {
    cle: 'auber',
    nom: 'Auber',
    client: 'Haute joaillerie',
    annee: '2025',
    quoi: 'Une vitrine a crans, un panneau par piece, et le devis compose sur le dernier ecran.',
    icone: Box,
    graine: 'auber-quai',
    alt: 'Piece de joaillerie sur fond sombre',
  },
  {
    cle: 'tige',
    nom: 'Tige & Co',
    client: 'Fleuriste',
    annee: '2024',
    quoi: 'L etal filtre par taille et par palette, le prix recalcule a chaque facette, le calendrier des fleurs sur douze mois.',
    icone: PenTool,
    graine: 'tige-brassee',
    alt: 'Brassee de fleurs',
  },
]

/** Les travaux, en vrac : ecrans, objets, planches. */
const TRAVAUX = [
  {
    graine: 'cale-console',
    alt: 'Console de regie, vue rapprochee',
    legende: 'Coteau — tableau de bord',
  },
  {
    graine: 'souffle-tapis',
    alt: 'Tapis de yoga deroule',
    legende: 'Souffle — reservation mobile',
  },
  {
    graine: 'auber-lumiere',
    alt: 'Bijou sous une lumiere rasante',
    legende: 'Auber — vitrine a crans',
  },
  {
    graine: 'tige-atelier-rond',
    alt: 'Bouquet rond sur l etabli',
    legende: 'Tige & Co — l etal',
  },
  {
    graine: 'orbe-ecran-carnet',
    alt: 'Ecran de documentation sur un carnet',
    legende: 'Orbe — documentation',
  },
  {
    graine: 'palier-ecran-solde',
    alt: 'Ecran de telephone affichant un solde',
    legende: 'Palier — le solde',
  },
  {
    graine: 'souffle-salle',
    alt: 'Salle de yoga vide, lumiere du matin',
    legende: 'Souffle — le planning',
  },
  {
    graine: 'tige-tulipes',
    alt: 'Tulipes dans un seau',
    legende: 'Tige & Co — le calendrier',
  },
  {
    graine: 'cale-vinyle',
    alt: 'Vinyle sur une platine',
    legende: 'Cale Seche — la sortie',
  },
] as const

const ETAPES = [
  {
    id: 'ecouter',
    title: 'Ecouter',
    date: 'Semaine 1',
    status: 'done',
    energy: 90,
    content:
      'Une semaine avec vous, sans maquette. On regarde ce que les gens font vraiment, pas ce que la fiche dit.',
  },
  {
    id: 'dessiner',
    title: 'Dessiner',
    date: 'Semaines 2 a 4',
    status: 'done',
    energy: 100,
    content:
      'Flux, grille, composants. Chaque ecran est dessine deux fois : une pour comprendre, une pour livrer.',
    relatedIds: ['ecouter'],
  },
  {
    id: 'prototyper',
    title: 'Prototyper',
    date: 'Semaines 5 et 6',
    status: 'current',
    energy: 75,
    content:
      'Un prototype qui se tient en main, teste avec cinq personnes. Ce qui ne marche pas est redessine avant le code.',
    relatedIds: ['dessiner'],
  },
  {
    id: 'livrer',
    title: 'Livrer',
    date: 'Semaine 7',
    status: 'todo',
    energy: 60,
    content:
      'Le systeme de composants, les maquettes finales et une semaine a cote de vos developpeurs.',
    relatedIds: ['prototyper'],
  },
] as const

const TEMOIGNAGES = [
  {
    quote:
      'Elle a compris le produit avant nous. La maquette du tableau de bord etait la bonne du premier coup.',
    author: 'Camille Roux',
    role: 'Coteau — direction produit',
  },
  {
    quote:
      'Le planning mobile a divise nos appels par trois. Personne ne nous l avait promis, elle l a fait.',
    author: 'Nadia Belkacem',
    role: 'Souffle — fondatrice',
  },
  {
    quote:
      'Les rendus 3D pesent trois fois moins que ce qu on avait. Et ils sont plus beaux.',
    author: 'Louis Auber',
    role: 'Auber — joaillier',
  },
  {
    quote:
      'Un etal qu on filtre par palette, c est une idee de fleuriste. Elle l a eue avant nous.',
    author: 'Margot Tige',
    role: 'Tige & Co — fleuriste',
  },
  {
    quote: 'Elle dit non tres vite. C est ce qui nous a fait gagner deux mois.',
    author: 'Selim Aydin',
    role: 'Orbe — ingenieur',
  },
  {
    quote:
      'Le systeme de composants est arrive documente, teste, et nos devs l ont pris sans une question.',
    author: 'Iris Delaunay',
    role: 'Palier — responsable design',
  },
] as const

/* ============================ Le rendu ================================= */

/** La vitrine complete. */
export default function Page(): ReactElement {
  const polices = usePolices('bricolage')
  const [ouvert, setOuvert] = useState<Projet>(PROJETS[0] as Projet)

  return (
    <Porte forme="trou" marque="Ines Roque">
      <div
        className="o-bg-white o-text-zinc-950 dark:o-bg-zinc-950 dark:o-text-zinc-50"
        style={polices}
      >
        {/* ================= L ouverture : le paysage, les autocollants ===== */}
        <header
          className="o-relative o-isolate o-min-h-screen o-overflow-hidden"
          style={nuit('stone')}
        >
          <img
            src={photo('bivouac-atlas', 1800, 1100)}
            alt=""
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0 o-size-full o-object-cover"
            style={{ filter: 'saturate(1.15)' }}
          />
          <Voile sens="centre" famille="stone" />
          <Grain opacite={0.05} />

          <BarreFilet
            marque="Ines Roque"
            liens={[
              ['#dock', 'Projets'],
              ['#travaux', 'Travaux'],
              ['#processus', 'Processus'],
              ['#disponible', 'Contact'],
            ]}
            action={['#disponible', 'Disponible en octobre']}
          />

          <div className="o-relative o-z-10 o-mx-auto o-flex o-min-h-screen o-max-w-6xl o-flex-col o-items-center o-justify-center o-px-6 o-pb-40 o-pt-24 o-text-center">
            <div className="o-relative">
              <Surgit
                delai={120}
                as="h1"
                className="o-m-0 o-max-w-4xl o-uppercase o-text-stone-50"
                style={{ ...affiche('l', 800), lineHeight: 0.95 }}
              >
                Des interfaces qu on regarde deux fois.
              </Surgit>
              <Surgit
                delai={700}
                className="o-absolute o-hidden md:o-block"
                style={{ top: '-1.25rem', right: '-1.5rem' }}
              >
                <Flotte amplitude={7} duree={6} angle={7}>
                  <Autocollant angle={0}>
                    <Icon icon={Smartphone} size={14} aria-hidden="true" /> Interfaces
                  </Autocollant>
                </Flotte>
              </Surgit>
              <Surgit
                delai={800}
                className="o-absolute o-hidden md:o-block"
                style={{ top: '42%', left: '-4rem' }}
              >
                <Flotte amplitude={9} duree={7} delai={-2} angle={-8}>
                  <Autocollant angle={0}>
                    <Icon icon={PenTool} size={14} aria-hidden="true" /> Illustration
                  </Autocollant>
                </Flotte>
              </Surgit>
              <Surgit
                delai={900}
                className="o-absolute o-hidden md:o-block"
                style={{ bottom: '-1.5rem', right: '4rem' }}
              >
                <Flotte amplitude={6} duree={5.5} delai={-4} angle={4}>
                  <Autocollant angle={0}>
                    <Icon icon={Box} size={14} aria-hidden="true" /> Rendu 3D
                  </Autocollant>
                </Flotte>
              </Surgit>
            </div>
            <Surgit
              delai={460}
              as="p"
              className="o-m-0 o-mt-8 o-max-w-lg o-text-lg o-leading-relaxed o-text-stone-200"
            >
              Ines Roque, designer{' '}
              <RotatingWords
                words={['produit', 'd interfaces', 'de systemes']}
                interval={2400}
                className="o-font-semibold o-text-stone-50"
              />
              <br />
              Pas seulement des visuels : des produits qui tiennent en main.
            </Surgit>
            <Surgit
              delai={580}
              className="o-mt-8 o-flex o-flex-wrap o-items-center o-justify-center o-gap-3"
            >
              <Aimant force={0.4}>
                <a
                  href="#dock"
                  className={`${GELULE} hover:o-opacity-100`}
                  style={aplat()}
                >
                  Voir les projets <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                </a>
              </Aimant>
              <Aimant force={0.4}>
                <a
                  href="#disponible"
                  className={`${GELULE_SUR_NUIT} o-border-white-20 o-bg-white-10 o-text-white o-backdrop-blur-md hover:o-bg-white-20`}
                >
                  Ecrire a Ines
                </a>
              </Aimant>
            </Surgit>
          </div>

          {/* Le dock, en bas au centre — Creatie. */}
          <div
            id="dock"
            className="o-absolute o-inset-x-0 o-bottom-8 o-z-20 o-flex o-scroll-mt-24 o-flex-col o-items-center o-gap-4 o-px-6 md:o-flex-row md:o-items-end md:o-justify-between"
          >
            {/* Le coin bas-gauche du paysage est clair : le mono s y perdrait
                sans cette ombre portee, et le voile radial n atteint pas les
                bords. */}
            <Surgit
              delai={760}
              as="p"
              className="o-m-0 o-hidden o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-100 md:o-block"
              style={{ textShadow: '0 1px 16px rgba(0, 0, 0, 0.9)' }}
            >
              — Pas seulement des visuels.
              <br />
              Des choses qui vivent.
            </Surgit>
            <Surgit
              delai={820}
              className={`${verre(true)} o-flex o-items-center o-gap-2 o-p-2`}
            >
              {PROJETS.map((p) => {
                const actif = p.cle === ouvert.cle
                return (
                  <Aimant key={p.cle} force={0.3}>
                    <button
                      type="button"
                      aria-pressed={actif}
                      aria-label={`Ouvrir ${p.nom}`}
                      onClick={() => {
                        setOuvert(p)
                      }}
                      className={`o-flex o-size-12 o-items-center o-justify-center o-rounded-xl o-transition-transform hover:o-scale-110 focus:o-ring ${actif ? '' : 'o-bg-white-10 o-text-stone-100'}`}
                      style={actif ? aplat() : undefined}
                    >
                      <Icon icon={p.icone} size={20} aria-hidden="true" />
                    </button>
                  </Aimant>
                )
              })}
            </Surgit>
            {/* La carte de projet, en bas a droite : elle suit le dock. */}
            <Surgit
              delai={880}
              className={`${verre(true)} o-hidden o-w-80 o-items-center o-gap-3 o-p-3 md:o-flex`}
            >
              <img
                key={ouvert.cle}
                src={photo(ouvert.graine, 200, 200)}
                alt=""
                aria-hidden="true"
                className="o-size-14 o-shrink-0 o-rounded-lg o-object-cover"
              />
              <div className="o-min-w-0">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-300">
                  {ouvert.client} — {ouvert.annee}
                </p>
                <p className="o-m-0 o-mt-0.5 o-truncate o-text-base o-font-semibold o-text-stone-50">
                  {ouvert.nom}
                </p>
                <a
                  href="#fiche"
                  className="o-mt-1 o-inline-flex o-items-center o-gap-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                  style={{ color: encreSurSombre() }}
                >
                  Voir la fiche <Icon icon={ArrowUpRight} size={12} aria-hidden="true" />
                </a>
              </div>
            </Surgit>
          </div>
        </header>

        {/* ================= Le corps : la nappe pastel derive derriere tout === */}
        <div className="o-relative o-isolate o-overflow-hidden">
          <Nappe
            couleurs={[
              accentDoux(300, 55),
              'color-mix(in oklab, var(--o-palette-sky-300) 45%, var(--o-theme-bg))',
              'color-mix(in oklab, var(--o-palette-pink-300) 40%, var(--o-theme-bg))',
            ]}
            opacite={0.7}
          />

          <main className="o-relative o-z-10">
            {/* ================= La fiche du projet ouvert par le dock ======= */}
            <section id="fiche" className="o-scroll-mt-24 o-px-6 o-py-20 md:o-py-28">
              <div className="o-mx-auto o-grid o-max-w-6xl o-items-center o-gap-10 md:o-grid-cols-12">
                <div className="md:o-col-span-5">
                  <Indice rang="01" sombre={false}>
                    Projet ouvert
                  </Indice>
                  <h2
                    key={ouvert.cle}
                    className="o-m-0 o-mt-6 o-uppercase"
                    style={affiche('m', 800)}
                  >
                    {ouvert.nom}
                  </h2>
                  <p className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    {ouvert.client} — {ouvert.annee}
                  </p>
                  <p className="o-m-0 o-mt-6 o-max-w-md o-text-lg o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
                    {ouvert.quoi}
                  </p>
                  <div className="o-mt-8 o-flex o-flex-wrap o-gap-2">
                    {PROJETS.map((p) => (
                      <button
                        key={p.cle}
                        type="button"
                        aria-pressed={p.cle === ouvert.cle}
                        onClick={() => {
                          setOuvert(p)
                        }}
                        className={`o-rounded-full o-border-w-1 o-px-4 o-py-1.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring ${p.cle === ouvert.cle ? 'o-border-transparent' : 'o-border-black-20 o-text-zinc-700 hover:o-bg-black-10 dark:o-border-zinc-700 dark:o-text-zinc-300'}`}
                        style={p.cle === ouvert.cle ? aplat() : undefined}
                      >
                        {p.nom}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="o-relative md:o-col-span-7">
                  <Flotte amplitude={6} duree={8} angle={-1.5}>
                    <img
                      key={ouvert.graine}
                      src={photo(ouvert.graine, 1200, 900)}
                      alt={ouvert.alt}
                      className="o-aspect-video o-h-auto o-w-full o-rounded-3xl o-object-cover o-shadow-2xl"
                    />
                  </Flotte>
                  <div
                    className="o-absolute o-hidden md:o-block"
                    style={{ top: '-1rem', left: '-1.5rem' }}
                  >
                    <Flotte amplitude={5} duree={6} angle={-9}>
                      <Autocollant angle={0}>{ouvert.annee}</Autocollant>
                    </Flotte>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= Les travaux, en mosaique ==================== */}
            <section id="travaux" className="o-scroll-mt-24 o-px-6 o-py-20 md:o-py-28">
              <div className="o-mx-auto o-max-w-6xl">
                <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
                  <div>
                    <Reveal>
                      <Indice rang="02" sombre={false}>
                        Travaux
                      </Indice>
                    </Reveal>
                    <Reveal delay={80}>
                      <h2 className="o-m-0 o-mt-6 o-uppercase" style={affiche('m', 800)}>
                        Le bureau, en vrac.
                      </h2>
                    </Reveal>
                  </div>
                  <p className="o-m-0 o-max-w-xs o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-text-right">
                    Ecrans, objets, planches.
                    <br />
                    Dans l ordre ou ils sont sortis.
                  </p>
                </div>
                <div className="o-mt-12">
                  <Masonry
                    label="Travaux choisis"
                    columns={3}
                    minWidth={220}
                    gap={18}
                    items={TRAVAUX.map((t) => ({
                      src: photo(t.graine, 900, 900),
                      alt: t.alt,
                      caption: t.legende,
                    }))}
                  />
                </div>
              </div>
            </section>
          </main>
        </div>

        {/* ================= Le processus, en orbes : un ecran sombre ======= */}
        <section
          id="processus"
          className="o-relative o-isolate o-scroll-mt-24 o-overflow-hidden o-px-6"
          style={nuit('zinc')}
        >
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            style={{
              background: `radial-gradient(ellipse at 50% 60%, ${accentDoux(500, 22)} 0%, transparent 55%)`,
            }}
          />
          <Grain opacite={0.06} />
          <div className="o-relative o-z-10 o-mx-auto o-max-w-6xl">
            <div className="o-pt-20 md:o-pt-28">
              <Indice rang="03">Processus</Indice>
              <h2
                className="o-m-0 o-mt-6 o-max-w-2xl o-uppercase o-text-zinc-50"
                style={affiche('m', 800)}
              >
                Sept semaines, quatre orbes.
              </h2>
              <p className="o-m-0 o-mt-4 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300">
                Cliquez une etape : la fiche s ouvre sur le cercle.
              </p>
            </div>
            <OrbitalTimeline
              steps={ETAPES}
              radius={190}
              rpm={0.6}
              label="Les quatre etapes d un projet"
              className="o-text-zinc-50"
              style={{ minHeight: '40rem' }}
            />
          </div>
        </section>

        {/* ================= Les temoignages, en colonnes =================== */}
        <div className="o-relative o-isolate o-overflow-hidden">
          <Nappe
            couleurs={[
              'color-mix(in oklab, var(--o-palette-pink-300) 40%, var(--o-theme-bg))',
              accentDoux(300, 50),
              'color-mix(in oklab, var(--o-palette-sky-300) 45%, var(--o-theme-bg))',
            ]}
            opacite={0.7}
          />
          <section className="o-relative o-z-10 o-px-6 o-py-20 md:o-py-28">
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="04" sombre={false}>
                  Ce qu ils disent
                </Indice>
              </Reveal>
              <TestimonialsColumns
                label="Temoignages de clients"
                items={[...TEMOIGNAGES]}
                columns={3}
                height={520}
                duration={36000}
                className="o-mt-10"
              />
            </div>
          </section>

          {/* ================= A3 : la carte flottante « disponible » ========= */}
          <section
            id="disponible"
            className="o-relative o-z-10 o-flex o-min-h-screen o-scroll-mt-24 o-items-center o-justify-center o-px-6 o-py-20"
          >
            <Flotte amplitude={10} duree={7} angle={-2}>
              <div
                className={`${verre(false)} o-w-full o-max-w-md o-p-6 o-shadow-2xl md:o-p-8`}
              >
                <div className="o-flex o-items-center o-gap-3">
                  <span
                    aria-hidden="true"
                    className="o-flex o-size-12 o-items-center o-justify-center o-rounded-full o-text-sm o-font-bold"
                    style={aplat()}
                  >
                    IR
                  </span>
                  <div>
                    <p className="o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-300">
                      <span
                        aria-hidden="true"
                        className="o-size-2 o-rounded-full"
                        style={{ backgroundColor: encre() }}
                      />
                      Disponible en octobre
                    </p>
                    <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                      <Horloge ville="Lisbonne" fuseau="Europe/Lisbon" />
                    </p>
                  </div>
                </div>
                <h2
                  className="o-m-0 o-mt-8 o-uppercase"
                  style={{ ...affiche('m', 800), fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}
                >
                  On fait quelque chose ?
                </h2>
                <p className="o-m-0 o-mt-4 o-text-base o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
                  Un message, le produit, la date. Je reponds sous deux jours et je dis
                  tout de suite si je suis la bonne personne.
                </p>
                <div className="o-mt-8 o-flex o-flex-wrap o-items-center o-gap-3">
                  <Aimant force={0.45}>
                    <a href="#disponible" className={GELULE} style={aplat()}>
                      ines@roque.design{' '}
                      <Icon icon={ArrowUpRight} size={16} aria-hidden="true" />
                    </a>
                  </Aimant>
                  <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    ou +33 6 12 40 77 08
                  </span>
                </div>
              </div>
            </Flotte>
            <div className="o-absolute o-bottom-10 o-right-10 o-hidden md:o-block">
              <Flotte amplitude={8} duree={6} delai={-3} angle={6}>
                <Autocollant angle={0}>Lisbonne, a distance</Autocollant>
              </Flotte>
            </div>
            <div className="o-absolute o-left-10 o-top-24 o-hidden md:o-block">
              <Flotte amplitude={8} duree={7} delai={-1} angle={-7}>
                <Autocollant angle={0}>Paris, une semaine par mois</Autocollant>
              </Flotte>
            </div>
          </section>
        </div>

        {/* ================= P11 : une signature en italique, les mentions === */}
        <footer className="o-border-t o-border-black-10 o-px-6 o-pb-8 o-pt-16 dark:o-border-zinc-800">
          <div className="o-mx-auto o-max-w-6xl">
            <p
              aria-label="Ines Roque"
              className="o-m-0 o-italic"
              style={{
                fontFamily: 'var(--o-font-serif, Georgia, "Times New Roman", serif)',
                fontSize: 'clamp(3rem, 9vw, 8rem)',
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
                transform: 'rotate(-3deg)',
                transformOrigin: 'left bottom',
              }}
            >
              Ines Roque
            </p>
            <div className="o-mt-14 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-black-10 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-border-zinc-800 dark:o-text-zinc-400">
              <span>Designer produit independante — SIRET 903 118 445 00021</span>
              <nav aria-label="Pied de page" className="o-flex o-flex-wrap o-gap-6">
                {(
                  [
                    ['#dock', 'Projets'],
                    ['#travaux', 'Travaux'],
                    ['#disponible', 'Are.na'],
                    ['#disponible', 'Read.cv'],
                    ['#disponible', 'Instagram'],
                  ] as const
                ).map(([href, mot]) => (
                  <a
                    key={mot}
                    href={href}
                    className="o-no-underline o-text-zinc-600 o-transition-colors hover:o-text-zinc-950 focus:o-ring dark:o-text-zinc-400 dark:hover:o-text-zinc-50"
                  >
                    {mot}
                  </a>
                ))}
              </nav>
              <span>© 2026 Ines Roque</span>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
