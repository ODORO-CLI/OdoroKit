/**
 * Palier — banque en ligne.
 *
 * ## Le parti pris : le tableau de bord
 *
 * Une banque se juge sur ce qu elle montre. La page ne commence donc pas par
 * une promesse mais par un compte : sous une barre fine, un panneau dense
 * occupe la moitie haute de l ecran — le solde, la mise de cote des douze
 * derniers mois, les operations recentes, la carte, et quatre signaux. Le texte
 * de presentation, lui, se range a cote, dans une colonne etroite, avec un seul
 * lien.
 *
 * Les valeurs y sont en chasse fixe et alignees a droite, les bordures sont
 * marquees plutot que suggerees : un releve se lit en colonne, pas en carte
 * ombree.
 *
 * ## Ce que la page fait, et pas seulement ce qu elle dit
 *
 * Trois mecanismes portent le metier plutot que de le mimer :
 *
 * 1. le panneau **change de mois** — trois releves complets, chacun avec son
 *    solde, ses operations et sa courbe de mise de cote ;
 * 2. un **simulateur d epargne** calcule les interets composes du livret, et
 *    montre ce que la fiscalite en retire ;
 * 3. l ouverture de compte **change de pieces demandees** selon le profil :
 *    un particulier, un independant et une societe ne fournissent pas la meme
 *    chose, et le delai n est pas le meme non plus.
 *
 * S y ajoute ce qu une banque doit ecrire : la grille tarifaire ligne a ligne,
 * frais de change et decouvert compris, et le detail de la garantie des depots.
 *
 * ## La couleur
 *
 * Aucune teinte n est ecrite en dur. L accent vient de `--o-vitrine-*`, pose
 * par la barre au-dessus de la page : la meme banque se relit en emeraude, en
 * encre ou en lime sans qu une seule ligne change. Les neutres, eux, restent
 * des paires de theme.
 *
 * ## Le fond
 *
 * Aucun fond anime derriere le texte : une banque qui clignote inquiete, et le
 * heros porte desormais des chiffres qu il faut pouvoir lire. Les vagues de
 * degrade sont descendues en pied de page, ou elles ne forment qu un bandeau
 * decoratif de quelques centimetres, sans un mot pose dessus.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeEuro,
  Check,
  CreditCard,
  Fingerprint,
  IdCard,
  Landmark,
  Lock,
  ScrollText,
  ShieldCheck,
  Smartphone,
} from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import { Input, Slider } from '@odoro-cli/libs/ui'
import { useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { Aurora } from '@/odoro/background/Aurora.jsx'
import { FeatureTabs } from '@/odoro/section/FeatureTabs.jsx'
import { PricingTiers } from '@/odoro/section/PricingTiers.jsx'
import { CountUp } from '@/odoro/text/CountUp.jsx'
import { CounterRoll } from '@/odoro/text/CounterRoll.jsx'
import { TiltCard } from '@/odoro/ui/TiltCard.jsx'

import { nuit } from './communs.jsx'
import { photo } from './media.js'
import { accent, accentDoux, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreFilet,
  Chiffres,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Manifeste,
  Numerotee,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Chapitre, Flotte, ZoomDefile } from './scene.jsx'

/** Filet tire de l encre courante : le systeme n a pas de classe pour cela. */
const FILET = 'color-mix(in oklab, currentColor 14%, transparent)'

/**
 * L accent, pousse vers l encre du theme.
 *
 * Une nuance seule ne peut pas servir de texte dans les deux themes : celle qui
 * passe sur blanc est trop sombre sur noir, et l inverse. Melanger l accent a
 * `--o-theme-fg` fonce la teinte en theme clair et l eclaircit en theme sombre,
 * d une seule ecriture — et le resultat tient au-dessus de 5:1 pour les quinze
 * palettes offertes, ce qui est la condition pour qu une vitrine soit un
 * modele et non une seule couleur.
 *
 * @param part Part de l accent conservee. Au-dela de 56 %, reserve au grand
 *   corps ou aux aplats. A 44 %, le resultat tient au-dessus de 4,5:1 meme
 *   pour un accent choisi blanc ou noir.
 */
function encre(part = 44): string {
  return `color-mix(in oklab, ${accent(500)} ${String(part)}%, var(--o-theme-fg))`
}

/** Un aplat d accent dont l encre est le fond du theme : il s inverse seul. */
const APLAT: CSSProperties = { backgroundColor: encre(), color: 'var(--o-theme-bg)' }

/**
 * Le registre sombre, epingle pour la section « Securite ».
 *
 * Cette section est noire dans les deux themes. Sans redeclarer les variables
 * de theme, `encre()` y foncerait l accent en theme clair — sur un fond noir.
 */
const NUIT = {
  colorScheme: 'dark',
  '--o-theme-bg': 'var(--o-palette-zinc-950)',
  '--o-theme-surface': 'var(--o-palette-zinc-900)',
  '--o-theme-fg': 'var(--o-palette-zinc-50)',
  '--o-theme-muted': 'var(--o-palette-zinc-400)',
  '--o-theme-line': 'var(--o-palette-zinc-800)',
} as CSSProperties

/** Les liens de la barre fine. */
const NAVIGATION = [
  ['#compte', 'Le compte'],
  ['#epargne', 'Epargne'],
  ['#securite', 'Securite'],
  ['#tarifs', 'Tarifs'],
] as const

/**
 * La mise de cote, mois par mois, sur quatorze mois.
 *
 * Le panneau n en montre que douze : chaque releve consulte glisse d un cran
 * dans cette serie, ce qui donne trois courbes differentes sans trois tables.
 */
const SERIE_MISE_DE_COTE = [
  ['J', 260],
  ['A', 220],
  ['S', 180],
  ['O', 180],
  ['N', 240],
  ['D', 90],
  ['J', 310],
  ['F', 260],
  ['M', 400],
  ['A', 350],
  ['M', 420],
  ['J', 300],
  ['J', 180],
  ['A', 380],
  ['S', 400],
] as const

/**
 * Les trois releves consultables.
 *
 * Un compte n existe pas au present seul : c est en changeant de mois qu on
 * voit ce que la banque range, ce qu elle a preleve et ce qu elle a mis de
 * cote. Chaque releve porte donc ses propres operations, son solde et sa fin
 * de serie.
 */
