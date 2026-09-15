/**
 * Meridien — cybersecurite.
 *
 * ## Le parti pris : une affiche noire, puis un pupitre
 *
 * Ce qui se vend ici n est pas un produit, c est une salle de veille. La page
 * ouvre donc sur une **affiche noire** — quatre mots en mono aux coins, une
 * accroche qui tient l ecran, deux gelules — et le pupitre de veille arrive
 * juste dessous, encore dans le noir, avec l hologramme qui tourne derriere sa
 * table. La coupe vers le corps clair est nette : c est la seule de la page.
 *
 * Le vocabulaire graphique vient du pupitre et tient jusqu au pied de page :
 * filets marques, angles droits, chiffres en chasse fixe et alignes, aucune
 * carte flottante ni ombre douce. Les delais contractuels, la conformite et la
 * chronologie de l incident sont des tableaux, parce que ce sont des tableaux.
 *
 * ## Le mouvement : les menaces s empilent
 *
 * La signature de la page est une pile. Les quatre familles de menaces qui
 * font l essentiel des dossiers se recouvrent l une l autre au defilement,
 * chacune retrecissant sous la suivante, et leur nom se derange une seconde
 * avant de se remettre en place. Aucune barre de compteurs : les chiffres de
 * la maison passent une seule fois, dans un ruban qui defile.
 *
 * ## Ce que la page fait
 *
 * Le pupitre filtre reellement, par gravite et par statut, et le dit : le
 * nombre de signaux retenus change avec le filtre, et une combinaison vide
 * rend une phrase plutot qu un tableau nu. La demande de demonstration
 * qualifie : la tranche de parc, l outil en place et l echeance decident du
 * delai annonce et de l analyste affecte, avant meme l envoi.
 *
 * ## La palette
 *
 * Aucune teinte ecrite en dur. La page lit `--o-vitrine-*`, l accent que la
 * barre pose sur son conteneur. `ENCRE` melange l accent a l encre du theme et
 * se lit donc sur les deux fonds ; `ENCRE_PUPITRE` est la nuance 200, reservee
 * au panneau qui reste sombre dans les deux themes.
 *
 * Les couleurs de gravite, elles, restent semantiques : le rouge d une alerte
 * critique n est pas la teinte du modele, c est une convention de metier. Elles
 * ne bougent donc pas avec la palette.
 *
 * ## Le fond
 *
 * Un seul contexte anime pour toute la page, et il est confine au pupitre :
 * l hologramme tourne derriere la table — un centre de veille regarde un objet
 * qu il fait pivoter —, adouci par un degrade oblique qui ne couvre que la
 * partie gauche du panneau. Le reste de la page n a aucun fond anime.
 *
 * Le pupitre reste sombre dans les deux themes ; ses encres y sont posees a la
 * main, sur la nuance 950 de la palette. Tout le reste suit le theme du lecteur
 * et se lit en plein jour.
 *
 * @module
 */

import { Icon, type IconData } from '@odoro-cli/icons'
import {
  ArrowRight,
  Bell,
  Check,
  ClipboardCheck,
  Fingerprint,
  Lock,
  Network,
  Radar as RadarIcon,
  Scale,
  ShieldCheck,
  Timer,
} from '@odoro-cli/icons/outline'
import { Button, Input, Select, Textarea } from '@odoro-cli/libs/ui'
import { useMotionState } from '@odoro-cli/engine'
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { Hologram } from '@/odoro/background/Hologram.jsx'
import { Marquee } from '@/odoro/effect/Marquee.jsx'
import { CinematicFooter } from '@/odoro/section/CinematicFooter.jsx'
import { StickyStack } from '@/odoro/section/StickyStack.jsx'
import { CountUp } from '@/odoro/text/CountUp.jsx'
import { GlitchText } from '@/odoro/text/GlitchText.jsx'
import { HighlightSweep } from '@/odoro/text/HighlightSweep.jsx'
import { ToastStack, type ToastItem } from '@/odoro/ui/ToastStack.jsx'

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
  TitreVague,
  usePolices,
} from './marche.jsx'

/** Le filet neutre de la page, derive de l encre courante. */
const FILET = 'color-mix(in oklab, currentColor 14%, transparent)'

/** Le filet clair des surfaces sombres. */
const FILET_SOMBRE = 'color-mix(in oklab, #ffffff 18%, transparent)'

/**
 * L encre d accent, sur un fond de theme.
 *
 * Une nuance fixe ne convient pas a toute couleur choisie : le cyan 700 se lit sur
 * du blanc, le lime 700 aussi, mais le lime 400 non — et en sombre c est
 * l inverse. Melanger l accent a l encre du theme fonce le melange sur fond
 * clair et l eclaircit sur fond sombre, d une seule ecriture.
 */
const ENCRE = encre()

/** La meme encre, plus appuyee : pour les grands chiffres, ou 3:1 suffit. */
const ENCRE_FORTE = encre()

/**
 * L encre d accent du pupitre.
 *
 * Le panneau reste sombre dans les deux themes et n herite donc pas de l encre
 * du theme. La nuance 200 melange la couleur choisie a deux tiers de blanc :
 * meme si le visiteur choisit un accent presque noir, elle reste au-dessus de
 * 9:1 sur la nuance 950 de la meme echelle, qui est elle-meme presque noire.
 */
const ENCRE_PUPITRE = accent(200)

/** L encre secondaire du pupitre, plus discrete mais encore lisible. */
const ENCRE_PUPITRE_DOUCE = accent(300)

/** L aplat d accent d un element choisi, sur fond de theme. */
const VOILE = accentDoux(500, 14)

/**
 * L aplat plein d un bouton d action.
 *
 * La piece de bibliotheque peint son bouton principal en nuance 600 sous une
 * encre blanche : cela tient pour un indigo, pas pour un lime ni un ambre. La
 * nuance 900 est la seule qui reste sombre pour toute couleur choisie dans la barre, et
 * l encre 50 de la meme echelle lui repond. Le style en ligne passe devant la
 * classe de la piece sans avoir a la surcharger par une feuille.
 */
const PLEIN_SOMBRE: CSSProperties = {
  backgroundColor: accent(900),
  color: accent(50),
}

/** L ardoise du pupitre : sombre pour toutes les palettes. */
const ARDOISE = accent(950)

/** L aplat des cellules du pupitre : l hologramme transparait entre elles. */
const CELLULE_SOMBRE = `color-mix(in srgb, ${accent(950)} 84%, transparent)`

/** Le voile oblique qui protege la table sans eteindre l hologramme. */
const VOILE_PUPITRE = [
  'linear-gradient(112deg,',
  `color-mix(in srgb, ${accent(950)} 96%, transparent) 0%,`,
  `color-mix(in srgb, ${accent(950)} 88%, transparent) 28%,`,
  `color-mix(in srgb, ${accent(950)} 68%, transparent) 52%,`,
  `color-mix(in srgb, ${accent(950)} 40%, transparent) 76%,`,
  `color-mix(in srgb, ${accent(950)} 6%, transparent) 100%)`,
].join(' ')

/**
 * Le halo de l affiche.
 *
 * Un seul foyer, decale au tiers droit, dans une nuance chaude de la palette :
 * c est ce qui empeche le noir d etre un aplat mort, sans ajouter un second
 * contexte anime a une page qui n en a droit qu a un.
 */
const HALO = [
  'radial-gradient(120% 95% at 78% 12%,',
  `color-mix(in srgb, ${accent(600)} 42%, transparent) 0%,`,
  `color-mix(in srgb, ${accent(800)} 30%, transparent) 34%,`,
  'transparent 68%)',
].join(' ')

/** Les liens de la barre du site. */
const LIENS: readonly { readonly libelle: string; readonly ancre: string }[] = [
  { libelle: 'Pupitre', ancre: '#veille' },
  { libelle: 'Menaces', ancre: '#menaces' },
  { libelle: 'Delais', ancre: '#delais' },
  { libelle: 'Conformite', ancre: '#conformite' },
]

/** Les degres de gravite, dans l ordre du journal. */
const GRAVITES = ['critique', 'elevee', 'moyenne', 'faible'] as const

/** Un degre de gravite. */
type Gravite = (typeof GRAVITES)[number]

/** Les statuts qu un signal peut porter. */
const STATUTS = ['Contenu', 'En cours', 'Surveille'] as const

/** Un statut de signal. */
type Statut = (typeof STATUTS)[number]

/**
 * Les teintes de gravite.
 *
 * Elles ne suivent pas la palette du modele : le rouge d une alerte critique
 * est une convention de metier, pas une decoration. Les quatre nuances 400 sont
 * toutes claires : elles tiennent au-dessus de 6:1 sur l ardoise du pupitre,
 * quelle que soit la couleur choisie pour celle-ci.
 */
const TEINTE_GRAVITE: Readonly<Record<Gravite, string>> = {
  critique: 'var(--o-palette-rose-400)',
  elevee: 'var(--o-palette-amber-400)',
  moyenne: 'var(--o-palette-sky-400)',
  faible: 'var(--o-palette-slate-400)',
}

/** Une ligne du tableau de veille. */
interface Signal {
  readonly heure: string
  readonly signal: string
  readonly source: string
  readonly gravite: Gravite
  readonly statut: Statut
  readonly etat: string
}

/** Les lignes du tableau de veille. */
const VEILLE: readonly Signal[] = [
  {
    heure: '14:02:11',
    signal: 'Exfiltration DNS suspecte, 41 requetes / s',
    source: 'passerelle-fr-02',
    gravite: 'critique',
    statut: 'Contenu',
    etat: 'Sortie bloquee en 4 s',
  },
  {
    heure: '13:58:47',
    signal: 'Chiffrement en masse amorce sur un partage bureautique',
    source: 'fichiers-siege',
    gravite: 'critique',
    statut: 'En cours',
    etat: 'Partage gele, analyste en ligne',
  },
  {
    heure: '13:47:56',
    signal: 'Connexion administrateur depuis un pays non declare',
    source: 'annuaire-siege',
    gravite: 'elevee',
    statut: 'Contenu',
    etat: 'Session revoquee',
  },
  {
    heure: '13:31:04',
    signal: 'Escalade de privileges sur un poste de developpement',
    source: 'poste-dev-118',
    gravite: 'elevee',
    statut: 'Contenu',
    etat: 'Poste isole du reseau',
  },
  {
    heure: '13:12:33',
    signal: 'Jeton d acces au registre d images utilise hors integration',
    source: 'registre-images',
    gravite: 'elevee',
    statut: 'En cours',
    etat: 'Jeton suspendu, origine en cours de tracage',
  },
  {
    heure: '12:58:22',
    signal: 'Depot public contenant une cle de service active',
    source: 'veille-externe',
    gravite: 'moyenne',
    statut: 'Contenu',
    etat: 'Cle revoquee, depot notifie',
  },
  {
    heure: '12:41:09',
    signal: 'Poste hors politique de mise a jour depuis 21 jours',
    source: 'parc-nantes',
    gravite: 'moyenne',
    statut: 'Surveille',
    etat: 'Correctif programme cette nuit',
  },
  {
    heure: '12:14:39',
    signal: 'Pic de refus d authentification, 1 240 tentatives',
    source: 'portail-clients',
    gravite: 'moyenne',
    statut: 'Contenu',
    etat: 'Limitation de debit appliquee',
  },
  {
    heure: '11:52:18',
    signal: 'Nouveau sous-domaine publie sans passer par la chaine de deploiement',
    source: 'veille-externe',
    gravite: 'faible',
    statut: 'Surveille',
    etat: 'Proprietaire identifie, regularisation demandee',
  },
  {
    heure: '11:40:07',
    signal: 'Certificat expirant dans 6 jours',
    source: 'edge-de-01',
    gravite: 'faible',
    statut: 'Surveille',
    etat: 'Renouvellement programme',
  },
]

