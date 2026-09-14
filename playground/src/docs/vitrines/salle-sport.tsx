/**
 * Fonte — salle de sport.
 *
 * ## Le parti pris : une affiche
 *
 * Une salle de fonte ne chuchote pas, et une affiche placardee sur un mur de
 * Pantin non plus. Le premier ecran est donc une affiche et rien d autre : le
 * nom centre, empile en quatre lignes de corps decroissant, pris entre deux
 * bandes qui defilent d un bord a l autre de la page.
 *
 * Le reste de la page est une suite de bandes pleine largeur qui alternent
 * deux fonds — le papier, et un aplat teinte par la palette. Aucun coin
 * arrondi, aucune ombre douce : des filets epais, des aplats, des capitales.
 *
 * ## Ce qu un adherent veut savoir avant de pousser la porte
 *
 * A quelle heure c est plein, ce qu il y a comme cours et quand, ce que la
 * formule contient vraiment, ce qu il y a sur les plateaux, et comment essayer
 * sans payer. La page repond aux cinq : une courbe d affluence par tranche
 * horaire et par jour, le planning des quarante-deux cours collectifs jour par
 * jour, un comparatif ligne a ligne des trois formules, le materiel compte
 * piece par piece, et un formulaire d essai qui rend un numero de badge.
 *
 * ## La couleur, et pourquoi la bande n est plus un vert fixe
 *
 * L affiche etait imprimee en lime. Un modele, lui, doit se reteinter : la
 * bande coloree est desormais un melange de l accent `--o-vitrine-*` et du fond
 * du theme. Elle est donc claire sur papier et sombre sur encre, quelle que
 * soit la palette, et l encre neutre qui la traverse reste lisible dans les
 * deux cas — ce qu un aplat sature ne garantissait pas.
 *
 * Deux formes d accent coexistent :
 *
 * - le style en ligne, pour un accent fixe — en `light-dark` quand la nuance
 *   doit changer avec le theme, en nuance 200 ou 300 quand l element est pose
 *   sur du noir et doit rester clair pour toute palette ;
 * - les classes `o-*-brand-*`, pour ce qui reagit au survol — un style en ligne
 *   l emporterait sur la regle `hover:`. Ces classes lisent la meme echelle,
 *   que la barre reteinte en meme temps.
 *
 * ## Le fond
 *
 * Le champ electrique reste : il joue le role d une enseigne au neon derriere
 * l affiche, et il ne porte que du texte pose sur un aplat noir franc. C est le
 * seul contexte graphique anime de la page ; les stries des horaires sont une
 * trame statique, et leur hachure est neutre pour ne pas disparaitre sur la
 * bande teintee.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import {
  ArrowRight,
  BicepsFlexed,
  Check,
  Dumbbell,
  MapPin,
  Timer,
} from '@odoro-cli/icons/filaire'
import { useInView } from '@odoro-cli/libs/motion'
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

import { ElectricField } from '@/odoro/background/ElectricField.js'
import { Stripes } from '@/odoro/background/Stripes.js'
import { Marquee } from '@/odoro/effect/Marquee.js'
import { ScrollVelocity } from '@/odoro/effect/ScrollVelocity.js'
import { CounterRoll } from '@/odoro/text/CounterRoll.js'
import { TextPressure } from '@/odoro/text/TextPressure.js'

import { media, portrait } from './media.js'
import { accent, accentDoux, encre } from './palettes.js'
import { Porte, Surgit, usePolices } from './marche.jsx'
import { Bandeau } from './scene.jsx'

/** Les lignes de l affiche se serrent : aucune classe ne descend aussi bas. */
const AFFICHE: CSSProperties = { lineHeight: 0.82 }

/** La bande claire : papier en theme clair, encre en theme sombre. */
const PAPIER = 'o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-950 dark:o-text-zinc-50'

/**
 * L aplat teinte d une bande.
 *
 * En theme clair, l accent est melange au fond : la bande reste claire quelle
 * que soit la palette, et l encre noire y tient. En theme sombre, le meme
 * melange vers un fond deja tres bas rendrait la bande indistincte du papier :
 * il se fait donc vers la surface du theme, plus haute d un cran, ce qui rend
 * l alternance visible sans jamais menacer l encre claire.
 */
const TEINTE: CSSProperties = {
  backgroundColor: `light-dark(${accentDoux(500, 26)}, color-mix(in oklab, ${accent(
    500,
  )} 16%, var(--o-theme-surface)))`,
}

/** L encre d une bande teintee : neutre, en paire claire et sombre. */
const ENCRE = 'o-text-zinc-950 dark:o-text-zinc-50'

/**
 * L accent pose sur du noir.
 *
 * La nuance 300 contient pres de la moitie de blanc : elle est claire pour
 * toute palette, donc lisible sur l encre du pied de page et sur l affiche.
 */
const ACCENT_CLAIR: CSSProperties = { color: accent(300) }

/** L accent en encre : la nuance foncee sur papier, la claire sur encre. */
const ACCENT_ENCRE: CSSProperties = {
  // La paire 700 / 300 devient grise pour un accent blanc : le role calcule
  // descend l echelle jusqu au premier ton qui passe.
  color: encre(),
}

/** Une pastille d accent : toujours claire, donc toujours en encre noire. */
const PASTILLE: CSSProperties = { backgroundColor: accent(200) }

/** Le cadre d une bande : pleine largeur, contenu tenu au centre. */
const CADRE = 'o-mx-auto o-max-w-7xl o-px-6 o-py-20 md:o-py-28'

/** Le titre d une bande, toujours au meme corps. */
const TITRE = 'o-text-4xl o-font-black o-uppercase o-tracking-tighter md:o-text-6xl'

/**
 * Un filet epais, pose sur un seul bord.
 *
 * `o-border-w-2` pose quatre bords a la fois : il ferme une boite la ou
 * l affiche ne veut qu une regle. Les deux proprietes sont donc ecrites a la
 * main, et la couleur suit l encre courante — donc le theme, et l aplat de la
 * bande.
 */
const REGLE_HAUTE = { borderTopWidth: '3px', borderTopColor: 'currentColor' }

/** La meme regle, sous une ligne d en-tete de tableau. */
const REGLE_BASSE = { borderBottomWidth: '3px', borderBottomColor: 'currentColor' }

/** Un bouton d affiche : aplat noir, encre d accent, angles vifs. */
const BOUTON_NOIR =
  'o-inline-flex o-items-center o-gap-2 o-bg-zinc-950 o-px-6 o-py-3.5 o-text-xs o-font-black o-uppercase o-tracking-widest o-text-brand-300 dark:o-text-brand-300 o-no-underline hover:o-bg-zinc-800 o-transition-colors focus:o-ring'

/** Un bouton d affiche : aplat d accent clair, encre noire. */
const BOUTON_ACCENT =
  'o-inline-flex o-items-center o-justify-center o-gap-2 o-bg-brand-200 hover:o-bg-brand-300 o-px-6 o-py-3.5 o-text-xs o-font-black o-uppercase o-tracking-widest o-text-zinc-950 dark:o-text-zinc-950 o-no-underline o-transition-colors focus:o-ring'

/** Un champ de formulaire : rectangle net, filet mince, fond du papier. */
const CHAMP =
  'o-mt-2 o-w-full o-border-w-1 o-border-zinc-400 dark:o-border-zinc-600 o-bg-transparent o-px-4 o-py-3 o-text-sm o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring'

/** L intitule d un champ. */
const ETIQUETTE = 'o-text-xs o-font-black o-uppercase o-tracking-widest'

/** Un plateau de la salle, avec son materiel. */
interface Plateau {
  readonly id: string
  readonly label: string
  readonly surface: string
  readonly baseline: string
  readonly materiel: readonly (readonly [string, string])[]
  readonly image: string
  readonly alt: string
}

