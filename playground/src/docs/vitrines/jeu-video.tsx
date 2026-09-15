/**
 * Cabestan — studio de jeu video independant.
 *
 * ## L architecture : le carnet de developpement s empile
 *
 * Landing page complete dont le **coeur est un journal antechronologique** — la
 * derniere entree en haut, comme un carnet ouvert a la derniere page. Ce qui
 * n appartient qu a elle :
 *
 * - un **fil des quatre dernieres entrees** qui s **empilent** au defilement :
 *   chaque entree est une carte qui reste collee pendant que la suivante la
 *   recouvre. Les entrees d abandon y restent, barrees, et c est le sujet ;
 * - une **archive** : tout ce qui precede, en lignes de mono sur filets, comme
 *   un journal de depot. Empiler neuf cartes identiques aurait fait une grille
 *   verticale ; quatre cartes et un journal font deux formes ;
 * - un **filtre par categorie** qui n est pas une rangee de pastilles mais une
 *   ligne de comptes, comme l en-tete d un depot, et qui vaut pour les deux ;
 * - un **tableau des scores** imprime en noir sur blanc — la seule bande claire
 *   de la page, une coupe nette au milieu de la nuit ;
 * - un **compte a rebours** vers la beta fermee, et rien d autre comme appel ;
 * - un **plan du site** dense, en six colonnes.
 *
 * L ouverture vend le jeu : le titre qui tremble et se remet au point sous le
 * pointeur, la grille de points et les degrades en escalier — Tenora.
 *
 * ## Le fond
 *
 * La fosse de billes est **une piece jointe d entree** — la capture d un test
 * de physique, legendee et datee comme le reste du carnet. Elle n est pas un
 * decor : dans un journal de developpement, une image a une date.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, Check, X } from '@odoro-cli/icons/outline'
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

import { Ballpit } from '@/odoro/background/Ballpit.jsx'
import { ParallaxImage } from '@/odoro/image/ParallaxImage.jsx'
import { StickyStack } from '@/odoro/section/StickyStack.jsx'
import { CounterRoll } from '@/odoro/text/CounterRoll.jsx'
import { FuzzyText } from '@/odoro/text/FuzzyText.jsx'

import { nuit } from './communs.jsx'
import { photo } from './media.js'
import { accentDoux, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreCoins,
  CHROME,
  Coin,
  Grain,
  Indice,
  Porte,
  Surgit,
  usePolices,
} from './marche.jsx'

/** Les categories d entree du carnet. */
const CATEGORIES = [
  'Moteur',
  'Contenu',
  'Accessibilite',
  'Abandon',
  'Calendrier',
] as const
type Categorie = (typeof CATEGORIES)[number]

/** Une entree du carnet. */
interface Entree {
  readonly date: string
  readonly iso: string
  readonly categorie: Categorie
  readonly auteur: string
  readonly titre: string
  readonly texte: string
  /** Date annoncee a l origine, quand elle a change. */
  readonly ancienne?: string
  /** Graine d une piece jointe, le cas echeant. */
  readonly piece?: string
  readonly legende?: string
  /** Vrai pour la capture de physique, rendue par la scene. */
  readonly scene?: boolean
}

/**
 * Le carnet, de la derniere entree a la premiere.
 *
 * Une entree d abandon et deux reports : c est ce qui rend le fil credible. Un
 * carnet ou tout avance n est pas un carnet, c est une page de vente.
 */
