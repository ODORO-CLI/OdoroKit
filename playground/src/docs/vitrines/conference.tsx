/**
 * Nord 26 — conference technique.
 *
 * ## Le parti pris : une affiche, puis une horloge
 *
 * La page ouvrait sur une fiche produit a deux colonnes — un titre de trois
 * lignes, un tableau, un panneau d achat colle. C etait une page de
 * documentation. Elle ouvre desormais sur le nom seul, en grand, sur le reseau
 * de points qui est le sujet meme d une conference : des gens qui se relient.
 *
 * ## Le programme est epingle
 *
 * Le tableau du programme a disparu. Le programme est maintenant une **scene
 * collee** : quatre ecrans de defilement font avancer l heure, moment par
 * moment, et chaque moment montre ce qui tourne dans les deux salles a la
 * fois. C est la seule maniere de faire sentir ce qu une grille horaire cache :
 * une seance sur trois oblige a en manquer une autre, et la page le calcule.
 *
 * ## Ce que la page vend
 *
 * Quatre categories, et surtout **quatre paliers de date** : le prix monte
 * avec le calendrier, et le tableau des paliers le dit en entier. L action
 * n est plus un panneau colle a droite mais une **barre fixee en bas de
 * l ecran**, qui suit la categorie choisie.
 *
 * ## Les chiffres
 *
 * Aucun indicateur mis en scene : ni barre de nombres, ni jauge. Les seuls
 * chiffres de la page sont des heures et des prix, c est-a-dire le produit.
 *
 * ## La couleur
 *
 * Aucune teinte n est ecrite en dur. Ce qui est de l accent passe par
 * {@link ENCRE} — l accent tire vers l encre du theme, donc fonce sur clair et
 * clair sur fonce — ou par {@link PLEIN} pour un aplat. Les neutres restent des
 * ardoises, et les bandes sombres dans les deux themes emploient une nuance
 * basse de l accent, faite en majorite de blanc.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import {
  Accessibility,
  ArrowRight,
  BedDouble,
  Bus,
  Check,
  Clock,
  MapPin,
  Mic,
  Phone,
  ShieldCheck,
  TrainFront,
  TriangleAlert,
  Utensils,
  Wifi,
} from '@odoro-cli/icons/filaire'
import { useState, type CSSProperties, type ReactElement } from 'react'

import { Constellation } from '@/odoro/background/Constellation.jsx'
import { Marquee } from '@/odoro/effect/Marquee.jsx'
import { Shuffle } from '@/odoro/text/Shuffle.jsx'
import { SegmentedControl } from '@/odoro/ui/SegmentedControl.jsx'

import { nuit } from './communs.jsx'
import { paysage, photo } from './media.js'
import { accent, accentDoux, encre } from './palettes.js'
import {
  Actions,
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
import { Chapitre, Epingle } from './scene.jsx'

/** Filet tire de l encre courante : le systeme n a pas d opacite sur couleur. */
const FILET = 'color-mix(in oklab, currentColor 20%, transparent)'

/**
 * L accent, tire vers l encre du theme.
 *
 * Une nuance pleine ne peut pas etre lisible sur les deux fonds : celle qui se
 * detache d une ardoise presque noire se perd sur le blanc. Melangee a l encre
 * du theme, elle bascule avec elle. Les quatre dixiemes et demi retenus sont la
 * limite basse ou il reste de la couleur, et la limite haute ou une couleur
 * choisie tres claire fonce encore assez.
 */
const ENCRE = encre()

/**
 * Un aplat plein d accent, et l encre qui va dessus.
 *
 * Le meme melange que {@link ENCRE}, employe en fond : son encre est alors le
 * fond du theme, ce qui rend le couple aussi contraste que l accent l est sur
 * la page — sans dependre de la clarte de la couleur choisie.
 */
const PLEIN: CSSProperties = { backgroundColor: ENCRE, color: 'var(--o-theme-bg)' }

/** L accent clair : ce qui s ecrit sur les bandes restees sombres. */
const CLAIR = accent(200)

/** Le genre d une seance. */
type Genre = 'Conference' | 'Atelier' | 'Table ronde' | 'Pause' | 'Cle'

/**
 * Une seance du programme.
 *
 * L heure est une quantite : c est ce qui permet de reperer les seances qui se
 * chevauchent. Elle compte les minutes depuis minuit.
 */
interface Seance {
  readonly id: string
  readonly debut: number
  readonly duree: number
  readonly salle: string
  readonly sujet: string
  readonly intervenant: string
  readonly genre: Genre
}

/** Le programme du mercredi. */
const JOUR_UN: readonly Seance[] = [
  {
    id: 'j1-0830',
    debut: 510,
    duree: 45,
    salle: 'Hall',
    sujet: 'Accueil, cafe et retrait des badges',
    intervenant: '—',
    genre: 'Pause',
  },
  {
    id: 'j1-0915',
    debut: 555,
    duree: 40,
    salle: 'Grand Amphi',
    sujet: 'Ce que quinze ans de dette technique nous ont appris',
    intervenant: 'Salome Rieux',
    genre: 'Cle',
  },
  {
    id: 'j1-1005',
    debut: 605,
    duree: 30,
    salle: 'Grand Amphi',
    sujet: 'Compiler un langage a types dependants en six mois',
    intervenant: 'Tarek Benali',
    genre: 'Conference',
  },
  {
    id: 'j1-1045',
    debut: 645,
    duree: 25,
    salle: 'Hall',
    sujet: 'Pause, viennoiseries et stands',
    intervenant: '—',
    genre: 'Pause',
  },
  {
    id: 'j1-1110',
    debut: 670,
    duree: 30,
    salle: 'Salle Bore',
    sujet: 'Un cache distribue qui tient en quatre cents lignes',
    intervenant: 'Ines Kovacic',
    genre: 'Conference',
  },
  {
    id: 'j1-1110b',
    debut: 670,
    duree: 30,
    salle: 'Salle Ferrel',
    sujet: 'Rendre un site utilisable au clavier, pour de vrai',
    intervenant: 'Hugo Lantier',
    genre: 'Conference',
  },
  {
    id: 'j1-1200',
    debut: 720,
    duree: 80,
    salle: 'Refectoire',
    sujet: 'Dejeuner assis, quatre services au choix',
    intervenant: '—',
    genre: 'Pause',
  },
  {
    id: 'j1-1320',
    debut: 800,
    duree: 150,
    salle: 'Atelier Nord',
    sujet: 'Ecrire un moteur de rendu WebGL a la main',
    intervenant: 'Nadia Vermeersch',
    genre: 'Atelier',
  },
  {
    id: 'j1-1400',
    debut: 840,
    duree: 30,
    salle: 'Salle Bore',
    sujet: 'Un an de compilations reproductibles, et ce que ca a coute',
    intervenant: 'Bastien Oury',
    genre: 'Conference',
  },
  {
    id: 'j1-1400b',
    debut: 840,
    duree: 30,
    salle: 'Salle Ferrel',
    sujet: 'Sortir d une couche d abstraction sans tout casser',
    intervenant: 'Come Delaunay',
    genre: 'Conference',
  },
  {
    id: 'j1-1440',
    debut: 880,
    duree: 30,
    salle: 'Salle Bore',
    sujet: 'Mesurer ce qu on ne sait pas reproduire',
    intervenant: 'Ines Kovacic',
    genre: 'Conference',
  },
  {
    id: 'j1-1520',
    debut: 920,
    duree: 30,
    salle: 'Salle Ferrel',
    sujet: 'Documenter pour six personnes, pas pour six mille',
    intervenant: 'Salome Rieux',
    genre: 'Conference',
  },
  {
    id: 'j1-1600',
    debut: 960,
    duree: 30,
    salle: 'Grand Amphi',
    sujet: 'Migrer huit cents services sans fenetre de coupure',
    intervenant: 'Come Delaunay',
    genre: 'Conference',
  },
  {
    id: 'j1-1640',
    debut: 1000,
    duree: 50,
    salle: 'Grand Amphi',
    sujet: 'Faut-il encore ecrire ses propres composants ?',
    intervenant: 'Cinq intervenants',
    genre: 'Table ronde',
  },
  {
    id: 'j1-1800',
    debut: 1080,
    duree: 120,
    salle: 'Hall',
    sujet: 'Buffet du soir et demonstrations libres',
    intervenant: '—',
    genre: 'Pause',
  },
]