/** Les quatre plateaux, dans l ordre ou on les traverse. */
const PLATEAUX: readonly Plateau[] = [
  {
    id: 'fonte',
    label: 'Charges libres',
    surface: '640 m2',
    baseline:
      'Le plateau principal. Quatorze racks, du sol au plafond, jamais une file de plus de deux.',
    materiel: [
      ['14', 'racks a squat avec securite'],
      ['8', 'bancs reglables et 4 bancs plats'],
      ['2 x 320 kg', 'de disques olympiques calibres'],
      ['6', 'plateformes de tirage avec sol amortissant'],
      ['52', 'paires de dumbbells, de 2 a 60 kg'],
      ['4', 'barres hexagonales et 12 barres olympiques'],
      ['3', 'presses a cuisses et 2 hack squats'],
      ['1', 'magnesie liquide a chaque rack'],
    ],
    image: media('sport-fonte', 'Le plateau de charges libres et ses racks', 1200, 900)
      .src,
    alt: 'Le plateau de charges libres et ses racks',
  },
  {
    id: 'cardio',
    label: 'Cardio',
    surface: '280 m2',
    baseline:
      'En mezzanine, au-dessus du plateau. Ecrans coupes, casque obligatoire, vue sur la rue.',
    materiel: [
      ['18', 'tapis a courroie motorisee'],
      ['12', 'rameurs a resistance air'],
      ['10', 'velos assault et 8 velos droits'],
      ['6', 'escaliers sans fin'],
      ['4', 'skiergs muraux'],
      ['2', 'tapis courbes non motorises'],
      ['24', 'prises de courant aux postes'],
      ['0', 'ecran allume : la television reste eteinte'],
    ],
    image: media('sport-cardio', 'La mezzanine cardio et ses rameurs', 1200, 900).src,
    alt: 'La mezzanine cardio et ses rameurs',
  },
  {
    id: 'cross',
    label: 'Cross-training',
    surface: '410 m2',
    baseline:
      'Sol en gazon, cages, cordes. Le seul espace ou lacher la barre est autorise.',
    materiel: [
      ['20 m', 'de piste de traineau'],
      ['12', 'kettlebells de 8 a 48 kg, par paires'],
      ['9', 'cages a tractions et anneaux'],
      ['6', 'sacs bulgares et 6 wall balls'],
      ['4', 'cordes ondulatoires de 15 metres'],
      ['1', 'mur de 3 metres pour les sauts'],
      ['8', 'boites pliometriques de 30 a 75 cm'],
      ['2', 'traineaux charges jusqu a 200 kg'],
    ],
    image: media(
      'sport-cross',
      'La zone de cross-training, cages et traineaux',
      1200,
      900,
    ).src,
    alt: 'La zone de cross-training, cages et traineaux',
  },
  {
    id: 'cours',
    label: 'Cours collectifs',
    surface: '190 m2',
    baseline:
      'Quarante-deux cours par semaine, inclus dans tous les abonnements. Sans reservation.',
    materiel: [
      ['42', 'cours par semaine, 7 jours sur 7'],
      ['24', 'places par cours, premier arrive'],
      ['8', 'formats : hyrox, hiit, boxe, mobilite'],
      ['6', 'coachs diplomes en rotation'],
      ['45 min', 'la duree standard, 60 le samedi'],
      ['0 EUR', 'de supplement, quelle que soit la formule'],
      ['30', 'tapis, 24 steps, 20 paires de gants'],
      ['2', 'sonos, une par extremite de salle'],
    ],
    image: media('sport-cours', 'La salle de cours collectifs pendant un hiit', 1200, 900)
      .src,
    alt: 'La salle de cours collectifs pendant un hiit',
  },
]

/** Une seance du planning collectif. */
interface Seance {
  readonly heure: string
  readonly nom: string
  readonly coach: string
  readonly salle: string
  readonly duree: string
  readonly intensite: 'Modere' | 'Soutenu' | 'Tres soutenu'
}

/** Une journee du planning collectif. */
interface JourneeCours {
  readonly jour: string
  readonly abrege: string
  readonly seances: readonly Seance[]
}

/** Les quarante-deux cours de la semaine, six par jour. */
const PLANNING: readonly JourneeCours[] = [
  {
    jour: 'Lundi',
    abrege: 'Lun',
    seances: [
      {
        heure: '06h30',
        nom: 'Reveil force',
        coach: 'Sofiane Terki',
        salle: 'Studio',
        duree: '45 min',
        intensite: 'Soutenu',
      },
      {
        heure: '12h15',
        nom: 'Hiit express',
        coach: 'Lena Brou',
        salle: 'Studio',
        duree: '30 min',
        intensite: 'Tres soutenu',
      },
      {
        heure: '17h30',
        nom: 'Mobilite hanches',
        coach: 'Ivan Costa',
        salle: 'Mezzanine',
        duree: '45 min',
        intensite: 'Modere',
      },
      {
        heure: '18h30',
        nom: 'Hyrox, bloc 1',
        coach: 'Maud Ferrer',
        salle: 'Cross',
        duree: '60 min',
        intensite: 'Tres soutenu',
      },
      {
        heure: '19h30',
        nom: 'Boxe, fondamentaux',
        coach: 'Lena Brou',
        salle: 'Studio',
        duree: '45 min',
        intensite: 'Soutenu',
      },
      {
        heure: '20h30',
        nom: 'Renfort dos',
        coach: 'Ivan Costa',
        salle: 'Studio',
        duree: '45 min',
        intensite: 'Modere',
      },
    ],
  },
  {
    jour: 'Mardi',
    abrege: 'Mar',
    seances: [
      {
        heure: '06h30',
        nom: 'Cardio continu',
        coach: 'Maud Ferrer',
        salle: 'Mezzanine',
        duree: '45 min',
        intensite: 'Soutenu',
      },
      {
        heure: '12h15',
        nom: 'Core et gainage',
        coach: 'Ivan Costa',
        salle: 'Studio',
        duree: '30 min',
        intensite: 'Modere',
      },
      {
        heure: '17h30',
        nom: 'Technique arrache',
        coach: 'Sofiane Terki',
        salle: 'Cross',
        duree: '60 min',
        intensite: 'Soutenu',
      },
      {
        heure: '18h30',
        nom: 'Hiit intervalles',
        coach: 'Lena Brou',
        salle: 'Studio',
        duree: '45 min',
        intensite: 'Tres soutenu',
      },
      {
        heure: '19h30',
        nom: 'Traineau et sled',
        coach: 'Maud Ferrer',
        salle: 'Cross',
        duree: '45 min',
        intensite: 'Tres soutenu',
      },
      {
        heure: '20h30',
        nom: 'Etirements longs',
        coach: 'Ivan Costa',
        salle: 'Mezzanine',
        duree: '45 min',
        intensite: 'Modere',
      },
    ],
  },
  {
    jour: 'Mercredi',
    abrege: 'Mer',
    seances: [
      {
        heure: '06h30',
        nom: 'Reveil force',
        coach: 'Sofiane Terki',
        salle: 'Studio',
        duree: '45 min',
        intensite: 'Soutenu',
      },
      {
        heure: '12h15',
        nom: 'Boxe, sac',
        coach: 'Lena Brou',
        salle: 'Studio',
        duree: '30 min',
        intensite: 'Soutenu',
      },
      {
        heure: '17h30',
        nom: 'Hyrox, bloc 2',
        coach: 'Maud Ferrer',
        salle: 'Cross',
        duree: '60 min',
        intensite: 'Tres soutenu',
      },
      {
        heure: '18h30',
        nom: 'Jambes et fessiers',
        coach: 'Sofiane Terki',
        salle: 'Studio',
        duree: '45 min',
        intensite: 'Soutenu',
      },
      {
        heure: '19h30',
        nom: 'Hiit express',
        coach: 'Lena Brou',
        salle: 'Studio',
        duree: '30 min',
        intensite: 'Tres soutenu',
      },
      {
        heure: '20h15',
        nom: 'Mobilite epaules',
        coach: 'Ivan Costa',
        salle: 'Mezzanine',
        duree: '45 min',
        intensite: 'Modere',
      },
    ],
  },
  {
    jour: 'Jeudi',
    abrege: 'Jeu',
    seances: [
      {
        heure: '06h30',
        nom: 'Rameur, seuil',
        coach: 'Maud Ferrer',
        salle: 'Mezzanine',
        duree: '45 min',
        intensite: 'Soutenu',
      },
      {
        heure: '12h15',
        nom: 'Core et gainage',
        coach: 'Ivan Costa',
        salle: 'Studio',
        duree: '30 min',
        intensite: 'Modere',
      },
      {
        heure: '17h30',
        nom: 'Technique squat',
        coach: 'Sofiane Terki',
        salle: 'Cross',
        duree: '60 min',
        intensite: 'Soutenu',
      },
      {
        heure: '18h30',
        nom: 'Boxe, sparring leger',
        coach: 'Lena Brou',
        salle: 'Studio',
        duree: '45 min',
        intensite: 'Tres soutenu',
      },
      {
        heure: '19h30',
        nom: 'Hyrox, bloc 3',
        coach: 'Maud Ferrer',
        salle: 'Cross',
        duree: '60 min',
        intensite: 'Tres soutenu',
      },
      {
        heure: '20h45',
        nom: 'Retour au calme',
        coach: 'Ivan Costa',
        salle: 'Mezzanine',
        duree: '30 min',
        intensite: 'Modere',
      },
    ],
  },
  {
    jour: 'Vendredi',
    abrege: 'Ven',
    seances: [
      {
        heure: '06h30',
        nom: 'Reveil force',
        coach: 'Sofiane Terki',
        salle: 'Studio',
        duree: '45 min',
        intensite: 'Soutenu',
      },
      {
        heure: '12h15',
        nom: 'Hiit express',
        coach: 'Lena Brou',
        salle: 'Studio',
        duree: '30 min',
        intensite: 'Tres soutenu',
      },
      {
        heure: '17h30',
        nom: 'Mobilite complete',
        coach: 'Ivan Costa',
        salle: 'Mezzanine',
        duree: '45 min',
        intensite: 'Modere',
      },
      {
        heure: '18h30',
        nom: 'Circuit kettlebells',
        coach: 'Maud Ferrer',
        salle: 'Cross',
        duree: '45 min',
        intensite: 'Soutenu',
      },
      {
        heure: '19h30',
        nom: 'Boxe, fondamentaux',
        coach: 'Lena Brou',
        salle: 'Studio',
        duree: '45 min',
        intensite: 'Soutenu',
      },
      {
        heure: '20h30',
        nom: 'Souleve de terre',
        coach: 'Sofiane Terki',
        salle: 'Cross',
        duree: '45 min',
        intensite: 'Tres soutenu',
      },
    ],
  },
  {
    jour: 'Samedi',
    abrege: 'Sam',
    seances: [
      {
        heure: '09h00',
        nom: 'Hyrox, simulation',
        coach: 'Maud Ferrer',
        salle: 'Cross',
        duree: '60 min',
        intensite: 'Tres soutenu',
      },
      {
        heure: '10h15',
        nom: 'Force, seance longue',
        coach: 'Sofiane Terki',
        salle: 'Studio',
        duree: '60 min',
        intensite: 'Soutenu',
      },
      {
        heure: '11h30',
        nom: 'Boxe, ouvert a tous',
        coach: 'Lena Brou',
        salle: 'Studio',
        duree: '60 min',
        intensite: 'Soutenu',
      },
      {
        heure: '14h00',
        nom: 'Retour de blessure',
        coach: 'Ivan Costa',
        salle: 'Mezzanine',
        duree: '60 min',
        intensite: 'Modere',
      },
      {
        heure: '15h30',
        nom: 'Circuit en binome',
        coach: 'Maud Ferrer',
        salle: 'Cross',
        duree: '60 min',
        intensite: 'Tres soutenu',
      },
      {
        heure: '17h00',
        nom: 'Mobilite et respiration',
        coach: 'Ivan Costa',
        salle: 'Mezzanine',
        duree: '60 min',
        intensite: 'Modere',
      },
    ],
  },
  {
    jour: 'Dimanche',
    abrege: 'Dim',
    seances: [
      {
        heure: '09h30',
        nom: 'Cardio doux',
        coach: 'Maud Ferrer',
        salle: 'Mezzanine',
        duree: '45 min',
        intensite: 'Modere',
      },
      {
        heure: '10h30',
        nom: 'Force, technique',
        coach: 'Sofiane Terki',
        salle: 'Studio',
        duree: '60 min',
        intensite: 'Soutenu',
      },
      {
        heure: '11h45',
        nom: 'Hiit du dimanche',
        coach: 'Lena Brou',
        salle: 'Studio',
        duree: '45 min',
        intensite: 'Tres soutenu',
      },
      {
        heure: '15h00',
        nom: 'Mobilite hanches',
        coach: 'Ivan Costa',
        salle: 'Mezzanine',
        duree: '45 min',
        intensite: 'Modere',
      },
      {
        heure: '16h00',
        nom: 'Circuit kettlebells',
        coach: 'Maud Ferrer',
        salle: 'Cross',
        duree: '45 min',
        intensite: 'Soutenu',
      },
      {
        heure: '17h30',
        nom: 'Etirements longs',
        coach: 'Ivan Costa',
        salle: 'Mezzanine',
        duree: '45 min',
        intensite: 'Modere',
      },
    ],
  },
]

