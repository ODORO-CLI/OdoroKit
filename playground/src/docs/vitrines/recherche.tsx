/**
 * Index — le moteur de recherche interne.
 *
 * ## Le parti pris : montrer le calcul, pas la promesse
 *
 * Toutes les pages de moteur de recherche disent la meme chose — « trouvez
 * tout, instantanement » — et n en montrent rien. Celle-ci fait l inverse :
 * elle ouvre sur une grille brutaliste, un mot-marque qui remplit la largeur,
 * et elle donne tout de suite **le moteur**, avec son score decompose ligne a
 * ligne. Ce qu on vend ici est une methode, et une methode se lit.
 *
 * ## Le mecanisme : la frappe
 *
 * Le champ de recherche marche pour de vrai. Quatorze documents ecrits a la
 * main — un wiki, un lecteur de fichiers, une messagerie, des tickets, du
 * code — sont indexes au chargement : les mots sont normalises, coupes,
 * debarrasses des mots vides, racinises, puis etendus par une table de
 * synonymes. La requete subit exactement le meme traitement, et c est la
 * condition pour que « conges » trouve « conge » et « RTT ».
 *
 * Le score n est pas un nombre sorti d une boite : il est la somme de quatre
 * termes montres separement — la correspondance du titre, celle du corps avec
 * saturation, la fraicheur, la popularite — moins une penalite pour les pages
 * perimees. Chaque resultat porte sa barre empilee et son addition en clair.
 *
 * ## Le rythme
 *
 * La page est sombre dans les deux themes. Entre le moteur et les sources,
 * deux ecarts : une **figure dessinee** de l index inverse, avec sa legende
 * dans la marge, et une **bande claire** qui coupe la page sombre — l inverse
 * de la coupe habituelle — ou dix barres au trait disent ce que les gens
 * cherchent vraiment.
 *
 * ## Le mouvement
 *
 * Sa signature est **M-allume** : le seul long paragraphe de la page s allume
 * mot a mot au defilement (`ScrollReveal`). Les barres de la bande claire, elles,
 * poussent **a l entree dans le champ** et non au montage.
 *
 * @module
 */