/** Le programme du jeudi. */
const JOUR_DEUX: readonly Seance[] = [
  {
    id: 'j2-0900',
    debut: 540,
    duree: 30,
    salle: 'Hall',
    sujet: 'Cafe et rattrapage des retardataires',
    intervenant: '—',
    genre: 'Pause',
  },
  {
    id: 'j2-0930',
    debut: 570,
    duree: 40,
    salle: 'Grand Amphi',
    sujet: 'Le cout reel d une dependance',
    intervenant: 'Bastien Oury',
    genre: 'Cle',
  },
  {
    id: 'j2-1020',
    debut: 620,
    duree: 30,
    salle: 'Salle Bore',
    sujet: 'Tester un shader : ce qui marche, ce qui ment',
    intervenant: 'Nadia Vermeersch',
    genre: 'Conference',
  },
  {
    id: 'j2-1020b',
    debut: 620,
    duree: 30,
    salle: 'Salle Ferrel',
    sujet: 'Un design system qui survit a son equipe',
    intervenant: 'Salome Rieux',
    genre: 'Conference',
  },
  {
    id: 'j2-1100',
    debut: 660,
    duree: 150,
    salle: 'Atelier Nord',
    sujet: 'Profiler une application React jusqu a l image pres',
    intervenant: 'Ines Kovacic',
    genre: 'Atelier',
  },
  {
    id: 'j2-1110',
    debut: 670,
    duree: 30,
    salle: 'Salle Bore',
    sujet: 'Quinze ans de journaux de build, relus une fois',
    intervenant: 'Tarek Benali',
    genre: 'Conference',
  },
  {
    id: 'j2-1230',
    debut: 750,
    duree: 80,
    salle: 'Refectoire',
    sujet: 'Dejeuner assis, quatre services au choix',
    intervenant: '—',
    genre: 'Pause',
  },
  {
    id: 'j2-1400',
    debut: 840,
    duree: 30,
    salle: 'Grand Amphi',
    sujet: 'Chiffrer de bout en bout sans perdre la recherche',
    intervenant: 'Hugo Lantier',
    genre: 'Conference',
  },
  {
    id: 'j2-1400b',
    debut: 840,
    duree: 30,
    salle: 'Salle Ferrel',
    sujet: 'Servir des cartes sans serveur de cartes',
    intervenant: 'Nadia Vermeersch',
    genre: 'Conference',
  },
  {
    id: 'j2-1440',
    debut: 880,
    duree: 30,
    salle: 'Salle Bore',
    sujet: 'Vingt ans de journaux d incidents, releve par releve',
    intervenant: 'Come Delaunay',
    genre: 'Conference',
  },
  {
    id: 'j2-1530',
    debut: 930,
    duree: 30,
    salle: 'Grand Amphi',
    sujet: 'Ce qu on garde de Nord 26',
    intervenant: 'Tarek Benali',
    genre: 'Cle',
  },
  {
    id: 'j2-1600',
    debut: 960,
    duree: 60,
    salle: 'Hall',
    sujet: 'Cloture, cafe et depart des navettes',
    intervenant: '—',
    genre: 'Pause',
  },
]

/** Une journee du programme : la variante du produit. */
interface Journee {
  readonly id: string
  readonly libelle: string
  readonly legende: string
  readonly seances: readonly Seance[]
}

/**
 * Les deux journees.
 *
 * Le couple est fige en n-uplet : le premier element sert de repli quand
 * l identifiant retenu ne correspond a rien, et le systeme de types le sait
 * present sans qu il faille l affirmer.
 */
const JOURNEES: readonly [Journee, Journee] = [
  {
    id: 'mercredi',
    libelle: 'Mercredi 18',
    legende: 'Programme du mercredi 18 novembre 2026',
    seances: JOUR_UN,
  },
  {
    id: 'jeudi',
    libelle: 'Jeudi 19',
    legende: 'Programme du jeudi 19 novembre 2026',
    seances: JOUR_DEUX,
  },
]