/** Les huit tranches horaires relevees par le tourniquet. */
const TRANCHES = [
  '05h — 07h',
  '07h — 09h',
  '09h — 12h',
  '12h — 14h',
  '14h — 17h',
  '17h — 19h',
  '19h — 21h',
  '21h — 00h',
] as const

/**
 * L affluence relevee sur les quatre dernieres semaines.
 *
 * Le chiffre est le taux d occupation du plateau, en pourcentage des postes
 * occupes. Une valeur negative signale une tranche fermee : le samedi ouvre a
 * 7h, le dimanche a 8h et ferme a 20h.
 */
const AFFLUENCE: readonly (readonly [string, readonly number[]])[] = [
  ['Lundi', [15, 45, 30, 60, 35, 95, 80, 25]],
  ['Mardi', [20, 50, 25, 55, 30, 90, 75, 20]],
  ['Mercredi', [15, 40, 35, 65, 45, 92, 78, 22]],
  ['Jeudi', [18, 48, 28, 58, 32, 88, 72, 20]],
  ['Vendredi', [22, 52, 30, 62, 40, 75, 55, 18]],
  ['Samedi', [-1, 35, 70, 80, 65, 45, 30, 10]],
  ['Dimanche', [-1, 30, 65, 72, 58, 40, 25, -1]],
]

/** Le mot qui va avec un taux d occupation. */
function niveau(taux: number): string {
  if (taux < 0) return 'Ferme'
  if (taux < 40) return 'Creux'
  if (taux < 70) return 'Correct'
  return 'Pointe'
}

/** Les coachs de la maison. */
const COACHS = [
  {
    nom: 'Sofiane Terki',
    role: 'Force athletique',
    detail:
      'Champion de France -93 kg en 2019. Prepare les passages de barre et les competitions.',
    chiffre: '11 ans',
    image: portrait('sport-sofiane', 'Sofiane Terki, coach de force athletique'),
  },
  {
    nom: 'Maud Ferrer',
    role: 'Hyrox et conditionnement',
    detail:
      'Deux podiums Hyrox Paris. Construit des cycles de six semaines, chiffres a l appui.',
    chiffre: '8 ans',
    image: portrait('sport-maud', 'Maud Ferrer, coach hyrox'),
  },
  {
    nom: 'Ivan Costa',
    role: 'Retour de blessure',
    detail:
      'Preparateur physique passe par le rugby. Travaille avec deux kinesitherapeutes du quartier.',
    chiffre: '14 ans',
    image: portrait('sport-ivan', 'Ivan Costa, preparateur physique'),
  },
  {
    nom: 'Lena Brou',
    role: 'Boxe et hiit',
    detail:
      'Ancienne boxeuse amateur. Ses cours du soir sont les plus remplis de la semaine.',
    chiffre: '6 ans',
    image: portrait('sport-lena', 'Lena Brou, coach de boxe'),
  },
]

/** Les trois formules, sans engagement long. */
const FORMULES = [
  {
    nom: 'Libre',
    prix: '39',
    unite: 'par mois',
    detail: 'Sans engagement. Resiliable a tout moment, en une phrase.',
    lignes: [
      'Acces 5h — minuit, 7 jours sur 7',
      'Les quatre plateaux',
      'Les 42 cours collectifs',
      'Vestiaires et serviettes',
    ],
    phare: false,
  },
  {
    nom: 'Suivi',
    prix: '69',
    unite: 'par mois',
    detail: 'Le plus pris. Un coach vous ecrit un programme et le corrige chaque mois.',
    lignes: [
      'Tout ce que contient Libre',
      'Un bilan de force a l entree',
      'Un programme ecrit, revu tous les 30 jours',
      'Deux seances encadrees par mois',
      'Mesures et photos de suivi',
    ],
    phare: true,
  },
  {
    nom: 'Duo',
    prix: '118',
    unite: 'par mois, a deux',
    detail: 'Deux badges, un seul prelevement. Chacun garde son programme.',
    lignes: [
      'Deux acces Suivi complets',
      '59 EUR par personne',
      'Seances encadrees a deux ou separement',
      'Un mois de suspension par an',
    ],
    phare: false,
  },
]

/**
 * Le comparatif ligne a ligne.
 *
 * Trois prix cote a cote ne disent pas ce qu il y a dedans : ces quinze lignes
 * repondent aux questions posees a l accueil, y compris celles qu on prefere
 * ne pas afficher — le preavis, la date de prelevement, le prix d une seance
 * encadree hors forfait.
 */
const COMPARATIF: readonly {
  readonly groupe: string
  readonly critere: string
  readonly valeurs: readonly [string, string, string]
}[] = [
  {
    groupe: 'Acces',
    critere: 'Amplitude',
    valeurs: ['5h — minuit', '5h — minuit', '5h — minuit'],
  },
  {
    groupe: 'Acces',
    critere: 'Les quatre plateaux',
    valeurs: ['Compris', 'Compris', 'Compris'],
  },
  {
    groupe: 'Acces',
    critere: 'Cours collectifs',
    valeurs: ['42 par semaine', '42 par semaine', '42 par semaine'],
  },
  {
    groupe: 'Acces',
    critere: 'Invite',
    valeurs: ['Non', 'Un par mois', 'Deux par mois'],
  },
  {
    groupe: 'Acces',
    critere: 'Autres salles du reseau',
    valeurs: ['Non', 'Non', 'Trois salles, Paris est'],
  },
  {
    groupe: 'Suivi',
    critere: 'Bilan de force',
    valeurs: [
      'A l entree',
      'A l entree, puis tous les 6 mois',
      'A l entree, puis tous les 6 mois',
    ],
  },
  {
    groupe: 'Suivi',
    critere: 'Programme ecrit',
    valeurs: ['Non', 'Revu tous les 30 jours', 'Un par personne, revu tous les 30 jours'],
  },
  {
    groupe: 'Suivi',
    critere: 'Seances encadrees',
    valeurs: ['A l unite, 45 EUR', 'Deux par mois', 'Deux par mois et par personne'],
  },
  {
    groupe: 'Suivi',
    critere: 'Mesures et photos',
    valeurs: ['Non', 'Tous les 30 jours', 'Tous les 30 jours'],
  },
  {
    groupe: 'Le contrat',
    critere: 'Duree d engagement',
    valeurs: ['Aucune', 'Aucune', 'Aucune'],
  },
  {
    groupe: 'Le contrat',
    critere: 'Preavis pour arreter',
    valeurs: ['Aucun', 'Aucun', 'Aucun, pour l un comme pour l autre'],
  },
  {
    groupe: 'Le contrat',
    critere: 'Frais de dossier',
    valeurs: ['0 EUR', '0 EUR', '0 EUR'],
  },
  {
    groupe: 'Le contrat',
    critere: 'Jour de prelevement',
    valeurs: ['Le 5', 'Le 5', 'Le 5, un seul pour les deux'],
  },
  {
    groupe: 'Le contrat',
    critere: 'Suspension',
    valeurs: ['Un mois par an', 'Un mois par an', 'Un mois par an, pour les deux'],
  },
  {
    groupe: 'Le contrat',
    critere: 'Badge perdu',
    valeurs: ['8 EUR', 'Offert', 'Offert'],
  },
]

