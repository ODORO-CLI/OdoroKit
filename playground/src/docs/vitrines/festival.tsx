/**
 * Rivage — festival de musique.
 *
 * ## Le parti pris : une affiche placardee
 *
 * La page n est pas une landing, c est une affiche. Le nom en tres gros, les
 * dates, puis les noms des artistes qui **tombent en pluie**, chaque rang plus
 * petit que le precedent — la taille dit le rang, comme sur un papier colle sur
 * une palissade. Derriere, un eclat prismatique, seul contexte WebGL de la page.
 *
 * ## Ce que la page fait, et pas seulement ce qu elle montre
 *
 * Les trois soirees s **empilent** au defilement, une carte de papier par
 * soir, et chacune calcule ses chevauchements : trois scenes qui tournent en
 * parallele produisent des choix, et c est ce qu un festivalier vient chercher.
 * La billetterie est une **barre fixee en bas de l ecran** : la formule
 * choisie y montre son prix, ce qu il en reste, et sa jauge.
 *
 * ## Pourquoi cette page n obeit pas au theme
 *
 * Une affiche ne change pas de couleur parce qu il fait nuit : le noir, les
 * aplats d accent et le papier des cartes sont les memes dans les deux themes.
 * Chaque encre porte donc son jumeau `dark:`, et l accent vient de trois roles
 * surs quelle que soit la couleur choisie dans la barre : {@link CLAIR} sur le
 * noir, {@link PALE} pour les mentions, {@link PROFOND} sous une encre claire.
 *
 * ## Les chiffres
 *
 * Aucune barre de nombres : les jauges des trois scenes sont posees sur leurs
 * photographies, en bichromie, la ou l on regarde.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, Ticket, TriangleAlert } from '@odoro-cli/icons/outline'
import { useMotionState } from '@odoro-cli/engine'
import { useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { PrismaticBurst } from '@/odoro/background/PrismaticBurst.jsx'
import { Duotone } from '@/odoro/image/Duotone.jsx'
import { StickyStack } from '@/odoro/section/StickyStack.jsx'
import { FallingText } from '@/odoro/text/FallingText.jsx'

import { photo } from './media.js'
import { accent, encreSurSombre } from './palettes.js'
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
  usePolices,
  usePret,
} from './marche.jsx'
import { Bandeau, Parallaxe } from './scene.jsx'

/** La nuance claire de l accent : le grand titre, les aplats vifs, les liens. */
const CLAIR = encreSurSombre()

/** La nuance la plus claire employee, pour les mentions secondaires sur noir. */
const PALE = accent(200)

/** La nuance profonde : les aplats qui portent une encre claire. */
const PROFOND = accent(900)

/** Un accent adouci vers le noir de l affiche, pour les filets et les rails. */
function surNoir(part: number): string {
  return `color-mix(in oklab, ${CLAIR} ${String(part)}%, var(--o-palette-zinc-950))`
}

/** Le degrade qui rend le sommet lisible : le haut assombri, le foyer visible en bas. */
const VOILE =
  'linear-gradient(to top, color-mix(in oklab, #09090b 20%, transparent) 0%, color-mix(in oklab, #09090b 50%, transparent) 42%, color-mix(in oklab, #09090b 85%, transparent) 100%)'

/** Les renvois de la barre en coins. */
const NAVIGATION = [
  ['#programme', 'Programme'],
  ['#scenes', 'Scenes'],
  ['#pratique', 'Pratique'],
] as const

/** L affiche, du plus gros au plus petit : la taille dit le rang. */
const AFFICHE: readonly { readonly taille: string; readonly noms: readonly string[] }[] =
  [
    { taille: 'clamp(2.25rem, 6.5vw, 6rem)', noms: ['Fracture'] },
    {
      taille: 'clamp(1.5rem, 4.2vw, 4rem)',
      noms: ['Nilufer Kant', 'Les Derniers Trains'],
    },
    {
      taille: 'clamp(1.125rem, 2.8vw, 2.5rem)',
      noms: ['Okapi Sound System', 'Margot Veyrier', 'Klaxon 9', 'Sable Noir'],
    },
    {
      taille: 'clamp(0.95rem, 1.9vw, 1.6rem)',
      noms: [
        'Bertille',
        'Cargo Tropical',
        'Le Grand Huit',
        'Nadja Prim',
        'Tourbe',
        'Vent Debout',
      ],
    },
    {
      taille: 'clamp(0.8rem, 1.25vw, 1.05rem)',
      noms: [
        'Amande Sauvage',
        'Basile Ferrer',
        'Chien de Casse',
        'Dune Blanche',
        'Etale',
        'Fanfare du 44',
        'Gravier',
        'Hublot',
        'Ipso',
        'Jetee Sud',
        'Kermesse',
        'Lisiere',
      ],
    },
  ]

/**
 * Un creneau de la grille horaire.
 *
 * L heure est une quantite, pas une chaine : c est ce qui permet de calculer
 * les chevauchements. Elle compte les minutes depuis minuit et depasse
 * vingt-quatre heures apres minuit — un concert de 01h00 vaut 1500.
 */