import { Icon, type IconData } from '@odoro-cli/icons'
import { Code, FileText, Folder, Mail, Search, Ticket } from '@odoro-cli/icons/filaire'
import { useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { Crosshair } from '@/odoro/effect/Crosshair.jsx'
import { DecodeText } from '@/odoro/text/DecodeText.jsx'
import { ScrollReveal } from '@/odoro/text/ScrollReveal.jsx'
import { TreeView, type TreeNode } from '@/odoro/ui/TreeView.jsx'
import { useInView } from '@/odoro/hooks/useInView'

import { Filigrane, nuit } from './communs.jsx'
import { accent, accentDoux, encreSurSombre } from './palettes.js'
import { affiche, BarreCoins, Coin, Etiquette, Grain, Porte, Surgit, TitreVague, usePolices } from './marche.jsx'

/* ------------------------------------------------------------------------ */
/*                               Les encres                                 */
/* ------------------------------------------------------------------------ */

/** Le filet de la page sombre. */
const FILET = 'color-mix(in oklab, #ffffff 14%, transparent)'

/** Le filet de la bande claire. */
const FILET_JOUR = 'color-mix(in oklab, #000000 14%, transparent)'

/** L encre d accent, sur une page sombre dans les deux themes. */
const ENCRE = encreSurSombre()

/**
 * Le jour d une bande.
 *
 * Le pendant de `nuit()` : une bande claire au milieu d une page qui est
 * sombre dans les deux themes. Les variables du theme sont redeclarees plutot
 * que des classes posees en dur, pour que les pieces du registre qui tombent
 * la-dedans se peignent en clair sans qu on le leur dise.
 */
const JOUR = {
  colorScheme: 'light',
  backgroundColor: 'var(--o-theme-bg)',
  color: 'var(--o-theme-fg)',
  '--o-theme-bg': 'var(--o-palette-zinc-50)',
  '--o-theme-surface': 'var(--o-palette-zinc-100)',
  '--o-theme-fg': 'var(--o-palette-zinc-950)',
  '--o-theme-muted': 'var(--o-palette-zinc-600)',
  '--o-theme-line': 'var(--o-palette-zinc-300)',
} as CSSProperties

/** Les rubriques de la barre en coins. */
const LIENS = [
  ['#frappe', 'La frappe'],
  ['#index', 'L index'],
  ['#requetes', 'Les requetes'],
  ['#sources', 'Les sources'],
] as const

/* ------------------------------------------------------------------------ */
/*                      Le corpus, et son indexation                        */
/* ------------------------------------------------------------------------ */

/** D ou vient un document. */
type Source = 'wiki' | 'lecteur' | 'messagerie' | 'tickets' | 'code'

/** Le pictogramme et le mot d une source. */
const SOURCES: Readonly<Record<Source, { readonly mot: string; readonly icone: IconData }>> = {
  wiki: { mot: 'Wiki', icone: FileText },
  lecteur: { mot: 'Lecteur', icone: Folder },
  messagerie: { mot: 'Messagerie', icone: Mail },
  tickets: { mot: 'Tickets', icone: Ticket },
  code: { mot: 'Code', icone: Code },
}

/** Un document du corpus. */
interface Document {
  readonly id: string
  readonly source: Source
  readonly chemin: string
  readonly titre: string
  readonly corps: string
  /** Age du document, en jours. */
  readonly age: number
  /** Ouvertures sur les douze derniers mois. */
  readonly clics: number
  /** Vrai pour une page remplacee : elle reste trouvable, mais penalisee. */
  readonly perime?: boolean
}

/**
 * Quatorze documents ecrits a la main.
 *
 * Ils ne sont pas decoratifs : ce sont eux qui font marcher la recherche, et
 * ils couvrent a dessein les cas ou un moteur naif echoue — un ancien document
 * populaire qui doit perdre, une reponse enfouie dans un fil de messagerie,
 * deux tickets qui parlent du meme outil a deux ans d ecart.
 */
const CORPUS: readonly Document[] = [
  {
    id: 'd1',
    source: 'wiki',
    chemin: 'wiki / personnel / depenses',
    titre: 'Note de frais : bareme, plafonds et delais de remboursement',
    corps:
      'Une note de frais se depose avant le cinq du mois suivant. Le remboursement part le vingt. Le bareme kilometrique suit celui de l administration fiscale. Les repas sont plafonnes a dix-neuf euros, et chaque depense demande un justificatif lisible.',
    age: 30,
    clics: 412,
  },
  {
    id: 'd2',
    source: 'wiki',
    chemin: 'wiki / personnel / absences',
    titre: 'Conges payes, RTT et jours d anciennete',
    corps:
      'Vingt-cinq jours de conges payes, onze RTT, un jour de plus tous les cinq ans. La demande passe par le carnet des absences, avec un preavis de quinze jours. Les vacances scolaires ne donnent aucune priorite.',
    age: 12,
    clics: 890,
  },
  {
    id: 'd3',
    source: 'lecteur',
    chemin: 'lecteur / comptabilite / 2026',
    titre: 'Bareme kilometrique 2026 (tableur)',
    corps:
      'Puissance fiscale, distance annuelle, coefficient. Tableau repris de l arrete du trois avril. Sert au calcul de chaque note de frais deposee apres cette date.',
    age: 8,
    clics: 121,
  },
  {
    id: 'd4',
    source: 'messagerie',
    chemin: 'messagerie / comptabilite',
    titre: 'Re: remboursement de la note de janvier',
    corps:
      'Bonjour, la note a bien ete recue mais il manque le justificatif du peage. Le remboursement partira sur la paie de mars, avec les depenses du mois en cours.',
    age: 55,
    clics: 34,
  },
  {
    id: 'd5',
    source: 'tickets',
    chemin: 'tickets / systeme / SI-2244',
    titre: 'SI-2244 — le VPN refuse la connexion depuis l etranger',
    corps:
      'Le client refuse la connexion depuis une adresse hors Union europeenne. Contourner par le portail web, ou demander une derogation d acces distant au service systeme.',
    age: 19,
    clics: 208,
  },
  {
    id: 'd6',
    source: 'wiki',
    chemin: 'wiki / personnel / organisation',
    titre: 'Teletravail : deux jours par semaine, et comment les poser',
    corps:
      'Le teletravail se pose dans le carnet des absences, la veille au plus tard. Deux jours par semaine depuis le domicile, jamais le lundi, qui reste la journee de reunion d equipe.',
    age: 40,
    clics: 655,
  },
  {
    id: 'd7',
    source: 'wiki',
    chemin: 'wiki / systeme / comptes',
    titre: 'Mot de passe oublie : la procedure de reinitialisation',
    corps:
      'La reinitialisation se fait depuis le portail. Un code arrive par message court sur le telephone declare. Sans telephone d entreprise, passer par le support, qui verifie l identite avant d ouvrir un jeton.',
    age: 120,
    clics: 1490,
  },
  {
    id: 'd8',
    source: 'code',
    chemin: 'code / portail / auth',
    titre: 'portail/auth/reinitialisation.ts',
    corps:
      'Genere un jeton a usage unique, valable quinze minutes, et l envoie par message court. Refuse toute reinitialisation demandee depuis une adresse distante inconnue.',
    age: 4,
    clics: 76,
  },
  {
    id: 'd9',
    source: 'wiki',
    chemin: 'wiki / personnel / sante',
    titre: 'Arret maladie : ce qu il faut envoyer, et a qui',
    corps:
      'Le volet trois part au service du personnel dans les quarante-huit heures. Le maintien de salaire commence au quatrieme jour d arret, et le solde de conges n est pas entame.',
    age: 90,
    clics: 302,
  },
  {
    id: 'd10',
    source: 'lecteur',
    chemin: 'lecteur / juridique / accords',
    titre: 'Accord d entreprise 2024 — temps de travail (document)',
    corps:
      'Trente-cinq heures hebdomadaires, forfait en jours pour les cadres, compte epargne temps. Fixe le cadre des RTT et du teletravail avant l avenant de 2026.',
    age: 420,
    clics: 58,
  },
  {
    id: 'd11',
    source: 'wiki',
    chemin: 'wiki / archives / 2023',
    titre: 'Procedure de remboursement des depenses (version 2023)',
    corps:
      'Cette page est remplacee par la note de frais de 2026. Le bareme et les plafonds qui y figurent ne sont plus appliques depuis le premier janvier.',
    age: 700,
    clics: 240,
    perime: true,
  },
  {
    id: 'd12',
    source: 'tickets',
    chemin: 'tickets / systeme / SI-1902',
    titre: 'SI-1902 — le VPN coupe toutes les deux heures',
    corps:
      'Le renouvellement du jeton echoue sur les postes non mis a jour. La connexion tombe puis revient. Corrige en version quatre point deux du client d acces distant.',
    age: 210,
    clics: 95,
  },
  {
    id: 'd13',
    source: 'messagerie',
    chemin: 'messagerie / equipe',
    titre: 'Conges d ete : depot avant le quinze avril',
    corps:
      'Rappel : les demandes de vacances pour juillet et aout se deposent avant le quinze avril dans le carnet des absences. Passe cette date, l ordre d arrivee ne joue plus.',
    age: 25,
    clics: 510,
  },
  {
    id: 'd14',
    source: 'wiki',
    chemin: 'wiki / moyens generaux',
    titre: 'Materiel : commander un ecran, un clavier, un siege',
    corps:
      'La demande passe par le carnet du materiel. Delai de dix jours ouvres pour un ecran ou un clavier, six semaines pour un siege. Le remplacement d un poste se demande au service systeme.',
    age: 65,
    clics: 143,
  },
]

/**
 * Les mots vides.
 *
 * Ils ne sont pas retires par purisme : indexes, ils apparaitraient dans
 * presque tous les documents, leur poids tomberait a zero, et ils couteraient
 * quand meme une liste d ancrage par mot. Les retirer est un gain de place
 * autant qu un gain de justesse.
 */
const VIDES: ReadonlySet<string> = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'a', 'au', 'aux', 'en', 'dans',
  'sur', 'pour', 'par', 'avec', 'sans', 'est', 'sont', 'que', 'qui', 'quoi', 'comment', 'ce',
  'cette', 'ces', 'se', 'ne', 'pas', 'plus', 'mon', 'ma', 'mes', 'je', 'il', 'elle', 'on', 'y',
])

/** Un mot ramene a sa racine, par une regle et une seule. */
function raciniser(mot: string): string {
  if (mot.length > 4 && (mot.endsWith('s') || mot.endsWith('x'))) return mot.slice(0, -1)
  return mot
}

/** Le decoupage d un texte en mots nus, sans ponctuation ni accent. */
function jetons(texte: string): readonly string[] {
  return (
    texte
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .match(/[a-z0-9]+/g) ?? []
  )
}

/**
 * La table des synonymes, ecrite a la main, en racines.
 *
 * Aucun modele de langue ici : dans un moteur interne, quinze couples ecrits
 * par quelqu un qui connait la maison valent mieux qu un vecteur appris
 * ailleurs. Les valeurs sont deja racinisees, comme le corpus.
 */
