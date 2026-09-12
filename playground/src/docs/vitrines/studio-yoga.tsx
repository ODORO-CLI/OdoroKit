/**
 * Souffle — studio de yoga.
 *
 * ## L architecture : la grille horaire est le milieu de la page
 *
 * Landing page complete dont le **coeur est un planning en colonnes**, et c est
 * ce qui n appartient qu a elle : six jours cote a cote, les cours empiles dans
 * l ordre des heures, les places restantes sur chaque cours. Deux filtres
 * **grisent** les cours qui ne conviennent pas au lieu de les retirer, pour que
 * la grille garde sa forme et qu on voie ce qu on manque.
 *
 * ## L univers (Nubo)
 *
 * Tout respire. Un cercle qui s ouvre et se ferme au rythme d une inspiration
 * guide la page ; la brume derive derriere l ouverture ; la carte du prochain
 * cours flotte. L enchainement :
 *
 * - **ouverture** : la brume basse, le titre leger avec son mot en italique,
 *   le prochain cours en carte flottante, et un autocollant penche qui flotte ;
 * - **le cercle de respiration**, un ecran pour lui seul ;
 * - **le planning** de la semaine, pose en feuille punaisee — un en-tete en
 *   chasse fixe sur du papier, pas un troisieme titre d affichage — avec ses
 *   deux filtres ;
 * - **les professeurs**, une ligne chacun, la salle qui derive a cote ;
 * - **la liste d attente**, en verre, sur une nappe sombre ;
 * - **la signature** de la fondatrice, en pied.
 *
 * ## Le fond
 *
 * La brume tient l ouverture : c est le mur du fond de la salle, le matin,
 * quand la lumiere du nord entre. Elle ne passe jamais derriere le planning :
 * un horaire se lit, il ne s admire pas.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, Users } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useMemo, useState, type ReactElement } from 'react'

import { FogDrift } from '@/odoro/background/FogDrift.jsx'
import { ParallaxImage } from '@/odoro/image/ParallaxImage.jsx'
import { WaveText } from '@/odoro/text/WaveText.jsx'
import { GlassSurface } from '@/odoro/ui/GlassSurface.jsx'

import { nuit } from './communs.jsx'
import { photo, portrait } from './media.js'
import { accent, encre, encreSurSombre } from './palettes.js'
import { Accent, Actions, affiche, Autocollant, BarreGelule, Etiquette, Grain, Indice, Porte, Surgit, usePolices, verre } from './marche.jsx'
import { Flotte, Nappe, Respire } from './scene.jsx'

interface Cours {
  readonly id: string
  readonly heure: string
  readonly titre: string
  readonly prof: string
  readonly duree: string
  readonly niveau: string
  readonly salle: string
  readonly places: number
  readonly capacite: number
  /** Personnes deja inscrites en liste d attente, quand le cours est plein. */
  readonly attente: number
}

/** Une journee du planning. */
interface Journee {
  readonly jour: string
  readonly abrege: string
  readonly cours: readonly Cours[]
}

/** Les niveaux annonces a la porte, dans l ordre de la difficulte. */
const NIVEAUX = ['Debutant', 'Ouvert a tous', 'Intermediaire', 'Prenatal'] as const

/** Les quatre professeurs, dans l ordre d anciennete. */
const NOMS = [
  'Camille Roux',
  'Nadia Belkacem',
  'Jonas Vidal',
  'Elsa Marchand',
] as const