/** L heure d une seance, lisible. */
function heure(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}h${String(minutes % 60).padStart(2, '0')}`
}

/** Une seance, augmentee de ce qu elle oblige a manquer. */
interface Ligne extends Seance {
  readonly paralleles: readonly string[]
}

/**
 * Ce qui tourne en meme temps qu une seance, ailleurs.
 *
 * Les pauses sont ecartees des deux cotes : un dejeuner qui recouvre un atelier
 * n est pas un choix, et le signaler noierait les vrais.
 */
function paralleles(journee: Journee, seance: Seance): readonly string[] {
  if (seance.genre === 'Pause') return []
  return journee.seances
    .filter(
      (autre) =>
        autre.id !== seance.id &&
        autre.genre !== 'Pause' &&
        autre.salle !== seance.salle &&
        Math.min(autre.debut + autre.duree, seance.debut + seance.duree) >
          Math.max(autre.debut, seance.debut),
    )
    .map((autre) => `${autre.sujet} — ${autre.salle}`)
}

/** Les lignes d une journee, calculees une fois par rendu. */
function lignes(journee: Journee): readonly Ligne[] {
  return journee.seances.map((seance) => ({
    ...seance,
    paralleles: paralleles(journee, seance),
  }))
}

/** Une pastille de genre, teintee de l accent plutot que d une couleur d etat. */
function Pastille({ genre }: { readonly genre: Genre }): ReactElement {
  return (
    <span
      className="o-inline-flex o-shrink-0 o-rounded-full o-px-2 o-py-0.5 o-font-mono o-text-xs o-uppercase o-tracking-wider o-whitespace-nowrap"
      style={
        genre === 'Pause'
          ? { backgroundColor: 'var(--o-theme-line)' }
          : { backgroundColor: accentDoux(500, 14), color: ENCRE }
      }
    >
      {genre}
    </span>
  )
}

/**
 * Les quatre moments d une journee.
 *
 * Le programme n est plus un tableau qu on parcourt du regard : il est epingle,
 * et c est le defilement qui fait avancer l heure. Les bornes sont choisies
 * pour qu aucun moment ne soit vide, ni d un jour ni de l autre — un acte vide
 * casserait la scene, et rien dans les donnees ne l interdit.
 */
const MOMENTS = [
  { titre: 'L ouverture', note: 'Le hall, le cafe, la premiere voix.', de: 0, a: 620 },
  {
    titre: 'La matinee',
    note: 'Les deux salles tournent : il faut deja choisir.',
    de: 620,
    a: 760,
  },
  {
    titre: 'L apres-midi',
    note: 'Les ateliers longs, vingt-quatre places chacun.',
    de: 760,
    a: 900,
  },
  { titre: 'Le soir', note: 'La cloture, puis ce qui se dit debout.', de: 900, a: 2000 },
] as const

/** Les seances d une journee qui tombent dans un moment. */
function seancesDuMoment(journee: Journee, rang: number): readonly Ligne[] {
  const moment = MOMENTS[rang] ?? MOMENTS[0]
  if (moment === undefined) return []
  return lignes(journee).filter(
    (seance) => seance.debut >= moment.de && seance.debut < moment.a,
  )
}

/** Un intervenant annonce. */
interface Intervenant {
  readonly nom: string
  readonly fonction: string
  readonly sujet: string
  readonly note: string
  readonly photo: string
}

/** Les huit intervenants annonces. */
const INTERVENANTS: readonly Intervenant[] = [
  {
    nom: 'Salome Rieux',
    fonction: 'Architecte, Groupe Vasseur',
    sujet: 'Ce que quinze ans de dette technique nous ont appris',
    note: 'Conference d ouverture, mercredi 09h15.',
    photo: photo('portrait-nord-salome', 320, 320),
  },
  {
    nom: 'Tarek Benali',
    fonction: 'Chercheur, laboratoire LIFL',
    sujet: 'Compiler un langage a types dependants en six mois',
    note: 'Deux passages, mercredi et jeudi.',
    photo: photo('portrait-nord-tarek', 320, 320),
  },
  {
    nom: 'Ines Kovacic',
    fonction: 'Ingenieure systeme, Kestrel',
    sujet: 'Un cache distribue qui tient en quatre cents lignes',
    note: 'Anime aussi l atelier de profilage.',
    photo: photo('portrait-nord-ines', 320, 320),
  },
  {
    nom: 'Hugo Lantier',
    fonction: 'Expert accessibilite, cabinet Alinea',
    sujet: 'Rendre un site utilisable au clavier, pour de vrai',
    note: 'Vingt ans d audits.',
    photo: photo('portrait-nord-hugo', 320, 320),
  },
  {
    nom: 'Nadia Vermeersch',
    fonction: 'Ingenieure graphique, studio Ourse',
    sujet: 'Ecrire un moteur de rendu WebGL a la main',
    note: 'Atelier de deux heures trente.',
    photo: photo('portrait-nord-nadia', 320, 320),
  },
  {
    nom: 'Come Delaunay',
    fonction: 'Responsable exploitation, Reseau Nord',
    sujet: 'Migrer huit cents services sans fenetre de coupure',
    note: 'Ancien pompier de garde.',
    photo: photo('portrait-nord-come', 320, 320),
  },
  {
    nom: 'Bastien Oury',
    fonction: 'Mainteneur de six paquets',
    sujet: 'Le cout reel d une dependance',
    note: 'Conference d ouverture du jeudi.',
    photo: photo('portrait-nord-bastien', 320, 320),
  },
  {
    nom: 'Lea Marchandeau',
    fonction: 'Journaliste technique',
    sujet: 'Animation des tables rondes',
    note: 'Tient le micro depuis la troisieme edition.',
    photo: photo('portrait-nord-lea', 320, 320),
  },
]

/** L ancre du detail d un intervenant, depuis sa vignette. */
function ancre(nom: string): string {
  return `intervenant-${nom.toLowerCase().split(' ').join('-')}`
}

/** Une categorie de billet. */
interface Billet {
  readonly nom: string
  /** Le prix au palier courant, en euros : les paliers s en deduisent. */
  readonly montant: number
  readonly note: string
  readonly inclus: readonly string[]
  /** Places ouvertes a la vente, et places encore libres. Zero vaut sans limite. */
  readonly quota: number
  readonly restant: number
}

/** Un prix, ecrit comme une billetterie l ecrit. */
function euros(montant: number): string {
  return `${String(montant)} EUR`
}

/**
 * Les paliers de date.
 *
 * Le prix d une conference associative ne se negocie pas, il vieillit : chaque
 * palier a sa date de bascule, et le tableau les montre tous, y compris ceux
 * qui sont passes. C est ce qui rend le tarif courant credible.
 */
const PALIERS = [
  { libelle: 'Premier lot', quand: 'jusqu au 30 juin', part: 0.72, etat: 'Epuise' },
  { libelle: 'Deuxieme lot', quand: 'jusqu au 30 septembre', part: 0.86, etat: 'Epuise' },
  { libelle: 'Tarif courant', quand: 'jusqu au 4 novembre', part: 1, etat: 'Ouvert' },
  { libelle: 'Sur place', quand: 'les 18 et 19 novembre', part: 1.18, etat: 'A venir' },
] as const

/** Le palier en vente : celui dont l etat est ouvert. */
const PALIER_COURANT = PALIERS.findIndex((palier) => palier.etat === 'Ouvert')

/** Les quatre categories mises en vente. */
const BILLETS: readonly [Billet, Billet, Billet, Billet] = [
  {
    nom: 'Etudiant',
    montant: 45,
    note: 'Sur justificatif, verifie au retrait du badge.',
    inclus: ['Les deux journees', 'Dejeuners compris', 'Captations a vie'],
    quota: 100,
    restant: 31,
  },
  {
    nom: 'Individuel',
    montant: 190,
    note: 'Le tarif de ceux qui paient de leur poche.',
    inclus: [
      'Les deux journees',
      'Un atelier au choix',
      'Dejeuners et buffet du soir',
      'Captations a vie',
    ],
    quota: 260,
    restant: 208,
  },
  {
    nom: 'Entreprise',
    montant: 420,
    note: 'Facture avec numero de commande, TVA recuperable.',
    inclus: [
      'Les deux journees',
      'Deux ateliers au choix',
      'Dejeuners et buffet du soir',
      'Acces au salon partenaires',
    ],
    quota: 120,
    restant: 96,
  },
  {
    nom: 'A distance',
    montant: 35,
    note: 'Les deux amphis en direct, pas les ateliers.',
    inclus: ['Direct des deux amphis', 'Salon de discussion', 'Captations a vie'],
    quota: 0,
    restant: 0,
  },
]

/** Ce que le prix comprend toujours, quelle que soit la categorie. */
const REASSURANCE = [
  'Prix nets, sans frais de dossier.',
  'Remboursement integral jusqu au 4 novembre.',
  'Transfert nominatif possible jusqu a la veille.',
  'Captations disponibles a vie, gratuitement.',
  'Vingt places sont reservees jusqu au 1er novembre a qui ne peut pas payer : ecrire, sans justificatif.',
] as const

/** Comment venir, et ce qu on trouve sur place. */
const ACCES = [
  {
    icone: TrainFront,
    titre: 'En train',
    corps:
      'Lille Flandres a onze minutes a pied. Lille Europe a quinze minutes, ou deux stations de metro. Paris a une heure, Bruxelles a trente-cinq minutes.',
  },
  {
    icone: Bus,
    titre: 'En transports',
    corps:
      'Metro ligne 2, station Bois Blancs. Bus 18 et 68, arret Filature. Navette gratuite depuis Flandres a 08h00 et 08h30, retour a 18h15 et 19h30.',
  },
  {
    icone: Accessibility,
    titre: 'Accessibilite',
    corps:
      'Batiment de plain-pied, quatre places reservees au premier rang de chaque salle, boucle magnetique dans le Grand Amphi, velotypie sur les deux conferences d ouverture.',
  },
  {
    icone: Wifi,
    titre: 'Sur place',
    corps:
      'Reseau sans fil dedie, une prise par siege dans les amphis, salle calme au premier etage, consigne a bagages au hall, garage a velos ferme.',
  },
] as const

/** Ou dormir, a quel prix, et jusqu a quand. */
const HOTELS = [
  {
    nom: 'Hotel de la Filature',
    distance: '4 minutes a pied',
    prix: '89 EUR la nuit, petit dejeuner compris',
    note: 'Code NORD26, vingt-cinq chambres bloquees jusqu au 20 octobre.',
  },
  {
    nom: 'Auberge des Bois Blancs',
    distance: '11 minutes a pied',
    prix: '38 EUR en dortoir, 62 EUR en chambre double',
    note: 'Quarante lits bloques jusqu au 3 novembre. Cuisine commune.',
  },
  {
    nom: 'Ibis Lille Centre',
    distance: '2 stations de metro',
    prix: '104 EUR la nuit',
    note: 'Code NORD26 par telephone uniquement, jusqu au 27 octobre.',
  },
] as const

/** Ce qu on mange, et ce qu on annonce a l inscription. */
const REPAS = [
  {
    titre: 'Dejeuner',
    corps:
      'Assis au refectoire, quatre services au choix, entre 12h00 et 13h20. Une file sans attente est reservee a qui suit l atelier de l apres-midi.',
  },
  {
    titre: 'Regimes',
    corps:
      'Une option vegetarienne et une option sans gluten a chaque service, annoncees a l inscription et modifiables jusqu au 10 novembre. Allergenes affiches au passe.',
  },
  {
    titre: 'Cafe et eau',
    corps:
      'En continu au hall, du premier accueil a la cloture. Gobelets consignes a un euro, fontaines a eau a chaque etage.',
  },
  {
    titre: 'Buffet du soir',
    corps:
      'Mercredi de 18h a 20h, compris dans les billets sur site. Six tables de demonstration libre, sans inscription.',
  },
] as const

/** Le calendrier de l appel a conferenciers. */
const CALENDRIER = [
  ['Ouverture', '2026-03-02', '2 mars 2026'],
  ['Cloture des propositions', '2026-06-30', '30 juin 2026, minuit'],
  ['Relecture a l aveugle', '2026-07-01', 'Du 1er au 20 juillet'],
  ['Reponses, refus compris', '2026-07-24', 'Au plus tard le 24 juillet'],
  ['Supports attendus', '2026-11-04', '4 novembre 2026'],
] as const

/** Les articles du code de conduite. */
const CONDUITE = [
  {
    icone: ShieldCheck,
    titre: 'Ce qui est attendu',
    corps:
      'Qu on parle du travail, pas de la personne. Qu une question soit une question. Qu un debutant puisse dire qu il n a pas compris sans que la salle soupire.',
  },
  {
    icone: TriangleAlert,
    titre: 'Ce qui ne l est pas',
    corps:
      'Propos ou images a caractere sexuel, remarques sur l apparence, l origine, le genre, la sante ou la croyance, photographie sans accord, insistance apres un refus, demarchage dans les salles.',
  },
  {
    icone: Phone,
    titre: 'Signaler',
    corps:
      'Deux personnes de reference, joignables sur place au badge orange et par telephone au 06 74 12 09 88, de 08h00 a 21h00 les deux jours. Un courriel : conduite@nord26.fr, relu par ces deux personnes seulement.',
  },
  {
    icone: Check,
    titre: 'Ce qui se passe ensuite',
    corps:
      'Ecoute d abord, sans mise en cause immediate. Selon la gravite : rappel, retrait du badge, ou exclusion sans remboursement. Une decision est ecrite et communiquee a la personne qui a signale.',
  },
] as const

/** Les editions precedentes. */
const EDITIONS = [
  {
    date: '2019',
    dateTime: '2019-11',
    title: 'Nord 19 — quatre-vingt-dix personnes',
    body: 'Une seule salle, prises multiples sur des rallonges, et un budget de 2 400 euros.',
  },
  {
    date: '2021',
    dateTime: '2021-11',
    title: 'Nord 21 — la premiere edition en ligne',
    body: 'Annulee sur place, rejouee en direct. Quatre mille connexions et une regie improvisee.',
  },
  {
    date: '2023',
    dateTime: '2023-11',
    title: 'Nord 23 — deux salles en parallele',
    body: 'Le programme a double, les captations deviennent systematiques et gratuites.',
  },
  {
    date: '2025',
    dateTime: '2025-11',
    title: 'Nord 25 — quatre cent vingt inscrits',
    body: 'Premiere edition avec ateliers longs, et premier appel a conferenciers ouvert.',
  },
  {
    date: '2026',
    dateTime: '2026-11',
    title: 'Nord 26 — deux jours, quatre salles',
    body: 'Vingt-six seances, six ateliers, et une jauge de quatre cent quatre-vingts places.',
  },
] as const

/**
 * L ouverture : le nom seul, sur le reseau de points.
 *
 * Une conference technique n a pas de produit a montrer. Ce qu elle a, c est un
 * nom, deux dates, une ville — et l idee que des gens se relient. Le reseau de
 * points dit cela mieux qu une photographie de salle, et il est la seule scene
 * de la page.
 */
function Ouverture(): ReactElement {
  return (
    <header
      id="haut"
      className="o-relative o-isolate o-flex o-flex-col o-overflow-hidden o-text-slate-50 dark:o-text-slate-50"
      style={{ ...nuit('slate'), minHeight: `calc(100vh - ${String(CHROME)}px)` }}
    >
      <Constellation
        aria-hidden="true"
        className="o-absolute o-inset-0 o-z-0"
        count={150}
        distance={0.6}
        attract={0.6}
        speed={0.4}
        colors={['--o-palette-slate-950', '--o-vitrine-500', '--o-vitrine-seconde']}
        poster="o-bg-slate-950"
      />
      <div
        aria-hidden="true"
        className="o-absolute o-inset-0 o-z-0"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, color-mix(in oklab, #020617 78%, transparent) 0%, color-mix(in oklab, #020617 30%, transparent) 42%, color-mix(in oklab, #020617 88%, transparent) 100%)',
        }}
      />
      <Grain opacite={0.05} />

      <BarreCoins
        marque="Nord 26"
        liens={[
          ['#programme', 'Programme'],
          ['#intervenants', 'Intervenants'],
          ['#billets', 'Tarifs'],
          ['#lieu', 'Venir'],
        ]}
        droite="18 — 19 novembre 2026"
      />

      <div className="o-relative o-z-10 o-flex o-grow o-flex-col o-justify-between o-px-4 o-pb-24 o-pt-8 md:o-px-6 md:o-pb-28">
        <Surgit>
          <Etiquette>Huitieme edition — La Filature, Lille</Etiquette>
        </Surgit>

        <div className="o-my-10">
          <Surgit
            delai={140}
            as="h1"
            className="o-m-0 o-whitespace-nowrap o-text-slate-50 dark:o-text-slate-50"
            style={{
              ...affiche('xxl', 800),
              fontSize: 'clamp(4rem, 19vw, 18rem)',
              lineHeight: 0.8,
              letterSpacing: '-0.07em',
            }}
          >
            Nord 26
          </Surgit>
          <Surgit
            delai={280}
            as="p"
            className="o-m-0 o-mt-6 o-max-w-3xl o-text-slate-100 dark:o-text-slate-100"
            style={{ ...affiche('m', 300), fontSize: 'clamp(1.35rem, 3.2vw, 2.75rem)' }}
          >
            Deux jours de conferences ecrites par des gens qui maintiennent ce dont ils
            parlent.
          </Surgit>
        </div>

        <div className="o-grid o-items-end o-gap-8 lg:o-grid-cols-12">
          <Surgit delai={420} className="lg:o-col-span-7">
            <Actions
              pleine={[
                '#billets',
                <>
                  Prendre une place{' '}
                  <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                </>,
              ]}
              fantome={['#programme', 'Lire le programme']}
            />
          </Surgit>
          <Surgit
            delai={520}
            as="p"
            className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-300 dark:o-text-slate-300 lg:o-col-span-5 lg:o-justify-self-end lg:o-text-right"
          >
            Vingt-six seances, six ateliers longs
            <br />
            Captations publiees sous quinze jours, gratuitement
            <br />
            Pas une seule keynote commerciale
          </Surgit>
        </div>
      </div>
      <Coin position="bg">
        88 rue de la Filature, Lille
        <br />
        Portes a 08h00
      </Coin>
      <Coin position="bd">
        Association Nord Commun
        <br />
        Comptes publies chaque annee
      </Coin>
    </header>
  )
}

/** Une seance, telle que la scene epinglee la montre. */
function SeanceEpinglee({ seance }: { readonly seance: Ligne }): ReactElement {
  return (
    <li className="o-grid o-items-baseline o-gap-x-5 o-gap-y-1 o-border-b o-border-slate-200 o-py-3 dark:o-border-slate-800 md:o-grid-cols-12 md:o-py-4">
      <p
        className="o-m-0 o-font-mono o-text-sm o-tabular-nums md:o-col-span-2"
        style={{ color: ENCRE }}
      >
        {heure(seance.debut)}
      </p>
      <div className="o-min-w-0 md:o-col-span-7">
        <p className="o-m-0 o-flex o-flex-wrap o-items-center o-gap-2 o-text-base o-font-medium o-tracking-tight md:o-text-lg">
          {seance.sujet}
          {seance.genre !== 'Conference' && <Pastille genre={seance.genre} />}
        </p>
        <p className="o-m-0 o-mt-0.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-text-slate-400">
          {seance.salle} — {seance.intervenant} — {seance.duree} min
        </p>
        {seance.paralleles.length > 0 && (
          <p className="max-sm:o-hidden o-m-0 o-mt-1 o-flex o-items-start o-gap-1.5 o-text-xs o-text-slate-600 dark:o-text-slate-400">
            <span aria-hidden className="o-mt-0.5 o-shrink-0" style={{ color: ENCRE }}>
              <Icon icon={TriangleAlert} size={12} />
            </span>
            {/* Une seule suffit a dire le choix : les lister toutes ferait de la
                ligne un paragraphe, et la scene tient sur un seul ecran. */}
            <span>
              En meme temps : {seance.paralleles[0]}
              {seance.paralleles.length > 1 &&
                ` ; et ${String(seance.paralleles.length - 1)} autre${seance.paralleles.length > 2 ? 's' : ''}`}
            </span>
          </p>
        )}
      </div>
      <p className="max-sm:o-hidden o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400 md:o-col-span-3 md:o-text-right">
        {seance.paralleles.length > 0 ? 'Un choix a faire' : 'Rien en face'}
      </p>
    </li>
  )
}

/**
 * Le programme, epingle.
 *
 * Quatre ecrans de defilement font avancer l heure : chaque acte montre un
 * moment de la journee choisie, et ce qui tourne en parallele dedans. Le nom du
 * moment est battu ({@link Shuffle}) a chaque changement d acte comme a chaque
 * changement de jour — c est le seul texte anime de la page, et il porte une
 * vraie donnee.
 */
function Programme({
  choisie,
  surChoix,
}: {
  readonly choisie: Journee
  readonly surChoix: (id: string) => void
}): ReactElement {
  const choix = lignes(choisie).filter((seance) => seance.paralleles.length > 0).length

  return (
    <section id="programme" aria-labelledby="programme-titre" className="o-scroll-mt-24">
      <div className="o-mx-auto o-max-w-7xl o-px-4 o-pt-20 md:o-px-6 md:o-pt-28">
        <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
          <div className="md:o-col-span-7">
            <Indice rang="01" sombre={false}>
              Le programme, a la minute
            </Indice>
            <h2
              id="programme-titre"
              className="o-m-0 o-mt-5 o-text-slate-950 dark:o-text-slate-50"
              style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.5vw, 4.25rem)' }}
            >
              Deux salles tournent. Il faut choisir.
            </h2>
          </div>
          <div className="o-min-w-0 md:o-col-span-5 md:o-justify-self-end">
            <SegmentedControl
              label="Journee affichee dans le programme"
              value={choisie.id}
              onChange={surChoix}
              options={JOURNEES.map((journee) => ({
                value: journee.id,
                label: journee.libelle,
              }))}
            />
            <p
              aria-live="polite"
              className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-600 dark:o-text-slate-400 md:o-text-right"
            >
              {choix} seances de cette journee
              <br />
              obligent a en manquer une autre
            </p>
          </div>
        </div>
      </div>

      <Epingle ecrans={4} actes={MOMENTS.length} className="o-mt-10">
        {(acte) => {
          const moment = MOMENTS[acte] ?? MOMENTS[0]
          const visibles = seancesDuMoment(choisie, acte)
          const premiere = visibles[0]
          const derniere = visibles[visibles.length - 1]
          return (
            <div
              className="o-flex o-h-full o-flex-col o-justify-center o-px-4 md:o-px-6"
              style={{ backgroundColor: 'var(--o-theme-bg)' }}
            >
              <div className="o-mx-auto o-grid o-w-full o-max-w-7xl o-gap-8 md:o-grid-cols-12 md:o-gap-12">
                <div className="md:o-col-span-4">
                  <p
                    className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: ENCRE }}
                  >
                    {choisie.libelle} novembre 2026
                  </p>
                  <h3
                    key={`${choisie.id}-${String(acte)}`}
                    className="o-m-0 o-mt-4 o-whitespace-nowrap o-text-slate-950 dark:o-text-slate-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.6rem, 3vw, 2.75rem)',
                    }}
                  >
                    <Shuffle declenchement="montage" step={24} duration={700}>
                      {moment?.titre ?? ''}
                    </Shuffle>
                  </h3>
                  <p className="o-m-0 o-mt-4 o-font-mono o-text-sm o-uppercase o-tabular-nums o-tracking-widest o-text-slate-600 dark:o-text-slate-400">
                    {premiere === undefined || derniere === undefined
                      ? '—'
                      : `${heure(premiere.debut)} — ${heure(derniere.debut + derniere.duree)}`}
                  </p>
                  <p className="max-sm:o-hidden o-m-0 o-mt-5 o-max-w-xs o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                    {moment?.note ?? ''}
                  </p>
                  {/* Les quatre actes, en traits : ou l on en est dans la journee. */}
                  <ol
                    aria-hidden="true"
                    className="o-m-0 o-mt-8 o-flex o-list-none o-gap-2 o-p-0"
                  >
                    {MOMENTS.map((autre, rang) => (
                      <li
                        key={autre.titre}
                        className="o-h-1 o-w-10 o-rounded-full"
                        style={{
                          backgroundColor: rang === acte ? ENCRE : 'var(--o-theme-line)',
                        }}
                      />
                    ))}
                  </ol>
                </div>
                <ol className="o-m-0 o-min-w-0 o-list-none o-border-t o-border-slate-200 o-p-0 dark:o-border-slate-800 md:o-col-span-8">
                  {visibles.map((seance) => (
                    <SeanceEpinglee key={seance.id} seance={seance} />
                  ))}
                </ol>
              </div>
            </div>
          )
        }}
      </Epingle>

      <p className="o-mx-auto o-mt-8 o-max-w-7xl o-px-4 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400 md:o-px-6">
        Les seances de l amphi ne se chevauchent jamais entre elles ; les salles Bore et
        Ferrel tournent en parallele, et la captation rattrape celle qu on a manquee —
        publiee sous quinze jours, gratuitement. Les ateliers demandent une inscription
        separee, ouverte trois semaines avant : vingt-quatre places chacun.
      </p>
    </section>
  )
}

/**
 * Les intervenants : le sujet d abord, la personne ensuite.
 *
 * On ne vient pas ecouter un nom, on vient pour un sujet : c est donc le sujet
 * qui porte la ligne, et le nom qui la legende. L etiquette de section reste
 * collee a gauche pendant que les huit passent — la seule section de la page
 * batie ainsi.
 */
function Intervenants(): ReactElement {
  return (
    <section
      id="intervenants"
      aria-labelledby="intervenants-titre"
      className="o-mx-auto o-max-w-7xl o-scroll-mt-24 o-px-4 o-py-20 md:o-px-6 md:o-py-28"
    >
      <Chapitre
        indice="(02) — Les voix annoncees"
        largeur={4}
        titre={
          <h2
            id="intervenants-titre"
            className="o-m-0 o-text-slate-950 dark:o-text-slate-50"
            style={{ ...affiche('m', 300), fontSize: 'clamp(1.85rem, 3.6vw, 3.5rem)' }}
          >
            Huit personnes qui maintiennent ce dont elles parlent.
          </h2>
        }
        texte={
          <>
            Huit creneaux restent ouverts : ils sortiront de l appel a conferenciers,
            jamais d une invitation.
          </>
        }
      >
        <ol className="o-m-0 o-list-none o-border-t o-border-slate-200 o-p-0 dark:o-border-slate-800">
          {INTERVENANTS.map((personne) => (
            <li
              key={personne.nom}
              id={ancre(personne.nom)}
              className="o-grid o-items-start o-gap-x-6 o-gap-y-3 o-border-b o-border-slate-200 o-py-6 dark:o-border-slate-800 md:o-grid-cols-12 md:o-py-8"
            >
              {/*
                `o-h-auto` est indispensable : l attribut `height` d une image est
                une indication de presentation que rien n ecrase ici, et le
                monogramme sortirait haut au lieu de carre.
              */}
              <img
                src={personne.photo}
                alt={`${personne.nom}, ${personne.fonction}`}
                width={320}
                height={320}
                loading="lazy"
                className="o-size-16 o-h-auto o-shrink-0 o-rounded-full o-object-cover md:o-col-span-2 md:o-size-20"
              />
              <div className="o-min-w-0 md:o-col-span-7">
                <h3
                  className="o-m-0 o-text-slate-950 dark:o-text-slate-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.3rem, 2.4vw, 2.25rem)',
                  }}
                >
                  {personne.sujet}
                </h3>
                <p className="o-m-0 o-mt-2 o-text-base o-text-slate-600 dark:o-text-slate-400">
                  {personne.nom} — {personne.fonction}
                </p>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-500 dark:o-text-slate-400 md:o-col-span-3 md:o-text-right">
                {personne.note}
              </p>
            </li>
          ))}
        </ol>
      </Chapitre>
    </section>
  )
}

/** Le lieu, les acces, l hebergement et les repas, sous le media. */
function Lieu(): ReactElement {
  // La photographie precedente (`nord-halle`) montrait l ecran d une
  // conference reelle et identifiable, avec son nom et son drapeau : une page
  // qui se dit a Lille en 2026 ne peut pas emprunter l affiche d un autre.
  const facade = paysage(
    'cadre-archive-couloir',
    'Le passage vitre de la Filature, charpente de fer et verriere',
  )

  return (
    <section
      id="lieu"
      aria-labelledby="lieu-titre"
      className="o-mx-auto o-max-w-7xl o-scroll-mt-24 o-px-4 o-py-20 md:o-px-6 md:o-py-24"
    >
      <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
        <div className="md:o-col-span-7">
          <Indice rang="03" sombre={false}>
            Le lieu
          </Indice>
          <h2
            id="lieu-titre"
            className="o-m-0 o-mt-5 o-text-slate-950 dark:o-text-slate-50"
            style={{ ...affiche('m', 300), fontSize: 'clamp(1.85rem, 3.6vw, 3.5rem)' }}
          >
            Venir, dormir, manger.
          </h2>
        </div>
        <p className="o-m-0 o-flex o-max-w-sm o-items-start o-gap-2 o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400 md:o-col-span-5 md:o-justify-self-end">
          <span aria-hidden className="o-mt-1 o-shrink-0" style={{ color: ENCRE }}>
            <Icon icon={MapPin} size={16} />
          </span>
          88 rue de la Filature, 59000 Lille — quatre salles, un hall et un refectoire
          dans une ancienne halle de tissage.
        </p>
      </div>

      <img
        src={facade.src}
        alt={facade.alt}
        width={1200}
        height={800}
        loading="lazy"
        className="o-mt-12 o-aspect-video o-h-auto o-w-full o-object-cover"
      />

      <dl className="o-mt-6 o-grid o-gap-x-8 o-gap-y-5 sm:o-grid-cols-2">
        {ACCES.map((entree) => (
          <div key={entree.titre}>
            <dt className="o-flex o-items-center o-gap-2 o-text-sm o-font-semibold">
              <span aria-hidden style={{ color: ENCRE }}>
                <Icon icon={entree.icone} size={17} />
              </span>
              {entree.titre}
            </dt>
            <dd className="o-m-0 o-mt-1.5 o-text-sm o-text-slate-600 dark:o-text-slate-400">
              {entree.corps}
            </dd>
          </div>
        ))}
      </dl>

      <h3 className="o-mt-10 o-flex o-items-center o-gap-2 o-text-base o-font-semibold o-tracking-tight">
        <span aria-hidden style={{ color: ENCRE }}>
          <Icon icon={BedDouble} size={18} />
        </span>
        Hebergement
      </h3>
      <p className="o-mt-2 o-text-sm o-text-slate-600 dark:o-text-slate-400">
        Trois adresses ont bloque des chambres au tarif de la conference. Le blocage tombe
        a la date indiquee : apres, le tarif public s applique.
      </p>
      <ul className="o-mt-4 o-flex o-list-none o-flex-col o-p-0">
        {HOTELS.map((hotel) => (
          <li
            key={hotel.nom}
            className="o-grid o-gap-x-6 o-gap-y-1 o-border-t o-border-slate-200 o-py-4 dark:o-border-slate-800 sm:o-grid-cols-12"
          >
            <p className="o-m-0 o-text-sm o-font-semibold sm:o-col-span-4">{hotel.nom}</p>
            <p className="o-m-0 o-text-sm o-text-slate-600 dark:o-text-slate-400 sm:o-col-span-3">
              {hotel.distance}
            </p>
            <p className="o-m-0 o-text-sm o-font-medium sm:o-col-span-5">{hotel.prix}</p>
            <p className="o-m-0 o-text-xs o-text-slate-600 dark:o-text-slate-400 sm:o-col-span-12">
              {hotel.note}
            </p>
          </li>
        ))}
      </ul>

      <h3 className="o-mt-10 o-flex o-items-center o-gap-2 o-text-base o-font-semibold o-tracking-tight">
        <span aria-hidden style={{ color: ENCRE }}>
          <Icon icon={Utensils} size={18} />
        </span>
        Restauration
      </h3>
      <dl className="o-mt-4 o-grid o-gap-x-8 o-gap-y-5 sm:o-grid-cols-2">
        {REPAS.map((repas) => (
          <div key={repas.titre}>
            <dt className="o-text-sm o-font-semibold">{repas.titre}</dt>
            <dd className="o-m-0 o-mt-1.5 o-text-sm o-text-slate-600 dark:o-text-slate-400">
              {repas.corps}
            </dd>
          </div>
        ))}
      </dl>

      <p className="o-mt-6 o-flex o-items-center o-gap-2 o-text-sm o-text-slate-600 dark:o-text-slate-400">
        <span aria-hidden className="o-inline-flex">
          <Icon icon={Clock} size={15} />
        </span>
        Ouverture des portes a 08h00 le mercredi, 08h30 le jeudi.
      </p>
    </section>
  )
}

/**
 * Les tarifs, par paliers de date.
 *
 * Un tableau, et pas quatre cartes de prix : les colonnes sont les categories,
 * les lignes les paliers, et la ligne du palier courant est la seule en encre
 * pleine. Le visiteur voit d un coup ce qu il a manque et ce qu il paiera s il
 * attend — ce qu une grille de cartes ne montre jamais.
 */
function Tarifs({
  choisi,
  surChoix,
}: {
  readonly choisi: Billet
  readonly surChoix: (nom: string) => void
}): ReactElement {
  return (
    <section
      id="billets"
      aria-labelledby="billets-titre"
      className="o-scroll-mt-24 o-border-t o-border-slate-200 o-px-4 o-py-20 dark:o-border-slate-800 md:o-px-6 md:o-py-28"
      style={{ backgroundColor: accentDoux(500, 5) }}
    >
      <div className="o-mx-auto o-max-w-7xl">
        <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
          <div className="md:o-col-span-7">
            <Indice rang="04" sombre={false}>
              Les tarifs
            </Indice>
            <h2
              id="billets-titre"
              className="o-m-0 o-mt-5 o-text-slate-950 dark:o-text-slate-50"
              style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.5vw, 4.25rem)' }}
            >
              Le prix monte avec le calendrier.
            </h2>
          </div>
          <p className="o-m-0 o-max-w-sm o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400 md:o-col-span-5 md:o-justify-self-end">
            Quatre categories, un seul programme, quatre cent quatre-vingts places sur
            site et un direct sans jauge. Rien ne se negocie, tout est affiche.
          </p>
        </div>

        {/* --- Le tableau des paliers ------------------------------------ */}
        <div className="o-mt-12 o-overflow-x-auto">
          <table
            className="o-w-full o-min-w-full o-text-left"
            style={{ borderCollapse: 'collapse' }}
          >
            <caption className="o-sr-only">
              Le prix de chaque categorie de billet, palier de date par palier de date
            </caption>
            <thead>
              <tr className="o-border-b o-border-slate-300 dark:o-border-slate-700">
                <th
                  scope="col"
                  className="o-py-3 o-pr-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-text-slate-400"
                >
                  Palier
                </th>
                {BILLETS.map((billet) => (
                  <th
                    key={billet.nom}
                    scope="col"
                    className="o-py-3 o-pl-6 o-text-right o-font-mono o-text-xs o-uppercase o-tracking-widest o-whitespace-nowrap"
                    style={{ color: billet.nom === choisi.nom ? ENCRE : undefined }}
                  >
                    {billet.nom}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PALIERS.map((palier, rang) => {
                const courant = rang === PALIER_COURANT
                return (
                  <tr
                    key={palier.libelle}
                    className="o-border-b o-border-slate-200 dark:o-border-slate-800"
                    style={courant ? { backgroundColor: accentDoux(500, 12) } : undefined}
                  >
                    <th scope="row" className="o-py-4 o-pr-6 o-font-normal">
                      <span className={courant ? 'o-block o-font-medium' : 'o-block'}>
                        {palier.libelle}
                      </span>
                      <span className="o-mt-0.5 o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-text-slate-400">
                        {palier.quand} — {palier.etat}
                      </span>
                    </th>
                    {BILLETS.map((billet) => (
                      <td
                        key={billet.nom}
                        className="o-py-4 o-pl-6 o-text-right o-tabular-nums o-whitespace-nowrap"
                        style={
                          courant
                            ? {
                                ...affiche('m', 300),
                                fontSize: 'clamp(1.25rem, 2.2vw, 2rem)',
                                color: ENCRE,
                              }
                            : {
                                color: 'var(--o-theme-muted)',
                                textDecoration:
                                  palier.etat === 'Epuise' ? 'line-through' : undefined,
                              }
                        }
                      >
                        {euros(Math.round(billet.montant * palier.part))}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* --- Ce que la categorie retenue comprend ---------------------- */}
        <div className="o-mt-14 o-grid o-gap-10 md:o-grid-cols-12">
          <div className="o-min-w-0 md:o-col-span-5">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-text-slate-400">
              Choisir sa categorie
            </p>
            {/* Quatre segments ne tiennent pas dans une colonne de telephone :
                le rail defile alors dans sa propre boite. */}
            <div className="o-mt-4 o-min-w-0 o-max-w-full o-overflow-x-auto">
              <SegmentedControl
                label="Categorie de billet"
                value={choisi.nom}
                onChange={surChoix}
                options={BILLETS.map((billet) => ({
                  value: billet.nom,
                  label: billet.nom,
                }))}
              />
            </div>
            <p
              aria-live="polite"
              className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400"
            >
              {choisi.note}{' '}
              {choisi.quota === 0
                ? 'Le direct n a pas de jauge.'
                : `Il reste ${String(choisi.restant)} places sur ${String(choisi.quota)}.`}
            </p>
          </div>
          <div className="o-min-w-0 md:o-col-span-4">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-text-slate-400">
              Compris dans le billet {choisi.nom}
            </p>
            <ul className="o-m-0 o-mt-4 o-flex o-list-none o-flex-col o-gap-2 o-p-0 o-text-sm">
              {choisi.inclus.map((ligne) => (
                <li key={ligne} className="o-flex o-items-start o-gap-2">
                  <span
                    aria-hidden
                    className="o-mt-0.5 o-inline-flex o-shrink-0"
                    style={{ color: ENCRE }}
                  >
                    <Icon icon={Check} size={15} />
                  </span>
                  {ligne}
                </li>
              ))}
            </ul>
          </div>
          <div className="o-min-w-0 md:o-col-span-3">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-text-slate-400">
              Ce qui vaut toujours
            </p>
            <ul className="o-m-0 o-mt-4 o-flex o-list-none o-flex-col o-gap-2 o-p-0 o-text-xs o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
              {REASSURANCE.map((ligne) => (
                <li key={ligne}>{ligne}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * La barre de billetterie, fixee en bas de l ecran.
 *
 * Elle remplace le panneau colle a droite : sur une page qui se lit en
 * defilant, l action ne doit pas prendre la moitie de la largeur pendant huit
 * ecrans. Elle porte le palier courant, la categorie retenue et son prix, et
 * elle ne parait qu une fois le rideau parti. Le pied reserve sa hauteur.
 */
function BarreBillets({
  choisi,
  surChoix,
}: {
  readonly choisi: Billet
  readonly surChoix: (nom: string) => void
}): ReactElement {
  const palier = PALIERS[PALIER_COURANT] ?? PALIERS[2]
  const prix = euros(Math.round(choisi.montant * (palier?.part ?? 1)))
  return (
    <div
      role="region"
      aria-label="Billetterie"
      className="o-fixed o-inset-x-0 o-bottom-0 o-z-40 o-border-t o-border-slate-300 o-backdrop-blur-xl dark:o-border-slate-700"
      style={{
        backgroundColor: 'color-mix(in oklab, var(--o-theme-bg) 88%, transparent)',
      }}
    >
      <div className="o-mx-auto o-flex o-max-w-7xl o-flex-wrap o-items-center o-gap-x-6 o-gap-y-3 o-px-4 o-py-3 md:o-px-6">
        <p className="max-sm:o-hidden o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-600 dark:o-text-slate-400">
          {palier?.libelle ?? 'Tarif courant'}
          <br />
          {palier?.quand ?? ''}
        </p>
        <div className="max-md:o-hidden o-min-w-0">
          <SegmentedControl
            label="Categorie de billet, dans la barre"
            value={choisi.nom}
            onChange={surChoix}
            options={BILLETS.map((billet) => ({ value: billet.nom, label: billet.nom }))}
          />
        </div>
        <p className="o-m-0 o-ml-auto o-flex o-items-baseline o-gap-3">
          <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-text-slate-400">
            {choisi.nom}
          </span>
          <span
            className="o-tabular-nums o-text-slate-950 dark:o-text-slate-50"
            style={{ ...affiche('m', 300), fontSize: 'clamp(1.25rem, 2.4vw, 1.9rem)' }}
          >
            {prix}
          </span>
        </p>
        <a
          href="#billets"
          className="o-inline-flex o-shrink-0 o-items-center o-gap-2 o-rounded-full o-px-5 o-py-2.5 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
          style={PLEIN}
        >
          Reserver
          <Icon icon={ArrowRight} size={15} aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}

/**
 * La bande qui separe la fiche des sections d information.
 *
 * ## Pourquoi aucun fond anime ici
 *
 * `background/Constellation` a d abord ete essaye sur cette bande : ses points
 * sont semes une fois, a la mise en place de la scene, avant que la bande n ait
 * sa largeur finale. Dans une bande de onze rem de large pour une de haut,
 * l amas retombe au centre sur deux cents pixels et se lit comme un accident,
 * pas comme un ciel. La scene a donc trouve sa place plus bas, sur une section
 * assez haute pour elle ; ici, un degrade d ardoise vers l accent suffit a
 * marquer la coupure, et il tient dans les deux themes.
 */
function Bande(): ReactElement {
  return (
    <section
      aria-label="Dates et lieu de Nord 26"
      className="o-mt-16 o-border-t o-border-b o-text-slate-50 dark:o-text-slate-50"
      style={{
        borderColor: accent(900),
        backgroundImage: `linear-gradient(to right, var(--o-palette-slate-950), ${accent(950)})`,
      }}
    >
      <div className="o-mx-auto o-flex o-max-w-7xl o-flex-wrap o-items-center o-justify-between o-gap-x-8 o-gap-y-2 o-px-4 o-py-10 md:o-px-6">
        <p className="o-m-0 o-text-xl o-font-bold o-tracking-tight o-text-slate-50 dark:o-text-slate-50 md:o-text-3xl">
          18 et 19 novembre 2026 — La Filature, Lille
        </p>
        <p className="o-m-0 o-text-sm o-font-medium" style={{ color: CLAIR }}>
          Portes a 08h00 — 480 places sur site — captations gratuites
        </p>
      </div>
    </section>
  )
}

/** Les editions precedentes, en releve. */
function Editions(): ReactElement {
  return (
    <section
      aria-labelledby="editions-titre"
      className="o-mx-auto o-max-w-7xl o-px-4 o-py-20 md:o-px-6 md:o-py-24"
    >
      <Indice rang="05" sombre={false}>
        Ce qui a precede
      </Indice>
      <h2
        id="editions-titre"
        className="o-m-0 o-mt-5 o-max-w-3xl o-text-slate-950 dark:o-text-slate-50"
        style={{ ...affiche('m', 300), fontSize: 'clamp(1.85rem, 3.6vw, 3.5rem)' }}
      >
        Sept editions plus tot, une salle et des rallonges.
      </h2>
      <ol className="o-mt-12 o-flex o-list-none o-flex-col o-p-0">
        {EDITIONS.map((edition) => (
          <li
            key={edition.date}
            className="o-grid o-gap-x-8 o-gap-y-1 o-border-t o-border-slate-200 o-py-4 dark:o-border-slate-800 sm:o-grid-cols-12"
          >
            <p className="o-m-0 sm:o-col-span-2">
              <time
                dateTime={edition.dateTime}
                className="o-text-sm o-font-semibold o-tabular-nums"
                style={{ color: ENCRE }}
              >
                {edition.date}
              </time>
            </p>
            <h3 className="o-m-0 o-text-base o-font-semibold o-tracking-tight sm:o-col-span-4">
              {edition.title}
            </h3>
            <p className="o-m-0 o-text-sm o-text-slate-600 dark:o-text-slate-400 sm:o-col-span-6">
              {edition.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/**
 * L appel a conferenciers, sur une nuit pleine.
 *
 * Le reseau de points a d abord vecu ici. Il est remonte a l ouverture, ou il
 * dit la meme chose a l echelle de la page entiere ; une seconde scene aurait
 * fait deux fois le meme effet a huit ecrans d intervalle. Ici, une nuit et un
 * calendrier suffisent : ce qui doit se voir, ce sont les dates limites.
 */
function AppelConferenciers(): ReactElement {
  return (
    <section
      id="appel"
      aria-labelledby="appel-titre"
      className="o-relative o-isolate o-scroll-mt-24 o-overflow-hidden o-bg-slate-950 o-px-4 o-py-20 o-text-slate-50 dark:o-text-slate-50 md:o-px-6 md:o-py-28"
    >
      <div className="o-relative o-z-10 o-mx-auto o-grid o-max-w-7xl o-gap-8 lg:o-grid-cols-12">
        <div className="lg:o-col-span-7">
          <p
            className="o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest"
            style={{ color: CLAIR }}
          >
            <span aria-hidden className="o-inline-flex">
              <Icon icon={Mic} size={16} />
            </span>
            (04) — L appel a conferenciers
          </p>
          <h2
            id="appel-titre"
            className="o-m-0 o-mt-5 o-text-balance o-text-slate-50 dark:o-text-slate-50"
            style={{ ...affiche('m', 300), fontSize: 'clamp(1.85rem, 3.6vw, 3.5rem)' }}
          >
            Huit creneaux ne sont pas encore attribues.
          </h2>
          <p className="o-mt-4 o-max-w-2xl o-text-base o-leading-relaxed o-text-slate-200 dark:o-text-slate-200">
            Proposez un sujet en une page : ce que vous avez construit, ce qui a rate, et
            ce que la salle en retire. Les propositions sont relues a l aveugle par six
            personnes — nom, employeur et titres retires du dossier — et chaque refus
            recoit une reponse ecrite.
          </p>
          <p className="o-mt-3 o-max-w-2xl o-text-base o-leading-relaxed o-text-slate-200 dark:o-text-slate-200">
            Les conferenciers retenus sont invites les deux jours, defrayes du train en
            seconde classe et d une nuit d hotel, et accompagnes par une personne de l
            equipe pour une repetition si elles le souhaitent. Une premiere fois se
            prepare a deux.
          </p>

          <a
            href="#fiche"
            className="o-mt-6 o-inline-flex o-items-center o-gap-2 o-rounded-lg o-bg-slate-50 o-px-5 o-py-3 o-text-sm o-font-semibold o-text-slate-950 o-no-underline dark:o-bg-slate-50 dark:o-text-slate-950 focus:o-ring"
          >
            Proposer un sujet
            <span aria-hidden className="o-inline-flex">
              <Icon icon={ArrowRight} size={16} />
            </span>
          </a>
        </div>

        <div
          className="o-rounded-xl o-p-6 lg:o-col-span-5"
          style={{
            backgroundColor: `color-mix(in oklab, ${accent(500)} 18%, var(--o-palette-slate-950))`,
          }}
        >
          <h3
            className="o-m-0 o-text-xs o-font-semibold o-uppercase o-tracking-widest"
            style={{ color: CLAIR }}
          >
            Les dates limites
          </h3>
          <dl className="o-mt-4 o-flex o-flex-col o-p-0 o-text-sm">
            {CALENDRIER.map(([quoi, iso, quand]) => (
              <div
                key={quoi}
                className="o-flex o-flex-wrap o-justify-between o-gap-x-4 o-gap-y-1 o-border-t o-py-2.5"
                style={{ borderColor: FILET }}
              >
                <dt className="o-font-semibold o-text-slate-50 dark:o-text-slate-50">
                  {quoi}
                </dt>
                <dd className="o-m-0 o-text-slate-200 dark:o-text-slate-200">
                  <time dateTime={iso}>{quand}</time>
                </dd>
              </div>
            ))}
          </dl>
          <p className="o-mt-4 o-text-sm o-text-slate-200 dark:o-text-slate-200">
            Formats : trente minutes, ou atelier de deux heures trente. Un sujet deja
            presente ailleurs est le bienvenu, a condition de le dire.
          </p>
        </div>
      </div>
    </section>
  )
}

/**
 * Le code de conduite : quatre articles sur des filets, pas quatre cartes.
 *
 * Une carte arrondie a pictogramme fait d un engagement une fonctionnalite. Un
 * article numerote sur un filet fait ce que fait un reglement affiche a
 * l entree d une salle : il se lit.
 */
function Conduite(): ReactElement {
  return (
    <section
      id="conduite"
      aria-labelledby="conduite-titre"
      className="o-mx-auto o-max-w-7xl o-scroll-mt-24 o-px-4 o-py-20 md:o-px-6 md:o-py-24"
    >
      <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
        <div className="md:o-col-span-7">
          <Indice rang="06" sombre={false}>
            Le cadre
          </Indice>
          <h2
            id="conduite-titre"
            className="o-m-0 o-mt-5 o-text-slate-950 dark:o-text-slate-50"
            style={{ ...affiche('m', 300), fontSize: 'clamp(1.85rem, 3.6vw, 3.5rem)' }}
          >
            Le code de conduite, en quatre articles.
          </h2>
        </div>
        <p className="o-m-0 o-max-w-sm o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-600 dark:o-text-slate-400 md:o-col-span-5 md:o-justify-self-end md:o-text-right">
          Les deux journees, le salon du direct et les rencontres du soir
          <br />
          Public, intervenants, partenaires et equipe
          <br />
          Texte complet affiche a l entree de chaque salle
        </p>
      </div>

      <ol className="o-m-0 o-mt-12 o-list-none o-border-t o-border-slate-200 o-p-0 dark:o-border-slate-800">
        {CONDUITE.map((article, rang) => (
          <li
            key={article.titre}
            className="o-grid o-items-start o-gap-x-8 o-gap-y-2 o-border-b o-border-slate-200 o-py-7 dark:o-border-slate-800 md:o-grid-cols-12"
          >
            <span
              aria-hidden="true"
              className="o-tabular-nums o-text-slate-950 dark:o-text-slate-50 md:o-col-span-2"
              style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3vw, 3rem)' }}
            >
              {String(rang + 1).padStart(2, '0')}
            </span>
            <h3 className="o-m-0 o-flex o-items-center o-gap-2 o-text-lg o-font-medium o-tracking-tight md:o-col-span-4 md:o-text-xl">
              <span aria-hidden style={{ color: ENCRE }}>
                <Icon icon={article.icone} size={18} />
              </span>
              <span className="o-sr-only">{String(rang + 1).padStart(2, '0')} — </span>
              {article.titre}
            </h3>
            <p className="o-m-0 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400 md:o-col-span-6">
              {article.corps}
            </p>
          </li>
        ))}
      </ol>

      <p className="o-mt-6 o-max-w-2xl o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
        Un compte rendu anonyme des signalements de l edition precedente est publie chaque
        annee en janvier : quatre en 2025, dont un ayant conduit a un retrait de badge.
      </p>
    </section>
  )
}

/**
 * Ceux qui portent l edition.
 *
 * Aucun logo : des noms, en gris, dans le corps de la page. Une association qui
 * n a pas d image de marque n a pas de fichiers vectoriels non plus.
 */
const PARTENAIRES = [
  'Region Hauts-de-France',
  'Ville de Lille',
  'La Filature',
  'Laboratoire LIFL',
  'Groupe Vasseur',
  'Kestrel',
  'Cabinet Alinea',
  'Fonds Nord Commun',
] as const

/** Les mentions du pied : une seule ligne, apres les partenaires. */
const MENTIONS: readonly (readonly [string, string])[] = [
  ['#programme', 'Programme'],
  ['#billets', 'Conditions de vente'],
  ['#conduite', 'Code de conduite'],
  ['#lieu', 'Accessibilite'],
]

/**
 * Le pied : les partenaires en gris, puis une ligne.
 *
 * Pas de plan du site en cinq colonnes : la page fait huit ecrans et sa
 * navigation est dans la barre du haut. Ce qu un pied de conference doit dire,
 * c est qui paie — et sous quelle licence sortent les captations.
 */
function Pied(): ReactElement {
  return (
    <footer className="o-border-t o-border-slate-200 o-pt-14 dark:o-border-slate-800">
      <p className="o-m-0 o-px-4 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-text-slate-400 md:o-px-6">
        Huitieme edition portee par
      </p>
      <div className="o-mt-6">
        <Marquee speed={52} fade={14}>
          {PARTENAIRES.map((nom) => (
            <span
              key={nom}
              className="o-shrink-0 o-whitespace-nowrap o-px-8 o-text-xl o-font-medium o-tracking-tight o-text-slate-500 dark:o-text-slate-400 md:o-px-12 md:o-text-2xl"
            >
              {nom}
            </span>
          ))}
        </Marquee>
      </div>
      {/* La barre de billetterie couvre le bas de l ecran : la ligne se pose au-dessus. */}
      <div className="o-mx-auto o-mt-12 o-flex o-max-w-7xl o-flex-wrap o-items-center o-justify-between o-gap-x-8 o-gap-y-3 o-border-t o-border-slate-200 o-px-4 o-py-6 o-pb-28 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-border-slate-800 dark:o-text-slate-400 md:o-px-6">
        <p className="o-m-0">
          Nord 26 — Association Nord Commun, 88 rue de la Filature, 59000 Lille —
          contact@nord26.fr
        </p>
        <ul className="o-m-0 o-flex o-list-none o-flex-wrap o-gap-5 o-p-0">
          {MENTIONS.map(([href, mot]) => (
            <li key={mot}>
              <a
                href={href}
                className="o-text-slate-600 o-no-underline hover:o-text-slate-950 dark:o-text-slate-400 dark:hover:o-text-slate-50 focus:o-ring"
              >
                {mot}
              </a>
            </li>
          ))}
          <li>Captations CC BY-SA 4.0 — © 2026</li>
        </ul>
      </div>
    </footer>
  )
}

/**
 * La vitrine.
 *
 * Deux etats vivent ici : la journee montree, qui pilote la scene epinglee du
 * programme, et la categorie retenue, qui pilote a la fois le tableau des
 * paliers et la barre fixee en bas. C est ce lien entre un choix et un prix qui
 * fait une billetterie ; ce qui a change, c est qu il ne mange plus la moitie
 * de la page.
 *
 * Aucune redefinition de marque : la barre de la documentation pose les
 * `--o-vitrine-*` sur le conteneur, et la page les lit.
 */
export default function Page(): ReactElement {
  const polices = usePolices('grotesk')
  const [journee, setJournee] = useState<string>(JOURNEES[0].id)
  const [categorie, setCategorie] = useState<string>(BILLETS[1].nom)

  const jour = JOURNEES.find((entree) => entree.id === journee) ?? JOURNEES[0]
  const choisi = BILLETS.find((billet) => billet.nom === categorie) ?? BILLETS[1]

  return (
    <Porte forme="compteur" marque="Nord 26">
      <div
        className="o-bg-white o-text-slate-900 dark:o-bg-slate-950 dark:o-text-slate-100"
        style={polices}
      >
        <Ouverture />
        <main>
          <Programme choisie={jour} surChoix={setJournee} />
          <Intervenants />
          <Bande />
          <Lieu />
          <Tarifs choisi={choisi} surChoix={setCategorie} />
          <AppelConferenciers />
          <Editions />
          <Conduite />
        </main>
        <Pied />
        <BarreBillets choisi={choisi} surChoix={setCategorie} />
      </div>
    </Porte>
  )
}
