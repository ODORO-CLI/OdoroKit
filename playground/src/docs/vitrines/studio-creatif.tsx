/**
 * Ardent — studio de creation.
 *
 * ## La reference : Spector (Framer)
 *
 * Une photographie plein cadre sous une grille, une accroche en capitales
 * condensees de 120 px dont le premier mot est en rouge, puis une alternance
 * sombre / claire. Un studio de creation ne vend pas un service : il vend un
 * temperament.
 *
 * ## Ce qui n appartient qu a elle
 *
 * Le **mecanisme** est le **repere de projets** : chaque projet porte son
 * annee, son secteur et ses disciplines, et on filtre par discipline — le
 * studio montre ce qu il sait faire par ce qu il a fait.
 *
 * ## L univers (UNIVERS.md)
 *
 * - Fond F-photo : la photographie sous grille recule et s assombrit quand on
 *   defile (`ZoomDefile`), **avec une glisse de 0,6** : l ouverture a du poids
 *   et continue de reculer apres l arret de la molette.
 * - Signature M-empile : les projets s empilent (`StickyStack`), une carte
 *   pleine par projet, jamais une grille de vignettes. La photographie de
 *   chaque carte derive dans son cadre avec la meme inertie (`Parallaxe
 *   glisse`), en bichromie (`Duotone`) : le noir et blanc a un seul accent de
 *   Spector, qui revient en couleurs au survol.
 * - Le manifeste s allume mot a mot (`ScrollReveal`), et ses capitales sont
 *   en contour puis pleines (`StrokeText`).
 * - Les clients et les recompenses passent en bandeaux, l un plein, l autre en
 *   contour, en sens contraires.
 * - C2 : quatre nombres sur filets. A1 : un mot geant et une gelule. P8 : un
 *   bandeau de mots qui defilent et une ligne de mentions.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { Duotone } from '@/odoro/image/Duotone.jsx'
import { StickyStack } from '@/odoro/section/StickyStack.jsx'
import { ScrollReveal } from '@/odoro/text/ScrollReveal.jsx'
import { StrokeText } from '@/odoro/text/StrokeText.jsx'

import { nuit, Voile } from './communs.jsx'
import {
  Actions,
  affiche,
  Appel,
  BarreCoins,
  CHROME,
  Chiffres,
  Croix,
  Grain,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { photo } from './media.js'
import { aplat, encre, encreSurSombre } from './palettes.js'
import { Bandeau, Parallaxe, ZoomDefile } from './scene.jsx'

/* ============================ Les donnees ============================== */

const DISCIPLINES = ['Identite', 'Produit', 'Web', 'Motion'] as const
type Discipline = (typeof DISCIPLINES)[number]

interface Projet {
  readonly nom: string
  readonly secteur: string
  readonly annee: string
  readonly disciplines: readonly Discipline[]
  readonly graine: string
  readonly alt: string
  readonly phrase: string
}

const PROJETS: readonly Projet[] = [
  {
    nom: 'Cale Seche',
    secteur: 'Label et salle de concert',
    annee: '2026',
    disciplines: ['Identite', 'Web'],
    graine: 'cale-console',
    alt: 'Console de mixage, regie',
    phrase:
      'Un label et une salle, une seule voix : le nom se lit de la pochette a la facade.',
  },
  {
    nom: 'Paire 44',
    secteur: 'Sneakers',
    annee: '2025',
    disciplines: ['Produit', 'Motion'],
    graine: 'paire44-profil',
    alt: 'Sneaker vue de profil',
    phrase: 'Un coloris par clic, et toute la page qui change de peau avec lui.',
  },
  {
    nom: 'Lisiere',
    secteur: 'Pret-a-porter',
    annee: '2025',
    disciplines: ['Identite', 'Web', 'Motion'],
    graine: 'lisiere-manteau',
    alt: 'Manteau rouge sur porte-vetement',
    phrase:
      'Douze pieces, un rail, et le nom qui remplit la page comme une etiquette cousue.',
  },
  {
    nom: 'Sillon',
    secteur: 'Architecture',
    annee: '2024',
    disciplines: ['Identite', 'Web'],
    graine: 'sillon-blosne',
    alt: 'Facade en zinc et balcons',
    phrase: 'Des projets presentes gouttiere a gouttiere, sans une carte.',
  },
  {
    nom: 'Brulerie Nord',
    secteur: 'Torrefaction',
    annee: '2024',
    disciplines: ['Identite', 'Produit'],
    graine: 'cafe-guji',
    alt: 'Grains torrefies',
    phrase:
      'Trois origines, trois sacs, et le nom de la ville torrefie en boucle autour.',
  },
  {
    nom: 'Auber',
    secteur: 'Haute joaillerie',
    annee: '2023',
    disciplines: ['Web', 'Motion'],
    graine: 'auber-quai',
    alt: 'Piece de joaillerie sur fond sombre',
    phrase:
      'Un cristal en plein cadre, quatre diapositives, et le devis compose sur le dernier ecran.',
  },
]

