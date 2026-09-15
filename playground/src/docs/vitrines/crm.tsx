/**
 * Carnet — le carnet de clients d un artisan.
 *
 * ## Le piege de la page de logiciel, et ce qu on met a la place
 *
 * Un editeur de logiciel qui se presente finit en mur de tableaux : une grille
 * de fonctions, une grille de tarifs, une grille de temoignages. Cette page
 * refuse le mur. Elle ouvre sur une **affiche produit** — un titre-objet et la
 * fiche dessinee a la main, rien d autre — puis elle montre **une seule
 * chose** : ce que le logiciel fait quand un client ne paie pas.
 *
 * Entre les blocs denses, trois ecarts : une **figure numerotee** qui dessine
 * la vie d un chantier avec sa legende dans la marge, une **bande sombre** qui
 * coupe la page claire et n y porte qu un graphique au trait, et une **phrase
 * seule** sur son ecran.
 *
 * ## Le mecanisme : la fiche client, et la relance qui se calcule
 *
 * Cinq clients ecrits a la main, avec leur historique reel de chantier. Un
 * curseur porte le **jour du carnet** : on le deplace, et tout ce qui depend
 * de la date suit — le nombre de jours de retard, le palier de relance
 * atteint, les interets courus, l indemnite forfaitaire, et le texte exact du
 * message a envoyer.
 *
 * Le calcul est celui du droit francais, et il distingue deux cas, ce qu aucune
 * page de presentation ne fait jamais : entre professionnels, le taux est celui
 * de la Banque centrale majore de dix points, et quarante euros d indemnite
 * forfaitaire de recouvrement s ajoutent des le premier jour ; face a un
 * particulier, ni l un ni l autre — le taux d interet legal, et rien de plus.
 * C est exactement la ou un artisan se trompe.
 *
 * ## Le mouvement
 *
 * Sa signature est **M-empile** : quatre cartes qui se figent et retrecissent
 * l une sous l autre, chacune portant un objet dessine — le cahier, la boite a
 * devis, le tableur, la boite mail. Le graphique de la bande sombre, lui, se
 * remplit **a l entree dans le champ** : les barres poussent depuis leur ligne
 * de base, elles n arrivent pas pleines.
 *
 * ## La palette
 *
 * Rien n est ecrit en emeraude. La page lit `--o-vitrine-*`, l accent que la
 * barre pose sur son conteneur : `encre()` pour ce qui doit se lire sur les
 * deux themes, `encreSurSombre()` sur la bande qui est sombre dans les deux.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowUpRight, NotebookPen, Receipt, Scale } from '@odoro-cli/icons/outline'
import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { GraphPaper } from '@/odoro/background/GraphPaper.jsx'
import { StickyStack } from '@/odoro/section/StickyStack.jsx'
import { HandWritten } from '@/odoro/text/HandWritten.jsx'
import { AnimatedList } from '@/odoro/ui/AnimatedList.jsx'
import { useInView } from '@/odoro/hooks/useInView'

import { BandeauMentions, nuit } from './communs.jsx'
import { accent, accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreFilet,
  Coin,
  Etiquette,
  Grain,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'

/* ------------------------------------------------------------------------ */
/*                            Les encres                                    */
/* ------------------------------------------------------------------------ */

/** Le filet neutre de la page, derive de l encre courante. */
const FILET = 'color-mix(in oklab, currentColor 14%, transparent)'

/** L encre d accent, lisible sur les deux themes. */
const ENCRE = encre()

/** L encre d accent sur une bande sombre dans les deux themes. */
const ENCRE_NUIT = encreSurSombre()

/** L aplat doux des cases mises en avant. */
const VOILE = accentDoux(500, 12)

/** Les rubriques de la barre. */
const LIENS = [
  ['#fiche', 'La fiche'],
  ['#chantier', 'Un chantier'],
  ['#retard', 'Les retards'],
  ['#remplace', 'Ce qu il remplace'],
  ['#essai', 'Essayer'],
] as const

/* ------------------------------------------------------------------------ */
/*                          Le calcul de la relance                         */
/* ------------------------------------------------------------------------ */

/** Le premier jour du repere : les jours du carnet se comptent depuis lui. */
const ORIGINE = Date.UTC(2026, 0, 1)

/** Le format des dates du carnet : jour, mois, annee, sans nom de mois. */
const EN_DATE = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

/** Les euros, a deux decimales, comme sur une facture. */
const EN_EUROS = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** La date d un jour du carnet. */
function dateDe(jour: number): string {
  return EN_DATE.format(new Date(ORIGINE + jour * 86_400_000))
}

/** Un montant, en euros, ecrit comme sur une facture. */
function euros(valeur: number): string {
  return `${EN_EUROS.format(valeur)} EUR`
}

/**
 * Le taux des penalites entre professionnels.
 *
 * Taux directeur de la Banque centrale au 1er janvier 2026, majore de dix
 * points, comme le prevoit l article L441-10 du code de commerce.
 */
const TAUX_PRO = 0.1215

/**
 * Le taux face a un particulier.
 *
 * Le taux d interet legal, seul applicable a defaut de clause. La majoration
 * de dix points et l indemnite forfaitaire ne valent qu entre professionnels :
 * les reclamer a un particulier expose a la nullite de la clause.
 */
const TAUX_PARTICULIER = 0.0665

/** L indemnite forfaitaire de recouvrement, par facture, entre professionnels. */
const FORFAIT = 40

/** Une ecriture de l historique d un chantier. */
interface Ecriture {
  /** Le jour du carnet. */
  readonly jour: number
  readonly quoi: string
  /** Un montant, quand l ecriture en porte un. */
  readonly montant?: number
  /** Vrai pour l ecriture qui reste ouverte : la facture impayee. */
  readonly ouverte?: boolean
}

/** Un client du carnet. */
interface Client {
  readonly id: string
  readonly nom: string
  readonly lieu: string
  readonly genre: 'particulier' | 'professionnel'
  readonly chantier: string
  readonly facture: string
  /** Le montant toutes taxes comprises, tel qu il figure sur la facture. */
  readonly montant: number
  /** Le jour d echeance, dans le repere du carnet. */
  readonly echeance: number
  readonly historique: readonly Ecriture[]
}

/**
 * Les cinq clients du carnet de demonstration.
 *
 * Ce ne sont pas cinq variantes du meme cas : deux particuliers et trois
 * professionnels, des montants qui vont de six cents a treize mille euros, et
 * des echeances etalees sur trois mois. C est ce qui rend le curseur du jour
 * interessant — a chaque position, la liste des urgences n est pas la meme.
 */
