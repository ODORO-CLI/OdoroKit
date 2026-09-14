/**
 * Salle 3 — cinema d art et d essai.
 *
 * ## Le mecanisme : la seance
 *
 * Un site de cinema donne des heures de debut. Il manque toujours les trois
 * choses dont on a besoin pour decider : **combien de temps cela dure**,
 * **dans quelle version** on le verra, et **a quelle heure on sort**.
 *
 * La grille de la semaine est donc un vrai plan d occupation : trois salles en
 * lignes, dix heures d axe horaire en abscisse, et chaque seance occupe sa
 * duree reelle — annonces comprises, douze minutes, parce que c est ce qui
 * s ecoule vraiment avant le premier plan. De la sortent :
 *
 * - l **heure de fin**, calculee et non promise ;
 * - le **dernier bus** de la ligne 4, a 23 h 51 : les seances qui finissent
 *   apres sont marquees, et la page le dit avant qu on prenne le billet ;
 * - les **chevauchements** de la meme salle, qui n existent pas — la grille
 *   les rendrait visibles ;
 * - les **places restantes** de la seance choisie, en jauge (forme A39), et
 *   un seul bouton dessous.
 *
 * ## La mise en scene
 *
 * Filiation Miles : une condensee tres grande, du noir, et rien d autre. Le
 * fond est statique — un grain de pellicule, et deux bandes de perforations
 * dessinees qui tiennent le heros comme un photogramme. Signature de
 * mouvement **M-bandeau** : les titres de la semaine defilent en 7 vw.
 *
 * Aucun chiffre mis en scene (forme C8) : les durees et les places sont le
 * mecanisme, pas un indicateur. Le pied est un generique (forme P25).
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowDown, Clapperboard } from '@odoro-cli/icons/filaire'
import { useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { FuzzyText } from '@/odoro/text/FuzzyText.jsx'
import { SplitFlap } from '@/odoro/text/SplitFlap.jsx'
import { StarBorder } from '@/odoro/ui/StarBorder.jsx'

import { nuit } from './communs.jsx'
import {
  affiche,
  BarreCoins,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accent, accentDoux, aplat, encreSurSombre } from './palettes.js'
import { Bandeau, Parallaxe } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques, aux coins. */
const NAVIGATION: readonly Lien[] = [
  ['#grille', 'La semaine'],
  ['#maison', 'La maison'],
  ['#place', 'Prendre une place'],
]

/** La condensee, en capitales : la voix de l affiche. */
function affichette(
  corps: 'm' | 'l' | 'xl' | 'xxl',
  graisse: 300 | 500 | 700 = 500,
): CSSProperties {
  return {
    ...affiche(corps, graisse),
    textTransform: 'uppercase',
    letterSpacing: '-0.02em',
  }
}

/* ============================ Les films ================================ */

/** Un film a l affiche. Tous sont inventes. */
interface Film {
  readonly cle: string
  readonly titre: string
  readonly annee: string
  readonly pays: string
  readonly realisation: string
  /** Duree de la copie, en minutes. */
  readonly duree: number
  readonly version: string
  readonly support: string
  readonly note: string
}

const FILMS: readonly Film[] = [
  {
    cle: 'nord',
    titre: 'La traversee du nord',
    annee: '1978',
    pays: 'Suede',
    realisation: 'Ingrid Halvorsen',
    duree: 118,
    version: 'VO sous-titree',
    support: 'Copie 35 mm, tirage de 1981',
    note: 'La copie a vecu. Deux raccords sautent au troisieme acte, et nous ne les reparerons pas.',
  },
  {
    cle: 'digues',
    titre: 'Le bruit des digues',
    annee: '2024',
    pays: 'France',
    realisation: 'Salome Vaury',
    duree: 96,
    version: 'Version francaise',
    support: 'DCP, son 5.1',
    note: 'Rencontre avec la realisatrice le samedi, apres la seance de 18 h 15.',
  },
  {
    cle: 'kyoto',
    titre: 'Sept jours a Kyoto',
    annee: '2019',
    pays: 'Japon',
    realisation: 'Haruki Sonoda',
    duree: 134,
    version: 'VO sous-titree',
    support: 'DCP, format 1.37',
    note: 'Deux heures quatorze sans entracte. Prevoyez la sortie, le dernier bus est juste.',
  },
  {
    cle: 'landau',
    titre: 'L homme au landau',
    annee: '1926',
    pays: 'Allemagne',
    realisation: 'Otto Reinhardt',
    duree: 74,
    version: 'Muet, accompagne au piano',
    support: 'Copie restauree, 18 images par seconde',
    note: 'Accompagnement de Nadia Berthaut. Le piano est accorde le matin meme.',
  },
  {
    cle: 'zinc',
    titre: 'Poussiere de zinc',
    annee: '2025',
    pays: 'Belgique',
    realisation: 'Come Riviere',
    duree: 88,
    version: 'VO sous-titree',
    support: 'DCP, image 2.39',
    note: 'Deconseille aux moins de douze ans. Deux scenes de chantier, sans complaisance.',
  },
  {
    cle: 'quai',
    titre: 'Les enfants du quai',
    annee: '1961',
    pays: 'Italie',
    realisation: 'Elsa Toussaint',
    duree: 107,
    version: 'VO sous-titree',
    support: 'Copie 35 mm, restauration 2022',
    note: 'Le seul film que nous reprogrammons chaque annee. C est notre faute.',
  },
]

