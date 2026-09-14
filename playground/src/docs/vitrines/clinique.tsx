/**
 * Clinique Vernet — cabinet medical.
 *
 * ## Le parti pris — diptyque
 *
 * Un patient arrive sur cette page pour une seule raison : prendre un
 * rendez-vous. La premiere page est donc coupee en deux — a gauche ce que le
 * cabinet est, a droite le panneau de prise de rendez-vous, qui touche le bord
 * de la page. Rien n est centre, rien n est colle en haut : la barre de
 * navigation est un filet mince pose dans la moitie textuelle seulement. Sous
 * 768 px les deux moities s empilent, le texte d abord.
 *
 * ## Le panneau prend vraiment le rendez-vous
 *
 * Les quatre etapes ne decrivent plus un parcours : elles le font. On choisit
 * un motif, ce motif ouvre les praticiens qui le traitent, le praticien ouvre
 * ses creneaux reels — ceux qui sont pris ne sont pas cliquables — puis on
 * laisse ses coordonnees. Un recapitulatif se remplit a mesure, avec la duree
 * reservee et le tarif applique, et la confirmation rend un numero de dossier.
 * C est le seul endroit de la page ou il se passe quelque chose, et c est
 * voulu.
 *
 * Le reste repond a ce qu on demande au secretariat : le delai par specialite
 * et le prochain creneau, ce qu il faut apporter le jour meme, les tarifs avec
 * leur base de remboursement et le reste a charge, l acces, et les numeros a
 * composer quand le cabinet est ferme.
 *
 * ## La couleur
 *
 * Le bleu clinique n est plus ecrit nulle part : les accents citent
 * `--o-vitrine-*` par `accent` et `accentDoux`, et la barre reteinte la page
 * entiere. Deux formes coexistent — le style en ligne pour un accent fixe, en
 * `light-dark` quand la nuance doit changer avec le theme ; les classes
 * `o-*-brand-*` pour ce qui reagit au survol, un style en ligne l emportant sur
 * la regle `hover:`. Les aplats poses sur une carte melangent l accent a
 * `--o-theme-surface` plutot qu au fond, sans quoi ils disparaitraient en
 * theme sombre.
 *
 * ## Le fond
 *
 * Une seule bande calme — du papier millimetre statique, tres pale, sous les
 * informations pratiques — tient lieu de contexte graphique pour toute la
 * vitrine.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import {
  Accessibility,
  ArrowRight,
  Baby,
  Check,
  CreditCard,
  FileText,
  HeartPulse,
  Phone,
  Stethoscope,
  Users,
} from '@odoro-cli/icons/filaire'
import { useMotionState } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type RefObject,
} from 'react'

import { Faq } from '@/odoro/section/Faq.js'
import { TrueFocus } from '@/odoro/text/TrueFocus.js'
import { ProgressRing } from '@/odoro/ui/ProgressRing.js'
import { Stepper } from '@/odoro/ui/Stepper.js'

import { nuit, Voile } from './communs.jsx'
import { media } from './media.js'
import { accent, encre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreFilet,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Epingle, ZoomDefile } from './scene.jsx'

/** L accent en encre : la nuance foncee sur papier, la claire sur encre. */
const ACCENT_ENCRE: CSSProperties = {
  // La paire 700 / 300 devient grise pour un accent blanc : le role calcule
  // descend l echelle jusqu au premier ton qui passe.
  color: encre(),
}

/**
 * Un aplat pose sur une carte.
 *
 * Le melange se fait avec `--o-theme-surface` et non avec le fond : sur une
 * page dont le fond sombre est deja tres bas, un melange vers le fond rendrait
 * l aplat invisible.
 */
function surfaceTeintee(part: number): string {
  return `color-mix(in oklab, ${accent(500)} ${String(part)}%, var(--o-theme-surface))`
}

/** L aplat du panneau de rendez-vous. */
const PANNEAU: CSSProperties = { backgroundColor: surfaceTeintee(9) }

/** L aplat d une pastille d icone. */
const PASTILLE_DOUCE: CSSProperties = { backgroundColor: surfaceTeintee(16) }

/**
 * Une pastille pleine.
 *
 * La nuance 200 contient plus des deux tiers de blanc : elle reste claire pour
 * toute palette, et l encre sombre posee dessus reste lisible.
 */
const PASTILLE: CSSProperties = { backgroundColor: accent(200) }

/** Le lien accentue, en classes : il change de nuance au survol. */
const LIEN =
  'o-inline-flex o-items-center o-gap-2 o-text-sm o-font-medium o-text-brand-700 dark:o-text-brand-300 o-underline o-underline-offset-4 hover:o-text-brand-800 dark:hover:o-text-brand-200 o-transition-colors focus:o-ring'

/** Un champ du formulaire de coordonnees. */
const CHAMP =
  'o-mt-1.5 o-w-full o-rounded-lg o-border-w-1 o-border-slate-300 dark:o-border-slate-700 o-bg-white dark:o-bg-slate-950 o-px-3.5 o-py-2.5 o-text-sm o-text-slate-900 dark:o-text-slate-100 focus:o-ring'

/** L intitule d un champ. */
const ETIQUETTE = 'o-text-xs o-font-medium o-text-slate-600 dark:o-text-slate-400'

/* ---------------------------------------------------------------------- */
/*            Les monogrammes, et la semaine des specialites              */
/* ---------------------------------------------------------------------- */

/** Les six jours ouvres du cabinet, dans l ordre. */
const JOURS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'] as const

/** Les mots qui precedent un nom sans en faire partie. */
const CIVILITES: ReadonlySet<string> = new Set([
  'dr',
  'docteur',
  'pr',
  'professeur',
  'mme',
  'm',
  'mr',
])

/**
 * Les initiales d un nom de praticien.
 *
 * « Dr Helene Vernet » vaut « HV » : la civilite est ecartee, sinon trois
 * medecins d une meme page porteraient les memes lettres.
 */
function initiales(nom: string): string {
  const mots = nom
    .split(/\s+/)
    .filter((mot) => !CIVILITES.has(mot.toLowerCase().replace(/\.$/, '')))
  return mots
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * La plaque d un praticien.
 *
 * Les personnes du cabinet sont inventees : aucun visage reel ne peut leur
 * etre prete, et un aplat pastel avec deux lettres dessus n est pas une
 * reponse — c est un defaut d image. Ce qu un cabinet a vraiment sur sa porte,
 * c est une **plaque gravee** : un cadre a double filet, un monogramme cercle,
 * la specialite et le numero de cabinet en bas. On la dessine donc, dans
 * l accent de la page, et elle se reteinte avec elle.
 *
 * Le dessin est decoratif : le nom et la specialite sont ecrits juste dessous,
 * en texte.
 */
function Plaque({
  nom,
  specialite,
  bureau,
}: {
  readonly nom: string
  readonly specialite: string
  readonly bureau: string
}): ReactElement {
  const lettres = initiales(nom)
  return (
    <svg
      viewBox="0 0 200 250"
      role="img"
      className="o-block o-h-auto o-w-full"
      style={{ backgroundColor: surfaceTeintee(12) }}
    >
      <title>{`Plaque de porte : monogramme ${lettres.split('').join(' ')} — ${specialite.toLowerCase()}, ${bureau.toLowerCase()}`}</title>
      {/* Le double filet grave, a deux ecarts differents. */}
      <rect
        x="8"
        y="8"
        width="184"
        height="234"
        fill="none"
        stroke={accent(500)}
        strokeWidth="1"
        opacity="0.5"
      />
      <rect
        x="14"
        y="14"
        width="172"
        height="222"
        fill="none"
        stroke={accent(500)}
        strokeWidth="0.5"
        opacity="0.35"
      />
      {/* Le cercle du monogramme, ouvert en haut : une plaque n est pas un jeton. */}
      <circle
        cx="100"
        cy="104"
        r="52"
        fill="none"
        stroke={accent(500)}
        strokeWidth="1.4"
        opacity="0.55"
      />
      <circle cx="100" cy="104" r="52" fill={surfaceTeintee(22)} opacity="0.55" />
      <text
        x="100"
        y="104"
        textAnchor="middle"
        dominantBaseline="central"
        fill={encre()}
        style={{
          fontFamily: 'inherit',
          fontSize: 52,
          fontWeight: 300,
          letterSpacing: '0.04em',
        }}
      >
        {lettres}
      </text>
      {/* Le trace du cabinet : une ligne de rythme, gravee sous le monogramme. */}
      <path
        d="M30 182h28l8-16 9 32 10-44 9 56 9-40 8 12h49"
        fill="none"
        stroke={accent(500)}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <text
        x="100"
        y="214"
        textAnchor="middle"
        fill="currentColor"
        opacity="0.88"
        style={{
          fontFamily: 'ui-monospace, monospace',
          fontSize: 8,
          letterSpacing: '0.1em',
        }}
      >
        {bureau.toUpperCase()}
      </text>
    </svg>
  )
}

/**
 * Vrai des que l element est entre dans le cadre, une seule fois.
 *
 * Sert aux pastilles de la semaine : elles se posent jour apres jour quand la
 * ligne arrive, au lieu d etre deja la.
 */
function useVu<T extends HTMLElement>(): {
  readonly ref: RefObject<T | null>
  readonly vu: boolean
} {
  const ref = useRef<T>(null)
  const [vu, setVu] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (element === null) return
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (entree.isIntersecting) {
            setVu(true)
            observateur.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    observateur.observe(element)
    return () => {
      observateur.disconnect()
    }
  }, [])
  return { ref, vu }
}

