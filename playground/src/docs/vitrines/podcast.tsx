/**
 * Onde Courte — emission audio.
 *
 * ## Le parti pris : la typographie geante
 *
 * Une emission de radio n a pas de produit a montrer : elle n a qu un nom, et
 * une voix. La page ouvre donc sur ce nom seul, assez gros pour tenir l ecran,
 * dont des echos suivent le pointeur comme une reverberation ; dessous, une
 * ligne qui tourne et l abonnement a la lettre. Aucun appel plus bas : ce que
 * la page demande, elle le demande ici.
 *
 * Le spectre anime reste, parce qu il dit le sujet mieux qu une photographie ;
 * il n est pas noye sous un voile uniforme mais sous un degre d ombre qui suit
 * la page : opaque en haut et en bas, presque transparent derriere le titre.
 *
 * ## Ce que la page fait
 *
 * Le lecteur est un vrai mecanisme : choisir un chapitre deplace la tete de
 * lecture, remplit la forme d onde jusque-la, et remonte l extrait de
 * transcription correspondant. Les archives se filtrent par saison et par
 * invite, et la liste comme la fiche suivent le filtre.
 *
 * ## Le pied
 *
 * Il est fixe derriere la page et se decouvre a la fin, quand le dernier
 * ecran glisse dessus : c est la que vit la navigation du site.
 *
 * ## La couleur
 *
 * Aucune teinte en dur. Les sections qui suivent le theme emploient
 * {@link ENCRE}, un accent tire vers l encre du theme ; les deux blocs qui
 * restent sombres — le heros et le pied — emploient des roles calcules pour
 * fond sombre, lisibles quelle que soit la couleur choisie.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Pause,
  Play,
  Quote,
  Rss,
  SkipBack,
  SkipForward,
} from '@odoro-cli/icons/filaire'
import { useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { AudioBars } from '@/odoro/background/AudioBars.jsx'
import { LogoBand } from '@/odoro/section/LogoBand.jsx'
import { EchoText } from '@/odoro/text/EchoText.jsx'
import { TextLoop } from '@/odoro/text/TextLoop.jsx'
import { AnimatedList } from '@/odoro/ui/AnimatedList.jsx'

import { nuit } from './communs.jsx'
import { portrait } from './media.js'
import { accentDoux, encre, encreSurSombre } from './palettes.js'
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
} from './marche.jsx'
import { PiedColle } from './scene.jsx'

/** Filet tire de l encre courante : le systeme n a pas d opacite sur couleur. */
const FILET = 'color-mix(in oklab, currentColor 18%, transparent)'

/** L accent, tire vers l encre du theme : lisible sur les deux fonds. */
const ENCRE = encre()

/** L accent clair : ce qui s ecrit sur les deux blocs restes sombres. */
const CLAIR = encreSurSombre()

/** L aplat plein d accent, et l encre qui va dessus. */
const PLEIN: CSSProperties = { backgroundColor: ENCRE, color: 'var(--o-theme-bg)' }

/** Le voile du heros : sombre la ou vivent les petits textes, presque absent derriere le titre. */
const VOILE_HEROS =
  'linear-gradient(to bottom, #09090b 0%, color-mix(in oklab, #09090b 86%, transparent) 20%, color-mix(in oklab, #09090b 42%, transparent) 48%, color-mix(in oklab, #09090b 74%, transparent) 76%, #09090b 100%)'

/** Les renvois de la barre en coins. */
const NAVIGATION = [
  ['#dernier', 'Le dernier'],
  ['#episodes', 'Archives'],
  ['#invites', 'Invites'],
] as const

/** Ce que la boucle du heros dit de l emission. */
const PHRASES = [
  'une conversation par semaine',
  'quarante minutes, jamais plus',
  'enregistre a Lyon, sans montage',
  'cent quatre-vingt-douze episodes',
]

/** Un chapitre horodate, avec l extrait de transcription qui lui repond. */
interface Chapitre {
  /** Position dans l episode, en secondes : c est elle qui pilote le lecteur. */
  readonly seconde: number
  readonly titre: string
  readonly extrait: readonly (readonly [string, string])[]
}

/** Un episode publie. */
interface Episode {
  readonly id: string
  readonly numero: number
  readonly saison: number
  readonly titre: string
  readonly invite: string
  readonly metier: string
  readonly date: string
  readonly dateIso: string
  /** Duree en secondes : le lecteur en tire sa forme d onde et son horloge. */
  readonly duree: number
  readonly resume: string
  readonly chapitres: readonly Chapitre[]
}