interface Creneau {
  readonly artiste: string
  readonly genre: string
  readonly debut: number
  readonly duree: number
}

/** Une scene, pour une journee donnee. */
interface Scene {
  readonly nom: string
  readonly lieu: string
  readonly jauge: string
  readonly creneaux: readonly Creneau[]
}

/** Une journee du festival. */
interface Journee {
  readonly id: string
  readonly libelle: string
  readonly date: string
  readonly dateIso: string
  readonly scenes: readonly Scene[]
}

/** Les trois scenes, decrites une fois : elles ne changent pas d un soir a l autre. */
const LIEUX = {
  digue: {
    nom: 'Grande Digue',
    lieu: 'Face a la mer, sur le sable',
    jauge: '8 000 places',
  },
  hangar: { nom: 'Hangar 12', lieu: 'Ancienne halle a grains', jauge: '2 400 places' },
  cale: { nom: 'Cale Seche', lieu: 'Bassin nord, debout', jauge: '900 places' },
} as const

/** Les scenes en photographie, avec le chiffre pose dessus. */
const SCENES = [
  {
    ...LIEUX.digue,
    nombre: '8 000',
    graine: 'rivage-plage',
    alt: 'Un groupe sur la Grande Digue, de nuit, devant la foule',
    colonnes: 'md:o-col-span-7',
    ratio: 1.6,
    vitesse: 0.13,
    glisse: 0.6,
    decalage: '0rem',
  },
  {
    ...LIEUX.hangar,
    nombre: '2 400',
    graine: 'cale-scene',
    alt: 'La scene du Hangar 12 sous ses guirlandes rouges, avant l ouverture des portes',
    colonnes: 'md:o-col-span-5',
    ratio: 1.14,
    vitesse: -0.12,
    glisse: 0.8,
    decalage: 'clamp(0rem, 3vw, 3.5rem)',
  },
  {
    ...LIEUX.cale,
    nombre: '900',
    graine: 'cale-console',
    alt: 'La console de la Cale Seche, face a la scene',
    colonnes: 'md:o-col-span-8 md:o-col-start-5',
    ratio: 2.4,
    vitesse: 0.2,
    glisse: 0.72,
    decalage: 'clamp(0rem, 4vw, 4.5rem)',
  },
] as const

/** Le programme des trois soirees, scene par scene. */
const PROGRAMME: readonly Journee[] = [
  {
    id: 'jeudi',
    libelle: 'Jeudi 8',
    date: '8 juillet 2027',
    dateIso: '2027-07-08',
    scenes: [
      {
        ...LIEUX.digue,
        creneaux: [
          { artiste: 'Hublot', genre: 'Chanson', debut: 1110, duree: 55 },
          { artiste: 'Margot Veyrier', genre: 'Pop', debut: 1200, duree: 70 },
          { artiste: 'Les Derniers Trains', genre: 'Rock', debut: 1305, duree: 80 },
          { artiste: 'Fracture', genre: 'Techno', debut: 1410, duree: 90 },
        ],
      },
      {
        ...LIEUX.hangar,
        creneaux: [
          { artiste: 'Ipso', genre: 'Electro', debut: 1155, duree: 55 },
          { artiste: 'Klaxon 9', genre: 'Punk', debut: 1260, duree: 70 },
          { artiste: 'Okapi Sound System', genre: 'Dub', debut: 1365, duree: 80 },
          { artiste: 'Gravier', genre: 'Noise', debut: 1470, duree: 70 },
        ],
      },
      {
        ...LIEUX.cale,
        creneaux: [
          { artiste: 'Etale', genre: 'Ambient', debut: 1230, duree: 60 },
          { artiste: 'Tourbe', genre: 'Drone', debut: 1335, duree: 75 },
          { artiste: 'Kermesse', genre: 'Fanfare', debut: 1500, duree: 90 },
        ],
      },
    ],
  },
  {
    id: 'vendredi',
    libelle: 'Vendredi 9',
    date: '9 juillet 2027',
    dateIso: '2027-07-09',
    scenes: [
      {
        ...LIEUX.digue,
        creneaux: [
          { artiste: 'Jetee Sud', genre: 'Folk', debut: 1110, duree: 55 },
          { artiste: 'Cargo Tropical', genre: 'Afrobeat', debut: 1200, duree: 70 },
          { artiste: 'Nilufer Kant', genre: 'Pop', debut: 1305, duree: 80 },
          { artiste: 'Sable Noir', genre: 'Post-punk', debut: 1410, duree: 90 },
        ],
      },
      {
        ...LIEUX.hangar,
        creneaux: [
          { artiste: 'Amande Sauvage', genre: 'Chanson', debut: 1155, duree: 55 },
          { artiste: 'Bertille', genre: 'Pop', debut: 1260, duree: 70 },
          { artiste: 'Le Grand Huit', genre: 'Rap', debut: 1365, duree: 80 },
          { artiste: 'Lisiere', genre: 'House', debut: 1470, duree: 70 },
        ],
      },
      {
        ...LIEUX.cale,
        creneaux: [
          { artiste: 'Basile Ferrer', genre: 'Piano', debut: 1230, duree: 60 },
          { artiste: 'Dune Blanche', genre: 'Ambient', debut: 1335, duree: 75 },
          { artiste: 'Chien de Casse', genre: 'Hardcore', debut: 1500, duree: 90 },
        ],
      },
    ],
  },
  {
    id: 'samedi',
    libelle: 'Samedi 10',
    date: '10 juillet 2027',
    dateIso: '2027-07-10',
    scenes: [
      {
        ...LIEUX.digue,
        creneaux: [
          { artiste: 'Fanfare du 44', genre: 'Fanfare', debut: 1080, duree: 50 },
          { artiste: 'Vent Debout', genre: 'Rock', debut: 1185, duree: 70 },
          { artiste: 'Nadja Prim', genre: 'Soul', debut: 1290, duree: 80 },
          { artiste: 'Fracture', genre: 'Techno', debut: 1395, duree: 105 },
        ],
      },
      {
        ...LIEUX.hangar,
        creneaux: [
          { artiste: 'Kermesse', genre: 'Fanfare', debut: 1155, duree: 55 },
          { artiste: 'Okapi Sound System', genre: 'Dub', debut: 1260, duree: 70 },
          { artiste: 'Klaxon 9', genre: 'Punk', debut: 1365, duree: 80 },
          { artiste: 'Ipso', genre: 'Electro', debut: 1470, duree: 70 },
        ],
      },
      {
        ...LIEUX.cale,
        creneaux: [
          { artiste: 'Gravier', genre: 'Noise', debut: 1230, duree: 60 },
          { artiste: 'Etale', genre: 'Ambient', debut: 1335, duree: 75 },
          { artiste: 'Tourbe', genre: 'Drone', debut: 1500, duree: 90 },
        ],
      },
    ],
  },
]