/**
 * La semaine d une specialite : six lettres, et un point sous les jours ou
 * elle est au cabinet.
 *
 * Les points se posent l un apres l autre quand la ligne entre dans le cadre.
 * Sous mouvement reduit ils sont deja la.
 */
function Semaine({
  jours,
  nom,
}: {
  readonly jours: readonly boolean[]
  readonly nom: string
}): ReactElement {
  const { ref, vu } = useVu<HTMLDivElement>()
  const { reduced } = useMotionState()
  const pose = vu || reduced
  return (
    <div ref={ref}>
      <p className="o-sr-only">
        {nom} est au cabinet {JOURS.filter((_, rang) => jours[rang] === true).join(', ')}.
      </p>
      <div aria-hidden="true" className="o-flex o-gap-2">
        {JOURS.map((jour, rang) => {
          const present = jours[rang] === true
          return (
            <span key={jour} className="o-flex o-flex-col o-items-center o-gap-1.5">
              <span
                className={`o-font-mono o-text-xs o-uppercase o-tracking-wider ${present ? 'o-text-slate-800 dark:o-text-slate-100' : 'o-text-slate-500 dark:o-text-slate-400'}`}
              >
                {jour}
              </span>
              <span
                className="o-block o-size-1.5 o-rounded-full"
                style={{
                  backgroundColor: present ? accent(500) : 'transparent',
                  outline: present ? 'none' : `1px solid ${accent(500)}`,
                  outlineOffset: -1,
                  opacity: present ? 1 : 0.3,
                  transform: pose ? 'scale(1)' : 'scale(0.2)',
                  transition: reduced
                    ? 'none'
                    : `transform 420ms cubic-bezier(0.16, 1, 0.3, 1) ${String(rang * 70)}ms`,
                }}
              />
            </span>
          )
        })}
      </div>
    </div>
  )
}

/** Les liens de la barre mince, posee dans la moitie textuelle. */
const LIENS = [
  ['#specialites', 'Specialites'],
  ['#praticiens', 'Praticiens'],
  ['#tarifs', 'Tarifs'],
  ['#pratique', 'Acces'],
] as const

/** Les numeros a composer hors du cabinet. */
const URGENCES = [
  ['Urgence vitale', 'Composez le 15'],
  ['Consultation de garde', '116 117, soirs et dimanches'],
  ['Accueil du cabinet', '01 47 20 63 40'],
] as const

/** Les specialites exercees au cabinet, avec leur delai reel. */
const SPECIALITES = [
  {
    icone: Stethoscope,
    nom: 'Medecine generale',
    jours: [true, true, true, true, true, true],
    texte:
      'Consultations, suivi chronique, certificats, vaccinations. Cinq medecins traitants.',
    delai: 'Sous 48 heures',
    prochain: 'Jeudi 11h20',
    praticiens: 'Cinq praticiens',
    nouveaux: 'Oui',
  },
  {
    icone: HeartPulse,
    nom: 'Cardiologie',
    jours: [true, true, false, true, false, false],
    texte: 'Electrocardiogramme, echographie cardiaque, holter tensionnel sur place.',
    delai: 'Sous 12 jours',
    prochain: 'Lundi 21, 09h00',
    praticiens: 'Deux praticiens',
    nouveaux: 'Oui, sur courrier',
  },
  {
    icone: Baby,
    nom: 'Pediatrie',
    jours: [true, true, true, true, true, false],
    texte: 'Suivi du nourrisson a l adolescent, bilans obligatoires, urgences du jour.',
    delai: 'Sous 3 jours',
    prochain: 'Demain 08h40',
    praticiens: 'Deux praticiens',
    nouveaux: 'Fermees de novembre a fevrier',
  },
  {
    icone: Users,
    nom: 'Gynecologie',
    jours: [false, false, true, true, false, false],
    texte:
      'Suivi gynecologique, contraception, depistages, accompagnement de la menopause.',
    delai: 'Sous 15 jours',
    prochain: 'Jeudi 24, 14h30',
    praticiens: 'Une praticienne',
    nouveaux: 'Oui',
  },
  {
    icone: Accessibility,
    nom: 'Kinesitherapie',
    jours: [false, true, true, false, true, true],
    texte:
      'Reeducation post-operatoire, rachis, sport. Deux salles equipees au rez-de-chaussee.',
    delai: 'Sous 7 jours',
    prochain: 'Mardi 15, 17h00',
    praticiens: 'Un praticien',
    nouveaux: 'Oui, sur prescription',
  },
  {
    icone: FileText,
    nom: 'Biologie',
    jours: [true, true, true, true, true, true],
    texte:
      'Prelevements sanguins sans rendez-vous de 7h a 10h, resultats en ligne le soir meme.',
    delai: 'Sans rendez-vous',
    prochain: 'Tous les matins des 7h',
    praticiens: 'Deux preleveuses',
    nouveaux: 'Oui',
  },
]

/** Un motif de consultation, avec ce qu il implique. */
interface Motif {
  readonly id: string
  readonly nom: string
  readonly duree: string
  readonly tarif: string
  /** Les specialites qui traitent ce motif. */
  readonly specialites: readonly string[]
  readonly note: string
}

/** Les motifs proposes a la prise de rendez-vous. */
const MOTIFS: readonly Motif[] = [
  {
    id: 'premiere',
    nom: 'Premiere consultation',
    duree: '30 minutes',
    tarif: '30 EUR',
    specialites: ['Medecine generale', 'Pediatrie', 'Gynecologie'],
    note: 'Le creneau est double : le praticien ouvre votre dossier avec vous.',
  },
  {
    id: 'suivi',
    nom: 'Consultation de suivi',
    duree: '20 minutes',
    tarif: '30 EUR',
    specialites: ['Medecine generale', 'Pediatrie', 'Gynecologie'],
    note: 'Apportez votre derniere ordonnance et vos resultats recents.',
  },
  {
    id: 'renouvellement',
    nom: 'Renouvellement d ordonnance',
    duree: '15 minutes',
    tarif: '30 EUR',
    specialites: ['Medecine generale'],
    note: 'Possible en teleconsultation si vous etes deja suivi ici.',
  },
  {
    id: 'resultats',
    nom: 'Resultats a commenter',
    duree: '15 minutes',
    tarif: '30 EUR',
    specialites: ['Medecine generale', 'Cardiologie'],
    note: 'Les resultats deposes dans votre espace sont deja lus par le praticien.',
  },
  {
    id: 'douleur',
    nom: 'Douleur, urgence du jour',
    duree: '20 minutes',
    tarif: '30 EUR',
    specialites: ['Medecine generale', 'Pediatrie'],
    note: 'Deux creneaux par demi-journee sont gardes pour le jour meme.',
  },
  {
    id: 'cardio',
    nom: 'Avis cardiologique',
    duree: '45 minutes',
    tarif: '50 EUR',
    specialites: ['Cardiologie'],
    note: 'Electrocardiogramme compris. Venez avec un courrier si vous en avez un.',
  },
  {
    id: 'kine',
    nom: 'Bilan kinesitherapique',
    duree: '30 minutes',
    tarif: '16,13 EUR',
    specialites: ['Kinesitherapie'],
    note: 'Une prescription est necessaire pour le remboursement.',
  },
  {
    id: 'certificat',
    nom: 'Certificat, aptitude au sport',
    duree: '20 minutes',
    tarif: '35 EUR',
    specialites: ['Medecine generale', 'Pediatrie'],
    note: 'Non rembourse par l assurance maladie. Reglement sur place.',
  },
]

/** Un jour de creneaux, avec ce qui reste. */
interface Jour {
  readonly jour: string
  /** Heure, et disponibilite. */
  readonly heures: readonly (readonly [string, boolean])[]
}

/** Un praticien du cabinet. */
interface Praticien {
  readonly id: string
  readonly nom: string
  readonly specialite: string
  readonly role: string
  readonly detail: string
  readonly langues: string
  readonly secteur: string
  readonly tarif: string
  /** Ou la consultation a lieu : c est grave sur la plaque. */
  readonly bureau: string
  readonly creneaux: readonly Jour[]
}