const ENTREES: readonly Entree[] = [
  {
    date: '2 septembre 2026',
    iso: '2026-09-02',
    categorie: 'Contenu',
    auteur: 'Lea, decor',
    titre: 'Quatre salles finies sur dix-huit',
    texte:
      'Le quai nord est passe en finition cette semaine. Le rythme tenu depuis janvier est d une salle finie toutes les trois semaines ; a ce rythme, l acte II ferme en avril.',
  },
  {
    date: '18 aout 2026',
    iso: '2026-08-18',
    categorie: 'Moteur',
    auteur: 'Hugo, code',
    titre: 'Le test de physique, enfin stable',
    texte:
      'Deux mille corps en collision continue sans perte d image sur une machine de 2019. C etait la condition pour que la salle des cuves existe : elle est levee.',
    scene: true,
    legende: 'Test de physique — 2 000 corps, 60 images par seconde sur GTX 1660',
  },
  {
    date: '29 juillet 2026',
    iso: '2026-07-29',
    categorie: 'Accessibilite',
    auteur: 'Ines, conception',
    titre: 'Audit externe, dix-neuf points remontes',
    texte:
      'Le cabinet a passe trois jours sur la verticale. Dix-neuf points, dont quatre bloquants : contraste des sous-titres, taille de cible sur la carte, absence de mode sans clignotement, et remappage incomplet a la manette. Les quatre sont corriges.',
  },
  {
    date: '11 juin 2026',
    iso: '2026-06-11',
    categorie: 'Calendrier',
    auteur: 'Come, direction',
    titre: 'La beta fermee passe a septembre',
    ancienne: 'Juillet 2026',
    texte:
      'Deux mois de plus. La raison est simple : le questionnaire de sortie n etait pas pret, et lancer huit cents testeurs sans savoir quoi leur demander revient a gacher huit cents avis.',
  },
  {
    date: '3 juin 2026',
    iso: '2026-06-03',
    categorie: 'Contenu',
    auteur: 'Lea, decor',
    titre: 'Onze salles grises, quatre finies',
    texte:
      'Le gris est jouable : geometrie, lumiere, declencheurs. La finition ajoute la matiere, le son de pas et les objets. Une salle grise coute trois jours, une salle finie quinze.',
    piece: 'cabestan-salle',
    legende: 'Acte I — la salle des cartes, en finition',
  },
  {
    date: '14 octobre 2025',
    iso: '2025-10-14',
    categorie: 'Abandon',
    auteur: 'Come, direction',
    titre: 'Le mode photo est retire',
    texte:
      'Coupe apres huit semaines de travail. Il obligeait a modeliser l arriere des decors, ce qui doublait le cout de chaque salle. Nous preferons le dire que le promettre encore.',
  },
  {
    date: '20 juin 2025',
    iso: '2025-06-20',
    categorie: 'Contenu',
    auteur: 'Hugo, code',
    titre: 'Verticale complete, acte I',
    ancienne: 'Mars 2025',
    texte:
      'Trois heures jouables, doublees et mixees. Repousse de trois mois : le systeme de sauvegarde a du etre repris entierement apres les tests de la premiere semaine.',
  },
  {
    date: '9 septembre 2024',
    iso: '2024-09-09',
    categorie: 'Moteur',
    auteur: 'Ines, conception',
    titre: 'Le dialogue devient une requete',
    texte:
      'Chaque personnage garde ce qu il sait et ce qu il a vu. Le dialogue n est pas un arbre : c est une requete sur cet etat, ce qui supprime les branches mortes et les incoherences qui vont avec.',
  },
  {
    date: '22 mars 2024',
    iso: '2024-03-22',
    categorie: 'Moteur',
    auteur: 'Hugo, code',
    titre: 'Premier prototype jouable',
    texte:
      'Le noyau de deplacement et la gestion de la lumiere. Vingt minutes de jeu, une seule salle, aucun son. C est la version qui a decroche l avance sur recettes.',
  },
]

/** Le chantier, en lignes de tableau. */
const CHANTIER: readonly (readonly [string, string, string])[] = [
  ['Salles finies', '4 / 18', 'onze autres jouables en gris'],
  ['Duree de jeu visee', '15 h', 'une enquete, trois actes'],
  ['Entrees publiees', '9', 'depuis mars 2024, une d abandon'],
  ['Equipe', '11', 'aucun editeur'],
  ['Places de beta', '800', 'tirees au sort parmi les inscrits'],
  ['Sortie visee', 'automne 2027', 'repoussee une fois'],
]