/** Un temps en minutes et secondes, tel qu un lecteur l affiche. */
function horloge(secondes: number): string {
  const m = Math.floor(secondes / 60)
  const s = Math.floor(secondes % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** Une duree en minutes, telle qu une liste l annonce. */
function minutes(secondes: number): string {
  return `${String(Math.round(secondes / 60))} min`
}

/** Les episodes en ligne, du plus recent au plus ancien. */
const EPISODES: readonly Episode[] = [
  {
    id: 'ep-192',
    numero: 192,
    saison: 5,
    titre: 'Ce que le bruit nous cache',
    invite: 'Salome Ferrand',
    metier: 'Acousticienne, bureau d etudes Sillage',
    date: '4 septembre 2026',
    dateIso: '2026-09-04',
    duree: 2880,
    resume:
      'On mesure le bruit des villes depuis quarante ans, et on continue de construire comme s il n existait pas. Salome Ferrand raconte comment on cartographie un quartier a l oreille.',
    chapitres: [
      {
        seconde: 130,
        titre: 'Ce qu on appelle un decibel, et pourquoi c est trompeur',
        extrait: [
          [
            'Salome Ferrand',
            'Le chiffre qu on publie est une moyenne sur vingt-quatre heures. Une rue a soixante decibels de moyenne, ca ne dit rien : elle peut etre a quarante-cinq toute la journee et a quatre-vingt-dix a chaque passage de bus.',
          ],
          ['Onde Courte', 'Et c est le pic qui reveille.'],
          [
            'Salome Ferrand',
            'C est le pic qui reveille, oui. On dort avec un bruit de fond continu, on ne dort pas avec seize evenements par nuit. La moyenne les efface exactement.',
          ],
        ],
      },
      {
        seconde: 875,
        titre: 'Cartographier une rue en trois passages',
        extrait: [
          [
            'Salome Ferrand',
            'Trois passages : un a six heures, un a quatorze, un a vingt-deux. Vingt minutes chacun, au meme endroit, a un metre cinquante du sol.',
          ],
          ['Onde Courte', 'Pourquoi un metre cinquante ?'],
          [
            'Salome Ferrand',
            'Parce que c est la hauteur d une oreille debout. On mesure ce que les gens entendent, pas ce que la facade recoit. Ce sont deux metiers differents, et on les confond tout le temps.',
          ],
        ],
      },
      {
        seconde: 1780,
        titre: 'Le dossier du boulevard Vivier-Merle',
        extrait: [
          [
            'Salome Ferrand',
            'Cent douze logements, livres en 2019, avec une facade certifiee. On a mesure a l interieur : trente-huit decibels la nuit, fenetres fermees. La norme dit trente.',
          ],
          ['Onde Courte', 'Et ensuite ?'],
          [
            'Salome Ferrand',
            'Ensuite rien pendant deux ans, puis un remplacement des vitrages sur la face nord. Ce qui a bouge, ce n est pas notre rapport, c est le fait qu une locataire l a lu et l a apporte a une audience.',
          ],
        ],
      },
      {
        seconde: 2462,
        titre: 'Ce qu on saurait faire, et ce qu on ne fait pas',
        extrait: [
          [
            'Salome Ferrand',
            'On sait poser un enrobe qui retire trois decibels. On sait dessiner une cour qui ne renvoie pas. On sait ou mettre les chambres. Rien de tout cela ne coute cher si on le decide avant le permis.',
          ],
          ['Onde Courte', 'Et apres le permis ?'],
          [
            'Salome Ferrand',
            'Apres, ca coute dix fois plus, et on ne le fait pas. C est toute l histoire du metier en une phrase.',
          ],
        ],
      },
    ],
  },
  {
    id: 'ep-191',
    numero: 191,
    saison: 5,
    titre: 'Reparer un ascenseur de 1962',
    invite: 'Yanis Doucet',
    metier: 'Ascensoriste, atelier Doucet et fils',
    date: '28 aout 2026',
    dateIso: '2026-08-28',
    duree: 2580,
    resume:
      'Il reste trois cents cabines a relais electromecaniques en France, et une poignee de gens qui savent les remettre en marche. Yanis Doucet est l un d eux.',
    chapitres: [
      { seconde: 105, titre: 'Une cabine, un carnet, quarante ans', extrait: [] },
      { seconde: 740, titre: 'Les pieces qu on refait soi-meme', extrait: [] },
      {
        seconde: 1615,
        titre: 'Ce que la norme impose, et ce qu elle interdit',
        extrait: [],
      },
      { seconde: 2290, titre: 'Transmettre a deux apprentis', extrait: [] },
    ],
  },
  {
    id: 'ep-190',
    numero: 190,
    saison: 5,
    titre: 'La derniere fonderie de cloches',
    invite: 'Anne-Claire Bassot',
    metier: 'Fondeuse de cloches, Villedieu',
    date: '21 aout 2026',
    dateIso: '2026-08-21',
    duree: 3060,
    resume:
      'Une cloche se coule une fois : si la note est fausse, on recommence tout. Anne-Claire Bassot raconte le moule en argile, l attente de trois semaines, et la minute ou l on frappe pour savoir.',
    chapitres: [
      { seconde: 185, titre: 'Le moule et le fumier de cheval', extrait: [] },
      { seconde: 1060, titre: 'Accorder au tour, un millimetre a la fois', extrait: [] },
      { seconde: 1995, titre: 'La commande de Saint-Jean-de-Luz', extrait: [] },
      { seconde: 2790, titre: 'Ce que coute une erreur', extrait: [] },
    ],
  },
  {
    id: 'ep-189',
    numero: 189,
    saison: 5,
    titre: 'Compter les oiseaux au son',
    invite: 'Mathias Ohl',
    metier: 'Ornithologue, parc des Cevennes',
    date: '14 aout 2026',
    dateIso: '2026-08-14',
    duree: 2340,
    resume:
      'Trois cents micros poses dans les Cevennes, huit mille heures d enregistrement, et un modele qui trie. Mathias Ohl explique ce que la machine entend mieux que lui, et les deux choses qu elle rate toujours.',
    chapitres: [
      { seconde: 150, titre: 'Poser un micro pour six mois', extrait: [] },
      { seconde: 910, titre: 'Ce que la machine confond', extrait: [] },
      { seconde: 1665, titre: 'Le retour du bruant ortolan', extrait: [] },
      { seconde: 2060, titre: 'Publier des donnees que personne ne relit', extrait: [] },
    ],
  },
  {
    id: 'ep-188',
    numero: 188,
    saison: 5,
    titre: 'Un metro sans conducteur, la nuit',
    invite: 'Fatou Berthelot',
    metier: 'Regulatrice, reseau urbain',
    date: '7 aout 2026',
    dateIso: '2026-08-07',
    duree: 2760,
    resume:
      'Entre une heure et cinq heures du matin, une ligne automatique appartient a quinze personnes dans une salle sans fenetre. Fatou Berthelot decrit une nuit ordinaire, et les six minutes ou tout se decide.',
    chapitres: [
      { seconde: 80, titre: 'La releve de vingt-deux heures', extrait: [] },
      { seconde: 830, titre: 'Ce qu on voit sur le mur d ecrans', extrait: [] },
      { seconde: 1685, titre: 'La panne du 12 mars', extrait: [] },
      { seconde: 2415, titre: 'Rentrer chez soi a six heures', extrait: [] },
    ],
  },
  {
    id: 'ep-187',
    numero: 187,
    saison: 5,
    titre: 'Traduire un roman qu on n aime pas',
    invite: 'Pierre Vasseur',
    metier: 'Traducteur litteraire',
    date: '31 juillet 2026',
    dateIso: '2026-07-31',
    duree: 2640,
    resume:
      'Neuf mois sur un livre qu on trouve mauvais : Pierre Vasseur raconte le metier par son cote le moins glorieux, et pourquoi la fidelite au texte est parfois une forme de politesse.',
    chapitres: [
      { seconde: 175, titre: 'Accepter, ou refuser et ne plus manger', extrait: [] },
      { seconde: 990, titre: 'Les vingt pages qui decident du ton', extrait: [] },
      { seconde: 1800, titre: 'Se disputer avec l editeur', extrait: [] },
      { seconde: 2385, titre: 'Signer quand meme', extrait: [] },
    ],
  },
  {
    id: 'ep-174',
    numero: 174,
    saison: 4,
    titre: 'Tenir un phare en 2025',
    invite: 'Ozan Kirmizi',
    metier: 'Gardien de phare, Cordouan',
    date: '12 decembre 2025',
    dateIso: '2025-12-12',
    duree: 2700,
    resume:
      'Le dernier phare habite de France tient par deux personnes qui se relaient quinze jours durant. Ozan Kirmizi raconte l eau douce comptee, la lanterne a remonter a la main, et les visiteurs de juillet.',
    chapitres: [
      { seconde: 140, titre: 'Quinze jours, deux cents litres d eau', extrait: [] },
      { seconde: 900, titre: 'La lanterne, l hiver', extrait: [] },
      { seconde: 1980, titre: 'Ce qu on repare seul', extrait: [] },
    ],
  },
  {
    id: 'ep-168',
    numero: 168,
    saison: 4,
    titre: 'Le dernier atelier de moules a chocolat',
    invite: 'Solange Petit',
    metier: 'Fondeuse d etain, atelier Petit',
    date: '24 octobre 2025',
    dateIso: '2025-10-24',
    duree: 2460,
    resume:
      'Quatre cents moules au catalogue, tous graves a la main entre 1890 et 1960. Solange Petit explique pourquoi on ne redessine pas un lapin, et ce qu il faut savoir pour demouler sans casser.',
    chapitres: [
      { seconde: 120, titre: 'Un catalogue de 1911, toujours en service', extrait: [] },
      { seconde: 840, titre: 'Etamer, polir, verifier', extrait: [] },
      { seconde: 1740, titre: 'Les commandes de Noel, commencees en mai', extrait: [] },
    ],
  },
  {
    id: 'ep-161',
    numero: 161,
    saison: 4,
    titre: 'Compter les trains a la main',
    invite: 'Renaud Sisco',
    metier: 'Regulateur, poste de Longueau',
    date: '5 septembre 2025',
    dateIso: '2025-09-05',
    duree: 2820,
    resume:
      'Un poste d aiguillage mecanique de 1937, quarante-deux leviers, et deux cents circulations par jour. Renaud Sisco raconte la memoire qu il faut, et ce qui arrive quand elle flanche.',
    chapitres: [
      { seconde: 165, titre: 'Quarante-deux leviers, un tableau', extrait: [] },
      { seconde: 1020, titre: 'Ce qu on note, ce qu on retient', extrait: [] },
      { seconde: 2100, titre: 'Le jour ou le tableau s est eteint', extrait: [] },
    ],
  },
  {
    id: 'ep-142',
    numero: 142,
    saison: 3,
    titre: 'Trois cents kilos de pain par nuit',
    invite: 'Nour Belkacem',
    metier: 'Boulangere, fournil de la Croix-Rousse',
    date: '15 novembre 2024',
    dateIso: '2024-11-15',
    duree: 2640,
    resume:
      'De vingt-trois heures a sept heures, seule, avec un levain qui n attend pas. Nour Belkacem decrit une nuit entiere, minute par minute, et le calcul qu elle refait chaque soir.',
    chapitres: [
      { seconde: 130, titre: 'Le levain rafraichi a vingt-trois heures', extrait: [] },
      { seconde: 960, titre: 'Quatre fournees, une seule chambre', extrait: [] },
      { seconde: 1920, titre: 'Vendre, ou jeter', extrait: [] },
    ],
  },
  {
    id: 'ep-133',
    numero: 133,
    saison: 3,
    titre: 'Reparer un orgue de tribune',
    invite: 'Emile Ruff',
    metier: 'Facteur d orgues, Wasselonne',
    date: '6 septembre 2024',
    dateIso: '2024-09-06',
    duree: 3360,
    resume:
      'Deux mille cinq cents tuyaux, dix-huit mois de chantier, et une soufflerie qui date de 1783. Emile Ruff raconte un demontage complet, piece par piece, et l accord final devant une nef vide.',
    chapitres: [
      { seconde: 200, titre: 'Demonter deux mille cinq cents tuyaux', extrait: [] },
      { seconde: 1260, titre: 'La soufflerie de 1783', extrait: [] },
      { seconde: 2640, titre: 'Accorder une nef vide, en janvier', extrait: [] },
    ],
  },
  {
    id: 'ep-127',
    numero: 127,
    saison: 3,
    titre: 'La derniere ligne telegraphique',
    invite: 'Colette Vanier',
    metier: 'Technicienne reseau, retraitee',
    date: '12 juillet 2024',
    dateIso: '2024-07-12',
    duree: 2280,
    resume:
      'Une liaison en morse a tenu jusqu en 1997 sur une ligne de montagne, parce que rien d autre ne passait. Colette Vanier l a entretenue quinze ans, et garde le carnet des derniers messages.',
    chapitres: [
      { seconde: 110, titre: 'Pourquoi une ligne a survecu', extrait: [] },
      { seconde: 780, titre: 'Entretenir un fil de cuivre en altitude', extrait: [] },
      { seconde: 1680, titre: 'Le dernier message, en mars 1997', extrait: [] },
    ],
  },
]

/** Les saisons, deduites des episodes : rien a tenir a jour a deux endroits. */
const SAISONS: readonly number[] = [...new Set(EPISODES.map((e) => e.saison))].sort(
  (a, b) => b - a,
)

/** Les invites, par ordre alphabetique. */
const INVITES_TOUS: readonly string[] = [...new Set(EPISODES.map((e) => e.invite))].sort(
  (a, b) => a.localeCompare(b, 'fr'),
)

/** L annee d une saison, pour l afficher a cote de son numero. */
function anneeDeSaison(saison: number): string {
  const dedans = EPISODES.filter((e) => e.saison === saison)
  const annees = [...new Set(dedans.map((e) => e.dateIso.slice(0, 4)))].sort()
  const premiere = annees[0] ?? ''
  const derniere = annees[annees.length - 1] ?? ''
  return premiere === derniere ? premiere : `${premiere}–${derniere}`
}

/** Les invites de la saison en cours. */
const INVITES = [
  {
    nom: 'Salome Ferrand',
    metier: 'Acousticienne, bureau d etudes Sillage',
    episode: 'Episode 192',
    graine: 'onde-salome',
  },
  {
    nom: 'Yanis Doucet',
    metier: 'Ascensoriste, atelier Doucet et fils',
    episode: 'Episode 191',
    graine: 'onde-yanis',
  },
  {
    nom: 'Anne-Claire Bassot',
    metier: 'Fondeuse de cloches, Villedieu',
    episode: 'Episode 190',
    graine: 'onde-anne',
  },
  {
    nom: 'Mathias Ohl',
    metier: 'Ornithologue, parc des Cevennes',
    episode: 'Episode 189',
    graine: 'onde-mathias',
  },
] as const

/** Ou l emission se trouve, et sous quelle forme. */
const PLATEFORMES = [
  { nom: 'Apple Podcasts', note: 'Chapitres et transcription complete' },
  { nom: 'Spotify', note: 'Chapitres, sans transcription' },
  { nom: 'Deezer', note: 'Episodes seuls' },
  { nom: 'Pocket Casts', note: 'Chapitres et vitesse variable' },
  { nom: 'Overcast', note: 'Chapitres' },
  { nom: 'Radio France', note: 'Diffusion le dimanche a 22 h' },
  { nom: 'Flux RSS', note: 'ondecourte.fr/rss — sans mesure d audience' },
] as const

/** Hauteurs de la forme d onde du lecteur, en pourcentage. */
const ONDE = [
  22, 48, 34, 72, 56, 88, 41, 63, 96, 52, 30, 74, 45, 68, 28, 82, 59, 37, 91, 44, 66, 25,
  78, 50, 35, 70, 42, 86, 31, 60, 47, 75, 26, 64, 39, 83, 54, 29, 71, 46,
]

/** Les vitesses de lecture, dans l ordre ou le bouton les fait defiler. */
const VITESSES = ['1x', '1,25x', '1,5x', '2x', '0,75x'] as const

/** Les colonnes du pied : c est la que vit la navigation du site. */
const COLONNES = [
  {
    titre: 'L emission',
    liens: [
      ['#dernier', 'Le dernier episode'],
      ['#episodes', 'Tous les episodes'],
      ['#invites', 'Les invites'],
      ['#dernier', 'Les transcriptions'],
    ],
  },
  {
    titre: 'Ecouter',
    liens: [
      ['#plateformes', 'Apple Podcasts'],
      ['#plateformes', 'Spotify'],
      ['#plateformes', 'Pocket Casts'],
      ['#plateformes', 'Flux RSS'],
    ],
  },
  {
    titre: 'Nous ecrire',
    liens: [
      ['mailto:bonjour@ondecourte.fr', 'Proposer un invite'],
      ['#haut', 'Presse'],
      ['#haut', 'Rediffusion et licence'],
      ['#haut', 'Mentions legales'],
    ],
  },
] as const

/**
 * Un intitule de section : l indice en mono, le titre en grande graisse legere.
 *
 * Les trois sections du corps le partagent : c est ce qui garantit qu elles
 * parlent de la meme voix, alors que leurs mises en page different.
 */
function Titre({
  rang,
  surtitre,
  id,
  taille = 'clamp(2rem, 4.2vw, 4rem)',
  children,
}: {
  readonly rang: string
  readonly surtitre: string
  readonly id?: string
  /** La taille du titre : une section pleine largeur en demande plus. */
  readonly taille?: string
  readonly children: ReactNode
}): ReactElement {
  return (
    <div>
      <Indice rang={rang} sombre={false}>
        {surtitre}
      </Indice>
      <h2
        id={id}
        className="o-m-0 o-mt-5 o-text-zinc-950 dark:o-text-zinc-50"
        style={{ ...affiche('m', 300), fontSize: taille }}
      >
        {children}
      </h2>
    </div>
  )
}

/**
 * Le heros : le nom, en grand, et rien d autre.
 *
 * Le spectre cite la couleur choisie et la troisieme pastille de la barre. Il
 * ne peut pas citer une nuance intermediaire : un shader lit la valeur calculee
 * d une variable, et les nuances d une vitrine sont des `color-mix` que sa
 * conversion ne sait pas relire.
 */
function Heros(): ReactElement {
  return (
    <header
      id="haut"
      className="o-relative o-isolate o-flex o-flex-col o-overflow-hidden o-text-zinc-50"
      style={{ ...nuit('zinc'), minHeight: `calc(100vh - ${String(CHROME)}px)` }}
    >
      <AudioBars
        aria-hidden="true"
        className="o-absolute o-inset-0 o-z-0"
        bars={56}
        gap={0.5}
        segments={20}
        speed={0.55}
        colors={['--o-palette-zinc-950', '--o-vitrine-500', '--o-vitrine-tierce']}
        fallback="o-bg-zinc-950"
      />
      <div
        aria-hidden="true"
        className="o-absolute o-inset-0 o-z-0"
        style={{ background: VOILE_HEROS }}
      />
      <Grain opacite={0.06} />

      <BarreCoins
        marque="Onde Courte"
        liens={NAVIGATION}
        droite="Chaque vendredi, 7 h — Lyon"
      />

      <div className="o-relative o-z-10 o-flex o-grow o-flex-col o-justify-between o-px-6 o-pb-24 o-pt-6 md:o-px-8 md:o-pb-28">
        <Surgit>
          <Etiquette>Emission audio — un episode par vendredi</Etiquette>
        </Surgit>

        <Surgit delai={160} distance={36} className="o-my-10">
          <EchoText
            as="h1"
            copies={3}
            lag={180}
            spread={1.2}
            className="o-m-0 o-block o-uppercase o-text-zinc-50"
            style={{
              ...affiche('xxl', 800),
              fontSize: 'clamp(3.5rem, 16vw, 15rem)',
              lineHeight: 0.84,
              letterSpacing: '-0.06em',
              textWrap: 'balance',
            }}
          >
            Onde Courte
          </EchoText>
        </Surgit>

        <div className="o-grid o-items-end o-gap-8 lg:o-grid-cols-12">
          <Surgit
            delai={420}
            as="p"
            className="o-m-0 o-text-xl o-leading-tight md:o-text-2xl lg:o-col-span-6"
            style={{ color: CLAIR }}
          >
            <TextLoop phrases={PHRASES} hold={2600} className="o-text-left" />
          </Surgit>
          <Surgit delai={520} className="lg:o-col-span-6 lg:o-justify-self-end">
            <form
              aria-label="Recevoir la lettre du vendredi"
              className="o-flex o-w-full o-max-w-md o-flex-col o-gap-3 sm:o-flex-row sm:o-items-end"
              onSubmit={(event) => {
                event.preventDefault()
              }}
            >
              <label className="o-block o-grow">
                <span className="o-sr-only">Votre courriel</span>
                <input
                  type="email"
                  name="courriel"
                  autoComplete="email"
                  placeholder="votre@courriel.fr"
                  className="o-w-full o-border-b o-border-white-20 o-bg-transparent o-py-3 o-text-base o-text-zinc-50 focus:o-ring"
                  style={{ borderRadius: 0 }}
                />
              </label>
              <button
                type="submit"
                className="o-inline-flex o-shrink-0 o-cursor-pointer o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-transition-transform hover:o-scale-105 focus:o-ring"
                style={{ backgroundColor: CLAIR, color: 'var(--o-palette-zinc-950)' }}
              >
                Recevoir la lettre <Icon icon={ArrowRight} size={15} aria-hidden="true" />
              </button>
            </form>
            <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              Le vendredi a 7 h : l episode, trois liens, une phrase. Rien d autre.
            </p>
          </Surgit>
        </div>
      </div>
      <Coin position="bg">
        Enregistre a Lyon
        <br />
        14 rue Duviard
      </Coin>
      <Coin position="bd">
        Sans montage, sans publicite
        <br />
        Licence CC BY-NC 4.0
      </Coin>
    </header>
  )
}

/** Un bouton rond du lecteur, secondaire. */
function Rond({
  libelle,
  icone,
  onClick,
}: {
  readonly libelle: string
  readonly icone: typeof Play
  readonly onClick?: () => void
}): ReactElement {
  return (
    <button
      type="button"
      aria-label={libelle}
      onClick={onClick}
      className="o-inline-flex o-size-10 o-cursor-pointer o-items-center o-justify-center o-rounded-full o-border-w-1 o-border-zinc-300 o-text-zinc-700 dark:o-border-zinc-700 dark:o-text-zinc-300 focus:o-ring"
    >
      <Icon icon={icone} size={17} />
    </button>
  )
}

/**
 * Le dernier episode, avec son lecteur.
 *
 * La tete de lecture est un etat, les chapitres la deplacent, la forme d onde
 * se remplit jusqu a elle, et l extrait de transcription affiche suit le
 * chapitre en cours.
 */
function Dernier(): ReactElement {
  const episode = EPISODES[0]
  // La page s ouvre sur une ecoute deja commencee : une forme d onde vide ne
  // montrerait ni la tete de lecture ni le chapitre en cours.
  const [position, setPosition] = useState(981)
  const [enLecture, setEnLecture] = useState(false)
  const [vitesse, setVitesse] = useState(0)

  if (episode === undefined) return <></>

  const courant =
    [...episode.chapitres].reverse().find((c) => c.seconde <= position) ??
    episode.chapitres[0]
  const part = Math.min(1, position / episode.duree)
  const remplies = Math.round(part * ONDE.length)

  const deplacer = (secondes: number): void => {
    setPosition(Math.min(episode.duree, Math.max(0, secondes)))
  }

  return (
    <section
      id="dernier"
      aria-labelledby="dernier-titre"
      className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-8 md:o-py-28"
    >
      <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 lg:o-grid-cols-12">
        {/* --- La fiche et le lecteur, colles a gauche ------------------ */}
        <div className="lg:o-col-span-5">
          <div className="lg:o-sticky" style={{ top: CHROME + 32 }}>
            <Titre
              rang="01"
              surtitre={`Le dernier episode — ${episode.date}`}
              id="dernier-titre"
            >
              {episode.titre}
            </Titre>
            <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
              Episode {episode.numero} — {episode.invite}, {episode.metier}
            </p>
            <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
              {episode.resume}
            </p>

            <div className="o-mt-10 o-border-t o-border-zinc-300 o-pt-6 dark:o-border-zinc-700">
              <div
                aria-hidden="true"
                className="o-flex o-h-20 o-items-end o-gap-1 o-overflow-hidden"
              >
                {ONDE.map((hauteur, index) => (
                  <span
                    key={`${String(index)}-${String(hauteur)}`}
                    className="o-w-full o-rounded-full"
                    style={{
                      height: `${String(hauteur)}%`,
                      backgroundColor: index < remplies ? ENCRE : 'var(--o-theme-line)',
                    }}
                  />
                ))}
              </div>
              <div className="o-mt-3 o-flex o-items-center o-justify-between o-font-mono o-text-xs o-tabular-nums o-text-zinc-600 dark:o-text-zinc-400">
                <span>{horloge(position)}</span>
                <span>{horloge(episode.duree)}</span>
              </div>
              <div className="o-mt-5 o-flex o-flex-wrap o-items-center o-gap-3">
                <button
                  type="button"
                  aria-pressed={enLecture}
                  aria-label={
                    enLecture
                      ? `Mettre en pause l episode ${String(episode.numero)}`
                      : `Lire l episode ${String(episode.numero)}`
                  }
                  onClick={() => {
                    setEnLecture((etat) => !etat)
                  }}
                  className="o-inline-flex o-size-12 o-cursor-pointer o-items-center o-justify-center o-rounded-full focus:o-ring"
                  style={PLEIN}
                >
                  <Icon icon={enLecture ? Pause : Play} size={20} />
                </button>
                <Rond
                  libelle="Reculer de quinze secondes"
                  icone={SkipBack}
                  onClick={() => {
                    deplacer(position - 15)
                  }}
                />
                <Rond
                  libelle="Avancer de quinze secondes"
                  icone={SkipForward}
                  onClick={() => {
                    deplacer(position + 15)
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setVitesse((rang) => (rang + 1) % VITESSES.length)
                  }}
                  className="o-cursor-pointer o-rounded-full o-border-w-1 o-border-zinc-300 o-px-3 o-py-1.5 o-font-mono o-text-xs o-tabular-nums o-text-zinc-700 dark:o-border-zinc-700 dark:o-text-zinc-300 focus:o-ring"
                >
                  Vitesse {VITESSES[vitesse] ?? '1x'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Les chapitres, et la transcription qui suit --------------- */}
        <div className="lg:o-col-span-7">
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
            Les chapitres — choisissez, la lecture s y place
          </p>
          <ol className="o-m-0 o-mt-4 o-list-none o-border-t o-border-zinc-300 o-p-0 dark:o-border-zinc-700">
            {episode.chapitres.map((chapitre, rang) => {
              const actif = chapitre.seconde === courant?.seconde
              return (
                <li key={chapitre.seconde}>
                  <button
                    type="button"
                    aria-current={actif ? 'true' : undefined}
                    onClick={() => {
                      deplacer(chapitre.seconde)
                    }}
                    className="o-grid o-w-full o-cursor-pointer o-grid-cols-12 o-items-baseline o-gap-4 o-border-b o-border-zinc-300 o-px-2 o-py-5 o-text-left dark:o-border-zinc-700 focus:o-ring"
                    style={actif ? { backgroundColor: accentDoux(500, 10) } : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className="o-col-span-2 o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50"
                      style={{
                        ...affiche('m', 300),
                        fontSize: 'clamp(1.5rem, 2.6vw, 2.5rem)',
                      }}
                    >
                      {String(rang + 1).padStart(2, '0')}
                    </span>
                    <span className="o-col-span-10 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-6 o-gap-y-1">
                      <span
                        className={`o-text-lg o-tracking-tight md:o-text-xl ${actif ? 'o-font-medium o-text-zinc-950 dark:o-text-zinc-50' : 'o-text-zinc-800 dark:o-text-zinc-200'}`}
                      >
                        {chapitre.titre}
                      </span>
                      <span
                        className="o-font-mono o-text-xs o-tabular-nums"
                        style={{ color: ENCRE }}
                      >
                        {horloge(chapitre.seconde)}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          {courant !== undefined && courant.extrait.length > 0 && (
            <div
              className="o-mt-10 o-rounded-2xl o-p-6 md:o-p-8"
              style={{ backgroundColor: accentDoux(500, 8) }}
            >
              <h3 className="o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                <span aria-hidden style={{ color: ENCRE }}>
                  <Icon icon={Quote} size={14} />
                </span>
                Transcription — a partir de {horloge(courant.seconde)}
              </h3>
              <dl className="o-m-0 o-mt-5 o-flex o-flex-col o-gap-5">
                {courant.extrait.map(([qui, quoi]) => (
                  <div
                    key={quoi.slice(0, 40)}
                    className="o-grid o-gap-1 md:o-grid-cols-12 md:o-gap-6"
                  >
                    <dt
                      className="o-font-mono o-text-xs o-uppercase o-tracking-wider md:o-col-span-3"
                      style={{ color: ENCRE }}
                    >
                      {qui}
                    </dt>
                    <dd className="o-m-0 o-text-base o-leading-relaxed o-text-zinc-800 dark:o-text-zinc-200 md:o-col-span-9">
                      {quoi}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                Transcription integrale en texte brut et en sous-titres, pour chaque
                episode depuis le numero 120.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/** Un menu de filtre, dans le vocabulaire sobre de la page. */
function Choix({
  id,
  intitule,
  valeur,
  onChange,
  children,
}: {
  readonly id: string
  readonly intitule: string
  readonly valeur: string
  readonly onChange: (valeur: string) => void
  readonly children: ReactNode
}): ReactElement {
  return (
    <div className="o-flex o-min-w-0 o-flex-col o-gap-1.5">
      <label
        htmlFor={id}
        className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400"
      >
        {intitule}
      </label>
      <select
        id={id}
        value={valeur}
        onChange={(evenement) => {
          onChange(evenement.target.value)
        }}
        className="o-w-full o-cursor-pointer o-rounded-lg o-border-w-1 o-bg-transparent o-px-3 o-py-2 o-text-sm o-text-zinc-900 dark:o-text-zinc-100 focus:o-ring"
        style={{ borderColor: 'var(--o-theme-line)' }}
      >
        {children}
      </select>
    </div>
  )
}

/**
 * Les archives : trois colonnes — les filtres, la pile, la fiche.
 *
 * Quand le filtre exclut l episode ouvert, c est le premier de la nouvelle
 * liste qui s ouvre. Sans cela, filtrer laisserait la fiche d un episode absent
 * de la liste — ce qui se lit comme une panne.
 */
function Archives(): ReactElement {
  const [saison, setSaison] = useState('toutes')
  const [invite, setInvite] = useState('tous')
  const [choisi, setChoisi] = useState(EPISODES[0]?.id ?? '')

  const liste = EPISODES.filter(
    (candidat) =>
      (saison === 'toutes' || String(candidat.saison) === saison) &&
      (invite === 'tous' || candidat.invite === invite),
  )
  const episode = liste.find((candidat) => candidat.id === choisi) ?? liste[0]

  return (
    <section
      id="episodes"
      aria-labelledby="episodes-titre"
      className="o-scroll-mt-24 o-border-t o-border-zinc-200 o-bg-zinc-100 o-px-6 o-py-20 dark:o-border-zinc-800 dark:o-bg-zinc-900 md:o-px-8 md:o-py-28"
    >
      <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 lg:o-grid-cols-12 lg:o-gap-8">
        <div className="lg:o-col-span-4">
          <Titre rang="02" surtitre="Les archives" id="episodes-titre">
            Tout reste en ligne.
          </Titre>
          <p className="o-m-0 o-mt-5 o-max-w-xs o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
            Douze episodes sont ici, choisis dans trois saisons ; les autres se trouvent
            dans le flux. Sans abonnement, sans coupure.
          </p>
          <div className="o-mt-8 o-flex o-max-w-xs o-flex-col o-gap-4">
            <Choix
              id="onde-saison"
              intitule="Saison"
              valeur={saison}
              onChange={setSaison}
            >
              <option value="toutes">Toutes les saisons</option>
              {SAISONS.map((numero) => (
                <option key={numero} value={String(numero)}>
                  Saison {numero} — {anneeDeSaison(numero)}
                </option>
              ))}
            </Choix>
            <Choix
              id="onde-invite"
              intitule="Invite"
              valeur={invite}
              onChange={setInvite}
            >
              <option value="tous">Tous les invites</option>
              {INVITES_TOUS.map((nom) => (
                <option key={nom} value={nom}>
                  {nom}
                </option>
              ))}
            </Choix>
          </div>
          <p
            aria-live="polite"
            className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400"
          >
            {liste.length === 0
              ? 'Aucun episode ne repond a ces deux filtres.'
              : `${String(liste.length)} episode${liste.length > 1 ? 's' : ''} — du plus recent au plus ancien`}
          </p>
        </div>

        <div className="lg:o-col-span-4">
          {liste.length > 0 && (
            <AnimatedList
              label="Les episodes retenus"
              value={episode?.id ?? ''}
              onChange={setChoisi}
              style={{ maxHeight: '30rem' }}
              items={liste.map((candidat) => ({
                id: candidat.id,
                label: `${String(candidat.numero)}. ${candidat.titre}`,
                hint: `${minutes(candidat.duree)} · ${candidat.date}`,
              }))}
            />
          )}
        </div>

        <div className="lg:o-col-span-4">
          {episode !== undefined && (
            // En colonne unique, un filet horizontal separe la fiche de la pile ;
            // en trois colonnes, c est le filet de gauche qui s en charge.
            <article
              className="lg:o-border-l lg:o-pl-8"
              style={{ borderColor: 'var(--o-theme-line)' }}
            >
              <span
                aria-hidden="true"
                className="o-mb-6 o-block o-h-px o-bg-zinc-300 dark:o-bg-zinc-700 lg:o-hidden"
              />
              <p className="o-m-0 o-flex o-flex-wrap o-items-center o-gap-x-4 o-gap-y-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                <span style={{ color: ENCRE }}>
                  Saison {episode.saison} · episode {episode.numero}
                </span>
                <span className="o-inline-flex o-items-center o-gap-1.5">
                  <Icon icon={CalendarDays} size={13} aria-hidden="true" />
                  <time dateTime={episode.dateIso}>{episode.date}</time>
                </span>
                <span className="o-inline-flex o-items-center o-gap-1.5 o-tabular-nums">
                  <Icon icon={Clock} size={13} aria-hidden="true" />
                  {minutes(episode.duree)}
                </span>
              </p>
              <h3 className="o-m-0 o-mt-4 o-text-2xl o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50 md:o-text-3xl">
                {episode.titre}
              </h3>
              <p className="o-m-0 o-mt-2 o-text-sm" style={{ color: ENCRE }}>
                {episode.invite} — {episode.metier}
              </p>
              <p className="o-m-0 o-mt-4 o-text-base o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
                {episode.resume}
              </p>
              <ul className="o-m-0 o-mt-6 o-flex o-list-none o-flex-col o-gap-1.5 o-p-0 o-text-sm">
                {episode.chapitres.map((chapitre) => (
                  <li key={chapitre.seconde} className="o-flex o-gap-4">
                    <span
                      className="o-w-14 o-shrink-0 o-font-mono o-text-xs o-tabular-nums"
                      style={{ color: ENCRE }}
                    >
                      {horloge(chapitre.seconde)}
                    </span>
                    <span className="o-text-zinc-700 dark:o-text-zinc-300">
                      {chapitre.titre}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href="#dernier"
                className="o-mt-6 o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-5 o-py-2.5 o-text-sm o-font-medium o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                style={PLEIN}
              >
                <Icon icon={Play} size={15} aria-hidden="true" />
                Ecouter cet episode
              </a>
            </article>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * Les invites de la saison : un generique, pas une grille de cartes.
 *
 * Les deux sections qui precedent tiennent leur titre dans une colonne collee
 * a gauche. Celle-ci le pose en travers de la page, et les noms passent en
 * dessous a pleine largeur, comme un generique de fin : c est la rupture de
 * rythme qui empeche trois ecrans de suite de se ressembler.
 */
function Invites(): ReactElement {
  return (
    <section
      id="invites"
      aria-labelledby="invites-titre"
      className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-8 md:o-py-28"
    >
      <div className="o-mx-auto o-max-w-7xl">
        <div className="o-grid o-gap-6 md:o-grid-cols-12 md:o-items-end">
          <div className="md:o-col-span-8">
            <Titre
              rang="03"
              surtitre="Qui parle, ce mois-ci"
              id="invites-titre"
              taille="clamp(2.25rem, 5.5vw, 5.5rem)"
            >
              Choisis pour ce qu ils font de leurs journees.
            </Titre>
          </div>
          {/* La reserve tient dans la marge, en mono : elle n est pas un argument. */}
          <p className="o-m-0 o-max-w-xs o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-4 md:o-justify-self-end md:o-text-right">
            Jamais pour ce qu ils ont a vendre
            <br />
            Aucun invite n est paye
            <br />
            Aucun episode n est relu avant diffusion
          </p>
        </div>

        <ol className="o-m-0 o-mt-14 o-list-none o-border-t o-border-zinc-300 o-p-0 dark:o-border-zinc-700 md:o-mt-20">
          {INVITES.map((invite) => {
            const image = portrait(invite.graine, `Portrait de ${invite.nom}`, 160)
            return (
              <li
                key={invite.nom}
                className="o-grid o-items-baseline o-gap-x-6 o-gap-y-3 o-border-b o-border-zinc-300 o-py-7 dark:o-border-zinc-700 md:o-grid-cols-12 md:o-py-9"
              >
                <p
                  className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest md:o-col-span-2"
                  style={{ color: ENCRE }}
                >
                  {invite.episode}
                </p>
                <h3
                  className="o-m-0 o-min-w-0 o-text-zinc-950 dark:o-text-zinc-50 md:o-col-span-6"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 4vw, 3.75rem)',
                  }}
                >
                  {invite.nom}
                </h3>
                {/* Le portrait remonte sur la ligne du nom : il chevauche le filet. */}
                <img
                  src={image.src}
                  alt={image.alt}
                  width={160}
                  height={160}
                  loading="lazy"
                  className="o-size-16 o-shrink-0 o-rounded-full o-object-cover md:o-col-span-1 md:o-justify-self-center"
                  style={{ marginBottom: '-1.5rem' }}
                />
                <p className="o-m-0 o-text-base o-leading-snug o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-3 md:o-text-right">
                  {invite.metier}
                </p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

/** Les plateformes d ecoute : la bande, puis ce que chacune rend vraiment. */
function Plateformes(): ReactElement {
  return (
    <section
      id="plateformes"
      aria-labelledby="plateformes-titre"
      className="o-border-t o-border-zinc-200 o-bg-white o-text-zinc-700 dark:o-border-zinc-800 dark:o-bg-zinc-900 dark:o-text-zinc-300"
    >
      <LogoBand title="Onde Courte s ecoute la ou vous ecoutez deja" speed={34}>
        {PLATEFORMES.map((plateforme) => (
          <span
            key={plateforme.nom}
            className="o-inline-flex o-items-center o-whitespace-nowrap o-text-2xl o-font-medium o-tracking-tight"
          >
            {plateforme.nom}
          </span>
        ))}
      </LogoBand>
      <div className="o-mx-auto o-max-w-7xl o-px-6 o-pb-16 md:o-px-8">
        <h2 id="plateformes-titre" className="o-sr-only">
          Ce que chaque plateforme rend
        </h2>
        <dl className="o-m-0 o-grid o-gap-x-10 md:o-grid-cols-2 lg:o-grid-cols-3">
          {PLATEFORMES.map((plateforme) => (
            <div
              key={plateforme.nom}
              className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-4 o-gap-y-1 o-border-t o-border-zinc-200 o-py-3 dark:o-border-zinc-800"
            >
              <dt className="o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-100">
                {plateforme.nom}
              </dt>
              <dd className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-600 dark:o-text-zinc-400">
                {plateforme.note}
              </dd>
            </div>
          ))}
        </dl>
        <p className="o-m-0 o-mt-6 o-flex o-max-w-2xl o-items-start o-gap-2 o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          <span aria-hidden className="o-mt-0.5" style={{ color: ENCRE }}>
            <Icon icon={Rss} size={14} />
          </span>
          Le flux est la source : tout le reste en decoule. Il ne porte aucune balise de
          mesure — on ne sait pas qui ecoute, et c est voulu.
        </p>
      </div>
    </section>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('inter')
  return (
    <Porte forme="zoom" marque="Onde Courte">
      <div
        className="o-bg-zinc-50 o-text-zinc-900 dark:o-bg-zinc-950 dark:o-text-zinc-100"
        style={polices}
      >
        <Heros />
        {/* Le corps porte son fond : c est lui qui glisse sur le pied fixe. */}
        <main className="o-relative o-z-10 o-bg-zinc-50 dark:o-bg-zinc-950">
          <Dernier />
          <Archives />
          <Invites />
          <Plateformes />
        </main>

        {/* ================= Le pied, fixe derriere la page ================= */}
        <PiedColle hauteur={470}>
          <footer
            className="o-flex o-h-full o-flex-col o-justify-between o-px-6 o-pb-6 o-pt-12 o-text-zinc-300 md:o-px-8 md:o-pt-16"
            style={nuit('zinc')}
          >
            <div className="o-mx-auto o-grid o-w-full o-max-w-7xl o-gap-10 md:o-grid-cols-12">
              <div className="md:o-col-span-5">
                <p
                  className="o-m-0 o-uppercase o-text-zinc-50"
                  style={{
                    ...affiche('l', 800),
                    fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
                    letterSpacing: '-0.06em',
                  }}
                >
                  Onde Courte
                </p>
                <p className="o-m-0 o-mt-4 o-max-w-xs o-text-sm o-leading-relaxed o-text-zinc-400">
                  Independant depuis 2021, finance par les abonnes et par deux bourses
                  publiques.
                </p>
              </div>
              <div className="o-grid o-grid-cols-2 o-gap-8 md:o-col-span-7 md:o-grid-cols-3">
                {COLONNES.map((colonne) => (
                  <nav key={colonne.titre} aria-label={colonne.titre}>
                    <h2 className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                      {colonne.titre}
                    </h2>
                    <ul className="o-m-0 o-mt-4 o-flex o-list-none o-flex-col o-gap-2 o-p-0">
                      {colonne.liens.map(([href, libelle]) => (
                        <li key={libelle}>
                          <a
                            href={href}
                            className="o-text-sm o-text-zinc-300 o-no-underline o-transition-colors hover:o-text-zinc-50 focus:o-ring"
                          >
                            {libelle}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ))}
              </div>
            </div>
            <div
              className="o-mx-auto o-flex o-w-full o-max-w-7xl o-flex-wrap o-items-center o-justify-between o-gap-3 o-border-t o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400"
              style={{ borderColor: FILET }}
            >
              <p className="o-m-0">
                © 2026 Onde Courte — 14 rue Duviard, 69004 Lyon — 04 78 29 41 06
              </p>
              <p className="o-m-0">Generique : Bertille, « Halage » — CC BY-NC 4.0</p>
            </div>
          </footer>
        </PiedColle>
      </div>
    </Porte>
  )
}