/** Les praticiens ouverts a la prise de rendez-vous en ligne. */
const PRATICIENS: readonly Praticien[] = [
  {
    id: 'vernet',
    bureau: 'Cabinet 1 — rez-de-chaussee',
    nom: 'Dr Helene Vernet',
    specialite: 'Medecine generale',
    role: 'Medecine generale — fondatrice',
    detail: 'Installee depuis 2009. Diplome universitaire de medecine du sport.',
    langues: 'Francais, anglais',
    secteur: 'Secteur 1',
    tarif: '30 EUR, tiers payant integral',
    creneaux: [
      {
        jour: 'Demain, mardi 12',
        heures: [
          ['08h20', false],
          ['09h40', true],
          ['11h00', false],
          ['14h20', true],
          ['17h40', true],
        ],
      },
      {
        jour: 'Mercredi 13',
        heures: [
          ['07h40', true],
          ['10h20', true],
          ['12h00', false],
          ['16h00', true],
          ['18h20', false],
        ],
      },
      {
        jour: 'Jeudi 14',
        heures: [
          ['08h00', true],
          ['11h20', true],
          ['15h00', true],
          ['17h00', false],
          ['19h20', true],
        ],
      },
    ],
  },
  {
    id: 'sadaoui',
    bureau: 'Cabinet 5 — 1er etage',
    nom: 'Dr Amine Sadaoui',
    specialite: 'Cardiologie',
    role: 'Cardiologie',
    detail:
      'Ancien praticien hospitalier a Saint-Antoine. Echographie et holter sur place.',
    langues: 'Francais, arabe, anglais',
    secteur: 'Secteur 2',
    tarif: '50 EUR, depassement affiche a l accueil',
    creneaux: [
      {
        jour: 'Lundi 21',
        heures: [
          ['09h00', true],
          ['10h30', false],
          ['14h00', true],
          ['15h30', true],
          ['17h00', false],
        ],
      },
      {
        jour: 'Mardi 22',
        heures: [
          ['09h00', false],
          ['10h30', true],
          ['14h00', false],
          ['15h30', true],
          ['17h00', true],
        ],
      },
      {
        jour: 'Jeudi 24',
        heures: [
          ['09h00', true],
          ['10h30', true],
          ['14h00', true],
          ['15h30', false],
          ['17h00', true],
        ],
      },
    ],
  },
  {
    id: 'bonnet',
    bureau: 'Cabinet 3 — rez-de-chaussee',
    nom: 'Dr Claire Bonnet',
    specialite: 'Pediatrie',
    role: 'Pediatrie',
    detail: 'Recoit du nourrisson a dix-huit ans. Consultations d urgence chaque matin.',
    langues: 'Francais, espagnol',
    secteur: 'Secteur 1',
    tarif: '35 EUR jusqu a 6 ans, 30 EUR ensuite',
    creneaux: [
      {
        jour: 'Demain, mardi 12',
        heures: [
          ['08h40', true],
          ['09h20', true],
          ['10h40', false],
          ['16h20', true],
          ['17h40', false],
        ],
      },
      {
        jour: 'Mercredi 13',
        heures: [
          ['08h40', false],
          ['09h20', false],
          ['10h40', true],
          ['14h00', true],
          ['16h20', true],
        ],
      },
      {
        jour: 'Vendredi 15',
        heures: [
          ['08h40', true],
          ['09h20', true],
          ['11h00', true],
          ['15h40', false],
          ['17h00', true],
        ],
      },
    ],
  },
  {
    id: 'nizard',
    bureau: 'Cabinet 6 — 1er etage',
    nom: 'Dr Sarah Nizard',
    specialite: 'Gynecologie',
    role: 'Gynecologie',
    detail:
      'Suivi gynecologique et contraception. Consultation longue pour les premieres venues.',
    langues: 'Francais, anglais, portugais',
    secteur: 'Secteur 2',
    tarif: '60 EUR, base de remboursement 30 EUR',
    creneaux: [
      {
        jour: 'Jeudi 24',
        heures: [
          ['09h30', true],
          ['11h00', false],
          ['14h30', true],
          ['16h00', true],
          ['17h30', false],
        ],
      },
      {
        jour: 'Vendredi 25',
        heures: [
          ['09h30', false],
          ['11h00', true],
          ['14h30', true],
          ['16h00', false],
          ['17h30', true],
        ],
      },
      {
        jour: 'Samedi 26',
        heures: [
          ['09h00', true],
          ['10h00', true],
          ['11h00', false],
          ['12h00', true],
        ],
      },
    ],
  },
  {
    id: 'delaunay',
    bureau: 'Salle A — rez-de-chaussee',
    nom: 'Marc Delaunay',
    specialite: 'Kinesitherapie',
    role: 'Kinesitherapie',
    detail: 'Reeducation du rachis et du genou. Travaille avec les chirurgiens de Tenon.',
    langues: 'Francais, anglais',
    secteur: 'Conventionne',
    tarif: '16,13 EUR la seance, tiers payant',
    creneaux: [
      {
        jour: 'Mardi 15',
        heures: [
          ['08h00', true],
          ['09h00', false],
          ['12h00', true],
          ['17h00', true],
          ['19h00', true],
        ],
      },
      {
        jour: 'Mercredi 16',
        heures: [
          ['08h00', false],
          ['09h00', true],
          ['12h00', false],
          ['17h00', true],
          ['19h00', true],
        ],
      },
      {
        jour: 'Vendredi 18',
        heures: [
          ['08h00', true],
          ['09h00', true],
          ['12h00', true],
          ['17h00', false],
          ['19h00', true],
        ],
      },
    ],
  },
]

/** Les quatre etapes du panneau. */
const ETAPES = [
  { id: 'motif', label: 'Le motif', hint: 'Une minute' },
  { id: 'praticien', label: 'Le praticien', hint: 'Vous choisissez' },
  { id: 'creneau', label: 'Le creneau', hint: 'Une heure exacte' },
  { id: 'coordonnees', label: 'Vos coordonnees', hint: 'Quatre champs' },
]

/** Ce qu il faut apporter le jour du rendez-vous. */
const APPORTER = [
  {
    titre: 'A sortir a l accueil',
    icone: CreditCard,
    lignes: [
      'Votre carte vitale a jour — la borne du hall la met a jour en dix secondes',
      'Votre attestation de mutuelle, papier ou dans votre telephone',
      'Une piece d identite pour une premiere venue',
    ],
  },
  {
    titre: 'A montrer au praticien',
    icone: FileText,
    lignes: [
      'Vos ordonnances en cours, y compris celles d un autre medecin',
      'Vos derniers resultats d analyses ou d imagerie',
      'Le carnet de sante pour un enfant de moins de seize ans',
      'Le courrier du medecin qui vous adresse, s il y en a un',
    ],
  },
  {
    titre: 'Inutile',
    icone: Check,
    lignes: [
      'Imprimer la confirmation : votre nom suffit a l accueil',
      'Apporter votre dossier papier : il est partage entre les onze praticiens',
      'Prevoir des especes, sauf pour un acte non rembourse',
    ],
  },
]

/** Les tarifs affiches en salle d attente, repris ici. */
const TARIFS: readonly (readonly [string, string, string, string, string])[] = [
  ['Consultation de medecine generale', '30 EUR', '30 EUR', '0 EUR', 'Secteur 1'],
  [
    'Consultation de suivi, enfant de moins de 6 ans',
    '35 EUR',
    '35 EUR',
    '0 EUR',
    'Secteur 1',
  ],
  ['Consultation le samedi ou apres 20h', '42,50 EUR', '42,50 EUR', '0 EUR', 'Secteur 1'],
  [
    'Visite a domicile, patient non mobilisable',
    '40 EUR',
    '40 EUR',
    '0 EUR',
    'Secteur 1',
  ],
  ['Teleconsultation de renouvellement', '30 EUR', '30 EUR', '0 EUR', 'Secteur 1'],
  ['Consultation de cardiologie', '50 EUR', '50 EUR', '0 EUR', 'Secteur 2'],
  ['Echographie cardiaque', '96,49 EUR', '96,49 EUR', '0 EUR', 'Secteur 2'],
  [
    'Consultation de gynecologie',
    '60 EUR',
    '30 EUR',
    '0 a 30 EUR selon mutuelle',
    'Secteur 2',
  ],
  ['Seance de kinesitherapie', '16,13 EUR', '16,13 EUR', '0 EUR', 'Conventionne'],
  [
    'Certificat d aptitude au sport',
    '35 EUR',
    'Non rembourse',
    '35 EUR',
    'Hors nomenclature',
  ],
]

/** Les questions posees a l accueil, dans l ordre de frequence. */
const QUESTIONS = [
  {
    question: 'Faut-il etre patient du cabinet pour prendre rendez-vous ?',
    answer:
      'Non. Les onze praticiens recoivent de nouveaux patients. Seule la pediatrie limite les nouvelles inscriptions en periode de forte affluence, entre novembre et fevrier.',
  },
  {
    question: 'Que faire en dehors des heures d ouverture ?',
    answer:
      'Composez le 15 pour une urgence vitale, ou le 116 117 pour une consultation de garde. Le repondeur du cabinet donne ces deux numeros, et la maison medicale de garde la plus proche se trouve rue de Ponthieu.',
  },
  {
    question: 'Combien coute une consultation ?',
    answer:
      'Une consultation de medecine generale est facturee 30 EUR, remboursee a 70 % par l assurance maladie et le solde par votre complementaire. Les depassements des praticiens de secteur 2 sont affiches en salle d attente, repris dans le tableau des tarifs de cette page, et rappeles avant la prise de rendez-vous.',
  },
  {
    question: 'Puis-je consulter a distance ?',
    answer:
      'Oui, pour un renouvellement d ordonnance, un resultat a commenter ou un avis simple. La teleconsultation dure quinze minutes et se regle en ligne. Un premier rendez-vous se fait toujours au cabinet.',
  },
  {
    question: 'Comment recuperer mes resultats de biologie ?',
    answer:
      'Ils sont deposes le soir meme dans votre espace patient, et transmis automatiquement au praticien qui les a prescrits. Une copie papier reste disponible a l accueil pendant trente jours.',
  },
  {
    question: 'Que se passe-t-il si je ne viens pas ?',
    answer:
      'Rien de plus qu un rappel amical. Nous demandons simplement d annuler quatre heures avant : chaque creneau libere est repris dans l heure par un patient en liste d attente.',
  },
  {
    question: 'Mes donnees de sante sont-elles a l abri ?',
    answer:
      'Le dossier medical est heberge chez un hebergeur de donnees de sante agree, en France. Il est partage entre les onze praticiens du cabinet et personne d autre ; vous pouvez en demander une copie ou la suppression des donnees non medicales par simple courriel.',
  },
]