/** Les alertes empilees a cote du tableau. */
const ALERTES: readonly ToastItem[] = [
  {
    id: 'a1',
    title: 'Exfiltration DNS contenue',
    description: 'passerelle-fr-02 — sortie bloquee en 4 s, analyste notifie.',
    tone: 'erreur',
  },
  {
    id: 'a2',
    title: 'Session administrateur revoquee',
    description: 'annuaire-siege — connexion depuis un pays non declare.',
    tone: 'alerte',
  },
  {
    id: 'a3',
    title: 'Cle de service revoquee',
    description: 'Trouvee dans un depot public il y a 11 minutes.',
    tone: 'succes',
  },
]

/**
 * Une cle qui change quand la couleur du modele change.
 *
 * ## Pourquoi une cle et non une propriete
 *
 * Les pieces du registre lisent leurs jetons de couleur au montage : elles
 * resolvent `--o-vitrine-*` une fois, puis vivent sur les valeurs obtenues.
 * C est le bon compromis pour une piece — relire a chaque image couterait un
 * calcul de style par image — mais cela veut dire qu un changement de couleur
 * dans la barre ne les atteint pas.
 *
 * Poser cette cle sur la scene la remonte quand la couleur ou le theme
 * changent, et un remontage relit les jetons. L observateur ne surveille que
 * deux attributs : le style du conteneur de la vitrine, ou la barre ecrit les
 * variables, et le theme de la racine. Rien n est lu par image.
 */
function useCleDeTeinte(): string {
  const [cle, setCle] = useState('')

  useEffect(() => {
    const racine = document.documentElement
    const conteneur = document.querySelector('[data-o-vitrine]')

    const relire = (): void => {
      const teinte =
        conteneur === null
          ? ''
          : getComputedStyle(conteneur).getPropertyValue('--o-vitrine-500').trim()
      setCle(`${teinte}|${racine.getAttribute('data-theme') ?? ''}`)
    }

    relire()
    const observateur = new MutationObserver(relire)
    if (conteneur !== null) {
      observateur.observe(conteneur, { attributes: true, attributeFilter: ['style'] })
    }
    observateur.observe(racine, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      observateur.disconnect()
    }
  }, [])

  return cle
}

/* ------------------------------------------------------------------------ */
/*                    Les delais d intervention contractuels                */
/* ------------------------------------------------------------------------ */

/** Un engagement de delai, par gravite. */
const DELAIS: readonly {
  readonly gravite: Gravite
  readonly definition: string
  readonly priseEnCharge: string
  readonly confinement: string
  readonly rapport: string
  readonly penalite: string
}[] = [
  {
    gravite: 'critique',
    definition:
      'Chiffrement en cours, exfiltration averee, compte a privileges compromis.',
    priseEnCharge: '5 min, 24 h sur 24',
    confinement: '15 min',
    rapport: '24 h',
    penalite: '15 % de la mensualite par heure de retard',
  },
  {
    gravite: 'elevee',
    definition: 'Acces anormal confirme, escalade de privileges, fuite de secret active.',
    priseEnCharge: '15 min, 24 h sur 24',
    confinement: '1 h',
    rapport: '48 h',
    penalite: '10 % de la mensualite par heure de retard',
  },
  {
    gravite: 'moyenne',
    definition:
      'Signal corrobore sans impact etabli : force brute, poste hors politique.',
    priseEnCharge: '2 h ouvrees',
    confinement: '1 jour ouvre',
    rapport: '5 jours ouvres',
    penalite: '5 % de la mensualite par jour de retard',
  },
  {
    gravite: 'faible',
    definition:
      'Hygiene et anticipation : certificat, exposition, ecart de configuration.',
    priseEnCharge: '1 jour ouvre',
    confinement: '5 jours ouvres',
    rapport: 'Rapport mensuel',
    penalite: 'Aucune',
  },
]

/** Ce que le contrat de service dit en plus des delais. */
const CONTRAT: readonly string[] = [
  'Les delais courent a partir de la detection par le pupitre, pas de votre appel.',
  'Ils sont mesures par un tiers et publies chaque mois, y compris quand nous les manquons.',
  'La penalite est deduite d office de la facture suivante : vous n avez rien a reclamer.',
  'Astreinte humaine 24 h sur 24, sept jours sur sept, en France, sans sous-traitance.',
  'Aucune limite au nombre d incidents traites : le forfait couvre l annee, pas un quota.',
]

/* ------------------------------------------------------------------------ */
/*                               Conformite                                 */
/* ------------------------------------------------------------------------ */

/** Un referentiel couvert, avec son etat verifiable. */
const CONFORMITE: readonly {
  readonly icone: IconData
  readonly nom: string
  readonly etat: 'Certifie' | 'Atteste' | 'En cours' | 'Agree'
  readonly couverture: number
  readonly echeance: string
  readonly preuve: string
}[] = [
  {
    icone: ShieldCheck,
    nom: 'ISO 27001',
    etat: 'Certifie',
    couverture: 100,
    echeance: 'Audit de surveillance en janvier 2027',
    preuve: '114 mesures suivies, preuves collectees en continu.',
  },
  {
    icone: ClipboardCheck,
    nom: 'SOC 2 type II',
    etat: 'Atteste',
    couverture: 100,
    echeance: 'Periode close le 31 decembre 2025',
    preuve: 'Douze mois d observation, sans exception relevee.',
  },
  {
    icone: Scale,
    nom: 'RGPD',
    etat: 'Atteste',
    couverture: 100,
    echeance: 'Registre revu en fevrier 2026',
    preuve: 'Donnees hebergees a Paris et a Francfort, jamais hors Union.',
  },
  {
    icone: Network,
    nom: 'NIS 2',
    etat: 'Certifie',
    couverture: 96,
    echeance: 'Declaration deposee le 17 octobre 2025',
    preuve: 'Notification d incident preparee en moins de 24 heures.',
  },
  {
    icone: Lock,
    nom: 'PCI DSS 4.0',
    etat: 'En cours',
    couverture: 78,
    echeance: 'Attestation attendue en septembre 2026',
    preuve: 'Perimetre de paiement segmente, chiffrement au repos en place.',
  },
  {
    icone: Fingerprint,
    nom: 'HDS',
    etat: 'Agree',
    couverture: 100,
    echeance: 'Agrement valide jusqu au 4 juin 2028',
    preuve: 'Pour les clients du secteur hospitalier et de l assurance.',
  },
]

/* ------------------------------------------------------------------------ */
/*                            L etude de cas                                */
/* ------------------------------------------------------------------------ */

/** La nuit de l incident, minute par minute. */
const CHRONOLOGIE: readonly {
  readonly heure: string
  readonly fait: string
  readonly machine: boolean
}[] = [
  {
    heure: '03 h 39 min 12 s',
    fait: 'Connexion du compte prestataire depuis une adresse jamais vue, hors plage horaire declaree.',
    machine: true,
  },
  {
    heure: '03 h 41 min 04 s',
    fait: 'Premier fichier chiffre sur le poste ENT-118. Le motif d ecriture en masse est reconnu.',
    machine: true,
  },
  {
    heure: '03 h 41 min 52 s',
    fait: 'Poste isole du reseau, sessions du compte prestataire revoquees, sauvegardes verrouillees.',
    machine: true,
  },
  {
    heure: '03 h 44 min 30 s',
    fait: 'Analyste de garde en ligne, perimetre confirme a un seul poste sur 2 400.',
    machine: false,
  },
  {
    heure: '04 h 02 min',
    fait: 'Responsable des systemes prevenue par message, avec le compte rendu de ce qui a deja ete fait.',
    machine: false,
  },
  {
    heure: '06 h 10 min',
    fait: 'Poste reconstruit depuis la sauvegarde de 02 h 00. Aucune donnee perdue.',
    machine: false,
  },
  {
    heure: '08 h 15 min',
    fait: 'Compte prestataire recree avec authentification a deux facteurs et plage horaire fermee.',
    machine: false,
  },
  {
    heure: '09 h 25 min',
    fait: 'Dossier d incident signe remis a la direction et a l assureur.',
    machine: false,
  },
]

/** Ce que le pupitre annonce. */
const PUPITRE: readonly { readonly libelle: string; readonly valeur: string }[] = [
  { libelle: 'Signaux traites aujourd hui', valeur: '48 210' },
  { libelle: 'Remontes a un analyste', valeur: '17' },
  { libelle: 'Median de confinement', valeur: '4 min 12 s' },
  { libelle: 'Faux positifs sur 30 jours', valeur: '0,8 %' },
]

/**
 * Les quatre familles de menaces, dans l ordre ou elles arrivent.
 *
 * ## Pourquoi une pile et non une grille
 *
 * Quatre cartes egales cote a cote diraient que les quatre se valent. Elles ne
 * se valent pas : elles se succedent dans un dossier reel, et la suivante
 * recouvre la precedente comme un signal chasse l autre sur un pupitre. Chaque
 * carte porte donc trois choses seulement — a quoi la menace ressemble sur le
 * fil, ce que la machine fait sans attendre, et en combien de temps.
 */
const MENACES: readonly {
  readonly cle: string
  readonly nom: string
  readonly part: string
  readonly signe: string
  readonly geste: string
  readonly median: string
}[] = [
  {
    cle: 'rancongiciel',
    nom: 'Rancongiciel',
    part: '41 % des dossiers ouverts en 2026',
    signe:
      'Une ecriture en masse sur un partage bureautique, la nuit, depuis un poste qui n avait jamais fait cela.',
    geste:
      'Le partage est gele et le poste isole avant le centieme fichier. Les sauvegardes passent en lecture seule dans la meme seconde.',
    median: '48 s avant isolation',
  },
  {
    cle: 'identite',
    nom: 'Compte compromis',
    part: '27 % des dossiers',
    signe:
      'Une connexion a privileges depuis un pays non declare, hors plage horaire, sans second facteur.',
    geste:
      'Session revoquee, jeton invalide, mot de passe force au prochain acces. L analyste de garde appelle le titulaire.',
    median: '2 min 40 s avant revocation',
  },
  {
    cle: 'exfiltration',
    nom: 'Exfiltration',
    part: '19 % des dossiers',
    signe:
      'Un flux sortant regulier vers un domaine cree la semaine derniere, encode dans des requetes de nom.',
    geste:
      'La sortie est coupee a la passerelle, et le volume deja parti est chiffre dans le dossier plutot que devine.',
    median: '4 s avant blocage',
  },
  {
    cle: 'exposition',
    nom: 'Exposition externe',
    part: '13 % des dossiers',
    signe:
      'Une cle de service dans un depot public, un sous-domaine publie hors chaine, un certificat oublie.',
    geste:
      'La cle est revoquee et le proprietaire identifie. La veille externe tourne sur votre nom de domaine, pas sur le notre.',
    median: '11 min avant revocation',
  },
]

/**
 * Le ruban de valeurs.
 *
 * C est la seule mise en scene de chiffres de la page : ni barre de compteurs,
 * ni cases bordees. Une bande qui passe, comme un bandeau de cours — sur un
 * pupitre, un chiffre defile, il ne se contemple pas.
 */
const RUBAN: readonly string[] = [
  '12 400 000 signaux analyses par jour',
  '4 min 12 s de median avant confinement',
  '99,4 % des attaques arretees avant impact',
  '340 parcs surveilles en Europe',
  '0,8 % de faux positifs sur trente jours',
  '3 incidents manques en 2026, analyses publiees',
  'Astreinte humaine en France, 24 h sur 24',
]

/* ------------------------------------------------------------------------ */
/*                       La qualification de la demande                     */
/* ------------------------------------------------------------------------ */