const RELEVES = [
  {
    cle: 'juillet',
    court: 'Juillet',
    libelle: 'Juillet 2026',
    fin: 13,
    solde: '3 918,04 €',
    variation: '− 214,90 € sur trente jours',
    hausse: false,
    misDeCote: '2 930 €',
    operations: [
      {
        jour: '31/07',
        libelle: 'Virement recu — SALAIRE JUIL.',
        categorie: 'Revenus',
        montant: 2410,
      },
      {
        jour: '28/07',
        libelle: 'Location de voiture — Faro',
        categorie: 'Voyages',
        montant: -286.4,
      },
      {
        jour: '22/07',
        libelle: 'Mise de cote automatique',
        categorie: 'Livret Palier',
        montant: -180,
      },
      {
        jour: '18/07',
        libelle: 'Change EUR vers GBP — taux du jour',
        categorie: 'Voyages',
        montant: -240,
      },
      {
        jour: '11/07',
        libelle: 'Assurance habitation — prelevement',
        categorie: 'Logement',
        montant: -31.9,
      },
      {
        jour: '05/07',
        libelle: 'Loyer — virement programme',
        categorie: 'Logement',
        montant: -740,
      },
    ],
  },
  {
    cle: 'aout',
    court: 'Aout',
    libelle: 'Aout 2026',
    fin: 14,
    solde: '4 240,11 €',
    variation: '+ 322,07 € sur trente jours',
    hausse: true,
    misDeCote: '3 110 €',
    operations: [
      {
        jour: '31/08',
        libelle: 'Virement recu — SALAIRE AOUT',
        categorie: 'Revenus',
        montant: 2410,
      },
      {
        jour: '27/08',
        libelle: 'Mise de cote automatique',
        categorie: 'Livret Palier',
        montant: -380,
      },
      {
        jour: '19/08',
        libelle: 'Retrait a Seville — sans commission',
        categorie: 'Voyages',
        montant: -150,
      },
      {
        jour: '14/08',
        libelle: 'Interets du livret — juillet',
        categorie: 'Livret Palier',
        montant: 7.81,
      },
      {
        jour: '09/08',
        libelle: 'Peage et carburant — A63',
        categorie: 'Transports',
        montant: -78.2,
      },
      {
        jour: '05/08',
        libelle: 'Loyer — virement programme',
        categorie: 'Logement',
        montant: -740,
      },
    ],
  },
  {
    cle: 'septembre',
    court: 'Septembre',
    libelle: 'Septembre 2026',
    fin: 15,
    solde: '4 812,60 €',
    variation: '+ 1 130,61 € sur trente jours',
    hausse: true,
    misDeCote: '3 510 €',
    operations: [
      {
        jour: '09/09',
        libelle: 'Virement recu — SALAIRE SEPT.',
        categorie: 'Revenus',
        montant: 2410,
      },
      {
        jour: '08/09',
        libelle: 'Mise de cote automatique',
        categorie: 'Livret Palier',
        montant: -400,
      },
      {
        jour: '08/09',
        libelle: 'Boulangerie Grangier',
        categorie: 'Courses',
        montant: -8.4,
      },
      {
        jour: '07/09',
        libelle: 'Abonnement musique — annule',
        categorie: 'Abonnements',
        montant: -10.99,
      },
      {
        jour: '06/09',
        libelle: 'Retrait a Lisbonne — sans commission',
        categorie: 'Voyages',
        montant: -120,
      },
      {
        jour: '05/09',
        libelle: 'Loyer — virement programme',
        categorie: 'Logement',
        montant: -740,
      },
    ],
  },
] as const

/** Les quatre signaux du panneau : ce que la maison prouve d un coup d oeil. */
const SIGNAUX = [
  { valeur: 412000, suffixe: '', libelle: 'comptes ouverts', decimales: 0 },
  { valeur: 1.9, suffixe: ' Md€', libelle: 'd encours confies', decimales: 1 },
  { valeur: 99.98, suffixe: ' %', libelle: 'de disponibilite', decimales: 2 },
  { valeur: 4, suffixe: ' min', libelle: 'pour ouvrir', decimales: 0 },
] as const

/** Ce que la securite recouvre, sans jargon. */
const GARANTIES = [
  {
    icone: Landmark,
    titre: 'Depots garantis 100 000 €',
    texte:
      'Palier est etablissement de credit agree, et vos depots sont couverts par le Fonds de garantie des depots et de resolution.',
  },
  {
    icone: Fingerprint,
    titre: 'Validation par empreinte',
    texte:
      'Chaque paiement en ligne est confirme dans l application, jamais par un code recu par message.',
  },
  {
    icone: Lock,
    titre: 'Carte bloquee en un geste',
    texte:
      'Un interrupteur gele la carte immediatement, et la reactive sans avoir a en commander une autre.',
  },
  {
    icone: ShieldCheck,
    titre: 'Aucune revente de donnees',
    texte:
      'Les operations ne sortent pas de la banque : notre modele est l abonnement, pas la publicite.',
  },
] as const

/**
 * Le detail de la garantie des depots.
 *
 * C est la question que pose tout visiteur d une banque en ligne, et celle a
 * laquelle la plupart repondent par un logo. Un tableau vaut mieux.
 */
const GARANTIE_DEPOTS = [
  ['Organisme', 'Fonds de garantie des depots et de resolution (FGDR)'],
  ['Plafond', '100 000 € par deposant et par etablissement'],
  ['Assiette', 'Compte courant et Livret Palier cumules'],
  ['Delai d indemnisation', 'Sept jours ouvrables, sans demarche de votre part'],
  ['Agrement', 'ACPR n° 18422, etablissement de credit'],
  ['Authentification', 'Forte, au sens de la DSP2, sur chaque paiement en ligne'],
] as const

/** Ce qui n est pas couvert : le dire vaut mieux que le taire. */
const HORS_GARANTIE = [
  'La part des depots qui depasse cent mille euros par deposant.',
  'Les comptes ouverts au nom d une societe de plus de deux cent cinquante salaries.',
  'Un compte titres, que Palier ne propose pas.',
] as const

/** Les trois profils tarifaires. */
const OFFRES = [
  {
    name: 'Essentiel',
    monthly: 0,
    note: 'Pour un compte du quotidien.',
    features: [
      'Compte et IBAN francais',
      'Carte virtuelle illimitee',
      'Virements SEPA instantanes',
      'Deux retraits gratuits par mois',
    ],
    cta: 'Ouvrir un compte',
  },
  {
    name: 'Courant',
    monthly: 9,
    note: 'Pour qui voyage et paie en devises.',
    features: [
      'Tout Essentiel',
      'Carte metal, change sans commission',
      'Retraits illimites hors zone euro',
      'Assurance voyage et annulation',
      'Livret remunere a 3,2 %',
    ],
    cta: 'Passer a Courant',
    featured: true,
  },
  {
    name: 'Societe',
    monthly: 29,
    note: 'Pour une entreprise de moins de vingt salaries.',
    features: [
      'Tout Courant',
      'Cinq cartes collaborateurs',
      'Rapprochement comptable automatique',
      'Depot de cheques par courrier',
      'Conseiller nomme, joignable au telephone',
    ],
    cta: 'Ouvrir un compte pro',
  },
] as const

/**
 * La grille tarifaire, ligne a ligne.
 *
 * Les trois offres se comparent mal en liste d avantages : ce qui separe un
 * forfait a zero euro d un forfait a neuf, ce sont les frais qu on paie sans
 * les avoir choisis. Ils sont donc ecrits, y compris ceux qui font mal.
 */