/** Un film, par sa cle. */
function filmDe(cle: string): Film | undefined {
  return FILMS.find((f) => f.cle === cle)
}

/* ============================ Les salles =============================== */

/** Les trois salles, et ce qu elles tiennent. */
const SALLES = [
  { nom: 'Salle 1', fauteuils: 92, note: 'Ecran 9 m, projecteur 35 mm et DCP' },
  { nom: 'Salle 2', fauteuils: 54, note: 'Gradin doux, boucle magnetique' },
  { nom: 'Salle 3', fauteuils: 34, note: 'Ancien fumoir. Le piano y reste.' },
] as const

/* ============================ La semaine =============================== */

/** Les sept jours ; le lundi est relache. */
const JOURS = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
] as const

/** Une seance programmee. */
interface Seance {
  readonly jour: number
  readonly salle: number
  /** Debut, en minutes depuis minuit. */
  readonly debut: number
  readonly film: string
  readonly places: number
}

/** Les annonces avant le premier plan, en minutes. Elles ne sont pas gratuites. */
const ANNONCES = 12

/** Le dernier bus de la ligne 4, en minutes depuis minuit. */
const DERNIER_BUS = 23 * 60 + 51

/** La grille de la semaine, ecrite a la main, salle par salle. */
const SEANCES: readonly Seance[] = [
  { jour: 1, salle: 0, debut: 14 * 60 + 30, film: 'nord', places: 41 },
  { jour: 1, salle: 1, debut: 16 * 60, film: 'digues', places: 12 },
  { jour: 1, salle: 2, debut: 18 * 60 + 15, film: 'kyoto', places: 3 },
  { jour: 1, salle: 0, debut: 18 * 60 + 45, film: 'zinc', places: 58 },
  { jour: 1, salle: 1, debut: 20 * 60 + 30, film: 'landau', places: 22 },
  { jour: 1, salle: 2, debut: 21 * 60 + 15, film: 'quai', places: 9 },

  { jour: 2, salle: 0, debut: 14 * 60, film: 'quai', places: 66 },
  { jour: 2, salle: 1, debut: 16 * 60 + 15, film: 'landau', places: 31 },
  { jour: 2, salle: 2, debut: 17 * 60 + 45, film: 'digues', places: 14 },
  { jour: 2, salle: 0, debut: 18 * 60 + 30, film: 'kyoto', places: 27 },
  { jour: 2, salle: 1, debut: 20 * 60 + 45, film: 'nord', places: 5 },
  { jour: 2, salle: 2, debut: 21 * 60 + 30, film: 'zinc', places: 18 },

  { jour: 3, salle: 0, debut: 15 * 60, film: 'zinc', places: 72 },
  { jour: 3, salle: 1, debut: 17 * 60 + 30, film: 'quai', places: 24 },
  { jour: 3, salle: 2, debut: 18 * 60, film: 'landau', places: 11 },
  { jour: 3, salle: 0, debut: 19 * 60 + 15, film: 'digues', places: 38 },
  { jour: 3, salle: 1, debut: 20 * 60 + 15, film: 'kyoto', places: 7 },
  { jour: 3, salle: 2, debut: 21 * 60 + 45, film: 'nord', places: 2 },

  { jour: 4, salle: 0, debut: 14 * 60 + 15, film: 'kyoto', places: 55 },
  { jour: 4, salle: 1, debut: 17 * 60, film: 'zinc', places: 29 },
  { jour: 4, salle: 2, debut: 18 * 60 + 30, film: 'nord', places: 16 },
  { jour: 4, salle: 0, debut: 19 * 60, film: 'landau', places: 49 },
  { jour: 4, salle: 1, debut: 20 * 60 + 45, film: 'digues', places: 8 },
  { jour: 4, salle: 2, debut: 21 * 60, film: 'quai', places: 21 },

  { jour: 5, salle: 0, debut: 14 * 60, film: 'digues', places: 34 },
  { jour: 5, salle: 1, debut: 16 * 60 + 30, film: 'nord', places: 19 },
  { jour: 5, salle: 2, debut: 17 * 60 + 15, film: 'zinc', places: 6 },
  { jour: 5, salle: 0, debut: 18 * 60 + 15, film: 'digues', places: 62 },
  { jour: 5, salle: 1, debut: 19 * 60 + 30, film: 'quai', places: 13 },
  { jour: 5, salle: 2, debut: 21 * 60 + 30, film: 'kyoto', places: 4 },

  { jour: 6, salle: 0, debut: 11 * 60, film: 'landau', places: 78 },
  { jour: 6, salle: 1, debut: 15 * 60, film: 'kyoto', places: 26 },
  { jour: 6, salle: 2, debut: 16 * 60 + 45, film: 'quai', places: 15 },
  { jour: 6, salle: 0, debut: 17 * 60 + 45, film: 'nord', places: 43 },
  { jour: 6, salle: 1, debut: 20 * 60, film: 'zinc', places: 10 },
  { jour: 6, salle: 2, debut: 20 * 60 + 45, film: 'digues', places: 17 },
]