/** Les horaires d ouverture, larges et affiches en grand. */
const HORAIRES: readonly (readonly [string, string, string])[] = [
  ['Lundi', '05h00', '00h00'],
  ['Mardi', '05h00', '00h00'],
  ['Mercredi', '05h00', '00h00'],
  ['Jeudi', '05h00', '00h00'],
  ['Vendredi', '05h00', '00h00'],
  ['Samedi', '07h00', '22h00'],
  ['Dimanche', '08h00', '20h00'],
]

/**
 * La ligne de mentions du pied.
 *
 * Le pied de cette page est un bandeau, pas un plan du site : quatre mentions
 * sur une ligne, et rien de plus. Ce que les colonnes disaient est deja dans
 * la page, atteignable par les liens de l affiche.
 */
const MENTIONS = [
  'Reglement interieur',
  'Conditions d abonnement',
  'Mediation',
  'Accessibilite',
] as const

/** Les liens de l affiche, poses sous le nom plutot que dans une barre. */
const LIENS: readonly (readonly [string, string])[] = [
  ['#plateaux', 'Plateaux'],
  ['#cours', 'Cours'],
  ['#coachs', 'Coachs'],
  ['#tarifs', 'Tarifs'],
  ['#horaires', 'Horaires'],
]

/**
 * Une bande qui traverse la page d un bord a l autre.
 *
 * Le fondu lateral est mis a zero : une affiche ne s eteint pas sur ses bords,
 * elle est coupee net par le mur.
 */
function Bande({
  mots,
  tone,
  reverse = false,
}: {
  readonly mots: readonly string[]
  readonly tone: 'accent' | 'encre'
  readonly reverse?: boolean
}): ReactElement {
  return (
    <div
      aria-hidden="true"
      className={
        tone === 'accent'
          ? `${ENCRE} o-border-b o-border-zinc-950 dark:o-border-zinc-50`
          : 'o-bg-zinc-950 o-border-b'
      }
      style={
        tone === 'accent' ? TEINTE : { ...ACCENT_CLAIR, borderBottomColor: accent(300) }
      }
    >
      <Marquee speed={34} reverse={reverse} fade={0} className="o-py-2.5">
        {mots.map((mot, rang) => (
          <span
            key={`${mot}-${String(rang)}`}
            className="o-px-6 o-text-sm o-font-black o-uppercase o-tracking-widest o-whitespace-nowrap"
          >
            {mot}
          </span>
        ))}
      </Marquee>
    </div>
  )
}

/**
 * Un onglet d affiche : un rectangle plein quand il est choisi.
 *
 * Ni pastille arrondie ni glissiere : la page n a aucun coin arrondi, et un
 * onglet y prend la forme d une vignette imprimee.
 */
function Onglet({
  actif,
  onClick,
  children,
}: {
  readonly actif: boolean
  readonly onClick: () => void
  readonly children: string
}): ReactElement {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={actif}
      onClick={onClick}
      className={
        actif
          ? 'o-border-w-1 o-border-zinc-950 dark:o-border-zinc-50 o-bg-zinc-950 dark:o-bg-zinc-50 o-px-4 o-py-2 o-text-xs o-font-black o-uppercase o-tracking-widest o-text-zinc-50 dark:o-text-zinc-950 focus:o-ring'
          : 'o-border-w-1 o-border-zinc-400 dark:o-border-zinc-600 o-px-4 o-py-2 o-text-xs o-font-black o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400 hover:o-border-brand-500 hover:o-text-brand-700 dark:hover:o-text-brand-300 o-transition-colors focus:o-ring'
      }
    >
      {children}
    </button>
  )
}

/**
 * Un compteur d affiche, qui roule quand la bande entre dans le champ.
 *
 * `CounterRoll` est un odometre : il ne roule que si sa valeur change. Le
 * compteur part donc de zero et prend sa valeur a l entree, ce qui donne le
 * roulement — et non un nombre pose. Sous mouvement reduit, la piece n anime
 * pas ses colonnes et le nombre s inscrit d un coup ; il reste juste.
 */