const GRILLE = [
  {
    groupe: 'Ce que coute le forfait',
    lignes: [
      ['Cotisation mensuelle', '0 €', '9 €', '29 €'],
      ['Engagement', 'Aucun', 'Aucun', 'Aucun'],
      ['Frais de tenue de compte', '0 €', '0 €', '0 €'],
    ],
  },
  {
    groupe: 'A l etranger',
    lignes: [
      ['Commission de change', '1,7 %', '0 %', '0 %'],
      ['Retrait hors zone euro', '2 % + 1,50 €', 'Gratuit', 'Gratuit'],
      ['Paiement hors zone euro', '1,7 %', 'Gratuit', 'Gratuit'],
      ['Plafond de retrait sur 30 jours', '1 000 €', '3 000 €', '5 000 €'],
    ],
  },
  {
    groupe: 'Quand le compte passe dessous',
    lignes: [
      ['Decouvert autorise', 'Non propose', 'Jusqu a 1 000 €', 'Jusqu a 5 000 €'],
      ['Taux annuel effectif global', '—', '7,9 %', '6,4 %'],
      [
        'Commission d intervention',
        '8 €, plafond legal 80 € par mois',
        '8 €, plafond legal 80 € par mois',
        '8 €, plafond legal 80 € par mois',
      ],
      [
        'Rejet de prelevement',
        '20 €, plafond legal',
        '20 €, plafond legal',
        '20 €, plafond legal',
      ],
      ['Lettre d information pour compte debiteur', 'Gratuite', 'Gratuite', 'Gratuite'],
    ],
  },
  {
    groupe: 'Le reste',
    lignes: [
      ['Virement SEPA instantane', 'Gratuit', 'Gratuit', 'Gratuit'],
      ['Opposition sur carte', 'Gratuite', 'Gratuite', 'Gratuite'],
      ['Cloture du compte', 'Gratuite', 'Gratuite', 'Gratuite'],
      ['Releve papier, sur demande', '2 € par envoi', 'Gratuit', 'Gratuit'],
    ],
  },
] as const

/**
 * Les profils d ouverture, avec leurs pieces.
 *
 * Un particulier, un independant et une societe n ouvrent pas le meme compte :
 * ni les memes pieces, ni le meme delai, ni le meme premier versement. Le
 * choix du profil reecrit donc les trois.
 */
const PROFILS = [
  {
    cle: 'particulier',
    libelle: 'Particulier',
    offre: 'Essentiel ou Courant',
    delai: 'Compte utilisable en 4 minutes',
    versement: '10 € de premier versement',
    pieces: [
      'Une piece d identite en cours de validite, photographiee recto verso.',
      'Une video de trois secondes, pour la verification de vivacite.',
      'Votre numero fiscal, exige par l administration pour tout compte ouvert en France.',
    ],
    note: 'Aucun justificatif de domicile : nous le verifions aupres de l operateur de votre ligne mobile, avec votre accord.',
  },
  {
    cle: 'independant',
    libelle: 'Independant',
    offre: 'Courant, option professionnelle',
    delai: 'Compte utilisable en 1 jour ouvre',
    versement: '50 € de premier versement',
    pieces: [
      'Une piece d identite en cours de validite.',
      'Un avis de situation au repertoire Sirene de moins de trois mois.',
      'Votre numero fiscal et, le cas echeant, votre numero de TVA intracommunautaire.',
    ],
    note: 'Le compte professionnel est distinct du compte personnel : c est une obligation des l instant ou l activite est declaree.',
  },
  {
    cle: 'societe',
    libelle: 'Societe',
    offre: 'Societe',
    delai: 'Compte utilisable en 3 jours ouvres',
    versement: '250 € de premier versement',
    pieces: [
      'Un extrait Kbis de moins de trois mois.',
      'Les statuts a jour, signes.',
      'La piece d identite de chaque beneficiaire effectif detenant plus de 25 % du capital.',
      'La liste des beneficiaires effectifs, telle que deposee au greffe.',
    ],
    note: 'La verification des beneficiaires effectifs est imposee par la lutte contre le blanchiment : nous ne pouvons pas y deroger.',
  },
] as const

/** Ce que montre chaque onglet de l application. */
const ECRANS = [
  {
    title: 'Le solde a la seconde',
    body: 'Une operation apparait avant que le commercant ait rendu la carte. Le solde affiche est celui qui est disponible, pas celui de la veille.',
    hint: 'Ecran d accueil',
    graine: 'palier-ecran-solde',
    alt: 'Ecran de telephone affichant le solde du compte et les dernieres operations',
  },
  {
    title: 'Les categories, corrigees',
    body: 'Chaque depense est rangee automatiquement. Un glissement suffit a la reclasser, et la regle vaut pour les suivantes.',
    hint: 'Depenses',
    graine: 'palier-ecran-depenses',
    alt: 'Ecran de telephone affichant la repartition des depenses par categorie',
  },
  {
    title: 'Les virements programmes',
    body: 'Le loyer, l epargne, la part de chacun : les virements recurrents tiennent sur un ecran et se decalent d un doigt.',
    hint: 'Virements',
    graine: 'palier-ecran-virements',
    alt: 'Ecran de telephone affichant la liste des virements programmes du mois',
  },
] as const

/** Taux annuel brut du livret, en vigueur au 1er janvier 2026. */
const TAUX_LIVRET = 0.032

/** Prelevement forfaitaire unique sur les interets d un livret non reglemente. */
const FISCALITE = 0.3