/** La semaine, telle qu elle est affichee a la porte du studio. */
const SEMAINE: readonly Journee[] = [
  {
    jour: 'Lundi',
    abrege: 'Lun',
    cours: [
      {
        id: 'lun-1',
        heure: '07h00',
        titre: 'Hatha doux',
        prof: 'Camille Roux',
        duree: '60 min',
        niveau: 'Ouvert a tous',
        salle: 'Salle claire',
        places: 4,
        capacite: 14,
        attente: 0,
      },
      {
        id: 'lun-2',
        heure: '12h30',
        titre: 'Vinyasa court',
        prof: 'Nadia Belkacem',
        duree: '45 min',
        niveau: 'Intermediaire',
        salle: 'Salle claire',
        places: 2,
        capacite: 14,
        attente: 0,
      },
      {
        id: 'lun-3',
        heure: '19h00',
        titre: 'Yin du soir',
        prof: 'Camille Roux',
        duree: '75 min',
        niveau: 'Ouvert a tous',
        salle: 'Salle basse',
        places: 7,
        capacite: 12,
        attente: 0,
      },
    ],
  },
  {
    jour: 'Mardi',
    abrege: 'Mar',
    cours: [
      {
        id: 'mar-1',
        heure: '08h15',
        titre: 'Respiration et posture',
        prof: 'Jonas Vidal',
        duree: '60 min',
        niveau: 'Debutant',
        salle: 'Salle basse',
        places: 9,
        capacite: 12,
        attente: 0,
      },
      {
        id: 'mar-2',
        heure: '18h00',
        titre: 'Vinyasa',
        prof: 'Nadia Belkacem',
        duree: '75 min',
        niveau: 'Intermediaire',
        salle: 'Salle claire',
        places: 0,
        capacite: 14,
        attente: 5,
      },
      {
        id: 'mar-3',
        heure: '20h00',
        titre: 'Meditation guidee',
        prof: 'Jonas Vidal',
        duree: '40 min',
        niveau: 'Ouvert a tous',
        salle: 'Salle basse',
        places: 6,
        capacite: 12,
        attente: 0,
      },
    ],
  },
  {
    jour: 'Mercredi',
    abrege: 'Mer',
    cours: [
      {
        id: 'mer-1',
        heure: '07h00',
        titre: 'Hatha doux',
        prof: 'Camille Roux',
        duree: '60 min',
        niveau: 'Ouvert a tous',
        salle: 'Salle claire',
        places: 5,
        capacite: 14,
        attente: 0,
      },
      {
        id: 'mer-2',
        heure: '12h30',
        titre: 'Dos et nuque',
        prof: 'Elsa Marchand',
        duree: '45 min',
        niveau: 'Debutant',
        salle: 'Salle basse',
        places: 0,
        capacite: 12,
        attente: 3,
      },
      {
        id: 'mer-3',
        heure: '19h30',
        titre: 'Yin du soir',
        prof: 'Elsa Marchand',
        duree: '75 min',
        niveau: 'Ouvert a tous',
        salle: 'Salle claire',
        places: 8,
        capacite: 14,
        attente: 0,
      },
    ],
  },
  {
    jour: 'Jeudi',
    abrege: 'Jeu',
    cours: [
      {
        id: 'jeu-1',
        heure: '08h15',
        titre: 'Vinyasa lent',
        prof: 'Nadia Belkacem',
        duree: '60 min',
        niveau: 'Intermediaire',
        salle: 'Salle claire',
        places: 6,
        capacite: 14,
        attente: 0,
      },
      {
        id: 'jeu-2',
        heure: '18h00',
        titre: 'Prenatal',
        prof: 'Elsa Marchand',
        duree: '60 min',
        niveau: 'Prenatal',
        salle: 'Salle basse',
        places: 4,
        capacite: 8,
        attente: 0,
      },
      {
        id: 'jeu-3',
        heure: '20h00',
        titre: 'Yoga nidra',
        prof: 'Camille Roux',
        duree: '50 min',
        niveau: 'Ouvert a tous',
        salle: 'Salle basse',
        places: 10,
        capacite: 12,
        attente: 0,
      },
    ],
  },
  {
    jour: 'Vendredi',
    abrege: 'Ven',
    cours: [
      {
        id: 'ven-1',
        heure: '07h00',
        titre: 'Salutations au soleil',
        prof: 'Jonas Vidal',
        duree: '45 min',
        niveau: 'Ouvert a tous',
        salle: 'Salle claire',
        places: 1,
        capacite: 14,
        attente: 0,
      },
      {
        id: 'ven-2',
        heure: '12h30',
        titre: 'Vinyasa court',
        prof: 'Nadia Belkacem',
        duree: '45 min',
        niveau: 'Intermediaire',
        salle: 'Salle claire',
        places: 5,
        capacite: 14,
        attente: 0,
      },
      {
        id: 'ven-3',
        heure: '18h30',
        titre: 'Fin de semaine, yin',
        prof: 'Camille Roux',
        duree: '90 min',
        niveau: 'Ouvert a tous',
        salle: 'Salle basse',
        places: 2,
        capacite: 12,
        attente: 0,
      },
    ],
  },
  {
    jour: 'Samedi',
    abrege: 'Sam',
    cours: [
      {
        id: 'sam-1',
        heure: '09h30',
        titre: 'Hatha long',
        prof: 'Elsa Marchand',
        duree: '90 min',
        niveau: 'Ouvert a tous',
        salle: 'Salle claire',
        places: 6,
        capacite: 14,
        attente: 0,
      },
      {
        id: 'sam-2',
        heure: '11h30',
        titre: 'Atelier equilibres',
        prof: 'Jonas Vidal',
        duree: '120 min',
        niveau: 'Intermediaire',
        salle: 'Salle claire',
        places: 3,
        capacite: 10,
        attente: 0,
      },
      {
        id: 'sam-3',
        heure: '16h00',
        titre: 'Premiers pas, cours d essai',
        prof: 'Camille Roux',
        duree: '60 min',
        niveau: 'Debutant',
        salle: 'Salle basse',
        places: 5,
        capacite: 12,
        attente: 0,
      },
    ],
  },
  {
    jour: 'Dimanche',
    abrege: 'Dim',
    cours: [
      {
        id: 'dim-1',
        heure: '10h00',
        titre: 'Dimanche lent',
        prof: 'Camille Roux',
        duree: '75 min',
        niveau: 'Ouvert a tous',
        salle: 'Salle basse',
        places: 9,
        capacite: 12,
        attente: 0,
      },
      {
        id: 'dim-2',
        heure: '17h00',
        titre: 'Restauratif',
        prof: 'Elsa Marchand',
        duree: '60 min',
        niveau: 'Ouvert a tous',
        salle: 'Salle basse',
        places: 11,
        capacite: 12,
        attente: 0,
      },
    ],
  },
]