const CLIENTS: readonly Client[] = [
  {
    id: 'belleville',
    nom: 'Copropriete du 12 rue Belleville',
    lieu: 'Nantes 44000 — syndic Berthaut',
    genre: 'professionnel',
    chantier: 'Remplacement de la colonne montante, cage B',
    facture: 'F2025-214',
    montant: 12_900,
    echeance: 4,
    historique: [
      { jour: -96, quoi: 'Visite technique, releve des colonnes' },
      { jour: -82, quoi: 'Devis remis en assemblee', montant: 12_900 },
      { jour: -54, quoi: 'Devis vote, acompte de trente pour cent', montant: 3_870 },
      { jour: -40, quoi: 'Ouverture du chantier, cage B' },
      { jour: -30, quoi: 'Reception des travaux, sans reserve' },
      { jour: -26, quoi: 'Facture emise a trente jours', montant: 12_900, ouverte: true },
    ],
  },
  {
    id: 'fournil',
    nom: 'Le Fournil de l Herbe',
    lieu: 'Saint-Herblain 44800 — boulangerie',
    genre: 'professionnel',
    chantier: 'Reprise du reseau vapeur du fournil',
    facture: 'F2026-008',
    montant: 7_340,
    echeance: 44,
    historique: [
      { jour: -18, quoi: 'Depannage de nuit, fuite sur le collecteur', montant: 480 },
      { jour: -6, quoi: 'Devis de reprise complete', montant: 7_340 },
      { jour: 2, quoi: 'Devis signe, chantier cale sur la fermeture' },
      { jour: 9, quoi: 'Chantier mene en trois nuits' },
      { jour: 14, quoi: 'Facture emise a trente jours', montant: 7_340, ouverte: true },
    ],
  },
  {
    id: 'sevre',
    nom: 'SCI des Hauts de Sevre',
    lieu: 'Reze 44400 — bailleur, neuf lots',
    genre: 'professionnel',
    chantier: 'Six chaudieres murales, lots 3 a 8',
    facture: 'F2026-031',
    montant: 4_820,
    echeance: 78,
    historique: [
      { jour: 12, quoi: 'Demande de chiffrage par courriel' },
      { jour: 19, quoi: 'Devis remis, six appareils', montant: 4_820 },
      { jour: 27, quoi: 'Devis signe, sans acompte' },
      { jour: 41, quoi: 'Pose des six appareils, deux journees' },
      { jour: 48, quoi: 'Facture emise a trente jours', montant: 4_820, ouverte: true },
    ],
  },
  {
    id: 'tanguy',
    nom: 'Madame Tanguy',
    lieu: 'Reze 44400 — particulier',
    genre: 'particulier',
    chantier: 'Salle d eau, plomberie et evacuation',
    facture: 'F2026-039',
    montant: 1_265.5,
    echeance: 91,
    historique: [
      { jour: 33, quoi: 'Visite, releve des arrivees' },
      { jour: 38, quoi: 'Devis remis', montant: 1_265.5 },
      { jour: 45, quoi: 'Devis signe, acompte verse', montant: 379.65 },
      { jour: 58, quoi: 'Chantier, quatre jours' },
      { jour: 61, quoi: 'Solde facture a trente jours', montant: 885.85, ouverte: true },
    ],
  },
  {
    id: 'kerouault',
    nom: 'Monsieur Kerouault',
    lieu: 'Bouguenais 44340 — particulier',
    genre: 'particulier',
    chantier: 'Remplacement d un ballon de deux cents litres',
    facture: 'F2026-044',
    montant: 640,
    echeance: 116,
    historique: [
      { jour: 71, quoi: 'Appel : plus d eau chaude' },
      { jour: 72, quoi: 'Depannage, diagnostic de la resistance' },
      { jour: 79, quoi: 'Ballon remplace, ancien evacue' },
      { jour: 86, quoi: 'Facture emise a trente jours', montant: 640, ouverte: true },
    ],
  },
]

/** Un palier de la relance. */
interface Palier {
  readonly rang: number
  readonly nom: string
  readonly depuis: number
  readonly geste: string
}

/**
 * L echelle de relance du carnet.
 *
 * Elle n est pas une invention : c est la sequence que les chambres de metiers
 * enseignent, et le seul point ou une page de logiciel peut vraiment aider un
 * artisan — savoir **quand** passer au cran suivant, et ne pas y passer trop
 * tot.
 */
const PALIERS: readonly Palier[] = [
  {
    rang: 0,
    nom: 'Rappel simple',
    depuis: 0,
    geste:
      'Un courriel, sans penalite annoncee. La plupart des retards tiennent a une facture egaree.',
  },
  {
    rang: 1,
    nom: 'Relance ferme',
    depuis: 7,
    geste:
      'Un courriel avec le decompte des penalites deja courues, et la date de la mise en demeure.',
  },
  {
    rang: 2,
    nom: 'Mise en demeure',
    depuis: 21,
    geste:
      'Une lettre recommandee avec avis de reception. C est elle qui fait courir le delai de l injonction.',
  },
  {
    rang: 3,
    nom: 'Injonction de payer',
    depuis: 45,
    geste:
      'Requete au tribunal. Le carnet sort le decompte, les pieces et l avis de reception en un seul dossier.',
  },
]

/** Ce que le carnet sait dire d un client, a un jour donne. */
interface Etat {
  readonly retard: number
  /** Le rang du palier atteint ; -1 quand l echeance n est pas passee. */
  readonly palier: number
  readonly interets: number
  readonly forfait: number
  readonly du: number
  readonly taux: number
}

/** Ce que doit un client, au jour dit. */
function etatDe(client: Client, jour: number): Etat {
  const retard = jour - client.echeance
  const taux = client.genre === 'professionnel' ? TAUX_PRO : TAUX_PARTICULIER
  if (retard < 0) {
    return { retard, palier: -1, interets: 0, forfait: 0, du: client.montant, taux }
  }
  const interets = (client.montant * taux * retard) / 365
  const forfait = client.genre === 'professionnel' ? FORFAIT : 0
  let palier = 0
  for (const p of PALIERS) if (retard >= p.depuis) palier = p.rang
  return {
    retard,
    palier,
    interets,
    forfait,
    du: client.montant + interets + forfait,
    taux,
  }
}

/** Le message que le carnet prepare, au palier atteint. */
function message(client: Client, etat: Etat, jour: number): string {
  const nom = client.nom
  if (etat.palier < 0) {
    return `Rien a envoyer. La facture ${client.facture} vient a echeance le ${dateDe(client.echeance)}, dans ${String(-etat.retard)} jours.`
  }
  const penalites =
    etat.forfait > 0
      ? `${euros(etat.interets)} d interets et ${euros(etat.forfait)} d indemnite forfaitaire de recouvrement`
      : `${euros(etat.interets)} d interets au taux legal`
  if (etat.palier === 0) {
    return `Bonjour, la facture ${client.facture} du chantier « ${client.chantier} » est venue a echeance le ${dateDe(client.echeance)}. Il s agit sans doute d un oubli : le reglement de ${euros(client.montant)} peut se faire par virement sous huit jours.`
  }
  if (etat.palier === 1) {
    return `Madame, Monsieur, la facture ${client.facture} reste impayee depuis ${String(etat.retard)} jours. A ce jour s ajoutent ${penalites}, soit ${euros(etat.du)}. Sans reglement au ${dateDe(jour + 10)}, une mise en demeure vous sera adressee par lettre recommandee.`
  }
  if (etat.palier === 2) {
    return `Mise en demeure. La facture ${client.facture}, echue le ${dateDe(client.echeance)}, demeure impayee ${String(etat.retard)} jours apres son terme. Somme reclamee : ${euros(etat.du)}, dont ${penalites}. A defaut de reglement sous quinze jours, une requete en injonction de payer sera deposee.`
  }
  return `Dossier pret pour requete. ${nom} — facture ${client.facture}, ${String(etat.retard)} jours de retard, ${euros(etat.du)} reclames. Pieces jointes : devis signe, proces-verbal de reception, facture, mise en demeure du ${dateDe(client.echeance + 21)} et son avis de reception.`
}

/* ------------------------------------------------------------------------ */
/*                       Figure 01 : la vie d un chantier                   */
/* ------------------------------------------------------------------------ */