/** Un montant francais, avec son signe. */
function montant(valeur: number): string {
  const texte = Math.abs(valeur).toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${valeur < 0 ? '−' : '+'} ${texte} €`
}

/** Un montant arrondi a l euro. */
function euros(valeur: number): string {
  return `${Math.round(valeur).toLocaleString('fr-FR')} €`
}

/** Le telephone dans lequel les captures s inscrivent. */
function Telephone({
  graine,
  alt,
}: {
  readonly graine: string
  readonly alt: string
}): ReactElement {
  return (
    <div className="o-mx-auto o-w-full o-max-w-xs o-overflow-hidden o-rounded-3xl o-border-w-4 o-border-zinc-900 dark:o-border-zinc-700 o-bg-zinc-900 o-shadow-2xl">
      <img
        src={photo(graine, 720, 1480)}
        alt={alt}
        width={720}
        height={1480}
        loading="lazy"
        className="o-block o-w-full o-h-auto o-object-cover"
      />
    </div>
  )
}

/** Un intitule de section : l indice en mono, le titre en grande graisse legere. */
function Titre({
  rang,
  surtitre,
  children,
  texte,
}: {
  readonly rang: string
  readonly surtitre: string
  readonly children: ReactNode
  readonly texte?: string
}): ReactElement {
  return (
    <div className="o-max-w-3xl">
      <Indice rang={rang} sombre={false}>
        {surtitre}
      </Indice>
      <h2
        className="o-m-0 o-mt-5 o-text-zinc-950 dark:o-text-zinc-50"
        style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.5vw, 4.25rem)' }}
      >
        {children}
      </h2>
      {texte !== undefined && (
        <p className="o-mt-5 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          {texte}
        </p>
      )}
    </div>
  )
}

/**
 * Le panneau du compte : ce que la banque montre avant de se raconter.
 *
 * Un releve, pas une carte de presentation — bordures marquees, valeurs en
 * chasse fixe alignees a droite, aucune ombre. Trois mois sont consultables :
 * c est la seule facon de montrer qu un compte a une histoire.
 */
/** Un montant ecrit « 4 812,60 € », lu en nombre. */
function nombre(texte: string): number {
  return Number(texte.replace(/[^\d,-]/g, '').replace(',', '.'))
}

/** Les centimes d un montant ecrit, sur deux chiffres. */
function centimes(texte: string): string {
  const part = texte.split(',')[1] ?? '00'
  return part.replace(/[^\d]/g, '').padEnd(2, '0').slice(0, 2)
}

function Panneau(): ReactElement {
  const [mois, setMois] = useState<string>('septembre')
  const releve = RELEVES.find((r) => r.cle === mois) ?? RELEVES[2]
  const serie = SERIE_MISE_DE_COTE.slice(releve.fin - 12, releve.fin)
  const maximum = Math.max(...serie.map(([, valeur]) => valeur))

  return (
    <section
      aria-label="Un compte Palier, montre en exemple"
      className="o-overflow-hidden o-rounded-xl o-border-w-1 o-border-zinc-300 o-bg-white dark:o-border-zinc-700 dark:o-bg-zinc-900"
    >
      {/* --- Le choix du releve ----------------------------------------- */}
      <div
        role="group"
        aria-label="Choisir le mois du releve"
        className="o-flex o-flex-wrap o-items-center o-gap-2 o-border-b o-border-zinc-300 o-px-5 o-py-3 dark:o-border-zinc-700"
      >
        <span className="o-mr-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
          Releve
        </span>
        {RELEVES.map((r) => {
          const actif = r.cle === mois
          return (
            <button
              key={r.cle}
              type="button"
              aria-pressed={actif}
              onClick={() => {
                setMois(r.cle)
              }}
              className="o-rounded-md o-border-w-1 o-px-3 o-py-1 o-font-mono o-text-xs o-font-semibold o-cursor-pointer o-transition-colors focus:o-ring"
              style={
                actif
                  ? { ...APLAT, borderColor: encre() }
                  : { borderColor: FILET, color: 'inherit' }
              }
            >
              {r.court}
              <span className="o-sr-only"> 2026</span>
            </button>
          )
        })}
      </div>

      {/* --- Solde et mise de cote ------------------------------------- */}
      <div className="o-grid o-gap-px o-bg-zinc-300 dark:o-bg-zinc-700 sm:o-grid-cols-2">
        <div className="o-bg-white o-p-5 dark:o-bg-zinc-900">
          <p className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
            Compte courant — FR76 •••• 2208 — {releve.libelle}
          </p>
          <p className="o-mt-2 o-font-mono o-text-3xl o-font-bold o-tabular-nums o-tracking-tight o-text-zinc-900 dark:o-text-zinc-50 md:o-text-4xl">
            <span className="o-sr-only">{releve.solde}</span>
            <span aria-hidden="true">
              <CounterRoll value={Math.trunc(nombre(releve.solde))} locale="fr-FR" />
              <span className="o-text-xl md:o-text-2xl">,{centimes(releve.solde)} €</span>
            </span>
          </p>
          <p
            className="o-mt-2 o-inline-flex o-items-center o-gap-1.5 o-font-mono o-text-xs o-tabular-nums"
            style={{ color: releve.hausse ? encre() : 'inherit' }}
          >
            {releve.hausse ? (
              <Icon icon={ArrowUpRight} size={13} aria-hidden="true" />
            ) : null}
            {releve.variation}
          </p>
        </div>

        <div className="o-bg-white o-p-5 dark:o-bg-zinc-900">
          <p className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
            Mise de cote — douze mois glissants
          </p>
          <div
            className="o-mt-3 o-flex o-h-16 o-items-end o-gap-1"
            role="img"
            aria-label={`Mise de cote mensuelle des douze mois precedant ${releve.libelle}, de 90 a 420 euros`}
          >
            {serie.map(([nom, valeur], index) => (
              <span
                key={`${nom}-${String(index)}`}
                className="o-w-full"
                style={{
                  height: `${String(Math.round((valeur / maximum) * 100))}%`,
                  backgroundColor: encre(64),
                }}
              />
            ))}
          </div>
          <p className="o-mt-2 o-flex o-justify-between o-font-mono o-text-xs o-tabular-nums o-text-zinc-600 dark:o-text-zinc-400">
            <span>{releve.misDeCote} mis de cote</span>
            <span>livret a 3,2 %</span>
          </p>
        </div>
      </div>

      {/* --- Operations du mois consulte -------------------------------- */}
      <div className="o-border-t o-border-zinc-300 dark:o-border-zinc-700">
        <table className="o-w-full o-text-left o-text-sm">
          <caption className="o-border-b o-border-zinc-200 o-px-5 o-py-3 o-text-left o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-border-zinc-800 dark:o-text-zinc-400">
            Operations — {releve.libelle}
          </caption>
          <thead className="o-sr-only">
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Libelle</th>
              <th scope="col">Categorie</th>
              <th scope="col">Montant</th>
            </tr>
          </thead>
          <tbody>
            {releve.operations.map((operation) => (
              <tr
                key={operation.libelle}
                className="o-border-b o-border-zinc-200 dark:o-border-zinc-800"
              >
                <td className="o-py-2.5 o-pl-5 o-pr-3 o-font-mono o-text-xs o-tabular-nums o-text-zinc-600 dark:o-text-zinc-400">
                  {operation.jour}
                </td>
                <th
                  scope="row"
                  className="o-py-2.5 o-pr-3 o-font-normal o-text-zinc-900 dark:o-text-zinc-100"
                >
                  {operation.libelle}
                </th>
                <td className="max-sm:o-hidden o-py-2.5 o-pr-3 o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-600 dark:o-text-zinc-400">
                  {operation.categorie}
                </td>
                <td
                  className={[
                    'o-py-2.5 o-pr-5 o-text-right o-font-mono o-tabular-nums o-whitespace-nowrap',
                    operation.montant > 0
                      ? 'o-font-semibold'
                      : 'o-text-zinc-900 dark:o-text-zinc-100',
                  ].join(' ')}
                  style={operation.montant > 0 ? { color: encre() } : undefined}
                >
                  {montant(operation.montant)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- La carte, et les signaux de la maison ---------------------- */}
      <div className="o-grid o-gap-px o-border-t o-border-zinc-300 o-bg-zinc-300 dark:o-border-zinc-700 dark:o-bg-zinc-700 sm:o-grid-cols-2">
        <div className="o-bg-white o-p-5 dark:o-bg-zinc-900">
          <p className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
            Carte
          </p>
          <div
            className="o-mt-3 o-rounded-lg o-p-4 o-text-zinc-50 dark:o-text-zinc-50"
            style={{ backgroundColor: 'var(--o-palette-zinc-900)' }}
          >
            <div className="o-flex o-items-center o-justify-between">
              <span
                className="o-text-xs o-font-semibold o-uppercase o-tracking-widest"
                style={{ color: encreSurSombre() }}
              >
                Palier
              </span>
              <Icon icon={CreditCard} size={16} aria-hidden="true" />
            </div>
            <p className="o-mt-6 o-font-mono o-text-sm o-tracking-wide">
              4179 •••• •••• 2208
            </p>
            <p className="o-mt-1 o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-400">
              C. MARCHAND — 09/31
            </p>
          </div>
          <p
            className="o-mt-3 o-inline-flex o-items-center o-gap-1.5 o-font-mono o-text-xs"
            style={{ color: encre() }}
          >
            <Icon icon={Check} size={13} aria-hidden="true" />
            Active — change au taux du jour
          </p>
        </div>

        <div className="o-bg-white o-p-5 dark:o-bg-zinc-900">
          <p className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
            La maison, en quatre chiffres
          </p>
          <dl className="o-mt-3 o-grid o-grid-cols-2 o-gap-4">
            {SIGNAUX.map((signal) => (
              <div key={signal.libelle}>
                <dt className="o-sr-only">{signal.libelle}</dt>
                <dd className="o-font-mono o-text-xl o-font-bold o-tabular-nums o-tracking-tight o-text-zinc-900 dark:o-text-zinc-50">
                  <CountUp
                    value={signal.valeur}
                    decimals={signal.decimales}
                    suffix={signal.suffixe}
                    locale="fr-FR"
                  />
                </dd>
                <p className="o-mt-1 o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
                  {signal.libelle}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

/**
 * Le simulateur du livret.
 *
 * Interets composes mensuellement au taux annuel du livret, versement initial
 * et versement mensuel regles au curseur. Le resultat affiche aussi ce que la
 * fiscalite retire : un rendement annonce brut n a jamais ete ce qu on touche.
 */
function Simulateur(): ReactElement {
  const [initial, setInitial] = useState(2000)
  const [mensuel, setMensuel] = useState(150)
  const [annees, setAnnees] = useState(5)

  const mois = annees * 12
  const taux = TAUX_LIVRET / 12
  const capital =
    initial * Math.pow(1 + taux, mois) + mensuel * ((Math.pow(1 + taux, mois) - 1) / taux)
  const verse = initial + mensuel * mois
  const interets = capital - verse
  const net = verse + interets * (1 - FISCALITE)

  return (
    <div className="o-grid o-gap-10 lg:o-grid-cols-2">
      <form
        className="o-space-y-6"
        aria-label="Simulateur d epargne"
        onSubmit={(event) => {
          event.preventDefault()
        }}
      >
        <Slider
          label="Versement de depart"
          min={0}
          max={20000}
          step={500}
          value={initial}
          showValue
          formatValue={(v) => `${v.toLocaleString('fr-FR')} €`}
          onChange={(event) => {
            setInitial(Number(event.currentTarget.value))
          }}
          hint="Le premier virement vers le livret, le jour de l ouverture."
        />

        <Slider
          label="Versement mensuel"
          min={0}
          max={800}
          step={25}
          value={mensuel}
          showValue
          formatValue={(v) => `${v.toLocaleString('fr-FR')} €`}
          onChange={(event) => {
            setMensuel(Number(event.currentTarget.value))
          }}
          hint="Preleve le 5 de chaque mois, modifiable ou suspendable a tout moment."
        />

        <fieldset className="o-border-t o-p-0 o-pt-5" style={{ borderColor: FILET }}>
          <legend className="o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-100">
            Duree du placement
          </legend>
          <div className="o-mt-3 o-flex o-flex-wrap o-gap-2">
            {[3, 5, 10, 15].map((n) => {
              const actif = n === annees
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => {
                    setAnnees(n)
                  }}
                  className="o-rounded-lg o-border-w-1 o-px-4 o-py-2 o-text-sm o-font-semibold o-tabular-nums o-cursor-pointer o-transition-colors focus:o-ring"
                  style={
                    actif
                      ? { ...APLAT, borderColor: encre() }
                      : { borderColor: FILET, color: 'inherit' }
                  }
                >
                  {n} ans
                </button>
              )
            })}
          </div>
        </fieldset>
      </form>

      <div
        className="o-rounded-xl o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-p-6 md:o-p-8"
        style={{ backgroundColor: accentDoux(400, 10) }}
      >
        <p className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
          Au bout de {annees} ans, au taux du jour
        </p>
        <p
          className="o-mt-2 o-font-mono o-text-4xl o-font-bold o-tabular-nums o-tracking-tight md:o-text-5xl"
          style={{ color: encre() }}
        >
          {euros(capital)}
        </p>

        <dl className="o-mt-8 o-space-y-3 o-text-sm">
          {[
            ['Vous aurez verse', euros(verse)],
            ['Interets bruts', euros(interets)],
            ['Apres prelevement forfaitaire unique de 30 %', euros(net)],
          ].map(([terme, valeur]) => (
            <div
              key={terme}
              className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3 o-border-b o-pb-3"
              style={{ borderColor: FILET }}
            >
              <dt className="o-text-zinc-700 dark:o-text-zinc-300">{terme}</dt>
              <dd className="o-font-mono o-font-semibold o-tabular-nums o-text-zinc-900 dark:o-text-zinc-50">
                {valeur}
              </dd>
            </div>
          ))}
        </dl>

        <p className="o-mt-6 o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          Taux annuel brut de 3,2 %, en vigueur au 1er janvier 2026, revise chaque
          trimestre : une simulation n est pas un engagement. Les interets sont calcules
          par quinzaine et verses le 31 decembre. Le Livret Palier n est pas un livret
          reglemente ; ses interets supportent le prelevement forfaitaire unique de 30 %,
          sauf option pour le bareme.
        </p>
      </div>
    </div>
  )
}

/** L ouverture de compte : le profil choisi reecrit les pieces et le delai. */
function Ouverture(): ReactElement {
  const [profil, setProfil] = useState<string>('particulier')
  const choisi = PROFILS.find((p) => p.cle === profil) ?? PROFILS[0]

  return (
    <div className="o-rounded-xl o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-bg-white dark:o-bg-zinc-950 o-p-6 md:o-p-8">
      <h3 className="o-text-xl o-font-bold o-tracking-tight o-text-zinc-900 dark:o-text-zinc-50">
        Commencer maintenant
      </h3>
      <p className="o-mt-2 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
        Nous envoyons un lien de telechargement et rien d autre.
      </p>

      <fieldset className="o-mt-6 o-p-0">
        <legend className="o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-100">
          Vous ouvrez un compte
        </legend>
        <div
          role="group"
          aria-label="Profil du titulaire"
          className="o-mt-3 o-flex o-flex-wrap o-gap-2"
        >
          {PROFILS.map((p) => {
            const actif = p.cle === profil
            return (
              <button
                key={p.cle}
                type="button"
                aria-pressed={actif}
                onClick={() => {
                  setProfil(p.cle)
                }}
                className="o-rounded-lg o-border-w-1 o-px-4 o-py-2 o-text-sm o-font-semibold o-cursor-pointer o-transition-colors focus:o-ring"
                style={
                  actif
                    ? { ...APLAT, borderColor: encre() }
                    : { borderColor: FILET, color: 'inherit' }
                }
              >
                {p.libelle}
              </button>
            )
          })}
        </div>
      </fieldset>

      <dl className="o-mt-6 o-grid o-gap-4 sm:o-grid-cols-3">
        {[
          { icone: IdCard, terme: 'Offre', valeur: choisi.offre },
          { icone: ScrollText, terme: 'Delai', valeur: choisi.delai },
          { icone: BadgeEuro, terme: 'Versement', valeur: choisi.versement },
        ].map((fait) => (
          <div
            key={fait.terme}
            className="o-rounded-lg o-p-3"
            style={{ backgroundColor: accentDoux(400, 12) }}
          >
            <dt className="o-flex o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
              <Icon icon={fait.icone} size={14} aria-hidden="true" />
              {fait.terme}
            </dt>
            <dd className="o-mt-1 o-text-sm o-font-semibold o-text-zinc-900 dark:o-text-zinc-50">
              {fait.valeur}
            </dd>
          </div>
        ))}
      </dl>

      <h4 className="o-mt-6 o-text-sm o-font-semibold o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
        Pieces demandees
      </h4>
      <ul className="o-mt-3 o-list-none o-space-y-2 o-p-0 o-text-sm o-text-zinc-700 dark:o-text-zinc-300">
        {choisi.pieces.map((piece) => (
          <li key={piece} className="o-flex o-gap-2">
            <Icon
              icon={Check}
              size={15}
              className="o-mt-1 o-shrink-0"
              style={{ color: encre() }}
              aria-hidden="true"
            />
            {piece}
          </li>
        ))}
      </ul>
      <p className="o-mt-3 o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
        {choisi.note}
      </p>

      <form
        className="o-mt-8 o-space-y-4 o-border-t o-pt-6"
        style={{ borderColor: FILET }}
        onSubmit={(event) => {
          event.preventDefault()
        }}
      >
        <Input
          label="Prenom et nom"
          name="nom"
          autoComplete="name"
          placeholder="Camille Marchand"
        />
        <Input
          label="Adresse electronique"
          name="courriel"
          type="email"
          autoComplete="email"
          placeholder="camille@exemple.fr"
          hint="Utilisee uniquement pour l ouverture du compte."
        />
        <Input
          label="Telephone mobile"
          name="telephone"
          type="tel"
          autoComplete="tel"
          placeholder="06 12 34 56 78"
        />
        {/* Un bouton maison plutot que celui de la librairie : celui-ci porte
            l accent de la vitrine, qui suit la palette choisie en haut de
            page. */}
        <button
          type="submit"
          className="o-w-full o-rounded-lg o-px-5 o-py-3 o-text-sm o-font-semibold o-cursor-pointer o-transition-colors focus:o-ring"
          style={APLAT}
        >
          Recevoir le lien
        </button>
      </form>

      <ul
        className="o-mt-6 o-list-none o-space-y-2 o-border-t o-p-0 o-pt-6 o-text-sm o-text-zinc-600 dark:o-text-zinc-400"
        style={{ borderColor: FILET }}
      >
        {[
          'Sans engagement, cloture en un clic',
          'IBAN francais commencant par FR76',
          'Portabilite du compte prise en charge, mandat de mobilite compris',
        ].map((l) => (
          <li key={l} className="o-flex o-items-center o-gap-2">
            <Icon
              icon={Check}
              size={15}
              className="o-shrink-0"
              style={{ color: encre() }}
              aria-hidden="true"
            />
            {l}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** La vitrine. */
/** La carte, en metal, qui s incline sous le pointeur. */
function Carte(): ReactElement {
  return (
    <TiltCard tilt={10} glare={0.28} className="o-w-full o-max-w-md">
      <div
        className="o-relative o-aspect-video o-overflow-hidden o-rounded-2xl o-border-w-1 o-border-white-20 o-p-6 o-text-zinc-50 o-shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${accentDoux(300, 55)} 0%, var(--o-palette-zinc-900) 55%, ${accentDoux(700, 40)} 100%)`,
        }}
      >
        <div
          aria-hidden="true"
          className="o-absolute o-inset-0"
          style={{
            background:
              'linear-gradient(115deg, transparent 30%, color-mix(in oklab, white 18%, transparent) 45%, transparent 60%)',
          }}
        />
        <div className="o-relative o-flex o-h-full o-flex-col o-justify-between">
          <div className="o-flex o-items-start o-justify-between">
            <span className="o-text-lg o-font-semibold o-tracking-tight">Palier</span>
            <span
              aria-hidden="true"
              className="o-h-7 o-w-9 o-rounded-md o-border-w-1 o-border-white-20"
              style={{ background: 'linear-gradient(135deg, #e7d7a0, #b8973f)' }}
            />
          </div>
          <div>
            <p className="o-m-0 o-font-mono o-text-base o-tracking-widest md:o-text-lg">
              4179 •••• •••• 2208
            </p>
            <div className="o-mt-3 o-flex o-items-end o-justify-between o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-300">
              <span>C. Marchand</span>
              <span>09 / 31</span>
            </div>
          </div>
        </div>
      </div>
    </TiltCard>
  )
}