/**
 * Le taux de remplissage de l agenda de la semaine, par specialite.
 *
 * Un delai moyen ne dit pas si la porte est ouverte : un agenda rempli a
 * quatre-vingt-seize pour cent le dit. Le releve est fait le lundi matin sur
 * les sept jours qui suivent, creneaux du jour meme compris.
 */
const REMPLISSAGE: Readonly<Record<string, number>> = {
  'Medecine generale': 82,
  Cardiologie: 94,
  Pediatrie: 71,
  Gynecologie: 96,
  Kinesitherapie: 88,
  Biologie: 46,
}

/**
 * Les quatre actes du parcours, tels qu ils restent epingles.
 *
 * Ce ne sont pas quatre promesses : chacun dit ce que l etape decide et ce
 * qu elle ne demande pas encore. Le panneau qui les execute vraiment est plus
 * bas dans la page ; ici, on montre la mecanique avant de s en servir.
 */
const PARCOURS = [
  {
    mot: 'Le motif',
    titre: 'Le motif fixe la duree, pas l inverse.',
    texte:
      'Une premiere consultation dure trente minutes, un renouvellement quinze. Le creneau reserve suit ce que vous venez faire, et non un pas de quinze minutes valable pour tout le monde.',
    note: 'Aucun document demande a cette etape',
  },
  {
    mot: 'Le praticien',
    titre: 'Le motif n ouvre que les praticiens qui le traitent.',
    texte:
      'Une douleur du jour ne se prend pas chez le kinesitherapeute. Les agendas qui ne correspondent pas ne s affichent pas : les proposer puis les refuser serait une perte de temps pour vous.',
    note: 'Onze praticiens, cinq agendas ouverts en ligne',
  },
  {
    mot: 'Le creneau',
    titre: 'Les heures affichees sont celles qui restent.',
    texte:
      'Ce qui est pris n est pas cliquable, et n est pas cache non plus. Deux creneaux par demi-journee sont gardes pour le jour meme, et ceux-la ne se reservent pas la veille.',
    note: 'Agenda releve a la seconde',
  },
  {
    mot: 'Vos coordonnees',
    titre: 'Quatre champs, et rien de plus.',
    texte:
      'Un nom, une date de naissance, un moyen de vous joindre. Aucun compte a creer pour une premiere consultation, aucun mot de passe, aucune carte bancaire.',
    note: 'Annulation possible jusqu a quatre heures avant',
  },
] as const

/**
 * Un choix dans une liste, a la maniere d une case a cocher large.
 *
 * Le panneau de rendez-vous n emploie ni menu deroulant ni pastille : chaque
 * option est une ligne cliquable qui montre son etat, parce qu un patient doit
 * voir d un coup d oeil ce qu il a choisi.
 */