/** Les tranches de parc proposees. */
const TRANCHES = [
  {
    value: '1',
    label: 'Moins de 200 postes',
    analyste: 'un analyste',
    duree: '30 minutes',
  },
  {
    value: '2',
    label: 'De 200 a 1 000 postes',
    analyste: 'un analyste et un ingenieur de deploiement',
    duree: '40 minutes',
  },
  {
    value: '3',
    label: 'De 1 000 a 5 000 postes',
    analyste: 'un analyste principal et un architecte',
    duree: '60 minutes',
  },
  {
    value: '4',
    label: 'Plus de 5 000 postes',
    analyste: 'une equipe de trois, dont le responsable du pupitre',
    duree: '90 minutes, en deux seances',
  },
] as const

/** Les echeances proposees, avec le delai de reponse qu elles declenchent. */
const ECHEANCES = [
  {
    value: 'urgence',
    label: 'Incident en cours',
    delai: 'sous 30 minutes, par telephone',
  },
  { value: 'mois', label: 'Dans le mois', delai: 'sous 4 heures ouvrees' },
  { value: 'trimestre', label: 'Ce trimestre', delai: 'sous 1 jour ouvre' },
  { value: 'veille', label: 'Simple veille', delai: 'sous 3 jours ouvres' },
] as const

/** Les outils dont nous reprenons le plus souvent la place. */
const OUTILS = [
  {
    value: 'antivirus',
    label: 'Un antivirus de poste',
    note: 'Reprise sans desinstallation prealable : les deux agents cohabitent le temps de la bascule.',
  },
  {
    value: 'siem',
    label: 'Un collecteur de journaux',
    note: 'Vos regles existantes sont importees et rejouees sur trente jours d historique avant bascule.',
  },
  {
    value: 'infogerance',
    label: 'Une infogerance',
    note: 'Nous travaillons avec votre infogerant : le pupitre lui ouvre un acces en lecture.',
  },
  {
    value: 'rien',
    label: 'Rien de structure',
    note: 'La demonstration commence par un releve de votre exposition externe, sans rien installer.',
  },
] as const

/**
 * Le formulaire de demande, qui qualifie avant d envoyer.
 *
 * ## Pourquoi la qualification est visible avant l envoi
 *
 * Un formulaire qui se contente de dire « merci » fait porter au visiteur le
 * doute sur ce qui va se passer. Ici les trois champs de qualification
 * ecrivent, en direct, le delai de reponse contractuel, la duree de la seance
 * et qui sera en face. C est une promesse verifiable, formulee avant que la
 * demande parte — et c est aussi ce qui evite l appel de decouverte inutile.
 */
function Demande(): ReactElement {
  const [postes, setPostes] = useState('2')
  const [echeance, setEcheance] = useState('mois')
  const [outil, setOutil] = useState('antivirus')
  const [envoye, setEnvoye] = useState(false)

  const tranche = TRANCHES.find((t) => t.value === postes) ?? TRANCHES[1]
  const quand = ECHEANCES.find((e) => e.value === echeance) ?? ECHEANCES[1]
  const place = OUTILS.find((o) => o.value === outil) ?? OUTILS[0]

  return (
    <form
      className="o-flex o-flex-col o-gap-4 o-border-w-1 o-bg-white dark:o-bg-slate-950 o-p-6"
      style={{ borderColor: FILET }}
      onSubmit={(evenement) => {
        evenement.preventDefault()
        setEnvoye(true)
      }}
    >
      <h3 className="o-text-lg o-font-semibold o-tracking-tight">
        Demander une demonstration
      </h3>

      <Input label="Nom et prenom" name="nom" autoComplete="name" required />
      <Input
        label="Courriel professionnel"
        name="courriel"
        type="email"
        autoComplete="email"
        required
      />
      <Input label="Organisation" name="organisation" required />

      <Select
        label="Nombre de postes a surveiller"
        name="postes"
        value={postes}
        onChange={(evenement) => {
          setPostes(evenement.target.value)
          setEnvoye(false)
        }}
        options={TRANCHES.map((t) => ({ value: t.value, label: t.label }))}
      />
      <Select
        label="Ce qui est en place aujourd hui"
        name="outil"
        value={outil}
        onChange={(evenement) => {
          setOutil(evenement.target.value)
          setEnvoye(false)
        }}
        options={OUTILS.map((o) => ({ value: o.value, label: o.label }))}
      />
      <Select
        label="Echeance"
        name="echeance"
        value={echeance}
        onChange={(evenement) => {
          setEcheance(evenement.target.value)
          setEnvoye(false)
        }}
        options={ECHEANCES.map((e) => ({ value: e.value, label: e.label }))}
      />
      <Textarea
        label="Contexte"
        name="contexte"
        rows={3}
        hint="Incident recent, echeance d audit, contrainte reglementaire — ce qui nous aide a preparer."
      />

      {/* La qualification, ecrite avant l envoi et non apres. */}
      <div
        aria-live="polite"
        className="o-border-w-1 o-p-4 o-text-sm o-leading-relaxed"
        style={{ borderColor: accent(500), backgroundColor: VOILE }}
      >
        <p
          className="o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
          style={{ color: ENCRE }}
        >
          <Icon icon={Timer} size={13} aria-hidden="true" />
          Ce que votre demande declenche
        </p>
        <ul className="o-mt-3 o-flex o-list-none o-flex-col o-gap-2 o-p-0 o-text-sm">
          <li>
            Reponse <strong>{quand.delai}</strong>.
          </li>
          <li>
            Seance de <strong>{tranche.duree}</strong>, en face {tranche.analyste}.
          </li>
          <li>{place.note}</li>
        </ul>
      </div>

      <Button type="submit" tone="primary" size="lg" block style={PLEIN_SOMBRE}>
        Envoyer la demande
      </Button>

      <p
        role="status"
        aria-live="polite"
        className="o-text-xs o-text-slate-600 dark:o-text-slate-400"
      >
        {envoye
          ? `Demande enregistree. Un analyste vous repond ${quand.delai}. (Formulaire de demonstration : rien n est reellement envoye.)`
          : 'Vos coordonnees ne servent qu a cette demande et ne sont jamais revendues.'}
      </p>
    </form>
  )
}

/* ------------------------------------------------------------------------ */
/*                              Le pupitre                                  */
/* ------------------------------------------------------------------------ */

/**
 * Le pupitre de veille.
 *
 * ## Pourquoi deux filtres
 *
 * Une salle de veille ne se lit pas d un bloc : un responsable cherche ce qui
 * est critique, un analyste ce qui est encore ouvert. Les deux axes sont donc
 * separes, et le compte affiche dit combien de signaux restent — c est la seule
 * facon de savoir qu un filtre a mordu.
 *
 * Une combinaison vide n est pas un tableau sans lignes mais une phrase : sur
 * un pupitre, l absence de signal est elle-meme une information.
 */