/** Les plateformes, avec ce que chacune tient. */
const PLATEFORMES: readonly (readonly [string, boolean, string, string])[] = [
  ['Windows', true, '60 i/s', 'version de developpement quotidienne'],
  ['macOS', true, '60 i/s', 'Apple silicon uniquement, natif'],
  ['Linux', true, '58 i/s', 'teste sur Fedora et Ubuntu'],
  ['Steam Deck', true, '40 i/s', 'verifie, images bloquees a 40'],
  ['PlayStation 5', false, '—', 'envisage apres la sortie, non engage'],
  ['Nintendo Switch', false, '—', 'etudie, la tenue en memoire n est pas acquise'],
]

/** Le plan du site, en six colonnes. */
const PLAN: readonly (readonly [string, readonly string[]])[] = [
  ['Le jeu', ['Quai Nord', 'Acte I', 'Acte II', 'Bande originale', 'Accessibilite']],
  ['Le carnet', ['Moteur', 'Contenu', 'Accessibilite', 'Abandon', 'Calendrier']],
  ['Plateformes', ['Windows', 'macOS', 'Linux', 'Steam Deck', 'Consoles']],
  [
    'Le studio',
    ['Onze personnes', 'Nantes', 'Recrutement', 'Presse', 'Avance sur recettes'],
  ],
  ['La beta', ['S inscrire', 'Questionnaire', 'Regles', 'Confidentialite', 'Discord']],
  ['Legal', ['Mentions', 'RCS Nantes', 'Cookies', 'Contact', 'Credits']],
]

/** La date de la beta fermee : c est vers elle que le compte descend. */
const BETA = new Date('2026-09-30T09:00:00+02:00')

/** Combien d entrees restent des cartes empilees ; les autres vont a l archive. */
const CARTES = 4

/**
 * La bande de jour : le tableau des scores, imprime.
 *
 * La page est noire d un bout a l autre ; une fiche technique se lit sur du
 * papier. La bande redeclare donc les variables de theme en clair, exactement
 * comme `nuit()` les redeclare en sombre — ce qui permet d y ecrire les
 * nuances claires **sans jumeau** `dark:`, puisqu elle ne suit pas le theme.
 */
const JOUR = {
  colorScheme: 'light',
  backgroundColor: 'var(--o-palette-zinc-50)',
  color: 'var(--o-palette-zinc-950)',
  '--o-theme-bg': 'var(--o-palette-zinc-50)',
  '--o-theme-surface': 'var(--o-palette-zinc-100)',
  '--o-theme-fg': 'var(--o-palette-zinc-950)',
  '--o-theme-muted': 'var(--o-palette-zinc-600)',
  '--o-theme-line': 'var(--o-palette-zinc-300)',
} as CSSProperties

/** La couleur d une categorie, en pastille. */
function pastille(categorie: Categorie): ReactElement {
  const abandon = categorie === 'Abandon'
  return (
    <span
      className="o-inline-flex o-shrink-0 o-items-center o-rounded-full o-px-2.5 o-py-0.5 o-font-mono o-text-xs o-font-semibold"
      style={
        abandon
          ? { border: '1px solid var(--o-theme-line)', color: 'var(--o-theme-muted)' }
          : { backgroundColor: accentDoux(500, 18), color: encreSurSombre() }
      }
    >
      {categorie}
    </span>
  )
}

/** Un bloc de degrade en escalier, aux coins — Tenora. */
function Escalier({ coin }: { readonly coin: 'hd' | 'bg' }): ReactElement {
  const haut = coin === 'hd'
  return (
    <div
      aria-hidden="true"
      className={`o-pointer-events-none o-absolute o-z-0 ${haut ? 'o-right-0 o-top-0 o-h-64 o-w-80' : 'o-bottom-0 o-left-0 o-h-56 o-w-64'}`}
      style={{
        background: haut
          ? `linear-gradient(135deg, ${accentDoux(300, 90)}, ${accentDoux(500, 70)} 50%, var(--o-palette-fuchsia-300))`
          : `linear-gradient(315deg, ${accentDoux(300, 90)}, ${accentDoux(500, 70)} 50%, var(--o-palette-cyan-300))`,
        clipPath: haut
          ? 'polygon(40% 0, 100% 0, 100% 100%, 80% 100%, 80% 66%, 60% 66%, 60% 33%, 40% 33%)'
          : 'polygon(0 0, 33% 0, 33% 33%, 66% 33%, 66% 66%, 100% 66%, 100% 100%, 0 100%)',
      }}
    />
  )
}