/** L heure d un creneau, lisible. */
function heure(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}`
}

/** Un chevauchement releve entre deux scenes. */
interface Chevauchement {
  readonly artiste: string
  readonly scene: string
  readonly minutes: number
}

/**
 * Ce qu un creneau oblige a manquer ailleurs.
 *
 * On ne compare qu avec les autres scenes : deux creneaux d une meme scene se
 * suivent par construction.
 */
function chevauchements(
  jour: Journee,
  scene: Scene,
  creneau: Creneau,
): readonly Chevauchement[] {
  const releve: Chevauchement[] = []
  for (const autre of jour.scenes) {
    if (autre.nom === scene.nom) continue
    for (const candidat of autre.creneaux) {
      const debut = Math.max(creneau.debut, candidat.debut)
      const fin = Math.min(creneau.debut + creneau.duree, candidat.debut + candidat.duree)
      if (fin > debut)
        releve.push({ artiste: candidat.artiste, scene: autre.nom, minutes: fin - debut })
    }
  }
  return releve.sort((a, b) => b.minutes - a.minutes)
}

/** Le nombre de creneaux d une soiree qui en croisent un autre. */
function nombreDeConflits(jour: Journee): number {
  let total = 0
  for (const scene of jour.scenes) {
    for (const creneau of scene.creneaux) {
      if (chevauchements(jour, scene, creneau).length > 0) total += 1
    }
  }
  return total
}

/** Une formule de billetterie. */
interface Formule {
  readonly cle: string
  readonly nom: string
  readonly prix: string
  readonly note: string
  /** Places mises en vente, et places encore libres : la jauge en depend. */
  readonly quota: number
  readonly restant: number
  readonly unite: string
}

/** Les quatre formules mises en vente. */
const FORMULES: readonly Formule[] = [
  {
    cle: 'soiree',
    nom: 'Soiree',
    prix: '42 EUR',
    note: 'Une seule soiree, navette retour comprise.',
    quota: 4000,
    restant: 1240,
    unite: 'places sur le jeudi',
  },
  {
    cle: 'trois',
    nom: 'Trois jours',
    prix: '96 EUR',
    note: 'Les trois soirees, navettes illimitees, entree prioritaire.',
    quota: 6000,
    restant: 3100,
    unite: 'places',
  },
  {
    cle: 'camping',
    nom: 'Trois jours + camping',
    prix: '134 EUR',
    note: 'Emplacement sur la dune est, du 7 au 11 juillet.',
    quota: 600,
    restant: 480,
    unite: 'emplacements',
  },
  {
    cle: 'benevole',
    nom: 'Benevole',
    prix: '0 EUR',
    note: 'Trois vacations de quatre heures, camping et repas compris.',
    quota: 210,
    restant: 136,
    unite: 'postes ouverts',
  },
]

/** Ce qui s applique a toute commande, quelle que soit la formule. */
const CONDITIONS: readonly (readonly [string, string])[] = [
  [
    'Frais',
    '2,50 EUR par commande. Aucun frais au guichet, ouvert le 5 juillet a la Maison du Peuple.',
  ],
  ['Paiement', 'En une fois, ou en trois mensualites sans frais des 90 EUR.'],
  [
    'Tarif reduit',
    '12 EUR de moins sur justificatif : moins de dix-huit ans, etudiant, demandeur d emploi, AAH.',
  ],
  [
    'Revente',
    'Billet nominatif, revendable au prix d achat sur la bourse officielle jusqu a la veille a midi.',
  ],
  ['Annulation', 'Rembourse integralement jusqu au 1er juin, frais compris.'],
  [
    'Groupes',
    'Des dix billets, 8 EUR de moins par personne : groupes@rivage-festival.fr.',
  ],
]

/** Comment venir, ou dormir, quand ca ouvre. */
const REPERES: readonly (readonly [string, string])[] = [
  [
    'Le lieu',
    'Plage du Chatelet, boulevard de la Republique, 44600 Saint-Nazaire. Entree unique par la digue est.',
  ],
  [
    'En train',
    'Gare a deux kilometres. Trois TER supplementaires depuis Nantes chaque soir, dernier retour a 2h40.',
  ],
  [
    'Navettes',
    'Toutes les douze minutes depuis la gare, de 16h a 2h30. Comprises dans le billet.',
  ],
  ['A velo', 'Huit cents arceaux gardes a l entree ouest, gratuits.'],
  [
    'Camping',
    'Du 7 juillet 14h au 11 juillet 12h, sur la dune est. Silence entre 3h et 9h.',
  ],
  [
    'Horaires',
    'Portes a 17h, premier concert a 18h30. Fin des concerts a 2h30, site ferme a 3h30.',
  ],
]

/** Ce que le festival met en place pour que tout le monde entre. */
const ACCESSIBILITE: readonly (readonly [string, string])[] = [
  [
    'Plateformes',
    'Vingt places sur la Grande Digue, huit au Hangar 12. Cheminement stabilise entre les scenes, sans marche.',
  ],
  [
    'Entendre autrement',
    'Quarante gilets vibrants pretes a l accueil. Six concerts interpretes en langue des signes.',
  ],
  [
    'Accompagnement',
    'Billet accompagnateur gratuit sur carte mobilite inclusion. Equipe formee de 17h a 3h.',
  ],
  [
    'Zone de repos',
    'Salle au calme sous la halle, casques anti-bruit, ouverte de 17h a 3h.',
  ],
  [
    'Ecrire',
    'acces@rivage-festival.fr avant le 25 juin. Reponse sous soixante-douze heures, par la personne qui sera sur place.',
  ],
]

/** Les credits des photographies, pour le colophon. */
const CREDITS: readonly (readonly [string, string])[] = [
  ['Grande Digue', 'Shixart1985, CC BY 2.0'],
  ['Hangar 12', 'Infrogmation of New Orleans, CC BY-SA 3.0'],
  ['Cale Seche', 'Cashlee69, CC BY-SA 4.0'],
]

/**
 * Un rang de l affiche, qui tombe en pluie a travers le rideau.
 *
 * La chute ne part qu une fois le rideau parti : avant, le texte est monte
 * invisible, pour que la pluie ne tombe pas derriere la porte.
 */
function Pluie({
  noms,
  taille,
  delai,
}: {
  readonly noms: readonly string[]
  readonly taille: string
  readonly delai: number
}): ReactElement {
  const pret = usePret()
  const style: CSSProperties = {
    fontSize: taille,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    transitionDelay: `${String(delai)}ms`,
  }
  return (
    <p
      className="o-m-0 o-flex o-flex-wrap o-items-baseline o-justify-center o-gap-x-4 o-gap-y-1 o-font-black o-uppercase md:o-gap-x-6"
      style={style}
    >
      {noms.map((nom, rang) => (
        <span key={nom} className="o-inline-flex o-items-baseline o-gap-4 md:o-gap-6">
          {rang > 0 && (
            <span aria-hidden="true" style={{ color: PALE, fontSize: '0.5em' }}>
              ✦
            </span>
          )}
          {pret ? (
            <FallingText step={22} drop={1.4}>
              {nom}
            </FallingText>
          ) : (
            <span style={{ opacity: 0 }}>{nom}</span>
          )}
        </span>
      ))}
    </p>
  )
}

/** L affiche : le nom, les dates, et les noms qui tombent. */
function Affiche(): ReactElement {
  return (
    <header className="o-relative o-isolate o-overflow-hidden o-text-zinc-50 dark:o-text-zinc-50">
      <div aria-hidden className="o-absolute o-inset-0">
        <PrismaticBurst
          className="o-h-full o-w-full"
          x={0.5}
          y={0.3}
          spokes={12}
          speed={0.35}
          burst={0.9}
          colors={['--o-palette-zinc-950', '--o-vitrine-500', '--o-vitrine-seconde']}
          fallback="o-bg-zinc-950 dark:o-bg-zinc-950"
        />
      </div>
      <div
        aria-hidden
        className="o-absolute o-inset-0"
        style={{ backgroundImage: VOILE }}
      />
      <Grain opacite={0.07} />

      <BarreCoins marque="Rivage" liens={NAVIGATION} droite="8 · 9 · 10 juillet 2027" />

      <div className="o-relative o-z-10 o-mx-auto o-max-w-7xl o-px-4 o-pb-28 o-pt-10 o-text-center md:o-px-6 md:o-pt-14">
        <Surgit>
          <Etiquette>Quatorzieme edition — Plage du Chatelet, Saint-Nazaire</Etiquette>
        </Surgit>
        <Surgit
          delai={120}
          as="h1"
          className="o-m-0 o-mt-6 o-whitespace-nowrap o-uppercase"
          style={{
            ...affiche('xxl', 800),
            fontSize: 'clamp(4.5rem, 20vw, 21rem)',
            lineHeight: 0.82,
            letterSpacing: '-0.06em',
            color: CLAIR,
          }}
        >
          Rivage
        </Surgit>
        <Surgit
          delai={320}
          as="p"
          className="o-m-0 o-mt-4 o-uppercase"
          style={{
            ...affiche('m', 300),
            fontSize: 'clamp(1.5rem, 4vw, 3.5rem)',
            letterSpacing: '-0.02em',
          }}
        >
          8 · 9 · 10 juillet 2027 — trois scenes sur le sable
        </Surgit>

        <div className="o-mx-auto o-mt-14 o-flex o-max-w-5xl o-flex-col o-gap-5 md:o-mt-20 md:o-gap-7">
          {AFFICHE.map((rang, index) => (
            <Pluie
              key={rang.noms.join('-')}
              noms={rang.noms}
              taille={rang.taille}
              delai={index * 120}
            />
          ))}
        </div>

        <Surgit delai={900} className="o-mt-14 o-flex o-justify-center">
          <a
            href="#billetterie"
            className="o-inline-flex o-items-center o-gap-3 o-px-8 o-py-4 o-text-sm o-font-black o-uppercase o-tracking-widest o-text-zinc-950 o-no-underline o-transition-transform hover:o-scale-105 dark:o-text-zinc-950 focus:o-ring"
            style={{ backgroundColor: CLAIR }}
          >
            <Icon icon={Ticket} size={18} aria-hidden="true" />
            Prendre un billet
            <Icon icon={ArrowRight} size={16} aria-hidden="true" />
          </a>
        </Surgit>
      </div>
      <Coin position="bg">
        42 artistes — 3 scenes
        <br />
        Programmation arretee au 3 mars
      </Coin>
      <Coin position="bd">
        Association Rivage
        <br />
        Licence 2-1094427
      </Coin>
    </header>
  )
}

/** La programmation en bandeau : deux rangs de noms geants, en sens contraires. */
function Bandeaux(): ReactElement {
  const pleins = [
    ...(AFFICHE[0]?.noms ?? []),
    ...(AFFICHE[1]?.noms ?? []),
    ...(AFFICHE[2]?.noms ?? []),
  ]
  const creux = [...(AFFICHE[3]?.noms ?? []), ...(AFFICHE[4]?.noms ?? [])]
  return (
    <section
      aria-label="Les artistes de l edition, en bandeau"
      className="o-overflow-hidden o-border-t o-border-b o-py-6"
      style={{ borderColor: surNoir(40) }}
    >
      <Bandeau
        mots={pleins}
        separateur="✦"
        vitesse={40}
        taille="clamp(3rem, 9vw, 9rem)"
        className="o-font-black o-uppercase"
        style={{ color: CLAIR, letterSpacing: '-0.05em' }}
      />
      <Bandeau
        mots={creux}
        separateur="✦"
        vitesse={30}
        inverse
        taille="clamp(2.25rem, 6.5vw, 6.5rem)"
        className="o-mt-4 o-font-black o-uppercase"
        style={{
          color: 'transparent',
          WebkitTextStroke: `1.5px ${PALE}`,
          letterSpacing: '-0.04em',
        }}
      />
    </section>
  )
}

/** Une scene en photographie, bichrome, la jauge posee dessus. */
function ScenePhoto({
  scene,
}: {
  readonly scene: (typeof SCENES)[number]
}): ReactElement {
  return (
    // La photo derive, et continue de couler apres l arret de la molette : une
    // affiche placardee bat au vent, elle ne se fige pas avec le doigt.
    <Parallaxe
      as="figure"
      vitesse={scene.vitesse}
      glisse={scene.glisse}
      className={`o-relative o-m-0 o-min-w-0 ${scene.colonnes}`}
      style={{ marginTop: scene.decalage }}
    >
      <Duotone
        src={photo(scene.graine, 1400, 900)}
        alt={scene.alt}
        ratio={scene.ratio}
        shadow={PROFOND}
        light={PALE}
        strength={0.95}
        className="o-w-full"
      />
      <figcaption
        className="o-pointer-events-none o-absolute o-inset-0 o-flex o-flex-col o-justify-between o-p-5 o-text-zinc-50 dark:o-text-zinc-50 md:o-p-7"
        style={{
          background:
            'linear-gradient(to top, rgba(9,9,11,0.85) 0%, rgba(9,9,11,0.2) 45%, transparent 70%)',
        }}
      >
        <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-200 dark:o-text-zinc-200">
          {scene.lieu}
        </span>
        <span>
          <span
            className="o-block o-tabular-nums"
            style={{
              ...affiche('l', 800),
              fontSize: 'clamp(3rem, 8vw, 8rem)',
              lineHeight: 0.9,
              color: CLAIR,
            }}
          >
            {scene.nombre}
          </span>
          <span className="o-mt-2 o-block o-text-lg o-font-black o-uppercase o-tracking-tight md:o-text-2xl">
            places — {scene.nom}
          </span>
        </span>
      </figcaption>
    </Parallaxe>
  )
}

/** Un creneau, avec ce qu il oblige a manquer ailleurs. */
function Ligne({
  jour,
  scene,
  creneau,
}: {
  readonly jour: Journee
  readonly scene: Scene
  readonly creneau: Creneau
}): ReactElement {
  const croises = chevauchements(jour, scene, creneau)
  return (
    <li className="o-border-t o-border-zinc-300 o-py-3 dark:o-border-zinc-300">
      <div className="o-flex o-items-baseline o-gap-4">
        <span
          className="o-w-14 o-shrink-0 o-font-mono o-text-sm o-font-bold o-tabular-nums"
          style={{ color: PROFOND }}
        >
          {heure(creneau.debut)}
        </span>
        <span className="o-min-w-0 o-flex-1">
          <span className="o-block o-text-base o-font-black o-uppercase o-tracking-tight">
            {creneau.artiste}
          </span>
          <span className="o-mt-0.5 o-block o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-700 dark:o-text-zinc-700">
            {creneau.genre} · {String(creneau.duree)} min · fin{' '}
            {heure(creneau.debut + creneau.duree)}
          </span>
        </span>
      </div>
      {croises.length > 0 && (
        <p className="o-m-0 o-mt-2 o-flex o-items-start o-gap-2 o-text-xs o-text-zinc-700 dark:o-text-zinc-700">
          <span aria-hidden className="o-mt-0.5 o-shrink-0" style={{ color: PROFOND }}>
            <Icon icon={TriangleAlert} size={13} />
          </span>
          <span>
            <span className="o-font-bold o-uppercase o-tracking-wider">Chevauche</span>{' '}
            {croises
              .map(
                (croise) =>
                  `${croise.artiste} (${croise.scene}, ${String(croise.minutes)} min)`,
              )
              .join(' · ')}
          </span>
        </p>
      )}
    </li>
  )
}

/** Une soiree : une carte de papier, qui s empile sur la precedente. */
function Soiree({
  jour,
  rang,
}: {
  readonly jour: Journee
  readonly rang: number
}): ReactElement {
  const conflits = nombreDeConflits(jour)
  const creneaux = jour.scenes.reduce((somme, scene) => somme + scene.creneaux.length, 0)
  return (
    <article
      className="o-bg-zinc-50 o-p-6 o-text-zinc-950 o-shadow-2xl dark:o-bg-zinc-50 dark:o-text-zinc-950 md:o-p-10"
      style={{ borderTop: `8px solid ${CLAIR}` }}
    >
      <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-x-8 o-gap-y-3">
        <div>
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-700 dark:o-text-zinc-700">
            Soiree {String(rang + 1)} sur 3 —{' '}
            <time dateTime={jour.dateIso}>{jour.date}</time>
          </p>
          <h3
            className="o-m-0 o-mt-2 o-uppercase"
            style={{
              ...affiche('l', 800),
              fontSize: 'clamp(2.5rem, 7vw, 6.5rem)',
              letterSpacing: '-0.05em',
            }}
          >
            {jour.libelle}
          </h3>
        </div>
        <p
          className="o-m-0 o-max-w-xs o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest"
          style={{ color: PROFOND }}
        >
          {String(conflits)} des {String(creneaux)} creneaux en croisent un autre :
          choisir, c est manquer.
        </p>
      </div>

      <div className="o-mt-8 o-grid o-gap-8 md:o-grid-cols-3 md:o-gap-10">
        {jour.scenes.map((scene) => (
          <div key={scene.nom}>
            <h4 className="o-m-0 o-text-lg o-font-black o-uppercase o-tracking-tight">
              {scene.nom}
            </h4>
            <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-700 dark:o-text-zinc-700">
              {scene.lieu} — {scene.jauge}
            </p>
            <ul className="o-m-0 o-mt-4 o-flex o-list-none o-flex-col o-p-0">
              {scene.creneaux.map((creneau) => (
                <Ligne
                  key={`${scene.nom}-${String(creneau.debut)}`}
                  jour={jour}
                  scene={scene}
                  creneau={creneau}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  )
}

/** Une colonne de la bande pratique : un titre en mono, des paires terme / texte. */
function Colonne({
  titre,
  lignes,
}: {
  readonly titre: string
  readonly lignes: readonly (readonly [string, string])[]
}): ReactElement {
  return (
    <div>
      <h3
        className="o-m-0 o-text-2xl o-font-black o-uppercase o-tracking-tight"
        style={{ color: CLAIR }}
      >
        {titre}
      </h3>
      <dl className="o-m-0 o-mt-5 o-border-t" style={{ borderColor: surNoir(30) }}>
        {lignes.map(([terme, corps]) => (
          <div
            key={terme}
            className="o-border-b o-py-3"
            style={{ borderColor: surNoir(30) }}
          >
            <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-50 dark:o-text-zinc-50">
              {terme}
            </dt>
            <dd className="o-m-0 o-mt-1 o-text-sm o-leading-relaxed o-text-zinc-300 dark:o-text-zinc-300">
              {corps}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/**
 * La barre de billetterie, fixee en bas de l ecran.
 *
 * La formule choisie y montre son prix, ce qu il en reste et sa jauge. Elle
 * n apparait qu une fois le rideau parti, et laisse la page respirer dessous :
 * le pied porte une marge a sa hauteur.
 */
function Billetterie(): ReactElement {
  const pret = usePret()
  const { reduced } = useMotionState()
  const [cle, setCle] = useState<string>('trois')
  const formule = FORMULES.find((f) => f.cle === cle) ?? FORMULES[1]
  if (formule === undefined) return <></>
  const part = Math.round(((formule.quota - formule.restant) / formule.quota) * 100)
  return (
    <div
      id="billetterie"
      role="region"
      aria-label="Billetterie"
      className="o-fixed o-inset-x-0 o-bottom-0 o-z-40 o-px-3 o-pb-3 md:o-px-6 md:o-pb-5"
      style={{
        opacity: pret ? 1 : 0,
        transform: pret || reduced ? 'none' : 'translate3d(0, 24px, 0)',
        transition:
          'opacity 600ms ease 600ms, transform 800ms cubic-bezier(0.16, 1, 0.3, 1) 600ms',
      }}
    >
      <form
        className="o-mx-auto o-flex o-max-w-6xl o-flex-wrap o-items-center o-gap-x-6 o-gap-y-3 o-bg-zinc-950 o-px-4 o-py-3 o-text-zinc-50 dark:o-bg-zinc-950 dark:o-text-zinc-50 md:o-px-6"
        style={{
          border: `2px solid ${CLAIR}`,
          boxShadow: '0 24px 60px -20px rgba(0,0,0,0.8)',
        }}
        onSubmit={(event) => {
          event.preventDefault()
        }}
      >
        <label className="o-flex o-min-w-0 o-items-center o-gap-3">
          <span
            className="o-font-mono o-text-xs o-uppercase o-tracking-widest"
            style={{ color: PALE }}
          >
            Billet
          </span>
          <select
            name="formule"
            value={cle}
            onChange={(event) => {
              setCle(event.currentTarget.value)
            }}
            className="o-min-w-0 o-cursor-pointer o-border-w-1 o-bg-zinc-900 o-px-3 o-py-2 o-text-sm o-font-bold o-uppercase o-tracking-wider o-text-zinc-50 dark:o-bg-zinc-900 dark:o-text-zinc-50 focus:o-ring"
            style={{ borderColor: surNoir(40), borderRadius: 0 }}
          >
            {FORMULES.map((f) => (
              <option key={f.cle} value={f.cle}>
                {f.nom} — {f.prix}
              </option>
            ))}
          </select>
        </label>

        <div className="o-flex o-min-w-0 o-grow o-flex-col o-gap-1" aria-live="polite">
          <div className="o-flex o-flex-wrap o-items-baseline o-gap-x-4 o-gap-y-1">
            <span
              className="o-text-2xl o-font-black o-tracking-tighter md:o-text-3xl"
              style={{ color: CLAIR }}
            >
              {formule.prix}
            </span>
            <span className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-300 dark:o-text-zinc-300">
              il reste {formule.restant.toLocaleString('fr-FR')} {formule.unite} sur{' '}
              {formule.quota.toLocaleString('fr-FR')}
            </span>
          </div>
          <div
            role="img"
            aria-label={`${String(part)} pour cent des ${String(formule.quota)} ${formule.unite} sont pris`}
            className="o-h-1 o-w-full o-max-w-md"
            style={{ backgroundColor: surNoir(22) }}
          >
            <div
              className="o-h-full"
              style={{ width: `${String(part)}%`, backgroundColor: CLAIR }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="o-inline-flex o-cursor-pointer o-items-center o-gap-2 o-px-5 o-py-3 o-text-xs o-font-black o-uppercase o-tracking-widest o-text-zinc-950 o-transition-transform hover:o-scale-105 dark:o-text-zinc-950 focus:o-ring"
          style={{ backgroundColor: CLAIR }}
        >
          <Icon icon={Ticket} size={16} aria-hidden="true" />
          Reserver
        </button>
      </form>
    </div>
  )
}

/** Un titre de section, sur le noir de l affiche. */
function Titre({
  rang,
  surtitre,
  children,
}: {
  readonly rang: string
  readonly surtitre: string
  readonly children: ReactNode
}): ReactElement {
  return (
    <div>
      <Indice rang={rang}>{surtitre}</Indice>
      <h2
        className="o-m-0 o-mt-5 o-uppercase o-text-zinc-50 dark:o-text-zinc-50"
        style={{
          ...affiche('m', 800),
          fontSize: 'clamp(2.25rem, 6vw, 5.5rem)',
          letterSpacing: '-0.05em',
        }}
      >
        {children}
      </h2>
    </div>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('grotesk')
  return (
    <Porte forme="lettres" marque="Rivage">
      <div
        className="o-bg-zinc-950 o-text-zinc-50 dark:o-bg-zinc-950 dark:o-text-zinc-50"
        style={polices}
      >
        <Affiche />

        <main>
          <Bandeaux />

          {/* ================= (01) Les scenes, chiffres poses sur les photos ===== */}
          <section
            id="scenes"
            className="o-scroll-mt-24 o-px-4 o-py-20 md:o-px-6 md:o-py-28"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-6 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Titre rang="01" surtitre="Trois scenes">
                    Le sable, la halle, le bassin.
                  </Titre>
                </div>
                <p className="o-m-0 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-300 dark:o-text-zinc-300 md:o-col-span-5 md:o-justify-self-end">
                  Trois jauges, trois manieres d ecouter : debout dans le sable, sous une
                  charpente, ou a cent dans une cale.
                </p>
              </div>
              <div className="o-mt-12 o-grid o-gap-4 md:o-grid-cols-12 md:o-items-start md:o-gap-6">
                {SCENES.map((scene) => (
                  <ScenePhoto key={scene.nom} scene={scene} />
                ))}
              </div>
            </div>
          </section>

          {/* ================= (02) Les trois soirees, empilees ================= */}
          <section
            id="programme"
            className="o-scroll-mt-24 o-px-4 o-pb-24 o-pt-8 md:o-px-6 md:o-pb-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-6 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Titre rang="02" surtitre="Le programme">
                    Trois soirees, qui s empilent.
                  </Titre>
                </div>
                <p className="o-m-0 o-max-w-sm o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 dark:o-text-zinc-400 md:o-col-span-5 md:o-justify-self-end">
                  Horaires arretes le 3 mars 2027
                  <br />
                  Les changements passent sur les ecrans du hall, jamais par courriel
                </p>
              </div>
              <StickyStack
                className="o-mt-12"
                offset={CHROME + 20}
                gap={18}
                shrink={0.05}
              >
                {PROGRAMME.map((jour, rang) => (
                  <Soiree key={jour.id} jour={jour} rang={rang} />
                ))}
              </StickyStack>
            </div>
          </section>

          {/* ================= (03) Pratique : une bande dense, en mono ============ */}
          <section
            id="pratique"
            className="o-scroll-mt-24 o-border-t o-px-4 o-py-20 md:o-px-6 md:o-py-28"
            style={{
              borderColor: surNoir(40),
              backgroundColor:
                'color-mix(in oklab, var(--o-palette-zinc-950) 92%, white)',
            }}
          >
            <div className="o-mx-auto o-max-w-7xl">
              <Titre rang="03" surtitre="Pratique">
                Venir, dormir, repartir.
              </Titre>
              <div className="o-mt-12 o-grid o-gap-10 md:o-grid-cols-3 md:o-gap-12">
                <Colonne titre="Acces" lignes={REPERES} />
                <Colonne titre="Accessibilite" lignes={ACCESSIBILITE} />
                <Colonne titre="Toute commande" lignes={CONDITIONS} />
              </div>
            </div>
          </section>
        </main>

        {/* ================= Le colophon ====================================== */}
        <footer
          className="o-border-t o-px-4 o-pb-40 o-pt-16 md:o-px-6 md:o-pb-44 md:o-pt-20"
          style={{ borderColor: surNoir(40) }}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <Indice rang="✦">Colophon</Indice>
            <div className="o-mt-8 o-grid o-gap-10 o-font-mono o-text-xs o-uppercase o-leading-loose o-tracking-widest o-text-zinc-300 dark:o-text-zinc-300 md:o-grid-cols-3">
              <div>
                <p className="o-m-0 o-text-zinc-50 dark:o-text-zinc-50">Typographie</p>
                <p className="o-m-0 o-mt-2">
                  Compose en Space Grotesk pour les titres et Space Mono pour ce que vous
                  lisez. Corps de l affiche : 320 points.
                </p>
              </div>
              <div>
                <p className="o-m-0 o-text-zinc-50 dark:o-text-zinc-50">Papier</p>
                <p className="o-m-0 o-mt-2">
                  Affiche tiree en serigraphie deux tons sur Munken Lynx 300 g, atelier
                  Tchikebe, Marseille. 1 200 exemplaires, collees a Saint-Nazaire du 2 au
                  8 mai.
                </p>
              </div>
              <div>
                <p className="o-m-0 o-text-zinc-50 dark:o-text-zinc-50">Photographies</p>
                <ul className="o-m-0 o-mt-2 o-list-none o-p-0">
                  {CREDITS.map(([scene, credit]) => (
                    <li key={scene}>
                      {scene} — {credit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div
              className="o-mt-14 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 dark:o-text-zinc-400"
              style={{ borderColor: surNoir(30) }}
            >
              <p className="o-m-0">
                © 2027 Association Rivage — 12 quai des Marees, 44600 Saint-Nazaire — 02
                40 22 18 07
              </p>
              <ul className="o-m-0 o-flex o-list-none o-flex-wrap o-gap-4 o-p-0">
                {['Mentions legales', 'Confidentialite', 'Presse'].map((l) => (
                  <li key={l}>
                    <a
                      href="#programme"
                      className="o-text-zinc-400 o-no-underline hover:o-underline dark:o-text-zinc-400 focus:o-ring"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </footer>

        <Billetterie />
      </div>
    </Porte>
  )
}