/** Les quatre professeurs, avec ce qui les distingue. */
const PROFESSEURS = [
  {
    nom: 'Camille Roux',
    role: 'Fondatrice — hatha, yin, nidra',
    texte: 'Enseigne depuis 2011. Formee a Rishikesh, puis a Lyon en yoga therapeutique.',
    cours: 'Six cours par semaine',
    image: portrait('yoga-camille', 'Camille Roux, fondatrice du studio'),
  },
  {
    nom: 'Nadia Belkacem',
    role: 'Vinyasa',
    texte:
      'Ancienne danseuse contemporaine. Ses cours montent en intensite puis redescendent.',
    cours: 'Quatre cours par semaine',
    image: portrait('yoga-nadia', 'Nadia Belkacem, professeure de vinyasa'),
  },
  {
    nom: 'Jonas Vidal',
    role: 'Respiration, meditation',
    texte:
      'Kinesitherapeute de formation. Il commence toujours par le souffle, jamais par la posture.',
    cours: 'Quatre cours par semaine',
    image: portrait('yoga-jonas', 'Jonas Vidal, professeur de respiration'),
  },
  {
    nom: 'Elsa Marchand',
    role: 'Prenatal, dos, restauratif',
    texte: 'Accompagne les grossesses et les retours apres blessure depuis huit ans.',
    cours: 'Six cours par semaine',
    image: portrait('yoga-elsa', 'Elsa Marchand, professeure de prenatal'),
  },
]

/** Le libelle des places restantes, avec le cas plein. */
function placesLibelle(places: number): string {
  if (places === 0) return 'Complet'
  if (places === 1) return '1 place'
  return `${String(places)} places`
}

/** Les cours pleins de la semaine, avec leur jour : c est eux qu on attend. */
const COMPLETS = SEMAINE.flatMap((jour) => jour.cours.filter((c) => c.places === 0).map((c) => ({ jour: jour.jour, cours: c })))

/** Le premier cours de la semaine ou il reste de la place. */
const PROCHAIN = SEMAINE.flatMap((jour) => jour.cours.map((c) => ({ jour: jour.jour, cours: c }))).find((e) => e.cours.places > 0)

/* ============================ Le rendu ============================ */