function Compteur({
  valeur,
  quoi,
  suffixe,
}: {
  readonly valeur: number
  readonly quoi: string
  readonly suffixe?: string
}): ReactElement {
  const [entree, vu] = useInView<HTMLDivElement>({ threshold: 0.35, once: true })
  const [montre, setMontre] = useState(0)
  useEffect(() => {
    if (vu) setMontre(valeur)
  }, [vu, valeur])
  return (
    <div ref={entree} className="o-border-t o-pt-5" style={REGLE_HAUTE}>
      <dt
        className="o-flex o-items-baseline o-text-5xl o-font-black o-tabular-nums o-tracking-tighter md:o-text-7xl"
        style={ACCENT_CLAIR}
      >
        <CounterRoll value={montre} locale="fr-FR" duration={1100} step={70} />
        {suffixe === undefined ? null : (
          <span className="o-text-2xl md:o-text-4xl">{suffixe}</span>
        )}
      </dt>
      <dd className="o-m-0 o-mt-3 o-text-xs o-font-black o-uppercase o-tracking-widest o-text-zinc-400">
        {quoi}
      </dd>
    </div>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('oswald')
  const [plateauId, setPlateauId] = useState(PLATEAUX[0]?.id ?? 'fonte')
  const plateau = PLATEAUX.find((item) => item.id === plateauId) ?? PLATEAUX[0]

  const [jourCours, setJourCours] = useState(0)
  const journee = PLANNING[jourCours] ?? PLANNING[0]

  const [jourAffluence, setJourAffluence] = useState(0)
  const releve = AFFLUENCE[jourAffluence] ?? AFFLUENCE[0]
  const taux = releve?.[1] ?? []
  const pointe = taux.indexOf(Math.max(...taux))
  const ouvertes = taux.filter((valeur) => valeur >= 0)
  const creux = ouvertes.length === 0 ? 0 : Math.min(...ouvertes)

  const [essai, setEssai] = useState({
    prenom: '',
    courriel: '',
    telephone: '',
    jour: 'Lundi',
    plateau: 'Charges libres',
  })
  const [fautes, setFautes] = useState<Record<string, string>>({})
  const [envoye, setEnvoye] = useState(false)

  /** Le numero de badge, deduit du nom et du jour : rien n est tire au sort. */
  const badge = `FNT-${String(
    ((essai.prenom.length * 37 + essai.jour.length * 19 + essai.courriel.length * 7) %
      800) +
      100,
  )}`

  return (
    <Porte forme="zoom" marque="Fonte">
      <div className={PAPIER} style={polices}>
        {/* ---------- La bande du haut ---------- */}
        <Bande
          tone="accent"
          mots={[
            'Ouvert 5h — minuit',
            '1520 m2 sur deux niveaux',
            'Pantin, metro Hoche',
            '42 cours par semaine',
            'Une semaine offerte',
            '14 racks a squat',
          ]}
        />

        {/* ---------- L affiche ---------- */}
        <section
          id="fonte"
          className="o-relative o-isolate o-overflow-hidden o-bg-zinc-950 o-text-zinc-50 dark:o-text-zinc-50"
        >
          <ElectricField
            className="o-absolute o-inset-0 o-z-0"
            speed={0.45}
            jitter={0.6}
            glow={0.35}
            branches={4}
            colors={['--o-palette-zinc-950', '--o-vitrine-300', '--o-palette-zinc-100']}
            fallback="o-bg-zinc-950"
          />

          {/*
          Un voile qui ne couvre que la bande centrale, la ou l affiche est
          imprimee : les eclairs restent entiers en haut et en bas, et la
          derniere ligne cesse de se perdre dans le halo.
        */}
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, color-mix(in oklab, var(--o-palette-zinc-950) 72%, transparent) 22%, color-mix(in oklab, var(--o-palette-zinc-950) 72%, transparent) 78%, transparent 100%)',
            }}
          />

          <div className="o-relative o-z-10 o-mx-auto o-max-w-7xl o-px-6 o-py-16 o-text-center md:o-py-24">
            {/*
            L affiche est montee cachee et se revele a travers le rideau qui
            part : chaque ligne surgit a son tour, du nom au bas de casse.
          */}
            <h1 style={AFFICHE}>
              <Surgit
                as="span"
                className="o-block o-text-6xl o-font-black o-uppercase o-tracking-tighter sm:o-text-8xl lg:o-text-9xl"
                style={ACCENT_CLAIR}
              >
                Fonte
              </Surgit>
              <Surgit as="span" delai={140} className="o-block">
                <TextPressure
                  className="o-block o-text-3xl o-font-black o-uppercase o-tracking-tighter o-text-zinc-50 sm:o-text-5xl lg:o-text-7xl"
                  graisseBasse={400}
                  graisseHaute={900}
                  chasse={30}
                  rayon={320}
                >
                  SOULEVE PLUS LOURD
                </TextPressure>
              </Surgit>
              <Surgit
                as="span"
                delai={280}
                className="o-mt-3 o-block o-text-lg o-font-black o-uppercase o-tracking-tight o-text-zinc-50 sm:o-text-2xl lg:o-text-4xl"
              >
                Salle de fonte — Pantin
              </Surgit>
              <Surgit
                as="span"
                delai={380}
                className="o-mt-2 o-block o-text-xs o-font-semibold o-uppercase o-tracking-widest sm:o-text-sm"
                style={ACCENT_CLAIR}
              >
                1520 m2 · 5h — minuit · 7 jours sur 7 · depuis 2018
              </Surgit>
            </h1>

            {/* Deux vignettes carrees : l affiche n a aucun coin arrondi. */}
            <Surgit
              delai={480}
              className="o-mt-10 o-flex o-flex-wrap o-justify-center o-gap-3"
            >
              <a href="#essai" className={BOUTON_ACCENT}>
                Une semaine offerte
                <Icon icon={ArrowRight} size={15} />
              </a>
              <a
                href="#tarifs"
                className={BOUTON_NOIR}
                style={{ borderWidth: '1px', borderColor: accent(300) }}
              >
                Les trois formules
              </a>
            </Surgit>

            {/* Les liens de l affiche : une ligne centree, pas une barre collante. */}
            <nav
              aria-label="Sections de la page"
              className="o-mt-10 o-flex o-flex-wrap o-justify-center o-gap-x-8 o-gap-y-3 o-border-t o-border-b o-border-zinc-700 o-py-4 o-text-xs o-font-black o-uppercase o-tracking-widest"
            >
              {LIENS.map(([href, libelle]) => (
                <a
                  key={href}
                  href={href}
                  className="o-no-underline o-text-zinc-300 dark:o-text-zinc-300 hover:o-text-brand-300 dark:hover:o-text-brand-300 o-transition-colors focus:o-ring"
                >
                  {libelle}
                </a>
              ))}
              <a
                href="#essai"
                className="o-no-underline o-underline o-underline-offset-4 o-text-brand-300 dark:o-text-brand-300 focus:o-ring"
              >
                Essai gratuit
              </a>
            </nav>
          </div>
        </section>

        {/* ---------- La bande du bas ---------- */}
        <Bande
          tone="encre"
          reverse
          mots={[
            '2140 adherents',
            '52 paires de dumbbells',
            'Six coachs sur le plateau',
            'Zero frais de dossier',
            'Bilan de force offert',
            '640 m2 de charges libres',
          ]}
        />

        {/*
        ---------- Le bandeau : la signature de mouvement de la page ----------

        Des mots geants qui traversent l affiche sans fin, et qui penchent avec
        la vitesse du defilement. Le contenu est legerement agrandi sous
        l inclinaison pour qu aucun coin ne decouvre le fond, et la bande est
        coupee net par ses bords.
      */}
        <div
          aria-hidden="true"
          className="o-relative o-overflow-hidden o-bg-zinc-950 o-py-8 md:o-py-12"
          style={ACCENT_CLAIR}
        >
          <div style={{ transform: 'scale(1.12)' }}>
            <ScrollVelocity strength={0.5} damping={9}>
              <Bandeau
                mots={['Squat', 'Traction', 'Traineau', 'Rowing', 'Kettlebell', 'Presse']}
                separateur="/"
                vitesse={38}
                taille="clamp(2.75rem, 10vw, 9rem)"
              />
            </ScrollVelocity>
          </div>
        </div>

        {/* ---------- Bande 3 : le planning collectif (papier) ---------- */}
        <section id="cours" aria-labelledby="cours-titre" className={PAPIER}>
          <div className={CADRE}>
            <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
              <h2 id="cours-titre" className={TITRE} style={AFFICHE}>
                Quarante-deux cours.
                <br />
                Six par jour.
              </h2>
              <p className="o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
                Aucun ne se reserve : vingt-quatre places, premier arrive. Le badge
                suffit, et le coach compte les entrees a la porte.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Jour du planning"
              className="o-mt-10 o-flex o-flex-wrap o-gap-2"
            >
              {PLANNING.map((item, index) => (
                <Onglet
                  key={item.jour}
                  actif={index === jourCours}
                  onClick={() => {
                    setJourCours(index)
                  }}
                >
                  {item.jour}
                </Onglet>
              ))}
            </div>

            <table className="o-mt-10 o-w-full o-text-left">
              <caption className="o-text-left o-text-xs o-font-black o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                Cours collectifs du {(journee?.jour ?? '').toLowerCase()}
              </caption>
              <thead>
                <tr className="o-border-b" style={REGLE_BASSE}>
                  <th
                    scope="col"
                    className="o-py-3 o-text-xs o-font-black o-uppercase o-tracking-widest"
                  >
                    Heure
                  </th>
                  <th
                    scope="col"
                    className="o-py-3 o-text-xs o-font-black o-uppercase o-tracking-widest"
                  >
                    Cours
                  </th>
                  <th
                    scope="col"
                    className="max-sm:o-hidden o-py-3 o-text-xs o-font-black o-uppercase o-tracking-widest"
                  >
                    Coach
                  </th>
                  <th
                    scope="col"
                    className="max-md:o-hidden o-py-3 o-text-xs o-font-black o-uppercase o-tracking-widest"
                  >
                    Salle
                  </th>
                  <th
                    scope="col"
                    className="o-py-3 o-text-right o-text-xs o-font-black o-uppercase o-tracking-widest"
                  >
                    Intensite
                  </th>
                </tr>
              </thead>
              <tbody>
                {(journee?.seances ?? []).map((seance) => (
                  <tr
                    key={`${journee?.jour ?? ''}-${seance.heure}`}
                    className="o-border-b o-border-zinc-300 dark:o-border-zinc-700"
                  >
                    <th
                      scope="row"
                      className="o-py-4 o-pr-4 o-text-xl o-font-black o-tabular-nums o-tracking-tighter"
                    >
                      {seance.heure}
                    </th>
                    <td className="o-py-4 o-pr-4">
                      <span className="o-block o-text-sm o-font-bold o-uppercase o-tracking-wide">
                        {seance.nom}
                      </span>
                      <span className="o-block o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
                        {seance.duree}
                        <span className="sm:o-hidden"> — {seance.coach}</span>
                      </span>
                    </td>
                    <td className="max-sm:o-hidden o-py-4 o-pr-4 o-text-sm o-text-zinc-700 dark:o-text-zinc-300">
                      {seance.coach}
                    </td>
                    <td className="max-md:o-hidden o-py-4 o-pr-4 o-text-sm o-text-zinc-700 dark:o-text-zinc-300">
                      {seance.salle}
                    </td>
                    <td className="o-py-4 o-text-right">
                      <span
                        className="o-inline-block o-px-2 o-py-1 o-text-xs o-font-black o-uppercase o-tracking-widest o-text-zinc-950 dark:o-text-zinc-950"
                        style={
                          seance.intensite === 'Modere'
                            ? { backgroundColor: accent(100) }
                            : seance.intensite === 'Soutenu'
                              ? { backgroundColor: accent(200) }
                              : { backgroundColor: accent(300) }
                        }
                      >
                        {seance.intensite}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------- Bande : les plateaux (teinte) ---------- */}
        <section
          id="plateaux"
          aria-labelledby="plateaux-titre"
          className={ENCRE}
          style={TEINTE}
        >
          <div className={CADRE}>
            <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
              <h2 id="plateaux-titre" className={TITRE} style={AFFICHE}>
                Le materiel,
                <br />
                piece par piece
              </h2>
              <div
                role="tablist"
                aria-label="Choisir un plateau"
                className="o-flex o-flex-wrap o-gap-2"
              >
                {PLATEAUX.map((item) => (
                  <Onglet
                    key={item.id}
                    actif={item.id === plateauId}
                    onClick={() => {
                      setPlateauId(item.id)
                    }}
                  >
                    {item.label}
                  </Onglet>
                ))}
              </div>
            </div>

            {plateau === undefined ? null : (
              <div className="o-mt-12 o-grid o-gap-10 lg:o-grid-cols-2">
                <div>
                  <img
                    key={plateau.image}
                    src={plateau.image}
                    alt={plateau.alt}
                    loading="lazy"
                    className="o-aspect-video o-w-full o-border-w-4 o-border-zinc-950 dark:o-border-zinc-50 o-object-cover"
                  />
                  <p className="o-mt-6 o-flex o-flex-wrap o-items-center o-gap-3 o-text-sm">
                    <span
                      className="o-px-2.5 o-py-1 o-text-xs o-font-black o-uppercase o-tracking-widest o-text-zinc-950 dark:o-text-zinc-950"
                      style={PASTILLE}
                    >
                      {plateau.surface}
                    </span>
                    <span className="o-text-zinc-700 dark:o-text-zinc-300">
                      {plateau.baseline}
                    </span>
                  </p>
                </div>

                <ul className="o-flex o-list-none o-flex-col">
                  {plateau.materiel.map(([quantite, quoi]) => (
                    <li
                      key={quoi}
                      className="o-flex o-items-baseline o-gap-5 o-border-b o-border-zinc-300 dark:o-border-zinc-700 o-py-4"
                    >
                      <span
                        className="o-w-24 o-shrink-0 o-text-2xl o-font-black o-tabular-nums o-tracking-tighter"
                        style={ACCENT_ENCRE}
                      >
                        {quantite}
                      </span>
                      <span className="o-text-sm o-font-medium o-uppercase o-tracking-wide o-text-zinc-800 dark:o-text-zinc-200">
                        {quoi}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/*
        ---------- Les compteurs qui roulent, sur l affiche noire ----------

        La forme de chiffres attribuee a cette page. Quatre nombres, et rien
        d autre : ni pictogramme, ni carte, ni halo. Ce que les formules
        contiennent est ecrit dessous, d un trait, sans quatre vignettes.
      */}
        <section
          aria-labelledby="chiffres-titre"
          className="o-bg-zinc-950 o-text-zinc-50 dark:o-text-zinc-50"
        >
          <div className={CADRE}>
            <h2 id="chiffres-titre" className={TITRE} style={AFFICHE}>
              Ce que la salle
              <br />
              compte vraiment
            </h2>

            <dl className="o-mt-14 o-grid o-gap-8 sm:o-grid-cols-2 lg:o-grid-cols-4">
              <Compteur valeur={1520} suffixe=" m2" quoi="sur deux niveaux" />
              <Compteur valeur={2140} quoi="adherents actifs" />
              <Compteur valeur={42} quoi="cours collectifs par semaine" />
              <Compteur valeur={19} suffixe=" h" quoi="ouvertes chaque jour" />
            </dl>

            <p
              className="o-mt-16 o-max-w-4xl o-border-t o-pt-8 o-text-sm o-font-medium o-leading-relaxed o-text-zinc-400"
              style={REGLE_HAUTE}
            >
              Compris dans les trois formules, sans supplement : les quatre plateaux, de
              5h a minuit · les quarante-deux cours, sans reservation · le bilan de force
              a l entree, puis tous les six mois · les vestiaires, casiers a code et
              serviettes lavees sur place.
            </p>
          </div>
        </section>

        {/*
        ---------- Les coachs : une feuille de match, pas quatre cartes ----------

        Une ligne par coach, le nom en capitales grasses, l anciennete en bout
        de ligne. Le portrait est une vignette de passage, pas un portrait de
        carte : c est le nom qui porte, comme sur une affiche de gala.
      */}
        <section id="coachs" aria-labelledby="coachs-titre" className={PAPIER}>
          <div className={CADRE}>
            <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
              <h2 id="coachs-titre" className={TITRE} style={AFFICHE}>
                Six coachs.
                <br />
                Toujours un sur le plateau.
              </h2>
              <p className="o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
                Ils ne vendent rien. Vous les arretez pour une correction, ils corrigent.
                Quatre d entre eux sont ici depuis l ouverture.
              </p>
            </div>

            <ol className="o-mt-14 o-m-0 o-list-none o-p-0">
              {COACHS.map((coach, rang) => (
                <li
                  key={coach.nom}
                  className="o-grid o-items-center o-gap-x-6 o-gap-y-4 o-border-t o-py-7 md:o-grid-cols-12"
                  style={REGLE_HAUTE}
                >
                  <span
                    aria-hidden="true"
                    className="o-text-xs o-font-black o-tabular-nums o-tracking-widest md:o-col-span-1"
                    style={ACCENT_ENCRE}
                  >
                    {String(rang + 1).padStart(2, '0')}
                  </span>
                  <img
                    src={coach.image.src}
                    alt={coach.image.alt}
                    width={160}
                    height={160}
                    loading="lazy"
                    className="o-size-14 o-shrink-0 o-object-cover md:o-col-span-1"
                  />
                  <h3
                    className="o-m-0 o-text-3xl o-font-black o-uppercase o-tracking-tighter md:o-col-span-4 md:o-text-5xl"
                    style={AFFICHE}
                  >
                    {coach.nom}
                  </h3>
                  <p className="o-m-0 o-text-xs o-font-black o-uppercase o-tracking-widest o-text-zinc-700 dark:o-text-zinc-300 md:o-col-span-2">
                    {coach.role}
                  </p>
                  <p className="o-m-0 o-text-sm o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300 md:o-col-span-3">
                    {coach.detail}
                  </p>
                  <span
                    className="o-text-xs o-font-black o-uppercase o-tracking-widest md:o-col-span-1 md:o-text-right"
                    style={ACCENT_ENCRE}
                  >
                    {coach.chiffre}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Bande : les tarifs et le comparatif (teinte) ---------- */}
        <section
          id="tarifs"
          aria-labelledby="tarifs-titre"
          className={ENCRE}
          style={TEINTE}
        >
          <div className={CADRE}>
            <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
              <h2 id="tarifs-titre" className={TITRE} style={AFFICHE}>
                Trois prix,
                <br />
                zero engagement
              </h2>
              <p className="o-max-w-sm o-text-sm o-font-medium o-leading-relaxed">
                Frais de dossier : 0 EUR. Preavis de resiliation : aucun. Le badge est
                actif dans l heure.
              </p>
            </div>

            <ul className="o-mt-14 o-grid o-list-none o-gap-6 lg:o-grid-cols-3">
              {FORMULES.map((formule) => (
                <li
                  key={formule.nom}
                  className={
                    formule.phare
                      ? 'o-flex o-flex-col o-border-w-4 o-border-zinc-950 dark:o-border-zinc-50 o-bg-zinc-950 o-p-8 o-text-zinc-50 dark:o-text-zinc-50'
                      : 'o-flex o-flex-col o-border-w-4 o-border-zinc-950 dark:o-border-zinc-50 o-p-8'
                  }
                >
                  <div className="o-flex o-items-center o-justify-between o-gap-3">
                    <h3 className="o-text-sm o-font-black o-uppercase o-tracking-widest">
                      {formule.nom}
                    </h3>
                    {formule.phare ? (
                      <span
                        className="o-px-2 o-py-0.5 o-text-xs o-font-black o-uppercase o-tracking-widest o-text-zinc-950 dark:o-text-zinc-950"
                        style={PASTILLE}
                      >
                        Le plus pris
                      </span>
                    ) : null}
                  </div>
                  <p className="o-mt-6 o-flex o-items-baseline o-gap-2">
                    <span
                      className="o-text-7xl o-font-black o-tabular-nums o-tracking-tighter"
                      style={formule.phare ? ACCENT_CLAIR : undefined}
                    >
                      {formule.prix}
                    </span>
                    <span
                      className={
                        formule.phare
                          ? 'o-text-xs o-font-semibold o-uppercase o-tracking-widest o-text-zinc-300'
                          : 'o-text-xs o-font-semibold o-uppercase o-tracking-widest'
                      }
                    >
                      EUR
                      <br />
                      {formule.unite}
                    </span>
                  </p>
                  <p
                    className={
                      formule.phare
                        ? 'o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-300'
                        : 'o-mt-4 o-text-sm o-font-medium o-leading-relaxed'
                    }
                  >
                    {formule.detail}
                  </p>
                  <ul className="o-mt-8 o-flex o-flex-1 o-list-none o-flex-col o-gap-3 o-text-sm">
                    {formule.lignes.map((ligne) => (
                      <li key={ligne} className="o-flex o-items-start o-gap-2.5">
                        <Icon
                          icon={Check}
                          size={16}
                          className="o-mt-0.5 o-shrink-0"
                          style={formule.phare ? ACCENT_CLAIR : ACCENT_ENCRE}
                        />
                        <span
                          className={formule.phare ? 'o-text-zinc-100' : 'o-font-medium'}
                        >
                          {ligne}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#essai"
                    className={
                      formule.phare
                        ? `o-mt-8 o-w-full ${BOUTON_ACCENT}`
                        : `o-mt-8 o-w-full ${BOUTON_NOIR}`
                    }
                  >
                    Commencer la semaine offerte
                  </a>
                </li>
              ))}
            </ul>

            {/*
            Le comparatif est un tableau imprime, pas une carte : filets epais,
            capitales, aucun coin arrondi. Il defile lateralement sous 768 px
            plutot que d ecraser trois colonnes dans 332 px.
          */}
            <h3 className="o-mt-20 o-text-2xl o-font-black o-uppercase o-tracking-tighter md:o-text-3xl">
              Ce qu il y a vraiment dedans
            </h3>
            <div className="o-mt-8 o-max-w-full o-overflow-x-auto">
              <table className="o-w-full o-min-w-96 o-text-left">
                <caption className="o-text-left o-text-xs o-font-black o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                  Les trois formules, ligne a ligne
                </caption>
                <thead>
                  <tr className="o-border-b" style={REGLE_BASSE}>
                    <th
                      scope="col"
                      className="o-py-3 o-pr-4 o-text-xs o-font-black o-uppercase o-tracking-widest"
                    >
                      Critere
                    </th>
                    {FORMULES.map((formule) => (
                      <th
                        key={formule.nom}
                        scope="col"
                        className="o-py-3 o-pr-4 o-text-xs o-font-black o-uppercase o-tracking-widest"
                      >
                        {formule.nom}
                        <span className="o-block o-text-xs o-font-medium o-normal-case o-tracking-normal o-text-zinc-600 dark:o-text-zinc-400">
                          {formule.prix} EUR {formule.unite}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARATIF.map((ligne, rang) => {
                    const nouveau = COMPARATIF[rang - 1]?.groupe !== ligne.groupe
                    return (
                      <tr
                        key={ligne.critere}
                        className="o-border-b o-border-zinc-300 dark:o-border-zinc-700"
                      >
                        <th
                          scope="row"
                          className="o-py-3.5 o-pr-4 o-align-top o-text-sm o-font-medium"
                        >
                          {nouveau ? (
                            <span
                              className="o-mb-1 o-block o-text-xs o-font-black o-uppercase o-tracking-widest"
                              style={ACCENT_ENCRE}
                            >
                              {ligne.groupe}
                            </span>
                          ) : null}
                          {ligne.critere}
                        </th>
                        {ligne.valeurs.map((valeur, colonne) => (
                          <td
                            key={`${ligne.critere}-${String(colonne)}`}
                            className="o-py-3.5 o-pr-4 o-align-top o-text-sm o-text-zinc-700 dark:o-text-zinc-300"
                          >
                            {valeur}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ---------- Bande : horaires et affluence (papier, sur stries) ---------- */}
        <section
          id="horaires"
          aria-labelledby="horaires-titre"
          className={`o-relative o-isolate o-overflow-hidden ${PAPIER}`}
        >
          {/*
          La hachure est neutre et non teintee : elle tient sur le papier comme
          sur l encre, la ou une strie d accent disparaitrait sur l un des deux.
        */}
          <Stripes
            className="o-absolute o-inset-0 o-z-0 o-pointer-events-none"
            width={4}
            gap={26}
            angle={70}
            color="color-mix(in oklab, var(--o-theme-fg) 9%, transparent)"
            background="transparent"
          />
          <div className={`o-relative o-z-10 ${CADRE}`}>
            <div className="o-grid o-gap-12 lg:o-grid-cols-2">
              <div>
                <h2 id="horaires-titre" className={TITRE} style={AFFICHE}>
                  5h — minuit
                </h2>
                <p className="o-mt-6 o-max-w-md o-text-sm o-leading-relaxed">
                  Dix-neuf heures par jour en semaine. Le badge ouvre la porte principale
                  ; a partir de 22h, un veilleur reste sur le plateau. Fermeture annuelle
                  : aucune.
                </p>
                <dl className="o-mt-10 o-grid o-gap-6 sm:o-grid-cols-2">
                  <div>
                    <dt className="o-flex o-items-center o-gap-2 o-text-xs o-font-black o-uppercase o-tracking-widest">
                      <Icon icon={MapPin} size={14} />
                      Adresse
                    </dt>
                    <dd className="o-mt-2 o-text-sm">
                      92 avenue Jean Lolive, 93500 Pantin. Metro Hoche, sortie 2.
                    </dd>
                  </div>
                  <div>
                    <dt className="o-flex o-items-center o-gap-2 o-text-xs o-font-black o-uppercase o-tracking-widest">
                      <Icon icon={Timer} size={14} />
                      Parking
                    </dt>
                    <dd className="o-mt-2 o-text-sm">
                      Quarante places velo sous l auvent, gratuit. Voitures : parking
                      Lolive, 2 EUR l heure.
                    </dd>
                  </div>
                </dl>
              </div>

              <table className="o-w-full o-text-left">
                <caption className="o-text-left o-text-xs o-font-black o-uppercase o-tracking-widest">
                  Horaires de la semaine
                </caption>
                <thead>
                  <tr className="o-border-b" style={REGLE_BASSE}>
                    <th
                      scope="col"
                      className="o-py-3 o-text-xs o-font-black o-uppercase o-tracking-widest"
                    >
                      Jour
                    </th>
                    <th
                      scope="col"
                      className="o-py-3 o-text-xs o-font-black o-uppercase o-tracking-widest"
                    >
                      Ouverture
                    </th>
                    <th
                      scope="col"
                      className="o-py-3 o-text-xs o-font-black o-uppercase o-tracking-widest"
                    >
                      Fermeture
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {HORAIRES.map(([jour, debut, fin]) => (
                    <tr
                      key={jour}
                      className="o-border-b o-border-zinc-400 dark:o-border-zinc-600"
                    >
                      <th
                        scope="row"
                        className="o-py-4 o-text-sm o-font-semibold o-uppercase o-tracking-wide"
                      >
                        {jour}
                      </th>
                      <td className="o-py-4 o-text-2xl o-font-black o-tabular-nums o-tracking-tighter">
                        {debut}
                      </td>
                      <td className="o-py-4 o-text-2xl o-font-black o-tabular-nums o-tracking-tighter">
                        {fin}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/*
            L affluence par tranche horaire : le tourniquet compte, on affiche.
            Les barres sont un melange de l accent vers le transparent, donc
            visibles sur la bande claire comme sur la bande sombre.
          */}
            <div className="o-mt-20 o-border-t o-pt-10" style={REGLE_HAUTE}>
              <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
                <h3 className="o-text-2xl o-font-black o-uppercase o-tracking-tighter md:o-text-3xl">
                  A quelle heure c est plein
                </h3>
                <p className="o-max-w-md o-text-sm o-leading-relaxed">
                  Taux d occupation du plateau, releve au tourniquet sur les quatre
                  dernieres semaines. Le creux du {(releve?.[0] ?? '').toLowerCase()}{' '}
                  tombe a {creux} %, la pointe a {Math.max(...taux)} % entre{' '}
                  {TRANCHES[pointe] ?? TRANCHES[5]}.
                </p>
              </div>

              <div
                role="tablist"
                aria-label="Jour de l affluence"
                className="o-mt-8 o-flex o-flex-wrap o-gap-2"
              >
                {AFFLUENCE.map(([jour], index) => (
                  <Onglet
                    key={jour}
                    actif={index === jourAffluence}
                    onClick={() => {
                      setJourAffluence(index)
                    }}
                  >
                    {jour}
                  </Onglet>
                ))}
              </div>

              <ul className="o-mt-10 o-grid o-list-none o-grid-cols-4 o-gap-4 sm:o-grid-cols-8">
                {taux.map((valeur, index) => (
                  <li
                    key={TRANCHES[index] ?? String(index)}
                    className="o-flex o-flex-col"
                  >
                    <div
                      className="o-flex o-h-40 o-w-full o-flex-col o-justify-end o-border-b"
                      style={REGLE_BASSE}
                      aria-hidden="true"
                    >
                      {valeur < 0 ? null : (
                        <div
                          className="o-w-full"
                          style={{
                            height: `${String(Math.max(valeur, 4))}%`,
                            backgroundColor: `color-mix(in oklab, ${accent(500)} ${String(
                              35 + Math.round(valeur * 0.6),
                            )}%, transparent)`,
                          }}
                        />
                      )}
                    </div>
                    <p className="o-mt-3 o-text-xs o-font-black o-uppercase o-tracking-widest">
                      {valeur < 0 ? 'Ferme' : `${String(valeur)} %`}
                    </p>
                    <p className="o-mt-1 o-text-xs o-tabular-nums o-text-zinc-700 dark:o-text-zinc-300">
                      {TRANCHES[index]}
                    </p>
                    <p className="o-sr-only">
                      {TRANCHES[index]} : {niveau(valeur)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ---------- La bande d appel ---------- */}
        <Bande
          tone="encre"
          mots={[
            'Une semaine gratuite',
            'Sans carte bancaire',
            'Badge actif en dix minutes',
            'Bilan de force compris',
            'Passez a l accueil',
            'Zero preavis',
          ]}
        />

        {/* ---------- Bande : l essai gratuit et son formulaire (teinte) ---------- */}
        <section
          id="essai"
          aria-labelledby="essai-titre"
          className={ENCRE}
          style={TEINTE}
        >
          <div className={CADRE}>
            <div className="o-grid o-gap-12 lg:o-grid-cols-2">
              <div>
                <h2
                  id="essai-titre"
                  className="o-text-5xl o-font-black o-uppercase o-tracking-tighter md:o-text-7xl"
                  style={AFFICHE}
                >
                  Une semaine.
                  <br />
                  Gratuite.
                  <br />
                  Sans carte.
                </h2>
                <p className="o-mt-8 o-max-w-md o-text-sm o-font-medium o-leading-relaxed">
                  Le badge d essai est actif dix minutes apres votre passage a l accueil,
                  avec une piece d identite. Il ouvre les quatre plateaux, les
                  quarante-deux cours et le vestiaire, pendant sept jours pleins.
                </p>
                <ul className="o-mt-10 o-flex o-list-none o-flex-col o-gap-4 o-text-sm">
                  {[
                    'Aucun moyen de paiement demande',
                    'Bilan de force compris, sur rendez-vous',
                    'Un coach vous fait le tour des plateaux',
                    'Rien ne se transforme en abonnement tout seul',
                  ].map((ligne) => (
                    <li key={ligne} className="o-flex o-items-start o-gap-3">
                      <Icon
                        icon={Check}
                        size={17}
                        className="o-mt-0.5 o-shrink-0"
                        style={ACCENT_ENCRE}
                      />
                      <span className="o-font-medium">{ligne}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="o-border-w-4 o-border-zinc-950 dark:o-border-zinc-50 o-p-6 md:o-p-8">
                {envoye ? (
                  <div>
                    <p
                      className="o-inline-block o-px-2.5 o-py-1 o-text-xs o-font-black o-uppercase o-tracking-widest o-text-zinc-950 dark:o-text-zinc-950"
                      style={PASTILLE}
                    >
                      Badge reserve
                    </p>
                    <h3
                      className="o-mt-6 o-text-3xl o-font-black o-uppercase o-tracking-tighter"
                      style={AFFICHE}
                    >
                      C est note, {essai.prenom}.
                    </h3>
                    <p className="o-mt-5 o-text-sm o-leading-relaxed">
                      Votre badge d essai porte le numero{' '}
                      <span className="o-font-black o-tabular-nums" style={ACCENT_ENCRE}>
                        {badge}
                      </span>
                      . Il vous attend a l accueil le {essai.jour.toLowerCase()}, valable
                      sept jours a partir de la premiere entree. Nous avons ecrit a{' '}
                      {essai.courriel}.
                    </p>
                    <p className="o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300">
                      Le coach de permanence vous fera le tour du plateau {'"'}
                      {essai.plateau.toLowerCase()}
                      {'"'} en premier. Prevoyez une paire de chaussures propres et une
                      piece d identite.
                    </p>
                    <button
                      type="button"
                      className={`o-mt-8 ${BOUTON_NOIR}`}
                      onClick={() => {
                        setEnvoye(false)
                        setFautes({})
                      }}
                    >
                      Inscrire quelqu un d autre
                      <Icon icon={ArrowRight} size={15} />
                    </button>
                  </div>
                ) : (
                  <form
                    noValidate
                    onSubmit={(evenement) => {
                      evenement.preventDefault()
                      const releves: Record<string, string> = {}
                      if (essai.prenom.trim() === '') {
                        releves['prenom'] = 'Il nous faut un prenom pour le badge.'
                      }
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(essai.courriel.trim())) {
                        releves['courriel'] =
                          'Une adresse valide : la confirmation part par courriel.'
                      }
                      setFautes(releves)
                      if (Object.keys(releves).length === 0) setEnvoye(true)
                    }}
                  >
                    <h3 className="o-text-xl o-font-black o-uppercase o-tracking-tight">
                      Reserver le badge d essai
                    </h3>
                    <p className="o-mt-3 o-text-sm o-text-zinc-700 dark:o-text-zinc-300">
                      Deux champs obligatoires, aucun mot de passe, aucun compte a creer.
                    </p>

                    <div className="o-mt-8 o-grid o-gap-5 sm:o-grid-cols-2">
                      <div className="sm:o-col-span-2">
                        <label className={ETIQUETTE} htmlFor="essai-prenom">
                          Prenom
                        </label>
                        <input
                          id="essai-prenom"
                          name="prenom"
                          type="text"
                          autoComplete="given-name"
                          className={CHAMP}
                          value={essai.prenom}
                          aria-invalid={fautes['prenom'] === undefined ? undefined : true}
                          aria-describedby={
                            fautes['prenom'] === undefined
                              ? undefined
                              : 'essai-prenom-faute'
                          }
                          onChange={(evenement) => {
                            setEssai({ ...essai, prenom: evenement.target.value })
                          }}
                        />
                        {fautes['prenom'] === undefined ? null : (
                          <p
                            id="essai-prenom-faute"
                            className="o-mt-2 o-text-xs o-font-semibold"
                            style={ACCENT_ENCRE}
                          >
                            {fautes['prenom']}
                          </p>
                        )}
                      </div>

                      <div className="sm:o-col-span-2">
                        <label className={ETIQUETTE} htmlFor="essai-courriel">
                          Courriel
                        </label>
                        <input
                          id="essai-courriel"
                          name="courriel"
                          type="email"
                          autoComplete="email"
                          className={CHAMP}
                          value={essai.courriel}
                          aria-invalid={
                            fautes['courriel'] === undefined ? undefined : true
                          }
                          aria-describedby={
                            fautes['courriel'] === undefined
                              ? undefined
                              : 'essai-courriel-faute'
                          }
                          onChange={(evenement) => {
                            setEssai({ ...essai, courriel: evenement.target.value })
                          }}
                        />
                        {fautes['courriel'] === undefined ? null : (
                          <p
                            id="essai-courriel-faute"
                            className="o-mt-2 o-text-xs o-font-semibold"
                            style={ACCENT_ENCRE}
                          >
                            {fautes['courriel']}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className={ETIQUETTE} htmlFor="essai-jour">
                          Premiere venue
                        </label>
                        <select
                          id="essai-jour"
                          name="jour"
                          className={CHAMP}
                          value={essai.jour}
                          onChange={(evenement) => {
                            setEssai({ ...essai, jour: evenement.target.value })
                          }}
                        >
                          {PLANNING.map((item) => (
                            <option key={item.jour} value={item.jour}>
                              {item.jour}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={ETIQUETTE} htmlFor="essai-plateau">
                          Ce qui vous interesse
                        </label>
                        <select
                          id="essai-plateau"
                          name="plateau"
                          className={CHAMP}
                          value={essai.plateau}
                          onChange={(evenement) => {
                            setEssai({ ...essai, plateau: evenement.target.value })
                          }}
                        >
                          {PLATEAUX.map((item) => (
                            <option key={item.id} value={item.label}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:o-col-span-2">
                        <label className={ETIQUETTE} htmlFor="essai-telephone">
                          Telephone — facultatif
                        </label>
                        <input
                          id="essai-telephone"
                          name="telephone"
                          type="tel"
                          autoComplete="tel"
                          className={CHAMP}
                          value={essai.telephone}
                          onChange={(evenement) => {
                            setEssai({ ...essai, telephone: evenement.target.value })
                          }}
                        />
                      </div>
                    </div>

                    <button type="submit" className={`o-mt-8 o-w-full ${BOUTON_ACCENT}`}>
                      <Icon icon={BicepsFlexed} size={17} />
                      Reserver mon badge
                    </button>
                    <p className="o-mt-4 o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                      Vos coordonnees servent a preparer le badge et rien d autre. Elles
                      sont effacees si vous ne venez pas dans les trente jours.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/*
        ---------- L appel : un mot geant, une vignette (A1) ----------

        Un ecran noir, une question de deux mots, un seul bouton. Rien d autre
        n y tient : c est la derniere affiche avant la sortie.
      */}
        <section
          aria-labelledby="appel-titre"
          className="o-bg-zinc-950 o-text-zinc-50 dark:o-text-zinc-50"
        >
          <div className="o-mx-auto o-max-w-7xl o-px-6 o-py-24 o-text-center md:o-py-40">
            <h2
              id="appel-titre"
              className="o-m-0 o-font-black o-uppercase o-tracking-tighter"
              style={{
                ...AFFICHE,
                ...ACCENT_CLAIR,
                fontSize: 'clamp(3rem, 15vw, 13rem)',
              }}
            >
              On souleve ?
            </h2>
            <p className="o-mx-auto o-mt-8 o-max-w-md o-text-sm o-font-medium o-leading-relaxed o-text-zinc-400">
              Sept jours pleins, sans carte bancaire, sans preavis. Le badge est actif dix
              minutes apres votre passage a l accueil.
            </p>
            <div className="o-mt-12 o-flex o-justify-center">
              <a href="#essai" className={BOUTON_ACCENT}>
                Reserver la semaine offerte
                <Icon icon={ArrowRight} size={16} />
              </a>
            </div>
          </div>
        </section>

        {/*
        ---------- Le pied : un bandeau, puis une ligne de mentions (P8) ----------

        Pas de colonnes de liens ni de mot-marque geant : la page se ferme comme
        elle s est ouverte, sur des mots qui traversent le mur, et une seule
        ligne de mentions dessous.
      */}
        <footer className="o-bg-zinc-950 o-text-zinc-50 dark:o-text-zinc-50">
          <div
            aria-hidden="true"
            className="o-overflow-hidden o-border-t o-border-zinc-800 o-py-7 md:o-py-10"
            style={ACCENT_CLAIR}
          >
            <Bandeau
              mots={[
                'Fonte',
                'Pantin',
                '5h — minuit',
                'Sans engagement',
                '1520 m2',
                'Metro Hoche',
              ]}
              separateur="—"
              inverse
              vitesse={30}
              taille="clamp(2.25rem, 8vw, 7rem)"
            />
          </div>
          <div className="o-mx-auto o-flex o-max-w-7xl o-flex-wrap o-items-start o-justify-between o-gap-x-10 o-gap-y-4 o-px-6 o-py-8 o-text-xs o-font-black o-uppercase o-tracking-widest o-text-zinc-400">
            <p className="o-m-0 o-leading-relaxed">
              <Icon
                icon={Dumbbell}
                size={15}
                className="o-mr-2 o-inline-block o-align-text-bottom"
                style={ACCENT_CLAIR}
                aria-hidden="true"
              />
              92 avenue Jean Lolive, 93500 Pantin — 01 48 45 90 31
              <br />© 2026 Fonte SAS — SIRET 902 118 447 00013
            </p>
            <nav aria-label="Mentions" className="o-flex o-flex-wrap o-gap-x-6 o-gap-y-2">
              {MENTIONS.map((mot) => (
                <a
                  key={mot}
                  href="#fonte"
                  className="o-text-zinc-400 dark:o-text-zinc-400 o-no-underline hover:o-text-brand-300 dark:hover:o-text-brand-300 o-transition-colors focus:o-ring"
                >
                  {mot}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