/** L axe de la grille : de onze heures a minuit et demi. */
const AXE_DEBUT = 11 * 60
const AXE_FIN = 24 * 60 + 30

/** Une heure ecrite a la francaise. */
function heure(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')} h ${String(m).padStart(2, '0')}`
}

/** La fin reelle d une seance : annonces comprises. */
function finDe(s: Seance): number {
  return s.debut + ANNONCES + (filmDe(s.film)?.duree ?? 0)
}

/** La part d une seance sur l axe, en pourcentage. */
function surLAxe(minutes: number): number {
  return ((minutes - AXE_DEBUT) / (AXE_FIN - AXE_DEBUT)) * 100
}

/* ============================ Les perforations ========================= */

/**
 * Une bande de perforations, dessinee.
 *
 * C est le seul ornement de la page, et il vient du support : une pellicule
 * 35 mm porte quatre perforations Bell et Howell par photogramme. Deux bandes
 * tiennent le heros comme un photogramme tient son image.
 */
function Perforations({ cote }: { readonly cote: 'gauche' | 'droite' }): ReactElement {
  return (
    <svg
      viewBox="0 0 40 400"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`o-pointer-events-none o-absolute o-inset-y-0 o-h-full o-w-8 md:o-w-11 ${cote === 'gauche' ? 'o-left-0' : 'o-right-0'}`}
    >
      <rect width="40" height="400" fill={accentDoux(900, 45)} />
      <rect
        x={cote === 'gauche' ? 38 : 0}
        width="2"
        height="400"
        fill={accent(700)}
        opacity="0.6"
      />
      {Array.from({ length: 20 }, (_, rang) => (
        <rect
          key={rang}
          x="11"
          y={6 + rang * 20}
          width="18"
          height="12"
          rx="2.5"
          fill="var(--o-palette-zinc-950)"
          stroke={accent(800)}
          strokeWidth="0.6"
        />
      ))}
    </svg>
  )
}

/* ============================ La grille ================================ */