const SYNONYMES: Readonly<Record<string, readonly string[]>> = {
  frai: ['remboursement', 'depense', 'justificatif'],
  note: ['remboursement', 'depense'],
  depense: ['frai', 'remboursement'],
  conge: ['rtt', 'absence', 'vacance'],
  vacance: ['conge', 'absence'],
  rtt: ['conge', 'absence'],
  vpn: ['connexion', 'distant', 'portail'],
  passe: ['reinitialisation', 'jeton', 'code'],
  teletravail: ['domicile', 'absence'],
  maladie: ['arret', 'salaire'],
  materiel: ['ecran', 'clavier', 'siege'],
  bareme: ['kilometrique', 'plafond'],
}

/** Un document prepare pour la recherche. */
interface Indexe {
  readonly doc: Document
  readonly titre: readonly string[]
  readonly corps: readonly string[]
  /** Nombre d apparitions par racine, dans le corps. */
  readonly frequences: Readonly<Record<string, number>>
}

/** Le corpus, racinise une fois pour toutes. */
const INDEX: readonly Indexe[] = CORPUS.map((doc) => {
  const titre = jetons(doc.titre).filter((m) => !VIDES.has(m)).map(raciniser)
  const corps = jetons(doc.corps).filter((m) => !VIDES.has(m)).map(raciniser)
  const frequences: Record<string, number> = {}
  for (const mot of corps) frequences[mot] = (frequences[mot] ?? 0) + 1
  for (const mot of titre) frequences[mot] = (frequences[mot] ?? 0) + 1
  return { doc, titre, corps, frequences }
})

/** Le nombre de documents ou chaque racine apparait. */
const DOCUMENTS_PAR_RACINE: Readonly<Record<string, number>> = (() => {
  const compte: Record<string, number> = {}
  for (const entree of INDEX) {
    for (const mot of new Set([...entree.titre, ...entree.corps])) {
      compte[mot] = (compte[mot] ?? 0) + 1
    }
  }
  return compte
})()

/**
 * Le poids d une racine : plus elle est rare, plus elle pese.
 *
 * C est la seule ligne de la page qui merite un nom savant — la frequence
 * inverse de document. Sans elle, « jours », present dans neuf documents sur
 * quatorze, vaudrait autant que « kilometrique », present dans un seul.
 */
function poids(racine: string): number {
  const total = INDEX.length
  const df = DOCUMENTS_PAR_RACINE[racine] ?? 0
  return Math.log(1 + (total - df + 0.5) / (df + 0.5))
}

/** L analyse d une requete, etape par etape. */
interface Analyse {
  readonly bruts: readonly string[]
  readonly retires: readonly string[]
  readonly racines: readonly string[]
  readonly ajoutes: readonly string[]
}

/** Ce que la requete devient avant d atteindre l index. */
function analyser(requete: string): Analyse {
  const bruts = jetons(requete)
  const retires = bruts.filter((m) => VIDES.has(m))
  const racines = [...new Set(bruts.filter((m) => !VIDES.has(m)).map(raciniser))]
  const ajoutes: string[] = []
  for (const racine of racines) {
    for (const synonyme of SYNONYMES[racine] ?? []) {
      if (!racines.includes(synonyme) && !ajoutes.includes(synonyme)) ajoutes.push(synonyme)
    }
  }
  return { bruts, retires, racines, ajoutes }
}

/** Les quatre termes du score d un document, et leur somme. */
interface Score {
  readonly doc: Document
  readonly titre: number
  readonly corps: number
  readonly fraicheur: number
  readonly clics: number
  readonly penalite: number
  readonly total: number
  /** Les racines effectivement trouvees, pour le surlignage. */
  readonly touches: readonly string[]
}

/** Le plus grand nombre de clics du corpus, qui borne la popularite. */
const CLICS_MAX = Math.max(...CORPUS.map((d) => d.clics))

/**
 * Le score d un document pour une analyse donnee.
 *
 * Quatre termes, tous montres a l ecran : le titre pese plus que le corps, le
 * corps sature pour qu un mot repete dix fois ne vaille pas dix fois un mot
 * dit une fois, la fraicheur decroit doucement, et la popularite est prise en
 * logarithme — mille cinq cents ouvertures ne valent pas quinze fois cent.
 */
function noter(entree: Indexe, analyse: Analyse): Score {
  let titre = 0
  let corps = 0
  const touches: string[] = []

  const peser = (racine: string, part: number): void => {
    const p = poids(racine)
    const dansTitre = entree.titre.filter((m) => m === racine).length
    const frequence = entree.frequences[racine] ?? 0
    if (dansTitre > 0) titre += p * 2.6 * part
    if (frequence > 0) {
      corps += p * (frequence / (frequence + 1.4)) * part
      if (!touches.includes(racine)) touches.push(racine)
    }
  }

  for (const racine of analyse.racines) peser(racine, 1)
  for (const racine of analyse.ajoutes) peser(racine, 0.55)

  const fraicheur = 1.3 * Math.exp(-entree.doc.age / 300)
  const clics = 1.1 * (Math.log(1 + entree.doc.clics) / Math.log(1 + CLICS_MAX))
  const penalite = entree.doc.perime === true ? 1.1 : 0

  return {
    doc: entree.doc,
    titre,
    corps,
    fraicheur,
    clics,
    penalite,
    total: titre + corps + fraicheur + clics - penalite,
    touches,
  }
}

/** Les resultats, ordonnes. Une requete vide rend le corpus par popularite. */
function chercher(requete: string): readonly Score[] {
  const analyse = analyser(requete)
  const notes = INDEX.map((entree) => noter(entree, analyse))
  if (analyse.racines.length === 0) {
    return [...notes].sort((a, b) => b.clics + b.fraicheur - (a.clics + a.fraicheur)).slice(0, 6)
  }
  return notes
    .filter((n) => n.titre + n.corps > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
}

/** Un nombre du score, a deux decimales, a la francaise. */
function deux(valeur: number): string {
  return valeur.toFixed(2).replace('.', ',')
}

/* ------------------------------------------------------------------------ */
/*                         Les pieces du moteur                             */
/* ------------------------------------------------------------------------ */

/** Un extrait ou les mots trouves sont marques. */
function Extrait({ texte, touches }: { readonly texte: string; readonly touches: readonly string[] }): ReactElement {
  const morceaux = texte.split(/([A-Za-z0-9]+)/)
  return (
    <p className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-400">
      {morceaux.map((morceau, rang) => {
        const nu = raciniser(
          morceau
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, ''),
        )
        if (!touches.includes(nu)) return <span key={rang}>{morceau}</span>
        return (
          <span key={rang} style={{ color: ENCRE, backgroundColor: accentDoux(500, 18) }}>
            {morceau}
          </span>
        )
      })}
    </p>
  )
}