const CHIFFRES = [
  { valeur: '45+', quoi: 'marques accompagnees' },
  { valeur: '94 %', quoi: 'de clients qui reviennent' },
  { valeur: '24', quoi: 'secteurs servis' },
  { valeur: '78 %', quoi: 'de collaborations longues' },
] as const

const CLIENTS = [
  'Cale Seche',
  'Paire 44',
  'Lisiere',
  'Sillon',
  'Brulerie Nord',
  'Auber',
  'Les Tamaris',
  'Souffle',
  'Cobalt',
] as const

const RECOMPENSES = [
  'The One Award 2026',
  'D&AD 2025',
  'Communication Arts 2025',
  'ADC 2024',
  'Awwwards — site du jour 2024',
] as const

/** Le texte en contour : le contour est herite par tous les enfants. */
const CONTOUR: CSSProperties = {
  WebkitTextStroke: '1px currentcolor',
  WebkitTextFillColor: 'transparent',
}

/* ============================ Le rendu ================================= */

/** Une carte de projet, pleine, empilee. */
function Carte({
  projet,
  rang,
}: {
  readonly projet: Projet
  readonly rang: number
}): ReactElement {
  return (
    <article
      className="o-relative o-isolate o-overflow-hidden o-rounded-2xl o-text-zinc-50"
      style={{
        ...nuit('zinc'),
        height: `calc(100vh - ${String(CHROME + 160)}px)`,
        minHeight: '26rem',
      }}
    >
      {/* La photo derive dans son cadre et **continue apres l arret du geste** :
          la glisse est ce que Kilam a demande. Le cadre est plus haut que la
          carte pour que la derive ne decouvre jamais le bord. */}
      <Parallaxe
        vitesse={0.14}
        glisse={0.68}
        className="o-absolute o-z-0"
        style={{ top: '-9%', bottom: '-9%', left: 0, right: 0 }}
      >
        <Duotone
          src={photo(projet.graine, 1600, 1000)}
          alt={projet.alt}
          strength={0.92}
          shadow="var(--o-palette-zinc-950)"
          light="var(--o-palette-zinc-100)"
          className="o-size-full"
        />
      </Parallaxe>
      {/* Haut et bas assombris : le numero tient en haut, le nom en bas, et la
          photographie garde son milieu — la coupe d une affiche. */}
      <Voile sens="haut-bas" />
      <Croix />
      {/* Le numero tombe parfois sur une zone claire de la photographie : le
          contour d ombre le tient sans poser un aplat par-dessus l image. */}
      <span
        aria-hidden="true"
        className="o-absolute o-left-6 o-top-6 o-z-10 o-tabular-nums o-text-zinc-50"
        style={{
          ...affiche('l', 800),
          fontSize: 'clamp(3rem, 8vw, 7rem)',
          lineHeight: 0.9,
          opacity: 0.92,
          textShadow: '0 2px 30px rgba(0, 0, 0, 0.6)',
        }}
      >
        {String(rang + 1).padStart(2, '0')}
      </span>
      <p className="o-absolute o-right-6 o-top-6 o-z-10 o-m-0 o-rounded-full o-bg-zinc-50 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-950">
        {projet.annee}
      </p>
      <div className="o-absolute o-inset-x-0 o-bottom-0 o-z-10 o-flex o-flex-wrap o-items-end o-justify-between o-gap-6 o-p-6 md:o-p-10">
        <div className="o-min-w-0">
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-300">
            {projet.secteur}
          </p>
          <h3
            className="o-m-0 o-mt-3 o-uppercase o-text-zinc-50"
            style={{
              ...affiche('m', 800),
              fontSize: 'clamp(2.25rem, 6vw, 5.5rem)',
              lineHeight: 0.9,
            }}
          >
            <span className="o-sr-only">{String(rang + 1).padStart(2, '0')} — </span>
            {projet.nom}
          </h3>
          <p className="o-m-0 o-mt-4 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-200">
            {projet.phrase}
          </p>
        </div>
        <ul className="o-m-0 o-hidden o-list-none o-flex-wrap o-gap-2 o-p-0 md:o-flex">
          {projet.disciplines.map((d) => (
            <li
              key={d}
              className="o-rounded-full o-border-w-1 o-border-white-20 o-bg-white-10 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-100 o-backdrop-blur-md"
            >
              {d}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

/** La vitrine complete. */
export default function Page(): ReactElement {
  const polices = usePolices('jakarta')
  const [discipline, setDiscipline] = useState<Discipline | 'Tout'>('Tout')
  const retenus = useMemo(
    () =>
      PROJETS.filter((p) => discipline === 'Tout' || p.disciplines.includes(discipline)),
    [discipline],
  )

  return (
    <Porte forme="lettres" marque="Ardent">
      <div
        className="o-bg-white o-text-zinc-950 dark:o-bg-zinc-950 dark:o-text-zinc-50"
        style={polices}
      >
        {/* ================= L ouverture : la photo sous grille recule ===== */}
        <ZoomDefile
          de={1.14}
          assombrir={0.6}
          glisse={0.6}
          className="o-text-zinc-50"
          style={{ ...nuit('zinc'), minHeight: `calc(100vh - ${String(CHROME)}px)` }}
          fond={
            <div className="o-absolute o-inset-0">
              <img
                src={photo('lisiere-couverture', 1800, 1100)}
                alt=""
                aria-hidden="true"
                className="o-absolute o-inset-0 o-size-full o-object-cover"
                style={{ filter: 'grayscale(0.4) contrast(1.1)' }}
              />
              {/* La grille fine sur la photographie — Spector. */}
              <div
                aria-hidden="true"
                className="o-absolute o-inset-0"
                style={{
                  backgroundImage:
                    'linear-gradient(color-mix(in oklab, white 9%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, white 9%, transparent) 1px, transparent 1px)',
                  backgroundSize: '96px 96px',
                }}
              />
              <Voile sens="bas" />
              <Grain />
            </div>
          }
        >
          {/* La hauteur retire les barres de la documentation : sinon les
              deux gelules et la note du studio tombent sous le pli. */}
          <header
            className="o-relative o-isolate"
            style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
          >
            <Croix />
            <BarreCoins
              marque="Ardent"
              liens={[
                ['#projets', 'Projets'],
                ['#studio', 'Le studio'],
                ['#appel', 'Contact'],
              ]}
              droite="Paris — Lisbonne"
            />

            <div
              className="o-relative o-z-10 o-mx-auto o-flex o-max-w-7xl o-flex-col o-justify-between o-px-6 o-pb-10 o-pt-8 md:o-px-8"
              style={{ minHeight: `calc(100vh - ${String(CHROME + 72)}px)` }}
            >
              <div className="o-flex o-flex-wrap o-items-start o-justify-between o-gap-6">
                <Surgit
                  as="p"
                  className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-300"
                >
                  Studio de creation
                  <br />
                  14 rue du Faubourg-Poissonniere
                  <br />
                  Paris 10e
                </Surgit>
                <Surgit
                  delai={120}
                  as="p"
                  className="o-m-0 o-text-right o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-300"
                >
                  Identite
                  <br />
                  Produit
                  <br />
                  Web
                  <br />
                  Motion
                </Surgit>
              </div>

              <div>
                <h1
                  className="o-m-0 o-max-w-5xl o-uppercase o-text-zinc-50"
                  style={{
                    ...affiche('xl', 800),
                    fontSize: 'clamp(3rem, 10.5vw, 11rem)',
                    lineHeight: 0.88,
                  }}
                >
                  <TitreVague
                    as="span"
                    delai={140}
                    cadence={110}
                    className="o-m-0 o-block"
                    style={{ color: encreSurSombre() }}
                  >
                    Nos marques
                  </TitreVague>
                  <TitreVague
                    as="span"
                    delai={360}
                    cadence={90}
                    className="o-m-0 o-block"
                  >
                    refusent de se fondre.
                  </TitreVague>
                </h1>
                <div className="o-mt-8 o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
                  <Surgit delai={700}>
                    <Actions
                      pleine={[
                        '#projets',
                        <>
                          Voir les projets{' '}
                          <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                        </>,
                      ]}
                      fantome={['#appel', 'Nous confier un sujet']}
                    />
                  </Surgit>
                  <Surgit
                    delai={800}
                    as="p"
                    className="o-m-0 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-300"
                  >
                    Onze personnes, quatre disciplines, et un principe : une marque qui
                    ressemble a ses voisines a deja perdu.
                  </Surgit>
                </div>
              </div>
            </div>
          </header>
        </ZoomDefile>

        <main>
          {/* ================= Les projets, empiles : le mecanisme ======== */}
          <section
            id="projets"
            className="o-scroll-mt-24 o-px-6 o-pb-24 o-pt-20 md:o-px-8 md:o-pb-32 md:o-pt-28"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Reveal>
                    <Indice rang="01" sombre={false}>
                      Projets choisis
                    </Indice>
                  </Reveal>
                  <Reveal delay={80}>
                    <h2
                      className="o-m-0 o-mt-6 o-uppercase"
                      style={{
                        ...affiche('l', 800),
                        fontSize: 'clamp(2.75rem, 7vw, 7rem)',
                        lineHeight: 0.9,
                      }}
                    >
                      Le repere.
                    </h2>
                  </Reveal>
                </div>
                <div className="md:o-col-span-5 md:o-justify-self-end">
                  <p className="o-m-0 o-mb-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-text-right">
                    {retenus.length} projets — filtrer par discipline
                  </p>
                  <div
                    role="group"
                    aria-label="Filtrer par discipline"
                    className="o-flex o-flex-wrap o-gap-2 md:o-justify-end"
                  >
                    {(['Tout', ...DISCIPLINES] as const).map((d) => {
                      const actif = d === discipline
                      return (
                        <button
                          key={d}
                          type="button"
                          aria-pressed={actif}
                          onClick={() => {
                            setDiscipline(d)
                          }}
                          className={`o-rounded-full o-border-w-1 o-px-4 o-py-1.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring ${actif ? 'o-border-transparent' : 'o-border-black-20 o-text-zinc-700 hover:o-bg-black-10 dark:o-border-zinc-700 dark:o-text-zinc-300'}`}
                          style={actif ? aplat() : undefined}
                        >
                          {d}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="o-mt-12">
                <StickyStack offset={CHROME + 24} gap={18} shrink={0.06}>
                  {retenus.map((p, rang) => (
                    <Carte key={p.nom} projet={p} rang={rang} />
                  ))}
                </StickyStack>
              </div>
            </div>
          </section>

          {/* ================= Le manifeste, moitie eteinte, qui s allume === */}
          <section
            id="studio"
            className="o-scroll-mt-24 o-border-t o-border-black-10 o-px-6 o-py-24 dark:o-border-zinc-800 md:o-px-8 md:o-py-36"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <Indice rang="02" sombre={false}>
                Le studio
              </Indice>
              <ScrollReveal
                as="p"
                dim={0.14}
                blur={3}
                course={0.9}
                className="o-m-0 o-mt-10 o-max-w-5xl o-uppercase"
                style={{
                  ...affiche('m', 800),
                  fontSize: 'clamp(1.75rem, 4.2vw, 4.25rem)',
                  lineHeight: 1.02,
                }}
              >
                Nous construisons des marques. Nous prenons peu de projets, et chacun a
                toute notre attention. Un studio de onze personnes ne peut pas faire
                semblant : quand un sujet arrive, tout le monde le voit passer. Puis nous
                donnons a chaque marque
              </ScrollReveal>
              {/* Les capitales du manifeste : en contour, puis pleines. Elles
                  debordent sur la bande des clients, en dessous. */}
              <h2
                className="o-relative o-z-10 o-m-0 o-mt-4 o-uppercase"
                style={{
                  ...affiche('xl', 800),
                  fontSize: 'clamp(3rem, 12vw, 12.5rem)',
                  lineHeight: 0.86,
                  marginBottom: '-0.32em',
                }}
              >
                <StrokeText
                  as="span"
                  strokeWidth={2}
                  duration={1400}
                  contour="currentcolor"
                  remplissage={encre()}
                >
                  Un endroit ou vivre.
                </StrokeText>
              </h2>
            </div>
          </section>

          {/* ================= Les clients et les recompenses, en bandeaux === */}
          <section
            aria-label="Clients et recompenses"
            className="o-overflow-hidden o-pb-20 o-pt-28 md:o-pt-36"
            style={nuit('zinc')}
          >
            <Bandeau
              mots={[...CLIENTS]}
              separateur="✦"
              vitesse={60}
              className="o-text-zinc-50"
              taille="clamp(2.75rem, 8vw, 8rem)"
              style={{
                fontWeight: 800,
                letterSpacing: '-0.04em',
                fontFamily: 'var(--o-vitrine-affichage)',
              }}
            />
            <div className="o-mt-6 o-text-zinc-50" style={CONTOUR}>
              <Bandeau
                mots={[...RECOMPENSES]}
                separateur="✦"
                vitesse={80}
                inverse
                taille="clamp(2.75rem, 8vw, 8rem)"
                style={{
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  fontFamily: 'var(--o-vitrine-affichage)',
                }}
              />
            </div>
            <p className="o-mx-auto o-mt-12 o-max-w-7xl o-px-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 md:o-px-8">
              En plein : celles qui nous ont fait confiance. En contour : ce que le
              travail a rapporte.
            </p>
          </section>

          {/* ================= C2 : quatre nombres sur filets, une note dans la marge ===== */}
          <section
            aria-label="Le studio en quatre chiffres"
            className="o-px-6 o-py-24 md:o-px-8 md:o-py-32"
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 md:o-grid-cols-12">
              <div className="md:o-col-span-9">
                <Chiffres sombre={false} nombres={CHIFFRES} />
              </div>
              <p
                className="o-m-0 o-self-end o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-3 md:o-border-l md:o-pl-6"
                style={{
                  borderColor: 'color-mix(in oklab, currentColor 20%, transparent)',
                }}
              >
                Releve au 1er septembre 2026.
                <br />
                Un client de plus de deux ans compte une fois.
                <br />
                Aucun chiffre arrondi vers le haut.
              </p>
            </div>
          </section>
        </main>

        {/* ================= A1 : un mot geant, une gelule ================= */}
        <div
          id="appel"
          className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800"
        >
          <Appel
            sombre={false}
            titre="Un sujet ?"
            texte="La marque, l enjeu, la date. On repond sous deux jours, et on dit non quand c est non."
            action={[
              '#appel',
              <>
                bonjour@ardent.studio{' '}
                <Icon icon={ArrowUpRight} size={16} aria-hidden="true" />
              </>,
            ]}
          />
        </div>

        {/* ================= P8 : un bandeau de mots, une ligne de mentions === */}
        <footer className="o-overflow-hidden o-text-zinc-50" style={nuit('zinc')}>
          <div className="o-py-10">
            <Bandeau
              mots={[
                'Ardent',
                'Identite',
                'Produit',
                'Web',
                'Motion',
                'Paris',
                'Lisbonne',
              ]}
              separateur="✦"
              vitesse={70}
              taille="clamp(3.5rem, 11vw, 11rem)"
              style={{
                fontWeight: 800,
                letterSpacing: '-0.04em',
                fontFamily: 'var(--o-vitrine-affichage)',
                textTransform: 'uppercase',
              }}
            />
          </div>
          <div className="o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-white-10 o-px-6 o-py-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 md:o-px-8">
            <span>Ardent SAS — RCS Paris 904 771 318</span>
            <nav aria-label="Pied de page" className="o-flex o-flex-wrap o-gap-6">
              {(
                [
                  ['#projets', 'Projets'],
                  ['#studio', 'Le studio'],
                  ['#appel', 'bonjour@ardent.studio'],
                  ['#appel', 'presse@ardent.studio'],
                ] as const
              ).map(([href, mot]) => (
                <a
                  key={mot}
                  href={href}
                  className="o-no-underline o-text-zinc-300 o-transition-colors hover:o-text-white focus:o-ring"
                >
                  {mot}
                </a>
              ))}
            </nav>
            <span>© 2026 Ardent</span>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