function Pupitre(): ReactElement {
  const [gravite, setGravite] = useState<'toutes' | Gravite>('toutes')
  const [statut, setStatut] = useState<'tous' | Statut>('tous')
  const [alertes, setAlertes] = useState<readonly ToastItem[]>(ALERTES)
  // Remonte la scene quand la couleur ou le theme changent : la piece resout
  // ses jetons au montage, et ne les relit pas d elle-meme.
  const cleDeTeinte = useCleDeTeinte()

  const lignes = useMemo(
    () =>
      VEILLE.filter((ligne) => gravite === 'toutes' || ligne.gravite === gravite).filter(
        (ligne) => statut === 'tous' || ligne.statut === statut,
      ),
    [gravite, statut],
  )

  return (
    <div
      id="veille"
      className="lg:o-col-span-8 o-relative o-overflow-hidden"
      style={{
        backgroundColor: ARDOISE,
        color: ENCRE_PUPITRE,
        border: `1px solid ${FILET_SOMBRE}`,
      }}
    >
      <Hologram
        key={cleDeTeinte}
        className="o-absolute o-inset-0"
        rpm={3}
        meridians={12}
        parallels={7}
        flicker={0.4}
        colors={['--o-vitrine-950', '--o-vitrine-300', '--o-vitrine-100']}
        poster="o-bg-transparent"
      />
      <div
        aria-hidden
        className="o-absolute o-inset-0"
        style={{ background: VOILE_PUPITRE }}
      />

      <div className="o-relative o-flex o-h-full o-flex-col">
        {/* L entete du pupitre : d ou vient l extrait, et quand. */}
        <div
          className="o-flex o-flex-wrap o-items-center o-justify-between o-gap-3 o-px-4 o-py-3"
          style={{ borderBottom: `1px solid ${FILET_SOMBRE}` }}
        >
          <p
            className="o-font-mono o-text-xs o-uppercase o-tracking-widest"
            style={{ color: ENCRE_PUPITRE }}
          >
            Pupitre de veille — extrait du 12 avril 2026
          </p>
          <p
            className="o-flex o-items-center o-gap-2 o-font-mono o-text-xs"
            style={{ color: ENCRE_PUPITRE_DOUCE }}
          >
            <span
              aria-hidden
              className="o-block o-h-2 o-w-2 o-rounded-full"
              style={{ backgroundColor: accent(400) }}
            />
            Flux en direct — {lignes.length} {lignes.length > 1 ? 'signaux' : 'signal'}{' '}
            affiche
            {lignes.length > 1 ? 's' : ''} sur {VEILLE.length} retenus
          </p>
        </div>

        {/* Les deux filtres : par gravite, par statut. */}
        <div
          className="o-flex o-flex-wrap o-items-center o-gap-x-6 o-gap-y-3 o-px-4 o-py-3"
          style={{ borderBottom: `1px solid ${FILET_SOMBRE}` }}
        >
          <div
            role="group"
            aria-label="Filtrer par gravite"
            className="o-flex o-flex-wrap o-items-center o-gap-2"
          >
            <span
              aria-hidden
              className="o-font-mono o-text-xs o-uppercase o-tracking-widest"
              style={{ color: ENCRE_PUPITRE_DOUCE }}
            >
              Gravite
            </span>
            {(['toutes', ...GRAVITES] as const).map((choix) => {
              const actif = choix === gravite
              const teinte = choix === 'toutes' ? undefined : TEINTE_GRAVITE[choix]
              return (
                <button
                  key={choix}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => {
                    setGravite(choix)
                  }}
                  className="o-cursor-pointer o-px-2 o-py-1 o-font-mono o-text-xs o-uppercase focus:o-ring"
                  style={{
                    border: `1px solid ${actif ? (teinte ?? ENCRE_PUPITRE) : FILET_SOMBRE}`,
                    color: actif ? (teinte ?? ENCRE_PUPITRE) : ENCRE_PUPITRE_DOUCE,
                    backgroundColor: 'transparent',
                  }}
                >
                  {choix}
                </button>
              )
            })}
          </div>

          <div
            role="group"
            aria-label="Filtrer par statut"
            className="o-flex o-flex-wrap o-items-center o-gap-2"
          >
            <span
              aria-hidden
              className="o-font-mono o-text-xs o-uppercase o-tracking-widest"
              style={{ color: ENCRE_PUPITRE_DOUCE }}
            >
              Statut
            </span>
            {(['tous', ...STATUTS] as const).map((choix) => {
              const actif = choix === statut
              return (
                <button
                  key={choix}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => {
                    setStatut(choix)
                  }}
                  className="o-cursor-pointer o-px-2 o-py-1 o-font-mono o-text-xs o-uppercase focus:o-ring"
                  style={{
                    border: `1px solid ${actif ? ENCRE_PUPITRE : FILET_SOMBRE}`,
                    color: actif ? ENCRE_PUPITRE : ENCRE_PUPITRE_DOUCE,
                    backgroundColor: 'transparent',
                  }}
                >
                  {choix}
                </button>
              )
            })}
          </div>
        </div>

        <div className="o-flex o-flex-1 o-flex-col o-gap-4 o-p-4">
          {/* La table des signaux : elle defile dans son propre cadre. */}
          <div
            aria-live="polite"
            className="o-overflow-x-auto"
            style={{
              border: `1px solid ${FILET_SOMBRE}`,
              backgroundColor: CELLULE_SOMBRE,
            }}
          >
            {lignes.length === 0 ? (
              <p
                className="o-m-0 o-p-4 o-text-xs o-leading-relaxed"
                style={{ color: ENCRE_PUPITRE_DOUCE }}
              >
                Aucun signal de cette gravite dans ce statut sur l extrait du jour. Sur un
                pupitre, c est une bonne nouvelle : la combinaison existe, elle est
                simplement vide.
              </p>
            ) : (
              <table className="o-w-full o-text-left o-text-sm" style={{ minWidth: 620 }}>
                <caption className="o-sr-only">
                  Les signaux retenus par le pupitre de veille le 12 avril 2026, filtres
                  par gravite et par statut
                </caption>
                <thead>
                  <tr>
                    {['Heure', 'Signal', 'Source', 'Gravite', 'Statut', 'Etat'].map(
                      (entete) => (
                        <th
                          key={entete}
                          scope="col"
                          className="o-px-3 o-py-2 o-font-mono o-text-xs o-uppercase o-tracking-wide"
                          style={{
                            borderBottom: `1px solid ${FILET_SOMBRE}`,
                            color: ENCRE_PUPITRE_DOUCE,
                          }}
                        >
                          {entete}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((ligne) => (
                    <tr key={ligne.heure}>
                      <th
                        scope="row"
                        className="o-px-3 o-py-2 o-align-top o-font-mono o-text-xs o-font-normal o-tabular-nums o-whitespace-nowrap"
                        style={{
                          borderTop: `1px solid ${FILET_SOMBRE}`,
                          color: ENCRE_PUPITRE_DOUCE,
                        }}
                      >
                        {ligne.heure}
                      </th>
                      <td
                        className="o-px-3 o-py-2 o-align-top o-text-xs"
                        style={{
                          borderTop: `1px solid ${FILET_SOMBRE}`,
                          color: ENCRE_PUPITRE,
                        }}
                      >
                        {ligne.signal}
                      </td>
                      <td
                        className="o-px-3 o-py-2 o-align-top o-font-mono o-text-xs o-whitespace-nowrap"
                        style={{
                          borderTop: `1px solid ${FILET_SOMBRE}`,
                          color: ENCRE_PUPITRE_DOUCE,
                        }}
                      >
                        {ligne.source}
                      </td>
                      <td
                        className="o-px-3 o-py-2 o-align-top o-font-mono o-text-xs o-uppercase o-whitespace-nowrap"
                        style={{
                          borderTop: `1px solid ${FILET_SOMBRE}`,
                          color: TEINTE_GRAVITE[ligne.gravite],
                        }}
                      >
                        {ligne.gravite}
                      </td>
                      <td
                        className="o-px-3 o-py-2 o-align-top o-font-mono o-text-xs o-whitespace-nowrap"
                        style={{
                          borderTop: `1px solid ${FILET_SOMBRE}`,
                          color: ENCRE_PUPITRE_DOUCE,
                        }}
                      >
                        {ligne.statut}
                      </td>
                      <td
                        className="o-px-3 o-py-2 o-align-top o-text-xs"
                        style={{
                          borderTop: `1px solid ${FILET_SOMBRE}`,
                          color: ENCRE_PUPITRE_DOUCE,
                        }}
                      >
                        {ligne.etat}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/*
            Le bas du panneau : les compteurs et les alertes, cote a cote.
            `o-mt-auto` les colle au bord bas — entre la table et eux, c est
            l hologramme qui occupe le vide.
          */}
          <div className="o-mt-auto o-grid o-gap-4 o-pt-4 md:o-grid-cols-2">
            <div>
              <p
                className="o-mb-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                style={{ color: ENCRE_PUPITRE_DOUCE }}
              >
                Compteurs du jour
              </p>
              <dl style={{ border: `1px solid ${FILET_SOMBRE}` }}>
                {PUPITRE.map((ligne, rang) => (
                  <div
                    key={ligne.libelle}
                    className="o-flex o-items-baseline o-justify-between o-gap-3 o-px-3 o-py-2"
                    style={{
                      backgroundColor: CELLULE_SOMBRE,
                      borderTop: rang === 0 ? undefined : `1px solid ${FILET_SOMBRE}`,
                    }}
                  >
                    <dt className="o-text-xs" style={{ color: ENCRE_PUPITRE_DOUCE }}>
                      {ligne.libelle}
                    </dt>
                    <dd
                      className="o-font-mono o-text-sm o-font-bold o-tabular-nums o-whitespace-nowrap"
                      style={{ color: ENCRE_PUPITRE }}
                    >
                      {ligne.valeur}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <p
                className="o-mb-2 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                style={{ color: ENCRE_PUPITRE_DOUCE }}
              >
                <Icon icon={Bell} size={14} style={{ color: accent(400) }} />
                Alertes poussees
              </p>

              {/*
                La pile est absolue dans son cadre : la hauteur est reservee
                ici. L encre y revient au theme — la carte d une notification se
                peint sur `--o-theme-surface`, blanche en theme clair, et une
                encre claire posee en dur la rendrait illisible.
              */}
              <div
                className="o-relative o-text-slate-900 dark:o-text-slate-100"
                style={{ minHeight: 186 }}
              >
                <ToastStack
                  toasts={alertes}
                  side="top"
                  max={3}
                  duration={0}
                  label="Alertes du pupitre de veille"
                  onDismiss={(id) => {
                    setAlertes((liste) => liste.filter((item) => item.id !== id))
                  }}
                />
                {alertes.length === 0 && (
                  <p className="o-text-xs" style={{ color: ENCRE_PUPITRE_DOUCE }}>
                    Toutes les alertes ont ete acquittees. Rechargez la page pour les
                    revoir.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                 Les figures : ce qui coupe les tableaux                   */
/* ------------------------------------------------------------------------ */

/**
 * Vrai des que l element est entre dans le cadre.
 *
 * Les figures de cette page se tracent : une ligne de temps qui se dessine,
 * une couverture qui se remplit. Une figure deja tracee au premier rendu n a
 * rien montre. Sous mouvement reduit, tout est en place des le depart.
 */
function useVu(): readonly [(element: HTMLElement | null) => void, boolean] {
  const { reduced } = useMotionState()
  const [hote, setHote] = useState<HTMLElement | null>(null)
  const [vu, setVu] = useState(false)

  useEffect(() => {
    const observateur = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((entree) => entree.isIntersecting)) setVu(true)
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    if (reduced) setVu(true)
    else if (hote !== null) observateur.observe(hote)
    return () => {
      observateur.disconnect()
    }
  }, [hote, reduced])

  return [setHote, vu] as const
}

/**
 * Une figure numerotee, legende dans la marge.
 *
 * Un tableau enumere, une figure montre. Les deux ne s excluent pas : la
 * figure passe devant, le tableau reste derriere comme reference exacte.
 */
function Figure({
  rang,
  titre,
  legende,
  sombre = false,
  children,
}: {
  readonly rang: string
  readonly titre: string
  readonly legende: string
  readonly sombre?: boolean
  readonly children: ReactNode
}): ReactElement {
  return (
    <figure className="o-m-0 o-grid o-gap-8 lg:o-grid-cols-12 lg:o-gap-12">
      <figcaption className="lg:o-col-span-3">
        <p
          className="o-m-0 o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest"
          style={{ color: sombre ? ENCRE_PUPITRE : ENCRE }}
        >
          Figure {rang}
        </p>
        <p className="o-m-0 o-mt-4 o-text-lg o-font-bold o-leading-snug o-tracking-tight">
          {titre}
        </p>
        <p
          className={`o-m-0 o-mt-4 o-text-sm o-leading-relaxed ${sombre ? '' : 'o-text-slate-600 dark:o-text-slate-400'}`}
          style={sombre ? { color: ENCRE_PUPITRE_DOUCE } : undefined}
        >
          {legende}
        </p>
      </figcaption>
      <div className="o-min-w-0 lg:o-col-span-9">{children}</div>
    </figure>
  )
}

/**
 * La couverture d un referentiel : une barre qui se remplit a l entree.
 *
 * La barre existait deja, mais nee pleine : elle ne se distinguait pas d un
 * trait imprime. Remplie quand la ligne entre dans le cadre, elle redevient
 * une mesure. Le pourcentage reste ecrit a cote — la barre n est que le
 * doublon visible d un nombre.
 */
function Couverture({ part }: { readonly part: number }): ReactElement {
  const [poser, vu] = useVu()
  return (
    <span className="o-flex o-items-center o-gap-2">
      <span
        ref={poser}
        aria-hidden
        className="o-block o-h-1.5 o-w-16 o-overflow-hidden"
        style={{ backgroundColor: VOILE }}
      >
        <span
          className="o-block o-h-full"
          style={{
            width: vu ? `${String(part)}%` : '0%',
            backgroundColor: accent(500),
            transition: 'width 900ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </span>
      <span className="o-font-mono o-text-xs o-tabular-nums">{part} %</span>
    </span>
  )
}

/** Un jalon du contrat, place sur l echelle des temps. */
interface Jalon {
  readonly gravite: Gravite
  /** Prise en charge, confinement, rapport, en minutes. */
  readonly minutes: readonly [number, number, number]
  readonly ecrits: readonly [string, string, string]
}

/**
 * Les memes engagements que le tableau, mais a l echelle du temps.
 *
 * Les minutes servent a placer ; les libelles ecrits a cote sont ceux du
 * contrat, au mot pres. Un jour ouvre vaut ici vingt-quatre heures : la figure
 * situe, le tableau engage.
 */
const JALONS: readonly Jalon[] = [
  { gravite: 'critique', minutes: [5, 15, 1440], ecrits: ['5 min', '15 min', '24 h'] },
  { gravite: 'elevee', minutes: [15, 60, 2880], ecrits: ['15 min', '1 h', '48 h'] },
  { gravite: 'moyenne', minutes: [120, 1440, 7200], ecrits: ['2 h', '1 j', '5 j'] },
  { gravite: 'faible', minutes: [1440, 7200, 43_200], ecrits: ['1 j', '5 j', 'mensuel'] },
]

/** Les graduations de l echelle, en minutes et en clair. */
const GRADUATIONS: readonly (readonly [number, string])[] = [
  [5, '5 min'],
  [15, '15 min'],
  [60, '1 h'],
  [240, '4 h'],
  [1440, '24 h'],
  [7200, '5 j'],
  [43_200, '30 j'],
]

/** L abscisse d une duree, sur une echelle logarithmique de 1 min a 30 jours. */
function abscisse(minutes: number): number {
  const part = Math.log10(Math.max(1, minutes)) / Math.log10(43_200)
  return 150 + part * 810
}

/**
 * La figure des delais : trois jalons par gravite, sur une seule echelle.
 *
 * Le tableau donne quatre fois six cases ; la figure donne d un coup d oeil ce
 * qu aucune de ces cases ne dit — que le contrat critique tient tout entier
 * dans le premier centimetre de l echelle, et que le reste s etale sur un
 * mois. L echelle est logarithmique, sans quoi les cinq minutes seraient
 * invisibles a cote des trente jours.
 */
function FigureDelais(): ReactElement {
  const [poser, vu] = useVu()
  const filet = 'color-mix(in oklab, currentColor 22%, transparent)'
  const pale = 'color-mix(in oklab, currentColor 72%, transparent)'
  return (
    <div ref={poser} className="o-overflow-x-auto o-pb-2">
      <svg
        viewBox="0 0 1000 300"
        className="o-h-auto o-w-full"
        style={{ minWidth: 720 }}
        role="img"
        aria-label="Les jalons contractuels sur une echelle de temps logarithmique : critique, prise en charge a 5 minutes, confinement a 15 minutes, rapport a 24 heures ; elevee, 15 minutes, 1 heure, 48 heures ; moyenne, 2 heures, 1 jour, 5 jours ; faible, 1 jour, 5 jours, rapport mensuel."
      >
        {/* La legende des trois signes, en haut. */}
        <g fontFamily="ui-monospace, monospace" fontSize="11" fill={pale}>
          <rect x={150} y={20} width={9} height={9} fill={ENCRE} />
          <text x={166} y={29}>
            prise en charge
          </text>
          <circle
            cx={294}
            cy={24.5}
            r={5}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <text x={306} y={29}>
            confinement
          </text>
          <path
            d="M416 24.5 421 19.5 426 24.5 421 29.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <text x={434} y={29}>
            rapport ecrit
          </text>
        </g>

        {JALONS.map((jalon, rang) => {
          const y = 68 + rang * 46
          const [prise, confinement, rapport] = jalon.minutes
          return (
            <g key={jalon.gravite}>
              <rect
                x={0}
                y={y - 13}
                width={9}
                height={9}
                fill={TEINTE_GRAVITE[jalon.gravite]}
              />
              <text
                x={16}
                y={y - 4}
                fontFamily="ui-monospace, monospace"
                fontSize="12"
                fontWeight="700"
                fill="currentColor"
              >
                {jalon.gravite}
              </text>
              {/* La piste, tracee au trait quand la figure entre dans le cadre. */}
              <path
                d={`M150 ${String(y)}H960`}
                stroke={filet}
                strokeWidth="1.2"
                fill="none"
                strokeDasharray={810}
                style={{
                  strokeDashoffset: vu ? 0 : 810,
                  transition: `stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1) ${String(rang * 130)}ms`,
                }}
              />
              <g
                style={{
                  opacity: vu ? 1 : 0,
                  transition: `opacity 500ms ease ${String(500 + rang * 130)}ms`,
                }}
              >
                <rect
                  x={abscisse(prise) - 5}
                  y={y - 5}
                  width={10}
                  height={10}
                  fill={ENCRE}
                />
                <circle
                  cx={abscisse(confinement)}
                  cy={y}
                  r={5.5}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d={`M${String(abscisse(rapport) - 6)} ${String(y)} ${String(abscisse(rapport))} ${String(y - 6)} ${String(abscisse(rapport) + 6)} ${String(y)} ${String(abscisse(rapport))} ${String(y + 6)}Z`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <text
                  x={abscisse(prise) - 5}
                  y={y - 12}
                  fontFamily="ui-monospace, monospace"
                  fontSize="10.5"
                  fill={ENCRE}
                >
                  {jalon.ecrits[0]}
                </text>
                <text
                  x={abscisse(confinement) + 10}
                  y={y - 9}
                  fontFamily="ui-monospace, monospace"
                  fontSize="10.5"
                  fill={pale}
                >
                  {jalon.ecrits[1]}
                </text>
                {/* Le dernier jalon du dernier contrat touche le bord : son
                    libelle passe alors a gauche du signe. */}
                <text
                  x={
                    abscisse(rapport) > 880
                      ? abscisse(rapport) - 11
                      : abscisse(rapport) + 11
                  }
                  y={y + 4}
                  textAnchor={abscisse(rapport) > 880 ? 'end' : 'start'}
                  fontFamily="ui-monospace, monospace"
                  fontSize="10.5"
                  fill={pale}
                >
                  {jalon.ecrits[2]}
                </text>
              </g>
            </g>
          )
        })}

        {/* L echelle, en bas. */}
        <path d="M150 262H960" stroke={filet} strokeWidth="1.2" fill="none" />
        {GRADUATIONS.map(([minutes, mot]) => (
          <g key={mot}>
            <path
              d={`M${String(abscisse(minutes))} 262v7`}
              stroke={filet}
              strokeWidth="1.2"
              fill="none"
            />
            <text
              x={abscisse(minutes)}
              y={287}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fontSize="10.5"
              fill={pale}
            >
              {mot}
            </text>
          </g>
        ))}
        <text
          x={0}
          y={287}
          fontFamily="ui-monospace, monospace"
          fontSize="10.5"
          fill={pale}
        >
          echelle log.
        </text>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                        La garde, sur vingt-quatre heures                  */
/* ------------------------------------------------------------------------ */

/** Une equipe de garde, avec l heure a laquelle elle prend le pupitre. */
interface Garde {
  readonly nom: string
  readonly debut: number
  readonly fin: number
  readonly effectif: string
}

/** Le quart lu par defaut, quand aucun ne tient — minuit passe. */
const GARDE_ZERO: Garde = {
  nom: 'Nuit',
  debut: 0,
  fin: 8,
  effectif: '3 analystes, 1 senior d astreinte',
}

/** Les trois quarts de huit heures. */
const GARDES: readonly Garde[] = [
  GARDE_ZERO,
  { nom: 'Jour', debut: 8, fin: 16, effectif: '6 analystes, 1 responsable de quart' },
  { nom: 'Soiree', debut: 16, fin: 24, effectif: '4 analystes, 1 senior d astreinte' },
]

/** Un point du cadran, a une heure donnee. Minuit est en haut. */
function surLeCadran(rayon: number, heures: number): readonly [number, number] {
  const angle = (heures / 24) * Math.PI * 2 - Math.PI / 2
  return [150 + Math.cos(angle) * rayon, 150 + Math.sin(angle) * rayon]
}

/** L arc d une garde, en coordonnees SVG. */
function arcDeGarde(rayon: number, debut: number, fin: number): string {
  const [x1, y1] = surLeCadran(rayon, debut)
  const [x2, y2] = surLeCadran(rayon, fin)
  const grand = fin - debut > 12 ? 1 : 0
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${String(rayon)} ${String(rayon)} 0 ${String(grand)} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

/**
 * Le cadran de la garde : vingt-quatre heures, trois equipes, une aiguille.
 *
 * C est la mesure qui bouge. L aiguille ne simule rien : elle lit l heure de
 * Paris et se replace chaque demi-minute, et l equipe nommee dessous est celle
 * qui tient reellement le pupitre a l instant ou la page est lue. Sous
 * mouvement reduit l aiguille ne s anime pas — elle se pose, simplement.
 */
function Cadran(): ReactElement {
  const { reduced } = useMotionState()
  const [heure, setHeure] = useState<number | null>(null)
  const [horloge, setHorloge] = useState('')

  useEffect(() => {
    const format = new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    })
    const lire = (): void => {
      const parties = format.formatToParts(new Date())
      const h = Number(parties.find((p) => p.type === 'hour')?.value ?? '0')
      const m = Number(parties.find((p) => p.type === 'minute')?.value ?? '0')
      setHeure(h + m / 60)
      setHorloge(`${String(h).padStart(2, '0')} h ${String(m).padStart(2, '0')}`)
    }
    lire()
    const id = window.setInterval(lire, 30_000)
    return () => {
      window.clearInterval(id)
    }
  }, [])

  const deGarde: Garde | null =
    heure === null
      ? null
      : (GARDES.find((g) => heure >= g.debut && heure < g.fin) ?? GARDE_ZERO)
  const [ax, ay] = surLeCadran(96, heure ?? 0)

  return (
    <div className="o-grid o-items-center o-gap-10 md:o-grid-cols-2">
      <svg
        viewBox="0 0 300 300"
        className="o-mx-auto o-h-auto o-w-full"
        style={{ maxWidth: 320 }}
        role="img"
        aria-label={
          deGarde === null
            ? 'Cadran des vingt-quatre heures de garde'
            : `Cadran des vingt-quatre heures de garde. Il est ${horloge} a Paris : equipe ${deGarde.nom}, ${deGarde.effectif}.`
        }
      >
        <circle
          cx={150}
          cy={150}
          r={118}
          fill="none"
          stroke={FILET_SOMBRE}
          strokeWidth="1"
        />
        {/* Les vingt-quatre graduations, une marquee toutes les six heures. */}
        {Array.from({ length: 24 }, (_, h) => {
          const [x1, y1] = surLeCadran(h % 6 === 0 ? 106 : 113, h)
          const [x2, y2] = surLeCadran(118, h)
          return (
            <path
              key={h}
              d={`M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`}
              stroke={FILET_SOMBRE}
              strokeWidth={h % 6 === 0 ? 1.6 : 1}
            />
          )
        })}
        {([0, 6, 12, 18] as const).map((h) => {
          const [x, y] = surLeCadran(90, h)
          return (
            <text
              key={h}
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fontSize="11"
              fill={ENCRE_PUPITRE_DOUCE}
            >
              {String(h).padStart(2, '0')}
            </text>
          )
        })}
        {/* Les trois quarts, en arcs epais. */}
        {GARDES.map((garde, rang) => (
          <path
            key={garde.nom}
            d={arcDeGarde(132, garde.debut + 0.12, garde.fin - 0.12)}
            fill="none"
            strokeWidth="10"
            strokeLinecap="butt"
            stroke={
              deGarde !== null && deGarde.nom === garde.nom
                ? accent(400)
                : `color-mix(in oklab, ${accent(400)} ${String(26 + rang * 4)}%, transparent)`
            }
          />
        ))}
        {/* L aiguille : l heure de Paris, relue toutes les trente secondes. */}
        {heure !== null && (
          <g style={{ transition: reduced ? undefined : 'opacity 400ms ease' }}>
            <path
              d={`M150 150L${ax.toFixed(2)} ${ay.toFixed(2)}`}
              stroke={accent(200)}
              strokeWidth="2"
            />
            <circle cx={ax} cy={ay} r={5} fill={accent(200)} />
            <circle cx={150} cy={150} r={4} fill={accent(200)} />
          </g>
        )}
      </svg>

      <div>
        <p
          className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
          style={{ color: ENCRE_PUPITRE_DOUCE }}
        >
          Heure de Paris
        </p>
        <p
          className="o-m-0 o-mt-2 o-font-mono o-text-4xl o-font-bold o-tabular-nums o-tracking-tight md:o-text-5xl"
          style={{ color: accent(50) }}
        >
          {horloge === '' ? '— h —' : horloge}
        </p>
        <p
          aria-live="polite"
          className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed"
          style={{ color: ENCRE_PUPITRE }}
        >
          {deGarde === null
            ? 'Lecture de l heure en cours.'
            : `Au pupitre en ce moment : equipe ${deGarde.nom} — ${deGarde.effectif}.`}
        </p>
        <dl className="o-m-0 o-mt-8 o-grid o-gap-x-6 o-gap-y-3 o-font-mono o-text-xs sm:o-grid-cols-3">
          {GARDES.map((garde) => (
            <div
              key={garde.nom}
              style={{ borderTop: `1px solid ${FILET_SOMBRE}`, paddingTop: 10 }}
            >
              <dt
                className="o-uppercase o-tracking-widest"
                style={{
                  color:
                    deGarde !== null && deGarde.nom === garde.nom
                      ? accent(200)
                      : ENCRE_PUPITRE_DOUCE,
                }}
              >
                {garde.nom}
              </dt>
              <dd
                className="o-m-0 o-mt-1 o-tabular-nums"
                style={{ color: ENCRE_PUPITRE }}
              >
                {String(garde.debut).padStart(2, '0')} h —{' '}
                {String(garde.fin).padStart(2, '0')} h
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                                La page                                   */
/* ------------------------------------------------------------------------ */

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('grotesk')
  return (
    <Porte forme="lettres" marque="Meridien">
      <div
        className="o-bg-white dark:o-bg-slate-950 o-text-slate-900 dark:o-text-slate-100"
        style={polices}
      >
        {/*
        ============================================== L affiche, dans le noir

        Ni photographie ni seconde scene graphique : la nuance 950 de la
        palette, un seul foyer de lumiere decale d un tiers, le grain, et
        quatre mots en mono aux coins. L objet lumineux de la page arrive juste
        dessous — c est le pupitre, et son hologramme est le seul contexte
        anime de tout le document.
      */}
        <div style={{ backgroundColor: ARDOISE, color: ENCRE_PUPITRE }}>
          <section
            id="sommet"
            aria-label="Ouverture"
            className="o-relative o-isolate o-overflow-hidden"
          >
            <div aria-hidden className="o-absolute o-inset-0">
              <div className="o-absolute o-inset-0" style={{ background: HALO }} />
              <Grain opacite={0.07} />
            </div>

            <BarreCoins
              marque="Meridien / veille"
              liens={LIENS.map((lien) => [lien.ancre, lien.libelle] as const)}
              droite={
                <a
                  href="#demonstration"
                  className="o-inline-flex o-items-center o-gap-1 o-no-underline focus:o-ring"
                  style={{ color: ENCRE_PUPITRE }}
                >
                  Astreinte 02 99 41 08 12
                  <Icon icon={ArrowRight} size={12} aria-hidden="true" />
                </a>
              }
            />

            <div
              className="o-relative o-z-20 o-mx-auto o-flex o-max-w-7xl o-flex-col o-justify-center o-px-6 o-pb-28 o-pt-6"
              style={{ minHeight: `calc(100vh - ${String(CHROME)}px - 128px)` }}
            >
              <Surgit>
                <Etiquette>Pupitre de veille — Rennes, 24 h sur 24</Etiquette>
              </Surgit>
              <TitreVague
                delai={120}
                className="o-m-0 o-mt-8 o-max-w-4xl"
                style={{
                  ...affiche('l', 300),
                  fontSize: 'clamp(2.5rem, 6vw, 6rem)',
                  color: accent(50),
                }}
              >
                On ne vend pas un mur. On vend une vigilance.
              </TitreVague>
              <Surgit
                delai={520}
                as="p"
                className="o-m-0 o-mt-9 o-max-w-lg o-text-base o-leading-relaxed"
                style={{ color: ENCRE_PUPITRE_DOUCE }}
              >
                Vos postes, vos identites et votre reseau sur un seul pupitre. La reponse
                part avant que quelqu un ait decroche son telephone.
              </Surgit>
              <Surgit delai={660} className="o-mt-10">
                <Actions
                  pleine={[
                    '#demonstration',
                    <>
                      Demander une demonstration{' '}
                      <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#veille', 'Voir le pupitre']}
                />
              </Surgit>
            </div>

            <Coin position="bg">
              Detection comportementale, pas de signatures
              <br />
              Astreinte en France, sans sous-traitance
            </Coin>
            <Coin position="bd">
              340 parcs surveilles
              <br />
              Donnees a Paris et a Francfort
            </Coin>
          </section>

          {/*
          ================================================ (01) Le pupitre

          Le mecanisme du milieu, remonte au premier ecran : la table filtre
          reellement, et l hologramme tourne derriere elle. Encore dans le
          noir ; la coupe vers le corps clair vient juste apres.
        */}
          <section
            aria-labelledby="pupitre-titre"
            className="o-relative o-mx-auto o-max-w-7xl o-scroll-mt-24 o-px-6 o-pb-24"
          >
            <Indice rang="01">Le pupitre</Indice>
            <div className="o-mt-8 o-grid o-gap-8 lg:o-grid-cols-12">
              <Pupitre />

              <div className="o-self-start lg:o-col-span-4">
                <h2
                  id="pupitre-titre"
                  className="o-m-0 o-text-balance"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.5rem, 2.6vw, 2.5rem)',
                    color: accent(50),
                  }}
                >
                  Ce qu un analyste de garde lit a trois heures du matin.
                </h2>
                <p
                  className="o-mt-5 o-text-sm o-leading-relaxed"
                  style={{ color: ENCRE_PUPITRE_DOUCE }}
                >
                  Un extrait reel de format, avec des donnees inventees. Les deux filtres
                  fonctionnent : la gravite pour un responsable, le statut pour un
                  analyste.
                </p>

                <p
                  className="o-mt-8 o-flex o-flex-wrap o-items-center o-gap-x-4 o-gap-y-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: ENCRE_PUPITRE_DOUCE }}
                >
                  Gravite
                  {GRAVITES.map((degre) => (
                    <span key={degre} className="o-inline-flex o-items-center o-gap-2">
                      <span
                        aria-hidden
                        className="o-block o-h-2 o-w-2"
                        style={{ backgroundColor: TEINTE_GRAVITE[degre] }}
                      />
                      {degre}
                    </span>
                  ))}
                </p>
                <p
                  className="o-mt-6 o-text-xs o-leading-relaxed"
                  style={{ color: ENCRE_PUPITRE_DOUCE }}
                >
                  Chaque alerte part aussi vers votre outil de tickets et votre canal d
                  equipe, avec le meme identifiant de correlation.
                </p>
              </div>
            </div>
          </section>
        </div>

        <main>
          {/*
          ================================================== Le ruban (C9)

          Pas de barre de compteurs : une bande qui passe. Sur un pupitre, un
          chiffre defile — il ne se contemple pas dans une case bordee.
        */}
          <div
            aria-label="Meridien en chiffres"
            className="o-overflow-hidden o-py-5"
            style={{
              borderTop: `1px solid ${FILET}`,
              borderBottom: `1px solid ${FILET}`,
            }}
          >
            <Marquee speed={58} fade={10} pauseOnHover={false}>
              {[...RUBAN, ...RUBAN].map((valeur, rang) => (
                <span
                  key={`${valeur}-${String(rang)}`}
                  className="o-flex o-shrink-0 o-items-center o-gap-4 o-px-8 o-font-mono o-text-sm o-tabular-nums o-whitespace-nowrap"
                >
                  <span
                    aria-hidden
                    className="o-block o-h-1.5 o-w-1.5"
                    style={{ backgroundColor: accent(500) }}
                  />
                  <span className="o-text-slate-700 dark:o-text-slate-300">{valeur}</span>
                </span>
              ))}
            </Marquee>
          </div>

          {/*
          =========================================== (02) Les menaces, empilees

          La signature de la page. Quatre panneaux sombres qui se recouvrent au
          defilement, le nom de chacun derange une seconde par `GlitchText` —
          c est le seul endroit du document ou le texte se derange, et c est
          celui ou une machine attaque.
        */}
          <section
            id="menaces"
            aria-labelledby="menaces-titre"
            className="o-mx-auto o-max-w-7xl o-scroll-mt-24 o-px-6 o-py-20 md:o-py-28"
          >
            <div className="o-grid o-gap-6 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-7">
                <p
                  className="o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest"
                  style={{ color: ENCRE }}
                >
                  (02) — Les menaces
                </p>
                <h2
                  id="menaces-titre"
                  className="o-m-0 o-mt-4 o-text-balance"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(2rem, 4.4vw, 4.25rem)',
                  }}
                >
                  Quatre familles font neuf dossiers sur dix.
                </h2>
              </div>
              <p className="o-m-0 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400 md:o-col-span-5">
                Pour chacune : a quoi elle ressemble sur le fil, ce que la machine fait
                sans attendre un humain, et en combien de temps. Le reste — onze pour cent
                — passe par un analyste avant tout geste.
              </p>
            </div>

            <StickyStack
              className="o-mt-14 o-flex o-flex-col o-gap-8"
              offset={CHROME + 24}
              gap={22}
              shrink={0.06}
            >
              {MENACES.map((menace, rang) => (
                <article
                  key={menace.cle}
                  className="o-relative o-overflow-hidden o-p-6 md:o-p-10"
                  style={{
                    backgroundColor: ARDOISE,
                    color: ENCRE_PUPITRE,
                    border: `1px solid ${FILET_SOMBRE}`,
                  }}
                >
                  <div
                    className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: ENCRE_PUPITRE_DOUCE }}
                  >
                    <span className="o-tabular-nums">
                      {String(rang + 1).padStart(2, '0')} / 04
                    </span>
                    <span>{menace.part}</span>
                  </div>

                  <h3
                    className="o-m-0 o-mt-6"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                      color: accent(50),
                    }}
                  >
                    <GlitchText as="span" intensity={2} interval={4200}>
                      {menace.nom}
                    </GlitchText>
                  </h3>

                  <dl className="o-m-0 o-mt-10 o-grid o-gap-x-10 o-gap-y-6 md:o-grid-cols-12">
                    <div className="md:o-col-span-5">
                      <dt
                        className="o-font-mono o-text-xs o-uppercase o-tracking-widest"
                        style={{ color: ENCRE_PUPITRE_DOUCE }}
                      >
                        Le signe
                      </dt>
                      <dd
                        className="o-m-0 o-mt-3 o-text-sm o-leading-relaxed"
                        style={{ color: ENCRE_PUPITRE }}
                      >
                        {menace.signe}
                      </dd>
                    </div>
                    <div className="md:o-col-span-5">
                      <dt
                        className="o-font-mono o-text-xs o-uppercase o-tracking-widest"
                        style={{ color: ENCRE_PUPITRE_DOUCE }}
                      >
                        Le geste
                      </dt>
                      <dd
                        className="o-m-0 o-mt-3 o-text-sm o-leading-relaxed"
                        style={{ color: ENCRE_PUPITRE }}
                      >
                        {menace.geste}
                      </dd>
                    </div>
                    <div className="md:o-col-span-2">
                      <dt
                        className="o-font-mono o-text-xs o-uppercase o-tracking-widest"
                        style={{ color: ENCRE_PUPITRE_DOUCE }}
                      >
                        Median
                      </dt>
                      <dd
                        className="o-m-0 o-mt-3 o-font-mono o-text-lg o-font-bold o-tabular-nums"
                        style={{ color: ENCRE_PUPITRE }}
                      >
                        {menace.median}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </StickyStack>
          </section>

          {/*
          =========================================== L ecran de texte seul

          Entre la pile des menaces et le premier tableau, une phrase et rien
          d autre. C est la respiration qui manquait : trois tableaux se
          suivaient sans qu on ait le temps de lever les yeux.
        */}
          <section
            aria-labelledby="minutes-titre"
            className="o-flex o-items-center o-px-6 o-py-24 md:o-py-32"
            style={{ minHeight: '64vh', borderTop: `1px solid ${FILET}` }}
          >
            <div className="o-mx-auto o-w-full o-max-w-5xl">
              <h2 id="minutes-titre" className="o-sr-only">
                Ce qui se mesure ici
              </h2>
              <p
                className="o-m-0 o-text-balance"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.75rem, 4.3vw, 3.75rem)',
                  lineHeight: 1.1,
                }}
              >
                Ce que nous vendons ne se mesure ni en fonctions ni en tableaux de bord.
                Cela se mesure{' '}
                <HighlightSweep
                  colour={accentDoux(500, 34)}
                  thickness={0.42}
                  duration={900}
                  delay={300}
                >
                  en minutes
                </HighlightSweep>{' '}
                — celles qui separent le premier fichier chiffre du moment ou la machine s
                arrete.
              </p>
              <p className="o-m-0 o-mt-10 o-max-w-md o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-600 dark:o-text-slate-400">
                Les trois tableaux qui suivent disent lesquelles, et ce qu il en coute
                quand nous les manquons
              </p>
            </div>
          </section>

          {/* ---------------------------- Les delais d intervention contractuels */}
          <section
            id="delais"
            aria-labelledby="delais-titre"
            className="o-mx-auto o-max-w-7xl o-px-6 o-py-20"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <div className="o-max-w-2xl">
              <p
                className="o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest"
                style={{ color: ENCRE }}
              >
                Les delais
              </p>
              <h2
                id="delais-titre"
                className="o-mt-3 o-text-3xl md:o-text-4xl o-font-bold o-tracking-tight"
              >
                Ce que le contrat vous doit, en minutes
              </h2>
              <p className="o-mt-4 o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                Un engagement de securite qui ne chiffre pas ses delais n engage rien.
                Voici les notres, avec la penalite qui les accompagne — c est la seule
                partie du contrat qui rende un delai reel.
              </p>
            </div>

            {/*
            La figure passe devant le tableau. Elle ne le remplace pas : elle
            donne la forme — quatre contrats dont le plus dur tient dans le
            premier centimetre d une echelle d un mois — et le tableau garde
            l engagement, au mot pres.
          */}
            <div className="o-mt-12">
              <Figure
                rang="1"
                titre="Les trois jalons du contrat, a l echelle du temps."
                legende="Prise en charge, confinement, rapport ecrit, poses sur une echelle logarithmique d une minute a trente jours. Un jour ouvre vaut ici vingt-quatre heures : la figure situe, le tableau engage."
              >
                <FigureDelais />
              </Figure>
            </div>

            <div
              className="o-mt-12 o-overflow-x-auto o-bg-white dark:o-bg-slate-950"
              style={{ border: `1px solid ${FILET}` }}
            >
              <table className="o-w-full o-text-left o-text-sm" style={{ minWidth: 760 }}>
                <caption className="o-sr-only">
                  Delais contractuels de prise en charge, de confinement et de rapport,
                  par gravite
                </caption>
                <thead>
                  <tr>
                    {[
                      'Gravite',
                      'Ce que cela recouvre',
                      'Prise en charge',
                      'Confinement',
                      'Rapport ecrit',
                      'Penalite',
                    ].map((entete) => (
                      <th
                        key={entete}
                        scope="col"
                        className="o-px-4 o-py-3 o-font-mono o-text-xs o-uppercase o-tracking-wide o-text-slate-600 dark:o-text-slate-400"
                        style={{ borderBottom: `1px solid ${FILET}` }}
                      >
                        {entete}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DELAIS.map((ligne) => (
                    <tr key={ligne.gravite}>
                      <th
                        scope="row"
                        className="o-px-4 o-py-3 o-align-top o-whitespace-nowrap"
                        style={{ borderTop: `1px solid ${FILET}` }}
                      >
                        <span className="o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-font-bold o-uppercase">
                          <span
                            aria-hidden
                            className="o-block o-h-2 o-w-2"
                            style={{ backgroundColor: TEINTE_GRAVITE[ligne.gravite] }}
                          />
                          {ligne.gravite}
                        </span>
                      </th>
                      <td
                        className="o-px-4 o-py-3 o-align-top o-text-xs o-leading-relaxed o-text-slate-600 dark:o-text-slate-400"
                        style={{ borderTop: `1px solid ${FILET}` }}
                      >
                        {ligne.definition}
                      </td>
                      <td
                        className="o-px-4 o-py-3 o-align-top o-font-mono o-text-sm o-font-bold o-tabular-nums o-whitespace-nowrap"
                        style={{ borderTop: `1px solid ${FILET}`, color: ENCRE }}
                      >
                        {ligne.priseEnCharge}
                      </td>
                      <td
                        className="o-px-4 o-py-3 o-align-top o-font-mono o-text-sm o-tabular-nums o-whitespace-nowrap"
                        style={{ borderTop: `1px solid ${FILET}` }}
                      >
                        {ligne.confinement}
                      </td>
                      <td
                        className="o-px-4 o-py-3 o-align-top o-font-mono o-text-sm o-tabular-nums o-whitespace-nowrap"
                        style={{ borderTop: `1px solid ${FILET}` }}
                      >
                        {ligne.rapport}
                      </td>
                      <td
                        className="o-px-4 o-py-3 o-align-top o-text-xs o-leading-relaxed o-text-slate-600 dark:o-text-slate-400"
                        style={{ borderTop: `1px solid ${FILET}` }}
                      >
                        {ligne.penalite}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="o-mt-8 o-grid o-list-none o-gap-3 o-p-0 o-text-sm md:o-grid-cols-2">
              {CONTRAT.map((regle) => (
                <li key={regle} className="o-flex o-items-start o-gap-3">
                  <Icon
                    icon={Check}
                    size={16}
                    className="o-mt-0.5 o-shrink-0"
                    style={{ color: ENCRE }}
                  />
                  <span className="o-text-slate-600 dark:o-text-slate-400">{regle}</span>
                </li>
              ))}
            </ul>
          </section>

          {/*
          ====================================================== La coupe sombre

          Deux tableaux ne doivent pas se toucher. Entre les delais et la
          conformite, une bande de nuit et une seule figure : le cadran des
          vingt-quatre heures. Son aiguille lit l heure de Paris — c est la
          seule mesure de la page qui bouge d elle-meme, et elle dit qui tient
          le pupitre a la seconde ou la page est lue.
        */}
          <section
            id="garde"
            aria-labelledby="garde-titre"
            className="o-relative o-isolate o-scroll-mt-24 o-overflow-hidden o-px-6 o-py-20 md:o-py-28"
            style={{ backgroundColor: ARDOISE, color: ENCRE_PUPITRE }}
          >
            <div aria-hidden className="o-absolute o-inset-0">
              <div className="o-absolute o-inset-0" style={{ background: HALO }} />
              <Grain opacite={0.07} />
            </div>
            <div className="o-relative o-mx-auto o-max-w-7xl">
              <h2 id="garde-titre" className="o-sr-only">
                La garde, sur vingt-quatre heures
              </h2>
              <Figure
                rang="2"
                sombre
                titre="Qui tient le pupitre, a l heure ou vous lisez ceci."
                legende="Trois quarts de huit heures, en France, sans sous-traitance. L aiguille suit l heure de Paris : elle ne montre pas un principe, elle montre l equipe de garde maintenant."
              >
                <Cadran />
              </Figure>
            </div>
          </section>

          {/* ---------------------------------------------------- La conformite */}
          <section
            id="conformite"
            aria-labelledby="conformite-titre"
            className="o-bg-slate-50 dark:o-bg-slate-900"
            style={{
              borderTop: `1px solid ${FILET}`,
              borderBottom: `1px solid ${FILET}`,
            }}
          >
            <div className="o-mx-auto o-max-w-7xl o-px-6 o-py-20">
              <div className="o-max-w-2xl">
                <p
                  className="o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest"
                  style={{ color: ENCRE }}
                >
                  La conformite
                </p>
                <h2
                  id="conformite-titre"
                  className="o-mt-3 o-text-3xl md:o-text-4xl o-font-bold o-tracking-tight"
                >
                  Six referentiels, leur etat, et la date qui vient
                </h2>
                <p className="o-mt-4 o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                  La conformite n est pas une page de logos : c est un dossier que votre
                  auditeur telecharge. Le notre est tenu a jour en continu, l acces vous
                  est ouvert des la signature, et ce qui n est pas encore acquis est ecrit
                  comme tel.
                </p>
              </div>

              <div
                className="o-mt-10 o-overflow-x-auto o-bg-white dark:o-bg-slate-950"
                style={{ border: `1px solid ${FILET}` }}
              >
                <table
                  className="o-w-full o-text-left o-text-sm"
                  style={{ minWidth: 760 }}
                >
                  <caption className="o-sr-only">
                    Les six referentiels couverts par Meridien, leur etat, leur couverture
                    et la preuve tenue pour chacun
                  </caption>
                  <thead>
                    <tr>
                      {[
                        'Referentiel',
                        'Etat',
                        'Couverture',
                        'Prochaine echeance',
                        'Preuve tenue',
                      ].map((entete) => (
                        <th
                          key={entete}
                          scope="col"
                          className="o-px-4 o-py-3 o-font-mono o-text-xs o-uppercase o-tracking-wide o-text-slate-600 dark:o-text-slate-400"
                          style={{ borderBottom: `1px solid ${FILET}` }}
                        >
                          {entete}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CONFORMITE.map((cadre) => (
                      <tr key={cadre.nom}>
                        <th
                          scope="row"
                          className="o-px-4 o-py-3 o-align-top o-whitespace-nowrap"
                          style={{ borderTop: `1px solid ${FILET}` }}
                        >
                          <span className="o-flex o-items-center o-gap-2 o-font-mono o-text-sm o-font-bold o-tracking-tight">
                            <Icon icon={cadre.icone} size={18} style={{ color: ENCRE }} />
                            {cadre.nom}
                          </span>
                        </th>
                        <td
                          className="o-px-4 o-py-3 o-align-top o-text-sm o-font-medium o-whitespace-nowrap"
                          style={{ borderTop: `1px solid ${FILET}` }}
                        >
                          <span
                            className="o-inline-flex o-items-center o-gap-2 o-px-2 o-py-1 o-font-mono o-text-xs"
                            style={
                              cadre.etat === 'En cours'
                                ? {
                                    border: '1px solid var(--o-palette-amber-500)',
                                    color: `color-mix(in oklab, var(--o-palette-amber-500) 45%, var(--o-theme-fg))`,
                                  }
                                : { backgroundColor: VOILE, color: ENCRE }
                            }
                          >
                            {cadre.etat !== 'En cours' && <Icon icon={Check} size={12} />}
                            {cadre.etat}
                          </span>
                        </td>
                        <td
                          className="o-px-4 o-py-3 o-align-top o-whitespace-nowrap"
                          style={{ borderTop: `1px solid ${FILET}` }}
                        >
                          <Couverture part={cadre.couverture} />
                        </td>
                        <td
                          className="o-px-4 o-py-3 o-align-top o-text-xs o-leading-relaxed o-text-slate-600 dark:o-text-slate-400"
                          style={{ borderTop: `1px solid ${FILET}` }}
                        >
                          {cadre.echeance}
                        </td>
                        <td
                          className="o-px-4 o-py-3 o-align-top o-text-xs o-leading-relaxed o-text-slate-600 dark:o-text-slate-400"
                          style={{ borderTop: `1px solid ${FILET}` }}
                        >
                          {cadre.preuve}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="o-mt-6 o-max-w-3xl o-text-xs o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                La couverture est le rapport des mesures dont la preuve est collectee
                automatiquement au total des mesures du referentiel. Les vingt-deux pour
                cent manquants sur PCI DSS concernent la segmentation d un environnement
                client, en cours de reprise. Contrat de sous-traitance conforme a l
                article 28 du reglement europeen, signable en ligne.
              </p>
            </div>
          </section>

          {/* ------------------------------------------------- L etude de cas */}
          <section
            id="cas"
            aria-labelledby="cas-titre"
            className="o-mx-auto o-max-w-7xl o-px-6 o-py-20"
          >
            <div className="o-max-w-3xl">
              <p
                className="o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest"
                style={{ color: ENCRE }}
              >
                Etude de cas — logistique, 2 400 postes
              </p>
              <h2
                id="cas-titre"
                className="o-mt-3 o-text-3xl md:o-text-4xl o-font-bold o-tracking-tight"
              >
                Une rancongicielle arretee a 3 h 41, sur un seul poste
              </h2>
              <p className="o-mt-4 o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                Le groupe Ferrand-Delaunay exploite dix-huit entrepots et une flotte de
                900 vehicules. En mars 2026, un compte prestataire compromis a servi de
                porte d entree a un chiffrement de masse. Meridien a isole le poste
                quarante-huit secondes apres le premier fichier chiffre, revoque les
                sessions du prestataire, et rendu le dossier complet a l assureur le
                lendemain matin.
              </p>
            </div>

            {/*
            Les trois mesures de cette nuit-la ne sont pas une barre de
            compteurs : elles tiennent dans la marge, en mono, a cote de la
            phrase de la responsable. C est ainsi qu une note se lit dans un
            dossier d incident.
          */}
            <div className="o-mt-10 o-grid o-gap-x-10 o-gap-y-6 md:o-grid-cols-12">
              <blockquote
                className="o-m-0 o-pl-5 o-text-lg o-leading-relaxed md:o-col-span-8"
                style={{ borderLeft: `2px solid ${accent(500)}` }}
              >
                « A 4 h du matin, j ai recu un message qui disait ce qui s etait passe et
                ce qui avait deja ete fait. Je n ai eu qu a valider. »
                <footer className="o-mt-3 o-text-xs o-text-slate-600 dark:o-text-slate-400">
                  Nadia Lefevre — responsable des systemes, Ferrand-Delaunay
                </footer>
              </blockquote>
              {/*
              Les trois mesures montent quand elles entrent dans le cadre.
              C est la seconde chose qui bouge de la page, apres l aiguille du
              cadran — et la seule ou le nombre lui-meme est l argument.
            */}
              <dl
                className="o-m-0 o-flex o-flex-col o-gap-5 o-font-mono md:o-col-span-4"
                style={{ color: ENCRE_FORTE }}
              >
                {(
                  [
                    ['Avant isolation du poste', 48, ' s'],
                    ['Postes touches sur 2 400', 1, ''],
                    ['De rancon versee', 0, ' EUR'],
                  ] as const
                ).map(([quoi, valeur, unite]) => (
                  <div
                    key={quoi}
                    style={{ borderTop: `1px solid ${FILET}`, paddingTop: 12 }}
                  >
                    <dt className="o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-text-slate-400">
                      {quoi}
                    </dt>
                    <dd className="o-m-0 o-mt-1 o-text-3xl o-font-bold o-tabular-nums o-tracking-tight">
                      <CountUp
                        value={valeur}
                        locale="fr-FR"
                        duration={1200}
                        suffix={unite}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/*
            Une photographie de salle de supervision ne dirait rien de plus que
            le titre. Le journal, lui, est l argument : chaque minute est datee,
            et la colonne d origine dit ce qui n a pas attendu un humain.
          */}
            <h3
              className="o-mt-14 o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest"
              style={{ color: ENCRE }}
            >
              Chronologie de l incident — nuit du 14 au 15 mars 2026
            </h3>

            <div
              className="o-mt-4 o-overflow-x-auto"
              style={{ border: `1px solid ${FILET}` }}
            >
              <table className="o-w-full o-text-left o-text-sm" style={{ minWidth: 620 }}>
                <caption className="o-sr-only">
                  Le journal horodate de la nuit du 14 au 15 mars 2026, geste par geste
                </caption>
                <thead>
                  <tr>
                    {['Heure', 'Fait journalise', 'Origine'].map((entete) => (
                      <th
                        key={entete}
                        scope="col"
                        className="o-px-4 o-py-3 o-font-mono o-text-xs o-uppercase o-tracking-wide o-text-slate-600 dark:o-text-slate-400"
                        style={{ borderBottom: `1px solid ${FILET}` }}
                      >
                        {entete}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CHRONOLOGIE.map((moment) => (
                    <tr key={moment.heure}>
                      <th
                        scope="row"
                        className="o-px-4 o-py-3 o-align-top o-font-mono o-text-xs o-font-normal o-tabular-nums o-whitespace-nowrap"
                        style={{ borderTop: `1px solid ${FILET}`, color: ENCRE }}
                      >
                        {moment.heure}
                      </th>
                      <td
                        className="o-px-4 o-py-3 o-align-top o-text-sm o-leading-relaxed"
                        style={{ borderTop: `1px solid ${FILET}` }}
                      >
                        {moment.fait}
                      </td>
                      <td
                        className="o-px-4 o-py-3 o-align-top o-text-xs o-whitespace-nowrap o-text-slate-600 dark:o-text-slate-400"
                        style={{ borderTop: `1px solid ${FILET}` }}
                      >
                        <span className="o-flex o-items-center o-gap-2">
                          <span
                            aria-hidden
                            className="o-block o-h-2 o-w-2"
                            style={{
                              backgroundColor: moment.machine
                                ? accent(500)
                                : 'var(--o-palette-slate-500)',
                            }}
                          />
                          {moment.machine ? 'Automatique' : 'Analyste de garde'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/*
          ================================================== (05) L appel — A6

          Deux panneaux decales : le noir monte plus haut que le clair et
          descend plus bas, et les deux ne partagent aucune ligne. Faute d une
          photographie de salle de veille qui dise autre chose que le titre,
          c est le panneau noir lui-meme — la ligne d astreinte et son radar
          dessine — qui tient le role de l image.
        */}
          <section
            id="demonstration"
            aria-labelledby="demo-titre"
            className="o-scroll-mt-24 o-bg-slate-50 dark:o-bg-slate-900"
            style={{ borderTop: `1px solid ${FILET}` }}
          >
            <div className="o-mx-auto o-max-w-7xl o-px-6 o-py-20 md:o-py-28">
              <div className="o-grid o-items-start o-gap-10 lg:o-grid-cols-12">
                {/* Le panneau noir, remonte : il deborde vers le haut du bloc. */}
                <div
                  className="o-relative o-overflow-hidden o-p-8 md:o-p-10 lg:o-col-span-5"
                  style={{
                    backgroundColor: ARDOISE,
                    color: ENCRE_PUPITRE,
                    border: `1px solid ${FILET_SOMBRE}`,
                    marginTop: '-3rem',
                  }}
                >
                  <div
                    aria-hidden
                    className="o-absolute o-inset-0"
                    style={{ background: HALO }}
                  />
                  <div className="o-relative">
                    <p
                      className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                      style={{ color: ENCRE_PUPITRE_DOUCE }}
                    >
                      Urgence en cours
                    </p>
                    <p
                      className="o-m-0 o-mt-5 o-font-mono o-font-bold o-tabular-nums o-tracking-tight"
                      style={{
                        fontSize: 'clamp(1.75rem, 3.6vw, 3rem)',
                        color: accent(50),
                      }}
                    >
                      02 99 41 08 12
                    </p>
                    <p
                      className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed"
                      style={{ color: ENCRE_PUPITRE_DOUCE }}
                    >
                      Ligne d astreinte ouverte 24 h sur 24, decrochee en France par un
                      analyste, jamais par un serveur vocal.
                    </p>

                    {/* Le radar : quatre anneaux et un balayage, dessines. */}
                    <div
                      aria-hidden
                      className="o-relative o-mt-10 o-aspect-square o-mx-auto"
                      style={{ maxWidth: '15rem' }}
                    >
                      {[100, 74, 48, 22].map((part) => (
                        <span
                          key={part}
                          className="o-absolute o-rounded-full"
                          style={{
                            inset: `${String((100 - part) / 2)}%`,
                            border: `1px solid color-mix(in srgb, ${accent(300)} ${String(part === 100 ? 34 : 20)}%, transparent)`,
                          }}
                        />
                      ))}
                      <span
                        className="o-absolute o-rounded-full"
                        style={{
                          inset: '0',
                          background: `conic-gradient(from 210deg, color-mix(in srgb, ${accent(400)} 34%, transparent) 0deg, transparent 62deg)`,
                        }}
                      />
                      <span
                        className="o-absolute o-rounded-full"
                        style={{
                          left: '62%',
                          top: '38%',
                          width: 9,
                          height: 9,
                          backgroundColor: 'var(--o-palette-rose-400)',
                        }}
                      />
                    </div>

                    <p
                      className="o-m-0 o-mt-8 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest"
                      style={{ color: ENCRE_PUPITRE_DOUCE }}
                    >
                      8 boulevard de la Tour d Auvergne, 35000 Rennes
                    </p>
                  </div>
                </div>

                {/* Le panneau clair, descendu : le texte et le formulaire. */}
                <div className="lg:o-col-span-7" style={{ marginTop: '2rem' }}>
                  <h2
                    id="demo-titre"
                    className="o-m-0 o-text-balance"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.75rem, 3.6vw, 3.25rem)',
                    }}
                  >
                    Une seance calibree sur votre parc, pas une presentation.
                  </h2>
                  <p className="o-mt-5 o-max-w-xl o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                    La demonstration se fait sur un extrait de vos propres journaux, pas
                    sur une maquette. Vous repartez avec la liste de ce que nous avons vu
                    et de ce que votre outil actuel n avait pas remonte — que vous signiez
                    ou non.
                  </p>

                  <ul className="o-mt-8 o-flex o-list-none o-flex-col o-gap-3 o-p-0 o-text-sm">
                    {[
                      'Trois champs suffisent a calibrer la seance : le formulaire le dit avant l envoi',
                      'Aucune installation requise pour la demonstration',
                      'Rapport ecrit remis sous 48 heures',
                      'Accord de confidentialite signe avant tout echange',
                    ].map((point) => (
                      <li key={point} className="o-flex o-items-start o-gap-3">
                        <Icon
                          icon={Check}
                          size={18}
                          className="o-mt-px o-shrink-0"
                          style={{ color: ENCRE }}
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="o-mt-10">
                    <Demande />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/*
        ================================================ Le pied — P5

        Un generique de fin : le nom de la maison monte derriere, le bandeau
        des mentions passe en biais, et la page se referme sur la seule phrase
        qui compte pour un centre de veille — la garde ne s arrete pas.
      */}
        <CinematicFooter
          style={
            {
              '--o-footer-glow-a': accent(500),
              '--o-footer-glow-b': accent(800),
            } as CSSProperties
          }
          heading="La garde continue."
          word="MERIDIEN"
          topLabel="Revenir au pupitre"
          banner={
            <span className="o-px-8">
              Astreinte 02 99 41 08 12 — 8 boulevard de la Tour d Auvergne, 35000 Rennes —
              contact@meridien.example — ISO 27001 — SOC 2 type II — HDS — Donnees a Paris
              et a Francfort
            </span>
          }
          actions={
            <>
              <a
                href="#demonstration"
                className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline focus:o-ring"
                style={PLEIN_SOMBRE}
              >
                Demander une demonstration
                <Icon icon={ArrowRight} size={16} aria-hidden="true" />
              </a>
              <a
                href="#veille"
                className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline focus:o-ring"
                style={{ borderColor: FILET }}
              >
                <Icon icon={RadarIcon} size={16} aria-hidden="true" />
                Revoir le pupitre
              </a>
            </>
          }
          links={
            <>
              {[
                ['#menaces', 'Les menaces'],
                ['#delais', 'Delais contractuels'],
                ['#conformite', 'Conformite'],
                ['#cas', 'Etude de cas'],
                ['#sommet', 'Incidents manques'],
                ['#sommet', 'Politique de divulgation'],
                ['#sommet', 'Mentions legales'],
              ].map(([cible, mot]) => (
                <a
                  key={mot}
                  href={cible}
                  className="o-rounded-full o-px-3 o-py-1.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-no-underline o-text-slate-600 dark:o-text-slate-400 focus:o-ring"
                >
                  {mot}
                </a>
              ))}
            </>
          }
          copyright="2026 Meridien SAS — societe fictive"
          signature="Les chiffres, la veille et l etude de cas sont inventes"
        />
      </div>
    </Porte>
  )
}