/** La barre empilee d un score : quatre parts, dans l ordre de l addition. */
function BarreScore({ score }: { readonly score: Score }): ReactElement {
  const parts = [
    { quoi: 'titre', valeur: score.titre, couleur: accent(300) },
    { quoi: 'corps', valeur: score.corps, couleur: accent(500) },
    { quoi: 'fraicheur', valeur: score.fraicheur, couleur: 'var(--o-palette-zinc-500)' },
    { quoi: 'clics', valeur: score.clics, couleur: 'var(--o-palette-zinc-700)' },
  ]
  const somme = parts.reduce((t, p) => t + p.valeur, 0) || 1
  return (
    <div aria-hidden="true" className="o-flex o-h-2 o-w-full o-overflow-hidden" style={{ backgroundColor: 'var(--o-palette-zinc-900)' }}>
      {parts.map((part) => (
        <span
          key={part.quoi}
          className="o-block o-h-full"
          style={{ width: `${String((part.valeur / somme) * 100)}%`, backgroundColor: part.couleur }}
        />
      ))}
    </div>
  )
}

/** Les trois requetes proposees, pour voir le moteur travailler sans taper. */
const EXEMPLES = ['note de frais', 'conges d ete', 'vpn depuis l etranger', 'mot de passe'] as const

/** Le moteur : le champ, l analyse de la requete, et les resultats notes. */
function Moteur(): ReactElement {
  const [requete, setRequete] = useState('note de frais')
  const analyse = useMemo(() => analyser(requete), [requete])
  const resultats = useMemo(() => chercher(requete), [requete])

  return (
    <div>
      {/* Le champ : un seul filet, rien de rond. */}
      <div className="o-flex o-items-center o-gap-3 o-px-4 o-py-3" style={{ border: `1px solid ${FILET}` }}>
        <Icon icon={Search} size={18} style={{ color: ENCRE }} aria-hidden="true" />
        <label htmlFor="moteur-requete" className="o-sr-only">
          Chercher dans les documents de la maison
        </label>
        <input
          id="moteur-requete"
          name="moteur-requete"
          type="search"
          value={requete}
          autoComplete="off"
          placeholder="Tapez une question"
          onChange={(evenement) => {
            setRequete(evenement.target.value)
          }}
          className="o-min-w-0 o-grow o-bg-transparent o-font-mono o-text-base o-text-zinc-50 focus:o-ring"
          style={{ border: 'none', borderRadius: 0 }}
        />
        <span className="o-shrink-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
          {resultats.length} / {CORPUS.length}
        </span>
      </div>

      <div className="o-mt-3 o-flex o-flex-wrap o-items-center o-gap-2">
        <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">Essayez</span>
        {EXEMPLES.map((exemple) => (
          <button
            key={exemple}
            type="button"
            onClick={() => {
              setRequete(exemple)
            }}
            className="o-cursor-pointer o-px-3 o-py-1 o-font-mono o-text-xs o-text-zinc-300 o-transition-colors hover:o-text-zinc-50 focus:o-ring"
            style={{ border: `1px solid ${FILET}`, borderRadius: 0, backgroundColor: 'transparent' }}
          >
            {exemple}
          </button>
        ))}
      </div>

      <div className="o-mt-10 o-grid o-gap-10 lg:o-grid-cols-12">
        {/* ----- Ce que la requete devient --------------------------------- */}
        <div className="o-min-w-0 lg:o-col-span-4">
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
            Ce que votre phrase devient
          </p>
          <dl className="o-m-0 o-mt-5">
            {([
              ['Jetons', analyse.bruts, 'o-text-zinc-300'],
              ['Mots vides retires', analyse.retires, 'o-text-zinc-400'],
              ['Racines', analyse.racines, 'o-text-zinc-50'],
              ['Synonymes ajoutes', analyse.ajoutes, 'o-text-zinc-400'],
            ] as const).map(([quoi, mots, teinte]) => (
              <div key={quoi} className="o-border-t o-py-3" style={{ borderColor: FILET }}>
                <dt className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">{quoi}</dt>
                <dd className={`o-m-0 o-mt-2 o-flex o-flex-wrap o-gap-1.5 o-font-mono o-text-xs ${teinte}`}>
                  {mots.length === 0 ? (
                    <span className="o-text-zinc-400">aucun</span>
                  ) : (
                    mots.map((mot, rang) => (
                      <span key={`${mot}-${String(rang)}`} className="o-px-2 o-py-0.5" style={{ border: `1px solid ${FILET}` }}>
                        {mot}
                      </span>
                    ))
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <p className="o-m-0 o-border-t o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-500" style={{ borderColor: FILET }}>
            Le corpus a subi exactement le meme traitement au chargement. C est la seule raison pour laquelle « conges » trouve « conge » et « RTT ».
          </p>

          {/* La formule, en clair : quatre lignes valent mieux qu un nom savant. */}
          <p className="o-m-0 o-mt-10 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">La formule</p>
          <ul className="o-m-0 o-mt-4 o-list-none o-p-0">
            {([
              ['titre', 'poids de la racine, multiplie par 2,6'],
              ['corps', 'poids, sature : un mot dit dix fois ne vaut pas dix fois un mot dit une fois'],
              ['fraicheur', 'decroissance douce sur trois cents jours'],
              ['clics', 'logarithme des ouvertures, borne par la page la plus lue'],
              ['perime', 'penalite fixe de 1,10 sur une page remplacee'],
              ['synonyme', 'un terme ajoute par la table ne compte que pour 0,55'],
            ] as const).map(([terme, regle]) => (
              <li key={terme} className="o-grid o-grid-cols-12 o-items-baseline o-gap-3 o-border-t o-py-2.5" style={{ borderColor: FILET }}>
                <span className="o-col-span-4 o-font-mono o-text-xs" style={{ color: ENCRE }}>
                  {terme}
                </span>
                <span className="o-col-span-8 o-text-xs o-leading-relaxed o-text-zinc-500">{regle}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ----- Les resultats, avec leur addition -------------------------- */}
        <div className="o-min-w-0 lg:o-col-span-8">
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
            Les resultats, et pourquoi dans cet ordre
          </p>
          <ol aria-live="polite" className="o-m-0 o-mt-5 o-list-none o-p-0">
            {resultats.length === 0 && (
              <li className="o-border-t o-py-8 o-font-mono o-text-sm o-text-zinc-500" style={{ borderColor: FILET }}>
                Aucun document ne porte ces mots. Un moteur honnete le dit, au lieu de proposer autre chose.
              </li>
            )}
            {resultats.map((score, rang) => {
              const source = SOURCES[score.doc.source]
              return (
                <li key={score.doc.id} className="o-border-t o-py-5" style={{ borderColor: FILET }}>
                  <div className="o-grid o-gap-4 md:o-grid-cols-12">
                    <div className="o-min-w-0 md:o-col-span-9">
                      <p className="o-m-0 o-flex o-flex-wrap o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                        <span className="o-tabular-nums" style={{ color: ENCRE }}>
                          {String(rang + 1).padStart(2, '0')}
                        </span>
                        <span className="o-inline-flex o-items-center o-gap-1.5">
                          <Icon icon={source.icone} size={12} aria-hidden="true" />
                          {source.mot}
                        </span>
                        <span className="o-normal-case o-tracking-normal">{score.doc.chemin}</span>
                        {score.doc.perime === true && (
                          <span style={{ color: 'var(--o-palette-amber-300)' }}>remplacee</span>
                        )}
                      </p>
                      <h3 className="o-m-0 o-mt-2 o-text-lg o-font-semibold o-tracking-tight o-text-zinc-50">{score.doc.titre}</h3>
                      <Extrait texte={score.doc.corps} touches={score.touches} />
                    </div>

                    <div className="o-min-w-0 md:o-col-span-3">
                      <p className="o-m-0 o-font-mono o-tabular-nums o-text-2xl o-tracking-tight" style={{ color: ENCRE }}>
                        {deux(score.total)}
                      </p>
                      <div className="o-mt-2">
                        <BarreScore score={score} />
                      </div>
                      <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-leading-relaxed o-tabular-nums o-text-zinc-500">
                        titre {deux(score.titre)}
                        <br />+ corps {deux(score.corps)}
                        <br />+ fraicheur {deux(score.fraicheur)}
                        <br />+ clics {deux(score.clics)}
                        {score.penalite > 0 && (
                          <>
                            <br />
                            <span style={{ color: 'var(--o-palette-amber-300)' }}>− perime {deux(score.penalite)}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                     Figure 01 — l index inverse                          */
/* ------------------------------------------------------------------------ */

/** Les trois racines montrees par la figure, et les documents qui les portent. */
const ANCRAGES: readonly { readonly racine: string; readonly documents: readonly number[] }[] = [
  { racine: 'note', documents: [1, 3, 4, 11] },
  { racine: 'frai', documents: [1, 3, 11] },
  { racine: 'remboursement', documents: [1, 4, 11] },
]

/** Les quatre documents dessines a droite de la figure. */
const COLONNE: readonly { readonly numero: number; readonly titre: string }[] = [
  { numero: 1, titre: 'Note de frais 2026' },
  { numero: 3, titre: 'Bareme kilometrique' },
  { numero: 4, titre: 'Re: remboursement' },
  { numero: 11, titre: 'Procedure 2023' },
]

/** L ordonnee d un document de la colonne de droite. */
function ordonneeDocument(numero: number): number {
  return 84 + COLONNE.findIndex((d) => d.numero === numero) * 58
}

/**
 * Figure 01 — l index inverse, dessine.
 *
 * Un tableau dirait « trois mots, onze ancrages ». Il ne montrerait pas la
 * seule chose que le dessin donne d un coup d oeil : les trois listes se
 * recoupent sur un unique document, et c est ce recoupement — pas un parcours
 * des quatorze textes — qui rend la reponse en trente-huit millisecondes.
 */
function FigureIndex(): ReactElement {
  const gris: CSSProperties = { color: 'var(--o-palette-zinc-500)' }
  return (
    <svg viewBox="0 0 1000 320" aria-hidden="true" className="o-w-full" style={{ minWidth: 720 }}>
      <text x="40" y="34" className="o-font-mono" fontSize="10.5" fill="currentColor" style={gris}>
        les trois racines de « note de frais », et leurs listes d ancrage
      </text>

      {/* Les trois racines, a gauche, et leur liste. */}
      {ANCRAGES.map((ancrage, rang) => {
        const y = 92 + rang * 76
        return (
          <g key={ancrage.racine}>
            <rect x="40" y={y - 26} width="150" height="38" fill="none" stroke="currentColor" strokeOpacity="0.35" />
            <text x="52" y={y} className="o-font-mono" fontSize="14" fill={ENCRE}>
              {ancrage.racine}
            </text>
            <text x="202" y={y - 16} className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
              liste d ancrage
            </text>
            {ancrage.documents.map((numero, place) => (
              <g key={numero}>
                <rect x={202 + place * 58} y={y - 8} width="48" height="22" fill="none" stroke={ENCRE} strokeOpacity="0.55" />
                <text x={226 + place * 58} y={y + 7} textAnchor="middle" className="o-font-mono" fontSize="11" fill="currentColor">
                  d{numero}
                </text>
                <line
                  x1={250 + place * 58}
                  y1={y + 3}
                  x2="668"
                  y2={ordonneeDocument(numero)}
                  stroke={ENCRE}
                  strokeWidth="0.9"
                  strokeOpacity={numero === 1 ? 0.75 : 0.2}
                />
              </g>
            ))}
          </g>
        )
      })}

      {/* Les documents, a droite. Celui que les trois listes designent est plein. */}
      {COLONNE.map((entree) => {
        const y = ordonneeDocument(entree.numero)
        const retenu = entree.numero === 1
        return (
          <g key={entree.numero}>
            <rect
              x="672"
              y={y - 17}
              width="288"
              height="34"
              fill={retenu ? accentDoux(500, 26) : 'none'}
              stroke={retenu ? ENCRE : 'currentColor'}
              strokeOpacity={retenu ? 0.9 : 0.3}
            />
            <text x="686" y={y + 5} className="o-font-mono" fontSize="11.5" fill="currentColor" style={retenu ? { color: ENCRE } : gris}>
              d{entree.numero} — {entree.titre}
            </text>
          </g>
        )
      })}

      <text x="672" y="286" className="o-font-mono" fontSize="10.5" fill="currentColor" style={gris}>
        trois listes qui se recoupent : d1 les porte toutes
      </text>
      <text x="40" y="286" className="o-font-mono" fontSize="10.5" fill="currentColor" style={gris}>
        11 400 documents indexes — 38 ms de mediane, 96 ms au 99e centile
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------------ */
/*            Figure 02 — les requetes, en barres au trait (C14)            */
/* ------------------------------------------------------------------------ */

/** Les dix requetes les plus tapees, sur douze mois. */
const REQUETES: readonly { readonly mot: string; readonly fois: number }[] = [
  { mot: 'mot de passe', fois: 1490 },
  { mot: 'conges', fois: 890 },
  { mot: 'teletravail', fois: 655 },
  { mot: 'conges ete', fois: 510 },
  { mot: 'note de frais', fois: 412 },
  { mot: 'arret maladie', fois: 302 },
  { mot: 'remboursement', fois: 240 },
  { mot: 'vpn', fois: 208 },
  { mot: 'materiel', fois: 143 },
  { mot: 'bareme km', fois: 121 },
]

/**
 * Figure 02 — ce que les gens tapent vraiment.
 *
 * Dix traits horizontaux, aucun cadre, aucune case. Ils poussent depuis la
 * marge gauche quand la figure entre dans le champ ; sous mouvement reduit ils
 * sont deja poses. Le tout tient sur une bande claire qui coupe la page
 * sombre — c est la coupe, prise a l envers.
 */
function FigureRequetes(): ReactElement {
  const { ref, vu } = useInView<SVGSVGElement>({ amount: 0.25 })
  const gris: CSSProperties = { color: 'var(--o-theme-muted)' }
  const maximum = REQUETES[0]?.fois ?? 1
  return (
    <svg ref={ref} viewBox="0 0 1000 380" aria-hidden="true" className="o-w-full" style={{ minWidth: 620 }}>
      <text x="20" y="24" className="o-font-mono" fontSize="10.5" fill="currentColor" style={gris}>
        les dix requetes les plus tapees — 42 800 recherches sur douze mois
      </text>

      {REQUETES.map((requete, rang) => {
        const y = 60 + rang * 31
        const largeur = (requete.fois / maximum) * 620
        return (
          <g key={requete.mot}>
            <text x="20" y={y + 4} className="o-font-mono" fontSize="12" fill="currentColor">
              {requete.mot}
            </text>
            <line
              x1="230"
              y1={y}
              x2={230 + largeur}
              y2={y}
              stroke="currentColor"
              strokeWidth="13"
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'left center',
                transform: vu ? 'scaleX(1)' : 'scaleX(0)',
                transition: `transform 800ms cubic-bezier(0.16, 1, 0.3, 1) ${String(rang * 70)}ms`,
              }}
            />
            <text
              x={244 + largeur}
              y={y + 4}
              className="o-font-mono o-tabular-nums"
              fontSize="11.5"
              fill="currentColor"
              style={{ color: 'var(--o-theme-muted)', opacity: vu ? 1 : 0, transition: `opacity 600ms ease ${String(260 + rang * 70)}ms` }}
            >
              {requete.fois}
            </text>
          </g>
        )
      })}

      {/* La seule ligne de la figure : la marge d ou partent les traits. */}
      <line x1="230" y1="44" x2="230" y2="372" stroke="currentColor" strokeWidth="1" opacity="0.4" style={gris} />
    </svg>
  )
}

/* ------------------------------------------------------------------------ */
/*                            Les sources                                   */
/* ------------------------------------------------------------------------ */

/** L arbre des sources indexees. */
const ARBRE: readonly TreeNode[] = [
  {
    id: 'wiki',
    label: 'Wiki interne',
    hint: '2 140 pages',
    children: [
      { id: 'wiki-personnel', label: 'Personnel', hint: '318 pages' },
      { id: 'wiki-systeme', label: 'Systeme', hint: '604 pages' },
      { id: 'wiki-archives', label: 'Archives', hint: '412 pages, penalisees' },
    ],
  },
  {
    id: 'lecteur',
    label: 'Lecteur de fichiers',
    hint: '6 800 documents',
    children: [
      { id: 'lecteur-compta', label: 'Comptabilite', hint: 'texte extrait des tableurs' },
      { id: 'lecteur-juridique', label: 'Juridique', hint: 'texte extrait des documents' },
      { id: 'lecteur-images', label: 'Images et plans', hint: 'non indexes' },
    ],
  },
  {
    id: 'messagerie',
    label: 'Messagerie d equipe',
    hint: '1 900 fils',
    children: [
      { id: 'messagerie-ouverts', label: 'Salons ouverts', hint: 'indexes' },
      { id: 'messagerie-prives', label: 'Messages prives', hint: 'jamais indexes' },
    ],
  },
  { id: 'tickets', label: 'Tickets du service systeme', hint: '380 tickets clos' },
  { id: 'code', label: 'Depots de code', hint: '180 fichiers, noms et commentaires' },
]

/* ------------------------------------------------------------------------ */
/*                          Le pied : l index (P21)                         */
/* ------------------------------------------------------------------------ */

/** Les entrees du pied, en index alphabetique. */
const ENTREES: readonly { readonly lettre: string; readonly mots: readonly (readonly [string, string])[] }[] = [
  {
    lettre: 'A',
    mots: [
      ['Ancrage, liste d', '01'],
      ['Analyse de la requete', '01'],
      ['Archives, penalite des', '04'],
    ],
  },
  {
    lettre: 'C',
    mots: [
      ['Clics, poids des', '01'],
      ['Corpus de demonstration', '01'],
      ['Coupe claire', '03'],
    ],
  },
  {
    lettre: 'F',
    mots: [
      ['Fraicheur', '01'],
      ['Frequence inverse', '02'],
    ],
  },
  {
    lettre: 'I',
    mots: [
      ['Index inverse', '02'],
      ['Installation, delai d', '05'],
    ],
  },
  {
    lettre: 'M',
    mots: [
      ['Mots vides', '01'],
      ['Messagerie privee, exclusion', '04'],
    ],
  },
  {
    lettre: 'R',
    mots: [
      ['Racinisation', '01'],
      ['Requetes les plus tapees', '03'],
    ],
  },
  {
    lettre: 'S',
    mots: [
      ['Saturation du corps', '01'],
      ['Sources indexees', '04'],
      ['Synonymes, table des', '01'],
    ],
  },
  {
    lettre: 'T',
    mots: [
      ['Titre, poids du', '01'],
      ['Tickets clos', '04'],
    ],
  },
]

/* ------------------------------------------------------------------------ */
/*                                 La page                                  */
/* ------------------------------------------------------------------------ */

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('grotesk')

  return (
    <Porte forme="lettres" marque="Index">
      <div className="o-text-zinc-100" style={{ ...polices, ...nuit('zinc') }}>
        <BarreCoins marque="Index" liens={LIENS} droite="11 400 documents" sombre />

        <main>
          {/* =============== L ouverture : la grille et le mot ============== */}
          <section id="sommet" aria-label="Ouverture" className="o-relative o-isolate o-overflow-hidden">
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
              style={{
                backgroundImage: `linear-gradient(to right, ${FILET} 1px, transparent 1px), linear-gradient(to bottom, ${FILET} 1px, transparent 1px)`,
                backgroundSize: '72px 72px',
                maskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 78%)',
                WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 78%)',
              }}
            />
            <Grain opacite={0.06} />

            <Crosshair color={accent(500)} gap={22} coords={false}>
              <div className="o-relative o-z-20 o-px-6 o-pb-24 o-pt-10 md:o-px-8 md:o-pb-32">
                <Filigrane taille={21} opacite={8} className="o-absolute o-inset-x-0 o-top-20 o-z-0">
                  INDEX
                </Filigrane>

                <div className="o-relative o-z-10 o-mx-auto o-max-w-7xl">
                  <Surgit delai={40}>
                    <Etiquette sombre>Recherche interne — deploiement sur site</Etiquette>
                  </Surgit>

                  <TitreVague
                    delai={120}
                    cadence={64}
                    className="o-mt-8 o-max-w-4xl o-text-zinc-50"
                    style={affiche('l', 300)}
                  >
                    La recherche interne qui montre son calcul.
                  </TitreVague>

                  <div className="o-mt-10 o-grid o-gap-8 o-border-t o-pt-8 md:o-grid-cols-12" style={{ borderColor: FILET }}>
                    <Surgit delai={440} as="p" className="o-m-0 o-text-base o-leading-relaxed o-text-zinc-400 md:o-col-span-5">
                      Quatorze documents de demonstration, un index inverse, quatre termes de score. Tapez dans le champ plus bas : rien n est simule, et chaque resultat porte son addition.
                    </Surgit>
                    <Surgit delai={520} as="p" className="o-m-0 o-font-mono o-text-xs o-leading-relaxed o-uppercase o-tracking-widest o-text-zinc-500 md:o-col-span-3">
                      Cinq sources
                      <br />
                      Aucune donnee ne sort
                      <br />
                      38 ms de mediane
                    </Surgit>
                    <Surgit delai={600} className="md:o-col-span-4">
                      <a
                        href="#frappe"
                        className="o-inline-flex o-items-center o-gap-3 o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
                        style={{ backgroundColor: accent(300), color: 'var(--o-palette-zinc-950)', borderRadius: 0 }}
                      >
                        <Icon icon={Search} size={15} aria-hidden="true" />
                        Essayer le moteur
                      </a>
                    </Surgit>
                  </div>
                </div>
              </div>
            </Crosshair>

            <Coin position="bg" sombre>
              Index 3.4
              <br />
              Sur site, ou dans votre nuage
            </Coin>
            <Coin position="bd" sombre>
              340 personnes
              <br />
              Aucune requete ne quitte la maison
            </Coin>
          </section>

          {/* =============== Le ruban des sources =========================== */}
          <div className="o-border-t o-border-b o-px-6 o-py-4 md:o-px-8" style={{ borderColor: FILET }}>
            <ul className="o-m-0 o-mx-auto o-flex o-max-w-7xl o-list-none o-flex-wrap o-items-center o-gap-x-10 o-gap-y-3 o-p-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
              {(Object.keys(SOURCES) as readonly Source[]).map((cle) => (
                <li key={cle} className="o-inline-flex o-items-center o-gap-2">
                  <Icon icon={SOURCES[cle].icone} size={13} style={{ color: ENCRE }} aria-hidden="true" />
                  {SOURCES[cle].mot}
                </li>
              ))}
              <li className="o-ml-auto o-normal-case o-tracking-normal o-text-zinc-400">Rien d autre n est lu.</li>
            </ul>
          </div>

          {/* =============== (01) La frappe ================================= */}
          <section id="frappe" aria-labelledby="frappe-titre" className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-8 md:o-py-28">
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE }}>
                    (01) — La frappe
                  </p>
                  <h2
                    id="frappe-titre"
                    className="o-m-0 o-mt-5 o-text-balance o-text-zinc-50"
                    style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}
                  >
                    <DecodeText duration={900}>Tapez. Le classement s explique.</DecodeText>
                  </h2>
                </div>
                <p className="o-m-0 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-400 md:o-col-span-5">
                  Un moteur qui ne dit pas pourquoi il classe ainsi ne se corrige pas. Celui-ci pose son addition a droite de chaque resultat, et la barre montre d ou vient le score.
                </p>
              </div>

              <div className="o-mt-14">
                <Moteur />
              </div>
            </div>
          </section>

          {/* =============== Figure 01 : l index inverse ==================== */}
          <section
            id="index"
            aria-labelledby="index-titre"
            className="o-scroll-mt-24 o-border-t o-px-6 o-py-24 md:o-px-8 md:o-py-32"
            style={{ borderColor: FILET }}
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-3">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE }}>
                  Figure 01
                </p>
                <h2
                  id="index-titre"
                  className="o-m-0 o-mt-5 o-text-balance o-text-zinc-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}
                >
                  L index est a l envers.
                </h2>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-zinc-400">
                  Un moteur ne lit pas les documents pour repondre. Il a ecrit, une fois, la liste des documents ou chaque racine apparait — et il ne fait plus que croiser des listes.
                </p>
                <p className="o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-400">
                  C est pour cela qu ajouter dix mille documents ne rallonge pas la reponse dans les memes proportions : ce sont les listes qui s allongent, pas leur nombre.
                </p>
              </div>

              <figure className="o-m-0 o-min-w-0 lg:o-col-span-9">
                <div className="o-overflow-x-auto o-pb-2" style={{ overflowY: 'hidden' }}>
                  <FigureIndex />
                </div>
                <ul className="o-sr-only">
                  {ANCRAGES.map((ancrage) => (
                    <li key={ancrage.racine}>
                      {ancrage.racine} — documents {ancrage.documents.map((n) => `d${String(n)}`).join(', ')}.
                    </li>
                  ))}
                  <li>Le document d1 est le seul porte par les trois listes.</li>
                </ul>
                <figcaption className="o-mt-6 o-border-t o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-500" style={{ borderColor: FILET }}>
                  Figure 01 — les listes d ancrage de « note de frais ». Le trait plein mene au seul document que les trois listes designent ensemble.
                </figcaption>
              </figure>
            </div>
          </section>

          {/* =============== La coupe claire : Figure 02 ====================
              La page est sombre : la coupe est donc une bande claire, et rien
              dedans qu un graphique au trait qui se remplit a l entree. */}
          <section
            id="requetes"
            aria-labelledby="requetes-titre"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
            style={JOUR}
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-3">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600">Figure 02</p>
                <h2
                  id="requetes-titre"
                  className="o-m-0 o-mt-5 o-text-balance o-text-zinc-950"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}
                >
                  Dix questions font le tiers du trafic.
                </h2>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-zinc-600">
                  Sur quarante-deux mille huit cents recherches, ces dix-la en font quatorze mille. Ce n est pas un defaut du moteur : c est la carte des pages qu il faudrait ecrire mieux.
                </p>
                <p className="o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-600">
                  Index rend cette liste chaque semaine, avec les requetes restees sans clic. Ce sont celles-la qui valent une reponse.
                </p>
              </div>

              <figure className="o-m-0 o-min-w-0 lg:o-col-span-9">
                <div className="o-overflow-x-auto o-pb-2" style={{ overflowY: 'hidden' }}>
                  <FigureRequetes />
                </div>
                <ul className="o-sr-only">
                  {REQUETES.map((requete) => (
                    <li key={requete.mot}>
                      {requete.mot} — {String(requete.fois)} recherches.
                    </li>
                  ))}
                </ul>
                <figcaption className="o-mt-6 o-border-t o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-600" style={{ borderColor: FILET_JOUR }}>
                  Figure 02 — les dix requetes les plus tapees sur douze mois, chez un client de trois cent quarante personnes.
                </figcaption>
              </figure>
            </div>
          </section>

          {/* =============== (02) Les sources =============================== */}
          <section id="sources" aria-labelledby="sources-titre" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32">
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 lg:o-grid-cols-12">
              <div className="o-min-w-0 lg:o-col-span-5">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE }}>
                  (02) — Les sources
                </p>
                <h2
                  id="sources-titre"
                  className="o-m-0 o-mt-5 o-text-balance o-text-zinc-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}
                >
                  Ce qui entre, et ce qui n entre pas.
                </h2>
                <p className="o-mt-6 o-text-base o-leading-relaxed o-text-zinc-400">
                  Un moteur interne se juge d abord sur ce qu il refuse de lire. Les messages prives ne sont jamais indexes ; les images ne le sont pas non plus, faute de pouvoir en extraire un texte honnete.
                </p>
                <p className="o-mt-4 o-text-base o-leading-relaxed o-text-zinc-400">
                  Les droits de la source sont repris tels quels : un document que vous ne pouvez pas ouvrir n apparait pas dans vos resultats, et son existence meme ne fuite pas par le nombre de reponses.
                </p>
              </div>

              <div className="o-min-w-0 lg:o-col-span-7">
                <div className="o-p-6" style={{ border: `1px solid ${FILET}` }}>
                  <TreeView nodes={ARBRE} label="Les sources indexees" defaultOpen={['wiki', 'lecteur', 'messagerie']} />
                </div>
              </div>
            </div>
          </section>

          {/* =============== Un ecran de texte seul, qui s allume ===========
              La signature de la page : le seul long paragraphe s allume mot a
              mot au defilement. Rien d autre sur cet ecran. */}
          <section aria-labelledby="manifeste-titre" className="o-border-t o-px-6 o-py-32 md:o-px-8 md:o-py-44" style={{ borderColor: FILET }}>
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 md:o-grid-cols-12">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 md:o-col-span-3">
                Le principe
              </p>
              <div className="md:o-col-span-9">
                <h2 id="manifeste-titre" className="o-sr-only">
                  Le principe d Index
                </h2>
                <ScrollReveal
                  as="p"
                  dim={0.16}
                  blur={5}
                  className="o-m-0 o-max-w-4xl o-text-balance o-text-zinc-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.6rem, 3.2vw, 3.25rem)', lineHeight: 1.14 }}
                >
                  Un moteur qui devine ce que vous vouliez dire vous prive du droit de le lui apprendre. Celui-ci se trompe visiblement, et se corrige en une ligne de table.
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* =============== A16 : un champ et un bouton, un seul filet ===== */}
          <section id="essai" aria-labelledby="essai-titre" className="o-scroll-mt-24 o-border-t o-px-6 o-py-24 md:o-px-8 md:o-py-32" style={{ borderColor: FILET }}>
            <div className="o-mx-auto o-max-w-3xl">
              <h2 id="essai-titre" className="o-m-0 o-text-balance o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.4vw, 3.5rem)' }}>
                Index sur vos documents, en quatre jours.
              </h2>
              <p className="o-mt-5 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-400">
                Un connecteur, un premier index, une semaine d observation des requetes. Laissez une adresse : la reponse arrive avec le questionnaire de sources, pas avec une demonstration commerciale.
              </p>

              <form
                className="o-mt-10 o-flex o-items-center"
                style={{ border: `1px solid ${FILET}` }}
                onSubmit={(evenement) => {
                  evenement.preventDefault()
                }}
              >
                <label htmlFor="index-courriel" className="o-sr-only">
                  Votre adresse de courriel professionnelle
                </label>
                <input
                  id="index-courriel"
                  name="index-courriel"
                  type="email"
                  placeholder="vous@la-maison.fr"
                  className="o-min-w-0 o-grow o-bg-transparent o-px-4 o-py-4 o-font-mono o-text-sm o-text-zinc-50 focus:o-ring"
                  style={{ border: 'none', borderRadius: 0 }}
                />
                <button
                  type="submit"
                  className="o-shrink-0 o-cursor-pointer o-px-7 o-py-4 o-text-sm o-font-semibold o-transition-opacity hover:o-opacity-85 focus:o-ring"
                  style={{ backgroundColor: accent(300), color: 'var(--o-palette-zinc-950)', border: 'none', borderRadius: 0 }}
                >
                  Demander
                </button>
              </form>
            </div>
          </section>
        </main>

        {/* =============== P21 : l index alphabetique des pages ============= */}
        <footer className="o-border-t o-px-6 o-pb-10 o-pt-16 md:o-px-8" style={{ borderColor: FILET }}>
          <div className="o-mx-auto o-max-w-7xl">
            <p className="o-m-0 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
              Index de cette page
            </p>

            <div className="o-mt-10 o-grid o-gap-x-12 o-gap-y-8 sm:o-grid-cols-2 lg:o-grid-cols-4">
              {ENTREES.map((entree) => (
                <section key={entree.lettre} aria-label={`Entrees en ${entree.lettre}`}>
                  <h2 className="o-m-0 o-border-b o-pb-2 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ borderColor: FILET, color: ENCRE }}>
                    {entree.lettre}
                  </h2>
                  <ul className="o-m-0 o-mt-3 o-flex o-list-none o-flex-col o-gap-1.5 o-p-0">
                    {entree.mots.map(([mot, renvoi]) => (
                      <li key={mot} className="o-flex o-items-baseline o-gap-2 o-text-xs o-uppercase o-tracking-wider o-text-zinc-400">
                        <span className="o-min-w-0">{mot}</span>
                        <span aria-hidden="true" className="o-h-px o-grow" style={{ backgroundColor: FILET }} />
                        <span className="o-font-mono o-tabular-nums o-text-zinc-500">{renvoi}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>

            <div className="o-mt-14 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500" style={{ borderColor: FILET }}>
              <span>Index — Lyon 69007, 14 rue Chevreul</span>
              <nav aria-label="Mentions" className="o-flex o-flex-wrap o-gap-x-6 o-gap-y-2">
                {([
                  ['#sources', 'Traitement des donnees'],
                  ['#index', 'Documentation'],
                  ['#frappe', 'Journal des versions'],
                  ['#essai', 'Nous ecrire'],
                ] as const).map(([cible, mot]) => (
                  <a key={mot} href={cible} className="o-no-underline o-text-zinc-500 hover:o-text-zinc-200 o-transition-colors focus:o-ring">
                    {mot}
                  </a>
                ))}
              </nav>
              <span>© 2026 Index SAS</span>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