/** Une station de la figure du chantier. */
const STATIONS: readonly {
  readonly nom: string
  readonly quand: string
  readonly part: number
}[] = [
  { nom: 'Devis remis', quand: 'jour 0', part: 0 },
  { nom: 'Devis signe', quand: 'jour 28', part: 0.3 },
  { nom: 'Chantier', quand: 'jour 42', part: 0.3 },
  { nom: 'Reception', quand: 'jour 70', part: 0.3 },
  { nom: 'Facture', quand: 'jour 72', part: 0.3 },
  { nom: 'Echeance', quand: 'jour 102', part: 0.3 },
  { nom: 'Encaissement', quand: 'jour 128', part: 1 },
]

/** L abscisse d une station. */
function abscisseStation(rang: number): number {
  return 92 + rang * 136
}

/**
 * Figure 01 — la vie d un chantier, et le trou qu elle creuse.
 *
 * Un tableau de sept lignes dirait les memes dates. Il ne montrerait pas la
 * seule chose qui compte pour un artisan : la surface grise entre l avance de
 * tresorerie et l encaissement. Le dessin, lui, la montre — et c est pour
 * cette surface que le carnet existe.
 */
function FigureChantier(): ReactElement {
  const gris: CSSProperties = { color: 'var(--o-theme-muted)' }
  const encaisse = abscisseStation(6)
  return (
    <svg
      viewBox="0 0 1000 344"
      aria-hidden="true"
      className="o-w-full"
      style={{ minWidth: 760 }}
    >
      {/* La surface d avance : ce que l artisan a sorti et pas encore revu. */}
      <path
        d={`M${String(abscisseStation(2))} 196V122h${String(encaisse - abscisseStation(2))}v74Z`}
        fill={accent(500)}
        opacity="0.13"
      />
      <text
        x={(abscisseStation(2) + encaisse) / 2}
        y="112"
        textAnchor="middle"
        className="o-font-mono"
        fontSize="10.5"
        fill="currentColor"
        style={{ color: ENCRE }}
      >
        quatre-vingt-six jours d avance — materiel, main d oeuvre, charges
      </text>

      {/* Le rail des stations. */}
      <line
        x1="60"
        y1="196"
        x2="960"
        y2="196"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.45"
        style={gris}
      />

      {STATIONS.map((station, rang) => {
        const x = abscisseStation(rang)
        return (
          <g key={station.nom}>
            <circle
              cx={x}
              cy="196"
              r="6"
              fill="var(--o-theme-bg)"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <text x={x} y="222" textAnchor="middle" fontSize="13" fill="currentColor">
              {station.nom}
            </text>
            <text
              x={x}
              y="240"
              textAnchor="middle"
              className="o-font-mono"
              fontSize="10"
              fill="currentColor"
              style={gris}
            >
              {station.quand}
            </text>
          </g>
        )
      })}

      {/* Ce qui est encaisse : un escalier a deux marches, sous le rail. */}
      <text
        x="60"
        y="268"
        className="o-font-mono"
        fontSize="10"
        fill="currentColor"
        style={gris}
      >
        encaisse
      </text>
      <line
        x1="60"
        y1="310"
        x2="960"
        y2="310"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.35"
        style={gris}
      />
      <path
        d={`M60 310V310H${String(abscisseStation(1))}V${String(310 - 0.3 * 52)}H${String(encaisse)}V${String(310 - 52)}H960`}
        fill="none"
        stroke={ENCRE}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d={`M${String(abscisseStation(1))} 310V${String(310 - 0.3 * 52)}H${String(encaisse)}V${String(310 - 52)}H960V310Z`}
        fill={ENCRE}
        opacity="0.12"
      />
      <text
        x={abscisseStation(3)}
        y="288"
        textAnchor="middle"
        className="o-font-mono"
        fontSize="10.5"
        fill="currentColor"
        style={gris}
      >
        30 % d acompte, et rien d autre pendant trois mois
      </text>
      <text
        x="956"
        y="330"
        textAnchor="end"
        className="o-font-mono"
        fontSize="10.5"
        fill="currentColor"
        style={{ color: ENCRE }}
      >
        100 % au jour 128
      </text>

      {/* Le cran de relance, pose sur le rail juste apres l echeance. */}
      <path
        d={`M${String(abscisseStation(5))} 196v-30h58`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="4 5"
        opacity="0.7"
        style={gris}
      />
      <text
        x={abscisseStation(5) + 64}
        y="170"
        className="o-font-mono"
        fontSize="10.5"
        fill="currentColor"
        style={{ color: ENCRE }}
      >
        relance
      </text>
      <text
        x="60"
        y="42"
        className="o-font-mono"
        fontSize="10.5"
        fill="currentColor"
        style={gris}
      >
        chantier type du carnet — 128 jours entre le devis remis et l argent recu
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------------ */
/*                Figure 02 : les barres au trait, dans la nuit             */
/* ------------------------------------------------------------------------ */

/** Une barre du graphique des delais. */
const DELAIS: readonly {
  readonly quoi: string
  readonly jours: number
  readonly part: string
}[] = [
  { quoi: 'Aucune relance', jours: 68, part: '31 % des factures' },
  { quoi: 'Rappel a J+2', jours: 41, part: '38 %' },
  { quoi: 'Relance ferme a J+8', jours: 29, part: '21 %' },
  { quoi: 'Mise en demeure a J+21', jours: 24, part: '8 %' },
  { quoi: 'Injonction a J+45', jours: 61, part: '2 %' },
]

/** Le delai le plus long de la serie, qui donne l echelle. */
const DELAI_MAX = 72

/** Le rang de la derniere barre, celle qui remonte. */
const DERNIERE_BARRE = DELAIS.length - 1

/**
 * Figure 02 — le delai moyen d encaissement, en barres au trait.
 *
 * Aucun cadre, aucun fond de case : cinq traits epais qui poussent depuis leur
 * ligne de base quand la figure entre dans le champ. Elle porte une verite que
 * la table des paliers ne dit pas — la derniere barre **remonte**. Passer au
 * tribunal rallonge le delai ; ce qui le raccourcit, c est de relancer tot.
 */
function FigureDelais(): ReactElement {
  const { ref, vu } = useInView<SVGSVGElement>({ amount: 0.3 })
  const gris: CSSProperties = { color: 'var(--o-palette-zinc-400)' }
  return (
    <svg
      ref={ref}
      viewBox="0 0 1000 306"
      aria-hidden="true"
      className="o-w-full"
      style={{ minWidth: 620 }}
    >
      {DELAIS.map((barre, rang) => {
        const x = 118 + rang * 176
        const hauteur = (barre.jours / DELAI_MAX) * 150
        const dernier = rang === DERNIERE_BARRE
        return (
          <g key={barre.quoi}>
            <text
              x={x}
              y={252 - hauteur - 16}
              textAnchor="middle"
              className="o-font-mono o-tabular-nums"
              fontSize="19"
              fill="currentColor"
              style={{
                color: dernier ? 'var(--o-palette-amber-300)' : ENCRE_NUIT,
                opacity: vu ? 1 : 0,
                transition: `opacity 700ms ease ${String(340 + rang * 120)}ms`,
              }}
            >
              {barre.jours} j
            </text>
            <line
              x1={x}
              y1={252}
              x2={x}
              y2={252 - hauteur}
              stroke={dernier ? 'var(--o-palette-amber-300)' : ENCRE_NUIT}
              strokeWidth="26"
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'bottom center',
                transform: vu ? 'scaleY(1)' : 'scaleY(0)',
                transition: `transform 900ms cubic-bezier(0.16, 1, 0.3, 1) ${String(rang * 120)}ms`,
              }}
            />
            <text x={x} y="276" textAnchor="middle" fontSize="13" fill="currentColor">
              {barre.quoi}
            </text>
            <text
              x={x}
              y="294"
              textAnchor="middle"
              className="o-font-mono"
              fontSize="10.5"
              fill="currentColor"
              style={gris}
            >
              {barre.part}
            </text>
          </g>
        )
      })}

      {/* La seule ligne de la figure : le sol des barres. */}
      <line
        x1="40"
        y1="252"
        x2="960"
        y2="252"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.5"
        style={gris}
      />
      <text
        x="40"
        y="30"
        className="o-font-mono"
        fontSize="10.5"
        fill="currentColor"
        style={gris}
      >
        delai moyen entre l emission et l encaissement — 1 240 factures du carnet, 2025
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------------ */
/*                     Les objets dessines de l empilement                  */
/* ------------------------------------------------------------------------ */

/** Un objet de la pile : le dessin au trait de ce que le carnet remplace. */
function ObjetPile({
  nom,
}: {
  readonly nom: 'cahier' | 'boite' | 'tableur' | 'messagerie'
}): ReactElement {
  const trait = { stroke: 'currentColor', strokeWidth: 1.6, fill: 'none' } as const
  return (
    <svg
      viewBox="0 0 220 160"
      aria-hidden="true"
      className="o-w-full"
      style={{ maxWidth: 240, opacity: 0.9 }}
    >
      {nom === 'cahier' && (
        <g {...trait}>
          <path d="M34 26h152v112H34z" />
          <path d="M56 26v112" />
          {[44, 62, 80, 98, 116].map((y) => (
            <path key={y} d={`M70 ${String(y)}h100`} opacity="0.5" />
          ))}
          {[46, 70, 94, 118].map((y) => (
            <path key={`anneau-${y}`} d={`M28 ${String(y)}a8 8 0 0 1 12 0`} />
          ))}
          <path d="M128 116l18 14 24-34" stroke={accent(500)} strokeWidth="2.4" />
        </g>
      )}
      {nom === 'boite' && (
        <g {...trait}>
          {/* Les devis qui depassent, avant la boite : elle les recouvre. */}
          <path d="M74 116V44h38v72" transform="rotate(-8 93 80)" />
          <path d="M100 116V34h40v82" transform="rotate(4 120 75)" />
          <path d="M128 116V50h34v66" transform="rotate(14 145 83)" />
          {/* La boite, en trois faces. */}
          <path d="M38 92h144v50H38z" fill="var(--o-theme-bg)" />
          <path d="M38 92l20-16h144l-20 16" fill="var(--o-theme-bg)" />
          <path d="M182 92l20-16v50l-20 16" fill="var(--o-theme-bg)" />
          <path d="M64 116h58" stroke={accent(500)} strokeWidth="2.6" />
        </g>
      )}
      {nom === 'tableur' && (
        <g {...trait}>
          <path d="M26 30h168v104H26z" />
          {[56, 82, 108].map((y) => (
            <path key={y} d={`M26 ${String(y)}h168`} opacity="0.5" />
          ))}
          {[70, 114, 158].map((x) => (
            <path key={x} d={`M${String(x)} 30v104`} opacity="0.5" />
          ))}
          <path
            d="M26 30h168v26H26z"
            fill={accent(500)}
            fillOpacity="0.18"
            stroke="none"
          />
          <path
            d="M120 92l16 16 28-36"
            stroke={accent(500)}
            strokeWidth="2.4"
            opacity="0.9"
          />
        </g>
      )}
      {nom === 'messagerie' && (
        <g {...trait}>
          <path d="M28 42h164v78H28z" />
          <path d="M28 42l82 50 82-50" />
          <path d="M28 120l58-42M192 120l-58-42" opacity="0.5" />
          <circle
            cx="176"
            cy="52"
            r="15"
            fill={accent(500)}
            fillOpacity="0.22"
            stroke={accent(500)}
            strokeWidth="1.6"
          />
          <text
            x="176"
            y="57"
            textAnchor="middle"
            fontSize="13"
            fill={accent(500)}
            stroke="none"
            className="o-font-mono"
          >
            41
          </text>
        </g>
      )}
    </svg>
  )
}

/** Une carte de l empilement. */
const PILE: readonly {
  readonly objet: 'cahier' | 'boite' | 'tableur' | 'messagerie'
  readonly rang: string
  readonly titre: string
  readonly texte: string
  readonly note: string
}[] = [
  {
    objet: 'cahier',
    rang: '01',
    titre: 'Le cahier a spirale du camion',
    texte:
      'Il tient tout : l adresse, le code de la porte, ce qui a ete dit au telephone. Il ne tient rien de ce qui se compte — et il reste dans le camion le jour ou le comptable appelle.',
    note: 'Le carnet garde la meme forme, et la meme vitesse de saisie : une ligne, une date, un montant.',
  },
  {
    objet: 'boite',
    rang: '02',
    titre: 'La boite a devis',
    texte:
      'Les devis signes, les bons de commande, les proces-verbaux de reception. Quarante centimetres de papier par an, et la seule piece qui manque est toujours celle que le juge demande.',
    note: 'Chaque piece est attachee au chantier, et repart avec lui dans le dossier d injonction.',
  },
  {
    objet: 'tableur',
    rang: '03',
    titre: 'Le tableur des impayes',
    texte:
      'Une feuille ouverte le dimanche soir, des formules qui se cassent quand on insere une ligne, et une colonne « relance ? » que personne ne remplit deux semaines de suite.',
    note: 'Le calcul des penalites est fait par le carnet, avec le bon taux selon que le client est un professionnel ou non.',
  },
  {
    objet: 'messagerie',
    rang: '04',
    titre: 'La boite mail',
    texte:
      'Quarante et un messages non lus, dont trois demandes de devis. Le fil d un chantier y est coupe en dix morceaux, entre deux publicites de fournisseur.',
    note: 'Les echanges d un chantier se rangent sous le chantier. La relance part de la, avec les pieces jointes deja dedans.',
  },
]

/* ------------------------------------------------------------------------ */
/*                             Petites pieces                               */
/* ------------------------------------------------------------------------ */

/** L intitule d une section : un indice en mono, un titre d affichage. */
function Titre({
  indice,
  id,
  sombre = false,
  children,
}: {
  readonly indice: string
  readonly id?: string
  readonly sombre?: boolean
  readonly children: ReactNode
}): ReactElement {
  return (
    <>
      <p
        className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
        style={{ color: sombre ? ENCRE_NUIT : ENCRE }}
      >
        {indice}
      </p>
      <h2
        id={id}
        className={`o-m-0 o-mt-5 o-text-balance ${sombre ? 'o-text-zinc-50' : 'o-text-zinc-950 dark:o-text-zinc-50'}`}
        style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}
      >
        {children}
      </h2>
    </>
  )
}

/** La fiche dessinee de l ouverture : le produit, en affiche. */
function FicheDessinee(): ReactElement {
  return (
    <svg
      viewBox="0 0 360 440"
      aria-hidden="true"
      className="o-w-full"
      style={{ maxWidth: 380 }}
    >
      <defs>
        <filter id="carnet-ombre" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodOpacity="0.16" />
        </filter>
      </defs>
      <g transform="rotate(-3 180 220)" filter="url(#carnet-ombre)">
        <rect
          x="26"
          y="40"
          width="308"
          height="376"
          rx="10"
          fill="var(--o-theme-bg)"
          stroke="currentColor"
          strokeOpacity="0.18"
        />
        <rect
          x="26"
          y="40"
          width="308"
          height="54"
          rx="10"
          fill={accent(500)}
          fillOpacity="0.12"
        />
        <line
          x1="26"
          y1="94"
          x2="334"
          y2="94"
          stroke="currentColor"
          strokeOpacity="0.18"
        />
        <line
          x1="64"
          y1="94"
          x2="64"
          y2="416"
          stroke={accent(500)}
          strokeOpacity="0.45"
        />

        {/* La reliure : quatre anneaux au-dessus de la fiche. */}
        {[86, 150, 214, 278].map((x) => (
          <g key={x}>
            <path
              d={`M${String(x)} 40v-18`}
              stroke="currentColor"
              strokeOpacity="0.4"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d={`M${String(x)} 22a9 9 0 0 1 14 0`}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.4"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d={`M${String(x + 14)} 22v18`}
              stroke="currentColor"
              strokeOpacity="0.4"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        ))}

        <text
          x="46"
          y="74"
          className="o-font-mono"
          fontSize="11"
          letterSpacing="1.6"
          fill="currentColor"
          fillOpacity="0.62"
        >
          FICHE 031
        </text>
        <text
          x="314"
          y="74"
          textAnchor="end"
          className="o-font-mono"
          fontSize="11"
          letterSpacing="1.6"
          fill={accent(600)}
        >
          IMPAYEE
        </text>

        <text x="80" y="132" fontSize="19" fontWeight="600" fill="currentColor">
          SCI des Hauts de Sevre
        </text>
        <text
          x="80"
          y="154"
          className="o-font-mono"
          fontSize="11"
          fill="currentColor"
          fillOpacity="0.6"
        >
          Reze 44400 — bailleur
        </text>

        {[190, 218, 246, 274].map((y, i) => (
          <g key={y}>
            <line
              x1="80"
              y1={y}
              x2="314"
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.12"
            />
            <rect
              x="80"
              y={y - 14}
              width={[136, 190, 112, 164][i]}
              height="7"
              rx="3.5"
              fill="currentColor"
              fillOpacity="0.22"
            />
          </g>
        ))}

        <text
          x="80"
          y="322"
          className="o-font-mono"
          fontSize="11"
          letterSpacing="1.4"
          fill="currentColor"
          fillOpacity="0.6"
        >
          DU AU 12/04
        </text>
        <text
          x="80"
          y="360"
          className="o-font-mono o-tabular-nums"
          fontSize="30"
          fill="currentColor"
        >
          4 924,10
        </text>

        <rect
          x="80"
          y="384"
          width="234"
          height="8"
          rx="4"
          fill="currentColor"
          fillOpacity="0.12"
        />
        <rect x="80" y="384" width="142" height="8" rx="4" fill={accent(500)} />
        <text
          x="314"
          y="378"
          textAnchor="end"
          className="o-font-mono"
          fontSize="10.5"
          fill="currentColor"
          fillOpacity="0.6"
        >
          relance ferme
        </text>
      </g>
    </svg>
  )
}

/* ------------------------------------------------------------------------ */
/*                          Le mecanisme : la fiche                         */
/* ------------------------------------------------------------------------ */

/** La borne basse du curseur du jour : le 1er mars 2026. */
const JOUR_MIN = 59

/** La borne haute : le 30 juin 2026. */
const JOUR_MAX = 180

/** Le jour ou le carnet s ouvre : le 12 avril 2026. */
const JOUR_DEPART = 101

/** Le carnet : la liste des clients, la fiche, et la relance calculee. */
function Carnet(): ReactElement {
  const [jour, setJour] = useState(JOUR_DEPART)
  const [choisi, setChoisi] = useState('belleville')

  // Les crochets d abord, sans condition : la liste se recalcule au seul
  // changement du jour, et le choix du client ne la refait pas.
  const lignes = useMemo(
    () =>
      CLIENTS.map((c) => {
        const e = etatDe(c, jour)
        return {
          id: c.id,
          label: c.nom,
          hint:
            e.retard < 0
              ? `echeance dans ${String(-e.retard)} j`
              : `retard ${String(e.retard)} j — ${euros(e.du)}`,
        }
      }),
    [jour],
  )

  const client = CLIENTS.find((c) => c.id === choisi) ?? CLIENTS[0]
  if (client === undefined) return <></>

  const etat = etatDe(client, jour)
  const palier = PALIERS.find((p) => p.rang === etat.palier)

  const ecritures = [...client.historique].sort((a, b) => a.jour - b.jour)
  const enRetard = CLIENTS.filter((c) => jour - c.echeance >= 0)
  const totalDu = enRetard.reduce((somme, c) => somme + etatDe(c, jour).du, 0)

  return (
    <div className="o-grid o-gap-8 lg:o-grid-cols-12 lg:o-gap-10">
      {/* ----- La colonne de gauche : le jour, puis les clients ------------ */}
      <div className="o-min-w-0 lg:o-col-span-4">
        <div
          className="o-rounded-2xl o-p-5"
          style={{ border: `1px solid ${FILET}`, backgroundColor: VOILE }}
        >
          <label
            htmlFor="carnet-jour"
            className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400"
          >
            Le carnet est ouvert au
          </label>
          <output
            htmlFor="carnet-jour"
            className="o-mt-2 o-block o-font-mono o-tabular-nums"
            style={{ fontSize: 'clamp(1.75rem, 3.4vw, 2.5rem)', color: ENCRE }}
          >
            {dateDe(jour)}
          </output>
          <input
            id="carnet-jour"
            type="range"
            min={JOUR_MIN}
            max={JOUR_MAX}
            step={1}
            value={jour}
            onChange={(evenement) => {
              setJour(Number(evenement.target.value))
            }}
            className="o-mt-4 o-w-full o-cursor-pointer focus:o-ring"
            style={{ accentColor: accent(500) }}
          />
          <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
            {enRetard.length === 0
              ? 'Aucune facture echue a cette date.'
              : `${String(enRetard.length)} facture${enRetard.length > 1 ? 's' : ''} echue${enRetard.length > 1 ? 's' : ''} — ${euros(totalDu)} a reclamer.`}
          </p>
        </div>

        <p className="o-mt-8 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          Les clients ouverts
        </p>
        <div className="o-mt-3">
          <AnimatedList
            items={lignes}
            label="Les clients du carnet"
            value={choisi}
            onChange={setChoisi}
            fade={false}
          />
        </div>

        <ol
          className="o-m-0 o-mt-8 o-list-none o-border-t o-p-0"
          style={{ borderColor: FILET }}
        >
          {PALIERS.map((p) => (
            <li
              key={p.rang}
              className="o-grid o-grid-cols-12 o-items-baseline o-gap-3 o-border-b o-py-3"
              style={{ borderColor: FILET }}
            >
              <span
                aria-hidden="true"
                className="o-col-span-3 o-font-mono o-text-xs o-tabular-nums o-tracking-widest"
                style={{ color: etat.palier === p.rang ? ENCRE : 'var(--o-theme-muted)' }}
              >
                J+{p.depuis}
              </span>
              <span
                className="o-col-span-9 o-text-sm"
                style={{
                  opacity: etat.palier === p.rang ? 1 : 0.55,
                  fontWeight: etat.palier === p.rang ? 600 : 400,
                }}
              >
                {p.nom}
              </span>
            </li>
          ))}
        </ol>
        <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
          L echelle est la meme pour tous : ce qui change, c est le taux, et le droit de
          reclamer les quarante euros.
        </p>
      </div>

      {/* ----- La fiche, et ce qui en decoule ------------------------------ */}
      <div className="o-min-w-0 lg:o-col-span-8">
        <article
          className="o-rounded-2xl o-overflow-hidden"
          style={{ border: `1px solid ${FILET}` }}
        >
          <header
            className="o-flex o-flex-wrap o-items-baseline o-gap-x-4 o-gap-y-1 o-px-6 o-py-5"
            style={{ borderBottom: `1px solid ${FILET}`, backgroundColor: VOILE }}
          >
            <h3 className="o-m-0 o-text-xl o-font-semibold o-tracking-tight">
              {client.nom}
            </h3>
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
              {client.lieu}
            </p>
            <p
              className="o-m-0 o-ml-auto o-font-mono o-text-xs o-uppercase o-tracking-widest"
              style={{ color: ENCRE }}
            >
              {client.genre === 'professionnel' ? 'Professionnel' : 'Particulier'}
            </p>
          </header>

          <div className="o-px-6 o-py-6">
            <p className="o-m-0 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
              Chantier — {client.chantier}
            </p>

            {/* L historique : la seule chose qu un artisan veut voir d abord. */}
            <ol className="o-m-0 o-mt-6 o-list-none o-p-0">
              {ecritures.map((ecriture) => {
                const passee = ecriture.jour <= jour
                return (
                  <li
                    key={`${String(ecriture.jour)}-${ecriture.quoi}`}
                    className="o-grid o-grid-cols-12 o-items-baseline o-gap-3 o-border-t o-py-2.5"
                    style={{ borderColor: FILET, opacity: passee ? 1 : 0.4 }}
                  >
                    <span className="o-col-span-4 o-font-mono o-text-xs o-tabular-nums o-text-zinc-600 dark:o-text-zinc-400 sm:o-col-span-3">
                      {dateDe(ecriture.jour)}
                    </span>
                    <span className="o-col-span-8 o-text-sm sm:o-col-span-6">
                      {ecriture.quoi}
                      {ecriture.ouverte === true && (
                        <span
                          className="o-ml-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                          style={{ color: ENCRE }}
                        >
                          ouverte
                        </span>
                      )}
                    </span>
                    <span className="o-col-span-12 o-font-mono o-text-xs o-tabular-nums sm:o-col-span-3 sm:o-text-right">
                      {ecriture.montant === undefined ? '' : euros(ecriture.montant)}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* ----- La relance, calculee ------------------------------------- */}
          <div
            className="o-px-6 o-py-6"
            style={{ borderTop: `1px solid ${FILET}`, backgroundColor: VOILE }}
          >
            <div className="o-flex o-flex-wrap o-items-center o-gap-3">
              <Icon icon={Scale} size={16} style={{ color: ENCRE }} aria-hidden="true" />
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                Ce que le carnet ferait aujourd hui
              </p>
              <p
                className="o-m-0 o-ml-auto o-font-mono o-text-xs o-uppercase o-tracking-widest"
                style={{ color: ENCRE }}
              >
                {palier === undefined ? 'Rien a faire' : palier.nom}
              </p>
            </div>

            <dl className="o-m-0 o-mt-5 o-grid o-grid-cols-2 o-gap-x-6 o-gap-y-4 sm:o-grid-cols-4">
              {(
                [
                  [
                    'Retard',
                    etat.retard < 0
                      ? `${String(-etat.retard)} j avant`
                      : `${String(etat.retard)} j`,
                  ],
                  ['Principal', euros(client.montant)],
                  [
                    etat.forfait > 0 ? 'Interets + 40 EUR' : 'Interets',
                    euros(etat.interets + etat.forfait),
                  ],
                  ['Reclamable', euros(etat.du)],
                ] as const
              ).map(([quoi, valeur], rang) => (
                <div key={quoi}>
                  <dt className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    {quoi}
                  </dt>
                  <dd
                    className="o-m-0 o-mt-1 o-font-mono o-text-lg o-tabular-nums o-tracking-tight"
                    style={rang === 3 ? { color: ENCRE } : undefined}
                  >
                    {valeur}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="o-m-0 o-mt-5 o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
              {client.genre === 'professionnel'
                ? `Taux de ${(TAUX_PRO * 100).toFixed(2).replace('.', ',')} % l an — taux de la Banque centrale au 1er janvier 2026, majore de dix points — et quarante euros d indemnite forfaitaire de recouvrement, dus des le premier jour de retard.`
                : `Taux d interet legal de ${(TAUX_PARTICULIER * 100).toFixed(2).replace('.', ',')} % l an. Ni majoration de dix points ni indemnite forfaitaire : elles ne valent qu entre professionnels, et les reclamer ici exposerait a la nullite de la clause.`}
            </p>

            <blockquote
              aria-live="polite"
              className="o-m-0 o-mt-5 o-rounded-xl o-p-5 o-font-mono o-text-xs o-leading-relaxed"
              style={{
                border: `1px solid ${FILET}`,
                backgroundColor: 'var(--o-theme-bg)',
              }}
            >
              {message(client, etat, jour)}
            </blockquote>

            {palier !== undefined && (
              <p className="o-m-0 o-mt-4 o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                {palier.geste}
              </p>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                                 La page                                  */
/* ------------------------------------------------------------------------ */

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('manrope')

  return (
    <Porte forme="trou" marque="Carnet" sombre={false}>
      <div
        className="o-bg-stone-50 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-100"
        style={polices}
      >
        <BarreFilet
          marque="Carnet"
          liens={LIENS.slice(0, 4)}
          action={['#essai', 'Essayer']}
          sombre={false}
        />

        <main>
          {/* =============== L affiche produit ============================== */}
          <section
            id="sommet"
            aria-label="Ouverture"
            className="o-relative o-isolate o-overflow-hidden o-px-6 o-pb-20 o-pt-16 md:o-px-8 md:o-pb-28 md:o-pt-24"
          >
            <GraphPaper
              className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
              size={12}
              strength={0.13}
              color={accent(600)}
              background="transparent"
            />
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-0 o-z-0 o-h-32"
              style={{
                background: 'linear-gradient(to bottom, transparent, var(--o-theme-bg))',
              }}
            />

            <div className="o-relative o-z-10 o-mx-auto o-grid o-max-w-7xl o-items-center o-gap-12 lg:o-grid-cols-12">
              <div className="o-min-w-0 lg:o-col-span-7">
                <Surgit delai={60}>
                  <Etiquette sombre={false}>Carnet — version 4, avril 2026</Etiquette>
                </Surgit>
                <TitreVague
                  delai={140}
                  cadence={70}
                  className="o-mt-7 o-text-zinc-950 dark:o-text-zinc-50"
                  style={affiche('l', 300)}
                >
                  Le carnet de l artisan.
                </TitreVague>
                <Surgit
                  delai={520}
                  as="p"
                  className="o-mt-7 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
                >
                  Un client, un chantier, une facture. Et le jour ou elle n est pas payee,
                  le decompte exact de ce que vous pouvez reclamer — au bon taux, selon
                  que le client est une entreprise ou non.
                </Surgit>
                <Surgit
                  delai={580}
                  as="p"
                  className="o-mt-4 o-max-w-md o-text-sm o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400"
                >
                  Ecrit pour les entreprises de un a douze compagnons, qui n ont ni
                  service comptable ni juriste.
                </Surgit>
                <Surgit delai={640} className="o-mt-9">
                  <Actions
                    pleine={['#essai', 'Ouvrir un carnet']}
                    fantome={['#fiche', 'Voir une fiche']}
                    sombre={false}
                  />
                </Surgit>
              </div>

              <div className="o-min-w-0 o-flex o-justify-center lg:o-col-span-5 lg:o-justify-end">
                <Surgit
                  delai={340}
                  distance={38}
                  className="o-w-full o-flex o-justify-center lg:o-justify-end"
                >
                  <FicheDessinee />
                </Surgit>
              </div>
            </div>

            <Coin position="bg" sombre={false}>
              Nantes · 44
              <br />
              Plomberie, chauffage, sanitaire
            </Coin>
            <Coin position="bd" sombre={false}>
              19 EUR par mois
              <br />
              Par artisan, sans palier
            </Coin>
          </section>

          {/* =============== Le ruban des preuves ==========================
              Pas de barre de compteurs : la forme de chiffres de cette page est
              le graphique au trait de la Figure 02, et une barre de quatre
              nombres la doublerait pour rien. */}
          {/* Le bandeau est enferme : sous mouvement reduit, la piste du
              defilement perd son `overflow`, et sept mentions debordent la
              page de cinq cents pixels. */}
          <div className="o-overflow-hidden">
            <BandeauMentions
              mentions={[
                'Trente jours d essai',
                'Sans carte bancaire',
                'Donnees hebergees en France',
                'Export en un fichier',
                'Relances au bon taux legal',
                'Assistance au telephone',
                'Sans engagement',
              ]}
              mono
              vitesse={58}
            />
          </div>

          {/* =============== (01) Le mecanisme : la fiche client ============ */}
          <section
            id="fiche"
            aria-labelledby="fiche-titre"
            className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-20 md:o-px-8 md:o-py-28"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Titre indice="(01) — La fiche" id="fiche-titre">
                    Deplacez le jour. Tout le reste suit.
                  </Titre>
                </div>
                <p className="o-m-0 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-col-span-5">
                  Cinq clients reels d un carnet de plombier nantais, avec leur
                  historique. Le curseur porte la date : les retards courent, les paliers
                  de relance se franchissent, et le texte du message change avec eux.
                </p>
              </div>

              <div className="o-mt-14">
                <Carnet />
              </div>
            </div>
          </section>

          {/* =============== Figure 01 : la vie d un chantier ===============
              Entre le mecanisme et la bande sombre, une figure dessinee : elle
              montre le trou de tresorerie que la fiche, seule, ne dit pas. */}
          <section
            id="chantier"
            aria-labelledby="chantier-titre"
            className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-3">
                <p
                  className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: ENCRE }}
                >
                  Figure 01
                </p>
                <h2
                  id="chantier-titre"
                  className="o-m-0 o-mt-5 o-text-balance o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)',
                  }}
                >
                  Cent vingt-huit jours.
                </h2>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  Du devis remis a l argent recu, un chantier moyen du carnet dure quatre
                  mois. L acompte couvre trente pour cent ; le reste est avance par l
                  artisan.
                </p>
                <p className="o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  La surface teintee est cette avance. C est elle, et pas le chiffre d
                  affaires, qui decide si une entreprise de six personnes passe l hiver.
                </p>
              </div>

              <figure className="o-m-0 o-min-w-0 lg:o-col-span-9">
                <div className="o-overflow-x-auto o-pb-2" style={{ overflowY: 'hidden' }}>
                  <FigureChantier />
                </div>
                <ol className="o-sr-only">
                  {STATIONS.map((station) => (
                    <li key={station.nom}>
                      {station.nom} — {station.quand},{' '}
                      {String(Math.round(station.part * 100))} pour cent encaisse.
                    </li>
                  ))}
                </ol>
                <figcaption
                  className="o-mt-6 o-border-t o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400"
                  style={{ borderColor: FILET }}
                >
                  Figure 01 — les sept stations d un chantier type, et la part encaissee
                  sous chacune. La relance s accroche entre l echeance et l encaissement.
                </figcaption>
              </figure>
            </div>
          </section>

          {/* =============== La coupe sombre : Figure 02 ====================
              Une bande toujours sombre au milieu de la page claire, et rien
              dedans qu un graphique au trait qui se remplit a l entree. */}
          <section
            id="retard"
            aria-labelledby="retard-titre"
            className="o-scroll-mt-24 o-relative o-isolate o-overflow-hidden o-px-6 o-py-24 o-text-zinc-50 md:o-px-8 md:o-py-32"
            style={nuit('stone')}
          >
            <Grain opacite={0.05} />
            <div className="o-relative o-z-20 o-mx-auto o-grid o-max-w-7xl o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-3">
                <p
                  className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: ENCRE_NUIT }}
                >
                  Figure 02
                </p>
                <h2
                  id="retard-titre"
                  className="o-m-0 o-mt-5 o-text-balance o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)',
                  }}
                >
                  Relancer tot, ou ne pas relancer.
                </h2>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-zinc-400">
                  La derniere barre remonte, et c est le seul enseignement de la figure.
                  Le tribunal ne raccourcit rien : il fait entrer le dossier dans un
                  calendrier qui n est plus le votre.
                </p>
                <p className="o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-400">
                  Le rappel envoye deux jours apres l echeance, lui, retire vingt-sept
                  jours de delai moyen. Il tient en trois lignes, et personne ne le tape.
                </p>
              </div>

              <figure className="o-m-0 o-min-w-0 lg:o-col-span-9">
                <div className="o-overflow-x-auto o-pb-2" style={{ overflowY: 'hidden' }}>
                  <FigureDelais />
                </div>
                <ul className="o-sr-only">
                  {DELAIS.map((barre) => (
                    <li key={barre.quoi}>
                      {barre.quoi} — {String(barre.jours)} jours de delai moyen,{' '}
                      {barre.part}.
                    </li>
                  ))}
                </ul>
                <figcaption className="o-mt-6 o-border-t o-border-white-10 o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-400">
                  Figure 02 — delai moyen entre l emission et l encaissement, par palier
                  de relance atteint. Mille deux cent quarante factures du carnet,
                  exercice 2025.
                </figcaption>
              </figure>
            </div>
          </section>

          {/* =============== L empilement : ce que le carnet remplace ======= */}
          <section
            id="remplace"
            aria-labelledby="remplace-titre"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-5xl">
              <Titre indice="(02) — Ce qu il remplace" id="remplace-titre">
                Quatre objets, et pourquoi ils ne suffisent plus.
              </Titre>

              <div className="o-mt-14">
                <StickyStack offset={140} gap={22} shrink={0.06}>
                  {PILE.map((carte) => (
                    <article
                      key={carte.rang}
                      className="o-rounded-2xl o-p-8 md:o-p-12"
                      style={{
                        border: `1px solid ${FILET}`,
                        backgroundColor: 'var(--o-theme-bg)',
                      }}
                    >
                      <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-center">
                        <div className="o-min-w-0 md:o-col-span-4">
                          <ObjetPile nom={carte.objet} />
                        </div>
                        <div className="o-min-w-0 md:o-col-span-8">
                          <p
                            className="o-m-0 o-font-mono o-text-xs o-tabular-nums o-tracking-widest"
                            style={{ color: ENCRE }}
                          >
                            {carte.rang}
                          </p>
                          <h3 className="o-m-0 o-mt-3 o-text-balance o-text-2xl o-font-semibold o-tracking-tight md:o-text-3xl">
                            {carte.titre}
                          </h3>
                          <p className="o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                            {carte.texte}
                          </p>
                          <p
                            className="o-mt-4 o-border-t o-pt-4 o-font-mono o-text-xs o-leading-relaxed"
                            style={{ borderColor: FILET, color: ENCRE }}
                          >
                            {carte.note}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </StickyStack>
              </div>
            </div>
          </section>

          {/* =============== Le prix, en une ligne ========================== */}
          <section
            aria-labelledby="prix-titre"
            className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-16 md:o-px-8"
          >
            <div className="o-mx-auto o-flex o-max-w-7xl o-flex-wrap o-items-baseline o-gap-x-8 o-gap-y-3">
              <h2
                id="prix-titre"
                className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
              >
                Le prix
              </h2>
              <p
                className="o-m-0 o-tabular-nums o-tracking-tighter"
                style={{ ...affiche('m', 300), fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
              >
                19 EUR
              </p>
              <p className="o-m-0 o-max-w-md o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                par mois et par artisan, tout compris. Pas de palier, pas de licence a l
                annee, pas de supplement pour les relances. On arrete quand on veut, et le
                carnet s exporte en un fichier.
              </p>
            </div>
          </section>

          {/* =============== Une phrase, un ecran =========================== */}
          <section
            aria-labelledby="promesse-titre"
            className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-32 md:o-px-8 md:o-py-44"
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 md:o-grid-cols-12">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-3">
                La promesse
              </p>
              <div className="md:o-col-span-9">
                <h2 id="promesse-titre" className="o-sr-only">
                  La promesse du carnet
                </h2>
                <Manifeste
                  sombre={false}
                  eteint="Un logiciel de gestion vous demande d entrer votre metier dans ses cases."
                >
                  Celui-ci tient un carnet, comme le votre, et sait seulement compter les
                  jours a votre place.
                </Manifeste>
              </div>
            </div>
          </section>

          {/* =============== A16 : le champ et le bouton, un seul filet ===== */}
          <section
            id="essai"
            aria-labelledby="essai-titre"
            className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-8 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-3xl o-text-center">
              <h2
                id="essai-titre"
                className="o-m-0 o-text-balance o-text-zinc-950 dark:o-text-zinc-50"
                style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.4vw, 3.75rem)' }}
              >
                Un carnet vide vous attend.
              </h2>
              <p className="o-mx-auto o-mt-5 o-max-w-md o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                Trente jours, sans carte bancaire. Vous reprenez vos clients depuis un
                fichier, ou vous les tapez au fil des chantiers.
              </p>

              <form
                className="o-mx-auto o-mt-10 o-flex o-max-w-xl o-items-center o-gap-2 o-rounded-full o-p-1.5"
                style={{
                  border: `1px solid ${FILET}`,
                  backgroundColor: 'var(--o-theme-bg)',
                }}
                onSubmit={(evenement) => {
                  evenement.preventDefault()
                }}
              >
                <label htmlFor="essai-courriel" className="o-sr-only">
                  Votre adresse de courriel
                </label>
                <input
                  id="essai-courriel"
                  name="essai-courriel"
                  type="email"
                  placeholder="vous@votre-entreprise.fr"
                  className="o-min-w-0 o-grow o-bg-transparent o-px-4 o-py-2.5 o-text-sm focus:o-ring"
                  style={{ border: 'none' }}
                />
                <button
                  type="submit"
                  className="o-inline-flex o-shrink-0 o-cursor-pointer o-items-center o-gap-2 o-rounded-full o-px-5 o-py-2.5 o-text-sm o-font-semibold o-transition-opacity hover:o-opacity-85 focus:o-ring"
                  style={{ ...aplat(), border: 'none' }}
                >
                  Ouvrir
                  <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                </button>
              </form>

              <p className="o-mt-10 o-flex o-flex-wrap o-items-center o-justify-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                <Icon
                  icon={NotebookPen}
                  size={14}
                  style={{ color: ENCRE }}
                  aria-hidden="true"
                />
                Ecrit a Nantes, pour des entreprises de un a douze compagnons
              </p>
            </div>
          </section>
        </main>

        {/* =============== P18 : l ours, en trois colonnes de chasse fixe === */}
        <footer className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-pb-10 o-pt-14 md:o-px-8">
          <div className="o-mx-auto o-max-w-7xl">
            <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Ours
              </p>
              <span style={{ color: ENCRE }}>
                <HandWritten width={190} thickness={4.4}>
                  Carnet
                </HandWritten>
              </span>
            </div>

            <div
              className="o-mt-8 o-grid o-gap-8 o-border-t o-pt-8 md:o-grid-cols-3"
              style={{ borderColor: FILET }}
            >
              {(
                [
                  [
                    'La redaction',
                    'Carnet est ecrit par quatre personnes a Nantes. Direction de la publication : Claire Vasseur. Conception : Tom Bridier, Nadia Lempereur. Documentation et assistance : Come Arsac, du lundi au vendredi, de huit heures a dix-huit heures, au numero du contrat.',
                  ],
                  [
                    'La fabrication',
                    'Serveurs a Gravelines et a Roubaix, sur une infrastructure francaise. Sauvegarde chiffree toutes les heures, conservee trente-cinq jours. Aucune donnee n est transmise a un tiers, aucun traceur publicitaire n est pose. Les exports sont au format ouvert.',
                  ],
                  [
                    'Le depot legal',
                    'Carnet SAS, capital de 42 000 EUR, RCS Nantes 908 214 337, siege au 14 quai de la Fosse, 44000 Nantes. TVA FR 41 908214337. Hebergeur : OVH SAS, 2 rue Kellermann, 59100 Roubaix. Accessibilite : partiellement conforme, declaration au 2 fevrier 2026.',
                  ],
                ] as const
              ).map(([titre, texte]) => (
                <div key={titre}>
                  <h2
                    className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: ENCRE }}
                  >
                    {titre}
                  </h2>
                  <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                    {texte}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="o-mt-10 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
              style={{ borderColor: FILET }}
            >
              <span className="o-inline-flex o-items-center o-gap-2">
                <Icon icon={Receipt} size={13} aria-hidden="true" />
                Numero 4 — avril 2026
              </span>
              <nav
                aria-label="Mentions"
                className="o-flex o-flex-wrap o-gap-x-6 o-gap-y-2"
              >
                {(
                  [
                    ['#fiche', 'Mentions legales'],
                    ['#fiche', 'Donnees personnelles'],
                    ['#fiche', 'Conditions'],
                    ['#retard', 'Sources des chiffres'],
                  ] as const
                ).map(([cible, mot]) => (
                  <a
                    key={mot}
                    href={cible}
                    className="o-no-underline o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-100 o-transition-colors focus:o-ring"
                  >
                    {mot}
                  </a>
                ))}
              </nav>
              <span>© 2026 Carnet SAS</span>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