/** La vitrine complete : le planning de la semaine. */
export default function Page(): ReactElement {
  const polices = usePolices('inter')
  const [niveau, setNiveau] = useState<string>('Tous')
  const [prof, setProf] = useState<string>('Tous')
  const [attente, setAttente] = useState<string>(COMPLETS[0]?.cours.id ?? '')
  const [inscrit, setInscrit] = useState(false)

  const retenus = useMemo(() => {
    const compte = SEMAINE.reduce(
      (somme, jour) =>
        somme +
        jour.cours.filter(
          (c) => (niveau === 'Tous' || c.niveau === niveau) && (prof === 'Tous' || c.prof === prof),
        ).length,
      0,
    )
    return compte
  }, [niveau, prof])

  const total = useMemo(() => SEMAINE.reduce((s, j) => s + j.cours.length, 0), [])
  const attendu = COMPLETS.find((e) => e.cours.id === attente)

  return (
    <Porte forme="compteur" marque="Souffle" sombre={false}>
    <div className="o-bg-stone-50 dark:o-bg-stone-950 o-text-stone-900 dark:o-text-stone-100" style={polices}>
      {/* ================= 1. L ouverture : la brume basse ================= */}
      <header className="o-relative o-isolate o-overflow-hidden">
        <FogDrift
          className="o-absolute o-inset-0 o-z-0 o-pointer-events-none"
          speed={0.18}
          height={0.5}
          density={0.55}
          colors={['--o-theme-bg', '--o-vitrine-200', '--o-vitrine-400']}
          fallback="o-bg-gradient-to-t o-from-stone-200 dark:o-from-stone-800 o-to-stone-50 dark:o-to-stone-950"
        />

        <BarreGelule sombre={false} marque="Souffle" liens={[['#respirer', 'Respirer'], ['#planning', 'Le planning'], ['#profs', 'Les professeurs']]} action={['#attente', 'Liste d attente']} />

        <div className="o-relative o-z-10 o-mx-auto o-flex o-max-w-5xl o-flex-col o-items-center o-justify-center o-px-6 o-pb-24 o-pt-40 o-text-center" style={{ minHeight: 'calc(100vh - 101px)' }}>
          <Surgit>
            <Etiquette sombre={false}>Toujours quatorze tapis. Jamais un de plus.</Etiquette>
          </Surgit>
          <Surgit delai={120} as="h1" className="o-m-0 o-mt-7 o-max-w-4xl o-text-stone-950 dark:o-text-stone-50" style={affiche('l', 300)}>
            Un cours ou l&nbsp;on vous <Accent couleur={encre()}>voit</Accent>, parce qu&nbsp;on est quatorze.
          </Surgit>
          <Surgit delai={360} as="p" className="o-m-0 o-mt-7 o-max-w-xl o-text-lg o-leading-relaxed o-text-stone-600 dark:o-text-stone-300">
            Le professeur corrige chaque posture, une par une. C est impossible a trente, et c est la seule raison pour laquelle nous refusons du monde.
          </Surgit>
          <Surgit delai={480} className="o-mt-9">
            <Actions sombre={false} pleine={['#planning', <>Voir le planning <Icon icon={ArrowRight} size={16} aria-hidden="true" /></>]} fantome={['#respirer', 'Respirer d abord']} />
          </Surgit>

          {/* Le prochain cours ou il reste de la place, en carte flottante — Nubo. */}
          {PROCHAIN !== undefined && (
            <Surgit delai={700} className="o-mt-16 o-w-full o-max-w-md">
              <Flotte amplitude={7} duree={7} angle={-2}>
                <a href="#planning" className={`${verre(false)} o-flex o-items-center o-gap-4 o-p-3 o-pr-5 o-text-left o-no-underline o-text-stone-900 dark:o-text-stone-100 focus:o-ring`}>
                  <img src={photo('souffle-tapis', 300, 300)} alt="" aria-hidden="true" className="o-size-16 o-shrink-0 o-rounded-xl o-object-cover" />
                  <span className="o-min-w-0">
                    <span className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">Prochain cours — {PROCHAIN.jour} {PROCHAIN.cours.heure}</span>
                    <span className="o-mt-1 o-block o-truncate o-text-base o-font-medium">{PROCHAIN.cours.titre}, avec {PROCHAIN.cours.prof.split(' ')[0]}</span>
                    <span className="o-block o-text-sm" style={{ color: encre() }}>{placesLibelle(PROCHAIN.cours.places)} sur {PROCHAIN.cours.capacite}</span>
                  </span>
                  <Icon icon={ArrowRight} size={16} className="o-ml-auto o-shrink-0" aria-hidden="true" />
                </a>
              </Flotte>
            </Surgit>
          )}
        </div>

        {/* L autocollant penche, qui flotte : la signature de mouvement de la
            page, et le seul objet qui ne soit pas aligne sur son axe. */}
        <div className="o-pointer-events-none o-absolute o-z-20 max-lg:o-hidden" style={{ top: '38%', right: 'clamp(1rem, 6vw, 6rem)' }}>
          <Flotte amplitude={12} duree={9} delai={-2} angle={0}>
            <Autocollant angle={-9}>Premier cours : 5 EUR</Autocollant>
          </Flotte>
        </div>

        <p className="o-pointer-events-none o-absolute o-bottom-6 o-left-6 o-z-10 o-m-0 o-hidden o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-600 dark:o-text-stone-400 md:o-block">
          14 rue des Vignoles<br />Paris 20e — Buzenval
        </p>
        <p className="o-pointer-events-none o-absolute o-bottom-6 o-right-6 o-z-10 o-m-0 o-hidden o-text-right o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-600 dark:o-text-stone-400 md:o-block">
          Salle claire, salle basse<br />Lumiere du nord, aucun miroir
        </p>
      </header>

      <main>
        {/* ================= 2. Le cercle de respiration : un ecran pour lui ===== */}
        <section id="respirer" aria-labelledby="respirer-titre" className="o-relative o-mx-auto o-flex o-max-w-6xl o-scroll-mt-24 o-flex-col o-items-center o-justify-center o-px-6 o-py-24 o-text-center md:o-py-32" style={{ minHeight: 'calc(100vh - 101px)' }}>
          <Indice rang="01" sombre={false}>Avant de choisir un cours</Indice>

          <div className="o-relative o-mt-12 o-flex o-items-center o-justify-center" style={{ width: 'min(52vw, 22rem)', height: 'min(52vw, 22rem)' }}>
            {/* Trois anneaux : le cercle qui respire, son halo, et le filet fixe qui donne la mesure. */}
            <span aria-hidden="true" className="o-absolute o-inset-0 o-rounded-full o-border-w-1" style={{ borderColor: 'var(--o-theme-line)' }} />
            <Respire duree={8} className="o-absolute o-rounded-full" style={{ inset: '14%', background: `radial-gradient(circle at 40% 35%, ${accent(200)}, ${accent(400)} 70%, ${accent(500)})`, boxShadow: `0 30px 80px -30px ${accent(500)}` }} />
            <Respire duree={8} className="o-absolute o-rounded-full o-border-w-1" style={{ inset: '4%', borderColor: encre(), opacity: 0.5 }} />
          </div>
          <p className="o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">4 s — 4 s</p>

          <h2 id="respirer-titre" className="o-m-0 o-mt-12 o-text-stone-950 dark:o-text-stone-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 4.5vw, 4rem)' }}>
            <WaveText amplitude={5} speed={2600}>inspirez — expirez</WaveText>
          </h2>
          <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
            Le cercle s ouvre pendant quatre secondes et se ferme pendant quatre. C est le rythme par lequel Jonas commence chaque cours. Faites-le trois fois, puis descendez.
          </p>
          <p className="o-pointer-events-none o-absolute o-bottom-8 o-right-6 o-m-0 o-hidden o-max-w-xs o-text-right o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400 lg:o-block">
            Sous mouvement reduit,<br />le cercle reste ouvert
          </p>
        </section>

        {/* ================= 3. Le planning ================================ */}
        {/* La feuille punaisee a la porte : ni titre d affichage ni index, un
            en-tete en mono sur du papier. Sans quoi cette section aurait le
            meme rythme que les deux qui l entourent. */}
        <section id="planning" aria-labelledby="planning-titre" className="o-scroll-mt-24 o-border-t o-border-b o-border-stone-300 dark:o-border-stone-700 o-bg-white dark:o-bg-stone-900">
          <div className="o-mx-auto o-max-w-6xl o-px-5 o-pt-14 md:o-px-8 md:o-pt-20">
            <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-8 o-gap-y-2 o-border-b o-border-stone-900 dark:o-border-stone-100 o-pb-3">
              <h2 id="planning-titre" className="o-m-0 o-font-mono o-text-sm o-font-normal o-uppercase o-tracking-widest o-text-stone-950 dark:o-text-stone-50">
                La semaine, telle qu elle est affichee a la porte
              </h2>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
                14 — 19 septembre
              </p>
            </div>
            <p className="o-m-0 o-mt-4 o-max-w-md o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
              Les cours qui ne conviennent pas restent affiches, grises : on voit ce qu on manque.
            </p>

            {/* Les deux filtres, en ligne. */}
            <div className="o-mt-8 o-flex o-flex-col o-gap-2.5 o-border-t o-border-b o-border-stone-300 dark:o-border-stone-700 o-py-3">
              {([
                ['Niveau', ['Tous', ...NIVEAUX] as readonly string[], niveau, setNiveau],
                ['Professeur', ['Tous', ...NOMS] as readonly string[], prof, setProf],
              ] as const).map(([titre, options, courant, poser]) => (
                <div key={titre} role="group" aria-label={`Filtrer par ${titre.toLowerCase()}`} className="o-flex o-flex-wrap o-items-baseline o-gap-x-4 o-gap-y-1">
                  <span className="o-w-24 o-shrink-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                    {titre}
                  </span>
                  {options.map((option) => {
                    const actif = option === courant
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={actif}
                        onClick={() => {
                          poser(option)
                        }}
                        className="o-text-sm o-transition-colors focus:o-ring"
                        style={
                          actif
                            ? { color: encre(), fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px' }
                            : { color: 'var(--o-theme-muted)' }
                        }
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>

            <p aria-live="polite" className="o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-400">
              {retenus} cours sur {total} correspondent
            </p>
          </div>

          {/* ----- La semaine, en colonnes ------------------------------------ */}
          <div className="o-mx-auto o-max-w-6xl o-px-5 o-pb-20 o-pt-6 md:o-px-8 md:o-pb-28">
            <div className="o-overflow-x-auto o-scrollbar dark:o-scrollbar-dark">
              <ol
                aria-label="Planning de la semaine"
                className="o-list-none o-m-0 o-grid o-gap-px o-p-0"
                style={{ minWidth: '58rem', gridTemplateColumns: `repeat(${String(SEMAINE.length)}, minmax(0, 1fr))`, backgroundColor: 'var(--o-theme-line)' }}
              >
                {SEMAINE.map((jour) => (
                  <li key={jour.jour} className="o-bg-white dark:o-bg-stone-900">
                    <h3 className="o-m-0 o-border-b o-border-stone-300 dark:o-border-stone-700 o-px-3 o-py-2 o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest">
                      {jour.jour}
                    </h3>
                    <ul className="o-list-none o-m-0 o-flex o-flex-col o-p-0">
                      {jour.cours.map((cours) => {
                        const correspond =
                          (niveau === 'Tous' || cours.niveau === niveau) &&
                          (prof === 'Tous' || cours.prof === prof)
                        const plein = cours.places === 0
                        return (
                          <li
                            key={cours.id}
                            className="o-border-b o-border-stone-200 dark:o-border-stone-800 o-px-3 o-py-3"
                            style={correspond ? undefined : { opacity: 0.38 }}
                          >
                            <p className="o-m-0 o-flex o-items-baseline o-gap-2">
                              <span
                                className="o-tabular-nums o-text-sm o-font-semibold"
                                style={correspond ? { color: encre() } : undefined}
                              >
                                {cours.heure}
                              </span>
                              <span className="o-text-xs o-text-stone-500 dark:o-text-stone-400">
                                {cours.duree}
                              </span>
                            </p>
                            <p className="o-m-0 o-mt-1 o-text-sm o-font-medium o-leading-snug">
                              {cours.titre}
                            </p>
                            <p className="o-m-0 o-mt-0.5 o-text-xs o-text-stone-600 dark:o-text-stone-400">
                              {cours.prof} — {cours.niveau}
                            </p>
                            <p className="o-m-0 o-mt-1.5 o-flex o-items-center o-gap-1.5 o-text-xs">
                              <Icon
                                icon={Users}
                                size={11}
                                className="o-shrink-0"
                                style={plein ? undefined : { color: encre() }}
                                aria-hidden="true"
                              />
                              {plein ? (
                                <a href="#attente" className="o-text-stone-600 dark:o-text-stone-400 o-underline focus:o-ring" style={{ textUnderlineOffset: '3px' }}>
                                  Complet — {cours.attente} en attente
                                </a>
                              ) : (
                                <span style={{ color: encre() }}>
                                  {placesLibelle(cours.places)} sur {cours.capacite}
                                </span>
                              )}
                            </p>
                            <p className="o-m-0 o-mt-0.5 o-text-xs o-text-stone-500 dark:o-text-stone-400">
                              {cours.salle}
                            </p>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ================= 4. Les professeurs, la salle qui derive a cote ===== */}
        <section id="profs" aria-labelledby="profs-titre" className="o-scroll-mt-24 o-border-t o-border-stone-200 dark:o-border-stone-800">
          <div className="o-mx-auto o-grid o-max-w-6xl o-gap-12 o-px-5 o-py-20 md:o-px-8 md:o-py-28 lg:o-grid-cols-12">
            <figure className="o-m-0 o-min-w-0 lg:o-col-span-5">
              <div className="o-relative lg:o-sticky" style={{ top: 133 }}>
                <ParallaxImage src={photo('souffle-salle', 900, 1100)} alt="La salle claire, vide, un matin" ratio={0.8} strength={0.45} className="o-w-full o-rounded-3xl" />
                {/* Une seconde etiquette penchee, qui flotte sur la photo. */}
                <div className="o-pointer-events-none o-absolute o-z-10" style={{ bottom: '-1.25rem', right: '-0.75rem' }}>
                  <Flotte amplitude={8} duree={11} delai={-4}>
                    <Autocollant angle={7}>Aucun miroir</Autocollant>
                  </Flotte>
                </div>
                <figcaption className="o-mt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  La salle claire — lumiere du nord, quatorze tapis
                </figcaption>
              </div>
            </figure>

            <div className="o-min-w-0 lg:o-col-span-7">
              <Indice rang="03" sombre={false}>Qui enseigne</Indice>
              <h2 id="profs-titre" className="o-m-0 o-mt-4 o-max-w-xl o-text-stone-950 dark:o-text-stone-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 4.5vw, 4rem)' }}>
                Quatre professeurs, et ce par quoi chacun commence.
              </h2>
              <dl className="o-m-0 o-mt-12 o-border-t o-border-stone-300 dark:o-border-stone-700">
                {PROFESSEURS.map((personne, rang) => (
                  <Reveal key={personne.nom} delay={rang * 70}>
                    <div className={`o-grid o-gap-x-6 o-gap-y-2 o-border-b o-border-stone-200 dark:o-border-stone-800 o-py-7 sm:o-grid-cols-12 ${rang % 2 === 1 ? 'sm:o-pl-12' : ''}`}>
                      <dt className="o-flex o-items-center o-gap-4 sm:o-col-span-12">
                        <img src={personne.image.src} alt={personne.image.alt} width={64} height={64} loading="lazy" className="o-size-14 o-shrink-0 o-rounded-full o-object-cover" />
                        <span className="o-min-w-0">
                          <span className="o-block o-text-2xl o-font-medium o-tracking-tight md:o-text-3xl">{personne.nom}</span>
                          <span className="o-block o-font-serif o-italic o-text-lg" style={{ color: encre() }}>{personne.role}</span>
                        </span>
                      </dt>
                      <dd className="o-m-0 o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400 sm:o-col-span-9">
                        {personne.texte}
                      </dd>
                      <dd className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400 sm:o-col-span-3 sm:o-text-right">
                        {personne.cours}
                      </dd>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* ================= 5. La liste d attente, en verre (Flowstate) ===== */}
        <section id="attente" aria-labelledby="attente-titre" className="o-relative o-isolate o-scroll-mt-24 o-overflow-hidden o-px-6 o-py-24 md:o-py-36" style={nuit('stone')}>
          <Nappe couleurs={[accent(500), accent(300), 'var(--o-palette-stone-700)']} opacite={0.5} />
          <Grain opacite={0.05} />
          <div className="o-relative o-z-20 o-mx-auto o-grid o-max-w-6xl o-gap-12 lg:o-grid-cols-12 lg:o-items-center">
            <div className="lg:o-col-span-5">
              <Indice rang="04">Quand c est complet</Indice>
              <h2 id="attente-titre" className="o-m-0 o-mt-4 o-text-stone-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 4.5vw, 4rem)' }}>
                On ne pousse pas les murs. On vous appelle.
              </h2>
              <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-stone-300">
                Quand un tapis se libere, la premiere personne de la liste recoit un message et a deux heures pour repondre. Puis la suivante.
              </p>
            </div>

            <GlassSurface colors={['--o-vitrine-300', '--o-palette-white']} blur={22} tint={0.1} thickness={1.2} className="o-rounded-3xl o-p-6 o-text-stone-50 md:o-p-8 lg:o-col-span-7">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-300">Liste d attente</p>
              <div role="group" aria-label="Choisir le cours complet" className="o-mt-4 o-flex o-flex-col o-gap-2">
                {COMPLETS.map((e) => {
                  const actif = e.cours.id === attente
                  return (
                    <button
                      key={e.cours.id}
                      type="button"
                      aria-pressed={actif}
                      onClick={() => {
                        setAttente(e.cours.id)
                        setInscrit(false)
                      }}
                      className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-4 o-gap-y-1 o-rounded-xl o-border-w-1 o-px-4 o-py-3 o-text-left o-transition-colors focus:o-ring"
                      style={actif ? { borderColor: encreSurSombre(), backgroundColor: 'color-mix(in oklab, white 10%, transparent)' } : { borderColor: 'color-mix(in oklab, white 20%, transparent)' }}
                    >
                      <span className="o-text-base o-font-medium">{e.cours.titre} <span className="o-text-stone-300">— {e.jour} {e.cours.heure}</span></span>
                      <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-100">{e.cours.attente} devant vous</span>
                    </button>
                  )
                })}
              </div>

              <form
                className="o-mt-6 o-flex o-flex-col o-gap-3 sm:o-flex-row sm:o-items-end"
                onSubmit={(event) => {
                  event.preventDefault()
                  setInscrit(true)
                }}
              >
                <label className="o-block o-grow">
                  <span className="o-sr-only">Votre courriel</span>
                  <input
                    type="email"
                    required
                    placeholder="Votre courriel"
                    className="o-w-full o-border-b o-border-white-20 o-bg-transparent o-py-3 o-text-base o-text-stone-50 focus:o-ring"
                    style={{ borderRadius: 0 }}
                  />
                </label>
                <button type="submit" className="o-inline-flex o-shrink-0 o-items-center o-justify-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-transition-transform hover:o-scale-105 focus:o-ring" style={{ backgroundColor: encreSurSombre(), color: 'var(--o-palette-stone-950)' }}>
                  Me prevenir <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                </button>
              </form>
              <p aria-live="polite" className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-stone-300">
                {inscrit && attendu !== undefined
                  ? `Vous etes ${String(attendu.cours.attente + 1)}e sur la liste de ${attendu.cours.titre}, ${attendu.jour.toLowerCase()} ${attendu.cours.heure}. Nous ecrivons des qu un tapis se libere.`
                  : 'Un seul message, quand un tapis se libere. Rien d autre, jamais.'}
              </p>
            </GlassSurface>
          </div>
        </section>
      </main>

      {/* ================= 6. Le pied : une signature en italique ============ */}
      <footer className="o-mx-auto o-max-w-6xl o-px-6 o-pb-10 o-pt-20 md:o-pt-28">
        <p className="o-m-0 o-font-serif o-italic o-text-stone-950 dark:o-text-stone-50" style={{ fontSize: 'clamp(3.5rem, 10vw, 9rem)', lineHeight: 0.9, letterSpacing: '-0.02em' }}>
          Souffle
        </p>
        <p className="o-m-0 o-mt-6 o-max-w-lg o-font-serif o-italic o-text-xl o-leading-relaxed o-text-stone-600 dark:o-text-stone-400 md:o-text-2xl">
          « Quatorze tapis, pour que je voie chacun. » — Camille Roux, fondatrice
        </p>
        <div className="o-mt-14 o-flex o-flex-wrap o-items-center o-justify-between o-gap-x-8 o-gap-y-3 o-border-t o-border-stone-200 dark:o-border-stone-800 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
          <span>14 rue des Vignoles, Paris 20e — Metro Buzenval</span>
          <a href="mailto:bonjour@souffle.paris" className="o-no-underline o-text-stone-600 dark:o-text-stone-400 hover:o-text-stone-950 dark:hover:o-text-stone-50 focus:o-ring">bonjour@souffle.paris ↗</a>
          <span>Souffle SAS — RCS Paris 890 112 446 — © 2026</span>
        </div>
      </footer>
    </div>
    </Porte>
  )
}