/** La grille d une journee : trois salles, un axe horaire, les seances dessus. */
function Grille({
  jour,
  choisie,
  onChoisir,
}: {
  readonly jour: number
  readonly choisie: Seance | undefined
  readonly onChoisir: (s: Seance) => void
}): ReactElement {
  const duJour = useMemo(() => SEANCES.filter((s) => s.jour === jour), [jour])
  const heures = useMemo(
    () =>
      Array.from(
        { length: Math.ceil((AXE_FIN - AXE_DEBUT) / 60) + 1 },
        (_, rang) => AXE_DEBUT + rang * 60,
      ),
    [],
  )

  if (duJour.length === 0) {
    return (
      <div className="o-border-w-1 o-border-white-10 o-px-6 o-py-20 o-text-center">
        <p
          className="o-m-0"
          style={{ ...affichette('m', 500), fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
        >
          Relache
        </p>
        <p className="o-m-0 o-mt-4 o-text-sm o-text-zinc-400">
          La cabine est reglee le lundi, et la moquette de la salle 2 seche. On rouvre
          mardi a quatorze heures.
        </p>
      </div>
    )
  }

  return (
    // Une bande qui defile de cote doit couper l axe vertical elle-meme :
    // sans cela la cascade met les deux axes a `auto`, la bande avale la
    // molette et la page se fige sous le pointeur.
    <div className="o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
      <div style={{ minWidth: 900 }}>
        {/* L axe des heures. */}
        <div className="o-relative o-h-6 o-border-b o-border-white-10">
          {heures.map((h) => (
            <span
              key={h}
              className="o-absolute o-top-0 o-font-mono o-text-xs o-tabular-nums o-text-zinc-500"
              style={{ left: `${String(surLAxe(h))}%` }}
            >
              {String(Math.floor(h / 60) % 24).padStart(2, '0')}
            </span>
          ))}
        </div>

        {SALLES.map((salle, rangSalle) => (
          <div
            key={salle.nom}
            className="o-relative o-border-b o-border-white-10"
            style={{ height: 78 }}
          >
            {/* Les filets d heure, derriere les seances. */}
            {heures.map((h) => (
              <span
                key={h}
                aria-hidden="true"
                className="o-absolute o-inset-y-0 o-w-px o-bg-white-10"
                style={{ left: `${String(surLAxe(h))}%` }}
              />
            ))}
            <span className="o-absolute o-left-0 o-top-2 o-z-10 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
              {salle.nom}
            </span>

            {duJour
              .filter((s) => s.salle === rangSalle)
              .map((s) => {
                const film = filmDe(s.film)
                const fin = finDe(s)
                const prise =
                  choisie?.debut === s.debut &&
                  choisie.salle === s.salle &&
                  choisie.jour === s.jour
                const tard = fin > DERNIER_BUS
                return (
                  <button
                    key={`${String(s.debut)}-${String(s.salle)}`}
                    type="button"
                    aria-pressed={prise}
                    onClick={() => {
                      onChoisir(s)
                    }}
                    className="o-absolute o-flex o-cursor-pointer o-flex-col o-justify-center o-overflow-hidden o-border-w-1 o-px-3 o-text-left o-transition-colors focus:o-ring"
                    style={{
                      left: `${String(surLAxe(s.debut))}%`,
                      width: `${String(surLAxe(fin) - surLAxe(s.debut))}%`,
                      top: 26,
                      height: 44,
                      ...(prise
                        ? { ...aplat(), borderColor: 'transparent' }
                        : {
                            borderColor: tard ? accent(600) : 'var(--o-palette-zinc-700)',
                            backgroundColor: accentDoux(900, 40),
                            color: 'var(--o-palette-zinc-100)',
                          }),
                    }}
                  >
                    <span className="o-truncate o-text-sm o-font-semibold o-uppercase o-tracking-tight">
                      {film?.titre}
                    </span>
                    <span className="o-truncate o-font-mono o-text-xs o-tabular-nums o-opacity-80">
                      {heure(s.debut)} — {heure(fin)}
                      {tard ? ' · bus rate' : ''}
                    </span>
                  </button>
                )
              })}
          </div>
        ))}

        {/* Le dernier bus, en trait sur toute la grille. */}
        <div className="o-relative o-h-10">
          <span
            aria-hidden="true"
            className="o-absolute o-inset-y-0 o-w-px"
            style={{
              left: `${String(surLAxe(DERNIER_BUS))}%`,
              backgroundColor: accent(500),
            }}
          />
          <span
            className="o-absolute o-top-1 o-whitespace-nowrap o-font-mono o-text-xs o-uppercase o-tracking-widest"
            style={{
              left: `${String(surLAxe(DERNIER_BUS))}%`,
              transform: 'translateX(-100%)',
              paddingRight: 10,
              color: encreSurSombre(),
            }}
          >
            Dernier bus, ligne 4 — 23 h 51
          </span>
        </div>
      </div>
    </div>
  )
}

/* ============================ La jauge (A39) =========================== */

/** La jauge de places restantes : une seule barre, et un seul bouton dessous. */
function Jauge({ seance }: { readonly seance: Seance }): ReactElement {
  const salle = SALLES[seance.salle] ?? SALLES[0]
  const part = Math.min(1, seance.places / salle.fauteuils)
  const serre = seance.places <= 10

  return (
    <div>
      <p className="o-m-0 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
        <span>Places restantes en {salle.nom.toLowerCase()}</span>
        <span className="o-tabular-nums" style={{ color: encreSurSombre() }}>
          {seance.places} sur {salle.fauteuils}
        </span>
      </p>
      <div className="o-mt-4 o-h-6 o-w-full o-overflow-hidden o-border-w-1 o-border-white-20">
        <div
          className="o-h-full o-transition-all"
          style={{
            width: `${String(Math.round(part * 100))}%`,
            backgroundColor: accent(serre ? 600 : 400),
            transitionDuration: '420ms',
          }}
        />
      </div>
      <p className="o-m-0 o-mt-3 o-text-sm o-leading-relaxed o-text-zinc-400">
        {serre
          ? 'Il reste dix places ou moins. La caisse ouvre trente minutes avant, et elle ne garde rien.'
          : 'La salle se remplit surtout le samedi. En semaine, venir dix minutes avant suffit.'}
      </p>

      <div className="o-mt-9">
        <StarBorder
          color="--o-vitrine-400"
          speed={7000}
          thickness={1}
          className="o-inline-block o-rounded-full"
        >
          <a
            href="#place"
            className="o-inline-flex o-items-center o-gap-3 o-rounded-full o-px-10 o-py-5 o-text-base o-font-semibold o-uppercase o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
            style={aplat()}
          >
            Prendre une place
            <Icon icon={Clapperboard} size={18} aria-hidden="true" />
          </a>
        </StarBorder>
      </div>
    </div>
  )
}

/* ============================ Le generique (P25) ======================= */

/** Le generique de fin : roles a gauche, noms a droite, comme au cinema. */
const GENERIQUE: readonly (readonly [string, readonly string[]])[] = [
  ['Programmation', ['Salome Vaury', 'Come Riviere']],
  ['Cabine', ['Tarek Nadji', 'Ines Roque']],
  ['Caisse et bar', ['Lea Vasseur', 'Hugo Delaunay', 'Nadia Berthaut']],
  ['Piano', ['Nadia Berthaut']],
  ['Affiches', ['Serigraphie de l atelier Marge, Nantes']],
  ['Copies 35 mm', ['Cinematheque regionale, depot permanent']],
  ['Salle', ['Ancien theatre municipal, 1908 — classee en 1994']],
  ['Adhesion', ['Dix-huit euros l an, carte nominative, six places a tarif reduit']],
  ['Accessibilite', ['Salle 2 de plain-pied, boucle magnetique, quatre emplacements']],
  ['Nous ecrire', ['cabine@salle-trois.fr — 02 51 84 09 33']],
]

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('oswald')
  const [jour, setJour] = useState(2)
  const [choisie, setChoisie] = useState<Seance | undefined>(() =>
    SEANCES.find((s) => s.jour === 2),
  )

  const film = choisie === undefined ? undefined : filmDe(choisie.film)
  const fin = choisie === undefined ? 0 : finDe(choisie)

  return (
    <Porte forme="iris" marque="Salle 3">
      <div
        className="o-relative o-overflow-hidden o-text-zinc-50"
        style={{ ...polices, ...nuit('zinc') }}
      >
        {/*
          ----- L ouverture : un photogramme -----------------------------------
        */}
        <section
          id="haut"
          className="o-relative o-isolate o-flex o-flex-col"
          style={{ minHeight: ECRAN }}
        >
          <Perforations cote="gauche" />
          <Perforations cote="droite" />
          <Grain opacite={0.1} />

          <div className="o-relative o-z-20">
            <BarreCoins
              marque="Salle 3"
              liens={NAVIGATION}
              droite="Nantes, rue du Calvaire"
            />
          </div>

          <div className="o-relative o-z-20 o-flex o-grow o-flex-col o-justify-end o-px-12 o-pb-20 o-pt-10 md:o-px-20">
            <Surgit>
              <Etiquette>
                Cinema d art et d essai — trois salles, classe recherche et patrimoine
              </Etiquette>
            </Surgit>
            <TitreVague
              delai={140}
              cadence={70}
              className="o-m-0 o-mt-8 o-max-w-5xl"
              style={{
                ...affichette('xl', 700),
                fontSize: 'clamp(2.4rem, 8vw, 8rem)',
                lineHeight: 0.86,
              }}
            >
              Trois salles, aucune publicite.
            </TitreVague>
            <div className="o-mt-12 o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <Surgit
                delai={620}
                as="p"
                className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300 md:o-col-span-6"
              >
                Cent quatre-vingts fauteuils, douze minutes d annonces, et rien d autre
                avant le film. La grille de la semaine dit la duree, la version et l heure
                de sortie.
              </Surgit>
              <Surgit delai={740} className="md:o-col-span-6 md:o-flex md:o-justify-end">
                <a
                  href="#grille"
                  className="o-inline-flex o-items-center o-gap-3 o-rounded-full o-px-8 o-py-4 o-text-sm o-font-semibold o-uppercase o-tracking-wide o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={aplat()}
                >
                  Voir la semaine
                  <Icon icon={ArrowDown} size={16} aria-hidden="true" />
                </a>
              </Surgit>
            </div>
          </div>

          <div className="o-hidden md:o-block">
            <Coin position="bd">
              Caisse 30 min avant la premiere seance
              <br />
              Relache le lundi
            </Coin>
          </div>
        </section>

        {/*
          ----- Le bandeau : les titres de la semaine (M-bandeau) ---------------
        */}
        <div
          className="o-border-t o-border-b o-border-white-10 o-py-6"
          style={{ backgroundColor: accentDoux(900, 40) }}
        >
          <Bandeau
            mots={FILMS.map((f) => f.titre.toUpperCase())}
            separateur="●"
            vitesse={44}
            taille="clamp(1.75rem, 6vw, 6rem)"
            className="o-text-zinc-100"
            style={{ ...affichette('m', 300), fontSize: undefined } as CSSProperties}
          />
        </div>

        <main>
          {/*
            ----- Le mecanisme : la grille de la semaine -------------------------
          */}
          <section
            id="grille"
            className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-14 md:o-py-28"
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="01">La semaine</Indice>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-3xl"
                  style={{
                    ...affichette('m', 700),
                    fontSize: 'clamp(1.9rem, 5vw, 4.5rem)',
                    lineHeight: 0.92,
                  }}
                >
                  <FuzzyText as="span" blur={1.1} amplitude={1.3}>
                    Ce qui passe, combien de temps, et a quelle heure vous sortez
                  </FuzzyText>
                </h2>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-col-span-4 md:o-text-right">
                Chaque bloc occupe sa duree reelle,
                <br />
                les douze minutes d annonces comprises
              </p>
            </div>

            {/* Les sept jours. */}
            <ul className="o-m-0 o-mt-12 o-flex o-list-none o-flex-wrap o-gap-2 o-p-0">
              {JOURS.map((nom, rang) => {
                const actif = rang === jour
                const relache = rang === 0
                return (
                  <li key={nom}>
                    <button
                      type="button"
                      aria-pressed={actif}
                      onClick={() => {
                        setJour(rang)
                        setChoisie(SEANCES.find((s) => s.jour === rang))
                      }}
                      className="o-cursor-pointer o-border-w-1 o-px-5 o-py-2.5 o-text-sm o-font-semibold o-uppercase o-tracking-wide o-transition-colors focus:o-ring"
                      style={
                        actif
                          ? { ...aplat(), borderColor: 'transparent' }
                          : {
                              borderColor: 'var(--o-palette-zinc-700)',
                              color: relache
                                ? 'var(--o-palette-zinc-500)'
                                : 'var(--o-palette-zinc-200)',
                              backgroundColor: 'transparent',
                            }
                      }
                    >
                      {nom}
                      {relache ? ' — relache' : ''}
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="o-mt-10">
              <Grille jour={jour} choisie={choisie} onChoisir={setChoisie} />
            </div>

            {/* La seance choisie : la fiche, et la jauge. */}
            {choisie !== undefined && film !== undefined && (
              <div className="o-mt-16 o-grid o-gap-12 lg:o-grid-cols-12">
                <div className="lg:o-col-span-7">
                  <p
                    className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: encreSurSombre() }}
                  >
                    {JOURS[choisie.jour]} — {SALLES[choisie.salle]?.nom} —{' '}
                    {heure(choisie.debut)}
                  </p>
                  <h3
                    className="o-m-0 o-mt-5 o-max-w-2xl"
                    style={{
                      ...affichette('m', 700),
                      fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
                      lineHeight: 0.94,
                    }}
                  >
                    {film.titre}
                  </h3>
                  <p className="o-m-0 o-mt-4 o-text-base o-text-zinc-300">
                    {film.realisation} · {film.pays}, {film.annee}
                  </p>

                  <dl aria-live="polite" className="o-m-0 o-mt-10">
                    {(
                      [
                        ['Duree de la copie', `${String(film.duree)} minutes`],
                        ['Annonces', `${String(ANNONCES)} minutes, et rien apres`],
                        ['Version', film.version],
                        ['Support', film.support],
                      ] as const
                    ).map(([quoi, valeur]) => (
                      <div
                        key={quoi}
                        className="o-grid o-gap-x-6 o-gap-y-1 o-border-t o-border-white-10 o-py-4 sm:o-grid-cols-12"
                      >
                        <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 sm:o-col-span-4">
                          {quoi}
                        </dt>
                        <dd className="o-m-0 o-text-sm o-text-zinc-100 sm:o-col-span-8">
                          {valeur}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="o-mt-10 o-border-w-1 o-border-white-10 o-p-6">
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                      Fin de seance
                    </p>
                    <p
                      className="o-m-0 o-mt-3"
                      style={{
                        ...affichette('m', 500),
                        fontSize: 'clamp(2rem, 5vw, 4rem)',
                        color: encreSurSombre(),
                      }}
                    >
                      <SplitFlap
                        key={`${String(choisie.debut)}-${String(choisie.salle)}`}
                        declenchement="montage"
                        interval={70}
                        step={45}
                      >
                        {heure(fin)}
                      </SplitFlap>
                    </p>
                    <p className="o-m-0 o-mt-4 o-max-w-lg o-text-sm o-leading-relaxed o-text-zinc-300">
                      {fin > DERNIER_BUS
                        ? 'Vous sortez apres le dernier bus de la ligne 4. Le parking de la Petite-Hollande est a six minutes a pied, et il est gratuit apres vingt heures.'
                        : 'Vous avez le dernier bus de la ligne 4, arret Calvaire, a 23 h 51.'}
                    </p>
                  </div>

                  <p className="o-m-0 o-mt-8 o-max-w-lg o-text-base o-italic o-leading-relaxed o-text-zinc-300">
                    {film.note}
                  </p>
                </div>

                <div className="lg:o-col-span-5">
                  <div
                    className="o-border-w-1 o-border-white-10 o-p-7 lg:o-sticky"
                    style={{ top: CHROME + 32, backgroundColor: accentDoux(900, 30) }}
                  >
                    <Jauge seance={choisie} />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/*
            ----- La coupe : un ecran clair dans une page noire -------------------
          */}
          <section
            className="o-flex o-items-center o-px-6 o-py-24 md:o-px-14 md:o-py-36"
            style={{ backgroundColor: accent(200), color: 'var(--o-palette-zinc-950)' }}
          >
            <div className="o-mx-auto o-w-full o-max-w-6xl">
              <p
                className="o-m-0 o-max-w-4xl o-text-balance"
                style={{
                  ...affichette('m', 700),
                  fontSize: 'clamp(1.9rem, 5.4vw, 5rem)',
                  lineHeight: 0.94,
                }}
              >
                Une salle de quartier n est pas un ecran de plus. C est un horaire tenu,
                une copie choisie, et quelqu un en cabine.
              </p>
              <p
                className="o-m-0 o-mt-10 o-max-w-xl o-text-base o-leading-relaxed"
                style={{ color: 'var(--o-palette-zinc-800)' }}
              >
                Nous programmons huit semaines a l avance, nous ne deprogrammons pas un
                film parce qu il a fait vingt entrees, et nous projetons en 35 mm chaque
                fois que la copie existe et qu elle tient encore.
              </p>
            </div>
          </section>

          {/*
            ----- La maison : les trois salles ------------------------------------
          */}
          <section
            id="maison"
            className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-14 md:o-py-28"
          >
            <Indice rang="02">La maison</Indice>
            <h2
              className="o-m-0 o-mt-5 o-max-w-3xl"
              style={{
                ...affichette('m', 700),
                fontSize: 'clamp(1.75rem, 4vw, 3.75rem)',
                lineHeight: 0.94,
              }}
            >
              Trois salles, trois manieres de voir
            </h2>

            <ol className="o-m-0 o-mt-14 o-list-none o-border-t o-border-white-10 o-p-0">
              {SALLES.map((salle, rang) => (
                <li
                  key={salle.nom}
                  className="o-grid o-items-baseline o-gap-6 o-border-b o-border-white-10 o-py-10 md:o-grid-cols-12 md:o-gap-10"
                >
                  <span
                    aria-hidden="true"
                    className="o-tabular-nums md:o-col-span-2"
                    style={{
                      ...affichette('l', 300),
                      fontSize: 'clamp(3rem, 7vw, 6.5rem)',
                      color: accentDoux(400, 74),
                    }}
                  >
                    {String(rang + 1).padStart(2, '0')}
                  </span>
                  <div className="md:o-col-span-5">
                    <h3
                      className="o-m-0"
                      style={{
                        ...affichette('m', 500),
                        fontSize: 'clamp(1.25rem, 2.4vw, 2rem)',
                      }}
                    >
                      {salle.nom}
                    </h3>
                    <p className="o-m-0 o-mt-3 o-text-base o-leading-relaxed o-text-zinc-300">
                      {salle.note}
                    </p>
                  </div>
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 md:o-col-span-5 md:o-text-right">
                    {salle.fauteuils} fauteuils —{' '}
                    {salle.fauteuils > 60
                      ? 'gradin, allee centrale'
                      : salle.fauteuils > 40
                        ? 'gradin doux'
                        : 'plancher, rangees de six'}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/*
            ----- L appel : la place, et un seul bouton (A39) ----------------------
          */}
          <section
            id="place"
            className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-14 md:o-py-32"
            style={{ backgroundColor: accentDoux(900, 35) }}
          >
            <div className="o-mx-auto o-max-w-3xl o-text-center">
              <h2
                className="o-m-0 o-text-balance"
                style={{
                  ...affichette('l', 700),
                  fontSize: 'clamp(2.25rem, 7vw, 6.5rem)',
                  lineHeight: 0.9,
                }}
              >
                Six euros cinquante
              </h2>
              <p className="o-m-0 o-mx-auto o-mt-8 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-300">
                Tarif unique, toutes seances, tous les jours. Quatre euros cinquante avec
                la carte d adherent, qui coute dix-huit euros l an. Aucune reservation en
                ligne : la caisse ouvre trente minutes avant.
              </p>
              <div className="o-mt-12 o-flex o-justify-center">
                <StarBorder
                  color="--o-vitrine-400"
                  speed={6500}
                  thickness={1}
                  className="o-inline-block o-rounded-full"
                >
                  <a
                    href="tel:+33251840933"
                    className="o-inline-flex o-items-center o-gap-3 o-rounded-full o-px-12 o-py-6 o-text-lg o-font-semibold o-uppercase o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                    style={aplat()}
                  >
                    02 51 84 09 33
                  </a>
                </StarBorder>
              </div>
              <p className="o-m-0 o-mt-8 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                Rue du Calvaire, Nantes — arret Calvaire, lignes 1 et 4
              </p>
            </div>
          </section>
        </main>

        {/*
          ----- Le pied : le generique (P25) -------------------------------------
        */}
        <footer className="o-relative o-overflow-hidden o-border-t o-border-white-10 o-px-6 o-pt-16 md:o-px-14">
          <p className="o-m-0 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
            Generique
          </p>

          <div className="o-relative o-mt-10 o-overflow-hidden" style={{ height: 460 }}>
            <Parallaxe vitesse={0.55} glisse={0.5} className="o-h-full">
              <div className="o-mx-auto o-flex o-max-w-3xl o-flex-col o-gap-7">
                {GENERIQUE.map(([role, noms]) => (
                  <div key={role} className="o-grid o-gap-2 sm:o-grid-cols-2 sm:o-gap-10">
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 sm:o-text-right">
                      {role}
                    </p>
                    <div>
                      {noms.map((nom) => (
                        <p
                          key={nom}
                          className="o-m-0 o-text-sm o-uppercase o-tracking-wide o-text-zinc-200"
                        >
                          {nom}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Parallaxe>
            {/* Les deux fondus, en haut et en bas, comme un generique qui passe. */}
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, var(--o-palette-zinc-950) 0%, transparent 18%, transparent 82%, var(--o-palette-zinc-950) 100%)',
              }}
            />
          </div>

          <p
            aria-hidden="true"
            className="o-m-0 o-mt-6 o-select-none o-whitespace-nowrap o-text-center"
            style={{
              ...affichette('xxl', 700),
              fontSize: 'clamp(3rem, 17vw, 18rem)',
              lineHeight: 0.8,
              color: accentDoux(400, 62),
            }}
          >
            Salle 3
          </p>

          <div className="o-mt-6 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-white-10 o-py-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
            <span>© 2026 Salle 3 — association loi 1901, licence 1-108 442</span>
            <a
              href="#haut"
              className="o-text-zinc-400 o-no-underline hover:o-text-zinc-50 focus:o-ring"
            >
              Remonter ↑
            </a>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