/** Ce qu il reste avant la beta, en quatre nombres. */
function reste(maintenant: number): readonly [number, number, number, number] {
  const total = Math.max(0, Math.floor((BETA.getTime() - maintenant) / 1000))
  return [
    Math.floor(total / 86400),
    Math.floor((total % 86400) / 3600),
    Math.floor((total % 3600) / 60),
    total % 60,
  ]
}

/** Le compte a rebours vers la beta fermee : quatre odometres. */
function Rebours(): ReactElement {
  const [maintenant, setMaintenant] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => {
      setMaintenant(Date.now())
    }, 1000)
    return () => {
      window.clearInterval(id)
    }
  }, [])
  const [jours, heures, minutes, secondes] = reste(maintenant)
  const unites = [
    [jours, 'jours'],
    [heures, 'heures'],
    [minutes, 'minutes'],
    [secondes, 'secondes'],
  ] as const
  return (
    <div
      className="o-flex o-flex-wrap o-items-end o-justify-center o-gap-x-6 o-gap-y-4 md:o-gap-x-12"
      role="timer"
      aria-label={`Beta fermee dans ${String(jours)} jours, ${String(heures)} heures et ${String(minutes)} minutes`}
    >
      {unites.map(([valeur, quoi]) => (
        <div key={quoi} className="o-text-center">
          <p
            aria-hidden="true"
            className="o-m-0 o-text-zinc-50"
            style={{
              ...affiche('xl', 300),
              fontSize: 'clamp(3.5rem, 12vw, 11rem)',
              lineHeight: 1,
            }}
          >
            <CounterRoll value={valeur} duration={700} step={60} />
          </p>
          <p
            aria-hidden="true"
            className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400"
          >
            {quoi}
          </p>
        </div>
      ))}
    </div>
  )
}