function Choix({
  actif,
  onClick,
  titre,
  detail,
  disabled = false,
}: {
  readonly actif: boolean
  readonly onClick: () => void
  readonly titre: string
  readonly detail?: string
  readonly disabled?: boolean
}): ReactElement {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={actif}
      disabled={disabled}
      onClick={onClick}
      className={
        actif
          ? 'o-w-full o-rounded-lg o-border-w-1 o-border-brand-500 o-px-4 o-py-3 o-text-left o-transition-colors focus:o-ring'
          : disabled
            ? 'o-w-full o-cursor-not-allowed o-rounded-lg o-border-w-1 o-border-slate-200 dark:o-border-slate-800 o-px-4 o-py-3 o-text-left'
            : 'o-w-full o-rounded-lg o-border-w-1 o-border-slate-200 dark:o-border-slate-800 o-px-4 o-py-3 o-text-left hover:o-border-brand-400 o-transition-colors focus:o-ring'
      }
      style={actif ? PASTILLE_DOUCE : undefined}
    >
      <span
        className={
          disabled
            ? 'o-block o-text-sm o-font-medium o-text-slate-500 dark:o-text-slate-500'
            : 'o-block o-text-sm o-font-medium o-text-slate-900 dark:o-text-slate-100'
        }
      >
        {titre}
      </span>
      {detail === undefined ? null : (
        <span
          className={
            disabled
              ? 'o-mt-0.5 o-block o-text-xs o-text-slate-500 dark:o-text-slate-500'
              : 'o-mt-0.5 o-block o-text-xs o-text-slate-600 dark:o-text-slate-400'
          }
        >
          {detail}
        </span>
      )}
    </button>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('manrope')
  const [etape, setEtape] = useState(0)
  const [motifId, setMotifId] = useState('')
  const [praticienId, setPraticienId] = useState('')
  const [creneau, setCreneau] = useState('')
  const [patient, setPatient] = useState({
    nom: '',
    naissance: '',
    contact: '',
    traitant: false,
  })
  const [fautes, setFautes] = useState<Record<string, string>>({})
  const [confirme, setConfirme] = useState(false)

  const motif = MOTIFS.find((item) => item.id === motifId)
  // Le motif ouvre les praticiens : une douleur du jour ne se prend pas chez le
  // kinesitherapeute, et l afficher quand meme serait mentir.
  const ouverts =
    motif === undefined
      ? PRATICIENS
      : PRATICIENS.filter((item) => motif.specialites.includes(item.specialite))
  const praticien = ouverts.find((item) => item.id === praticienId)

  /** Le dossier, deduit du choix : rien n est tire au sort. */
  const dossier = `CV-${String(
    ((motifId.length * 41 + praticienId.length * 23 + creneau.length * 11) % 800) + 100,
  )}`

  const complet = [
    motifId !== '',
    praticienId !== '',
    creneau !== '',
    patient.nom.trim() !== '' && patient.contact.trim() !== '',
  ]

  return (
    <Porte forme="iris" marque="Clinique Vernet" sombre={false}>
      <div
        className="o-bg-white dark:o-bg-slate-950 o-text-slate-700 dark:o-text-slate-300"
        style={polices}
      >
        {/*
          ---------- L ouverture : le hall, plein cadre ----------

          Une photographie du hall qui recule au defilement, et le titre pose au
          bas du cadre. C est la seule bande sombre de la page : le corps est
          blanc, et le passage de l un a l autre est une coupe nette.
        */}
        <ZoomDefile
          de={1.12}
          assombrir={0.5}
          className="o-min-h-screen"
          style={nuit('slate')}
          fond={
            <>
              <img
                src={media('clinique-accueil', 'L accueil du cabinet', 1800, 1000).src}
                alt=""
                aria-hidden="true"
                className="o-absolute o-inset-0 o-z-0 o-size-full o-object-cover"
              />
              <Voile sens="haut-bas" famille="slate" />
              {/*
                Le hall est photographie a contre-jour : ses fenetres montent
                tres clair au milieu du cadre. Un second voile, plus appuye
                depuis le bas, tient l encre du titre et du chapeau.
              */}
              <div
                aria-hidden="true"
                className="o-absolute o-inset-0 o-z-0"
                style={{
                  background:
                    'linear-gradient(to top, var(--o-palette-slate-950) 10%, color-mix(in oklab, var(--o-palette-slate-950) 76%, transparent) 48%, transparent 84%)',
                }}
              />
              <Grain opacite={0.05} />
            </>
          }
        >
          <BarreFilet
            marque="Clinique Vernet"
            liens={LIENS}
            action={['#rendez-vous', 'Prendre rendez-vous']}
          />

          <div
            id="accueil"
            className="o-relative o-z-20 o-mx-auto o-flex o-min-h-screen o-max-w-7xl o-flex-col o-justify-end o-px-6 o-pb-20 o-pt-20 md:o-px-10 lg:o-px-14"
          >
            <Surgit>
              <Etiquette>Paris 8e — onze praticiens conventionnes</Etiquette>
            </Surgit>
            <TitreVague
              delai={120}
              className="o-m-0 o-mt-6 o-max-w-4xl o-text-slate-50"
              style={{ ...affiche('l', 300), fontSize: 'clamp(2.5rem, 6.4vw, 6.5rem)' }}
            >
              Vous saurez qui vous recoit, et quand.
            </TitreVague>

            <div className="o-mt-10 o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <Surgit
                delai={520}
                as="p"
                className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-slate-300 md:o-col-span-6"
              >
                Six specialites sous le meme toit, un seul dossier medical, ouvert de 7h30
                a 20h.
              </Surgit>
              <Surgit delai={640} className="md:o-col-span-6 md:o-flex md:o-justify-end">
                <Actions
                  pleine={[
                    '#rendez-vous',
                    <>
                      Prendre rendez-vous{' '}
                      <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#specialites', 'Les six specialites']}
                />
              </Surgit>
            </div>

            {/* Les numeros, en bas du cadre : c est ce qu on cherche en urgence. */}
            <Surgit delai={760} className="o-mt-14">
              <dl className="o-m-0 o-grid o-gap-x-10 o-gap-y-5 o-border-t o-border-white-20 o-pt-6 sm:o-grid-cols-3">
                {URGENCES.map(([titre, valeur]) => (
                  <div key={titre}>
                    <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
                      {titre}
                    </dt>
                    <dd className="o-m-0 o-mt-1.5 o-text-base o-font-medium o-text-slate-50">
                      {valeur}
                    </dd>
                  </div>
                ))}
              </dl>
            </Surgit>
          </div>

          <Coin position="bd">
            18 rue Vernet, Paris 8e
            <br />
            Metro George V, sortie 3
          </Coin>
        </ZoomDefile>

        <main>
          {/*
            ---------- Le parcours, epingle ----------

            La signature de mouvement de la page : un ecran qui reste fixe
            pendant quatre hauteurs, et dont l acte change. Le titre de la
            section porte l animation de texte attribuee a cette vitrine.
          */}
          <section
            aria-labelledby="parcours-titre"
            className="o-px-6 o-pt-24 md:o-px-10 md:o-pt-32 lg:o-px-14"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <Indice rang="01" sombre={false}>
                Le parcours
              </Indice>
              <TrueFocus
                as="h2"
                id="parcours-titre"
                className="o-m-0 o-mt-6 o-max-w-4xl o-text-slate-900 dark:o-text-slate-50"
                style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 4vw, 3.75rem)' }}
                couleur={encre()}
                blur={3}
                attenue={0.72}
                hold={1500}
              >
                Le motif, le praticien, le creneau.
              </TrueFocus>
            </div>
          </section>

          <Epingle ecrans={4} actes={PARCOURS.length}>
            {(acte) => {
              const pas = PARCOURS[acte] ?? PARCOURS[0]
              return (
                <div className="o-flex o-h-full o-flex-col o-justify-center o-px-6 md:o-px-10 lg:o-px-14">
                  <div className="o-mx-auto o-grid o-w-full o-max-w-7xl o-gap-10 md:o-grid-cols-12">
                    <div className="md:o-col-span-4">
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                        Etape {String(acte + 1).padStart(2, '0')} sur{' '}
                        {String(PARCOURS.length).padStart(2, '0')}
                      </p>
                      <ol className="o-m-0 o-mt-8 o-list-none o-p-0">
                        {PARCOURS.map((autre, rang) => (
                          <li
                            key={autre.mot}
                            className="o-flex o-items-center o-gap-3 o-py-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                            style={
                              rang === acte
                                ? ACCENT_ENCRE
                                : { color: 'var(--o-theme-muted)' }
                            }
                          >
                            <span
                              aria-hidden="true"
                              className="o-h-px o-transition-all"
                              style={{
                                width: rang === acte ? 28 : 10,
                                backgroundColor: 'currentColor',
                              }}
                            />
                            {autre.mot}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="o-min-w-0 md:o-col-span-8">
                      <h3
                        className="o-m-0 o-max-w-3xl o-text-balance o-text-slate-900 dark:o-text-slate-50"
                        style={{
                          ...affiche('m', 300),
                          fontSize: 'clamp(1.75rem, 4.4vw, 4rem)',
                        }}
                      >
                        {pas.titre}
                      </h3>
                      <p className="o-mt-8 o-max-w-lg o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400 md:o-ml-auto md:o-text-right">
                        {pas.texte}
                      </p>
                      <p
                        className="o-mt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest md:o-text-right"
                        style={ACCENT_ENCRE}
                      >
                        {pas.note}
                      </p>
                    </div>
                  </div>
                </div>
              )
            }}
          </Epingle>

          {/*
            ---------- Les specialites, en liste ----------

            Une ligne par specialite, sur filets : ni vignette a pictogramme, ni
            tableau. Ce que le tableau disait des delais est passe dans les
            jauges, plus bas.
          */}
          <section
            id="specialites"
            aria-labelledby="specialites-titre"
            className="o-scroll-mt-24 o-border-t o-border-slate-200 dark:o-border-slate-800 o-px-6 o-py-24 md:o-px-10 md:o-py-32 lg:o-px-14"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Indice rang="02" sombre={false}>
                    Les specialites
                  </Indice>
                  <h2
                    id="specialites-titre"
                    className="o-m-0 o-mt-5 o-text-slate-900 dark:o-text-slate-50"
                    style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.2vw, 4rem)' }}
                  >
                    Six specialites, un seul dossier.
                  </h2>
                </div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-500 dark:o-text-slate-400 md:o-col-span-5 md:o-text-right">
                  Un examen prescrit ici est lu ici
                  <br />
                  Le compte-rendu part chez votre traitant sous 24 h
                </p>
              </div>

              {/* Six lignes, et non six cartes. Le relief vient de ce que la
                  ligne porte : un disque grave, l effectif, la semaine de
                  presence dessinee, et le prochain creneau en accent. La
                  premiere ligne est plus large que les autres — c est la
                  specialite qui fait les trois quarts des rendez-vous. */}
              <ol className="o-m-0 o-mt-16 o-list-none o-border-t o-border-slate-200 dark:o-border-slate-800 o-p-0">
                {SPECIALITES.map((item, rang) => {
                  const premiere = rang === 0
                  return (
                    <li
                      key={item.nom}
                      className={`o-grid o-items-start o-gap-x-8 o-gap-y-5 o-border-b o-border-slate-200 dark:o-border-slate-800 md:o-grid-cols-12 ${premiere ? 'o-py-12' : 'o-py-8'}`}
                    >
                      <div className="o-flex o-items-center o-gap-5 md:o-col-span-5">
                        <span
                          aria-hidden="true"
                          className="o-font-mono o-text-xs o-tabular-nums o-tracking-widest o-text-slate-500 dark:o-text-slate-400"
                        >
                          {String(rang + 1).padStart(2, '0')}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`o-flex o-shrink-0 o-items-center o-justify-center o-rounded-full o-border-w-1 ${premiere ? 'o-size-16' : 'o-size-12'}`}
                          style={{
                            ...PASTILLE_DOUCE,
                            borderColor: accent(300),
                            color: encre(),
                          }}
                        >
                          <Icon icon={item.icone} size={premiere ? 26 : 20} />
                        </span>
                        <h3
                          className="o-m-0 o-min-w-0 o-text-slate-900 dark:o-text-slate-50"
                          style={{
                            ...affiche('m', 300),
                            fontSize: premiere
                              ? 'clamp(1.75rem, 3.4vw, 3.25rem)'
                              : 'clamp(1.5rem, 2.6vw, 2.5rem)',
                          }}
                        >
                          {item.nom}
                        </h3>
                      </div>

                      <div className="o-min-w-0 md:o-col-span-4">
                        <p className="o-m-0 o-max-w-lg o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                          {item.texte}
                        </p>
                        <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                          {item.praticiens} — {item.delai.toLowerCase()}
                        </p>
                      </div>

                      <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-x-6 o-gap-y-4 md:o-col-span-3 md:o-flex-col md:o-items-end">
                        <Semaine jours={item.jours} nom={item.nom} />
                        <p
                          className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest md:o-text-right"
                          style={ACCENT_ENCRE}
                        >
                          {item.prochain}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>

              <p className="o-m-0 o-mt-10 o-flex o-flex-wrap o-items-center o-gap-x-3 o-gap-y-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                <span
                  aria-hidden="true"
                  className="o-block o-size-1.5 o-rounded-full"
                  style={{ backgroundColor: accent(500) }}
                />
                Les points marquent les jours de presence au cabinet
              </p>
            </div>
          </section>

          {/*
            ---------- Les praticiens ----------

            Une grille de photographies a legendes en mono, sans cartes : le
            visage, le nom, et ce qu on demande vraiment — la langue, le
            secteur, le tarif.
          */}
          <section
            id="praticiens"
            aria-labelledby="praticiens-titre"
            className="o-scroll-mt-24 o-border-t o-border-slate-200 dark:o-border-slate-800 o-px-6 o-py-24 md:o-px-10 md:o-py-32 lg:o-px-14"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
                <div>
                  <Indice rang="03" sombre={false}>
                    Les praticiens
                  </Indice>
                  <h2
                    id="praticiens-titre"
                    className="o-m-0 o-mt-5 o-text-slate-900 dark:o-text-slate-50"
                    style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.2vw, 4rem)' }}
                  >
                    Vous savez qui vous verrez.
                  </h2>
                </div>
                <p className="o-m-0 o-max-w-sm o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                  Cinq des onze praticiens
                  <br />
                  Ceux dont l agenda est ouvert en ligne
                </p>
              </div>

              {/* Les praticiens de cette page sont inventes : on ne leur prete
                  aucun visage. Ce qui les figure est la plaque de leur porte —
                  gravee, teintee par la palette de la page, et dessinee ici
                  plutot que tiree d une photographie. */}
              <ul className="o-m-0 o-mt-16 o-grid o-list-none o-gap-x-8 o-gap-y-12 o-p-0 sm:o-grid-cols-2 lg:o-grid-cols-5">
                {PRATICIENS.map((praticienItem) => (
                  <li key={praticienItem.id}>
                    <Plaque
                      nom={praticienItem.nom}
                      specialite={praticienItem.specialite}
                      bureau={praticienItem.bureau}
                    />
                    <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                      {praticienItem.role}
                    </p>
                    <h3 className="o-m-0 o-mt-2 o-text-xl o-font-medium o-tracking-tight o-text-slate-900 dark:o-text-slate-50">
                      {praticienItem.nom}
                    </h3>
                    <p className="o-m-0 o-mt-3 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                      {praticienItem.detail}
                    </p>
                    <p className="o-m-0 o-mt-4 o-border-t o-border-slate-200 dark:o-border-slate-800 o-pt-3 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                      {praticienItem.langues}
                      <br />
                      {praticienItem.secteur} — {praticienItem.tarif}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="o-m-0 o-mt-12 o-max-w-2xl o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                Les praticiens de ce modele sont inventes. Plutot que de leur preter le
                visage de quelqu un, chacun est figure par la plaque de sa porte : son
                monogramme grave, et le cabinet ou il recoit.
              </p>
            </div>
          </section>

          {/*
            ---------- Les jauges d attente ----------

            La forme de chiffres attribuee a cette page : des anneaux, et non une
            barre de nombres. Un delai moyen ne dit pas si la porte est ouverte ;
            un agenda rempli a quatre-vingt-seize pour cent, si.
          */}
          <section
            id="attente"
            aria-labelledby="attente-titre"
            className="o-scroll-mt-24 o-border-t o-border-slate-200 dark:o-border-slate-800 o-bg-slate-50 dark:o-bg-slate-900 o-px-6 o-py-24 md:o-px-10 md:o-py-32 lg:o-px-14"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <Indice rang="04" sombre={false}>
                L attente
              </Indice>
              <h2
                id="attente-titre"
                className="o-m-0 o-mt-5 o-max-w-2xl o-text-slate-900 dark:o-text-slate-50"
                style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.2vw, 4rem)' }}
              >
                Ce que l agenda montre, cette semaine.
              </h2>

              <ul className="o-m-0 o-mt-16 o-grid o-list-none o-gap-x-12 o-gap-y-10 o-p-0 sm:o-grid-cols-2">
                {SPECIALITES.map((item) => {
                  const taux = REMPLISSAGE[item.nom] ?? 0
                  return (
                    <li
                      key={item.nom}
                      className="o-flex o-items-center o-gap-6 o-border-t o-border-slate-300 dark:o-border-slate-700 o-pt-7"
                    >
                      <ProgressRing
                        value={taux}
                        size={88}
                        thickness={5}
                        label={`Agenda de ${item.nom.toLowerCase()}, rempli a ${String(taux)} pour cent`}
                        className="o-shrink-0"
                      />
                      <div className="o-min-w-0">
                        <h3 className="o-m-0 o-text-lg o-font-medium o-tracking-tight o-text-slate-900 dark:o-text-slate-50">
                          {item.nom}
                        </h3>
                        <p className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-600 dark:o-text-slate-400">
                          {item.delai} — prochain creneau {item.prochain.toLowerCase()}
                        </p>
                        <p
                          className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                          style={ACCENT_ENCRE}
                        >
                          Nouveaux patients : {item.nouveaux.toLowerCase()}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <p className="o-mt-14 o-max-w-2xl o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                Taux de remplissage releve le lundi matin sur les sept jours qui suivent,
                creneaux du jour meme compris. Deux creneaux par demi-journee sont gardes
                pour les douleurs du jour : ils n apparaissent pas dans ce calcul.
              </p>
            </div>
          </section>

          {/*
            ---------- Les tarifs ----------

            Les memes chiffres que ceux affiches en salle d attente. Le tableau
            defile lateralement plutot que d ecraser cinq colonnes dans 332 px ;
            ce qui l accompagne est une liste a filets, pas quatre vignettes.
          */}
          <section
            id="tarifs"
            aria-labelledby="tarifs-titre"
            className="o-scroll-mt-24 o-border-t o-border-slate-200 dark:o-border-slate-800 o-px-6 o-py-24 md:o-px-10 md:o-py-32 lg:o-px-14"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Indice rang="05" sombre={false}>
                    Les tarifs
                  </Indice>
                  <h2
                    id="tarifs-titre"
                    className="o-m-0 o-mt-5 o-text-slate-900 dark:o-text-slate-50"
                    style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.2vw, 4rem)' }}
                  >
                    Ce qui reste a votre charge.
                  </h2>
                </div>
                <p className="o-m-0 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400 md:o-col-span-5">
                  Le reste a charge suppose une complementaire sante qui prend la part
                  restante ; sans complementaire, comptez 30 % de la base de
                  remboursement.
                </p>
              </div>

              <div
                className="o-mt-14 o-max-w-full o-overflow-x-auto"
                style={{ contain: 'paint' }}
              >
                <table className="o-w-full o-min-w-96 o-text-left o-text-sm">
                  <caption className="o-text-left o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                    Tarifs applicables, en vigueur au 1er janvier
                  </caption>
                  <thead>
                    <tr className="o-border-b o-border-slate-300 dark:o-border-slate-700">
                      {[
                        'Acte',
                        'Tarif',
                        'Base de remboursement',
                        'Reste a charge',
                        'Secteur',
                      ].map((titre, rang) => (
                        <th
                          key={titre}
                          scope="col"
                          className={`o-py-3.5 o-pr-5 o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400 ${
                            rang > 0 ? 'o-text-right' : ''
                          }`}
                        >
                          {titre}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TARIFS.map(([acte, tarif, base, reste, secteur]) => (
                      <tr
                        key={acte}
                        className="o-border-b o-border-slate-200 dark:o-border-slate-800"
                      >
                        <th
                          scope="row"
                          className="o-py-4 o-pr-5 o-font-normal o-text-slate-900 dark:o-text-slate-100"
                        >
                          {acte}
                        </th>
                        <td className="o-py-4 o-pr-5 o-text-right o-font-mono o-text-xs o-tabular-nums o-text-slate-900 dark:o-text-slate-100">
                          {tarif}
                        </td>
                        <td className="o-py-4 o-pr-5 o-text-right o-font-mono o-text-xs o-tabular-nums o-text-slate-600 dark:o-text-slate-400">
                          {base}
                        </td>
                        <td
                          className="o-py-4 o-pr-5 o-text-right o-font-mono o-text-xs o-tabular-nums"
                          style={ACCENT_ENCRE}
                        >
                          {reste}
                        </td>
                        <td className="o-py-4 o-text-right o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-text-slate-400">
                          {secteur}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <dl className="o-m-0 o-mt-16 o-grid o-gap-x-12 o-p-0 md:o-grid-cols-2">
                {(
                  [
                    [
                      'Tiers payant',
                      'Applique de plein droit sur la part obligatoire, et sur la part complementaire pour les contrats en tiers payant integral.',
                    ],
                    [
                      'Moyens de paiement',
                      'Carte bancaire, cheque, especes. Sans contact jusqu a 50 EUR. Aucun supplement pour la carte.',
                    ],
                    [
                      'Complementaire sante solidaire',
                      'Acceptee par les onze praticiens, sans depassement, y compris en secteur 2.',
                    ],
                    [
                      'Devis ecrit',
                      'Remis avant tout acte dont le reste a charge depasse 70 EUR, conformement au code de la sante publique.',
                    ],
                  ] as const
                ).map(([titre, texte]) => (
                  <div
                    key={titre}
                    className="o-grid o-gap-x-8 o-gap-y-1 o-border-b o-border-slate-200 dark:o-border-slate-800 o-py-5 sm:o-grid-cols-12"
                  >
                    <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400 sm:o-col-span-5">
                      {titre}
                    </dt>
                    <dd className="o-m-0 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400 sm:o-col-span-7">
                      {texte}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* ---------- Les questions posees a l accueil ---------- */}
          <section
            aria-labelledby="faq-titre"
            className="o-border-t o-border-slate-200 dark:o-border-slate-800 o-px-6 o-py-24 md:o-px-10 md:o-py-32 lg:o-px-14"
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 lg:o-grid-cols-3">
              <div>
                <Indice rang="06" sombre={false}>
                  Le secretariat
                </Indice>
                <h2
                  id="faq-titre"
                  className="o-m-0 o-mt-5 o-text-slate-900 dark:o-text-slate-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.2vw, 3rem)',
                  }}
                >
                  Les sept questions posees a l accueil.
                </h2>
                <a href="tel:+33147206340" className={`o-mt-8 ${LIEN}`}>
                  <Icon icon={Phone} size={15} aria-hidden="true" />
                  01 47 20 63 40, de 7h30 a 20h
                </a>
              </div>
              <Faq items={QUESTIONS} single className="lg:o-col-span-2" />
            </div>
          </section>

          {/*
            ---------- Le rendez-vous : le mecanisme sert d appel ----------

            Il n y a pas de section « on commence ? » sur cette page : ce qu on
            vient y faire est ici, et ce qu il faut apporter le jour meme est
            range a cote, dans la marge.
          */}
          <section
            id="rendez-vous"
            aria-labelledby="rendez-vous-titre"
            className="o-scroll-mt-24 o-border-t o-border-slate-200 dark:o-border-slate-800 o-px-6 o-py-24 md:o-px-10 md:o-py-32 lg:o-px-14"
            style={PANNEAU}
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 lg:o-grid-cols-12">
              <div className="lg:o-col-span-4">
                <Indice rang="07" sombre={false}>
                  Rendez-vous
                </Indice>
                <h2
                  id="rendez-vous-titre"
                  className="o-m-0 o-mt-5 o-text-slate-900 dark:o-text-slate-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.2vw, 3rem)',
                  }}
                >
                  Quatre etapes, trois minutes.
                </h2>
                <p className="o-mt-5 o-max-w-md o-text-base o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                  Rien n est demande avant d avoir vu un creneau. Vous pouvez revenir en
                  arriere a chaque etape sans rien perdre.
                </p>

                {/* Ce qu il faut apporter : une note de marge, pas trois cartes. */}
                <div className="o-mt-14">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                    Le jour meme
                  </p>
                  {APPORTER.map((bloc) => (
                    <div
                      key={bloc.titre}
                      className="o-mt-6 o-border-t o-border-slate-300 dark:o-border-slate-700 o-pt-5"
                    >
                      <h3 className="o-m-0 o-text-sm o-font-semibold o-text-slate-900 dark:o-text-slate-100">
                        {bloc.titre}
                      </h3>
                      <ul className="o-m-0 o-mt-3 o-flex o-list-none o-flex-col o-gap-2 o-p-0 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                        {bloc.lignes.map((ligne) => (
                          <li key={ligne}>{ligne}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="o-min-w-0 lg:o-col-span-8">
                {confirme ? (
                  <div className="o-mt-10 o-rounded-xl o-border-w-1 o-border-slate-200 dark:o-border-slate-800 o-bg-white dark:o-bg-slate-950 o-p-6">
                    <p
                      className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-3 o-py-1 o-text-xs o-font-semibold o-text-slate-900 dark:o-text-slate-900"
                      style={PASTILLE}
                    >
                      <Icon icon={Check} size={14} />
                      Rendez-vous confirme
                    </p>
                    <h3 className="o-mt-5 o-text-lg o-font-semibold o-tracking-tight o-text-slate-900 dark:o-text-slate-50">
                      {creneau}, avec {praticien?.nom ?? 'votre praticien'}
                    </h3>
                    <p className="o-mt-3 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                      Dossier{' '}
                      <span
                        className="o-font-semibold o-tabular-nums"
                        style={ACCENT_ENCRE}
                      >
                        {dossier}
                      </span>{' '}
                      — une confirmation part a {patient.contact}, et un rappel la veille
                      a 18h. Vous pouvez annuler jusqu a quatre heures avant depuis ce
                      courriel.
                    </p>
                    <ul className="o-mt-5 o-flex o-list-none o-flex-col o-gap-2 o-p-0 o-text-sm o-text-slate-700 dark:o-text-slate-300">
                      <li>Motif : {motif?.nom ?? '—'}</li>
                      <li>Duree reservee : {motif?.duree ?? '—'}</li>
                      <li>
                        Tarif : {motif?.tarif ?? '—'}, {praticien?.secteur ?? '—'}
                      </li>
                      <li>A apporter : carte vitale, mutuelle, ordonnances en cours</li>
                    </ul>
                    <button
                      type="button"
                      className="o-mt-7 o-text-sm o-font-medium o-text-slate-600 dark:o-text-slate-400 o-underline o-underline-offset-4 hover:o-text-slate-900 dark:hover:o-text-slate-50 focus:o-ring"
                      onClick={() => {
                        setConfirme(false)
                        setEtape(0)
                        setMotifId('')
                        setPraticienId('')
                        setCreneau('')
                        setPatient({
                          nom: '',
                          naissance: '',
                          contact: '',
                          traitant: false,
                        })
                        setFautes({})
                      }}
                    >
                      Prendre un autre rendez-vous
                    </button>
                  </div>
                ) : (
                  <Stepper
                    className="o-mt-10"
                    label="Prendre rendez-vous"
                    steps={ETAPES}
                    value={etape}
                    onChange={setEtape}
                    reach="all"
                    orientation="vertical"
                    style={
                      {
                        '--o-step-accent': accent(200),
                        '--o-step-ink': 'var(--o-palette-zinc-950)',
                      } as CSSProperties
                    }
                  >
                    <div className="o-rounded-xl o-border-w-1 o-border-slate-200 dark:o-border-slate-800 o-bg-white dark:o-bg-slate-950 o-p-6">
                      {etape === 0 ? (
                        <div>
                          <h3 className="o-text-lg o-font-semibold o-tracking-tight o-text-slate-900 dark:o-text-slate-50">
                            Pourquoi venez-vous ?
                          </h3>
                          <p className="o-mt-2 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                            Le motif fixe la duree reservee et ouvre les praticiens qui le
                            traitent. Aucun document n est demande a cette etape.
                          </p>
                          <div
                            role="radiogroup"
                            aria-label="Motif de consultation"
                            className="o-mt-5 o-flex o-flex-col o-gap-2"
                          >
                            {MOTIFS.map((item) => (
                              <Choix
                                key={item.id}
                                actif={item.id === motifId}
                                titre={item.nom}
                                detail={`${item.duree} — ${item.tarif}`}
                                onClick={() => {
                                  setMotifId(item.id)
                                  setPraticienId('')
                                  setCreneau('')
                                }}
                              />
                            ))}
                          </div>
                          {motif === undefined ? null : (
                            <p
                              className="o-mt-5 o-rounded-lg o-p-4 o-text-sm o-leading-relaxed o-text-slate-700 dark:o-text-slate-300"
                              style={PASTILLE_DOUCE}
                            >
                              {motif.note}
                            </p>
                          )}
                        </div>
                      ) : null}

                      {etape === 1 ? (
                        <div>
                          <h3 className="o-text-lg o-font-semibold o-tracking-tight o-text-slate-900 dark:o-text-slate-50">
                            Qui vous recevra ?
                          </h3>
                          <p className="o-mt-2 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                            {motif === undefined
                              ? 'Choisissez d abord un motif : la liste des praticiens en depend.'
                              : `${String(ouverts.length)} praticiens traitent « ${motif.nom.toLowerCase()} ». Le secteur de conventionnement est indique.`}
                          </p>
                          <div
                            role="radiogroup"
                            aria-label="Praticien"
                            className="o-mt-5 o-flex o-flex-col o-gap-2"
                          >
                            {ouverts.map((item) => (
                              <Choix
                                key={item.id}
                                actif={item.id === praticienId}
                                titre={`${item.nom} — ${item.specialite}`}
                                detail={`${item.secteur} · ${item.tarif} · ${item.langues}`}
                                onClick={() => {
                                  setPraticienId(item.id)
                                  setCreneau('')
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {etape === 2 ? (
                        <div>
                          <h3 className="o-text-lg o-font-semibold o-tracking-tight o-text-slate-900 dark:o-text-slate-50">
                            Une heure exacte
                          </h3>
                          <p className="o-mt-2 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                            {praticien === undefined
                              ? 'Choisissez d abord un praticien : les creneaux sont les siens.'
                              : 'Les creneaux grises sont deja pris. Annulation libre jusqu a quatre heures avant.'}
                          </p>
                          {praticien === undefined ? null : (
                            <div className="o-mt-5 o-flex o-flex-col o-gap-5">
                              {praticien.creneaux.map((jour) => (
                                <div key={jour.jour}>
                                  <p className="o-text-xs o-font-semibold o-uppercase o-tracking-wider o-text-slate-500 dark:o-text-slate-400">
                                    {jour.jour}
                                  </p>
                                  <div
                                    role="radiogroup"
                                    aria-label={`Creneaux du ${jour.jour}`}
                                    className="o-mt-2 o-flex o-flex-wrap o-gap-2"
                                  >
                                    {jour.heures.map(([heure, libre]) => {
                                      const valeur = `${jour.jour}, ${heure}`
                                      const actif = valeur === creneau
                                      return (
                                        <button
                                          key={heure}
                                          type="button"
                                          role="radio"
                                          aria-checked={actif}
                                          disabled={!libre}
                                          onClick={() => {
                                            setCreneau(valeur)
                                          }}
                                          className={
                                            libre
                                              ? actif
                                                ? 'o-rounded-lg o-border-w-1 o-border-brand-500 o-px-3.5 o-py-2 o-text-sm o-font-medium o-tabular-nums o-text-slate-900 dark:o-text-slate-100 focus:o-ring'
                                                : 'o-rounded-lg o-border-w-1 o-border-slate-200 dark:o-border-slate-800 o-px-3.5 o-py-2 o-text-sm o-tabular-nums o-text-slate-800 dark:o-text-slate-200 hover:o-border-brand-400 o-transition-colors focus:o-ring'
                                              : 'o-cursor-not-allowed o-rounded-lg o-border-w-1 o-border-slate-100 dark:o-border-slate-900 o-px-3.5 o-py-2 o-text-sm o-tabular-nums o-text-slate-500 dark:o-text-slate-500 o-line-through'
                                          }
                                          style={actif ? PASTILLE_DOUCE : undefined}
                                        >
                                          {heure}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}

                      {etape === 3 ? (
                        <div>
                          <h3 className="o-text-lg o-font-semibold o-tracking-tight o-text-slate-900 dark:o-text-slate-50">
                            Vos coordonnees
                          </h3>
                          <p className="o-mt-2 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                            Aucun compte a creer. Ces informations servent a ouvrir votre
                            dossier et a vous prevenir, rien d autre.
                          </p>
                          <div className="o-mt-5 o-flex o-flex-col o-gap-4">
                            <div>
                              <label className={ETIQUETTE} htmlFor="rdv-nom">
                                Nom et prenom
                              </label>
                              <input
                                id="rdv-nom"
                                type="text"
                                autoComplete="name"
                                className={CHAMP}
                                value={patient.nom}
                                aria-invalid={
                                  fautes['nom'] === undefined ? undefined : true
                                }
                                aria-describedby={
                                  fautes['nom'] === undefined
                                    ? undefined
                                    : 'rdv-nom-faute'
                                }
                                onChange={(evenement) => {
                                  setPatient({ ...patient, nom: evenement.target.value })
                                }}
                              />
                              {fautes['nom'] === undefined ? null : (
                                <p
                                  id="rdv-nom-faute"
                                  className="o-mt-1.5 o-text-xs o-font-medium"
                                  style={ACCENT_ENCRE}
                                >
                                  {fautes['nom']}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className={ETIQUETTE} htmlFor="rdv-naissance">
                                Date de naissance — facultatif avant la venue
                              </label>
                              <input
                                id="rdv-naissance"
                                type="text"
                                inputMode="numeric"
                                placeholder="jj/mm/aaaa"
                                className={CHAMP}
                                value={patient.naissance}
                                onChange={(evenement) => {
                                  setPatient({
                                    ...patient,
                                    naissance: evenement.target.value,
                                  })
                                }}
                              />
                            </div>
                            <div>
                              <label className={ETIQUETTE} htmlFor="rdv-contact">
                                Courriel ou telephone
                              </label>
                              <input
                                id="rdv-contact"
                                type="text"
                                autoComplete="email"
                                className={CHAMP}
                                value={patient.contact}
                                aria-invalid={
                                  fautes['contact'] === undefined ? undefined : true
                                }
                                aria-describedby={
                                  fautes['contact'] === undefined
                                    ? undefined
                                    : 'rdv-contact-faute'
                                }
                                onChange={(evenement) => {
                                  setPatient({
                                    ...patient,
                                    contact: evenement.target.value,
                                  })
                                }}
                              />
                              {fautes['contact'] === undefined ? null : (
                                <p
                                  id="rdv-contact-faute"
                                  className="o-mt-1.5 o-text-xs o-font-medium"
                                  style={ACCENT_ENCRE}
                                >
                                  {fautes['contact']}
                                </p>
                              )}
                            </div>
                            <label className="o-flex o-items-start o-gap-3 o-text-sm o-text-slate-700 dark:o-text-slate-300">
                              <input
                                type="checkbox"
                                className="o-mt-0.5 o-size-4 focus:o-ring"
                                checked={patient.traitant}
                                onChange={(evenement) => {
                                  setPatient({
                                    ...patient,
                                    traitant: evenement.target.checked,
                                  })
                                }}
                              />
                              <span>
                                Mon medecin traitant declare exerce dans ce cabinet — le
                                compte-rendu lui sera transmis directement.
                              </span>
                            </label>
                          </div>
                        </div>
                      ) : null}

                      {/*
                      Le recapitulatif se remplit a mesure : c est lui qui evite de
                      remonter dans les etapes pour verifier ce qu on a choisi.
                    */}
                      <dl
                        className="o-mt-6 o-flex o-flex-col o-gap-2.5 o-rounded-lg o-p-4 o-text-sm"
                        style={PASTILLE_DOUCE}
                      >
                        {/* Sur un aplat teinte, une ardoise fixe ne tient pas : un
                          accent tres sombre fonce le panneau jusqu a l avaler.
                          L encre suit donc celle du theme, adoucie. */}
                        <p
                          className="o-text-xs o-font-semibold o-uppercase o-tracking-wider"
                          style={{
                            color:
                              'color-mix(in oklab, var(--o-theme-fg) 75%, transparent)',
                          }}
                        >
                          Recapitulatif
                        </p>
                        {[
                          ['Motif', motif === undefined ? 'A choisir' : motif.nom],
                          [
                            'Praticien',
                            praticien === undefined ? 'A choisir' : praticien.nom,
                          ],
                          ['Creneau', creneau === '' ? 'A choisir' : creneau],
                          [
                            'Duree et tarif',
                            motif === undefined
                              ? 'Selon le motif'
                              : `${motif.duree} — ${motif.tarif}`,
                          ],
                        ].map(([cle, valeur]) => (
                          <div
                            key={cle}
                            className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-4"
                          >
                            <dt className="o-text-slate-600 dark:o-text-slate-400">
                              {cle}
                            </dt>
                            <dd className="o-m-0 o-text-right o-font-medium o-text-slate-900 dark:o-text-slate-100">
                              {valeur}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      <div className="o-mt-6 o-flex o-flex-wrap o-items-center o-gap-3">
                        {etape > 0 ? (
                          <button
                            type="button"
                            className="o-text-sm o-font-medium o-text-slate-600 dark:o-text-slate-400 o-underline o-underline-offset-4 hover:o-text-slate-900 dark:hover:o-text-slate-50 focus:o-ring"
                            onClick={() => {
                              setEtape(etape - 1)
                            }}
                          >
                            Retour
                          </button>
                        ) : null}
                        <button
                          type="button"
                          // Les trois premieres etapes se ferment tant qu on n a rien
                          // choisi ; la derniere reste ouverte, sans quoi le controle
                          // des champs ne serait jamais atteint et ses messages
                          // n existeraient pour personne.
                          disabled={etape < 3 && complet[etape] !== true}
                          className={
                            etape === 3 || complet[etape] === true
                              ? 'o-inline-flex o-items-center o-gap-2 o-rounded-lg o-bg-brand-200 hover:o-bg-brand-300 o-px-5 o-py-2.5 o-text-sm o-font-semibold o-text-slate-900 dark:o-text-slate-900 o-transition-colors focus:o-ring'
                              : 'o-inline-flex o-cursor-not-allowed o-items-center o-gap-2 o-rounded-lg o-bg-slate-200 dark:o-bg-slate-800 o-px-5 o-py-2.5 o-text-sm o-font-semibold o-text-slate-500 dark:o-text-slate-400'
                          }
                          onClick={() => {
                            if (etape < 3) {
                              setEtape(etape + 1)
                              return
                            }
                            const releves: Record<string, string> = {}
                            if (patient.nom.trim() === '') {
                              releves['nom'] = 'Le dossier a besoin d un nom.'
                            }
                            if (patient.contact.trim() === '') {
                              releves['contact'] =
                                'Un courriel ou un telephone, pour la confirmation.'
                            }
                            setFautes(releves)
                            if (Object.keys(releves).length === 0) setConfirme(true)
                          }}
                        >
                          {etape < 3 ? 'Etape suivante' : 'Confirmer le rendez-vous'}
                          <Icon icon={ArrowRight} size={15} />
                        </button>
                        <p className="o-text-xs o-text-slate-500 dark:o-text-slate-400">
                          Etape {etape + 1} sur {ETAPES.length}
                        </p>
                      </div>
                    </div>
                  </Stepper>
                )}
              </div>
            </div>
          </section>
        </main>

        {/*
          ---------- Le pied : la carte de visite ----------

          Adresse, heures et acces en grand, parce que c est ce qu on cherche
          quand on ferme la page. Dessous, ce qui ne se dit qu ici : le
          plain-pied, la boucle magnetique, et les numeros de la nuit.
        */}
        <footer className="o-border-t o-border-slate-900 dark:o-border-slate-100 o-px-6 o-pb-10 o-pt-16 md:o-px-10 md:o-pt-24 lg:o-px-14">
          <div className="o-mx-auto o-max-w-7xl">
            <div className="o-grid o-gap-x-12 o-gap-y-12 md:o-grid-cols-3">
              <div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                  L adresse
                </p>
                <p
                  className="o-m-0 o-mt-5 o-text-slate-900 dark:o-text-slate-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.5rem, 2.6vw, 2.5rem)',
                  }}
                >
                  18 rue Vernet
                  <br />
                  75008 Paris
                </p>
                <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                  Rez-de-chaussee et deux etages. Interphone : Clinique Vernet.
                </p>
              </div>

              <div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                  Les heures
                </p>
                <p
                  className="o-m-0 o-mt-5 o-text-slate-900 dark:o-text-slate-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.5rem, 2.6vw, 2.5rem)',
                  }}
                >
                  Lundi — vendredi
                  <br />
                  7h30 — 20h
                </p>
                <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                  Samedi 8h30 — 13h. Prelevements sans rendez-vous des 7h. Ferme les jours
                  feries, hors garde.
                </p>
              </div>

              <div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                  Appeler
                </p>
                <p
                  className="o-m-0 o-mt-5"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.5rem, 2.6vw, 2.5rem)',
                  }}
                >
                  <a
                    href="tel:+33147206340"
                    className="o-tabular-nums o-text-slate-900 dark:o-text-slate-50 o-no-underline hover:o-underline focus:o-ring"
                  >
                    01 47 20 63 40
                  </a>
                </p>
                <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                  Metro George V (1), sortie 3, quatre minutes. Bus 73 et 92, arret
                  Marceau. Velib station 8032. Parking Vinci George V.
                </p>
              </div>
            </div>

            {/* Ce qui ne se dit nulle part ailleurs : l acces et la nuit. */}
            <dl className="o-m-0 o-mt-16 o-grid o-gap-x-12 o-border-t o-border-slate-200 dark:o-border-slate-800 o-pt-8 o-p-0 md:o-grid-cols-2">
              <div className="o-grid o-gap-x-8 o-gap-y-1 o-py-3 sm:o-grid-cols-12">
                <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400 sm:o-col-span-4">
                  Accessibilite
                </dt>
                <dd className="o-m-0 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400 sm:o-col-span-8">
                  Plain-pied, seuil de deux centimetres. Ascenseur aux normes, boucle
                  magnetique a l accueil, table d examen a hauteur variable au cabinet 2.
                </dd>
              </div>
              <div className="o-grid o-gap-x-8 o-gap-y-1 o-py-3 sm:o-grid-cols-12">
                <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400 sm:o-col-span-4">
                  Quand c est ferme
                </dt>
                <dd className="o-m-0 o-text-sm o-leading-relaxed o-text-slate-600 dark:o-text-slate-400 sm:o-col-span-8">
                  Urgence vitale : le 15, jour et nuit. Garde de ville : 116 117 des 20h
                  et le dimanche. Maison medicale de garde, 12 rue de Ponthieu.
                </dd>
              </div>
            </dl>

            <p className="o-m-0 o-mt-12 o-border-t o-border-slate-200 dark:o-border-slate-800 o-pt-6 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
              © 2026 Societe civile de moyens Clinique Vernet — Conseil departemental de l
              Ordre des medecins de Paris — directrice de la publication : Dr Helene
              Vernet — donnees de sante chez un hebergeur agree
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