/** Un champ du pied : une ligne soulignee, l etiquette dans le champ. */
function Champ({
  nom,
  type = 'text',
  large = false,
}: {
  readonly nom: string
  readonly type?: string
  readonly large?: boolean
}): ReactElement {
  return (
    <label className={`o-block ${large ? 'md:o-col-span-2' : ''}`}>
      <span className="o-sr-only">{nom}</span>
      <input
        type={type}
        placeholder={nom}
        className="o-w-full o-border-b o-border-white-20 o-bg-transparent o-py-3 o-text-base o-text-zinc-50 focus:o-ring"
        style={{ borderRadius: 0 }}
      />
    </label>
  )
}

export default function Page(): ReactElement {
  const polices = usePolices('inter')
  return (
    <Porte forme="compteur" marque="Palier">
      <div
        className="o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50"
        style={polices}
      >
        {/* ================= L affiche : une mer de nuit, la carte qui se dresse ===== */}
        <ZoomDefile
          de={1.1}
          assombrir={0.55}
          glisse={0.6}
          className="o-text-zinc-50"
          style={{ ...nuit('zinc'), minHeight: '100vh' }}
          fond={
            <div className="o-absolute o-inset-0">
              <Aurora
                className="o-absolute o-inset-0"
                colors={['--o-vitrine-800', '--o-vitrine-400', '--o-palette-zinc-950']}
                speed={0.08}
                scale={1.6}
                fallback="o-bg-gradient-to-b o-from-zinc-950 o-to-zinc-900"
              />
              <div
                aria-hidden="true"
                className="o-absolute o-inset-0"
                style={{
                  background:
                    'linear-gradient(to bottom, color-mix(in oklab, var(--o-palette-zinc-950) 70%, transparent), transparent 35%, color-mix(in oklab, var(--o-palette-zinc-950) 60%, transparent) 80%, var(--o-palette-zinc-950))',
                }}
              />
              <Grain opacite={0.07} />
            </div>
          }
        >
          <BarreFilet
            marque="Palier"
            liens={NAVIGATION}
            action={['#ouverture', 'Espace client']}
          />
          <div
            id="haut"
            className="o-relative o-mx-auto o-grid o-max-w-7xl o-items-center o-gap-12 o-px-6 o-pb-24 o-pt-16 lg:o-grid-cols-12"
            style={{ minHeight: 'calc(100vh - 81px)' }}
          >
            <div className="lg:o-col-span-7">
              <Surgit>
                <Etiquette>Etablissement de credit — ACPR 18422</Etiquette>
              </Surgit>
              <TitreVague
                delai={120}
                className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-50"
                style={{
                  ...affiche('l', 300),
                  fontSize: 'clamp(2.75rem, 7.5vw, 7.5rem)',
                }}
              >
                Une banque qui compte a voix haute.
              </TitreVague>
              <Surgit
                delai={520}
                as="p"
                className="o-m-0 o-mt-8 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300"
              >
                Compte courant, carte metal, virements instantanes, livret a 3,2 %. Ce que
                Palier vous fait gagner est ecrit sur cette page — le releve d abord, la
                grille tarifaire entiere ensuite.
              </Surgit>
              <Surgit delai={640} className="o-mt-10">
                <Actions
                  pleine={[
                    '#ouverture',
                    <>
                      Ouvrir un compte en 4 minutes{' '}
                      <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#compte', 'Voir un releve']}
                />
              </Surgit>
            </div>
            <Surgit
              delai={400}
              className="o-flex o-justify-center lg:o-col-span-5 lg:o-justify-end"
            >
              <Flotte amplitude={8} duree={7} angle={-4}>
                <Carte />
              </Flotte>
            </Surgit>
          </div>
          <Coin position="bg">
            Depots couverts jusqu a 100 000 €<br />
            Fonds de garantie des depots
          </Coin>
          <Coin position="bd">
            Nantes — quai de la Fosse
            <br />
            Ouvert depuis 2019
          </Coin>
        </ZoomDefile>

        <main>
          {/* ================= (01) Le releve : la banque montre avant de se raconter ===== */}
          <section id="compte" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-py-32">
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-8">
                  <Titre
                    rang="01"
                    surtitre="Le releve"
                    texte="Trois mois consultables, chacun avec son solde, ses operations et sa mise de cote. Un compte a une histoire ; la voici."
                  >
                    Voici un compte. Pas une promesse.
                  </Titre>
                </div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-4 md:o-text-right">
                  Compte de demonstration
                  <br />
                  Montants et operations fictifs
                </p>
              </div>
              <Reveal className="o-mt-12">
                <Panneau />
              </Reveal>
            </div>
          </section>

          {/* ================= Les quatre chiffres, sur filets =============== */}
          <section
            aria-label="Palier en quatre chiffres"
            className="o-px-6 o-pb-24 md:o-pb-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <Chiffres
                sombre={false}
                nombres={[
                  { valeur: '0 €', quoi: 'de frais de tenue de compte' },
                  { valeur: '3,2 %', quoi: 'sur le livret, chaque mois' },
                  { valeur: '8 s', quoi: 'pour un virement instantane' },
                  { valeur: '412 000', quoi: 'comptes ouverts depuis 2019' },
                ]}
              />
            </div>
          </section>

          {/* ================= (02) L epargne : le simulateur, en chapitre ===== */}
          <div
            id="epargne"
            className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-px-6 o-py-24 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <Chapitre
                indice="(02) — Epargne"
                titre={
                  <h2
                    className="o-m-0 o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(2rem, 4vw, 3.75rem)',
                    }}
                  >
                    Ce que trois euros par jour deviennent.
                  </h2>
                }
                texte="Le Livret Palier capitalise chaque mois. Reglez le versement et la duree : le calcul se refait devant vous, brut, puis net d impot."
              >
                <Simulateur />
              </Chapitre>
            </div>
          </div>

          {/* ================= (03) Le telephone ============================= */}
          <section id="application" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-py-32">
            <div className="o-mx-auto o-max-w-7xl">
              <Titre
                rang="03"
                surtitre="L application"
                texte="Trois ecrans, et rien d autre : Palier n a pas de tableau de bord a apprendre."
              >
                Le compte tient dans la main.
              </Titre>
              <FeatureTabs
                className="o-mt-14"
                label="Les ecrans de l application Palier"
                features={ECRANS.map((e) => ({
                  title: e.title,
                  body: e.body,
                  hint: e.hint,
                }))}
                render={(index) => {
                  const ecran = ECRANS[index] ?? ECRANS[0]
                  return <Telephone graine={ecran.graine} alt={ecran.alt} />
                }}
              />
              <p className="o-mt-10 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                <Icon icon={Smartphone} size={14} aria-hidden="true" />
                iOS 16 et Android 11 — note moyenne 4,7 sur 38 200 avis
              </p>
            </div>
          </section>

          {/* ================= (04) La securite : un manifeste, puis quatre garanties numerotees ===== */}
          <section
            id="securite"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-py-36"
            style={{ ...nuit('zinc'), ...NUIT }}
          >
            <div className="o-mx-auto o-max-w-7xl">
              <Indice rang="04">Securite</Indice>
              <div className="o-mt-8">
                <Manifeste eteint="Palier n est pas un intermediaire qui tient vos depots chez un autre.">
                  Palier est un etablissement de credit : l argent reste ou vous l avez
                  laisse, a votre nom, dans nos livres.
                </Manifeste>
              </div>
              <div className="o-mt-20">
                <Numerotee
                  lignes={GARANTIES.map((g) => ({ titre: g.titre, texte: g.texte }))}
                />
              </div>
              <div className="o-mt-16 o-grid o-gap-10 md:o-grid-cols-12">
                <dl className="o-m-0 md:o-col-span-7">
                  {GARANTIE_DEPOTS.map(([terme, valeur]) => (
                    <div
                      key={terme}
                      className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-6 o-gap-y-1 o-border-b o-border-white-10 o-py-3"
                    >
                      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                        {terme}
                      </dt>
                      <dd className="o-m-0 o-text-right o-text-sm o-text-zinc-100">
                        {valeur}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className="md:o-col-span-5">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    Ce que la garantie ne couvre pas
                  </p>
                  <ul className="o-m-0 o-mt-4 o-list-none o-space-y-3 o-p-0 o-text-sm o-leading-relaxed o-text-zinc-300">
                    {HORS_GARANTIE.map((l) => (
                      <li key={l} className="o-border-l o-border-white-20 o-pl-4">
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ================= (05) Tarifs : trois offres, puis la grille en chapitre ===== */}
          <section id="tarifs" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-py-32">
            <div className="o-mx-auto o-max-w-7xl">
              <Titre
                rang="05"
                surtitre="Tarifs"
                texte="Un prix par profil, sans palier cache ni frais de dossier. L annuel retire deux mois."
              >
                Trois offres, et rien en bas de page.
              </Titre>
              <PricingTiers
                className="o-mt-14"
                tiers={OFFRES}
                suffix=" €"
                yearlyDiscount={0.17}
                locale="fr-FR"
              />
            </div>
          </section>

          <div className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-py-32">
            <div className="o-mx-auto o-max-w-7xl">
              <Chapitre
                indice="(06) — La grille, entiere"
                largeur={3}
                titre={
                  <h2
                    className="o-m-0 o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.75rem, 3vw, 3rem)',
                    }}
                  >
                    Y compris ce qui fait mal.
                  </h2>
                }
                texte="Ce qui separe un forfait a zero euro d un forfait a neuf, ce sont les frais qu on ne choisit pas : le change, le retrait hors zone euro, le decouvert."
              >
                <div
                  className="o-relative o-overflow-x-auto o-border-t o-border-black-10 dark:o-border-zinc-800"
                  style={{ contain: 'paint' }}
                >
                  <table className="o-w-full o-min-w-full o-text-left o-text-sm">
                    <caption className="o-sr-only">
                      Grille tarifaire comparee des trois offres Palier, applicable au 1er
                      janvier 2026
                    </caption>
                    <thead>
                      <tr className="o-border-b o-border-black-10 dark:o-border-zinc-800">
                        {['Prestation', 'Essentiel', 'Courant', 'Societe'].map(
                          (entete, index) => (
                            <th
                              key={entete}
                              scope="col"
                              className={[
                                'o-px-3 o-py-3 o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400',
                                index > 0 ? 'o-text-right' : '',
                              ].join(' ')}
                            >
                              {entete}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    {GRILLE.map((bloc) => (
                      <tbody key={bloc.groupe}>
                        <tr>
                          <th
                            scope="colgroup"
                            colSpan={4}
                            className="o-px-3 o-pb-2 o-pt-8 o-text-left o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest"
                            style={{ color: encre() }}
                          >
                            {bloc.groupe}
                          </th>
                        </tr>
                        {bloc.lignes.map((ligne) => (
                          <tr
                            key={ligne[0]}
                            className="o-border-b o-border-black-10 dark:o-border-zinc-800"
                          >
                            <th
                              scope="row"
                              className="o-px-3 o-py-3 o-font-normal o-text-zinc-900 dark:o-text-zinc-100"
                            >
                              {ligne[0]}
                            </th>
                            {ligne.slice(1).map((valeur, index) => (
                              <td
                                key={`${ligne[0]}-${String(index)}`}
                                className="o-px-3 o-py-3 o-text-right o-font-mono o-text-xs o-tabular-nums o-text-zinc-700 dark:o-text-zinc-300"
                              >
                                {valeur}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    ))}
                  </table>
                </div>
                <p className="o-mt-6 o-max-w-2xl o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                  Tarifs en euros, toutes taxes comprises, applicables au 1er janvier
                  2026. La commission d intervention et les frais de rejet sont plafonnes
                  par la loi ; nous appliquons le plafond, jamais au-dela. Le decouvert
                  est un credit : il coute et engage l emprunteur.
                </p>
              </Chapitre>
            </div>
          </div>

          {/* ================= (07) L ouverture : le mecanisme sert d appel ===== */}
          <section
            id="ouverture"
            className="o-scroll-mt-24 o-bg-zinc-50 dark:o-bg-zinc-900 o-px-6 o-py-24 md:o-py-32"
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 lg:o-grid-cols-12">
              <div className="lg:o-col-span-5">
                <Titre
                  rang="07"
                  surtitre="Ouverture"
                  texte="Aucun rendez-vous, aucune impression, aucun envoi postal. Les pieces demandees dependent de qui ouvre le compte : choisissez votre profil, la liste se refait."
                >
                  Quatre minutes, telephone en main.
                </Titre>
                <ol className="o-mt-12 o-list-none o-border-t o-border-black-10 dark:o-border-zinc-800 o-p-0">
                  {[
                    [
                      '01',
                      'Vos coordonnees',
                      'Nom, date de naissance, adresse. Une minute, depuis le telephone.',
                    ],
                    [
                      '02',
                      'Les pieces, photographiees',
                      'Verifiees en deux minutes pour un particulier, sous trois jours ouvres pour une societe.',
                    ],
                    [
                      '03',
                      'Le premier versement',
                      'De dix a deux cent cinquante euros selon le profil. L IBAN est disponible dans la foulee.',
                    ],
                  ].map(([numero, titre, texte]) => (
                    <li
                      key={numero}
                      className="o-grid o-grid-cols-12 o-gap-4 o-border-b o-border-black-10 dark:o-border-zinc-800 o-py-5"
                    >
                      <span
                        aria-hidden="true"
                        className="o-col-span-2 o-font-mono o-text-xs o-tabular-nums o-tracking-widest"
                        style={{ color: encre() }}
                      >
                        {numero}
                      </span>
                      <div className="o-col-span-10">
                        <h3 className="o-m-0 o-text-lg o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50">
                          {titre}
                        </h3>
                        <p className="o-m-0 o-mt-1 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
                          {texte}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="o-mt-8 o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                  L ouverture peut etre refusee sans motif, comme la loi l autorise. Toute
                  personne a qui trois etablissements ont refuse un compte peut saisir la
                  Banque de France au titre du droit au compte : nous fournissons l
                  attestation le jour meme.
                </p>
              </div>
              <div className="lg:o-col-span-7">
                <Ouverture />
              </div>
            </div>
          </section>
        </main>

        {/* ================= Le pied : noir, avec le contact integre ============ */}
        <footer
          className="o-px-6 o-pb-10 o-pt-24 o-text-zinc-50"
          style={{ ...nuit('zinc'), ...NUIT }}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <div className="o-grid o-gap-16 lg:o-grid-cols-12">
              <div className="lg:o-col-span-6">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  Une question avant d ouvrir ?
                </p>
                <p
                  className="o-m-0 o-mt-5 o-max-w-lg o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.4vw, 3.25rem)',
                  }}
                >
                  Un conseiller repond dans l heure, de 8 h a 20 h.
                </p>
                <form
                  className="o-mt-10 o-grid o-gap-x-8 o-gap-y-2 md:o-grid-cols-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                  }}
                >
                  <Champ nom="Votre nom" />
                  <Champ nom="Votre courriel" type="email" />
                  <Champ nom="Votre question" large />
                  <div className="o-mt-6 md:o-col-span-2">
                    <button
                      type="submit"
                      className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-transition-transform hover:o-scale-105 focus:o-ring"
                      style={{
                        backgroundColor: encreSurSombre(),
                        color: 'var(--o-palette-zinc-950)',
                      }}
                    >
                      Envoyer <Icon icon={ArrowUpRight} size={16} aria-hidden="true" />
                    </button>
                  </div>
                </form>
              </div>
              <div className="o-grid o-gap-10 sm:o-grid-cols-3 lg:o-col-span-6">
                {[
                  {
                    titre: 'Produits',
                    liens: [
                      'Compte courant',
                      'Carte metal',
                      'Livret Palier',
                      'Compte professionnel',
                    ],
                  },
                  {
                    titre: 'La banque',
                    liens: [
                      'Qui nous sommes',
                      'Recrutement',
                      'Presse',
                      'Rapport annuel 2025',
                    ],
                  },
                  {
                    titre: 'Aide',
                    liens: [
                      'Centre d aide',
                      'Brochure tarifaire',
                      'Reclamations',
                      'Mediateur',
                    ],
                  },
                ].map((colonne) => (
                  <nav key={colonne.titre} aria-label={colonne.titre}>
                    <h2 className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                      {colonne.titre}
                    </h2>
                    <ul className="o-m-0 o-mt-4 o-list-none o-space-y-2 o-p-0">
                      {colonne.liens.map((l) => (
                        <li key={l}>
                          <a
                            href="#haut"
                            className="o-text-sm o-no-underline o-text-zinc-300 o-transition-colors hover:o-text-zinc-50 focus:o-ring"
                          >
                            {l}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                ))}
              </div>
            </div>
            <div className="o-mt-20 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-white-10 o-pt-6 o-font-mono o-text-xs o-text-zinc-400">
              <p className="o-m-0 o-flex o-items-center o-gap-2">
                <Icon icon={Landmark} size={14} aria-hidden="true" />© 2026 Palier SA —
                RCS Nantes 842 119 007 — capital 32 000 000 €
              </p>
              <ul className="o-m-0 o-flex o-list-none o-flex-wrap o-gap-4 o-p-0">
                {[
                  'Mentions legales',
                  'Donnees personnelles',
                  'Cookies',
                  'Accessibilite',
                ].map((l) => (
                  <li key={l}>
                    <a
                      href="#haut"
                      className="o-no-underline o-text-zinc-400 hover:o-text-zinc-50 focus:o-ring"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