/** La vitrine complete : un carnet de developpement qui s empile. */
export default function Page(): ReactElement {
  const polices = usePolices('grotesk')
  const [categorie, setCategorie] = useState<Categorie | 'Tout'>('Tout')

  const fil = useMemo(
    () => ENTREES.filter((e) => categorie === 'Tout' || e.categorie === categorie),
    [categorie],
  )

  const comptes = useMemo(() => {
    const table = new Map<string, number>([['Tout', ENTREES.length]])
    for (const c of CATEGORIES)
      table.set(c, ENTREES.filter((e) => e.categorie === c).length)
    return table
  }, [])

  // Quatre cartes empilees, et le reste en journal : neuf cartes identiques
  // auraient fait une grille verticale, ce qui est precisement ce qu on evite.
  const recentes = fil.slice(0, CARTES)
  const archive = fil.slice(CARTES)

  return (
    <Porte forme="lettres" marque="Cabestan">
      <div className="o-min-h-screen" style={{ ...polices, ...nuit('zinc') }}>
        {/* ================= 1. L ouverture ================================= */}
        <header
          id="haut"
          className="o-relative o-isolate o-min-h-screen o-overflow-hidden o-border-b o-border-zinc-800"
        >
          {/* La grille de points, en CSS — Tenora. */}
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            style={{
              backgroundImage:
                'radial-gradient(color-mix(in oklab, var(--o-palette-zinc-50) 14%, transparent) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <Escalier coin="hd" />
          <Escalier coin="bg" />
          <Grain opacite={0.05} />

          <BarreCoins
            marque="Cabestan"
            liens={[
              ['#carnet', 'Le carnet'],
              ['#tableau', 'Le tableau'],
              ['#beta', 'La beta'],
            ]}
            droite="Nantes — sans editeur"
          />

          <div className="o-relative o-z-10 o-mx-auto o-flex o-min-h-screen o-max-w-6xl o-flex-col o-justify-center o-px-5 o-pb-28 o-pt-10 md:o-px-10">
            <Surgit
              as="p"
              className="o-m-0 o-inline-block o-w-fit o-bg-zinc-50 o-px-2 o-py-0.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-950"
            >
              #2027 — beta fermee le 30 septembre
            </Surgit>
            {/* Le titre du jeu tremble, et se remet au point sous le pointeur. */}
            <Surgit
              delai={120}
              as="h1"
              className="o-m-0 o-mt-6 o-text-zinc-50"
              style={{ ...affiche('xl', 700), fontSize: 'clamp(4rem, 15vw, 15rem)' }}
            >
              <FuzzyText blur={1.6} amplitude={1.8} period={140}>
                Quai Nord
              </FuzzyText>
            </Surgit>
            <Surgit
              delai={320}
              as="p"
              className="o-m-0 o-mt-8 o-max-w-3xl o-text-zinc-50"
              style={{ ...affiche('m', 300), fontSize: 'clamp(1.5rem, 3.2vw, 3rem)' }}
            >
              Un jeu d enquete de quinze heures,{' '}
              <span
                className="o-inline-block o-bg-zinc-50 o-px-2 o-text-zinc-950"
                style={{ boxDecorationBreak: 'clone' }}
              >
                sans editeur
              </span>
              , avec le journal de sa fabrication ouvert.
            </Surgit>
            <Surgit delai={500} className="o-mt-10">
              <Actions
                pleine={[
                  '#carnet',
                  <>
                    Lire le carnet <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                  </>,
                ]}
                fantome={['#beta', 'La beta fermee']}
              />
            </Surgit>
          </div>
          <Coin position="bg">
            Neuf entrees depuis mars 2024
            <br />
            Une d abandon, deux reports
          </Coin>
          <Coin position="bd">
            Windows, macOS, Linux, Steam Deck
            <br />
            Sortie visee : automne 2027
          </Coin>
        </header>

        <main>
          {/* ================= 2. Le carnet, en cartes empilees ================ */}
          <section
            id="carnet"
            className="o-mx-auto o-max-w-6xl o-scroll-mt-24 o-px-5 o-py-20 md:o-px-10 md:o-py-28"
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-7">
                <Indice rang="01">Le carnet</Indice>
                <h2
                  className="o-m-0 o-mt-5 o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(2rem, 4.5vw, 4.25rem)',
                  }}
                >
                  Les quatre dernieres, puis tout le reste.
                </h2>
              </div>
              <p className="o-m-0 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-400 md:o-col-span-5">
                La derniere en haut. Les reports gardent leur ancienne date barree, et l
                entree d abandon est restee : un carnet ou tout avance est une page de
                vente.
              </p>
            </div>

            {/* Le filtre : une ligne de comptes, pas une rangee de pastilles. */}
            <div
              role="group"
              aria-label="Filtrer par categorie"
              className="o-mt-12 o-flex o-flex-wrap o-items-center o-gap-x-6 o-gap-y-2 o-border-b o-border-t o-border-zinc-800 o-py-4 o-font-mono o-text-xs"
            >
              {(['Tout', ...CATEGORIES] as const).map((option) => {
                const actif = categorie === option
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={actif}
                    onClick={() => {
                      setCategorie(option)
                    }}
                    className="o-inline-flex o-items-baseline o-gap-1.5 o-uppercase o-tracking-wider o-transition-colors focus:o-ring"
                    style={{ color: actif ? encreSurSombre() : 'var(--o-theme-muted)' }}
                  >
                    {option}
                    <span className="o-tabular-nums o-opacity-70">
                      {comptes.get(option) ?? 0}
                    </span>
                  </button>
                )
              })}
            </div>

            <StickyStack className="o-mt-10" offset={CHROME + 20} gap={18} shrink={0.04}>
              {recentes.map((entree, rang) => (
                <article
                  key={entree.iso}
                  className="o-grid o-gap-6 o-rounded-2xl o-border-w-1 o-border-zinc-800 o-p-6 md:o-grid-cols-12 md:o-gap-10 md:o-p-10"
                  // Toutes les cartes ont la meme hauteur : une carte plus haute que
                  // la suivante depasserait sous elle une fois recouverte.
                  style={{
                    backgroundColor: 'var(--o-palette-zinc-950)',
                    minHeight: 'min(560px, calc(100vh - 180px))',
                  }}
                >
                  <div className="md:o-col-span-4">
                    <p
                      aria-hidden="true"
                      className="o-m-0 o-tabular-nums o-text-zinc-50"
                      style={{ ...affiche('l', 300), fontSize: 'clamp(3rem, 6vw, 6rem)' }}
                    >
                      {String(fil.length - rang).padStart(2, '0')}
                    </p>
                    <div className="o-mt-4 o-flex o-flex-wrap o-items-center o-gap-x-3 o-gap-y-2">
                      <time
                        dateTime={entree.iso}
                        className="o-font-mono o-text-xs o-tabular-nums o-text-zinc-400"
                      >
                        {entree.date}
                      </time>
                      {pastille(entree.categorie)}
                    </div>
                    <p className="o-m-0 o-mt-2 o-font-mono o-text-xs o-text-zinc-500">
                      {entree.auteur}
                    </p>
                    {entree.ancienne !== undefined && (
                      <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-text-zinc-500">
                        Annonce pour{' '}
                        <span className="o-line-through">{entree.ancienne}</span>
                      </p>
                    )}
                  </div>

                  <div className="o-min-w-0 md:o-col-span-8">
                    <h3
                      className={`o-m-0 o-text-2xl o-font-semibold o-tracking-tight md:o-text-3xl ${
                        entree.categorie === 'Abandon'
                          ? 'o-line-through o-text-zinc-400'
                          : 'o-text-zinc-50'
                      }`}
                    >
                      <span className="o-sr-only">
                        {String(fil.length - rang).padStart(2, '0')} —{' '}
                      </span>
                      {entree.titre}
                    </h3>
                    <p className="o-m-0 o-mt-4 o-max-w-2xl o-text-base o-leading-relaxed o-text-zinc-300">
                      {entree.texte}
                    </p>

                    {/* La piece jointe : soit une capture, soit la scene — toutes
                      deux legendees et datees comme le reste du carnet. */}
                    {entree.scene === true && (
                      <figure className="o-m-0 o-mt-6 o-overflow-hidden o-rounded-lg o-border-w-1 o-border-zinc-800">
                        <Ballpit
                          className="o-h-52 o-w-full md:o-h-64"
                          colors={['--o-theme-bg', '--o-vitrine-400', '--o-vitrine-600']}
                          poster="o-bg-zinc-950"
                        />
                        <figcaption className="o-border-t o-border-zinc-800 o-px-4 o-py-2.5 o-font-mono o-text-xs o-text-zinc-400">
                          {entree.legende}
                        </figcaption>
                      </figure>
                    )}

                    {entree.piece !== undefined && (
                      <figure className="o-m-0 o-mt-6 o-overflow-hidden o-rounded-lg o-border-w-1 o-border-zinc-800">
                        <ParallaxImage
                          src={photo(entree.piece, 1200, 620)}
                          alt={entree.legende ?? entree.titre}
                          ratio={2.4}
                          strength={0.28}
                          className="o-w-full o-object-cover"
                        />
                        <figcaption className="o-border-t o-border-zinc-800 o-px-4 o-py-2.5 o-font-mono o-text-xs o-text-zinc-400">
                          {entree.legende}
                        </figcaption>
                      </figure>
                    )}
                  </div>
                </article>
              ))}
            </StickyStack>

            {/* L archive : le meme fil, mais en journal de depot — une ligne par
              entree, sans carte, sans image. Deux formes pour une matiere. */}
            {archive.length > 0 && (
              <div className="o-mt-16">
                <p className="o-m-0 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4 o-border-b o-border-zinc-700 o-pb-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  <span style={{ color: encreSurSombre() }}>Archive</span>
                  <span>
                    {archive.length} entree{archive.length > 1 ? 's' : ''} anterieure
                    {archive.length > 1 ? 's' : ''}
                  </span>
                </p>
                <ol className="o-m-0 o-list-none o-p-0">
                  {archive.map((entree, rang) => (
                    <li
                      key={entree.iso}
                      className="o-grid o-grid-cols-12 o-items-baseline o-gap-x-4 o-gap-y-2 o-border-b o-border-zinc-800 o-py-4"
                    >
                      <span
                        aria-hidden="true"
                        className="o-col-span-2 o-font-mono o-text-xs o-tabular-nums o-text-zinc-500 sm:o-col-span-1"
                      >
                        {String(archive.length - rang).padStart(2, '0')}
                      </span>
                      <time
                        dateTime={entree.iso}
                        className="o-col-span-10 o-font-mono o-text-xs o-tabular-nums o-text-zinc-400 sm:o-col-span-3 md:o-col-span-2"
                      >
                        {entree.date}
                      </time>
                      <h3
                        className={`o-col-span-12 o-m-0 o-text-base o-font-medium o-tracking-tight sm:o-col-span-8 md:o-col-span-6 ${
                          entree.categorie === 'Abandon'
                            ? 'o-line-through o-text-zinc-500'
                            : 'o-text-zinc-100'
                        }`}
                      >
                        {entree.titre}
                      </h3>
                      <span className="o-col-span-7 sm:o-col-span-6 md:o-col-span-2">
                        {pastille(entree.categorie)}
                      </span>
                      <span className="o-col-span-5 o-text-right o-font-mono o-text-xs o-text-zinc-500 sm:o-col-span-6 md:o-col-span-1">
                        {entree.auteur.split(',')[0]}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </section>

          {/* ================= 3. Le tableau des scores, imprime ==============
            La seule bande claire de la page. Une fiche technique se lit sur du
            papier ; la coupe est nette, sans degrade. */}
          <section
            id="tableau"
            className="o-scroll-mt-24 o-px-5 o-py-20 md:o-px-10 md:o-py-28"
            style={JOUR}
          >
            <div className="o-mx-auto o-max-w-6xl">
              <p className="o-m-0 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4 o-border-b o-border-zinc-950 o-pb-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600">
                <span style={{ color: encre() }}>Fiche technique — rev. 09 / 2026</span>
                <span>Cabestan / Quai Nord</span>
              </p>
              <h2
                className="o-m-0 o-mt-8 o-max-w-4xl o-text-zinc-950"
                style={{ ...affiche('l', 300), fontSize: 'clamp(2.25rem, 6vw, 6rem)' }}
              >
                Ce que le chantier tient, et ce que la machine tient.
              </h2>

              <div className="o-mt-16 o-grid o-gap-x-12 o-gap-y-14 lg:o-grid-cols-2">
                <div className="o-min-w-0">
                  <table
                    className="o-w-full o-text-left o-font-mono o-text-sm"
                    style={{ borderCollapse: 'collapse' }}
                  >
                    <caption className="o-border-b o-border-zinc-400 o-pb-2 o-text-left o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600">
                      Le chantier
                    </caption>
                    <tbody>
                      {CHANTIER.map(([quoi, valeur, note]) => (
                        <tr key={quoi} className="o-border-b o-border-zinc-300">
                          <th
                            scope="row"
                            className="o-py-3 o-pr-4 o-text-left o-font-normal o-align-top o-text-zinc-700"
                          >
                            {quoi}
                            <span className="o-mt-0.5 o-block o-text-xs o-text-zinc-600">
                              {note}
                            </span>
                          </th>
                          <td className="o-py-3 o-text-right o-tabular-nums o-text-lg o-font-bold o-text-zinc-950 o-whitespace-nowrap">
                            {valeur}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="o-min-w-0">
                  <table
                    className="o-w-full o-text-left o-font-mono o-text-sm"
                    style={{ borderCollapse: 'collapse' }}
                  >
                    <caption className="o-border-b o-border-zinc-400 o-pb-2 o-text-left o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600">
                      Les plateformes — images par seconde sur la machine la plus lente
                      visee
                    </caption>
                    <tbody>
                      {PLATEFORMES.map(([nom, ok, images, detail]) => (
                        <tr key={nom} className="o-border-b o-border-zinc-300">
                          <th
                            scope="row"
                            className="o-py-3 o-pr-4 o-text-left o-font-normal o-align-top o-text-zinc-700"
                          >
                            <span className="o-inline-flex o-items-center o-gap-2">
                              <Icon
                                icon={ok ? Check : X}
                                size={13}
                                aria-hidden="true"
                                style={{
                                  color: ok ? encre() : 'var(--o-palette-zinc-500)',
                                }}
                              />
                              {nom}
                              <span className="o-sr-only">
                                {ok ? ', visee' : ', non engagee'}
                              </span>
                            </span>
                            <span className="o-mt-0.5 o-block o-text-xs o-text-zinc-600">
                              {detail}
                            </span>
                          </th>
                          <td
                            className={`o-py-3 o-text-right o-tabular-nums o-text-lg o-font-bold o-whitespace-nowrap ${ok ? 'o-text-zinc-950' : 'o-text-zinc-500'}`}
                          >
                            {images}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* ================= 4. Le compte a rebours ========================= */}
          <section
            id="beta"
            className="o-relative o-isolate o-scroll-mt-24 o-overflow-hidden o-border-t o-border-zinc-800 o-px-5 o-py-24 o-text-center md:o-py-36"
          >
            <Escalier coin="bg" />
            <div className="o-relative o-z-10 o-mx-auto o-max-w-6xl">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                La beta fermee ouvre le 30 septembre 2026, a 9 h
              </p>
              <div className="o-mt-12">
                <Rebours />
              </div>
              <p className="o-mx-auto o-mt-12 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300">
                Huit cents places, tirees au sort parmi les inscrits a la lettre. Six a
                huit courriels par an, et rien d autre.
              </p>
              <p
                className="o-m-0 o-mt-6 o-font-mono o-text-sm"
                style={{ color: encreSurSombre() }}
              >
                <a
                  href="#haut"
                  className="o-no-underline o-underline-offset-4 hover:o-underline focus:o-ring"
                  style={{ color: 'inherit' }}
                >
                  carnet@cabestan.studio
                </a>
              </p>
            </div>
          </section>
        </main>

        {/* ================= 5. Le pied : le plan du site, six colonnes ====== */}
        <footer className="o-border-t o-border-zinc-800 o-px-5 o-pb-8 o-pt-14 md:o-px-10">
          <div className="o-mx-auto o-max-w-6xl">
            <div className="o-grid o-grid-cols-2 o-gap-x-6 o-gap-y-10 sm:o-grid-cols-3 lg:o-grid-cols-6">
              {PLAN.map(([titre, liens]) => (
                <nav key={titre} aria-label={titre}>
                  <h2
                    className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: encreSurSombre() }}
                  >
                    {titre}
                  </h2>
                  <ul className="o-m-0 o-mt-4 o-flex o-list-none o-flex-col o-gap-1.5 o-p-0">
                    {liens.map((lien) => (
                      <li key={lien}>
                        <a
                          href="#haut"
                          className="o-text-xs o-no-underline o-text-zinc-400 o-transition-colors hover:o-text-zinc-50 focus:o-ring"
                        >
                          {lien}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
            <div className="o-mt-14 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-8 o-gap-y-2 o-border-t o-border-zinc-800 o-pt-6 o-font-mono o-text-xs o-text-zinc-500">
              <p className="o-m-0">
                © 2026 Cabestan SAS — capital 25 000 EUR — RCS Nantes 913 664 208 — 14 rue
                de la Verrerie, 44000 Nantes
              </p>
              <p className="o-m-0">
                Les dates sont celles du carnet ; leurs changements y restent inscrits.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
